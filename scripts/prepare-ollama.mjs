
import { createHash } from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import {
  copyFile, lstat, mkdir, readFile, readdir,
  realpath, rename, stat, unlink, writeFile
} from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import * as runtimeBundle from '../xmcl-runtime/agent/runtimeBundle.ts'

const validateOllamaBundle =
  runtimeBundle.validateOllamaBundle ??
  runtimeBundle.default?.validateOllamaBundle

if (typeof validateOllamaBundle !== 'function') {
  throw new Error('Ollama bundle validator unavailable')
}

const DOWNLOAD_HOSTS = new Set([
  'api.github.com',
  'github.com',
  'release-assets.githubusercontent.com',
  'objects.githubusercontent.com',
  'raw.githubusercontent.com',
])

const delay = ms => new Promise(r => setTimeout(r, ms))

export function runtimeAsset(version, platform, arch) {
  if (!/^v\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) {
    throw new Error('Supply an exact official release tag')
  }

  if (!['x64', 'arm64'].includes(arch)) {
    throw new Error('Unsupported architecture')
  }

  if (platform === 'win32' && arch === 'x64') {
    return 'ollama-windows-amd64.zip'
  }

  if (platform === 'linux') {
    return `ollama-linux-${arch === 'x64' ? 'amd64' : 'arm64'}.tar.zst`
  }

  if (platform === 'darwin') {
    return 'ollama-darwin.tgz'
  }

  throw new Error('No verified automatic archive recipe for this platform')
}

async function officialFetch(initialUrl, options = {}) {
  let url = initialUrl
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  let redirects = 0

  for (let attempt = 0; attempt < 5; attempt++) {
    const parsed = new URL(url)

    if (
      parsed.protocol !== 'https:' ||
      parsed.username ||
      parsed.password ||
      !DOWNLOAD_HOSTS.has(parsed.hostname)
    ) {
      throw new Error(`Unexpected download origin: ${parsed.hostname}`)
    }

    const headers = {
      'user-agent': 'PbtModLauncherX-runtime-preparer',
      'accept': options.binary
        ? 'application/octet-stream'
        : 'application/vnd.github+json',
    }

    if (parsed.hostname === 'api.github.com') {
      headers['x-github-api-version'] = '2022-11-28'
      if (token) headers.authorization = `Bearer ${token}`
    }

    let response

    try {
      response = await fetch(url, {
        redirect: 'manual',
        headers,
        signal: AbortSignal.timeout(30 * 60 * 1000),
      })
    } catch (error) {
      if (attempt < 4) {
        console.warn(`Network failure: ${parsed.hostname}; retrying`)
        await delay(2000 * (attempt + 1))
        continue
      }
      throw error
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      await response.body?.cancel()

      if (!location) throw new Error('Missing redirect location')
      if (++redirects > 12) throw new Error('Too many redirects')

      url = new URL(location, url).href
      attempt--
      continue
    }

    if (response.status === 429 || response.status >= 500) {
      await response.body?.cancel()

      if (attempt < 4) {
        console.warn(`HTTP ${response.status} from ${parsed.hostname}; retrying`)
        await delay(2000 * (attempt + 1))
        continue
      }
    }

    if (!response.ok) {
      await response.body?.cancel()

      const error = new Error(
        `Official download failed: HTTP ${response.status} (${parsed.hostname})`
      )
      error.status = response.status
      throw error
    }

    return response
  }

  throw new Error('Official download failed after retries')
}

async function fetchOllamaAsset(asset, directUrl) {
  try {
    console.log(`Downloading official Ollama asset: ${asset.name}`)
    return await officialFetch(directUrl, { binary: true })
  } catch (error) {
    if (![403, 404, 429].includes(error.status)) throw error

    if (!Number.isSafeInteger(asset.id) || asset.id <= 0) {
      throw new Error('Invalid official asset ID')
    }

    console.warn(
      `Direct download failed (HTTP ${error.status}); trying GitHub API`
    )

    const apiUrl =
      `https://api.github.com/repos/ollama/ollama/releases/assets/${asset.id}`

    const response = await officialFetch(apiUrl, { binary: true })

    const type = response.headers.get('content-type') || ''

    if (type.includes('json')) {
      await response.body?.cancel()
      throw new Error('GitHub returned JSON instead of the binary asset')
    }

    return response
  }
}

async function sha(path) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(path)) hash.update(chunk)
  return hash.digest('hex')
}

function run(command, args) {
  const result = spawnSync(command, args, {
    shell: false,
    encoding: 'utf8',
    windowsHide: true,
  })

  if (result.status !== 0 || result.error) {
    throw new Error(
      `Command failed (${command}): ${result.error?.message || result.stderr}`
    )
  }

  return result.stdout
}

export async function materializeLibraryLinks(root) {
  const base = await realpath(root)
  const links = []

  async function scan(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)

      if (entry.isSymbolicLink()) {
        const target = await realpath(path)
        const name = relative(base, target)

        if (
          isAbsolute(name) ||
          name === '..' ||
          name.startsWith('../') ||
          name.startsWith('..\\') ||
          !(await lstat(target)).isFile() ||
          !/\.(?:dylib|so(?:\.\d+)*)$/.test(entry.name)
        ) {
          throw new Error('Unsafe runtime library link')
        }

        links.push({ path, target })
      } else if (entry.isDirectory()) {
        await scan(path)
      }
    }
  }

  await scan(base)

  for (const { path, target } of links) {
    const temporary = `${path}.materializing-${process.pid}`

    await copyFile(target, temporary)
    await unlink(path)
    await rename(temporary, path)
  }
}

export async function prepare({
  version,
  platform,
  arch,
  archive: supplied,
  output,
  metadata: suppliedMetadata,
}) {
  const assetName = runtimeAsset(version, platform, arch)

  const release =
    `https://api.github.com/repos/ollama/ollama/releases/tags/${version}`

  const metadata = suppliedMetadata
    ? JSON.parse(await readFile(suppliedMetadata, 'utf8'))
    : await (await officialFetch(release)).json()

  if (
    metadata.tag_name !== version ||
    metadata.draft ||
    metadata.prerelease
  ) {
    throw new Error('Unexpected release/channel')
  }

  const asset = metadata.assets?.find(entry => entry.name === assetName)

  const url =
    `https://github.com/ollama/ollama/releases/download/${version}/${assetName}`

  if (
    !asset ||
    asset.browser_download_url !== url ||
    !/^sha256:[a-f0-9]{64}$/.test(asset.digest ?? '') ||
    !Number.isSafeInteger(asset.size) ||
    asset.size <= 0
  ) {
    throw new Error(
      'Official asset metadata lacks trusted SHA-256/size'
    )
  }

  const target = resolve(output)

  try {
    await lstat(target)
    throw new Error('Output already exists; use another staging path')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  const temporary = `${target}.preparing-${process.pid}`

  await mkdir(dirname(target), { recursive: true })
  await mkdir(temporary, { recursive: false })

  const archive = supplied
    ? resolve(supplied)
    : join(temporary, assetName)

  if (!supplied) {
    const response = await fetchOllamaAsset(asset, url)

    if (!response.body) {
      throw new Error('Asset download returned an empty response body')
    }

    await pipeline(
      Readable.fromWeb(response.body),
      createWriteStream(archive, { flags: 'wx', mode: 0o600 })
    )
  }

  const archiveStats = await stat(archive)
  const actualHash = await sha(archive)

  if (
    archiveStats.size !== asset.size ||
    actualHash !== asset.digest.slice(7)
  ) {
    throw new Error('Archive size/hash does not match official metadata')
  }

  console.log(`Verified SHA-256: ${actualHash}`)

  const extracted = join(temporary, 'bundle')
  await mkdir(extracted)

  if (platform === 'win32') {
    run('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-File',
      join(dirname(fileURLToPath(import.meta.url)), 'extract-ollama.ps1'),
      archive,
      extracted,
    ])
  } else {
    const compression = platform === 'darwin' ? [] : ['--zstd']

    const names = run('tar', [
      ...compression,
      '-tf',
      archive,
    ]).split('\n').filter(Boolean)

    if (names.some(name =>
      name.startsWith('/') ||
      name.includes('\\') ||
      name.split('/').includes('..')
    )) {
      throw new Error('Unsafe archive path')
    }

    run('tar', [
      ...compression,
      '-xf',
      archive,
      '-C',
      extracted,
    ])

    await materializeLibraryLinks(extracted)

    if (platform === 'darwin') {
      run('/usr/bin/codesign', [
        '--verify',
        '--strict',
        join(extracted, 'ollama'),
      ])
    }
  }

  const licenseResponse = await officialFetch(
    `https://raw.githubusercontent.com/ollama/ollama/${version}/LICENSE`
  )
  const license = await licenseResponse.text()

  if (!license.includes('MIT License') || !license.includes('Ollama')) {
    throw new Error('Missing official license')
  }

  await writeFile(join(extracted, 'LICENSE'), license, 'utf8')
  await writeFile(
    join(extracted, 'release-metadata.json'),
    JSON.stringify(metadata, null, 2)
  )

  const files = []

  async function walk(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      const name = prefix + entry.name

      if (entry.isSymbolicLink()) {
        throw new Error('Symlink in runtime archive')
      }

      if (entry.isDirectory()) {
        await walk(path, name + '/')
      } else if (entry.isFile()) {
        files.push({ path: name, sha256: await sha(path) })
      } else {
        throw new Error('Unsupported archive entry')
      }
    }
  }

  await walk(extracted)

  const manifest = {
    version,
    platform,
    arch,
    executable: platform === 'win32'
      ? 'ollama.exe'
      : platform === 'darwin'
        ? 'ollama'
        : 'bin/ollama',
    source: {
      url,
      sha256: asset.digest.slice(7),
      release,
    },
    files,
  }

  await writeFile(
    join(extracted, 'bundle.json'),
    JSON.stringify(manifest, null, 2)
  )

  await validateOllamaBundle(extracted, platform, arch)
  await rename(extracted, target)

  console.log(`Verified staging ready: ${target}`)
  console.log(`Download cache: ${temporary}`)
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = new Map()

  for (let i = 2; i < process.argv.length; i += 2) {
    if (!process.argv[i]?.startsWith('--') || !process.argv[i + 1]) {
      throw new Error('Use --option value')
    }

    args.set(process.argv[i].slice(2), process.argv[i + 1])
  }

  const platform = args.get('platform') || process.platform
  const arch = args.get('arch') || process.arch
  const folder = {
    win32: 'win',
    linux: 'linux',
    darwin: 'mac',
  }[platform]

  prepare({
    version: args.get('version'),
    platform,
    arch,
    archive: args.get('archive'),
    metadata: args.get('metadata'),
    output: args.get('output') ||
      `xmcl-electron-app/build/ollama/${folder}-${arch}`,
  }).catch(error => {
    console.error(error.cause?.code || '', error.message)
    process.exitCode = 1
  })
}
