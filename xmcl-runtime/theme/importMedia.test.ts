import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { expect, test } from 'vitest'
import { importMedia } from './importMedia'

test('imports filenames with URL delimiters and same-name files without overwriting', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pbt107 media-'))
  try {
    await mkdir(join(root, 'a')); await mkdir(join(root, 'b'))
    const file = 'custom # & background.png'
    await writeFile(join(root, 'a', file), 'first')
    await writeFile(join(root, 'b', file), 'second')
    const a = await importMedia(join(root, 'a', file), join(root, 'theme-media'), 'png')
    const b = await importMedia(join(root, 'b', file), join(root, 'theme-media'), 'png')
    expect(a).not.toBe(b)
    expect(new URL(`http://launcher/theme-media/${a}`).pathname).toBe(`/theme-media/${a}`)
    expect(await readFile(join(root, 'theme-media', a), 'utf8')).toBe('first')
    expect(await readFile(join(root, 'theme-media', b), 'utf8')).toBe('second')
    expect(await readFile(join(root, 'a', file), 'utf8')).toBe('first')
  } finally { await rm(root, { recursive: true, force: true }) }
})
