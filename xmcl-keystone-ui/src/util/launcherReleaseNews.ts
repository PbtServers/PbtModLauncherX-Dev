export const PBT_RELEASE_NEWS_URL = 'https://api.github.com/repos/PbtServers/PbtModLauncherX-Dev/releases?per_page=5'

export function parseLauncherReleaseNews(input: unknown) {
  if (!Array.isArray(input)) return []
  return input.filter(release => release && !release.draft && typeof release.html_url === 'string' &&
    release.html_url.startsWith('https://github.com/PbtServers/PbtModLauncherX-Dev/releases/') &&
    typeof release.published_at === 'string' && Number.isFinite(Date.parse(release.published_at)))
    .slice(0, 5).map(release => ({
      category: 'PbtModLauncherX',
      image: { url: 'http://launcher/icons/logoDark', width: 256, height: 256 },
      date: release.published_at as string,
      title: typeof release.name === 'string' ? release.name : 'PbtModLauncherX',
      description: typeof release.body === 'string' ? release.body.slice(0, 400) : '',
      link: release.html_url as string,
    }))
}
