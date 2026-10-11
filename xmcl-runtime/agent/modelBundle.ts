import { createHash, randomUUID } from 'crypto'
import { createReadStream, constants } from 'fs'
import { copyFile, link, lstat, mkdir, open, readFile, readdir, realpath, statfs, unlink } from 'fs/promises'
import { dirname, join, resolve } from 'path'

export const FACTORY_MODEL = 'qwen3:4b-q4_K_M'
export const FACTORY_MANIFEST = 'manifests/registry.ollama.ai/library/qwen3/4b-q4_K_M'
export const FACTORY_SOURCE = 'https://registry.ollama.ai/v2/library/qwen3/manifests/4b-q4_K_M'
export const HF_FACTORY_MODEL = 'pbtadmin-qwen3:4b-q4_K_M'
export const HF_FACTORY_MANIFEST = 'manifests/registry.ollama.ai/library/pbtadmin-qwen3/4b-q4_K_M'
// Manufacturer's Git LFS pointer, not a digest calculated from an untrusted download.
export const HF_REVISION = 'a9a60d009fa7ff9606305047c2bf77ac25dbec49'
export const HF_SOURCE = `https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/${HF_REVISION}/Qwen3-4B-Q4_K_M.gguf`
export const HF_SHA256 = '7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5'
export const HF_BYTES = 2497280256
interface Descriptor { digest: string; size: number; mediaType: string }
export interface FactoryModelBundle { schema: 1; model: string; source: string; referenceSha256: string }

/** Exclusive publication: a filesystem without hardlinks can copy instead.
 * On abrupt interruption an incomplete final file is rejected by SHA-256;
 * the model tag is published last and no existing user file is overwritten. */
export async function publishSeedFile(source: string, dest: string, linkFile = link) {
  const expected = await sha(source)
  const temporary = resolve(dirname(dest), `.pbt-seed-${randomUUID()}.tmp`)
  await copyFile(source, temporary, constants.COPYFILE_EXCL | constants.COPYFILE_FICLONE)
  try {
    if (await sha(temporary) !== expected) throw new Error('ollama_seed_copy_mismatch')
    try { await linkFile(temporary, dest) } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (!['ENOTSUP', 'EOPNOTSUPP', 'ENOSYS', 'EXDEV', 'EINVAL', 'EPERM'].includes(code || '')) throw error
      // EXCL refuses both existing files and symlinks; permissions are not altered.
      try { await copyFile(temporary, dest, constants.COPYFILE_EXCL) } catch (copyError) {
        if ((copyError as NodeJS.ErrnoException).code === 'EFBIG') throw new Error('ollama_seed_file_too_large')
        throw copyError
      }
      const file = await open(dest, 'r+')
      try { await file.sync() } finally { await file.close() }
      if (await sha(dest) !== expected) throw new Error('ollama_seed_copy_mismatch')
    }
  } finally { await unlink(temporary) }
}

async function sha(path: string) {
  const hash = createHash('sha256')
  for await (const body of createReadStream(path)) hash.update(body)
  return hash.digest('hex')
}
export function factoryDescriptors(manifest: any): Descriptor[] {
  if (manifest?.schemaVersion !== 2 || !Array.isArray(manifest.layers) || !manifest.layers.length || manifest.layers.length > 100) throw new Error('ollama_seed_invalid_manifest')
  const entries = [manifest.config, ...manifest.layers]
  for (const entry of entries) if (!/^sha256:[a-f0-9]{64}$/.test(entry?.digest) || !Number.isSafeInteger(entry.size) || entry.size < 0 || typeof entry.mediaType !== 'string') throw new Error('ollama_seed_invalid_descriptor')
  return entries.map(entry => ({ digest: entry.digest, size: entry.size, mediaType: entry.mediaType }))
}
async function regular(root: string, name: string) {
  let path = root
  for (const part of name.split('/')) {
    if (!part || part === '.' || part === '..' || part.includes('\\') || part.includes(':')) throw new Error('ollama_seed_invalid_path')
    path = join(path, part)
    if ((await lstat(path)).isSymbolicLink()) throw new Error('ollama_seed_symlink')
  }
  if (!(await lstat(path)).isFile()) throw new Error('ollama_seed_invalid_file')
  return path
}
export async function validateFactoryModel(root: string) {
  if ((await lstat(root)).isSymbolicLink()) throw new Error('ollama_seed_symlink')
  const base = await realpath(root)
  const index: FactoryModelBundle = JSON.parse(await readFile(await regular(base, 'seed.json'), 'utf8'))
  const imported = index.model === HF_FACTORY_MODEL && index.source === HF_SOURCE
  const manifest = imported ? HF_FACTORY_MANIFEST : FACTORY_MANIFEST
  if (index.schema !== 1 || (!imported && (index.model !== FACTORY_MODEL || index.source !== FACTORY_SOURCE)) || !/^[a-f0-9]{64}$/.test(index.referenceSha256)) throw new Error('ollama_seed_untrusted_source')
  const reference = await regular(base, 'official-manifest.json')
  if (await sha(reference) !== index.referenceSha256) throw new Error('ollama_seed_reference_mismatch')
  const source = JSON.parse(await readFile(reference, 'utf8'))
  const entries = factoryDescriptors(source)
  const local = JSON.parse(await readFile(await regular(base, manifest), 'utf8'))
  if (JSON.stringify(factoryDescriptors(local)) !== JSON.stringify(entries)) throw new Error('ollama_seed_manifest_mismatch')
  const files = [manifest]
  let bytes = 0
  for (const entry of entries) {
    const name = 'blobs/' + entry.digest.replace(':', '-')
    const file = await regular(base, name)
    if ((await lstat(file)).size !== entry.size || await sha(file) !== entry.digest.slice(7)) throw new Error('ollama_seed_blob_mismatch')
    if (!files.includes(name)) { files.push(name); bytes += entry.size }
  }
  const config = JSON.parse(await readFile(join(base, 'blobs', source.config.digest.replace(':', '-')), 'utf8'))
  if (config.model_family !== 'qwen3' || config.file_type !== 'Q4_K_M') throw new Error('ollama_seed_quantization_mismatch')
  const weights = entries.find(entry => entry.mediaType === 'application/vnd.ollama.image.model')
  if (!weights) throw new Error('ollama_seed_weights_missing')
  if (imported && (weights.digest !== 'sha256:' + HF_SHA256 || weights.size !== HF_BYTES)) throw new Error('ollama_seed_hf_reference_mismatch')
  const descriptor = await open(join(base, 'blobs', weights.digest.replace(':', '-')), 'r')
  const magic = Buffer.alloc(4)
  try { await descriptor.read(magic, 0, 4, 0) } finally { await descriptor.close() }
  if (magic.toString('ascii') !== 'GGUF') throw new Error('ollama_seed_weights_invalid')
  const license = entries.find(entry => entry.mediaType === 'application/vnd.ollama.image.license')
  if (!license) throw new Error('ollama_seed_license_missing')
  const licenseBody = await readFile(join(base, 'blobs', license.digest.replace(':', '-')), 'utf8')
  if (!licenseBody.includes('Apache License') || !licenseBody.includes('Version 2.0') || await readFile(await regular(base, 'LICENSE'), 'utf8') !== licenseBody) throw new Error('ollama_seed_license_mismatch')
  const allowed = new Set([...files, 'LICENSE', 'seed.json', 'official-manifest.json'])
  const scan = async (directory: string, prefix = '') => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const name = prefix + entry.name
      if (entry.isSymbolicLink()) throw new Error('ollama_seed_symlink')
      if (entry.isDirectory()) await scan(join(directory, entry.name), name + '/')
      else if (!entry.isFile() || !allowed.has(name)) throw new Error('ollama_seed_unlisted_file')
    }
  }
  await scan(base)
  return { index, files, bytes, base, manifest }
}

/** Called under the managed engine's exclusive store lock, before serve. No network. */
export async function installFactoryModel(bundleRoot: string, models: string) {
  const bundle = await validateFactoryModel(bundleRoot)
  await mkdir(models, { recursive: true })
  if ((await lstat(models)).isSymbolicLink()) throw new Error('ollama_seed_symlink')
  const base = await realpath(models)
  const targetPath = async (name: string) => {
    let parent = base
    const parts = name.split('/')
    for (const part of parts.slice(0, -1)) {
      parent = join(parent, part)
      await mkdir(parent).catch(error => { if (error.code !== 'EEXIST') throw error })
      if ((await lstat(parent)).isSymbolicLink() || !(await lstat(parent)).isDirectory()) throw new Error('ollama_seed_symlink')
    }
    return join(parent, parts[parts.length - 1])
  }
  const manifest = await targetPath(bundle.manifest)
  // An existing user tag, even a differently pinned revision, is never replaced.
  try {
    const existing = await lstat(manifest)
    if (existing.isSymbolicLink() || !existing.isFile()) throw new Error('ollama_seed_invalid_file')
    return false
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
  const missing: string[] = []
  let needed = 0
  for (const name of bundle.files.filter(name => name.startsWith('blobs/'))) {
    const dest = await targetPath(name)
    try {
      if ((await lstat(dest)).isSymbolicLink() || await sha(dest) !== name.slice('blobs/sha256-'.length)) throw new Error('ollama_seed_existing_blob_corrupt')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      missing.push(name); needed += (await lstat(join(bundle.base, name))).size
    }
  }
  const space = await statfs(base)
  // Linux exposes FAT/MSDOS through statfs. Other hosts report EFBIG during copy.
  if (space.type === 0x4d44 && (await Promise.all(missing.map(name => lstat(join(bundle.base, name))))).some(file => file.size > 0xffffffff)) throw new Error('ollama_seed_file_too_large')
  if (space.bavail * space.bsize < needed + 16 * 1024 ** 2) throw new Error('ollama_seed_storage_insufficient')
  for (const name of [...missing, bundle.manifest]) {
    const dest = await targetPath(name)
    try { await publishSeedFile(join(bundle.base, name), dest) } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
      if (name !== bundle.manifest && await sha(dest) !== name.slice('blobs/sha256-'.length)) throw new Error('ollama_seed_existing_blob_corrupt')
    }
  }
  return true
}
