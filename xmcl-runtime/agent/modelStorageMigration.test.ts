import { createHash } from 'crypto'
import { mkdtemp, mkdir, readFile, rm, writeFile, lstat } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, expect, test } from 'vitest'
import { migrateManagedModelStorage, migrateManagedStorageLocation } from './modelStorageMigration'

const roots: string[] = []
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }) })
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'pbt107 migration spaces-')); roots.push(root)
  const legacy = join(root, 'AppData', 'ai')
  const destination = join(root, 'Data root', 'PbtAdmin', 'Ollama')
  const models = join(legacy, 'models')
  await mkdir(join(models, 'blobs'), { recursive: true })
  const body = 'model content retained'
  const hash = createHash('sha256').update(body).digest('hex')
  const descriptor = { digest: `sha256:${hash}`, size: Buffer.byteLength(body), mediaType: 'application/vnd.ollama.image.model' }
  const manifest = join('manifests', 'registry.ollama.ai', 'library', 'qwen3', 'test')
  await mkdir(join(models, 'manifests', 'registry.ollama.ai', 'library', 'qwen3'), { recursive: true })
  await writeFile(join(models, manifest), JSON.stringify({ schemaVersion: 2, config: descriptor, layers: [descriptor] }))
  await writeFile(join(models, 'blobs', `sha256-${hash}`), body)
  return { legacy, destination, models, hash, body, manifest }
}

test('migrates verified models and manifests, keeps original and supports safe retry', async () => {
  const f = await fixture()
  await migrateManagedModelStorage(f.legacy, f.destination)
  expect(await readFile(join(f.destination, 'models', 'blobs', `sha256-${f.hash}`), 'utf8')).toBe(f.body)
  expect(await readFile(join(f.models, f.manifest), 'utf8')).toBe(await readFile(join(f.destination, 'models', f.manifest), 'utf8'))
  expect(await readFile(join(f.models, 'blobs', `sha256-${f.hash}`), 'utf8')).toBe(f.body)
  await migrateManagedModelStorage(f.legacy, f.destination)
  expect((await lstat(join(f.destination, '.legacy-storage-migrated'))).isFile()).toBe(true)
})

test('follows a changed launcher data root and keeps the prior managed copy intact', async () => {
  const f = await fixture()
  await migrateManagedStorageLocation(f.legacy, f.destination)
  const moved = join(f.destination, '..', '..', '..', 'Other drive root', 'PbtAdmin', 'Ollama')
  await migrateManagedStorageLocation(f.legacy, moved)
  expect(await readFile(join(moved, 'models', f.manifest), 'utf8')).toBe(await readFile(join(f.destination, 'models', f.manifest), 'utf8'))
  expect(await readFile(join(moved, 'models', 'blobs', `sha256-${f.hash}`), 'utf8')).toBe(f.body)
  expect(await readFile(join(f.destination, 'models', 'blobs', `sha256-${f.hash}`), 'utf8')).toBe(f.body)
  expect(JSON.parse(await readFile(join(f.legacy, 'managed-storage-location.json'), 'utf8')).data).toBe(moved)
})

test('does not adopt an unrelated storage-location record', async () => {
  const f = await fixture()
  await writeFile(join(f.legacy, 'managed-storage-location.json'), JSON.stringify({ launcher: 'Other application', format: 1, data: f.destination }))
  await migrateManagedStorageLocation(f.legacy, f.destination)
  expect(await readFile(join(f.destination, 'models', 'blobs', `sha256-${f.hash}`), 'utf8')).toBe(f.body)
})
test('corruption never publishes a model manifest and releases the migration lock', async () => {
  const f = await fixture()
  await writeFile(join(f.models, 'blobs', `sha256-${f.hash}`), 'corrupt')
  await expect(migrateManagedModelStorage(f.legacy, f.destination)).rejects.toThrow('integrity')
  await expect(lstat(join(f.destination, 'models', f.manifest))).rejects.toMatchObject({ code: 'ENOENT' })
  await expect(lstat(join(f.destination, '.storage-migration.lock'))).rejects.toMatchObject({ code: 'ENOENT' })
})
test('preserves explicit external and custom model storage without copying it', async () => {
  for (const config of [{ externalOrigin: 'http://127.0.0.1:11434' }, { modelsDirectory: '/independent/models' }]) {
    const f = await fixture()
    await writeFile(join(f.legacy, 'config.json'), JSON.stringify(config))
    await migrateManagedModelStorage(f.legacy, f.destination)
    expect(JSON.parse(await readFile(join(f.destination, 'config.json'), 'utf8'))).toEqual(config)
    await expect(lstat(join(f.destination, 'models', f.manifest))).rejects.toMatchObject({ code: 'ENOENT' })
  }
})
test('refuses a store locked by an active managed engine', async () => {
  const f = await fixture()
  await writeFile(join(f.models, '.pbtadmin-engine.lock'), '{}')
  await expect(migrateManagedModelStorage(f.legacy, f.destination)).rejects.toThrow('locked_or_readonly')
})
test('does not overwrite existing tags when resuming a partially copied store', async () => {
  const f = await fixture()
  const manifest = join(f.destination, 'models', f.manifest)
  await mkdir(join(f.destination, 'models', 'manifests', 'registry.ollama.ai', 'library', 'qwen3'), { recursive: true })
  await writeFile(manifest, 'user tag retained')
  await migrateManagedModelStorage(f.legacy, f.destination)
  expect(await readFile(manifest, 'utf8')).toBe('user tag retained')
})
