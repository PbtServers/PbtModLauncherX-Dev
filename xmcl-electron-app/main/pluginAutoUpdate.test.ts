import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@xmcl/runtime/app', () => ({ BaseService: class {} }))
vi.mock('./utils/updater', () => ({ ElectronUpdater: class { syncUpdatePreferences = vi.fn() } }))
import { pluginAutoUpdate } from './pluginAutoUpdate'
import { ElectronUpdater } from './utils/updater'

beforeEach(() => { vi.clearAllMocks() })
function setup(operation = 'manual', status = 'pending') {
  const subscriptions = new Map<string, () => void>()
  const state = {
    autoDownload: true, autoInstallOnAppQuit: true, allowPrerelease: false,
    updateStatus: status, updateInfo: { operation },
    subscribe: (name: string, fn: () => void) => { subscriptions.set(name, fn) },
    unsubscribe: (name: string) => { subscriptions.delete(name) },
  }
  const downloadUpdate = vi.fn(async () => {})
  const updater = new ElectronUpdater({} as never)
  const app = {
    updater, disposed: false, registry: { get: vi.fn().mockResolvedValueOnce(state).mockResolvedValue({ downloadUpdate }) },
    registryDisposer: vi.fn(), getLogger: () => ({ warn: vi.fn() }),
  }
  return { app, updater, state, downloadUpdate, subscriptions }
}
describe('controlled automatic updates', () => {
  it('preserves settings and never automatically opens the manual download website', async () => {
    const { app, updater, state, downloadUpdate } = setup()
    await pluginAutoUpdate(app as never, {} as never)
    expect(updater.syncUpdatePreferences).toHaveBeenCalledWith(state)
    expect(downloadUpdate).not.toHaveBeenCalled()
    expect(state.autoDownload).toBe(true)
    expect(state.autoInstallOnAppQuit).toBe(true)
  })
  it('routes a pending automatic release through BaseService verification and removes subscriptions on disposal', async () => {
    const { app, downloadUpdate, subscriptions } = setup('autoupdater')
    await pluginAutoUpdate(app as never, {} as never)
    await Promise.resolve()
    expect(downloadUpdate).toHaveBeenCalledOnce()
    const disposer = app.registryDisposer.mock.calls[0][0]
    disposer()
    expect(subscriptions.size).toBe(0)
  })
  it('does not re-download ready updates or operate on a disposed launcher', async () => {
    const { app, downloadUpdate, subscriptions } = setup('autoupdater', 'ready')
    await pluginAutoUpdate(app as never, {} as never)
    app.disposed = true
    subscriptions.get('autoDownloadSet')!()
    expect(downloadUpdate).not.toHaveBeenCalled()
  })
})
