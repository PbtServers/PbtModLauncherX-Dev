import type { LauncherNews } from '../composables/launcherNews'

export const CUSTOM_NEWS_URL = 'https://raw.githubusercontent.com/PbtServers/PbtModLauncherX-Dev/master/news/pbtmodlauncherx-news.json'
export const NEWS_IMAGE_FALLBACK = 'http://launcher/icons/logoDark'
export const CUSTOM_NEWS_MAX_BYTES = 256 * 1024
export const CUSTOM_NEWS_TTL = 10 * 60 * 1000
export const CUSTOM_NEWS_MAX_AGE = 24 * 60 * 60 * 1000
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const versionPattern = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[a-zA-Z0-9.-]+)?$/
export function normalizeNewsVersion(value: unknown) {
  return typeof value === 'string' && value.length <= 64 && versionPattern.test(value) ? value.replace(/^v/, '') : undefined
}
function date(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) return undefined
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  const calendar = new Date(Date.UTC(year, month - 1, day))
  return calendar.getUTCFullYear() === year && calendar.getUTCMonth() === month - 1 && calendar.getUTCDate() === day ? value : undefined
}
function text(value: unknown, max: number) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[<>]/.test(value)) return undefined
  if ([...value].some(char => { const code = char.charCodeAt(0); return code < 32 && ![9, 10, 13].includes(code) || code === 127 })) return undefined
  return value.trim()
}
export function customNewsImage(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 2048 || /[\\\s]/.test(value) || [...value].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return undefined
  if (value.startsWith('news/images/')) {
    if (!/^news\/images\/(?:[a-zA-Z0-9_-][a-zA-Z0-9._-]*\/)*[a-zA-Z0-9_-][a-zA-Z0-9._-]*\.(?:png|jpe?g|webp)$/i.test(value)) return undefined
    return `https://raw.githubusercontent.com/PbtServers/PbtModLauncherX-Dev/master/${value}`
  }
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port && url.port !== '443' || !/\.(?:png|jpe?g|webp)$/i.test(url.pathname) || url.hash) return undefined
    // Remote news may not address local services or literal IP addresses.
    const hostname = url.hostname.replace(/\.$/, '')
    if (!hostname.includes('.') || /^(?:localhost|.*\.localhost|.*\.local)$/.test(hostname) || /^[\d.]+$/.test(hostname) || hostname.includes(':')) return undefined
    return url.href
  } catch { return undefined }
}
export interface CustomNewsEntry {
  id: string
  version: string
  publishedAt: string
  enabled: boolean
  featured: boolean
  image?: string
  translations: Record<string, { title: string; description: string }>
}
export function parseCustomNews(input: unknown): CustomNewsEntry[] {
  if (!record(input) || input.schemaVersion !== 1 || !Array.isArray(input.news) || input.news.length > 50) throw new Error('Invalid custom news schema or entry limit')
  const seen = new Set<string>()
  const result: CustomNewsEntry[] = []
  for (const item of input.news) {
    if (!record(item) || typeof item.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(item.id) || seen.has(item.id)) continue
    const version = normalizeNewsVersion(item.version)
    const publishedAt = date(item.publishedAt)
    if (!version || !publishedAt || typeof item.enabled !== 'boolean' || item.featured !== undefined && typeof item.featured !== 'boolean' || !record(item.translations) || Object.keys(item.translations).length > 32) continue
    const translations: CustomNewsEntry['translations'] = Object.create(null)
    for (const [locale, translation] of Object.entries(item.translations)) {
      if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(locale) || !record(translation)) continue
      const title = text(translation.title, 200)
      const description = text(translation.description, 2000)
      if (title && description) translations[locale] = { title, description }
    }
    if (!Object.keys(translations).length) continue
    seen.add(item.id)
    result.push({ id: item.id, version, publishedAt, enabled: item.enabled, featured: item.featured === true, image: customNewsImage(item.image), translations })
  }
  return result
}
export function customNewsForLocale(entries: CustomNewsEntry[], releases: unknown, locale: string, now = Date.now(), imageRevision = 0): LauncherNews[] {
  const published = new Map<string, string>()
  if (Array.isArray(releases)) for (const release of releases) {
    if (!record(release) || release.draft !== false || !date(release.published_at) || Date.parse(release.published_at as string) > now) continue
    const version = normalizeNewsVersion(release.tag_name)
    if (!version || typeof release.html_url !== 'string') continue
    try {
      const url = new URL(release.html_url)
      if (url.origin !== 'https://github.com' || url.username || url.password || url.search || url.hash || url.pathname !== `/PbtServers/PbtModLauncherX-Dev/releases/tag/${release.tag_name}`) continue
      published.set(version, url.href)
    } catch { /* Ignore invalid releases. */ }
  }
  return entries.flatMap(entry => {
    const link = published.get(entry.version)
    const translation = entry.translations[locale] || entry.translations.en || entry.translations['es-ES']
    if (!entry.enabled || !link || !translation || Date.parse(entry.publishedAt) > now) return []
    return [{ id: `custom:${entry.id}`, source: 'custom' as const, version: entry.version, featured: entry.featured, imageRevision, category: 'PbtModLauncherX', image: { url: entry.image || NEWS_IMAGE_FALLBACK, width: 1280, height: 720 }, date: entry.publishedAt, title: translation.title, description: translation.description, link }]
  }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
}

/** Optional feed: confirmed deletion/invalid data clears old entries; network failure has bounded fallback. */
export function createCustomNewsLoader(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>, fetcher: typeof fetch = (...args) => fetch(...args), clock = Date.now) {
  const key = 'pbt-custom-news-v1'
  let cached: { checkedAt: number; input: unknown } | undefined
  let pending: Promise<CustomNewsEntry[]> | undefined
  let lastAttempt: number | undefined
  try {
    const value = JSON.parse(storage.getItem(key) || 'null')
    if (record(value) && typeof value.checkedAt === 'number' && value.checkedAt <= clock() && clock() - value.checkedAt < CUSTOM_NEWS_MAX_AGE) { parseCustomNews(value.input); cached = { checkedAt: value.checkedAt, input: value.input } }
  } catch { /* Optional cache. */ }
  function save(input: unknown) {
    cached = { checkedAt: clock(), input }
    try { storage.setItem(key, JSON.stringify(cached)) } catch { /* Read-only storage. */ }
  }
  async function request() {
    lastAttempt = clock()
    try {
      const response = await fetcher(CUSTOM_NEWS_URL, { signal: AbortSignal.timeout(8000), cache: 'no-cache', redirect: 'error' })
      if (response.status === 404 || response.status === 410) { save({ schemaVersion: 1, news: [] }); return [] }
      if (!response.ok) throw new Error(`Custom news HTTP ${response.status}`)
      try {
        if (Number(response.headers.get('content-length')) > CUSTOM_NEWS_MAX_BYTES) { await response.body?.cancel(); throw new Error('Custom news size limit') }
        const reader = response.body?.getReader()
        if (!reader) throw new Error('Missing news body')
        const chunks: Uint8Array[] = []
        let size = 0
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            size += value.length
            if (size > CUSTOM_NEWS_MAX_BYTES) { await reader.cancel(); throw new Error('Custom news size limit') }
            chunks.push(value)
          }
        } finally { reader.releaseLock() }
        const bytes = new Uint8Array(size)
        let offset = 0
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
        let decoded: string
        try { decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes) } catch { throw new SyntaxError('Invalid news encoding') }
        const input = JSON.parse(decoded)
        const entries = parseCustomNews(input)
        if (entries.length !== input.news.length) console.debug('[custom-news] Invalid or duplicate entries ignored')
        save(input)
        return entries
      } catch (error) {
        if (error instanceof SyntaxError || error instanceof Error && /schema|size limit|Missing news body/.test(error.message)) {
          console.debug('[custom-news] Invalid optional feed ignored')
          save({ schemaVersion: 1, news: [] })
          return []
        }
        throw error
      }
    } catch {
      console.debug('[custom-news] Optional feed unavailable; using unexpired cache if present')
      return cached && clock() - cached.checkedAt < CUSTOM_NEWS_MAX_AGE ? parseCustomNews(cached.input) : []
    }
  }
  return {
    checkedAt: () => cached?.checkedAt || 0,
    load(force = false) {
      if (pending) return pending
      if (!force && lastAttempt !== undefined && clock() - lastAttempt < CUSTOM_NEWS_TTL) return Promise.resolve(cached && clock() - cached.checkedAt < CUSTOM_NEWS_MAX_AGE ? parseCustomNews(cached.input) : [])
      if (!force && cached && clock() - cached.checkedAt < CUSTOM_NEWS_TTL) return Promise.resolve(parseCustomNews(cached.input))
      pending = request().finally(() => { pending = undefined })
      return pending
    },
  }
}

export function mergeLauncherNews(usual: LauncherNews[], custom: LauncherNews[]): LauncherNews[] {
  const seen = new Set<string>()
  return [...usual, ...custom].filter(item => {
    const key = item.id || `release:${item.link}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
}
