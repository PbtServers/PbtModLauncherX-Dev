import { createHash } from 'node:crypto'
import { chmod, cp, lstat, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { expect, test } from 'vitest'
import { deduplicateRuntime } from './deduplicateRuntime'

test('keeps library names and verified bytes, uses regular hardlinks, and tar preserves them on extraction', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pbt-runtime-dedup-'))
  try {
    const body = Buffer.from('verified official library fixture bytes')
    const sha256 = createHash('sha256').update(body).digest('hex')
    await writeFile(join(root, 'libtest.so.1.0'), body)
    await cp(join(root, 'libtest.so.1.0'), join(root, 'libtest.so.1'))
    await writeFile(join(root, 'different.so'), 'different library')
    const files = [
      { path: 'libtest.so.1.0', sha256 }, { path: 'libtest.so.1', sha256 },
      { path: 'different.so', sha256: createHash('sha256').update('different library').digest('hex') },
    ]
    expect(await deduplicateRuntime(root, files)).toEqual({ aliases: 1, savedBytes: body.length })
    expect((await lstat(join(root, 'libtest.so.1'))).isSymbolicLink()).toBe(false)
    expect((await lstat(join(root, 'libtest.so.1'))).ino).toBe((await lstat(join(root, 'libtest.so.1.0'))).ino)
    expect(await readFile(join(root, 'libtest.so.1'))).toEqual(body)
    expect(await deduplicateRuntime(root, files)).toEqual({ aliases: 0, savedBytes: 0 })
    // Use the same node-tar dependency and portable mode as electron-builder.
    const appRequire = createRequire(new URL('../package.json', import.meta.url))
    const tar = createRequire(appRequire.resolve('app-builder-lib'))('tar')
    const archive = join(root, 'fixture.tar')
    await tar.create({ cwd: root, file: archive, portable: true }, files.map(f => f.path))
    const entries: Array<{ path: string; type: string }> = []
    await tar.list({ file: archive, onReadEntry: (entry: { path: string; type: string }) => entries.push({ path: entry.path, type: entry.type }) })
    expect(entries.some(e => e.path === 'libtest.so.1' && e.type === 'Link')).toBe(true)
    const output = join(root, 'extracted'); await mkdir(output)
    await tar.extract({ file: archive, cwd: output })
    expect(await readFile(join(output, 'libtest.so.1'))).toEqual(body)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('never merges different library bytes, non-library resources or different permissions', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pbt-runtime-dedup-'))
  try {
    const bodies = { 'one.so': 'first', 'two.so': 'other', 'LICENSE': 'first', 'mode.so': 'first' }
    for (const [name, body] of Object.entries(bodies)) await writeFile(join(root, name), body)
    if (process.platform !== 'win32') await chmod(join(root, 'mode.so'), 0o700)
    const files = Object.entries(bodies).map(([path, body]) => ({ path, sha256: createHash('sha256').update(body).digest('hex') }))
    const expectedAliases = process.platform === 'win32' ? 1 : 0
    expect((await deduplicateRuntime(root, files)).aliases).toBe(expectedAliases)
    expect((await lstat(join(root, 'LICENSE'))).ino).not.toBe((await lstat(join(root, 'one.so'))).ino)
    expect(await readFile(join(root, 'two.so'), 'utf8')).toBe('other')
    if (process.platform !== 'win32') expect((await lstat(join(root, 'mode.so'))).mode & 0o777).toBe(0o700)
    await expect(deduplicateRuntime(root, [{ path: '../escape.so', sha256: files[0].sha256 }])).rejects.toThrow('invalid_bundle_path')
  } finally { await rm(root, { recursive: true, force: true }) }
})
