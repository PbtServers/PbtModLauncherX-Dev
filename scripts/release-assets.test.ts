import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { expect, test } from 'vitest'

test('checksums describe actual assets, remain stable on retry, and reject an empty download', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pbt-release-assets-'))
  const script = resolve('scripts/release-assets.mjs')
  const run = () => spawnSync(process.execPath, [script, root], { encoding: 'utf8' })
  try {
    expect(run().status).not.toBe(0)
    await writeFile(join(root, 'launcher.zip'), 'verified build bytes')
    expect(run().status).toBe(0)
    const expected = createHash('sha256').update('verified build bytes').digest('hex') + '  launcher.zip\n'
    expect(await readFile(join(root, 'SHA256SUMS.txt'), 'utf8')).toBe(expected)
    expect(run().status).toBe(0)
    expect(await readFile(join(root, 'SHA256SUMS.txt'), 'utf8')).toBe(expected)
  } finally { await rm(root, { recursive: true, force: true }) }
})
