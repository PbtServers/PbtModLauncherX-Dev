import { describe, it, expect } from 'vitest'
import { join } from 'path'
import {
  MEDIA_URL_PREFIX,
  getMediaIconPath,
  resolveInstanceIcon,
  serializeInstanceIcon,
  toMediaIconUrl,
} from './instanceIcon'

describe('instanceIcon', () => {
  const instancePath = join('/games', 'my-instance')

  it('encodes Windows paths with reserved characters without changing their value', () => {
    const path = 'G:\\Documentos\\área #1 & imágenes %\\icon.png'
    const url = toMediaIconUrl(path)
    expect(new URL(url).searchParams.get('path')).toBe(path)
    expect(getMediaIconPath(url)).toBe(path)
    expect(getMediaIconPath(url + '&revision=123')).toBe(path)
    if (process.platform === 'win32') expect(resolveInstanceIcon(path, instancePath)).toBe(url)
  })

  it('resolves a portable icon against the renamed or copied folder', () => {
    const stored = serializeInstanceIcon(toMediaIconUrl(join(instancePath, 'icon.png')), instancePath)
    expect(resolveInstanceIcon(stored, join('/games', 'copy á & #'))).toBe(toMediaIconUrl(join('/games', 'copy á & #', 'icon.png')))
  })

  it('does not resolve imported relative references outside their instance', () => {
    expect(resolveInstanceIcon('../private.png', instancePath)).toBe('')
    expect(resolveInstanceIcon('../../private.png', instancePath)).toBe('')
    expect(resolveInstanceIcon('..allowed.png', instancePath)).toBe(toMediaIconUrl(join(instancePath, '..allowed.png')))
  })

  describe('getMediaIconPath', () => {
    it('extracts the path from a media url', () => {
      const p = join(instancePath, 'icon.png')
      expect(getMediaIconPath(MEDIA_URL_PREFIX + p)).toBe(p)
    })
    it('returns undefined for non media urls', () => {
      expect(getMediaIconPath('http://launcher/image/abc')).toBeUndefined()
      expect(getMediaIconPath('https://example.com/a.png')).toBeUndefined()
      expect(getMediaIconPath('icon.png')).toBeUndefined()
    })
  })

  describe('resolveInstanceIcon', () => {
    it('resolves a relative reference into an absolute media url', () => {
      expect(resolveInstanceIcon('icon.png', instancePath)).toBe(
        toMediaIconUrl(join(instancePath, 'icon.png')),
      )
    })
    it('keeps external and global urls untouched', () => {
      expect(resolveInstanceIcon('http://launcher/image/abc', instancePath)).toBe('http://launcher/image/abc')
      expect(resolveInstanceIcon('https://example.com/a.png', instancePath)).toBe('https://example.com/a.png')
      expect(resolveInstanceIcon('data:image/png;base64,AAA', instancePath)).toBe('data:image/png;base64,AAA')
    })
    it('returns empty string for empty input', () => {
      expect(resolveInstanceIcon('', instancePath)).toBe('')
      expect(resolveInstanceIcon(undefined, instancePath)).toBe('')
    })
  })

  describe('serializeInstanceIcon', () => {
    it('rewrites a media url inside the folder into a relative path', () => {
      const url = toMediaIconUrl(join(instancePath, 'icon.png'))
      expect(serializeInstanceIcon(url, instancePath)).toBe('icon.png')
    })
    it('keeps a media url pointing outside the folder absolute', () => {
      const url = toMediaIconUrl(join('/somewhere', 'else', 'icon.png'))
      expect(serializeInstanceIcon(url, instancePath)).toBe(url)
    })
    it('keeps external and global urls untouched', () => {
      expect(serializeInstanceIcon('http://launcher/image/abc', instancePath)).toBe('http://launcher/image/abc')
      expect(serializeInstanceIcon('https://example.com/a.png', instancePath)).toBe('https://example.com/a.png')
    })
    it('returns empty string for empty input', () => {
      expect(serializeInstanceIcon('', instancePath)).toBe('')
      expect(serializeInstanceIcon(undefined, instancePath)).toBe('')
    })
  })

  it('round-trips a folder icon through serialize and resolve', () => {
    const url = toMediaIconUrl(join(instancePath, 'icon.png'))
    const persisted = serializeInstanceIcon(url, instancePath)
    expect(resolveInstanceIcon(persisted, instancePath)).toBe(url)
  })
})
