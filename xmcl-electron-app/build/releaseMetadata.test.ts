import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getAppInstallerContent } from './appinstaller-builder'
import { config } from './electron-builder.config'
import { runtimeDependencyFingerprint } from '../main/utils/releaseMetadata'
import { canEmitLegacyAsarAsset } from './releasePolicy'

const root = resolve(import.meta.dirname, '../..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
describe('PbtModLauncherX 1.0.7 distribution metadata', () => {
  it.each(['package.json', 'xmcl-electron-app/package.json', 'xmcl-keystone-ui/package.json'])('uses the public release in %s', path => {
    expect(JSON.parse(read(path)).version).toBe('1.0.7')
  })
  it.each([['xmcl-runtime', '0.66.0'], ['xmcl-runtime-api', '0.51.0'], ['deskgap-app', '0.66.2']])('preserves the technical %s package version', (name, version) => {
    expect(JSON.parse(read(`${name}/package.json`)).version).toBe(version)
  })
  it('keeps the last published feed historical, the identity persistent and all publishers fork-owned', () => {
    const published = JSON.parse(read('latest_version.json'))
    // v1.0.7 was published after this test was first written. Keep checking a
    // published, fork-owned snapshot rather than a hard-coded previous release.
    expect(published.tag_name).toBe('v1.0.7')
    expect(published.draft).toBe(false)
    expect(published.prerelease).toBe(false)
    expect(Number.isFinite(Date.parse(published.published_at))).toBe(true)
    expect(published.html_url).toBe('https://github.com/PbtServers/PbtModLauncherX-Dev/releases/tag/v1.0.7')
    for (const asset of published.assets) {
      expect(asset.browser_download_url).toBe(`https://github.com/PbtServers/PbtModLauncherX-Dev/releases/download/v1.0.7/${asset.name}`)
    }
    expect(config.appId).toBe('PbtModLauncherX')
    expect(config.protocols.schemes).toEqual(['xmcl'])
    expect(config.appx.identityName).toBe('pbtmodlauncherx')
    expect(config.publish).toEqual([{ provider: 'github', owner: 'PbtServers', repo: 'PbtModLauncherX-Dev' }])
    expect(read('xmcl-runtime/constant.ts')).toContain("LAUNCHER_NAME = 'pbtmodlauncherx'")
    expect(read('deskgap-app/package.ts')).toContain("'..', 'package.json'")
  })
  it('records the exact runtime lockfile rather than assuming identical dependencies', () => {
    expect(runtimeDependencyFingerprint).toBe(createHash('sha256').update(read('pnpm-lock.yaml').replace(/\r\n/g, '\n')).digest('hex'))
  })
  it('does not expose an unsafe standalone ASAR to installed legacy 1.0.6 clients', () => {
    expect(canEmitLegacyAsarAsset('1.0.6')).toBe(true)
    expect(canEmitLegacyAsarAsset('1.0.7')).toBe(false)
    expect(canEmitLegacyAsarAsset('1.0.8')).toBe(false)
    expect(canEmitLegacyAsarAsset('../invalid')).toBe(false)
    expect(read('xmcl-electron-app/build.ts')).toContain('if (canEmitLegacyAsarAsset(version))')
  })
  it('generates coherent AppInstaller metadata and escapes publisher attributes', () => {
    const content = getAppInstallerContent('1.0.7', 'CN=Pbt & "Servers"')
    expect(content).toContain('Version="1.0.7.0"')
    expect(content).toContain('Publisher="CN=Pbt &amp; &quot;Servers&quot;"')
    expect(content).toContain('/PbtServers/PbtModLauncherX-Dev/releases/download/v1.0.7/pbtmodlauncherx-1.0.7-win32-x64.appx')
    expect(read('xmcl-electron-app/build/appxmanifest.xml')).toContain('Version="1.0.7.0"')
  })
  it.each(['../1.0.7', '1.0.7-beta.1', '65536.0.0'])('rejects invalid AppInstaller version %s', version => {
    expect(() => getAppInstallerContent(version, 'publisher')).toThrow()
  })
})
