import { describe, expect, it, vi } from 'vitest'
import { checkRelease, fetchUpdate, releaseAssetURL, supportsAsar, updateManifestURL } from './updatePolicy'

const asset = (version = '1.0.7', name = `app-${version}-linux.asar`) => ({
  name, browser_download_url: releaseAssetURL(version, name), size: 3,
})
const fixture = (version = '1.0.7') => ({ tag_name: `v${version}`, assets: [asset(version)], body: 'PbtModLauncherX' })

describe('PbtServers update policy', () => {
  it.each([['1.0.7', true], ['1.0.6', false], ['1.0.5', false]])('compares %s without downgrading', (version, newer) => {
    expect(checkRelease(fixture(version), '1.0.6', false).newer).toBe(newer)
  })
  it('rejects development releases in the stable channel and accepts explicit development preference', () => {
    expect(checkRelease(fixture('1.0.8-beta.1'), '1.0.7', false).newer).toBe(false)
    expect(checkRelease(fixture('1.0.8-beta.1'), '1.0.7', true).newer).toBe(true)
    expect(checkRelease({ ...fixture(), draft: true }, '1.0.6', true).newer).toBe(false)
  })
  it.each([null, {}, { tag_name: 'v26.1', assets: [] }, { tag_name: 'v1.0.7', assets: null }])('rejects malformed metadata %j', value => {
    expect(() => checkRelease(value, '1.0.6', false)).toThrow()
  })
  it.each(['../escape', '/absolute', 'bad%2f.exe', 'bad\\.exe', 'file..exe'])('rejects traversal asset %s', name => {
    expect(() => releaseAssetURL('1.0.7', name)).toThrow()
  })
  it('rejects upstream and unrelated sources, invalid sizes and duplicates', () => {
    const a = asset()
    expect(() => checkRelease({ ...fixture(), assets: [{ ...a, browser_download_url: a.browser_download_url.replace('PbtServers/PbtModLauncherX-Dev', 'Voxelum/x-minecraft-launcher') }] }, '1.0.6', false)).toThrow()
    expect(() => checkRelease({ ...fixture(), assets: [{ ...a, size: -1 }] }, '1.0.6', false)).toThrow()
    expect(() => checkRelease({ ...fixture(), assets: [a, a] }, '1.0.6', false)).toThrow()
  })
  it('requires exact architecture, Electron and lockfile before an unsigned Linux incremental update', () => {
    const runtime = { electron: '43.5.0', platform: 'linux', arch: 'x64', dependencies: 'a'.repeat(64) }
    const checked = checkRelease({ ...fixture(), pbt_runtime: runtime }, '1.0.6', false)
    expect(supportsAsar(checked, runtime)).toBe(true)
    expect(supportsAsar(checkRelease(fixture(), '1.0.6', false), runtime)).toBe(false)
    for (const changed of [{ arch: 'arm64' }, { electron: '42.0.0' }, { dependencies: 'b'.repeat(64) }, { platform: 'win32' }, { platform: 'darwin' }]) {
      expect(supportsAsar(checked, { ...runtime, ...changed })).toBe(false)
    }
  })
  it('handles network errors and HTTP errors without interpreting them as releases', async () => {
    await expect(fetchUpdate(vi.fn().mockRejectedValue(new Error('Offline')), updateManifestURL)).rejects.toThrow('Offline')
    await expect(fetchUpdate(vi.fn().mockResolvedValue(new Response('', { status: 404 })), updateManifestURL)).rejects.toThrow('HTTP 404')
  })
  it.each(['http://release-assets.githubusercontent.com/file', 'https://evil.example/file', 'https://user:password@objects.githubusercontent.com/file'])('rejects unexpected redirects %s', async location => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { location } }))
    await expect(fetchUpdate(fetcher, updateManifestURL)).rejects.toThrow('Unauthorized')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('allows only GitHub CDN redirects without forwarding secrets', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: 'https://release-assets.githubusercontent.com/file?signature=fixture' } }))
      .mockResolvedValueOnce(new Response('ok'))
    expect(await (await fetchUpdate(fetcher, updateManifestURL)).text()).toBe('ok')
    expect(fetcher.mock.calls[1][1]).not.toHaveProperty('headers')
  })
  it('cancels before requesting and refuses arbitrary sources', async () => {
    const fetcher = vi.fn()
    const controller = new AbortController(); controller.abort()
    await expect(fetchUpdate(fetcher, updateManifestURL, controller.signal)).rejects.toThrow()
    await expect(fetchUpdate(fetcher, 'https://api.github.com/repos/Voxelum/x-minecraft-launcher/releases/latest')).rejects.toThrow()
    expect(fetcher).not.toHaveBeenCalled()
  })
})
