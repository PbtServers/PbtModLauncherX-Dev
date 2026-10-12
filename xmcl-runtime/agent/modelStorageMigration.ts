import { constants, createReadStream } from 'fs'
import { access, lstat, mkdir, open, readFile, readdir, rename, statfs, unlink, writeFile } from 'fs/promises'
import { createHash, randomUUID } from 'crypto'
import { isAbsolute, join, resolve } from 'path'
import { factoryDescriptors, publishSeedFile } from './modelBundle'

async function exists(path: string) {
  try { await lstat(path); return true } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
}

async function digest(path: string) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(path)) hash.update(chunk)
  return hash.digest('hex')
}

/** Track only the launcher's managed store, so a changed data root can copy its
 * previous default models without touching independent Ollama installations. */
export async function migrateManagedStorageLocation(legacy: string, destination: string) {
  const recordPath = join(legacy, 'managed-storage-location.json')
  let source = legacy
  try {
    if ((await lstat(recordPath)).isSymbolicLink()) throw new Error('ollama_migration_invalid_source')
    const record = JSON.parse(await readFile(recordPath, 'utf8'))
    if (record.launcher === 'PbtModLauncherX' && record.format === 1 && typeof record.data === 'string' && isAbsolute(record.data) && await exists(record.data)) source = record.data
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  if (resolve(source) !== resolve(destination)) await migrateManagedModelStorage(source, destination)
  await mkdir(legacy, { recursive: true })
  const temporary = join(legacy, `managed-storage-location-${randomUUID()}.tmp`)
  try {
    await writeFile(temporary, JSON.stringify({ launcher: 'PbtModLauncherX', format: 1, data: resolve(destination) }), { flag: 'wx', mode: 0o600 })
    await rename(temporary, recordPath)
  } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error }) }
}

/** Copy only this launcher's legacy default store. Publish manifests last,
 * verify blob digests, preserve custom/external stores and never delete sources.
 * Interrupted copies can be retried without re-downloading existing blobs. */
export async function migrateManagedModelStorage(legacy: string, destination: string) {
  if (legacy === destination || !await exists(legacy)) return
  if ((await lstat(legacy)).isSymbolicLink()) throw new Error('ollama_migration_invalid_source')
  await mkdir(destination, { recursive: true })
  if ((await lstat(destination)).isSymbolicLink()) throw new Error('ollama_migration_invalid_destination')
  if (await exists(join(destination, '.legacy-storage-migrated'))) return
  const lockPath = join(destination, '.storage-migration.lock')
  const lock = await open(lockPath, 'wx', 0o600).catch(() => { throw new Error('ollama_store_locked_or_readonly') })
  try { await migrateStore(legacy, destination) } finally { await lock.close(); await unlink(lockPath) }
}

async function safeDirectory(path: string) {
  await mkdir(path, { recursive: true })
  const info = await lstat(path)
  if (info.isSymbolicLink() || !info.isDirectory()) throw new Error('ollama_migration_invalid_destination')
}

async function migrateStore(legacy: string, destination: string) {
  let modelCount = 0
  let config: { modelsDirectory?: string; externalOrigin?: string } = {}
  if (await exists(join(legacy, 'config.json'))) config = JSON.parse(await readFile(join(legacy, 'config.json'), 'utf8'))
  const hasDestinationConfig = await exists(join(destination, 'config.json'))
  // Explicit custom directories and independent engines retain their configuration.
  const source = join(legacy, 'models')
  const target = join(destination, 'models')
  if (config.modelsDirectory && isAbsolute(config.modelsDirectory) && resolve(config.modelsDirectory) === resolve(source)) delete config.modelsDirectory
  if (!hasDestinationConfig && !config.modelsDirectory && !config.externalOrigin && await exists(source)) {
    if (await exists(join(source, '.pbtadmin-engine.lock'))) throw new Error('ollama_store_locked_or_readonly')
    if (await exists(join(target, '.pbtadmin-engine.lock'))) throw new Error('ollama_store_locked_or_readonly')
    if ((await lstat(source)).isSymbolicLink()) throw new Error('ollama_migration_invalid_source')
    const manifests: { name: string; body: string }[] = []
    const blobs = new Map<string, number>()
    async function scan(path: string, prefix = '') {
      if ((await lstat(path)).isSymbolicLink()) throw new Error('ollama_migration_invalid_source')
      for (const entry of await readdir(path, { withFileTypes: true })) {
        const file = join(path, entry.name)
        if (entry.isSymbolicLink()) throw new Error('ollama_migration_invalid_source')
        const name = prefix + entry.name
        if (entry.isDirectory()) await scan(file, name + '/')
        else if (entry.isFile()) {
          const body = await readFile(file, 'utf8')
          for (const descriptor of factoryDescriptors(JSON.parse(body))) blobs.set(descriptor.digest.replace(':', '-'), descriptor.size)
          manifests.push({ name, body })
        } else throw new Error('ollama_migration_invalid_source')
      }
    }
    if (await exists(join(source, 'manifests'))) await scan(join(source, 'manifests'))
    if (blobs.size && (await lstat(join(source, 'blobs'))).isSymbolicLink()) throw new Error('ollama_migration_invalid_source')
    await safeDirectory(target)
    await safeDirectory(join(target, 'blobs'))
    await access(target, constants.W_OK)
    const space = await statfs(target)
    let needed = 0
    for (const [name, size] of blobs) if (!await exists(join(target, 'blobs', name))) needed += size
    if (space.bavail * space.bsize < needed * 1.1) throw new Error('ollama_storage_insufficient')
    for (const [name, size] of blobs) {
      const original = join(source, 'blobs', name)
      const info = await lstat(original)
      if (!info.isFile() || info.size !== size || await digest(original) !== name.slice(7)) throw new Error('ollama_migration_integrity')
      const copy = join(target, 'blobs', name)
      if (!await exists(copy)) await publishSeedFile(original, copy)
      if ((await lstat(copy)).isSymbolicLink() || await digest(copy) !== name.slice(7)) throw new Error('ollama_migration_integrity')
    }
    for (const manifest of manifests) {
      const copy = join(target, 'manifests', ...manifest.name.split('/'))
      let parent = target
      for (const part of ['manifests', ...manifest.name.split('/').slice(0, -1)]) { parent = join(parent, part); await safeDirectory(parent) }
      if (!await exists(copy)) await publishSeedFile(join(source, 'manifests', ...manifest.name.split('/')), copy)
      // Existing tags belong to the user and are never overwritten.
    }
    modelCount = manifests.length
  }
  const configPath = join(destination, 'config.json')
  if (!await exists(configPath)) await writeFile(configPath, JSON.stringify(config), { flag: 'wx', mode: 0o600 })
  await writeFile(join(destination, '.legacy-storage-migrated'), JSON.stringify({ source: legacy, copiedAt: Date.now(), modelCount, sourcePreserved: true }), { flag: 'wx', mode: 0o600 })
}
