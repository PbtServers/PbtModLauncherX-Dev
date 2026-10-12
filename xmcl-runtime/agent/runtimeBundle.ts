import { createHash } from 'crypto'
import { createReadStream } from 'fs'
import { lstat, open, readFile, readdir, realpath } from 'fs/promises'
import { isAbsolute, join, relative, resolve } from 'path'

export interface OllamaBundle {
  version: string
  platform: string
  arch: string
  executable: string
  source: { url: string; sha256: string; release: string }
  files: { path: string; sha256: string }[]
}

export async function fileSha256(path: string) {
  const hash = createHash('sha256')
  for await (const data of createReadStream(path)) hash.update(data)
  return hash.digest('hex')
}

export function bundlePath(root: string, name: string) {
  if (!name || isAbsolute(name) || name.includes('\\') || name.split('/').some(part => !part || part === '.' || part === '..') || name.includes(':')) throw new Error('ollama_invalid_bundle_path')
  return resolve(root, name)
}

/** The archive digest is pinned from official release metadata by the preparer.
 * The verified manifest travels inside the signed launcher resources, not a user model directory. */
export async function validateOllamaBundle(root: string, platform = process.platform as string, arch = process.arch as string) {
  if (!['win32', 'linux', 'darwin'].includes(platform) || !['x64', 'arm64'].includes(arch)) throw new Error('ollama_architecture_unsupported')
  if ((await lstat(root)).isSymbolicLink()) throw new Error('ollama_invalid_bundle_path')
  const base = await realpath(root)
  const manifestStat = await lstat(join(base, 'bundle.json'))
  if (!manifestStat.isFile() || manifestStat.isSymbolicLink()) throw new Error('ollama_invalid_manifest')
  const manifest: OllamaBundle = JSON.parse(await readFile(join(base, 'bundle.json'), 'utf8'))
  if (manifest.platform !== platform || manifest.arch !== arch) throw new Error('ollama_architecture_mismatch')
  if (!/^v\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(manifest.version) || !/^[a-f0-9]{64}$/.test(manifest.source?.sha256) || !manifest.source.url.startsWith(`https://github.com/ollama/ollama/releases/download/${manifest.version}/`) || manifest.source.release !== `https://api.github.com/repos/ollama/ollama/releases/tags/${manifest.version}`) throw new Error('ollama_untrusted_source')
  if (!Array.isArray(manifest.files) || !manifest.files.length || manifest.files.length > 20000) throw new Error('ollama_invalid_manifest')
  const names = new Set<string>()
  for (const file of manifest.files) {
    if (names.has(file.path) || !/^[a-f0-9]{64}$/.test(file.sha256)) throw new Error('ollama_invalid_manifest')
    names.add(file.path)
    const path = bundlePath(base, file.path)
    // Walk ancestors too: a symlinked directory cannot escape the verified tree.
    let ancestor = base
    for (const part of file.path.split('/')) {
      ancestor = join(ancestor, part)
      if ((await lstat(ancestor)).isSymbolicLink()) throw new Error('ollama_bundle_symlink')
    }
    if (!(await lstat(path)).isFile() || relative(base, await realpath(path)).startsWith('..')) throw new Error('ollama_invalid_bundle_path')
    if (await fileSha256(path) !== file.sha256) throw new Error('ollama_hash_mismatch')
  }
  async function checkTree(directory: string) {
    for (const item of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, item.name)
      if (item.isSymbolicLink()) throw new Error('ollama_bundle_symlink')
      if (item.isDirectory()) await checkTree(path)
      else if (!names.has(relative(base, path).replaceAll('\\', '/')) && path !== join(base, 'bundle.json')) throw new Error('ollama_unlisted_file')
    }
  }
  await checkTree(base)
  if (!names.has(manifest.executable) || !names.has('LICENSE')) throw new Error('ollama_incomplete_bundle')
  if (!(await readFile(join(base, 'LICENSE'), 'utf8')).includes('MIT License')) throw new Error('ollama_missing_license')
  const executable = bundlePath(base, manifest.executable)
  await validateExecutableArchitecture(executable, platform, arch)
  return { manifest, executable }
}

/** Shared binary-header check for the official runtime and packaged launcher. */
export async function validateExecutableArchitecture(executable: string, platform: string, arch: string) {
  const descriptor = await open(executable, 'r')
  const header = Buffer.alloc(4096)
  try { await descriptor.read(header, 0, header.length, 0) } finally { await descriptor.close() }
  if (platform === 'win32') {
    const offset = header.length >= 64 ? header.readUInt32LE(60) : -1
    if (header.toString('ascii', 0, 2) !== 'MZ' || offset < 0 || offset + 6 > header.length || header.toString('ascii', offset, offset + 4) !== 'PE\0\0' || header.readUInt16LE(offset + 4) !== (arch === 'x64' ? 0x8664 : 0xaa64)) throw new Error('ollama_executable_mismatch')
  } else if (platform === 'linux') {
    if (header.length < 20 || header.toString('hex', 0, 4) !== '7f454c46' || header[4] !== 2 || header[5] !== 1 || header.readUInt16LE(18) !== (arch === 'x64' ? 62 : 183)) throw new Error('ollama_executable_mismatch')
  } else {
    const cpu = arch === 'x64' ? 0x01000007 : 0x0100000c
    const magic = header.readUInt32BE(0)
    if (magic === 0xcafebabe || magic === 0xcafebabf) {
      const count = header.readUInt32BE(4)
      const stride = magic === 0xcafebabe ? 20 : 32
      if (count < 1 || count > 16 || !Array.from({ length: count }, (_, i) => header.readUInt32BE(8 + stride * i)).includes(cpu)) throw new Error('ollama_executable_mismatch')
    } else if (header.readUInt32LE(0) !== 0xfeedfacf || header.readUInt32LE(4) !== cpu) throw new Error('ollama_executable_mismatch')
  }
}
