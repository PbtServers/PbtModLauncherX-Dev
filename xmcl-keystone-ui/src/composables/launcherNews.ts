import { parseLauncherReleaseNews, PBT_RELEASE_NEWS_URL } from '@/util/launcherReleaseNews'
import useSWRV from 'swrv'
import { useSWRVConfig } from './swrvConfig'

export interface LauncherNews {
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
  const { data, error, isValidating, mutate } = useSWRV<LauncherNews[]>('/launcher-news', async () => {
    const response = await fetch(PBT_RELEASE_NEWS_URL, { signal: AbortSignal.timeout(8_000) })
    return response.ok ? parseLauncherReleaseNews(await response.json()) : []
  }, useSWRVConfig())
  const news = computed(() => data.value || [] as LauncherNews[])
  return {
    news,
    isValidating,
    mutate,
    error,
  }
}
