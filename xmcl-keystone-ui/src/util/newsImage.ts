export const MAX_NEWS_IMAGE_BYTES = 8 * 1024 * 1024
export function newsImageMime(bytes: Uint8Array) {
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)) return 'image/png'
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg'
  if (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp'
  return undefined
}
export async function fetchNewsImage(url: string, signal: AbortSignal): Promise<Blob> {
  const response = await fetch(url, { signal, redirect: 'error', credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'default' })
  if (!response.ok || Number(response.headers.get('content-length')) > MAX_NEWS_IMAGE_BYTES) { await response.body?.cancel(); throw new Error('News image unavailable or too large') }
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Missing image body')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.length
      if (size > MAX_NEWS_IMAGE_BYTES) { await reader.cancel(); throw new Error('Image size limit') }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  const mime = newsImageMime(bytes)
  const declared = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
  if (!mime || declared && declared !== mime && declared !== 'application/octet-stream') throw new Error('Unsupported image format')
  return new Blob([bytes], { type: mime })
}
