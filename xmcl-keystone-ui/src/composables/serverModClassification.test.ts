import { afterEach, expect, test, vi } from 'vitest'
import { effectScope, ref, nextTick } from 'vue'
import { useServerModClassifications } from './serverModClassification'
const service = vi.hoisted(() => ({ getInstanceServerModClassifications: vi.fn() }))
vi.mock('./service', () => ({ useService: () => service }))
afterEach(() => { vi.useRealTimers(); service.getInstanceServerModClassifications.mockReset() })
test('instance changes discard late results and local refresh never opts into network', async () => {
  vi.useFakeTimers()
  let finishFirst: (value: unknown[]) => void = () => {}
  service.getInstanceServerModClassifications.mockImplementationOnce(() => new Promise(resolve => { finishFirst = resolve })).mockResolvedValue([{ path: 'mods/new.jar' }])
  const scope = effectScope(); const path = ref('first')
  const state = scope.run(() => useServerModClassifications(path, () => 'fixture'))!
  await vi.advanceTimersByTimeAsync(601)
  expect(service.getInstanceServerModClassifications).toHaveBeenCalledWith('first', false)
  path.value = 'second'; await nextTick(); await vi.advanceTimersByTimeAsync(601)
  finishFirst([{ path: 'mods/old.jar' }]); await Promise.resolve(); await nextTick()
  expect(state.mods.value.map(mod => mod.path)).toEqual(['mods/new.jar'])
  expect(service.getInstanceServerModClassifications).toHaveBeenLastCalledWith('second', false)
  scope.stop()
})
test('provider lookup is explicit and disposed views perform no delayed analysis', async () => {
  vi.useFakeTimers()
  service.getInstanceServerModClassifications.mockResolvedValue([])
  const scope = effectScope(); const path = ref('instance')
  const state = scope.run(() => useServerModClassifications(path, () => 'fixture'))!
  await state.refresh(true)
  expect(service.getInstanceServerModClassifications).toHaveBeenCalledWith('instance', true)
  scope.stop(); await vi.advanceTimersByTimeAsync(601)
  expect(service.getInstanceServerModClassifications).toHaveBeenCalledTimes(1)
})
