import { MinecraftFolder } from '@xmcl/core'
import { readFile } from 'node:fs/promises'
import { expect, test, vi } from 'vitest'
import { createLabyModInstallWorkflow, resolveLabyModMetadataInstallManifest } from './labymod'
import { getLabyModMinecraftVersion, type LabyModManifest } from './labymod.browser'
import { createNodeInstallRuntime, executeInstallManifest } from './installManifest'
import { resolveVersionInstallManifest } from './versionInstallManifest'

const manifest = {
  labyModVersion: '4.6.27', commitReference: '16d92a4d', sha1: 'a'.repeat(40), size: 123,
  assets: {}, minecraftVersions: [
    { tag: '1.8', version: '1.8.9', customManifestUrl: 'https://releases.r2.labymod.net/1.8.9.json' },
    { tag: '1.18', version: '1.18.2', customManifestUrl: 'https://releases.r2.labymod.net/1.18.2.json' },
  ],
} as unknown as LabyModManifest

test('does not offer or install the 1.8 family tag as Minecraft 1.8', async ({ temp }) => {
  expect(getLabyModMinecraftVersion(manifest, '1.8')).toBeUndefined()
  expect(() => createLabyModInstallWorkflow(manifest, '1.8', MinecraftFolder.from(temp))).toThrow('1.8')
  const resolver = {
    getMinecraftVersion: vi.fn().mockResolvedValue({ id: '1.8' }),
    findLocalVersion: vi.fn().mockResolvedValue(undefined),
    getLabyModManifest: vi.fn().mockResolvedValue(manifest),
  }
  await expect(resolveVersionInstallManifest({ runtime: { minecraft: '1.8', labyMod: '4.6.27' } }, resolver))
    .rejects.toThrow('does not support Minecraft 1.8')
})

test('selects Minecraft 1.8.9 using the provider version and downloads its exact profile', async ({ temp }) => {
  expect(getLabyModMinecraftVersion(manifest, '1.8.9')?.tag).toBe('1.8')
  const workflow = createLabyModInstallWorkflow(manifest, '1.8.9', MinecraftFolder.from(temp))
  const stage = await workflow.next()
  expect(stage.done).toBe(false)
  if (stage.done) throw new Error('Expected metadata stage')
  const files = stage.plan.tasks[0]
  expect(files.type).toBe('files')
  if (files.type !== 'files') throw new Error('Expected metadata files')
  expect(files.files[1].urls).toEqual([manifest.minecraftVersions[0].customManifestUrl])
})

test('materializes a correctly inherited, recognizable 1.8.9 profile without foreign libraries', async ({ temp }) => {
  const folder = MinecraftFolder.from(temp)
  const source = { id: '1.8.9', _minecraftVersion: '1.8.9', libraries: [], mainClass: 'net.minecraft.launchwrapper.Launch' }
  const libraries = ['all', '1.8', '1.8.9', '1.20.1'].map((minecraftVersion, index) => ({
    minecraftVersion, name: `test:library${index}:1`, url: 'https://example.com/library.jar', sha1: 'b'.repeat(40), size: 1,
  })) as any
  const resolved = resolveLabyModMetadataInstallManifest(manifest, '1.8.9', folder, 'production', libraries, source)
  await executeInstallManifest(resolved.plan, createNodeInstallRuntime())
  const profile = JSON.parse(await readFile(folder.getVersionJson(resolved.version), 'utf8'))
  expect(profile.inheritsFrom).toBe('1.8.9')
  expect(profile).not.toHaveProperty('inheritFrom')
  expect(profile.id).toMatch(/^1\.8\.9-LabyMod/)
  expect(profile.libraries.map((library: any) => library.name)).toEqual([
    'test:library0:1', 'test:library1:1', 'test:library2:1', 'net.labymod:LabyMod:4.6.27',
  ])
  expect(source).not.toHaveProperty('inheritsFrom')
})

test('rejects a cached profile whose base disagrees with the selected Minecraft version', ({ temp }) => {
  expect(() => resolveLabyModMetadataInstallManifest(manifest, '1.8.9', MinecraftFolder.from(temp), 'production', [], {
    _minecraftVersion: '1.8', libraries: [],
  })).toThrow('requires Minecraft 1.8, not 1.8.9')
})

test('does not hardcode 1.8.9 for other supported versions or future genuine 1.8 support', () => {
  expect(getLabyModMinecraftVersion(manifest, '1.18')).toBeUndefined()
  expect(getLabyModMinecraftVersion(manifest, '1.18.2')?.version).toBe('1.18.2')
  const future = { ...manifest, minecraftVersions: [{ ...manifest.minecraftVersions[0], version: '1.8' }] }
  expect(getLabyModMinecraftVersion(future, '1.8')?.version).toBe('1.8')
})
