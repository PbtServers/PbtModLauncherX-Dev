import { ref, watch, onScopeDispose, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { InstanceIOServiceKey, type ServerExportMod, type ServerModSide, type ServerModNecessity } from '@xmcl/runtime-api'
import { useService } from './service'

export function useServerModClassifications(path: Ref<string>, signature: () => string) {
  const service = useService(InstanceIOServiceKey)
  const mods = ref<ServerExportMod[]>([])
  const loading = ref(false)
  const failed = ref(false)
  const typeFilter = ref<ServerModSide | null>(null)
  const serverFilter = ref<ServerModNecessity | null>(null)
  let generation = 0
  let disposed = false
  async function refresh(online = false) {
    if (disposed) return
    const current = ++generation
    const instance = path.value
    loading.value = true; failed.value = false
    try {
      const result = await service.getInstanceServerModClassifications(instance, online)
      if (!disposed && current === generation && instance === path.value) mods.value = result
    } catch { if (current === generation && !disposed) { failed.value = true; mods.value = [] } }
    finally { if (current === generation && !disposed) loading.value = false }
  }
  const refreshSoon = useDebounceFn(() => refresh(), 600)
  watch([path, signature], () => { generation++; mods.value = []; typeFilter.value = null; serverFilter.value = null; void refreshSoon() }, { immediate: true })
  onScopeDispose(() => { disposed = true; generation++ })
  return { mods, loading, failed, refresh, typeFilter, serverFilter }
}
