import { ref } from 'vue'
import { afterEach, expect, test, vi } from 'vitest'
import { useLowResourceMode } from './lowResource'

vi.mock('./setting', () => ({ kSettingsState: Symbol('settings') }))
vi.mock('@vueuse/core', () => ({ usePreferredReducedMotion: () => motion }))
vi.mock('vue', async (original) => ({
  ...await original<typeof import('vue')>(),
  hasInjectionContext: () => true,
  inject: () => ({ state }),
}))
const state = ref({ lowResourceMode: false })
const motion = ref<'reduce' | 'no-preference'>('no-preference')
afterEach(() => { state.value.lowResourceMode = false; motion.value = 'no-preference' })

test('updates immediately without a restart and restores normal motion', () => {
  const policy = useLowResourceMode()
  expect(policy.enabled.value).toBe(false)
  expect(policy.reducedMotion.value).toBe(false)
  state.value.lowResourceMode = true
  expect(policy.enabled.value).toBe(true)
  expect(policy.reducedMotion.value).toBe(true)
  state.value.lowResourceMode = false
  expect(policy.reducedMotion.value).toBe(false)
})
test('the OS reduced motion preference wins even when the mode is disabled', () => {
  const policy = useLowResourceMode()
  motion.value = 'reduce'
  expect(policy.enabled.value).toBe(false)
  expect(policy.reducedMotion.value).toBe(true)
  state.value.lowResourceMode = true
  state.value.lowResourceMode = false
  expect(policy.reducedMotion.value).toBe(true)
})
