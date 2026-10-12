import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { expect, test } from 'vitest'
import { packageFileName, requiredFormats, verifyPackages } from './verify-release-packages.mjs'
import { collectReleaseAssets } from './collect-release-assets.mjs'

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
      const packages = await verifyPackages(source, os, arch, '1.0.7')
      const platform = { Windows: 'win', Linux: 'linux', macOS: 'mac' }[os]!
      await writeFile(join(source, `manifest-${platform}${arch === 'arm64' ? '-arm64' : ''}.json`), JSON.stringify({
        version: '1.0.7', platform: { Windows: 'win32', Linux: 'linux', macOS: 'darwin' }[os], arch,
        product: 'PbtModLauncherX', updateMode: 'full-package', dependencies: 'a'.repeat(64),
      }))
      if (os === 'Linux') await writeFile(join(source, `content-${os}-${arch}.json`), JSON.stringify({
        version: '1.0.7', results: packages.map(file => ({ name: file.name, arch, runtimeVersion: 'v0.34.0', runtimeFiles: 1,
          hashesVerified: true, knowledgeVerified: true, executableVerified: true })),
      }))
    }
    const run = () => collectReleaseAssets(root)
    // Keep one real CLI smoke invocation; test error cases in-process to avoid
    // nine repeated Node/dependency startups competing with coverage workers.
    expect(spawnSync(process.execPath, [resolve('scripts/collect-release-assets.mjs'), root], { encoding: 'utf8' }).status).toBe(0)
    const mac = await readFile(join(root, 'release/latest-mac.yml'), 'utf8')
    expect(mac).toContain('-x64.dmg')
    expect(mac).toContain('-arm64.dmg')
    expect(await readFile(join(root, 'release/INSTALLATION.txt'), 'utf8')).toContain('UNSIGNED PREVIEW')
    await rm(join(root, 'release'), { recursive: true })
    // Each missing build independently blocks publication; no four-build release.
    for (const target of ['Windows-x64', 'Linux-x64', 'Linux-arm64', 'macOS-x64', 'macOS-arm64']) {
      const path = join(root, `build-${target}`, `packages-${target}.json`)
      const receipt = await readFile(path)
      await rm(path)
      await expect(run()).rejects.toThrow('ENOENT')
      await writeFile(path, receipt)
      await rm(join(root, 'release'), { recursive: true })
    }
    const manifestPath = join(root, 'build-Windows-x64/manifest-win.json')
    const manifest = await readFile(manifestPath)
    await writeFile(manifestPath, JSON.stringify({ version: '1.0.7', arch: 'arm64' }))
    await expect(run()).rejects.toThrow('Invalid package manifest')
    await writeFile(manifestPath, manifest)
    await rm(join(root, 'release'), { recursive: true })
    const contentPath = join(root, 'build-Linux-x64/content-Linux-x64.json')
    const content = await readFile(contentPath)
    await writeFile(contentPath, JSON.stringify({ version: '1.0.7', results: [] }))
    await expect(run()).rejects.toThrow('Incomplete Linux package resource verification')
    await writeFile(contentPath, content)
    await rm(join(root, 'release'), { recursive: true })
    await writeFile(join(root, 'build-Windows-x64/pbtmodlauncherx-1.0.7-win32-x64.zip'), 'tampered')
    await expect(run()).rejects.toThrow('Build bytes changed')
  } finally { await rm(root, { recursive: true, force: true }) }
})
