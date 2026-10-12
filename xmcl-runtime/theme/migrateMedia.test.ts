import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { expect, test } from 'vitest'
import { copyLegacyThemeMedia } from './migrateMedia'

test('recovers a legacy image into a nonempty media folder and preserves both originals and existing media', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pbt107 theme migration-'))
  try {
    const old = join(root, 'themes')
    const current = join(root, 'theme-media')
    await mkdir(old)
    await mkdir(current)
    await writeFile(join(old, 'background.jpg'), 'original background')
    await writeFile(join(current, 'music.mp3'), 'existing music')
    expect(await copyLegacyThemeMedia(join(old, 'background.jpg'), join(current, 'background.jpg'))).toBe(true)
    expect(await readFile(join(old, 'background.jpg'), 'utf8')).toBe('original background')
    expect(await readFile(join(current, 'background.jpg'), 'utf8')).toBe('original background')
    expect(await readFile(join(current, 'music.mp3'), 'utf8')).toBe('existing music')
    await writeFile(join(current, 'background.jpg'), 'newer background')
    expect(await copyLegacyThemeMedia(join(old, 'background.jpg'), join(current, 'background.jpg'))).toBe(false)
    expect(await readFile(join(current, 'background.jpg'), 'utf8')).toBe('newer background')
  } finally { await rm(root, { recursive: true, force: true }) }
})
