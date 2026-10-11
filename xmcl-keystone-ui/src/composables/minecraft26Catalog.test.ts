import { markRaw, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RuntimeVersionsSchema } from '@xmcl/instance'
import manifest from '../util/fixtures/minecraft26.json'
import { getSelectableGameVersionIds } from '../util/gameVersion'
import { getFacatsText, useModrinthSearchFunc } from './modrinth'
import { useCurseforgeSearchFunc } from './curseforge'
import { resolveVersionInstallManifest } from '@xmcl/installer/versionInstallManifest'

const clients = vi.hoisted(() => ({
  modrinth: { searchProjects: vi.fn(async (_request: { facets?: string }) => ({ hits: [], total_hits: 0 })) },
  curseforge: { searchMods: vi.fn(async (_request: { classId: number; gameVersion: string }) => ({ data: [], pagination: { totalCount: 0 } })) },
}))
vi.mock('@/util/clients', () => ({ clientModrinthV2: clients.modrinth, clientCurseforgeV1: clients.curseforge }))
vi.stubGlobal('markRaw', markRaw)

describe('official Minecraft identifiers through catalogs and persistence', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it.each(manifest.versions.map(entry => entry.id))('preserves verified manifest identifier %s', id => {
    const runtime = RuntimeVersionsSchema.parse({ minecraft: id })
    expect(RuntimeVersionsSchema.parse(JSON.parse(JSON.stringify(runtime))).minecraft).toBe(id)
    expect(getSelectableGameVersionIds(manifest.versions.map(entry => entry.id), id)).toContain(id)
  })
  it.each(manifest.versions.map(entry => entry.id))('keeps %s and its official metadata URL in the vanilla install recipe', async id => {
    const entry = manifest.versions.find(entry => entry.id === id)!
    const resolver = {
      findLocalVersion: vi.fn(async () => undefined),
      getMinecraftVersion: vi.fn(async (requested: string) => {
        expect(requested).toBe(id)
        return entry as any
      }),
    }
    const recipe = await resolveVersionInstallManifest({ runtime: { minecraft: id } }, resolver)
    expect(recipe.kind).toBe('install')
    if (recipe.kind !== 'install') throw new Error('Expected install recipe')
    expect(recipe.runtime.minecraft).toBe(id)
    expect(recipe.minecraft.url).toBe(entry.url)
    expect(recipe.layers).toEqual([])
  })
  it.each(['mod', 'shader', 'resourcepack'])('passes 26.1 unchanged to the Modrinth %s catalog', async projectType => {
    const search = useModrinthSearchFunc('', '26.1', '', [], ['neoforge'], '', '', projectType, 20)
    await search(0)
    const facets = JSON.parse(clients.modrinth.searchProjects.mock.calls[0][0].facets!)
    expect(facets).toContainEqual(['versions:26.1'])
    expect(facets).toContainEqual([`project_type:${projectType}`])
    expect(facets).toContainEqual(['categories:neoforge'])
    expect(JSON.stringify(facets)).not.toContain('1.21.11')
  })
  it('passes an exact prerelease and the datapack loader facet', () => {
    const facets = JSON.parse(getFacatsText('26.1-rc-3', '', [], ['datapack'], 'mod', '')!)
    expect(facets).toContainEqual(['versions:26.1-rc-3'])
    expect(facets).toContainEqual(['categories:datapack'])
  })
  it.each([6, 12, 6552, 6945])('passes the real version to CurseForge class %s', async classId => {
    const search = useCurseforgeSearchFunc(classId, ref(''), ref([]), ref(undefined), ref(undefined), ref('26.1'), 20)
    await search(0)
    expect(clients.curseforge.searchMods.mock.calls[0][0]).toMatchObject({ classId, gameVersion: '26.1' })
  })
})
