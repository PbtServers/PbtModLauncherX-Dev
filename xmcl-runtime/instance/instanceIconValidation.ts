import { fileTypeFromBuffer } from 'file-type'
import { inflateSync } from 'zlib'
import { validateInstanceGif } from './instanceGif'

const MAX_BYTES = 8 * 1024 * 1024
const MAX_PIXELS = 16777216

function dimensions(width: number, height: number) {
  if (!width || !height || width * height > MAX_PIXELS) throw new Error('Invalid or oversized instance icon dimensions')
}

function crc32(bytes: Buffer) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

/** Validate bounded image containers before writing. The renderer also decodes with its native image codec. */
export async function validateInstanceIconData(data: Buffer): Promise<string> {
  if (!data.length || data.length > MAX_BYTES) throw new Error('Instance icon exceeds maximum size of 8 MB or is empty')
  const type = await fileTypeFromBuffer(data).catch(() => undefined)
  if (!type) {
    const svg = data.toString('utf8').trim()
    if (!/^(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(svg) || !/(?:<\/svg>|\/>)\s*$/i.test(svg)) throw new Error('Instance icon is not an image')
    if (/<!DOCTYPE|<!ENTITY|<script|<foreignObject|\bon\w+\s*=|(?:href|url)\s*[=(]/i.test(svg)) throw new Error('Unsafe SVG icon')
    return 'svg'
  }
  const ext = type.ext
  if (!['png', 'jpg', 'webp', 'gif', 'bmp'].includes(ext)) throw new Error('Unsupported instance icon format')
  if (ext === 'png') {
    if (data.length < 45 || data.readUInt32BE(8) !== 13 || data.toString('ascii', 12, 16) !== 'IHDR') throw new Error('Invalid PNG icon')
    const width = data.readUInt32BE(16)
    const height = data.readUInt32BE(20)
    dimensions(width, height)
    const chunks: Buffer[] = []
    let offset = 8
    let ended = false
    while (offset + 12 <= data.length) {
      const size = data.readUInt32BE(offset)
      if (size > data.length - offset - 12) throw new Error('Truncated PNG icon')
      const tag = data.toString('ascii', offset + 4, offset + 8)
      if (crc32(data.subarray(offset + 4, offset + 8 + size)) !== data.readUInt32BE(offset + 8 + size)) throw new Error('Corrupt PNG icon')
      if (tag === 'IDAT') chunks.push(data.subarray(offset + 8, offset + 8 + size))
      offset += size + 12
      if (tag === 'IEND') { ended = size === 0 && offset === data.length; break }
    }
    if (!ended || !chunks.length) throw new Error('Incomplete PNG icon')
    const pixels = inflateSync(Buffer.concat(chunks), { maxOutputLength: MAX_PIXELS * 8 + 65536 })
    if (data[28] === 0) {
      const channels: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }
      const row = Math.ceil(width * (channels[data[25]] || 0) * data[24] / 8) + 1
      if (row <= 1 || pixels.length !== row * height) throw new Error('Invalid PNG pixel data')
      for (let i = 0; i < pixels.length; i += row) if (pixels[i] > 4) throw new Error('Invalid PNG filter')
    }
  } else if (ext === 'jpg') {
    if (!data.subarray(-2).equals(Buffer.from([0xff, 0xd9]))) throw new Error('Incomplete JPEG icon')
    let offset = 2
    let found = false
    while (offset + 4 <= data.length) {
      if (data[offset++] !== 0xff) throw new Error('Invalid JPEG segment')
      while (data[offset] === 0xff) offset++
      const marker = data[offset++]
      if (marker === 0xda || marker === 0xd9) break
      const size = data.readUInt16BE(offset)
      if (size < 2 || size > data.length - offset) throw new Error('Truncated JPEG icon')
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        if (size < 8) throw new Error('Invalid JPEG dimensions')
        dimensions(data.readUInt16BE(offset + 5), data.readUInt16BE(offset + 3))
        found = true
      }
      offset += size
    }
    if (!found) throw new Error('Missing JPEG dimensions')
  } else if (ext === 'webp') {
    if (data.length < 20 || data.readUInt32LE(4) + 8 !== data.length) throw new Error('Incomplete WebP icon')
    const tag = data.toString('ascii', 12, 16)
    const size = data.readUInt32LE(16)
    if (size > data.length - 20) throw new Error('Invalid WebP chunk')
    if (tag === 'VP8X' && size >= 10) dimensions(data.readUIntLE(24, 3) + 1, data.readUIntLE(27, 3) + 1)
    else if (tag === 'VP8 ' && size >= 10 && data.subarray(23, 26).equals(Buffer.from([0x9d, 0x01, 0x2a]))) dimensions(data.readUInt16LE(26) & 0x3fff, data.readUInt16LE(28) & 0x3fff)
    else if (tag === 'VP8L' && size >= 5 && data[20] === 0x2f) {
      const bits = data.readUInt32LE(21)
      dimensions((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1)
    } else throw new Error('Invalid WebP image header')
  } else if (ext === 'gif') {
    if (data.length < 14 || data[data.length - 1] !== 0x3b) throw new Error('Incomplete GIF icon')
    dimensions(data.readUInt16LE(6), data.readUInt16LE(8))
    validateInstanceGif(data)
  } else {
    if (data.length < 26 || data.readUInt32LE(2) !== data.length) throw new Error('Invalid BMP icon')
    if (data.readUInt32LE(14) === 12) dimensions(data.readUInt16LE(18), data.readUInt16LE(20))
    else if (data.length >= 54) dimensions(Math.abs(data.readInt32LE(18)), Math.abs(data.readInt32LE(22)))
    else throw new Error('Invalid BMP header')
  }
  return ext
}
