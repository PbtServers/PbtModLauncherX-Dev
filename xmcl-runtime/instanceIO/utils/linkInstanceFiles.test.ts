import { describe, it, expect } from 'vitest'
import { linkInstanceFiles } from './linkInstanceFiles'
import type { InstanceFile } from '@xmcl/instance'
import { mkdtemp, rm, writeFile, mkdir } from 'fs-extra'
import { tmpdir, platform } from 'os'
import { join } from 'path'

const file = (path: string): InstanceFile => ({
  path,
  hashes: { sha1: 'AAA' },
})

const PLATFORM = { os: platform() === 'win32' ? 'windows' : 'linux' } as any

describe('linkInstanceFiles', () => {
  it('links a file from src to destination', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'xmcl-link-'))
    try {
      const src = join(dir, 'src.jar')
      const dest = join(dir, 'workspace', 'mods', 'a.jar')
      await writeFile(src, 'hello')
      const finished = new Set<string>()
      const unhandled: InstanceFile[] = []
      const ac = new AbortController()

      await linkInstanceFiles(
        [{ file: file('mods/a.jar'), src, destination: dest }],
        PLATFORM,
        finished,
        unhandled,
        ac.signal,
      )

      expect(finished.has('mods/a.jar')).toBe(true)
      expect(unhandled).toHaveLength(0)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  /**
   * BUG A: When the source file does not exist on disk (the cache was
   * evicted between resource discovery and linking), we expect this file
   * to be reported through the `unhandled` array so the caller can fall
   * back to downloading. Today the function:
   *   1. Checks `e.name === 'ENOENT'` — but Node fs errors have `e.code`,
   *      not `e.name`, so the check is always false.
   *   2. Even if it were corrected, the catch block re-throws after
   *      pushing to `unhandled`, causing the whole AggregateError to be
   *      raised and the install to abort before the fallback runs.
   */
  it('reports missing source file via unhandled instead of throwing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'xmcl-link-'))
    try {
      const src = join(dir, 'does-not-exist.jar')
      const dest = join(dir, 'workspace', 'mods', 'a.jar')
      const finished = new Set<string>()
      const unhandled: InstanceFile[] = []
      const ac = new AbortController()

      await expect(
        linkInstanceFiles(
          [{ file: file('mods/a.jar'), src, destination: dest }],
          PLATFORM,
          finished,
          unhandled,
          ac.signal,
        ),
      ).resolves.toBeUndefined()

      expect(finished.has('mods/a.jar')).toBe(false)
      expect(unhandled).toHaveLength(1)
      expect(unhandled[0].path).toBe('mods/a.jar')
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('still throws AggregateError for unrelated link failures', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'xmcl-link-'))
    try {
      // src exists, but destination dir is a *file* with the same name as a
      // path component, so ensureDir will fail. This is one easy way to
      // produce a non-ENOENT failure.
      const src = join(dir, 'src.jar')
      await writeFile(src, 'hello')
      const blocker = join(dir, 'workspace')
      await writeFile(blocker, 'not a dir')
      const dest = join(dir, 'workspace', 'mods', 'a.jar')

      const finished = new Set<string>()
      const unhandled: InstanceFile[] = []
      const ac = new AbortController()

      await expect(
        linkInstanceFiles(
          [{ file: file('mods/a.jar'), src, destination: dest }],
          PLATFORM,
          finished,
          unhandled,
          ac.signal,
        ),
      ).rejects.toThrow()
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('processes mixed success / missing / failure correctly', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'xmcl-link-'))
    try {
      const okSrc = join(dir, 'ok.jar')
      const missingSrc = join(dir, 'missing.jar')
      await writeFile(okSrc, 'data')

      const finished = new Set<string>()
      const unhandled: InstanceFile[] = []
      const ac = new AbortController()

      await linkInstanceFiles(
        [
          { file: file('mods/ok.jar'), src: okSrc, destination: join(dir, 'ws', 'mods', 'ok.jar') },
          { file: file('mods/m.jar'), src: missingSrc, destination: join(dir, 'ws', 'mods', 'm.jar') },
        ],
        PLATFORM,
        finished,
        unhandled,
        ac.signal,
      )

      expect(finished.has('mods/ok.jar')).toBe(true)
      expect(finished.has('mods/m.jar')).toBe(false)
      expect(unhandled.map((u) => u.path)).toEqual(['mods/m.jar'])
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
