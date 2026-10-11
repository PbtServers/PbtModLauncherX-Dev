import { expect, it } from 'vitest'
import { parseLauncherReleaseNews, PBT_RELEASE_NEWS_URL } from './launcherReleaseNews'

it('uses PbtServers releases without environment or account telemetry', () => {
  expect(PBT_RELEASE_NEWS_URL).toContain('/repos/PbtServers/PbtModLauncherX-Dev/')
  const release = { html_url: 'https://github.com/PbtServers/PbtModLauncherX-Dev/releases/tag/v1.0.6', published_at: '2026-01-01', name: 'PbtModLauncherX', body: 'Changes' }
  expect(parseLauncherReleaseNews([release])).toHaveLength(1)
  expect(parseLauncherReleaseNews([{ ...release, html_url: 'https://github.com/Voxelum/x-minecraft-launcher/releases/tag/1' }])).toEqual([])
  expect(parseLauncherReleaseNews(undefined)).toEqual([])
})

it('uses bundled copy only for published versions and responds to language changes', () => {
  const release = { tag_name: 'v1.0.7', html_url: 'https://github.com/PbtServers/PbtModLauncherX-Dev/releases/tag/v1.0.7', published_at: '2026-10-11', draft: false }
  expect(parseLauncherReleaseNews([release], 'ca')[0].title).toContain('nova etapa')
  expect(parseLauncherReleaseNews([release], 'es-ES')[0].title).toContain('nueva etapa')
  expect(parseLauncherReleaseNews([release], 'en')[0].title).toContain('new chapter')
  expect(parseLauncherReleaseNews([{ ...release, draft: true }])).toEqual([])
  expect(parseLauncherReleaseNews([])).toEqual([])
})

it('deduplicates release URLs, rejects invalid dates and sorts newest first', () => {
  const release = { html_url: 'https://github.com/PbtServers/PbtModLauncherX-Dev/releases/tag/v1.0.6', published_at: '2026-01-01' }
  const newer = { ...release, html_url: release.html_url.replace('1.0.6', '1.0.7'), published_at: '2026-10-11' }
  const result = parseLauncherReleaseNews([release, newer, release, { ...release, published_at: 'invalid' }])
  expect(result).toHaveLength(2)
  expect(result[0].link).toBe(newer.html_url)
})
