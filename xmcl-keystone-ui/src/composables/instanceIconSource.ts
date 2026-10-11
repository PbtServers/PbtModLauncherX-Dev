import { ref, watch } from 'vue'
import { useLowResourceMode } from './lowResource'

export function isGifIcon(url: string): boolean {
  if (url.startsWith('data:image/gif;')) return true
  try {
    const parsed = new URL(url)
    return /\.gif$/i.test(parsed.searchParams.get('path') || parsed.pathname)
  } catch { return /\.gif$/i.test(url) }
}

/** A display-only snapshot. Never replaces the original GIF on disk. */
export function snapshotGifIcon(url: string, signal?: AbortSignal): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image()
    const timer = setTimeout(() => finish(''), 5000)
    const abort = () => finish('')
    function finish(result: string) {
      clearTimeout(timer)
      image.onload = null
      image.onerror = null
      signal?.removeEventListener('abort', abort)
      image.src = ''
      resolve(result)
    }
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      try {
        if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 16777216) return finish('')
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, 128 / Math.max(image.naturalWidth, image.naturalHeight))
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
        const context = canvas.getContext('2d')
        if (!context) return finish('')
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        finish(canvas.toDataURL('image/png'))
      } catch { finish('') }
    }
    image.onerror = () => finish('')
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) return finish('')
    image.src = url
  })
}

export function useInstanceIconSource(source: () => string | undefined, snapshot = snapshotGifIcon) {
  const { reducedMotion: motion } = useLowResourceMode()
  const displayed = ref('')
  watch([source, motion], async ([url, preference], _old, cleanup) => {
    let current = true
    const controller = new AbortController()
    cleanup(() => { current = false; controller.abort() })
    if (!url || !preference || !isGifIcon(url)) {
      displayed.value = url || ''
      return
    }
    displayed.value = ''
    const still = await snapshot(url, controller.signal).catch(() => '')
    if (current) displayed.value = still
  }, { immediate: true })
  return displayed
}
