import { createHash } from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import { lstat, mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { validateOllamaBundle } from '../xmcl-runtime/agent/runtimeBundle.ts'

export function runtimeAsset(version, platform, arch) {
  if (!/^v\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) throw new Error('Supply an exact official release tag')
  if (!['x64', 'arm64'].includes(arch)) throw new Error('Unsupported architecture; ia32 is not supported')
  if (platform === 'win32' && arch === 'x64') return 'ollama-windows-amd64.zip'
  if (platform === 'linux') return `ollama-linux-${arch === 'x64' ? 'amd64' : 'arm64'}.tar.zst`
  if (platform === 'darwin') return 'ollama-darwin.tgz'
  throw new Error('No verified automatic archive recipe for this platform; do not substitute a different architecture')
}

async function officialFetch(url) {
  for (let count = 0; count < 6; count++) {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || !['api.github.com', 'github.com', 'release-assets.githubusercontent.com', 'objects.githubusercontent.com', 'raw.githubusercontent.com'].includes(parsed.hostname)) throw new Error('Unexpected download origin')
    const response = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'PbtModLauncherX-runtime-preparer' }, signal: AbortSignal.timeout(30 * 60 * 1000) })
    if ([301, 302, 303, 307, 308].includes(response.status)) { const next = response.headers.get('location'); await response.body?.cancel(); if (!next) throw new Error('Missing redirect location'); url = new URL(next, url).href; continue }
    if (!response.ok) throw new Error(`Official download failed: HTTP ${response.status}`)
    return response
  }
  throw new Error('Too many redirects')
}

async function sha(path) { const hash = createHash('sha256'); for await (const chunk of createReadStream(path)) hash.update(chunk); return hash.digest('hex') }
function run(command, args) { const result = spawnSync(command, args, { shell: false, encoding: 'utf8', windowsHide: true }); if (result.status !== 0 || result.error) throw new Error(`Extraction failed: ${result.error?.code || result.stderr}`); return result.stdout }

export async function prepare({ version, platform, arch, archive: supplied, output, metadata: suppliedMetadata }) {
  const assetName = runtimeAsset(version, platform, arch)
  const release = `https://api.github.com/repos/ollama/ollama/releases/tags/${version}`
  // A previously downloaded metadata file is an explicitly provided trust input:
  // it must come from this exact official endpoint, never from hashing the archive.
  const metadata = suppliedMetadata ? JSON.parse(await readFile(suppliedMetadata, 'utf8')) : await (await officialFetch(release)).json()
  if (metadata.tag_name !== version || metadata.draft || metadata.prerelease) throw new Error('Unexpected release/channel')
  const asset = metadata.assets?.find(entry => entry.name === assetName)
  const url = `https://github.com/ollama/ollama/releases/download/${version}/${assetName}`
  if (!asset || asset.browser_download_url !== url || !/^sha256:[a-f0-9]{64}$/.test(asset.digest ?? '') || !Number.isSafeInteger(asset.size) || asset.size <= 0) throw new Error('Official asset metadata lacks a trusted SHA-256/size; preparation is blocked')
  const target = resolve(output)
  try { await lstat(target); throw new Error('Output already exists; preserve it and choose another staging path') } catch (e) { if (e.code !== 'ENOENT') throw e }
  const temporary = target + `.preparing-${process.pid}`
  await mkdir(dirname(target), { recursive: true })
  await mkdir(temporary, { recursive: false })
  const archive = supplied ? resolve(supplied) : join(temporary, assetName)
  if (!supplied) {
    const response = await officialFetch(url)
    await pipeline(Readable.fromWeb(response.body), createWriteStream(archive, { flags: 'wx', mode: 0o600 }))
  }
  if ((await stat(archive)).size !== asset.size || await sha(archive) !== asset.digest.slice(7)) throw new Error('Archive size/hash does not match official metadata')
  const extracted = join(temporary, 'bundle')
  await mkdir(extracted)
  if (platform === 'win32') run('powershell.exe', ['-NoProfile', '-NonInteractive', '-File', join(dirname(fileURLToPath(import.meta.url)), 'extract-ollama.ps1'), archive, extracted])
  else {
    const compression = platform === 'darwin' ? [] : ['--zstd']
    const names = run('tar', [...compression, '-tf', archive]).split('\n').filter(Boolean)
    if (names.some(name => name.startsWith('/') || name.includes('\\') || name.split('/').includes('..'))) throw new Error('Unsafe archive path')
    // Archive has a trusted digest. Extraction is isolated; symlinks are subsequently rejected.
    run('tar', [...compression, '-xf', archive, '-C', extracted, '--no-same-owner', '--no-same-permissions'])
    if (platform === 'darwin') run('/usr/bin/codesign', ['--verify', '--strict', join(extracted, 'ollama')])
  }
  const license = await (await officialFetch(`https://raw.githubusercontent.com/ollama/ollama/${version}/LICENSE`)).text()
  if (!license.includes('MIT License') || !license.includes('Ollama')) throw new Error('Missing official license')
  await writeFile(join(extracted, 'LICENSE'), license, 'utf8')
  await writeFile(join(extracted, 'release-metadata.json'), JSON.stringify(metadata, null, 2))
  const files = []
  async function walk(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name); const name = prefix + entry.name
      if (entry.isSymbolicLink()) throw new Error('Symlink in runtime archive; requires an explicitly audited packaging recipe')
      if (entry.isDirectory()) await walk(path, name + '/')
      else if (entry.isFile()) files.push({ path: name, sha256: await sha(path) })
      else throw new Error('Unsupported archive entry')
    }
  }
  await walk(extracted)
  await writeFile(join(extracted, 'bundle.json'), JSON.stringify({ version, platform, arch, executable: platform === 'win32' ? 'ollama.exe' : platform === 'darwin' ? 'ollama' : 'bin/ollama', source: { url, sha256: asset.digest.slice(7), release }, files }, null, 2))
  await validateOllamaBundle(extracted, platform, arch)
  await rename(extracted, target)
  console.log(`Verified staging ready: ${target}. Kept archive/diagnostics: ${temporary}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Map()
  for (let i = 2; i < process.argv.length; i += 2) { if (!process.argv[i]?.startsWith('--') || !process.argv[i + 1]) throw new Error('Use --option value'); args.set(process.argv[i].slice(2), process.argv[i + 1]) }
  const platform = args.get('platform') || process.platform
  const arch = args.get('arch') || process.arch
  const folder = { win32: 'win', linux: 'linux', darwin: 'mac' }[platform]
  prepare({ version: args.get('version'), platform, arch, archive: args.get('archive'), metadata: args.get('metadata'), output: args.get('output') || `xmcl-electron-app/build/ollama/${folder}-${arch}` }).catch(error => { console.error(error.cause?.code || '', error.message); process.exitCode = 1 })
}
