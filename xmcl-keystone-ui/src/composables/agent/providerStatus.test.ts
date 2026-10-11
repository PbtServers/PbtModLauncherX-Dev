import { describe, expect, it } from 'vitest'
import { OLLAMA_ENDPOINT, type OllamaStatus } from '@xmcl/runtime-api'
import { providerStatusKey } from './providerStatus'

const local = (overrides: Partial<OllamaStatus> = {}): OllamaStatus => ({ installed: true, running: true, models: [], totalMemory: 0, freeMemory: 0, cpuCount: 1, recommendedModels: [], ...overrides })
describe('independent provider status', () => {
  it('never asks to install a global engine when the integrated package is missing or invalid', () => {
    expect(providerStatusKey(OLLAMA_ENDPOINT, '', false, local({ runtimeError: 'ollama_runtime_missing' }))).toBe('pbtadmin.integratedMissing')
    expect(providerStatusKey(OLLAMA_ENDPOINT, '', false, local({ runtimeError: 'ollama_architecture_mismatch' }))).toBe('pbtadmin.integratedFailed')
  })
  it.each([
    [local({ installed: false, running: false }), false, true, 'missing'],
    [local({ running: false }), false, true, 'stopped'],
    [local(), false, true, 'noModels'],
    [local(), true, false, 'chatOnly'],
    [local(), true, true, 'running'],
    [local({ error: 'invalidResponse' }), false, true, 'detectFailed'],
  ] as const)('reports local evidence without requiring keys', (status, configured, tools, key) => {
    expect(providerStatusKey(OLLAMA_ENDPOINT, '', configured, status, tools)).toBe(`pbtadmin.${key}`)
  })
  it('keeps external authentication separate when switching providers', () => {
    expect(providerStatusKey('https://api.openai.com/v1/chat/completions', '', false)).toBe('pbtadmin.externalSetup')
    expect(providerStatusKey('https://api.openai.com/v1/chat/completions', 'model', true)).toBe('pbtadmin.runningExternal')
    expect(providerStatusKey(OLLAMA_ENDPOINT, '', false, local())).toBe('pbtadmin.noModels')
  })
  it('distinguishes selection from an unsupported installed model', () => {
    const status = local({ models: [{ name: 'vision-only', size: 10, contextWindow: 4096, compatible: false, chatCompatible: false }] })
    expect(providerStatusKey(OLLAMA_ENDPOINT, '', false, status)).toBe('pbtadmin.selectModel')
    expect(providerStatusKey(OLLAMA_ENDPOINT, 'vision-only', false, status)).toBe('pbtadmin.unsupported')
  })
})
