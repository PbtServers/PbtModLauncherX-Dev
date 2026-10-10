import { expect, it } from 'vitest'
import { parseLauncherReleaseNews, PBT_RELEASE_NEWS_URL } from './launcherReleaseNews'

it('uses PbtServers releases without environment or account telemetry', () => {
  expect(PBT_RELEASE_NEWS_URL).toContain('/repos/PbtServers/PbtModLauncherX-Dev/')
  const release = { html_url: 'https://github.com/PbtServers/PbtModLauncherX-Dev/releases/tag/v1.0.6', published_at: '2026-01-01', name: 'PbtModLauncherX', body: 'Changes' }
  expect(parseLauncherReleaseNews([release])).toHaveLength(1)
  expect(parseLauncherReleaseNews([{ ...release, html_url: 'https://github.com/Voxelum/x-minecraft-launcher/releases/tag/1' }])).toEqual([])
  expect(parseLauncherReleaseNews(undefined)).toEqual([])
})
