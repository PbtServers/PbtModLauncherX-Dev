import { beforeEach, afterEach, expect, test, vi } from 'vitest'

const storage = new Map<string, string>()
beforeEach(() => {
  vi.resetModules()
  storage.clear()
  vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key), setItem: (key: string, value: string) => storage.set(key, value) })
})
afterEach(() => vi.unstubAllGlobals())

test.each(['es-ES', 'ca'])('translates public news to %s, preserves names/versions, caches and deduplicates', async locale => {
  const fetcher = vi.fn(async (url: URL) => ({ ok: true, json: async () => ({ responseStatus: 200, responseData: { translatedText: url.searchParams.get('q')?.replace('Discover', locale === 'ca' ? 'Descobreix' : 'Descubre') } }) }))
  vi.stubGlobal('fetch', fetcher)
  const { translateNewsText } = await import('./newsTranslation')
  const source = 'Discover Minecraft 1.21.4'
  const result = await Promise.all([translateNewsText(source, locale), translateNewsText(source, locale)])
  expect(result[0]).toContain('Minecraft 1.21.4')
  expect(result[0]).not.toContain('Discover')
  expect(fetcher).toHaveBeenCalledTimes(1)
  vi.resetModules()
  expect(await (await import('./newsTranslation')).translateNewsText(source, locale)).toBe(result[0])
  expect(fetcher).toHaveBeenCalledTimes(1)
})

test('English does not contact a translation service', async () => {
  const fetcher = vi.fn()
  vi.stubGlobal('fetch', fetcher)
  expect(await (await import('./newsTranslation')).translateNewsText('News', 'en')).toBe('News')
  expect(fetcher).not.toHaveBeenCalled()
})

test('quota exhaustion rejects and applies a cooldown instead of retrying every article', async () => {
  const fetcher = vi.fn(async () => ({ ok: true, json: async () => ({ responseStatus: 403, quotaFinished: true }) }))
  vi.stubGlobal('fetch', fetcher)
  const { translateNewsText } = await import('./newsTranslation')
  await expect(translateNewsText('First article', 'ca')).rejects.toThrow()
  await expect(translateNewsText('Second article', 'ca')).rejects.toThrow()
  expect(fetcher).toHaveBeenCalledTimes(1)
  expect(storage.size).toBe(0)
})

test('rejects translations that remove protected names', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ responseStatus: 200, responseData: { translatedText: 'Unrelated text' } }) })))
  await expect((await import('./newsTranslation')).translateNewsText('Play Minecraft 1.21.4', 'ca')).rejects.toThrow('protected term')
  expect(storage.size).toBe(0)
})

test('splits long summaries into documented UTF-8 request sizes', async () => {
  const fetcher = vi.fn(async (url: URL) => {
    expect(new TextEncoder().encode(url.searchParams.get('q') || '').length).toBeLessThanOrEqual(500)
    return { ok: true, json: async () => ({ responseStatus: 200, responseData: { translatedText: url.searchParams.get('q') } }) }
  })
  vi.stubGlobal('fetch', fetcher)
  await (await import('./newsTranslation')).translateNewsText('An interesting article. '.repeat(60), 'ca')
  expect(fetcher.mock.calls.length).toBeGreaterThan(1)
})
