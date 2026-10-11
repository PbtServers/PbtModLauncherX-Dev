import { computed, onScopeDispose, shallowRef, watch, type Ref } from 'vue'
import type { ShaderProvider } from './shaderSupport'

export function useShaderPackStatus(
  instancePath: Ref<string>, provider: Ref<ShaderProvider | undefined>,
  vanillaPack: Ref<string | undefined>,
  readIris: (path: string) => Promise<{ shaderPack?: string }>,
  readOculus: (path: string) => Promise<{ shaderPack?: string }>,
) {
  const status = shallowRef<[string, string | undefined]>()
  const error = shallowRef<unknown>()
  let revision = 0
  onScopeDispose(() => { revision++ })
  async function refresh() {
    const current = ++revision
    const path = instancePath.value
    const id = provider.value?.id
    status.value = undefined
    error.value = undefined
    if (!path || !id) return
    try {
      const pack = id === 'iris' ? (await readIris(path)).shaderPack
        : id === 'oculus' ? (await readOculus(path)).shaderPack : vanillaPack.value
      if (current === revision && path === instancePath.value && id === provider.value?.id) status.value = [id, pack]
    } catch (cause) {
      if (current === revision) error.value = cause
    }
  }
  watch([instancePath, provider, computed(() => vanillaPack.value)], () => { void refresh() }, { immediate: true, flush: 'sync' })
  return { status, refresh, error }
}
