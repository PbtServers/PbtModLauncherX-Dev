import { computed, inject, hasInjectionContext } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import { kSettingsState } from './setting'

export function useLowResourceMode() {
  const settings = hasInjectionContext() ? inject(kSettingsState, undefined) : undefined
  const systemMotion = usePreferredReducedMotion()
  const enabled = computed(() => settings?.state.value?.lowResourceMode ?? false)
  const reducedMotion = computed(() => enabled.value || systemMotion.value === 'reduce')
  return { enabled, reducedMotion }
}
