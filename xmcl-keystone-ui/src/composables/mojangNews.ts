import useSWRV from 'swrv'
import { useSWRVConfig } from './swrvConfig'
import { newsText, uniqueNews, officialNewsText } from '@/util/newsText'
import { translateNewsText } from '@/util/newsTranslation'
import { fetchNewsFeed } from '@/util/newsCache'

export interface PlayPageImage {
  title: string
  url: string
}

export interface NewsPageImage {
  title: string
  url: string
  dimensions: {
    width: number
    height: number
  }

}
export interface NewsItem {
  title: string
  tag: string
  category: string
  date: string
  text: string
  playPageImage: PlayPageImage
  newsPageImage: NewsPageImage
  readMoreLink: string
  cardBorder: boolean
  newsType: string[]
  id: string
}
export function useMojangNews() {
  const { locale } = useI18n()
  const offline = ref(false)
  const { data, error, isValidating, mutate } = useSWRV('/minecraft-news-v2', async () => {
    return fetchNewsFeed('https://launchercontent.mojang.com/v2/news.json', 'minecraft-last-news-v1', input => {
      const result = input as { version: number; entries: NewsItem[] }
      if (result?.version !== 1 || !Array.isArray(result.entries)) throw new Error('Unsupported Minecraft news format')
      const entries = result.entries.filter(e => e.category === 'Minecraft: Java Edition').map(e => ({
        ...e,
        title: newsText(e.title),
        text: newsText(e.text),
        readMoreLink: new URL(e.readMoreLink, 'https://www.minecraft.net').toString(),
        newsPageImage: { ...e.newsPageImage, url: new URL(e.newsPageImage.url, 'https://launchercontent.mojang.com').toString() },
        playPageImage: { ...e.playPageImage, url: new URL(e.playPageImage.url, 'https://launchercontent.mojang.com').toString() },
      }))
      return uniqueNews(entries, entry => { const url = new URL(entry.readMoreLink); return url.origin + url.pathname }).slice(0, 8)
    }, value => { offline.value = value })
  }, useSWRVConfig())
  const news = ref<NewsItem[]>([])
  const translating = ref(false)
  const translationError = ref(false)
  let generation = 0
  watch([data, locale], async ([entries, language]) => {
    const current = ++generation
    news.value = entries || []
    translationError.value = false
    translating.value = language.split('-')[0] !== 'en' && !!entries?.length
    const localized: NewsItem[] = []
    for (const entry of entries || []) {
      if (current !== generation) return
      try {
        const official = await officialNewsText(entry.readMoreLink, language, entry.title).catch(() => undefined)
        if (current !== generation) return
        const title = official?.title || newsText(await translateNewsText(entry.title, language))
        if (current !== generation) return
        const text = official?.text || newsText(await translateNewsText(entry.text, language))
        if (current !== generation) return
        localized.push({ ...entry, title, text })
      } catch {
        localized.push(entry)
        if (current === generation) translationError.value = true
      }
    }
    if (current === generation) {
      news.value = localized
      translating.value = false
    }
  }, { immediate: true })
  return {
    news,
    isValidating,
    mutate,
    error: computed(() => error.value || offline.value),
    translating,
    translationError,
  }
}
