import { describe, expect, it } from 'vitest'
import { filterNeoForgeVersions, getNeoForgeProject } from './neoForgeMetadata'

describe('NeoForge Minecraft association', () => {
  const versions = ['21.0.167', '21.1.1', '21.1.257', '21.1.257', '21.10.1', '21.2.1-beta']
  it('selects only 21.1 builds for Minecraft 1.21.1 and removes duplicates', () => {
    expect(filterNeoForgeVersions('1.21.1', versions)).toEqual(['21.1.1', '21.1.257'])
  })
  it('does not expose 1.21.1 or 1.21.2 installers under Minecraft 1.21', () => {
    expect(filterNeoForgeVersions('1.21', versions)).toEqual(['21.0.167'])
  })
  it('uses the official legacy project for 1.20.1', () => {
    expect(getNeoForgeProject('1.20.1')).toBe('forge')
    expect(filterNeoForgeVersions('1.20.1', ['1.20.1-47.1.106', '47.1.82', '20.2.1', '1.19.4-45.1.0']))
      .toEqual(['1.20.1-47.1.106'])
  })
  it('uses the modern project for 1.21.1', () => {
    expect(getNeoForgeProject('1.21.1')).toBe('neoforge')
  })
})
