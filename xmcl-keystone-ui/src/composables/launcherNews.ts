import { parseLauncherReleaseNews, PBT_RELEASE_NEWS_URL } from '@/util/launcherReleaseNews'
import useSWRV from 'swrv'
import { useSWRVConfig } from './swrvConfig'
import { fetchNewsFeed } from '@/util/newsCache'
import { createCustomNewsLoader, customNewsForLocale, mergeLauncherNews, CUSTOM_NEWS_TTL, CUSTOM_NEWS_MAX_AGE, type CustomNewsEntry } from '@/util/customLauncherNews'
import { onMounted, onUnmounted } from 'vue'

let customLoader: ReturnType<typeof createCustomNewsLoader> | undefined

export interface LauncherNews {
  id?: string
  source?: 'release' | 'custom'
  version?: string
  featured?: boolean
  imageRevision?: number
  category: string
  image: {
    url: string
    width: number
    height: number
  }
  date: string
  title: string
  description: string
  link: string
}

export function useLauncherNews() {
  const { locale } = useI18n()
  const offline = ref(false)
  let savedCheckedAt = 0
  try { savedCheckedAt = Number(localStorage.getItem('pbt-releases-checked-at') || 0) } catch { /* Optional storage. */ }
  const releaseCheckedAt = ref(savedCheckedAt)
  const now = ref(Date.now())
  const custom = ref<CustomNewsEntry[]>([])
  const imageRevision = ref(0)
  customLoader ||= createCustomNewsLoader({ getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value), removeItem: key => localStorage.removeItem(key) })
  const refreshCustom = async (force = false) => { custom.value = await customLoader!.load(force); imageRevision.value = customLoader!.checkedAt(); now.value = Date.now() }
  const { data, error, isValidating, mutate } = useSWRV<unknown[]>('/launcher-releases-v3', async () => {
    return fetchNewsFeed(PBT_RELEASE_NEWS_URL, 'pbt-last-published-releases-v1', releases => {
      if (!Array.isArray(releases)) throw new Error('Invalid GitHub releases')
      return releases
    }, value => { offline.value = value }, async () => {
      const releases: unknown[] = []
      const signal = AbortSignal.timeout(8000)
      for (let page = 1; page <= 5; page++) {
        const url = new URL(PBT_RELEASE_NEWS_URL)
        url.searchParams.set('per_page', '100')
        url.searchParams.set('page', String(page))
        const response = await fetch(url, { signal, cache: 'no-cache' })
        if (!response.ok) throw new Error(`GitHub releases: ${response.status}`)
        const batch = await response.json()
        if (!Array.isArray(batch)) throw new Error('Invalid GitHub releases')
        releases.push(...batch)
        if (batch.length < 100) break
      }
      releaseCheckedAt.value = Date.now()
      now.value = releaseCheckedAt.value
      try { localStorage.setItem('pbt-releases-checked-at', String(releaseCheckedAt.value)) } catch { /* Optional cache metadata. */ }
      return releases
    })
  }, useSWRVConfig())
  const news = computed(() => {
    const age = now.value - releaseCheckedAt.value
    return mergeLauncherNews(parseLauncherReleaseNews(data.value, locale.value), customNewsForLocale(custom.value, age >= 0 && age < CUSTOM_NEWS_MAX_AGE ? data.value : [], locale.value, now.value, imageRevision.value))
  })
  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    void refreshCustom()
    timer = setInterval(() => { now.value = Date.now(); void refreshCustom(); void mutate() }, CUSTOM_NEWS_TTL)
  })
  onUnmounted(() => clearInterval(timer))
  return {
    news,
    isValidating,
    mutate: async () => { now.value = Date.now(); await Promise.all([mutate(), refreshCustom(true)]) },
    error: computed(() => error.value || offline.value),
  }
}
