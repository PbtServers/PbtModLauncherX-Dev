import { EventEmitter } from 'node:events'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('electron', () => ({ app: Object.assign(new EventEmitter(), { quit: vi.fn() }), shell: { openExternal: vi.fn(async () => {}) } }))
vi.mock('../constant', () => ({ HAS_DEV_SERVER: false }))
vi.mock('electron-updater', () => ({
  autoUpdater: Object.assign(new EventEmitter(), {
    setFeedURL: vi.fn(), checkForUpdates: vi.fn(), downloadUpdate: vi.fn(), quitAndInstall: vi.fn(),
  }),
  CancellationToken: class { cancel = vi.fn() },
}))
import { autoUpdater } from 'electron-updater'
import { app as electronApp, shell } from 'electron'
import { ElectronUpdater } from './updater'

const release = (version = '1.0.7') => ({ tag_name: `v${version}`, assets: [], body: 'PbtModLauncherX' })
function setup(appimage = false) {
  const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => Response.json(release()))
  const settings = { allowPrerelease: false, autoInstallOnAppQuit: false }
  const app = {
    version: '1.0.6', platform: { os: appimage ? 'linux' : 'windows', arch: 'x64' }, env: appimage ? 'appimage' : 'raw',
    fetch: fetcher, registry: { get: async () => settings }, getLogger: () => ({ log: vi.fn(), warn: vi.fn() }),
  }
  return { updater: new ElectronUpdater(app as never), fetcher, settings }
}
let directory: string
beforeEach(async () => {
  vi.clearAllMocks()
  electronApp.removeAllListeners('before-quit')
  const root = join(import.meta.dirname, '../../..', 'temp')
  await mkdir(root, { recursive: true })
  directory = await mkdtemp(join(root, 'phase12-host-test-'))
})
afterEach(async () => { if (directory) await rm(directory, { recursive: true, force: true }) })
describe('Electron updater integration with simulated hosts', () => {
  it('sets only the fork feed and disables implicit download/install/downgrade', () => {
    const { updater } = setup()
    updater.syncUpdatePreferences({ autoInstallOnAppQuit: true, allowPrerelease: false })
    expect(autoUpdater.setFeedURL).toHaveBeenCalledWith({ provider: 'github', owner: 'PbtServers', repo: 'PbtModLauncherX-Dev' })
    expect(autoUpdater.autoDownload).toBe(false)
    expect(autoUpdater.autoInstallOnAppQuit).toBe(false)
    expect(autoUpdater.allowDowngrade).toBe(false)
  })
  it('keeps an identical checked release reference, uses manual full packages when no runtime proof exists', async () => {
    const { updater } = setup()
    const info = await updater.checkUpdateTask()
    expect(info).toMatchObject({ newUpdate: true, operation: 'manual', name: '1.0.7' })
    expect(await updater.checkUpdateTask()).toBe(info)
    await updater.downloadUpdate(info)
    expect(shell.openExternal).toHaveBeenCalledWith('https://mods.pbtservers.com')
    await expect(updater.installUpdateAndQuit(info)).rejects.toThrow('verified first')
    expect(autoUpdater.quitAndInstall).not.toHaveBeenCalled()
  })
  it('rejects same version, downgrade and unchecked metadata', async () => {
    const { updater, fetcher } = setup()
    for (const version of ['1.0.6', '1.0.5']) {
      fetcher.mockImplementation(async () => Response.json(release(version)))
      const info = await updater.checkUpdateTask()
      expect(info.newUpdate).toBe(false)
      await expect(updater.downloadUpdate({ ...info, newUpdate: true })).rejects.toThrow('stale')
    }
  })
  it('rejects metadata modified after it was checked, even through a shared object reference', async () => {
    const { updater } = setup()
    const info = await updater.checkUpdateTask()
    info.files.push({ name: 'evil.exe', url: 'https://evil.example/file' })
    await expect(updater.downloadUpdate(info)).rejects.toThrow('stale')
    expect(shell.openExternal).not.toHaveBeenCalled()
  })
  it('falls back only to the existing PbtServers GitHub endpoint on invalid JSON', async () => {
    const { updater, fetcher } = setup()
    fetcher.mockResolvedValueOnce(new Response('invalid JSON'))
    await updater.checkUpdateTask()
    expect(fetcher.mock.calls[1][0]).toBe('https://api.github.com/repos/PbtServers/PbtModLauncherX-Dev/releases/latest')
  })
  it('does not let a stale raw manifest hide a newer official fork release', async () => {
    const { updater, fetcher } = setup()
    fetcher.mockResolvedValueOnce(Response.json(release('1.0.6'))).mockResolvedValueOnce(Response.json(release('1.0.7')))
    expect(await updater.checkUpdateTask()).toMatchObject({ name: '1.0.7', newUpdate: true })
  })
  it('rejects a development release if the user switches back to stable', async () => {
    const { updater, fetcher, settings } = setup()
    settings.allowPrerelease = true
    fetcher.mockImplementation(async () => Response.json(release('1.0.8-beta.1')))
    const info = await updater.checkUpdateTask()
    settings.allowPrerelease = false
    await expect(updater.downloadUpdate(info)).rejects.toThrow('selected channel')
    expect(shell.openExternal).not.toHaveBeenCalled()
  })
  it('serializes download attempts before asynchronous settings resolution', async () => {
    const { updater } = setup()
    const info = await updater.checkUpdateTask()
    const first = updater.downloadUpdate(info)
    await expect(updater.downloadUpdate(info)).rejects.toThrow('already running')
    await first
    expect(shell.openExternal).toHaveBeenCalledTimes(1)
  })
  it('never exposes response bodies or tokens when both authorized sources fail', async () => {
    const { updater, fetcher } = setup()
    fetcher.mockImplementation(async () => new Response('SECRET_FIXTURE', { status: 403 }))
    await expect(updater.checkUpdateTask()).rejects.toThrow('No valid PbtServers update manifest')
    expect(fetcher.mock.calls).toHaveLength(2)
  })
  it('rejects upstream AppImage metadata and a wrong architecture', async () => {
    const { updater } = setup(true)
    for (const url of ['xmcl-1.0.7-x64.AppImage', 'pbtmodlauncherx-1.0.7-arm64.AppImage', 'https://evil.example/file.AppImage']) {
      vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({ updateInfo: { version: '1.0.7', files: [{ url, sha512: createHash('sha512').update('fixture').digest('base64') }] } } as never)
      await expect(updater.checkUpdateTask()).rejects.toThrow('source')
    }
  })
  it('does not allow installation after failed AppImage download, permits retry and removes listeners', async () => {
    const { updater } = setup(true)
    vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({ updateInfo: {
      version: '1.0.7', releaseDate: '', files: [{ url: `pbtmodlauncherx-1.0.7-${process.arch}.AppImage`, sha512: createHash('sha512').update('fixture').digest('base64') }],
    } } as never)
    const info = await updater.checkUpdateTask()
    const path = join(directory, 'update.AppImage')
    vi.mocked(autoUpdater.downloadUpdate).mockRejectedValueOnce(new Error('Interrupted')).mockImplementationOnce(async () => {
      await writeFile(path, 'fixture')
      return [path]
    })
    await expect(updater.downloadUpdate(info)).rejects.toThrow('Interrupted')
    await expect(updater.installUpdateAndQuit(info)).rejects.toThrow('verified first')
    expect(autoUpdater.listenerCount('download-progress')).toBe(0)
    await updater.downloadUpdate(info)
    updater.syncUpdatePreferences({ autoInstallOnAppQuit: true, allowPrerelease: false })
    // Automatic installation is mediated by our before-quit verification, not
    // the library's unguarded quit handler.
    expect(autoUpdater.autoInstallOnAppQuit).toBe(false)
    updater.syncUpdatePreferences({ autoInstallOnAppQuit: false, allowPrerelease: false })
    expect(autoUpdater.autoInstallOnAppQuit).toBe(false)
    await updater.installUpdateAndQuit(info)
    expect(autoUpdater.quitAndInstall).toHaveBeenCalledTimes(1)
    expect(autoUpdater.listenerCount('download-progress')).toBe(0)
  })
  it('rejects a modified AppImage before installation and disables automatic quit installation', async () => {
    const { updater } = setup(true)
    const path = join(directory, 'update.AppImage')
    vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({ updateInfo: {
      version: '1.0.7', releaseDate: '', files: [{ url: `pbtmodlauncherx-1.0.7-${process.arch}.AppImage`, sha512: createHash('sha512').update('fixture').digest('base64') }],
    } } as never)
    vi.mocked(autoUpdater.downloadUpdate).mockImplementationOnce(async () => { await writeFile(path, 'fixture'); return [path] })
    const info = await updater.checkUpdateTask()
    await updater.downloadUpdate(info)
    await writeFile(path, 'corrupt')
    await expect(updater.installUpdateAndQuit(info)).rejects.toThrow('changed')
    expect(autoUpdater.quitAndInstall).not.toHaveBeenCalled()
    expect(autoUpdater.autoInstallOnAppQuit).toBe(false)
  })
  it.each([false, true])('re-verifies an AppImage on normal quit (tampered=%s)', async tampered => {
    const { updater, settings } = setup(true)
    settings.autoInstallOnAppQuit = true
    const path = join(directory, 'update.AppImage')
    vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({ updateInfo: {
      version: '1.0.7', releaseDate: '', files: [{ url: `pbtmodlauncherx-1.0.7-${process.arch}.AppImage`, sha512: createHash('sha512').update('fixture').digest('base64') }],
    } } as never)
    vi.mocked(autoUpdater.downloadUpdate).mockImplementationOnce(async () => { await writeFile(path, 'fixture'); return [path] })
    await updater.downloadUpdate(await updater.checkUpdateTask())
    if (tampered) await writeFile(path, 'modified')
    const event = { preventDefault: vi.fn() }
    electronApp.emit('before-quit', event as never)
    await vi.waitFor(() => expect(electronApp.quit).toHaveBeenCalledOnce())
    expect(event.preventDefault).toHaveBeenCalledOnce()
    if (tampered) expect(autoUpdater.quitAndInstall).not.toHaveBeenCalled()
    else expect(autoUpdater.quitAndInstall).toHaveBeenCalledWith(true, false)
  })
})
