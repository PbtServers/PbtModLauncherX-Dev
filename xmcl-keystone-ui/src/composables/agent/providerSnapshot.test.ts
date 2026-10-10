import { expect, test, vi } from 'vitest'
import { readProviderSnapshot } from './providerSnapshot'
const endpoint = 'http://127.0.0.1:11434/v1/chat/completions'
const initial = { endpoint, model: '', configured: false, mode: 'unconfigured' as const }
const status = { running: true, models: [{ name: 'pbtadmin-qwen3:4b-q4_K_M' }], totalMemory: 1, freeMemory: 1, cpuCount: 1, recommendedModels: [] }
test('resynchronizes provider after a successful late engine discovery', async () => {
  const service = { getProviderSettings: vi.fn().mockResolvedValueOnce(initial).mockResolvedValueOnce({ ...initial, model: status.models[0].name, configured: true, mode: 'custom', detectedEndpoint: 'http://127.0.0.1:51157/v1/chat/completions' }), getOllamaStatus: vi.fn().mockResolvedValue(status) }
  const snapshot = await readProviderSnapshot(service)
  expect(snapshot.settings.configured).toBe(true)
  expect(snapshot.settings.model).toBe(status.models[0].name)
  expect(snapshot.settings.detectedEndpoint).toContain(':51157/')
  expect(service.getProviderSettings).toHaveBeenCalledTimes(2)
})
test('keeps missing resources distinguishable and does not retry indefinitely', async () => {
  const service = { getProviderSettings: vi.fn().mockResolvedValue({ ...initial, runtimeError: 'ollama_seed_missing' }), getOllamaStatus: vi.fn().mockResolvedValue({ ...status, running: false, models: [], runtimeError: 'ollama_seed_missing' }) }
  expect((await readProviderSnapshot(service)).settings.runtimeError).toBe('ollama_seed_missing')
  expect(service.getProviderSettings).toHaveBeenCalledTimes(1)
})
test('does not probe local engines for external providers', async () => {
  const service = { getProviderSettings: vi.fn().mockResolvedValue({ ...initial, endpoint: 'https://api.openai.com/v1/chat/completions', model: 'chosen', configured: true }), getOllamaStatus: vi.fn() }
  expect((await readProviderSnapshot(service)).settings.model).toBe('chosen')
  expect(service.getOllamaStatus).not.toHaveBeenCalled()
})
