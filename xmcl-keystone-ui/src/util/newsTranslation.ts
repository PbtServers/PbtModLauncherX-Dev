// Public text only. MyMemory's documented GET API needs no private key.
// https://mymemory.translated.net/doc/spec.php (500 UTF-8 bytes per segment).
const prefix = 'minecraft-news-translation-v2:'
const pending = new Map<string, Promise<string>>()
let queue = Promise.resolve()
let blockedUntil = 0

export async function translateNewsText(text: string, locale: string): Promise<string> {
  const language = locale.split('-')[0]
  if (!text || language === 'en') return text
  const key = prefix + JSON.stringify([language, text])
  try { const cached = localStorage.getItem(key); if (cached) return cached } catch { /* Storage can be unavailable. */ }
  const existing = pending.get(key)
  if (existing) return existing
  const request = queue.then(async () => {
    if (Date.now() < blockedUntil) throw new Error('Translation temporarily unavailable')
    const terms: string[] = []
    const protectedText = text.replace(/(?<=: )[^.!?]+$|\b(?:Minecraft(?: Java Edition)?|Java Realms|Realms|Herdcraft|Craftmine|Bedrock|Mojang|Microsoft|Creeper|Nether|Overworld|End|Qwen3|Ollama|Fabric|NeoForge|\d+(?:\.\d+)+(?:[-\w]*)?)\b/g, term => {
      terms.push(term)
      return `ZXQ${terms.length - 1}QXZ`
    })
    const chunks: string[] = []
    let chunk = ''
    for (const word of protectedText.split(/(?<=\s)/)) {
      if (new TextEncoder().encode(chunk + word).length > 480 && chunk) { chunks.push(chunk); chunk = '' }
      if (new TextEncoder().encode(word).length > 480) throw new Error('Translation segment too long')
      chunk += word
    }
    if (chunk) chunks.push(chunk)
    const translated: string[] = []
    for (const segment of chunks) {
      const url = new URL('https://api.mymemory.translated.net/get')
      url.searchParams.set('q', segment)
      url.searchParams.set('langpair', `en|${language}`)
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!response.ok) throw new Error('Translation request failed')
      const result = await response.json()
      if (Number(result.responseStatus) !== 200 || result.quotaFinished || typeof result.responseData?.translatedText !== 'string') throw new Error('Translation unavailable')
      translated.push(result.responseData.translatedText)
    }
    let result = translated.join(' ')
    for (const [index, term] of terms.entries()) {
      const marker = `ZXQ${index}QXZ`
      if (!result.includes(marker)) throw new Error('Translation changed a protected term')
      result = result.replaceAll(marker, term)
    }
    try { localStorage.setItem(key, result) } catch { /* Keep the in-memory result. */ }
    return result
  })
  queue = request.then(() => undefined, () => { blockedUntil = Date.now() + 60000 })
  pending.set(key, request)
  try { return await request } finally { pending.delete(key) }
}
