import { afterEach, beforeEach, expect, test } from 'vitest'
import { mkdtemp, mkdir, readdir, rm, symlink, writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { ServerModDecisionStore, serverModDecisionKey, validateServerModOverride } from './serverModDecisions'
let root: string
beforeEach(async () => { root = await mkdtemp(join(tmpdir(), 'pbt-mod-decisions-')) })
afterEach(async () => { await rm(root, { recursive: true, force: true }) })
test('persists across store restarts without touching instances and isolates their decisions', async () => {
  const store = new ServerModDecisionStore(() => join(root, 'cache'))
  const instance = join(root, 'instancia é'); await mkdir(instance)
  const key = serverModDecisionKey('26.1', 'fabric', 'fixture', 'a'.repeat(64))
  await store.update(instance, { [key]: { override: { server: 'recommended' } } })
  expect((await new ServerModDecisionStore(() => join(root, 'cache')).read(instance)).entries[key].override?.server).toBe('recommended')
  expect((await store.read(join(root, 'other'))).entries[key]).toBeUndefined()
  expect(await readdir(instance)).toEqual([])
})
test('exact Minecraft, loader hotfix and file hashes independently invalidate previous decisions', () => {
  const original = serverModDecisionKey('26.1', 'neoforge', 'fixture.1', 'a'.repeat(64))
  for (const key of [serverModDecisionKey('1.21.11', 'neoforge', 'fixture.1', 'a'.repeat(64)), serverModDecisionKey('26.1', 'neoforge', 'fixture.2', 'a'.repeat(64)), serverModDecisionKey('26.1', 'neoforge', 'fixture.1', 'b'.repeat(64))]) expect(key).not.toBe(original)
})
test('concurrent provider updates retain user decisions and reset only removes the override', async () => {
  const store = new ServerModDecisionStore()
  const key = serverModDecisionKey('1.21.1', 'fabric', 'fixture', 'a'.repeat(64))
  await Promise.all([store.update(root, { [key]: { override: { type: 'both', server: 'required' } } }), store.update(root, { [key]: { provider: { compatible: true, necessity: 'recommended', evidence: ['modrinth.server_side=optional'] } } })])
  expect((await store.read(root)).entries[key]).toHaveProperty('override.server', 'required')
  await store.update(root, { [key]: { override: {} } })
  expect((await store.read(root)).entries[key]).toHaveProperty('provider.necessity', 'recommended')
  expect(await readdir(root)).toEqual(['.pbt-server-mod-decisions.json'])
})
test('invalid or corrupt persistence is reported instead of silently discarding preferences', async () => {
  await writeFile(join(root, '.pbt-server-mod-decisions.json'), 'invalid json')
  await expect(new ServerModDecisionStore().read(root)).rejects.toThrow()
  expect(() => validateServerModOverride({ server: 'paid' } as never)).toThrow('invalidSelection')
  expect(() => serverModDecisionKey('../escape', 'fabric', '', 'a'.repeat(64))).toThrow('invalidSelection')
})
test('refuses symlink storage and leaves external files intact', async () => {
  const external = join(root, 'external'); await mkdir(external); await writeFile(join(external, 'marker'), 'intact')
  await symlink(external, join(root, 'cache'), 'junction')
  await expect(new ServerModDecisionStore(() => join(root, 'cache')).read(root)).rejects.toThrow('symlink')
  expect(await readFile(join(external, 'marker'), 'utf8')).toBe('intact')
})
