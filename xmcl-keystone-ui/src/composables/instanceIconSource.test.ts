import { effectScope, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { isGifIcon, snapshotGifIcon, useInstanceIconSource } from './instanceIconSource'
vi.mock('@vueuse/core', () => ({ usePreferredReducedMotion: () => preference }))
const preference = ref<'reduce' | 'no-preference'>('no-preference')
afterEach(() => { preference.value = 'no-preference'; vi.unstubAllGlobals() })
describe('instance GIF display policy', () => {
  it('identifies encoded local URLs and GIF data', () => {
    expect(isGifIcon('http://launcher/media?path=G%3A%5Cicon.gif&revision=3')).toBe(true)
    expect(isGifIcon('data:image/gif;base64,AAAA')).toBe(true)
    expect(isGifIcon('https://example.com/icon.gif?rev=3')).toBe(true)
    expect(isGifIcon('https://example.com/icon.png')).toBe(false)
  })
  it('preserves the animated source without reduced motion', () => {
    const scope = effectScope()
    const snapshot = vi.fn()
    const displayed = scope.run(() => useInstanceIconSource(() => 'https://example.com/icon.gif', snapshot))!
    expect(displayed.value).toBe('https://example.com/icon.gif')
    expect(snapshot).not.toHaveBeenCalled()
    scope.stop()
  })
  it('uses a display-only still and responds to preference changes', async () => {
    preference.value = 'reduce'
    const scope = effectScope()
    const snapshot = vi.fn().mockResolvedValue('data:image/png;base64,still')
    const displayed = scope.run(() => useInstanceIconSource(() => 'https://example.com/icon.gif', snapshot))!
    await vi.waitFor(() => expect(displayed.value).toBe('data:image/png;base64,still'))
    preference.value = 'no-preference'
    await nextTick()
    expect(displayed.value).toBe('https://example.com/icon.gif')
    scope.stop()
  })
  it.each(['png', 'jpg', 'webp', 'bmp', 'svg'])('keeps %s unchanged with reduced motion', (ext) => {
    preference.value = 'reduce'
    const scope = effectScope()
    const snapshot = vi.fn()
    const url = `https://example.com/icon.${ext}`
    const displayed = scope.run(() => useInstanceIconSource(() => url, snapshot))!
    expect(displayed.value).toBe(url)
    expect(snapshot).not.toHaveBeenCalled()
    scope.stop()
  })
  it('ignores a previous snapshot after switching instances or icons', async () => {
    preference.value = 'reduce'
    const source = ref('https://example.com/old.gif')
    let finish!: (value: string) => void
    const scope = effectScope()
    const displayed = scope.run(() => useInstanceIconSource(() => source.value, () => new Promise((resolve) => { finish = resolve })))!
    source.value = 'https://example.com/new.png'
    await nextTick()
    finish('old still')
    await nextTick()
    expect(displayed.value).toBe(source.value)
    scope.stop()
  })
  it('does not fall back to animation when a reduced-motion snapshot fails', async () => {
    preference.value = 'reduce'
    const scope = effectScope()
    const snapshot = vi.fn().mockRejectedValue(new Error('CORS or codec error'))
    const displayed = scope.run(() => useInstanceIconSource(() => 'https://example.com/icon.gif', snapshot))!
    await vi.waitFor(() => expect(snapshot).toHaveBeenCalled())
    await nextTick()
    expect(displayed.value).toBe('')
    scope.stop()
  })
  it('captures a bounded still and releases the temporary animated image', async () => {
    const instances: any[] = []
    const drawImage = vi.fn()
    const canvas = { width: 0, height: 0, getContext: () => ({ drawImage }), toDataURL: () => 'data:image/png;base64,snapshot' }
    vi.stubGlobal('document', { createElement: () => canvas })
    vi.stubGlobal('Image', class {
      naturalWidth = 512
      naturalHeight = 256
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      current = ''
      constructor() { instances.push(this) }
      set src(value: string) { this.current = value; if (value) queueMicrotask(() => this.onload?.()) }
    })
    await expect(snapshotGifIcon('https://example.com/animated.gif')).resolves.toBe('data:image/png;base64,snapshot')
    expect(canvas.width).toBe(128)
    expect(canvas.height).toBe(64)
    expect(drawImage).toHaveBeenCalledOnce()
    expect(instances[0].current).toBe('')
  })
  it('cancels the temporary image when its instance leaves the screen', async () => {
    const controller = new AbortController()
    vi.stubGlobal('Image', class { src = ''; onload = null; onerror = null })
    const pending = snapshotGifIcon('https://example.com/slow.gif', controller.signal)
    controller.abort()
    await expect(pending).resolves.toBe('')
  })
})
