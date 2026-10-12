import { mkdtemp, rm, writeFile, truncate } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { packageFileName, requiredFormats, verifyPackages } from './verify-release-packages.mjs'
import { linuxPackageName } from '../xmcl-electron-app/main/utils/packageNames'

test('runtime updater names match electron-builder for both Linux architectures and every format', () => {
  for (const arch of ['x64', 'arm64']) for (const ext of requiredFormats.Linux) {
    expect(linuxPackageName('1.0.7', arch, ext)).toBe(packageFileName('Linux', arch, '1.0.7', ext))
  }
  expect(linuxPackageName('1.0.7', 'x64', 'AppImage')).toBe('pbtmodlauncherx-1.0.7-x86_64.AppImage')
})

test.each([['Windows', 'x64'], ['Linux', 'x64'], ['Linux', 'arm64'], ['macOS', 'x64'], ['macOS', 'arm64']])('requires every format and hashes actual files for %s/%s', async (os, arch) => {
  const root = await mkdtemp(join(tmpdir(), 'pbt-package-check-'))
  try {
    await expect(verifyPackages(root, os, arch, '1.0.7')).rejects.toThrow('Missing required package')
    for (const ext of requiredFormats[os]) {
      const name = packageFileName(os, arch, '1.0.7', ext)
      await writeFile(join(root, name), 'fixture bytes, not a native build')
    }
    const results = await verifyPackages(root, os, arch, '1.0.7')
    expect(results).toHaveLength(requiredFormats[os].length)
    expect(results.every(f => f.bytes > 0 && /^[a-f0-9]{64}$/.test(f.sha256))).toBe(true)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('rejects empty and oversized packages and stale update metadata', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pbt-package-check-'))
  const name = 'pbtmodlauncherx-1.0.7-arm64.dmg'
  try {
    await writeFile(join(root, name), '')
    await expect(verifyPackages(root, 'macOS', 'arm64', '1.0.7')).rejects.toThrow('Empty package')
    await truncate(join(root, name), 2 * 1024 ** 3)
    await expect(verifyPackages(root, 'macOS', 'arm64', '1.0.7')).rejects.toThrow('2 GiB')
    await writeFile(join(root, name), 'actual package')
    await writeFile(join(root, 'latest-mac.yml'), 'version: 1.0.7\nfiles:\n  - url: missing.dmg\n    sha512: bad\n')
    await expect(verifyPackages(root, 'macOS', 'arm64', '1.0.7')).rejects.toThrow('missing or incompatible')
    const sha512 = createHash('sha512').update('actual package').digest('base64')
    await writeFile(join(root, 'latest-mac.yml'), `version: 1.0.7\nfiles:\n  - url: ${name}\n    sha512: ${sha512}\n`)
    await expect(verifyPackages(root, 'macOS', 'arm64', '1.0.7')).resolves.toHaveLength(1)
    await writeFile(join(root, `${name}.sha256`), 'a'.repeat(64))
    await expect(verifyPackages(root, 'macOS', 'arm64', '1.0.7')).rejects.toThrow('sidecar mismatch')
    await rm(join(root, `${name}.sha256`))
    await writeFile(join(root, name), 'corrupt package')
    await expect(verifyPackages(root, 'macOS', 'arm64', '1.0.7')).rejects.toThrow('checksum mismatch')
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('rejects incorrect advertised sizes and inconsistent legacy update fields', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pbt-package-check-'))
  const name = 'pbtmodlauncherx-1.0.7-arm64.dmg'
  const body = Buffer.from('complete DMG fixture')
  const sha512 = createHash('sha512').update(body).digest('base64')
  const feed = { version: '1.0.7', files: [{ url: name, sha512, size: body.length + 1 }], path: name, sha512 }
  const save = () => writeFile(join(root, 'latest-mac.yml'), JSON.stringify(feed))
  try {
    await writeFile(join(root, name), body)
    await save()
    await expect(verifyPackages(root, 'macOS', 'arm64', '1.0.7')).rejects.toThrow('size mismatch')
    feed.files[0].size = body.length
    feed.path = 'pbtmodlauncherx-1.0.7-x64.dmg'
    await save()
    await expect(verifyPackages(root, 'macOS', 'arm64', '1.0.7')).rejects.toThrow('legacy update metadata')
    feed.path = name
    feed.sha512 = 'bad'
    await save()
    await expect(verifyPackages(root, 'macOS', 'arm64', '1.0.7')).rejects.toThrow('legacy update metadata')
    feed.sha512 = sha512
    await save()
    await expect(verifyPackages(root, 'macOS', 'arm64', '1.0.7')).resolves.toHaveLength(1)
  } finally { await rm(root, { recursive: true, force: true }) }
})
