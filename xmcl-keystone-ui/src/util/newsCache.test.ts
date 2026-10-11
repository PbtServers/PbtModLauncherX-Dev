import { afterEach, expect, test, vi } from 'vitest'
import { fetchNewsFeed } from './newsCache'

afterEach(() => vi.unstubAllGlobals())
const parse = (input: unknown) => {
  if (!Array.isArray(input)) throw new Error('Invalid feed')
  return input
}

test('persists verified feeds and returns them after a network failure', async () => {
  const storage = new Map<string, string>()
  vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key), setItem: (key: string, value: string) => storage.set(key, value) })
  const offline = vi.fn()
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [{ date: '2026-10-11' }] })))
  expect(await fetchNewsFeed('https://example.test/feed', 'feed', parse, offline)).toHaveLength(1)
  expect(offline).toHaveBeenLastCalledWith(false)
  vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('Offline') }))
  expect(await fetchNewsFeed('https://example.test/feed', 'feed', parse, offline)).toHaveLength(1)
  expect(offline).toHaveBeenLastCalledWith(true)
})

test('never replaces a verified cache with malformed responses or failed HTTP requests', async () => {
  const setter = vi.fn()
  vi.stubGlobal('localStorage', { getItem: () => '[1]', setItem: setter })
  for (const response of [{ ok: false, status: 429 }, { ok: true, json: async () => ({ invalid: true }) }]) {
    vi.stubGlobal('fetch', vi.fn(async () => response))
    expect(await fetchNewsFeed('https://example.test/feed', 'feed', parse, vi.fn())).toEqual([1])
  }
  expect(setter).not.toHaveBeenCalled()
})

test('rejects corrupted offline caches and supports online news with read-only storage', async () => {
  vi.stubGlobal('localStorage', { getItem: () => '{corrupt', setItem: () => { throw new Error('Read-only') } })
  vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('Offline') }))
  await expect(fetchNewsFeed('https://example.test/feed', 'feed', parse, vi.fn())).rejects.toThrow('Offline')
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [1] })))
  expect(await fetchNewsFeed('https://example.test/feed', 'feed', parse, vi.fn())).toEqual([1])
})
