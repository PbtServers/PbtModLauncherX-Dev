import { computed, effectScope, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useShaderPackStatus } from './shaderPackStatus'
import type { ShaderProvider } from './shaderSupport'

const flush = async () => { await Promise.resolve(); await Promise.resolve() }
function fixture() {
  const scope = effectScope()
  const path = ref('A')
  const provider = ref<ShaderProvider | undefined>({ id: 'iris', name: 'Iris', version: '1' })
  const vanilla = ref<string>()
  const readIris = vi.fn(async (path: string) => ({ shaderPack: `${path}.zip` }))
  const readOculus = vi.fn(async () => ({ shaderPack: 'oculus.zip' }))
  const result = scope.run(() => useShaderPackStatus(path, computed(() => provider.value), vanilla, readIris, readOculus))!
  return { scope, path, provider, vanilla, readIris, readOculus, ...result }
}
describe('reactive shader selection', () => {
  it('loads initial preferences on startup without a subsequent event', async () => {
    const f = fixture()
    try { await flush(); expect(f.status.value).toEqual(['iris', 'A.zip']) } finally { f.scope.stop() }
  })
  it('invalidates cached options when only the instance path changes', async () => {
    const f = fixture()
    try {
      await flush()
      f.path.value = 'B'
      expect(f.status.value).toBeUndefined()
      await flush()
      expect(f.status.value).toEqual(['iris', 'B.zip'])
    } finally { f.scope.stop() }
  })
  it('refreshes after replacement and removal of a provider without changing saved packs', async () => {
    const f = fixture()
    try {
      await flush()
      f.provider.value = { id: 'oculus', name: 'Oculus', version: '2' }
      await flush()
      expect(f.status.value).toEqual(['oculus', 'oculus.zip'])
      f.provider.value = undefined
      expect(f.status.value).toBeUndefined()
      expect(f.readOculus).toHaveBeenCalledOnce()
    } finally { f.scope.stop() }
  })
  it('ignores an old read completing after a newer read of the same instance', async () => {
    const f = fixture()
    try {
      await flush()
      let finish!: (value: { shaderPack: string }) => void
      f.readIris.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
      const old = f.refresh()
      f.readIris.mockResolvedValueOnce({ shaderPack: 'new.zip' })
      await f.refresh()
      finish({ shaderPack: 'old.zip' })
      await old
      expect(f.status.value).toEqual(['iris', 'new.zip'])
    } finally { f.scope.stop() }
  })
  it('does not restore disabled support when an old asynchronous read completes', async () => {
    const f = fixture()
    try {
      await flush()
      let finish!: (value: { shaderPack: string }) => void
      f.readIris.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
      const old = f.refresh()
      f.provider.value = undefined
      finish({ shaderPack: 'old.zip' })
      await old
      expect(f.status.value).toBeUndefined()
    } finally { f.scope.stop() }
  })
  it('uses OptiFine game options and keeps read failures observable', async () => {
    const f = fixture()
    try {
      await flush()
      f.vanilla.value = 'optifine.zip'
      f.provider.value = { id: 'optifine', name: 'OptiFine', version: 'HD_U_J1' }
      await flush()
      expect(f.status.value).toEqual(['optifine', 'optifine.zip'])
      f.readIris.mockRejectedValueOnce(new Error('read failed'))
      f.provider.value = { id: 'iris', name: 'Iris', version: '1' }
      await flush()
      expect(f.status.value).toBeUndefined()
      expect(f.error.value).toBeInstanceOf(Error)
    } finally { f.scope.stop() }
  })
})
