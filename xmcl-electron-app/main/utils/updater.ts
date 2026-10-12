import { HAS_DEV_SERVER } from '../constant'
import { ElectronUpdateOperation, type ReleaseInfo } from '@xmcl/runtime-api'
import type { DownloadUpdateOptions, LauncherAppUpdater } from '@xmcl/runtime/app'
import { app as electronApp, shell } from 'electron'
import * as updater from 'electron-updater'
import { CancellationToken } from 'electron-updater'
import { dirname, join } from 'node:path'
import { gt, prerelease, rcompare, valid } from 'semver'
import { kSettings } from '~/settings'
import type ElectronLauncherApp from '../ElectronLauncherApp'
import { runtimeDependencyFingerprint } from './releaseMetadata'
import { checkRelease, fetchUpdate, readUpdateJSON, supportsAsar, updateManifestURL, updateReleaseURL, type CheckedRelease } from './updatePolicy'
import { downloadVerifiedUpdate, hashUpdate, replaceVerifiedAsar } from './updateDownload'
import { linuxPackageName } from './packageNames'

export class ElectronUpdater implements LauncherAppUpdater {
  private approved?: { info: ReleaseInfo; key: string; manifest?: CheckedRelease; sha512?: string }
  private downloaded?: { version: string; sha256?: string; path?: string; sha512?: string }
  private busy = false
  private autoInstallRequested = false
  private checkingQuit = false
  private resumeQuit = false
  private logger

  constructor(private app: ElectronLauncherApp) {
    this.logger = app.getLogger('ElectronUpdater')
    updater.autoUpdater.setFeedURL({ provider: 'github', owner: 'PbtServers', repo: 'PbtModLauncherX-Dev' })
    updater.autoUpdater.autoDownload = false
    updater.autoUpdater.autoInstallOnAppQuit = false
    updater.autoUpdater.allowDowngrade = false
    updater.autoUpdater.disableDifferentialDownload = true
    electronApp.on('before-quit', this.beforeQuit)
  }

  private beforeQuit = (event: { preventDefault(): void }) => {
    if (this.resumeQuit || !this.autoInstallRequested) return
    event.preventDefault()
    if (this.checkingQuit) return
    this.checkingQuit = true
    void (async () => {
      try {
        if (!this.approved || !this.downloaded?.path) throw new Error('No verified update')
        this.getApproved(this.approved.info)
        await this.checkChannel(this.approved.info)
        const digest = await hashUpdate(this.downloaded.path, 'sha512', 'base64', AbortSignal.timeout(5_000))
        if (digest !== this.downloaded.sha512) throw new Error('Update changed before quit')
        this.resumeQuit = true
        // User requested installation on normal exit; do not force a restart.
        updater.autoUpdater.quitAndInstall(true, false)
        // quitAndInstall may report an installation failure through an event
        // without quitting. A requested normal exit must still be allowed.
        electronApp.quit()
      } catch {
        this.autoInstallRequested = false
        this.downloaded = undefined
        this.logger.warn('Update verification failed on quit; the working application is preserved.')
        this.resumeQuit = true
        electronApp.quit()
      }
    })()
  }

  async checkUpdateTask(): Promise<ReleaseInfo> {
    if (this.busy) throw new Error('An update operation is already running')
    this.busy = true
    updater.autoUpdater.autoInstallOnAppQuit = false
    this.autoInstallRequested = false
    try {
      const { allowPrerelease } = await this.app.registry.get(kSettings)
      updater.autoUpdater.allowPrerelease = allowPrerelease
      let info: ReleaseInfo
      let manifest: CheckedRelease | undefined
      let sha512: string | undefined
      if (this.app.env === 'appimage' && this.app.platform.os === 'linux') {
        // AppImage full updates retain electron-updater SHA-512 verification.
        const result = await updater.autoUpdater.checkForUpdates()
        if (!result || !valid(result.updateInfo.version)) throw new Error('Invalid full update metadata')
        const version = result.updateInfo.version
        const expected = linuxPackageName(version, process.arch, 'AppImage')
        const allowed = ['AppImage', 'deb', 'rpm', 'pacman'].map(ext => linuxPackageName(version, process.arch, ext))
        const image = result.updateInfo.files.filter(file => file.url === expected || file.url === `https://github.com/PbtServers/PbtModLauncherX-Dev/releases/download/v${version}/${expected}`)
        if (image.length !== 1 || result.updateInfo.files.some(file =>
          !allowed.some(name => file.url === name || file.url === `https://github.com/PbtServers/PbtModLauncherX-Dev/releases/download/v${version}/${name}`) ||
          !/^[A-Za-z0-9+/]{86}==$/.test(file.sha512))) throw new Error('Invalid AppImage update source, architecture or digest')
        sha512 = image[0].sha512
        info = {
          name: version, body: typeof result.updateInfo.releaseNotes === 'string' ? result.updateInfo.releaseNotes : '',
          date: result.updateInfo.releaseDate,
          files: image.map(f => ({ name: f.url, url: f.url })),
          newUpdate: gt(version, this.app.version) && (allowPrerelease || !prerelease(version)),
          operation: ElectronUpdateOperation.AutoUpdater,
        }
      } else {
        const fetcher = this.app.fetch.bind(this.app) as typeof fetch
        const candidates: CheckedRelease[] = []
        for (const source of [updateManifestURL, updateReleaseURL]) {
          try {
            const value = await readUpdateJSON(await fetchUpdate(fetcher, source))
            const checked = checkRelease(value, this.app.version, allowPrerelease)
            const flags = value as { draft?: boolean; prerelease?: boolean }
            if (flags.draft === true || (!allowPrerelease && (flags.prerelease === true || prerelease(checked.version)))) continue
            candidates.push(checked)
          } catch {
            // Either existing fork-owned source can be temporarily unavailable.
            // Never trust an invalid response or silently claim up to date if both fail.
          }
        }
        if (!candidates.length) throw new Error('No valid PbtServers update manifest is available')
        manifest = candidates.sort((a, b) => rcompare(a.version, b.version))[0]
        const suffix = this.app.platform.arch === 'x64' ? '' : `-${this.app.platform.arch}`
        const name = `app-${manifest.version}-linux${suffix}.asar`
        const runtime = { electron: process.versions.electron ?? '', platform: process.platform, arch: process.arch, dependencies: runtimeDependencyFingerprint }
        const hasVerifiedAsar = supportsAsar(manifest, runtime) && manifest.assets.some(a => a.name === name) &&
          manifest.assets.some(a => a.name === `${name}.sha256`)
        info = {
          name: manifest.version, body: manifest.body, date: manifest.date,
          files: manifest.assets.map(a => ({ name: a.name, url: a.url })),
          newUpdate: manifest.newer,
          operation: hasVerifiedAsar ? ElectronUpdateOperation.Asar : ElectronUpdateOperation.Manual,
        }
      }
      if (!info.newUpdate) {
        this.approved = undefined
        this.downloaded = undefined
        return info
      }
      if (this.approved && this.approved.key === JSON.stringify(info) && this.approved.sha512 === sha512 &&
          JSON.stringify(this.approved.manifest) === JSON.stringify(manifest)) return this.approved.info
      this.approved = { info, key: JSON.stringify(info), manifest, sha512 }
      this.downloaded = undefined
      this.logger.log(`PbtServers update checked: ${info.name}, operation=${info.operation}`)
      return info
    } finally {
      this.busy = false
    }
  }

  private getApproved(info: ReleaseInfo) {
    if (!this.approved || this.approved.key !== JSON.stringify(info) || !info.newUpdate ||
        !gt(info.name, this.app.version)) throw new Error('Update is stale or has not been checked in this session')
    return this.approved
  }

  private async checkChannel(info: ReleaseInfo) {
    const settings = await this.app.registry.get(kSettings)
    if (prerelease(info.name) && !settings.allowPrerelease) throw new Error('Update is not allowed in the selected channel')
  }

  syncUpdatePreferences(settings: { autoInstallOnAppQuit: boolean; allowPrerelease: boolean }) {
    updater.autoUpdater.autoDownload = false
    updater.autoUpdater.allowDowngrade = false
    updater.autoUpdater.allowPrerelease = settings.allowPrerelease
    updater.autoUpdater.autoInstallOnAppQuit = false
    this.autoInstallRequested = this.app.env === 'appimage' &&
      this.approved?.info.operation === ElectronUpdateOperation.AutoUpdater &&
      this.approved.key === JSON.stringify(this.approved.info) &&
      this.downloaded?.version === this.approved.info.name && settings.autoInstallOnAppQuit &&
      (settings.allowPrerelease || !prerelease(this.approved.info.name))
  }

  async downloadUpdate(info: ReleaseInfo, options?: DownloadUpdateOptions): Promise<void> {
    if (this.busy) throw new Error('An update operation is already running')
    const approved = this.getApproved(info)
    options?.abortSignal?.throwIfAborted()
    this.busy = true
    this.downloaded = undefined
    updater.autoUpdater.autoInstallOnAppQuit = false
    this.autoInstallRequested = false
    try {
      await this.checkChannel(info)
      if (info.operation === ElectronUpdateOperation.Manual) {
        await shell.openExternal(`https://github.com/PbtServers/PbtModLauncherX-Dev/releases/tag/v${info.name}`)
        return
      }
      if (info.operation === ElectronUpdateOperation.Asar && approved.manifest) {
        // Select only the exact architecture chosen by the validated manifest.
        const suffix = this.app.platform.arch === 'x64' ? '' : `-${this.app.platform.arch}`
        const exact = approved.manifest.assets.find(a => a.name === `app-${info.name}-linux${suffix}.asar`)
        if (!exact) throw new Error('Missing compatible update asset')
        const progress = { progress: 0, total: exact.size, url: exact.url }
        options?.tracker?.({ phase: 'download-update.asar', payload: { url: exact.url, progress } })
        const sha256 = await downloadVerifiedUpdate(this.app.fetch.bind(this.app) as typeof fetch, exact,
          join(this.app.appDataPath, 'pending_update'), options?.abortSignal, bytes => { progress.progress = bytes })
        this.downloaded = { version: info.name, sha256 }
      } else if (info.operation === ElectronUpdateOperation.AutoUpdater && this.app.env === 'appimage') {
        const token = new CancellationToken()
        const cancel = () => token.cancel()
        options?.abortSignal?.addEventListener('abort', cancel, { once: true })
        if (options?.abortSignal?.aborted) cancel()
        const progress = { progress: 0, total: 0, url: '' }
        const listener = (event: { transferred: number; total: number }) => { progress.progress = event.transferred; progress.total = event.total }
        updater.autoUpdater.on('download-progress', listener)
        options?.tracker?.({ phase: 'download-update.full', payload: { progress } })
        try {
          const paths = await updater.autoUpdater.downloadUpdate(token)
          options?.abortSignal?.throwIfAborted()
          if (paths.length !== 1) throw new Error('Missing verified AppImage download')
          const sha512 = await hashUpdate(paths[0], 'sha512', 'base64')
          options?.abortSignal?.throwIfAborted()
          if (sha512 !== approved.sha512) throw new Error('AppImage integrity check failed')
          // A receipt pins the downloaded bytes for the explicit install step;
          // electron-updater has already matched them to its feed SHA-512.
          this.downloaded = { version: info.name, path: paths[0], sha512 }
        } finally {
          options?.abortSignal?.removeEventListener('abort', cancel)
          updater.autoUpdater.removeListener('download-progress', listener)
        }
      } else throw new Error('Unsupported automatic update operation')
      await this.checkChannel(info)
      options?.abortSignal?.throwIfAborted()
      this.syncUpdatePreferences(await this.app.registry.get(kSettings))
    } catch (error) {
      this.downloaded = undefined
      updater.autoUpdater.autoInstallOnAppQuit = false
      this.autoInstallRequested = false
      throw error
    } finally {
      this.busy = false
    }
  }

  async installUpdateAndQuit(info: ReleaseInfo): Promise<void> {
    this.getApproved(info)
    if (HAS_DEV_SERVER) throw new Error('Updates cannot be installed in the development launcher')
    if (this.busy || this.downloaded?.version !== info.name) throw new Error('Update must be downloaded and verified first')
    this.busy = true
    try {
      await this.checkChannel(info)
      if (info.operation === ElectronUpdateOperation.Asar && this.downloaded.sha256) {
        const pending = join(this.app.appDataPath, 'pending_update')
        if (await hashUpdate(pending) !== this.downloaded.sha256) throw new Error('Pending update integrity check failed')
        await replaceVerifiedAsar(pending, join(dirname(__dirname), 'app.asar'), this.downloaded.sha256)
        this.app.relaunch()
      } else if (info.operation === ElectronUpdateOperation.AutoUpdater && this.app.env === 'appimage') {
        if (!this.downloaded.path || await hashUpdate(this.downloaded.path, 'sha512', 'base64') !== this.downloaded.sha512) {
          updater.autoUpdater.autoInstallOnAppQuit = false
          this.autoInstallRequested = false
          this.downloaded = undefined
          throw new Error('Downloaded AppImage has changed')
        }
        updater.autoUpdater.quitAndInstall()
      } else throw new Error('Use the signed full PbtModLauncherX package for this platform')
    } finally {
      this.busy = false
    }
  }
}
