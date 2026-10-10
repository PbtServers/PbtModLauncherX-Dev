import { describe, expect, it } from 'vitest'
import { validateInstanceGif } from './instanceGif'

const animated = Buffer.from('R0lGODlhEAAQAIEAACR0zAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQAMgAAACwAAAAAEAAQAAAIHQABCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFgQEBACH5BAEyAAEALAAAAAAQABAAgeaiPAAAAAAAAAAAAAgdAAEIHEiwoMGDCBMqXMiwocOHECNKnEixosWBAQEAOw==', 'base64')
const still = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64')
describe('GIF instance icon blocks', () => {
  it('recognizes static and animated GIFs without altering their bytes', () => {
    const copy = Buffer.from(animated)
    expect(validateInstanceGif(animated)).toBe(2)
    expect(validateInstanceGif(still)).toBe(1)
    expect(animated).toEqual(copy)
  })
  it('rejects corrupt frames even with a valid trailer', () => {
    const damaged = Buffer.from(animated)
    const offset = damaged.indexOf(Buffer.from([0x2c, 0, 0, 0, 0, 16, 0, 16, 0]))
    damaged.writeUInt16LE(65535, offset + 5)
    expect(() => validateInstanceGif(damaged)).toThrow('dimensions')
    expect(() => validateInstanceGif(Buffer.concat([animated.subarray(0, 100), Buffer.from([0x3b])]))).toThrow()
  })
  it('rejects header-only images and missing terminators', () => {
    expect(() => validateInstanceGif(Buffer.concat([still.subarray(0, 13), Buffer.from([0x3b])]))).toThrow()
    expect(() => validateInstanceGif(animated.subarray(0, -1))).toThrow()
  })
  it('rejects excessive frame counts', () => {
    const frame = still.subarray(19, -1)
    const many = Buffer.concat([still.subarray(0, 19), ...Array.from({ length: 257 }, () => frame), Buffer.from([0x3b])])
    expect(() => validateInstanceGif(many)).toThrow('resource limits')
  })
})
