import { expect, test, vi } from 'vitest'
import type { VersionMetadataService } from '@xmcl/runtime-api'
import { resolveServerInstallRecipe } from './serverExportMetadata'
import { serverDependencyVersionMatches, classifyServerMod, incompatibleServerDependencies } from './serverExportAnalysis'
import fixture from '../../xmcl-keystone-ui/src/util/fixtures/minecraft26.json'

// Official API shapes; hashes are deliberately synthetic, no fixture binary is downloaded.
function sources(minecraft: string) {
  const metadata = {
    getMinecraftVersions: vi.fn(async () => ({ versions: [{ id: minecraft, url: 'https://piston-meta.mojang.com/v1/packages/fixture/version.json' }] })),
    getForgeVersions: vi.fn(async () => [{ version: 'fixture-hotfix', installer: { sha1: 'a'.repeat(40) } }]),
    getNeoForgedVersions: vi.fn(async () => ['fixture-hotfix']),
    getFabricVersions: vi.fn(async () => ({ gameVersions: [minecraft], loaderVersions: [{ version: 'fixture-loader' }] })),
    getQuiltVersions: vi.fn(async () => ({ gameVersions: [minecraft], loaderVersions: [{ version: 'fixture-loader' }] })),
  } as unknown as VersionMetadataService
  const fetch = vi.fn(async (url: string) => {
    if (url.endsWith('version.json')) return { id: minecraft, javaVersion: { majorVersion: minecraft.startsWith('26.') ? 25 : 21 }, downloads: { server: { url: 'https://piston-data.mojang.com/v1/objects/fixture/server.jar', sha1: 'b'.repeat(40) } } }
    if (url.endsWith('.sha1')) return 'a'.repeat(40)
    if (url.endsWith('/installer')) return [{ url: url.includes('fabric') ? 'https://maven.fabricmc.net/net/fabricmc/fabric-installer/1.1.2/fabric-installer-1.1.2.jar' : 'https://maven.quiltmc.org/repository/release/org/quiltmc/quilt-installer/fixture/quilt-installer-fixture.jar', version: 'fixture-installer', stable: true }]
    return { loader: { version: 'fixture-loader' } }
  })
  return { metadata, fetch }
}

test.each(['vanilla', 'forge', 'neoforge', 'fabric', 'quilt'] as const)('resolves exact %s official-source recipe from metadata fixtures', async loader => {
  const { metadata, fetch } = sources('1.21.1')
  const version = loader === 'vanilla' ? '' : loader === 'fabric' || loader === 'quilt' ? 'fixture-loader' : 'fixture-hotfix'
  const recipe = await resolveServerInstallRecipe('1.21.1', loader, version, metadata, fetch)
  expect(recipe.minecraft).toBe('1.21.1'); expect(recipe.loaderVersion).toBe(version)
  expect(recipe.download.sha1).toHaveLength(40)
  expect(recipe.download.url).not.toContain('xmcl')
  if (loader === 'fabric') expect(recipe.installArgs).toContain('fixture-loader')
  if (loader === 'quilt') expect(recipe.installArgs).toEqual([]) // Documented manual exact-version install, never unverified CLI flags.
})
test('keeps recorded Minecraft 26.x identifiers exact', async () => {
  expect(JSON.stringify(fixture)).toContain('26.1')
  const { metadata, fetch } = sources('26.1')
  expect((await resolveServerInstallRecipe('26.1', 'vanilla', '', metadata, fetch)).minecraft).toBe('26.1')
  await expect(resolveServerInstallRecipe('1.21.11', 'vanilla', '', metadata, fetch)).rejects.toThrow('metadataUnavailable')
})
test('refuses nonexistent builds, mismatched pairs, missing hashes and legacy unsupported Forge', async () => {
  let { metadata, fetch } = sources('1.21.1')
  await expect(resolveServerInstallRecipe('1.21.1', 'forge', 'not-listed', metadata, fetch)).rejects.toThrow('unsupportedRecipe')
  await expect(resolveServerInstallRecipe('1.21.1', 'neoforge', 'not-listed', metadata, fetch)).rejects.toThrow('unsupportedRecipe')
  fetch.mockImplementation(async () => ({ id: '1.21.1', javaVersion: { majorVersion: 8 } }) as any)
  await expect(resolveServerInstallRecipe('1.21.1', 'forge', 'fixture-hotfix', metadata, fetch)).rejects.toThrow('unsupportedRecipe')
  ;({ metadata, fetch } = sources('1.21.1'))
  const normal = fetch.getMockImplementation()!
  fetch.mockImplementation(async url => url.endsWith('fixture-loader') ? { loader: { version: 'other' } } : normal(url))
  await expect(resolveServerInstallRecipe('1.21.1', 'fabric', 'fixture-loader', metadata, fetch)).rejects.toThrow('unsupportedRecipe')
  fetch.mockImplementation(async url => url.endsWith('.sha1') ? 'invalid' : normal(url))
  await expect(resolveServerInstallRecipe('1.21.1', 'neoforge', 'fixture-hotfix', metadata, fetch)).rejects.toThrow('metadataUnavailable')
})
test('uses existing Maven and Fabric range parsers for old/new Minecraft and dependencies', () => {
  expect(serverDependencyVersionMatches({ id: 'minecraft', range: '[1.21.1,1.22)', format: 'maven' }, '26.1')).toBe(false)
  expect(serverDependencyVersionMatches({ id: 'minecraft', range: '>=26.1 <26.2', format: 'fabric' }, '26.1')).toBe(true)
  expect(serverDependencyVersionMatches({ id: 'minecraft', range: ['~1.20.1', '~26.1'], format: 'fabric' }, '26.1')).toBe(true)
  expect(serverDependencyVersionMatches({ id: 'minecraft', range: '~1.8', format: 'fabric' }, '1.8.9')).toBe(true)
  const mod = { path: 'mods/create.jar', archivePath: 'mods/create.jar', size: 1, sha256: '', selected: true, ...classifyServerMod({ fabric: { id: 'create', version: '1', depends: { minecraft: '~1.21.1' } } } as any, 'fabric') }
  expect(incompatibleServerDependencies([mod], new Set([mod.path]), { minecraft: '26.1', loader: 'fabric', loaderVersion: 'fixture', java: 25 })).toContain('create: minecraft')
})
