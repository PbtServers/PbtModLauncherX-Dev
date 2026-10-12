import { expect, test } from 'vitest'
import { mediaTitle } from './mediaTitle'

test('shows the original track name instead of an imported UUID', () => {
  expect(mediaTitle({ name: 'Canción actual.mp3', url: 'http://launcher/theme-media/uuid.mp3', type: 'audio', mimeType: 'audio/mpeg' })).toBe('Canción actual.mp3')
})
test('decodes existing track URLs without query parameters and accepts local media paths', () => {
  const media = (url: string) => ({ url, type: 'audio' as const, mimeType: 'audio/mpeg' })
  expect(mediaTitle(media('https://example.org/Canci%C3%B3n%20actual.mp3?token=private'))).toBe('Canción actual.mp3')
  expect(mediaTitle(media('http://launcher/media?path=C%3A%5CMusic%5CGolden.mp3'))).toBe('Golden.mp3')
  expect(mediaTitle()).toBe('')
})
