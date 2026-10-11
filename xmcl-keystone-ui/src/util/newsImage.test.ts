import { afterEach, expect, test, vi } from 'vitest'
import { fetchNewsImage, newsImageMime, MAX_NEWS_IMAGE_BYTES } from './newsImage'

afterEach(() => vi.unstubAllGlobals())
test('recognizes only PNG, JPEG and WebP signatures', () => {
  expect(newsImageMime(new Uint8Array([137,80,78,71,13,10,26,10]))).toBe('image/png')
  expect(newsImageMime(new Uint8Array([255,216,255]))).toBe('image/jpeg')
  expect(newsImageMime(new TextEncoder().encode('RIFFxxxxWEBP'))).toBe('image/webp')
  expect(newsImageMime(new TextEncoder().encode('<svg onload="alert(1)"/>'))).toBeUndefined()
})
test('loads raster bytes as a typed blob without credentials', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(new Uint8Array([137,80,78,71,13,10,26,10]), { headers: { 'content-type': 'image/png' } }))
  vi.stubGlobal('fetch', fetcher)
  expect((await fetchNewsImage('https://example.com/image.png', new AbortController().signal)).type).toBe('image/png')
  expect(fetcher.mock.calls[0][1].credentials).toBe('omit')
})
test.each([new Response('<svg/>', { headers: { 'content-type': 'image/svg+xml' } }), new Response('<html>unsafe</html>'), new Response(null, { status: 404 }), new Response('too large', { headers: { 'content-length': String(MAX_NEWS_IMAGE_BYTES + 1) } })])('image errors reject for the cover fallback', async response => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
  await expect(fetchNewsImage('https://example.com/image.png', new AbortController().signal)).rejects.toThrow()
})
