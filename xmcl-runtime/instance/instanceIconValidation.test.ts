import { describe, expect, it } from 'vitest'
import { validateInstanceIconData } from './instanceIconValidation'

describe('instance icon content validation', () => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  it('detects damaged PNG data even when the header and extension are valid', async () => {
    const corrupt = Buffer.from(png)
    corrupt[45] ^= 1
    await expect(validateInstanceIconData(corrupt)).rejects.toThrow('Corrupt PNG')
  })
  it('rejects a huge PNG before decompression', async () => {
    const huge = Buffer.from(png)
    huge.writeUInt32BE(100000, 16)
    huge.writeUInt32BE(100000, 20)
    await expect(validateInstanceIconData(huge)).rejects.toThrow('dimensions')
  })
  it('supports a complete BMP and rejects its truncated copy', async () => {
    const bmp = Buffer.alloc(58)
    bmp.write('BM')
    bmp.writeUInt32LE(58, 2)
    bmp.writeUInt32LE(54, 10)
    bmp.writeUInt32LE(40, 14)
    bmp.writeInt32LE(1, 18)
    bmp.writeInt32LE(1, 22)
    bmp.writeUInt16LE(1, 26)
    bmp.writeUInt16LE(24, 28)
    bmp.writeUInt32LE(4, 34)
    await expect(validateInstanceIconData(bmp)).resolves.toBe('bmp')
    await expect(validateInstanceIconData(bmp.subarray(0, 55))).rejects.toThrow()
  })
  it('retains simple existing SVG icons including self-closing roots', async () => {
    await expect(validateInstanceIconData(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16"/></svg>'))).resolves.toBe('svg')
    await expect(validateInstanceIconData(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).resolves.toBe('svg')
  })
  it.each(['<svg onload="alert(1)"></svg>', '<svg><image href="file:///private.png"/></svg>', '<svg><foreignObject/></svg>', '<!DOCTYPE svg><svg></svg>', '<svg><script/></svg>', '<svg>'])('rejects unsafe or incomplete SVG %s', async (svg) => {
    await expect(validateInstanceIconData(Buffer.from(svg))).rejects.toThrow()
  })
  it('rejects empty and oversized files', async () => {
    await expect(validateInstanceIconData(Buffer.alloc(0))).rejects.toThrow()
    await expect(validateInstanceIconData(Buffer.alloc(8 * 1024 * 1024 + 1))).rejects.toThrow('maximum size')
  })
})
