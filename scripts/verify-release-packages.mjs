import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

export const requiredFormats = {
  Windows: ['win32-x64.zip', 'win32-x64.appx'],
  Linux: ['AppImage', 'deb', 'rpm', 'tar.xz', 'pacman'],
  macOS: ['dmg'],
}
const require = createRequire(new URL('../xmcl-electron-app/package.json', import.meta.url))
const builderRequire = createRequire(require.resolve('app-builder-lib'))
const { Arch, getArtifactArchName } = builderRequire('builder-util')
export function packageFileName(os, arch, version, format) {
  return os === 'Windows' ? `pbtmodlauncherx-${version}-${format}`
    : `pbtmodlauncherx-${version}-${os === 'Linux' ? getArtifactArchName(Arch[arch], format) : arch}.${format}`
}

/** Verify final files, never infer success from an unpacked directory. */
export async function verifyPackages(root, os, arch, version) {
  if (!requiredFormats[os] || !['x64', 'arm64'].includes(arch) || (os === 'Windows' && arch !== 'x64')) throw new Error('Unsupported package target')
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error('Invalid package version')
  const names = await readdir(root)
  const expected = requiredFormats[os].map(format => packageFileName(os, arch, version, format))
  if (os === 'Windows') {
    const deskGap = `pbtmodlauncherx-deskgap-${version}-win32-x64.exe`
    if (names.includes(deskGap)) expected.push(deskGap)
  }
  const receipts = []
  for (const name of expected) {
    if (!names.includes(name)) throw new Error(`Missing required package: ${name}`)
    const file = join(root, name)
    const info = await stat(file)
    if (!info.isFile() || info.size === 0) throw new Error(`Empty package: ${name}`)
    if (info.size >= 2 * 1024 ** 3) throw new Error(`Package exceeds the 2 GiB release limit: ${name}`)
    const hash = createHash('sha256')
    for await (const bytes of createReadStream(file)) hash.update(bytes)
    const sha256 = hash.digest('hex')
    if (names.includes(`${name}.sha256`) && (await readFile(join(root, `${name}.sha256`), 'utf8')).trim() !== sha256) throw new Error(`Package SHA-256 sidecar mismatch: ${name}`)
    receipts.push({ name, bytes: info.size, sha256 })
  }
  // electron-builder writes several Linux formats into the same update feed.
  // Every advertised byte digest must describe a complete available package.
  const { load } = builderRequire('js-yaml')
  for (const name of names.filter(name => /^(latest|beta|alpha).*\.yml$/.test(name))) {
    const feed = load(await readFile(join(root, name), 'utf8'))
    if (feed?.version !== version || !Array.isArray(feed.files) || !feed.files.length) throw new Error(`Invalid update metadata: ${name}`)
    for (const entry of feed.files) {
      if (typeof entry.url !== 'string' || !expected.includes(entry.url)) throw new Error(`Update metadata references a missing or incompatible package: ${name}`)
      if (entry.size !== undefined && entry.size !== receipts.find(file => file.name === entry.url)?.bytes) throw new Error(`Update metadata size mismatch: ${entry.url}`)
      const digest = createHash('sha512')
      for await (const bytes of createReadStream(join(root, entry.url))) digest.update(bytes)
      if (entry.sha512 !== digest.digest('base64')) throw new Error(`Update metadata checksum mismatch: ${entry.url}`)
    }
    if (feed.path !== undefined || feed.sha512 !== undefined) {
      const legacy = feed.files.find(entry => entry.url === feed.path)
      if (!legacy || feed.sha512 !== legacy.sha512) throw new Error(`Inconsistent legacy update metadata: ${name}`)
    }
  }
  await writeFile(join(root, `packages-${os}-${arch}.json`), JSON.stringify({ version, os, arch, packages: receipts }, null, 2) + '\n')
  await writeFile(join(root, `SHA256SUMS-${os}-${arch}.txt`), receipts.map(f => `${f.sha256}  ${f.name}\n`).join(''))
  return receipts
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  console.log(await verifyPackages(resolve(process.argv[2]), process.argv[3], process.argv[4], version))
}
