import type { MediaData } from '@xmcl/runtime-api'

export function mediaTitle(media?: MediaData) {
  if (!media) return ''
  if (media.name?.trim()) return media.name.trim()
  let path = media.url
  try {
    const url = new URL(media.url)
    path = url.searchParams.get('path') || url.pathname
  } catch { /* Older themes may store a local path. */ }
  const name = path.replaceAll('\\', '/').split('/').pop() || ''
  try { return decodeURIComponent(name) } catch { return name }
}
