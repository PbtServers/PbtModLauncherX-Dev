/** Decode text without ever rendering third-party HTML. */
export function newsText(value: string): string {
  const document = new DOMParser().parseFromString(value.replace(/<\/?(?:p|div|br|li|h[1-6])\b[^>]*>/gi, ' '), 'text/html')
  document.querySelectorAll('script, style').forEach(node => node.remove())
  return (document.body.textContent || '').replace(/\s+/g, ' ').trim()
}

export function uniqueNews<T extends { date: string }>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>()
  return [...items].filter(item => Number.isFinite(Date.parse(item.date)))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).filter(item => {
    const id = key(item)
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
    })
}

export async function officialNewsText(link: string, locale: string, originalTitle: string) {
  const language = locale.split('-')[0]
  if (language === 'en' || language === 'ca') return undefined
  const url = new URL(link)
  if (url.hostname !== 'www.minecraft.net' || !url.pathname.startsWith('/article/')) return undefined
  const region = language === 'es' ? 'es-es' : locale.toLowerCase()
  url.pathname = `/${region}${url.pathname}`
  url.search = ''
  const cacheKey = `minecraft-official-news-v2:${locale}:${link}:${originalTitle}`
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null')
    if (cached && cached.expires > Date.now()) return cached.text || undefined
  } catch { /* Storage is optional. */ }
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
  if (!response.ok) return undefined
  const document = new DOMParser().parseFromString(await response.text(), 'text/html')
  if (document.documentElement.lang.split('-')[0].toLowerCase() !== language) return undefined
  const title = document.querySelector('meta[property="og:title"]')?.getAttribute('content')
  const text = document.querySelector('meta[property="og:description"]')?.getAttribute('content')
  // Minecraft sometimes serves English copy under a localized URL.
  const words = (value: string) => new Set(newsText(value).toLowerCase().replace(/&/g, 'and').match(/[\p{L}\p{N}]+/gu) || [])
  const originalWords = words(originalTitle)
  const candidateWords = words(title || '')
  const overlap = [...originalWords].filter(word => candidateWords.has(word)).length / Math.max(originalWords.size, candidateWords.size, 1)
  const translated = title && text && overlap < 0.6 ? { title: newsText(title), text: newsText(text) } : undefined
  try { localStorage.setItem(cacheKey, JSON.stringify({ expires: Date.now() + 86400000 * 7, text: translated || null })) } catch { /* Storage is optional. */ }
  return translated
}
