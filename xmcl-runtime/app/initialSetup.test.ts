import { describe, expect, it, vi } from 'vitest'
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { createInitialSetup, prepareInitialRoot } from './initialSetup'
import { isValidPathName } from '../util/validate'

describe('initial setup acknowledgement', () => {
  it('waits for preparation and shares concurrent retries', async () => {
    let finish!: () => void
    const prepare = vi.fn(() => new Promise<void>(resolve => { finish = resolve }))
    const complete = createInitialSetup(prepare)
    const first = complete('G:/Datos con acentos/á')
    expect(complete('G:/Datos con acentos/á')).toBe(first)
    await Promise.resolve()
    expect(prepare).toHaveBeenCalledOnce()
    await expect(complete('other')).rejects.toThrow('in progress')
    finish()
    await first
    await complete('G:/Datos con acentos/á')
    expect(prepare).toHaveBeenCalledOnce()
  })
  it('permits recovery after filesystem failure without acknowledging success', async () => {
    const prepare = vi.fn().mockRejectedValueOnce(new Error('EACCES')).mockResolvedValue(undefined)
    const complete = createInitialSetup(prepare)
    await expect(complete('folder')).rejects.toThrow('EACCES')
    await complete('folder')
    expect(prepare).toHaveBeenCalledTimes(2)
  })
  it('rejects incomplete configuration without starting optional network or Java work', async () => {
    const prepare = vi.fn()
    await expect(createInitialSetup(prepare)('  ')).rejects.toThrow('Invalid')
    expect(prepare).not.toHaveBeenCalled()
  })
  it('persists a fresh root with spaces and Unicode for the following start', async () => {
    const folder = await mkdtemp(resolve('temp/phase9-test-'))
    try {
      const game = join(folder, 'Datos à Minecraft')
      expect(isValidPathName(game)).toBe(true)
      await createInitialSetup(path => prepareInitialRoot(folder, path, writeFile))(game)
      expect((await stat(join(game, 'temp'))).isDirectory()).toBe(true)
      expect(await readFile(join(folder, 'root'), 'utf8')).toBe(game)
    } finally {
      await rm(folder, { recursive: true, force: true })
    }
  })
  it('keeps the previous root when mandatory directory preparation fails', async () => {
    const folder = await mkdtemp(resolve('temp/phase9-test-'))
    try {
      await writeFile(join(folder, 'root'), 'previous preference')
      const game = join(folder, 'blocked')
      await writeFile(game, 'not a directory')
      await expect(prepareInitialRoot(folder, game, writeFile)).rejects.toThrow()
      expect(await readFile(join(folder, 'root'), 'utf8')).toBe('previous preference')
      await mkdir(join(folder, 'recovered'))
      await prepareInitialRoot(folder, join(folder, 'recovered'), writeFile)
    } finally {
      await rm(folder, { recursive: true, force: true })
    }
  })
})
