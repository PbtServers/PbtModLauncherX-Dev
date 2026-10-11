/** Validate GIF block boundaries and bound animation work without rewriting any bytes. */
export function validateInstanceGif(data: Buffer): number {
  if (data.length < 14) throw new Error('Incomplete GIF icon')
  const width = data.readUInt16LE(6)
  const height = data.readUInt16LE(8)
  if (!width || !height) throw new Error('Invalid GIF dimensions')
  let offset = 13 + ((data[10] & 0x80) ? 3 * (1 << ((data[10] & 7) + 1)) : 0)
  let frames = 0
  function blocks() {
    let bytes = 0
    while (offset < data.length) {
      const size = data[offset++]
      if (!size) return bytes
      if (offset + size > data.length) throw new Error('Truncated GIF block')
      offset += size
      bytes += size
    }
    throw new Error('Incomplete GIF blocks')
  }
  while (offset < data.length) {
    const tag = data[offset++]
    if (tag === 0x3b) {
      if (!frames || offset !== data.length) throw new Error('Invalid GIF trailer')
      return frames
    }
    if (tag === 0x21) {
      if (offset >= data.length) throw new Error('Incomplete GIF extension')
      const label = data[offset++]
      if (label === 0xf9 && (data[offset] !== 4 || offset + 6 > data.length || data[offset + 5] !== 0)) throw new Error('Invalid GIF control extension')
      blocks()
    } else if (tag === 0x2c) {
      if (offset + 9 > data.length) throw new Error('Incomplete GIF frame')
      const left = data.readUInt16LE(offset)
      const top = data.readUInt16LE(offset + 2)
      const frameWidth = data.readUInt16LE(offset + 4)
      const frameHeight = data.readUInt16LE(offset + 6)
      const packed = data[offset + 8]
      if (!frameWidth || !frameHeight || left + frameWidth > width || top + frameHeight > height) throw new Error('Invalid GIF frame dimensions')
      offset += 9 + ((packed & 0x80) ? 3 * (1 << ((packed & 7) + 1)) : 0)
      if (offset >= data.length || data[offset] < 2 || data[offset] > 8) throw new Error('Invalid GIF LZW header')
      offset++
      if (!blocks()) throw new Error('Empty GIF frame')
      frames++
      if (frames > 256 || frames * width * height > 8388608) throw new Error('GIF animation exceeds icon resource limits')
    } else throw new Error('Invalid GIF block')
  }
  throw new Error('Incomplete GIF icon')
}
