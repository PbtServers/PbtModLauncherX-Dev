import { MinecraftFolder } from '@xmcl/core'
import { expect, test, vi } from 'vitest'
import { resolveFabricInstallManifest } from './fabric'
import { resolveQuiltInstallManifest } from './quilt'
import { generateOptifineVersion } from './optifine'
import { resolveVersionInstallManifest } from './versionInstallManifest'

test.each([
  ['NeoForge', '1.21.1', 'neoForged', '21.1.257', 'neoforge'],
  ['Forge', '1.20.1', 'forge', '47.3.0', 'forge'],
  ['Fabric', '1.21.1', 'fabricLoader', '0.19.5', 'fabric'],
  ['Quilt', '1.21.1', 'quiltLoader', '0.27.1', 'quilt'],
  ['OptiFine', '1.8.9', 'optifine', 'HD_U_M5', 'optifine'],
])('%s keeps its exact Minecraft version through the installer recipe', async (_name, minecraft, field, loader, type) => {
  const resolver = {
    getMinecraftVersion: vi.fn(async (id: string) => ({ id } as any)),
    findLocalVersion: vi.fn().mockResolvedValue(undefined),
    getForgeVersion: vi.fn().mockResolvedValue({ version: loader }),
    getNeoForgedVersion: vi.fn().mockResolvedValue(loader),
  }
  const recipe = await resolveVersionInstallManifest({ runtime: { minecraft, [field]: loader } }, resolver)
  expect(recipe.kind).toBe('install')
  if (recipe.kind !== 'install') throw new Error('Expected fresh installation')
  expect(recipe.minecraft.id).toBe(minecraft)
  expect(recipe.runtime.minecraft).toBe(minecraft)
  expect(recipe.layers).toHaveLength(1)
  expect(recipe.layers[0].type).toBe(type)
  expect(resolver.getMinecraftVersion).toHaveBeenCalledWith(minecraft)
})

test.each([
  ['fabric', resolveFabricInstallManifest, '0.19.5', 'https://meta.fabricmc.net/v2'],
  ['quilt', resolveQuiltInstallManifest, '0.27.1', 'https://meta.quiltmc.org/v3'],
] as const)('%s requests the exact game/loader pair and preserves the provider profile', async (name, resolve, version, endpoint) => {
  const source = {
    id: 'provider-id', inheritsFrom: '1.21.1', mainClass: `${name}.Main`, libraries: [],
    arguments: { game: [], jvm: [] },
  }
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(source)))
  const result = await resolve({ minecraft: MinecraftFolder.from('temp/phase5-profile-unit'), minecraftVersion: '1.21.1', version, fetch })
  expect(fetch.mock.calls[0][0]).toBe(`${endpoint}/versions/loader/1.21.1/${version}/profile/json`)
  const task = result.plan.tasks[0]
  if (task.type !== 'materialize' || task.operations[0].type !== 'write') throw new Error('Expected profile write')
  const profile = JSON.parse(task.operations[0].content)
  expect(profile.inheritsFrom).toBe('1.21.1')
  expect(profile.mainClass).toBe(`${name}.Main`)
  expect(source.id).toBe('provider-id')
})

test('OptiFine 1.8.9 generates the standalone and Forge launch entrypoints correctly', () => {
  const standalone = generateOptifineVersion('HD_U_M5', '1.8.9', '1.12')
  expect(standalone.inheritsFrom).toBe('1.8.9')
  expect(standalone.arguments?.game).toContain('optifine.OptiFineTweaker')
  const forge = generateOptifineVersion('HD_U_M5', '1.8.9', '1.12', { inheritsFrom: 'forge-parent', useForgeTweaker: true })
  expect(forge.inheritsFrom).toBe('forge-parent')
  expect(forge.arguments?.game).toContain('optifine.OptiFineForgeTweaker')
})
