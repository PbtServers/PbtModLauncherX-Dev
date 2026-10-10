import { gt, prerelease, valid } from 'semver'

export const updateRepository = 'PbtServers/PbtModLauncherX-Dev'
export const updateManifestURL = `https://raw.githubusercontent.com/${updateRepository}/master/latest_version.json`
export const updateReleaseURL = `https://api.github.com/repos/${updateRepository}/releases/latest`

export interface CheckedRelease {
  version: string
  body: string
  date: string
  newer: boolean
  assets: Array<{ name: string; url: string; size: number }>
  runtime?: { electron: string; platform: string; arch: string; dependencies: string }
}

export function releaseAssetURL(version: string, name: string) {
  if (!valid(version) || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name) || name.includes('..')) {
    throw new Error('Invalid PbtServers update asset')
  }
  return `https://github.com/${updateRepository}/releases/download/v${version}/${name}`
}

export function checkRelease(value: unknown, installed: string, allowPrerelease: boolean): CheckedRelease {
  if (!value || typeof value !== 'object') throw new Error('Invalid PbtServers update manifest')
  const data = value as Record<string, unknown>
  const version = typeof data.tag_name === 'string' && data.tag_name.startsWith('v') ? valid(data.tag_name.slice(1)) : null
  if (!version || data.tag_name !== `v${version}` || !valid(installed) || !Array.isArray(data.assets) || data.assets.length > 4096) {
    throw new Error('Invalid PbtServers release version or assets')
  }
  const assets = data.assets.map((asset: unknown) => {
    if (!asset || typeof asset !== 'object') throw new Error('Invalid update asset')
    const a = asset as Record<string, unknown>
    if (typeof a.name !== 'string' || a.browser_download_url !== releaseAssetURL(version, a.name) ||
        typeof a.size !== 'number' || !Number.isSafeInteger(a.size) || a.size <= 0) {
      throw new Error('Invalid update asset source or size')
    }
    return { name: a.name, url: a.browser_download_url as string, size: a.size }
  })
  if (new Set(assets.map(a => a.name)).size !== assets.length) throw new Error('Duplicate update assets')
  const r = data.pbt_runtime as Record<string, unknown> | undefined
  const runtime = r && typeof r.electron === 'string' && typeof r.platform === 'string' && typeof r.arch === 'string' &&
    typeof r.dependencies === 'string' && /^[a-f0-9]{64}$/.test(r.dependencies)
    ? { electron: r.electron, platform: r.platform, arch: r.arch, dependencies: r.dependencies } : undefined
  return {
    version, assets, runtime,
    body: typeof data.body === 'string' ? data.body : '',
    date: typeof data.published_at === 'string' ? data.published_at : '',
    newer: data.draft !== true && (allowPrerelease || (data.prerelease !== true && !prerelease(version))) && gt(version, installed),
  }
}

export function supportsAsar(release: CheckedRelease, runtime: { electron: string; platform: string; arch: string; dependencies: string }) {
  // Windows/macOS signed packages must be updated as complete packages. Never
  // apply a JavaScript-only update across Electron/native dependency upgrades.
  return runtime.platform === 'linux' && release.runtime?.electron === runtime.electron &&
    release.runtime.platform === runtime.platform && release.runtime.arch === runtime.arch &&
    release.runtime.dependencies === runtime.dependencies
}

export function checkUpdateRedirect(url: string) {
  const target = new URL(url)
  if (target.protocol !== 'https:' || target.username || target.password || target.hash ||
      !['release-assets.githubusercontent.com', 'objects.githubusercontent.com'].includes(target.hostname)) {
    throw new Error('Unauthorized PbtServers update redirect')
  }
}

/** Only the initial URL selects the trusted repository; redirects may only
 * enter GitHub's HTTPS asset CDN. Never forward application headers/tokens. */
export async function fetchUpdate(fetcher: typeof fetch, url: string, signal?: AbortSignal): Promise<Response> {
  const parsed = new URL(url)
  const allowed = url === updateManifestURL || url === updateReleaseURL ||
    (parsed.origin === 'https://github.com' && parsed.pathname.startsWith(`/${updateRepository}/releases/download/v`))
  if (!allowed || parsed.username || parsed.password || parsed.hash || parsed.search || parsed.port) throw new Error('Unauthorized update source')
  const bounded = signal ? AbortSignal.any([signal, AbortSignal.timeout(30_000)]) : AbortSignal.timeout(30_000)
  let current = url
  for (let redirects = 0; redirects < 4; redirects++) {
    bounded.throwIfAborted()
    const response = await fetcher(current, { signal: bounded, redirect: 'manual' })
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      await response.body?.cancel()
      if (!location) throw new Error('Missing update redirect')
      current = new URL(location, current).href
      checkUpdateRedirect(current)
      continue
    }
    if (!response.ok) {
      await response.body?.cancel()
      throw new Error(`PbtServers update request failed: HTTP ${response.status}`)
    }
    return response
  }
  throw new Error('Too many update redirects')
}

export async function readUpdateJSON(response: Response): Promise<unknown> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Empty update manifest')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const result = await reader.read()
      if (result.done) break
      size += result.value.length
      if (size > 2 * 1024 * 1024) throw new Error('Update manifest is too large')
      chunks.push(result.value)
    }
  } finally { await reader.cancel() }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
}
