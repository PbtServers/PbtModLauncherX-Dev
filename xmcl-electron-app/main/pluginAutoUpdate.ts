import { BaseService, LauncherAppPlugin } from '@xmcl/runtime/app'
import { kSettings } from '~/settings'
import { ElectronUpdater } from './utils/updater'

export const pluginAutoUpdate: LauncherAppPlugin = async (app) => {
  // E2E hook: skip the auto-updater entirely when running under Playwright.
  // The updater hits real network endpoints and would otherwise add nondeterminism.
  if (process.env.XMCL_E2E) {
    return
  }
  const state = await app.registry.get(kSettings)
  if (!(app.updater instanceof ElectronUpdater)) return
  const hostUpdater = app.updater
  const sync = () => {
    // Keep stored preferences, but never let electron-updater download or
    // install before the host has approved and verified the exact release.
    hostUpdater.syncUpdatePreferences(state)
    if (!state.autoDownload || state.updateStatus !== 'pending' || state.updateInfo?.operation === 'manual' || app.disposed) return
    void app.registry.get(BaseService).then(service => service.downloadUpdate()).catch(() => {
      app.getLogger('ElectronUpdater').warn('Automatic update download failed; retry from Settings.')
    })
  }
  const events = ['autoInstallOnAppQuitSet', 'allowPrereleaseSet', 'autoDownloadSet', 'config', 'updateStatusSet'] as const
  for (const event of events) state.subscribe(event, sync)
  app.registryDisposer(() => { for (const event of events) state.unsubscribe(event, sync) })
  sync()
}
