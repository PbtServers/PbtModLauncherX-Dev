import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import type { RuntimeVersions } from '@xmcl/instance'
import type { ModFile } from '@/util/mod'
import { detectShaderProvider } from './shaderSupport'

const runtime = (extra: Partial<RuntimeVersions> = {}) => ({ minecraft: '1.21.1', ...extra }) as RuntimeVersions
function mod(extra: Partial<ModFile> = {}): ModFile {
  return { path: '/instance/mods/manual.jar', enabled: true, version: '1', icon: '', dependencies: {}, ...extra } as ModFile
}
const iris = () => mod({ fabric: { id: 'iris', version: '1.8', name: 'Iris', depends: { minecraft: '1.21.1', fabricloader: '>=0.16.0' } } as any })

describe('local shader support', () => {
  it('recognizes Iris metadata without market information or a known filename', () => {
    expect(detectShaderProvider(runtime({ fabricLoader: '0.16.10' }), [iris()])?.id).toBe('iris')
  })
  it('normalizes the matching nested Fabric entry instead of the first entry', () => {
    const jar = iris()
    jar.fabric = [{ id: 'container', version: '1' } as any, jar.fabric as any]
    expect(detectShaderProvider(runtime({ fabricLoader: '0.16.10' }), [jar])?.name).toBe('Iris')
  })
  it('does not let unrelated Forge metadata shadow NeoForge Iris', () => {
    const jar = mod({ forge: { modid: 'container' } as any, neoforge: { modid: 'iris', displayName: 'Iris', version: '1.8', children: [] } as any })
    expect(detectShaderProvider(runtime({ neoForged: '21.1.257' }), [jar])?.id).toBe('iris')
  })
  it.each(['forge', 'neoForged'] as const)('recognizes Oculus in %s metadata', loader => {
    const metadata = { modid: 'oculus', name: 'Oculus', displayName: 'Oculus', version: '1.8', children: [] }
    const jar = mod({ [loader === 'forge' ? 'forge' : 'neoforge']: metadata })
    expect(detectShaderProvider(runtime({ [loader]: '1' }), [jar])?.id).toBe('oculus')
  })
  it('recognizes nested NeoForge metadata', () => {
    expect(detectShaderProvider(runtime({ neoForged: '21.1.1' }), [mod({ neoforge: { modid: 'container', children: [{ modid: 'iris', version: '1' }] } as any })])?.id).toBe('iris')
  })
  it('recognizes Quilt metadata and checks its Minecraft requirement', () => {
    const jar = mod({ quilt: { quilt_loader: { id: 'iris', version: '1', depends: [{ id: 'minecraft', versions: '1.21.1' }] } } as any })
    expect(detectShaderProvider(runtime({ quiltLoader: '0.27.1' }), [jar])?.id).toBe('iris')
    expect(detectShaderProvider(runtime({ minecraft: '1.20.1', quiltLoader: '0.27.1' }), [jar])).toBeUndefined()
  })
  it('recognizes compatible standalone OptiFine and class-parser metadata', () => {
    expect(detectShaderProvider(runtime({ optifine: 'HD_U_J1' }), [])?.id).toBe('optifine')
    const jar = mod({ forge: { modid: 'OptiFine', version: 'HD_U_J1', acceptMinecraft: '[1.21.1]' } as any })
    expect(detectShaderProvider(runtime(), [jar])?.id).toBe('optifine')
    expect(detectShaderProvider(runtime({ minecraft: '1.20.1' }), [jar])).toBeUndefined()
  })
  it('does not mistake OptiFabric alone for OptiFine', () => {
    const bridge = mod({ fabric: { id: 'optifabric', version: '1' } as any })
    expect(detectShaderProvider(runtime({ fabricLoader: '0.16.10' }), [bridge])).toBeUndefined()
    expect(detectShaderProvider(runtime({ fabricLoader: '0.16.10', optifine: 'HD_U_J1' }), [bridge])?.id).toBe('optifine')
  })
  it('rejects absent, disabled and incorrectly loaded providers', () => {
    expect(detectShaderProvider(runtime(), [])).toBeUndefined()
    expect(detectShaderProvider(runtime({ fabricLoader: '0.16.10' }), [mod({ ...iris(), enabled: false })])).toBeUndefined()
    expect(detectShaderProvider(runtime({ forge: '52' }), [iris()])).toBeUndefined()
    expect(detectShaderProvider(runtime({ neoForged: '21.1.1', optifine: 'HD_U_J1' }), [])).toBeUndefined()
  })
  it('rejects known Minecraft and loader version mismatches', () => {
    expect(detectShaderProvider(runtime({ minecraft: '1.20.1', fabricLoader: '0.16.10' }), [iris()])).toBeUndefined()
    expect(detectShaderProvider(runtime({ fabricLoader: '0.14.0' }), [iris()])).toBeUndefined()
    const jar = mod({ forge: { modid: 'oculus', version: '1' } as any, dependencies: { forge: [{ modId: 'minecraft', versionRange: '[1.20.1]' }] } })
    expect(detectShaderProvider(runtime({ forge: '52' }), [jar])).toBeUndefined()
  })
  it('recomputes after manual insertion, update, disable, removal and instance/profile changes', () => {
    const path = ref('/instance')
    const profile = ref(runtime({ fabricLoader: '0.16.10' }))
    const mods = ref<ModFile[]>([])
    const provider = computed(() => detectShaderProvider(profile.value, mods.value, path.value))
    expect(provider.value).toBeUndefined()
    mods.value = [iris()]
    expect(provider.value?.version).toBe('1.8')
    mods.value = [mod({ fabric: { id: 'iris', version: '1.9' } as any })]
    expect(provider.value?.version).toBe('1.9')
    mods.value = [mod({ ...iris(), enabled: false })]
    expect(provider.value).toBeUndefined()
    mods.value = [iris()]
    path.value = '/other-instance'
    expect(provider.value).toBeUndefined()
    path.value = '/instance'
    profile.value = runtime({ forge: '52' })
    expect(provider.value).toBeUndefined()
    mods.value = []
    expect(provider.value).toBeUndefined()
  })
  it('recognizes Windows paths without leaking the previous instance snapshot', () => {
    const jar = mod({ ...iris(), path: 'G:\\Instance\\mods\\renamed.jar' })
    expect(detectShaderProvider(runtime({ fabricLoader: '0.16.10' }), [jar], 'g:/instance')?.id).toBe('iris')
    expect(detectShaderProvider(runtime({ fabricLoader: '0.16.10' }), [jar], 'g:/instance2')).toBeUndefined()
  })
})
