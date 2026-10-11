import { describe, expect, it } from 'vitest'
import { parseOfficialOptifineName, resolveOptifineDownloadSource, resolveOptifineInstallerUrl } from './optifineSource'

describe('resolveOptifineDownloadSource', () => {
  const preview = { mcversion: '1.21.1', type: 'HD_U_J1', patch: 'pre9' }

  it('uses BMCL when mirror override is enabled', () => {
    expect(resolveOptifineDownloadSource(preview, true)).toEqual({
      type: 'mirror',
      url: 'https://bmclapi2.bangbang93.com/optifine/1.21.1/HD_U_J1/pre9',
    })
  })

  it('uses the official preview filename when mirror override is disabled', () => {
    expect(resolveOptifineDownloadSource(preview, false)).toEqual({
      type: 'official',
      fileName: 'preview_OptiFine_1.21.1_HD_U_J1_pre9.jar',
    })
  })

  it('normalizes legacy BMCL Minecraft versions', () => {
    expect(resolveOptifineDownloadSource({ mcversion: '1.8', type: 'HD_U', patch: 'L5' }, true)).toMatchObject({
      url: 'https://bmclapi2.bangbang93.com/optifine/1.8.0/HD_U/L5',
    })
  })

  it('resolves an official installer without requiring a mirror', async () => {
    const url = await resolveOptifineInstallerUrl(preview, false, async filename => {
      expect(filename).toBe('preview_OptiFine_1.21.1_HD_U_J1_pre9.jar')
      return 'https://optifine.net/downloadx.php?f=preview.jar&x=token'
    })
    expect(url).toContain('x=token')
  })

  it('does not contact the official provider when the mirror is selected', async () => {
    expect(await resolveOptifineInstallerUrl(preview, true, async () => {
      throw new Error('unexpected official request')
    })).toContain('bmclapi2.bangbang93.com')
  })

  it.each(['http://optifine.net/downloadx.php', 'https://example.com/downloadx.php', 'https://optifine.net/adloadx'])('rejects an invalid official download URL %s', async url => {
    await expect(resolveOptifineInstallerUrl(preview, false, async () => url)).rejects.toThrow('Invalid official')
  })

  it('preserves release and preview identifiers from official display names', () => {
    expect(parseOfficialOptifineName('OptiFine HD U M5')).toEqual({ type: 'HD_U', patch: 'M5' })
    expect(parseOfficialOptifineName(' OptiFine  HD U J1 pre9 ')).toEqual({ type: 'HD_U_J1', patch: 'pre9' })
  })
})
