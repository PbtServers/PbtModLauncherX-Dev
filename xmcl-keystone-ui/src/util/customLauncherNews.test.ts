import { expect, test, vi } from 'vitest'
import { createCustomNewsLoader, parseCustomNews, customNewsForLocale, customNewsImage, mergeLauncherNews, CUSTOM_NEWS_MAX_AGE, CUSTOM_NEWS_TTL, CUSTOM_NEWS_MAX_BYTES } from './customLauncherNews'
import { parseLauncherReleaseNews } from './launcherReleaseNews'

const entry = { id: 'welcome', version: '1.0.7', publishedAt: '2026-10-11T18:00:00Z', enabled: true, featured: true, image: 'news/images/welcome.png', translations: { 'es-ES': { title: 'Hola PbtModLauncherX', description: 'Texto español.' }, ca: { title: 'Hola comunitat', description: 'Text català.' }, en: { title: 'Hello community', description: 'English text.' } } }
const release = { tag_name: 'v1.0.7', draft: false, published_at: '2026-10-11T00:55:48Z', html_url: 'https://github.com/PbtServers/PbtModLauncherX-Dev/releases/tag/v1.0.7' }
const now = Date.parse('2026-10-12T00:00:00Z')
const feed = (news: unknown[] = [entry]) => ({ schemaVersion: 1, news })
function harness() {
  const map = new Map<string, string>()
  const storage = { getItem: (key: string) => map.get(key) || null, setItem: (key: string, value: string) => { map.set(key, value) }, removeItem: (key: string) => { map.delete(key) } }
  let time = now
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(feed())))
  return { map, storage, fetcher, clock: () => time, advance: (ms: number) => { time += ms } }
}

test.each(['es-ES', 'ca', 'en'])('selects %s immediately without fetching or changing artwork', locale => {
  const parsed = parseCustomNews(feed())
  const news = customNewsForLocale(parsed, [release], locale, now)
  expect(news[0].title).toBe(entry.translations[locale as keyof typeof entry.translations].title)
  expect(news[0].image.url).toContain('/master/news/images/welcome.png')
  expect(news[0].link).toBe(release.html_url)
})
test('stable English then Spanish fallback', () => {
  const parsed = parseCustomNews(feed())
  expect(customNewsForLocale(parsed, [release], 'fr', now)[0].title).toBe(entry.translations.en.title)
  delete parsed[0].translations.en
  expect(customNewsForLocale(parsed, [release], 'fr', now)[0].title).toBe(entry.translations['es-ES'].title)
})
test('empty, disabled, unpublished, draft and future entries are omitted', () => {
  expect(parseCustomNews(feed([]))).toEqual([])
  expect(customNewsForLocale(parseCustomNews(feed([{ ...entry, enabled: false }])), [release], 'en', now)).toEqual([])
  expect(customNewsForLocale(parseCustomNews(feed()), [], 'en', now)).toEqual([])
  expect(customNewsForLocale(parseCustomNews(feed()), [{ ...release, draft: true }], 'en', now)).toEqual([])
  expect(customNewsForLocale(parseCustomNews(feed()), [{ ...release, published_at: null }], 'en', now)).toEqual([])
  expect(customNewsForLocale(parseCustomNews(feed()), [release], 'en', now - 86400000)).toEqual([])
})
test('normalizes v prefixes and keeps multiple IDs for one release alongside habitual news', () => {
  const parsed = parseCustomNews(feed([entry, { ...entry, id: 'second', version: 'v1.0.7', publishedAt: '2026-10-11T19:00:00Z' }, entry]))
  const custom = customNewsForLocale(parsed, [release], 'en', now)
  const merged = mergeLauncherNews(parseLauncherReleaseNews([release]), [...custom, ...custom])
  expect(merged).toHaveLength(3)
  expect(merged.map(item => item.id)).toEqual(['custom:second', 'custom:welcome', `release:${release.html_url}`])
})
test.each(['news/images/pic.png', 'news/images/pbtmodlauncherx-v1.0.7.png', 'news/images/sub/pic.jpg', 'news/images/pic.jpeg', 'news/images/pic.webp', 'https://example.com/pic.png'])('accepts raster image %s', image => {
  expect(customNewsImage(image)).toMatch(/^https:\/\//)
})
test.each(['news/images/../pic.png', 'news/images/%2e%2e/pic.png', '../pic.png', 'news/images/a.svg', 'news/images/a.png?x=1', 'news/images/a\\pic.png', 'http://example.com/a.png', 'javascript:alert(1)', 'data:image/png;base64,abc', 'https://localhost./a.png', 'https://127.0.0.1/a.png', 'https://[::1]/a.png', 'https://name:secret@example.com/a.png', 'https://example.com/a.svg', 'https://example.com:8080/a.png'])('rejects unsafe image %s', image => {
  expect(customNewsImage(image)).toBeUndefined()
})
test('missing or invalid images use launcher artwork without hiding the article', () => {
  const news = customNewsForLocale(parseCustomNews(feed([{ ...entry, image: undefined }, { ...entry, id: 'bad-image', image: 'javascript:bad' }])), [release], 'en', now)
  expect(news).toHaveLength(2)
  expect(news.every(item => item.image.url === 'http://launcher/icons/logoDark')).toBe(true)
})
test.each([{ ...entry, id: '<script>' }, { ...entry, version: '../1.0.7' }, { ...entry, publishedAt: '2026-02-30T00:00:00Z' }, { ...entry, translations: { en: { title: '<img onerror=alert(1)>', description: 'Text' } } }, { ...entry, translations: { en: { title: 'x'.repeat(201), description: 'Text' } } }])('ignores malicious or invalid entries', invalid => {
  expect(parseCustomNews(feed([invalid]))).toEqual([])
})
test('rejects unsupported schema and excessive entry counts', () => {
  expect(() => parseCustomNews({ schemaVersion: 2, news: [] })).toThrow()
  expect(() => parseCustomNews(feed(Array(51).fill(entry)))).toThrow()
})
test('untrusted release links cannot substitute official release destinations', () => {
  expect(customNewsForLocale(parseCustomNews(feed()), [{ ...release, html_url: 'https://github.com.evil.test/PbtServers/PbtModLauncherX-Dev/releases/tag/v1.0.7' }], 'en', now)).toEqual([])
})
test('valid remote JSON is cached persistently, deduplicated and manually refreshable', async () => {
  const h = harness()
  const loader = createCustomNewsLoader(h.storage, h.fetcher, h.clock)
  expect((await Promise.all([loader.load(), loader.load(true)]))[0]).toHaveLength(1)
  expect(h.fetcher).toHaveBeenCalledTimes(1)
  expect(await createCustomNewsLoader(h.storage, h.fetcher, h.clock).load()).toHaveLength(1)
  expect(h.fetcher).toHaveBeenCalledTimes(1)
  h.fetcher.mockResolvedValue(new Response(JSON.stringify(feed([]))))
  expect(await loader.load(true)).toEqual([])
  expect(h.fetcher).toHaveBeenCalledTimes(2)
})
test.each([404, 410])('confirmed HTTP %s clears prior cached announcements', async status => {
  const h = harness()
  const loader = createCustomNewsLoader(h.storage, h.fetcher, h.clock)
  await loader.load()
  h.fetcher.mockResolvedValue(new Response(null, { status }))
  expect(await loader.load(true)).toEqual([])
  h.fetcher.mockRejectedValue(new Error('Offline'))
  expect(await loader.load(true)).toEqual([])
  expect(await createCustomNewsLoader(h.storage, h.fetcher, h.clock).load()).toEqual([])
})
test.each(['{bad json', JSON.stringify({ schemaVersion: 2, news: [] }), ' '.repeat(CUSTOM_NEWS_MAX_BYTES + 1)])('invalid remote content clears old announcements', async content => {
  const h = harness()
  const loader = createCustomNewsLoader(h.storage, h.fetcher, h.clock)
  await loader.load()
  h.fetcher.mockResolvedValue(new Response(content))
  expect(await loader.load(true)).toEqual([])
})
test('temporary errors use valid cache, expire after 24h and do not repeatedly retry on mount', async () => {
  const h = harness()
  const loader = createCustomNewsLoader(h.storage, h.fetcher, h.clock)
  await loader.load()
  h.advance(CUSTOM_NEWS_TTL)
  h.fetcher.mockRejectedValue(new TypeError('Offline'))
  expect(await loader.load()).toHaveLength(1)
  await loader.load()
  expect(h.fetcher).toHaveBeenCalledTimes(2)
  h.advance(CUSTOM_NEWS_MAX_AGE)
  expect(await loader.load()).toEqual([])
})
test('no cache and network errors are silent empty results', async () => {
  const h = harness()
  h.fetcher.mockRejectedValue(new Error('Offline'))
  expect(await createCustomNewsLoader(h.storage, h.fetcher, h.clock).load()).toEqual([])
})

test('successful checks update the image revision while cached language changes do not', async () => {
  const h = harness()
  const loader = createCustomNewsLoader(h.storage, h.fetcher, h.clock)
  const entries = await loader.load()
  const revision = loader.checkedAt()
  expect(customNewsForLocale(entries, [release], 'en', now, revision)[0].imageRevision).toBe(revision)
  await loader.load()
  expect(loader.checkedAt()).toBe(revision)
  h.advance(1000)
  h.fetcher.mockResolvedValue(new Response(JSON.stringify(feed())))
  await loader.load(true)
  expect(loader.checkedAt()).toBeGreaterThan(revision)
})
