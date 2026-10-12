import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { lstat, readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const markerName = 'pbtmodlauncherx-publication.json'
const limit = 2 * 1024 ** 3

// A generic ZIP, runtime archive, sidecar or documentation is never an installer.
export function isLauncherInstaller(name) {
  return typeof name === 'string' && /^pbtmodlauncherx-(?:deskgap-)?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?-(?:win32-(?:x64|arm64)\.(?:exe|appx|zip)|(?:x64|arm64|amd64|aarch64|x86_64)\.(?:AppImage|deb|rpm|pacman|tar\.xz|dmg))(?:\.part\d{3})?$/i.test(name)
}

export function assertPublicationContext(env) {
  if (env.GITHUB_EVENT_NAME !== 'push' || env.GITHUB_REF !== 'refs/heads/master' || env.GITHUB_REPOSITORY !== 'PbtServers/PbtModLauncherX-Dev') throw new Error('Publication is restricted to pushes to the upstream master branch')
  if (env.BUILD_RESULT !== 'success') throw new Error('All five builds must succeed before release publication')
}

export function githubClient({ repo, token, fetchImpl = fetch }) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !token) throw new Error('Missing GitHub repository or token')
  const base = `https://api.github.com/repos/${repo}`
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  async function request(url, options = {}) {
    const response = await fetchImpl(url, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(30 * 60 * 1000) })
    if (!response.ok) throw new Error(`GitHub API ${response.status}: ${new URL(url).pathname}`)
    return response
  }
  return {
    latest: async () => (await request(`${base}/releases/latest`)).json(),
    assets: async id => {
      const assets = []
      for (let page = 1; ; page++) {
        const batch = await (await request(`${base}/releases/${id}/assets?per_page=100&page=${page}`)).json()
        if (!Array.isArray(batch) || batch.some(asset => typeof asset.name !== 'string' || !Number.isSafeInteger(asset.size))) throw new Error('Invalid GitHub assets response')
        assets.push(...batch)
        if (batch.length < 100) return assets
        if (page >= 10000) throw new Error('GitHub asset pagination did not terminate')
      }
    },
    upload: async (release, file) => {
      const url = new URL(release.upload_url.replace(/\{.*$/, ''))
      if (url.origin !== 'https://uploads.github.com' || url.pathname !== `/repos/${repo}/releases/${release.id}/assets`) throw new Error('Unexpected GitHub upload URL')
      url.searchParams.set('name', file.name)
      const body = file.data ?? createReadStream(file.path)
      try {
        return await (await request(url, { method: 'POST', body, duplex: 'half', headers: { 'Content-Type': 'application/octet-stream', 'Content-Length': String(file.bytes) } })).json()
      } finally { if (typeof body.destroy === 'function') body.destroy() }
    },
    digest: async asset => {
      const response = await request(`${base}/releases/assets/${asset.id}`, { headers: { Accept: 'application/octet-stream' } })
      const hash = createHash('sha256')
      for await (const bytes of response.body) hash.update(bytes)
      return hash.digest('hex')
    },
  }
}

async function inspect(api, version) {
  const release = await api.latest()
  if (!Number.isSafeInteger(release.id) || release.draft !== false || release.prerelease !== false || !release.published_at || release.tag_name !== `v${version}`) throw new Error(`Latest stable release does not match v${version}`)
  const assets = await api.assets(release.id)
  if (assets.some(asset => isLauncherInstaller(asset.name))) return { release, assets, skip: true }
  if (assets.some(asset => asset.name === markerName)) throw new Error('An earlier publication is incomplete; controlled recovery is required')
  return { release, assets, skip: false }
}

export async function checkRelease(api, version) {
  const state = await inspect(api, version)
  return { status: state.skip ? 'skipped' : 'needed', releaseId: state.release.id, tag: state.release.tag_name }
}

export async function verifyStaging(root) {
  const names = (await readdir(root)).sort()
  const text = await readFile(join(root, 'SHA256SUMS.txt'), 'utf8')
  const sums = new Map()
  for (const line of text.trim().split(/\r?\n/)) {
    const match = /^([a-f0-9]{64})  ([^/\\\r\n]+)$/.exec(line)
    if (!match || sums.has(match[2])) throw new Error('Invalid or duplicate SHA256SUMS entry')
    sums.set(match[2], match[1])
  }
  if (sums.size !== names.length - 1 || names.some(name => name !== 'SHA256SUMS.txt' && !sums.has(name))) throw new Error('SHA256SUMS does not cover every staged asset')
  if (!names.some(isLauncherInstaller)) throw new Error('No verified launcher installers staged')
  const files = []
  for (const name of names) {
    const path = join(root, name)
    const info = await lstat(path)
    if (!info.isFile() || info.size === 0 || info.size >= limit || name === markerName) throw new Error(`Invalid release asset: ${name}`)
    const hash = createHash('sha256')
    for await (const bytes of createReadStream(path)) hash.update(bytes)
    const sha256 = hash.digest('hex')
    if (name !== 'SHA256SUMS.txt' && sums.get(name) !== sha256) throw new Error(`SHA-256 mismatch: ${name}`)
    files.push({ name, path, bytes: info.size, sha256 })
  }
  return files
}

export async function publishRelease({ api, version, root, runId, report = async () => {}, log = console.log }) {
  const uploaded = []
  const receipt = { version, runId, status: 'checking', uploaded }
  try {
    const initial = await inspect(api, version)
    receipt.releaseId = initial.release.id
    if (initial.skip) {
      receipt.status = 'skipped'
      log('Publicación omitida correctamente: la última release ya contiene instaladores de PbtModLauncherX.')
      await report(receipt)
      return receipt
    }
    const files = await verifyStaging(root)
    // Fresh paginated asset check immediately before the first write.
    const final = await inspect(api, version)
    if (final.release.id !== initial.release.id) throw new Error('Latest release changed while validating artifacts')
    if (final.skip) {
      receipt.status = 'skipped'
      log('Publicación omitida correctamente: la última release ya contiene instaladores de PbtModLauncherX.')
      await report(receipt)
      return receipt
    }
    const names = new Set(final.assets.map(asset => asset.name))
    if (files.some(file => names.has(file.name))) throw new Error('An existing asset name collides with the staged publication; no assets will be replaced')
    const data = Buffer.from(JSON.stringify({ version, runId, files: files.map(({ name, bytes, sha256 }) => ({ name, bytes, sha256 })) }, null, 2) + '\n')
    const marker = { name: markerName, data, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') }
    // Creating this unique asset reserves ownership atomically. Never remove it
    // automatically: after interruption it protects a partial publication.
    for (const file of [marker, ...files]) {
      const asset = await api.upload(final.release, file)
      uploaded.push({ name: file.name, id: asset.id, bytes: asset.size })
      await report({ ...receipt, status: 'uploading' })
      log(`Uploaded: ${file.name} (${asset.size} bytes)`)
      if (asset.name !== file.name || asset.size !== file.bytes || asset.state !== 'uploaded') throw new Error(`Upload verification failed: ${file.name}`)
    }
    const actual = await api.assets(final.release.id)
    for (const file of [marker, ...files]) {
      const matches = actual.filter(asset => asset.name === file.name)
      if (matches.length !== 1 || matches[0].state !== 'uploaded' || matches[0].size !== file.bytes) throw new Error(`Published asset missing or size differs: ${file.name}`)
      const digest = matches[0].digest ?? `sha256:${await api.digest(matches[0])}`
      if (digest !== `sha256:${file.sha256}`) throw new Error(`Published asset SHA-256 differs: ${file.name}`)
    }
    receipt.status = 'published'
    await report(receipt)
    log('Publicación completada correctamente. Los instaladores verificados se han añadido a la release.')
    return receipt
  } catch (error) {
    receipt.status = 'failed'
    receipt.error = error.message
    await report(receipt)
    log(`Publication failed; uploaded assets preserved: ${uploaded.map(asset => asset.name).join(', ') || 'none'}`)
    throw error
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  assertPublicationContext(process.env)
  const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  const api = githubClient({ repo: process.env.GITHUB_REPOSITORY, token: process.env.GITHUB_TOKEN })
  if (process.argv[2] === '--check') {
    const result = await checkRelease(api, version)
    await writeFile('publication-result.json', JSON.stringify({ version, runId: process.env.GITHUB_RUN_ID, ...result, uploaded: [] }, null, 2) + '\n')
    if (process.env.GITHUB_OUTPUT) {
      const { appendFile } = await import('node:fs/promises')
      await appendFile(process.env.GITHUB_OUTPUT, `needed=${result.status === 'needed'}\n`)
    }
    console.log(result.status === 'skipped' ? 'Publicación omitida correctamente: la última release ya contiene instaladores de PbtModLauncherX.' : 'Release sin instaladores; publicación necesaria.')
  } else {
    await publishRelease({ api, version, root: resolve(process.argv[2] || 'build/release'), runId: process.env.GITHUB_RUN_ID,
      report: receipt => writeFile('publication-result.json', JSON.stringify(receipt, null, 2) + '\n') })
  }
}
