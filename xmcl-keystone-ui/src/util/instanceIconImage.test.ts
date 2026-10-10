import { afterEach, describe, expect, it, vi } from 'vitest'
import { validateInstanceIconImage } from './instanceIconImage'

describe('instance icon decoding', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })
  function mockImage(width: number, height: number, error = false) {
    vi.stubGlobal('Image', class {
      naturalWidth = width
      naturalHeight = height
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_value: string) { queueMicrotask(() => error ? this.onerror?.() : this.onload?.()) }
    })
  }
  it('accepts a decoded image', async () => {
    mockImage(64, 64)
    await expect(validateInstanceIconImage('http://launcher/media?path=test')).resolves.toBeUndefined()
  })
  it.each([[0, 0], [100000, 100000], [1, 1]])('rejects invalid dimensions or decoder failure (%i × %i)', async (width, height) => {
    mockImage(width, height, width === 1)
    await expect(validateInstanceIconImage('invalid.png')).rejects.toThrow()
  })
  it('times out if loading never completes', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('Image', class { onload = null; onerror = null; src = '' })
    const result = expect(validateInstanceIconImage('unreachable.png')).rejects.toThrow()
    await vi.advanceTimersByTimeAsync(10000)
    await result
  })
})
