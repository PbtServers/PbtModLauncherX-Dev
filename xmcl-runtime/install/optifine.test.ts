import { describe, expect, it, vi } from 'vitest'
import { createOptifineMetadataSources } from './optifine'

describe('OptiFine metadata providers', () => {
  it('exposes official metadata without enabling a mirror', async () => {
    const versions = [{ mcversion: '1.8.9', type: 'HD_U', patch: 'M5' }]
    const provider = vi.fn(async () => versions)
    const sources = createOptifineMetadataSources(false, provider)
    expect(sources.map(source => source.url)).toEqual(['https://optifine.net/downloads'])
    expect(await sources[0].parse(await sources[0].fetch!({}))).toEqual(versions)
    expect(provider).toHaveBeenCalledOnce()
  })

  it('keeps mirror priority and an official fallback', () => {
    expect(createOptifineMetadataSources(true, async () => []).map(source => source.url)).toEqual([
      'https://bmclapi2.bangbang93.com/optifine/versionList', 'https://optifine.net/downloads',
    ])
    expect(createOptifineMetadataSources(false)).toEqual([])
  })
})
