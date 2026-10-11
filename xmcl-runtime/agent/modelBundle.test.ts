import { createHash } from 'crypto'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { dirname, join } from 'path'
import { afterEach, expect, test } from 'vitest'
import { FACTORY_MANIFEST, FACTORY_MODEL, FACTORY_SOURCE, HF_FACTORY_MANIFEST, HF_FACTORY_MODEL, HF_SOURCE, factoryDescriptors, installFactoryModel, publishSeedFile, validateFactoryModel } from './modelBundle'

const paths: string[] = []
test('pins only the official 4B Q4_K_M seed rather than the optional light model', () => {
  expect(FACTORY_MODEL).toBe('qwen3:4b-q4_K_M')
  expect(FACTORY_MANIFEST).toBe('manifests/registry.ollama.ai/library/qwen3/4b-q4_K_M')
  expect(FACTORY_SOURCE).toBe('https://registry.ollama.ai/v2/library/qwen3/manifests/4b-q4_K_M')
})
afterEach(async () => { for (const path of paths.splice(0)) await rm(path, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }) })
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'pbt-seed-')); paths.push(root)
  const bundle = join(root, 'bundle'); await mkdir(join(bundle, 'blobs'), { recursive: true })
  const objects = [
    { mediaType: 'application/vnd.docker.container.image.v1+json', body: JSON.stringify({ model_family: 'qwen3', file_type: 'Q4_K_M' }) },
    { mediaType: 'application/vnd.ollama.image.model', body: 'GGUF fixture bytes, NOT a real model' },
    { mediaType: 'application/vnd.ollama.image.license', body: 'Apache License\nVersion 2.0\nFixture only' },
  ]
  const entries = []
  for (const object of objects) {
    const digest = createHash('sha256').update(object.body).digest('hex')
    await writeFile(join(bundle, 'blobs', 'sha256-' + digest), object.body)
    entries.push({ digest: 'sha256:' + digest, size: Buffer.byteLength(object.body), mediaType: object.mediaType })
  }
  const reference = JSON.stringify({ schemaVersion: 2, config: entries[0], layers: entries.slice(1) })
  await mkdir(dirname(join(bundle, FACTORY_MANIFEST)), { recursive: true })
  await writeFile(join(bundle, FACTORY_MANIFEST), reference)
  await writeFile(join(bundle, 'official-manifest.json'), reference)
  await writeFile(join(bundle, 'LICENSE'), objects[2].body)
  await writeFile(join(bundle, 'seed.json'), JSON.stringify({ schema: 1, model: FACTORY_MODEL, source: FACTORY_SOURCE, referenceSha256: createHash('sha256').update(reference).digest('hex') }))
  return { root, bundle, entries }
}

test('rejects a fabricated imported seed whose weights do not match the manufacturer digest', async () => {
  const { bundle } = await fixture()
  await mkdir(dirname(join(bundle, HF_FACTORY_MANIFEST)), { recursive: true })
  await writeFile(join(bundle, HF_FACTORY_MANIFEST), await readFile(join(bundle, FACTORY_MANIFEST)))
  const index = JSON.parse(await readFile(join(bundle, 'seed.json'), 'utf8'))
  await writeFile(join(bundle, 'seed.json'), JSON.stringify({ ...index, model: HF_FACTORY_MODEL, source: HF_SOURCE }))
  await expect(validateFactoryModel(bundle)).rejects.toThrow('ollama_seed_hf_reference_mismatch')
})

test('installs a validated fixture offline, publishes its tag last and retains it on restart', async () => {
  const { root, bundle } = await fixture(); const models = join(root, 'models')
  expect((await validateFactoryModel(bundle)).index.model).toBe(FACTORY_MODEL)
  expect(await installFactoryModel(bundle, models)).toBe(true)
  expect(await readFile(join(models, FACTORY_MANIFEST), 'utf8')).toBe(await readFile(join(bundle, FACTORY_MANIFEST), 'utf8'))
  expect(await installFactoryModel(bundle, models)).toBe(false)
})

test('never overwrites an existing user model revision or unrelated models', async () => {
  const { root, bundle } = await fixture(); const models = join(root, 'models')
  await mkdir(dirname(join(models, FACTORY_MANIFEST)), { recursive: true })
  await writeFile(join(models, FACTORY_MANIFEST), 'user revision')
  await writeFile(join(models, 'personal-model'), 'preserved')
  expect(await installFactoryModel(bundle, models)).toBe(false)
  expect(await readFile(join(models, FACTORY_MANIFEST), 'utf8')).toBe('user revision')
  expect(await readFile(join(models, 'personal-model'), 'utf8')).toBe('preserved')
})

test('rejects changed source blobs and preserves corrupt existing destination files for diagnosis', async () => {
  const { root, bundle, entries } = await fixture(); const models = join(root, 'models')
  await mkdir(join(models, 'blobs'), { recursive: true })
  const name = 'blobs/' + entries[0].digest.replace(':', '-')
  await writeFile(join(models, name), 'bad destination')
  await expect(installFactoryModel(bundle, models)).rejects.toThrow('existing_blob_corrupt')
  expect(await readFile(join(models, name), 'utf8')).toBe('bad destination')
  await writeFile(join(bundle, name), 'bad source')
  await expect(validateFactoryModel(bundle)).rejects.toThrow('blob_mismatch')
})

test('reuses identical existing blobs instead of duplicating them', async () => {
  const { root, bundle, entries } = await fixture(); const models = join(root, 'models')
  await mkdir(join(models, 'blobs'), { recursive: true })
  const name = 'blobs/' + entries[0].digest.replace(':', '-')
  await writeFile(join(models, name), await readFile(join(bundle, name)))
  expect(await installFactoryModel(bundle, models)).toBe(true)
  expect(await readFile(join(models, name))).toEqual(await readFile(join(bundle, name)))
})

test('rejects undeclared files so packaging cannot accidentally include private data', async () => {
  const { bundle } = await fixture()
  await writeFile(join(bundle, 'credentials.json'), 'fixture, not a secret')
  await expect(validateFactoryModel(bundle)).rejects.toThrow('unlisted_file')
})

test('rejects unsafe digest paths before a preparation script reads any license blob', () => {
  expect(() => factoryDescriptors({ schemaVersion: 2, config: { digest: '../../outside', size: 1, mediaType: 'config' }, layers: [{ digest: 'sha256:' + 'a'.repeat(64), size: 1, mediaType: 'model' }] })).toThrow('invalid_descriptor')
})

test('publishes through verified conventional copy when hardlinks are unsupported', async () => {
  const { root, bundle, entries } = await fixture()
  const source = join(bundle, 'blobs', entries[1].digest.replace(':', '-'))
  const destination = join(root, 'portable-model')
  const unsupported = async () => { throw Object.assign(new Error('No hardlinks'), { code: 'ENOTSUP' }) }
  await publishSeedFile(source, destination, unsupported)
  expect(await readFile(destination)).toEqual(await readFile(source))
  await expect(publishSeedFile(source, destination, unsupported)).rejects.toMatchObject({ code: 'EEXIST' })
})

test('does not hide permission errors behind a fallback or overwrite the destination', async () => {
  const { root, bundle } = await fixture()
  const destination = join(root, 'denied')
  await expect(publishSeedFile(join(bundle, 'LICENSE'), destination, async () => { throw Object.assign(new Error('Denied'), { code: 'EACCES' }) })).rejects.toMatchObject({ code: 'EACCES' })
  await expect(readFile(destination)).rejects.toMatchObject({ code: 'ENOENT' })
})
