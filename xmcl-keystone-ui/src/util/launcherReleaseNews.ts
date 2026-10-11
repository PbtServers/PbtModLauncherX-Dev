import editorial from '../assets/launcherNews.json'
import { uniqueNews } from './newsText'

export const PBT_RELEASE_NEWS_URL = 'https://api.github.com/repos/PbtServers/PbtModLauncherX-Dev/releases?per_page=5'

export function parseLauncherReleaseNews(input: unknown, locale = 'en') {
  if (!Array.isArray(input)) return []
  return uniqueNews(input.filter(release => release && !release.draft && typeof release.html_url === 'string' &&
    release.html_url.startsWith('https://github.com/PbtServers/PbtModLauncherX-Dev/releases/') &&
    typeof release.published_at === 'string' && Number.isFinite(Date.parse(release.published_at)))
    .map(release => {
      const version = String(release.tag_name || '').replace(/^v/, '')
      const content = (editorial as Record<string, Record<string, { title: string; description: string }>>)[version]
      const text = content?.[locale] || content?.en
      return {
        id: `release:${release.html_url}`,
        source: 'release' as const,
        category: 'PbtModLauncherX',
        image: { url: 'http://launcher/icons/logoDark', width: 256, height: 256 },
        date: release.published_at as string,
        title: text?.title || `PbtModLauncherX ${version}`,
        description: text?.description || '',
        link: release.html_url as string,
      }
    }), item => item.link).slice(0, 5)
}
