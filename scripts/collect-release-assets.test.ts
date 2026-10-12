import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { expect, test } from 'vitest'
import { packageFileName, requiredFormats, verifyPackages } from './verify-release-packages.mjs'

test('collects five complete builds, merges macOS metadata, and rejects changed bytes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pbt-release-collect-'))
  try {
    for (const [os, arch] of [['Windows', 'x64'], ['Linux', 'x64'], ['Linux', 'arm64'], ['macOS', 'x64'], ['macOS', 'arm64']]) {
      const source = join(root, `build-${os}-${arch}`)
      await mkdir(source)
      for (const ext of requiredFormats[os]) {
        const name = packageFileName(os, arch, '1.0.7', ext)
        await writeFile(join(source, name), name)
        if (os === 'macOS') await writeFile(join(source, 'latest-mac.yml'), `version: 1.0.7\nfiles:\n  - url: ${name}\n    sha512: ${createHash('sha512').update(name).digest('base64')}\n`)
      }
      await verifyPackages(source, os, arch, '1.0.7')
    }
    const run = () => spawnSync(process.execPath, [resolve('scripts/collect-release-assets.mjs'), root], { encoding: 'utf8' })
    expect(run().status).toBe(0)
    const mac = await readFile(join(root, 'release/latest-mac.yml'), 'utf8')
    expect(mac).toContain('-x64.dmg')
    expect(mac).toContain('-arm64.dmg')
    await rm(join(root, 'release'), { recursive: true })
    await writeFile(join(root, 'build-Windows-x64/pbtmodlauncherx-1.0.7-win32-x64.zip'), 'tampered')
    const failed = run()
    expect(failed.status).not.toBe(0)
    expect(failed.stderr).toContain('Build bytes changed')
  } finally { await rm(root, { recursive: true, force: true }) }
})
