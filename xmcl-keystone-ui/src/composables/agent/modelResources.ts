import { LOCAL_AI_MODELS, type OllamaStatus } from '@xmcl/runtime-api'

/** An unavailable runtime is not evidence of insufficient physical memory. */
export function modelResourceIssue(status?: OllamaStatus, name = 'qwen3:4b-q4_K_M'): 'unavailable' | 'memory' | 'storage' | undefined {
  if (!status?.running || status.runtimeError || status.error) return 'unavailable'
  const model = LOCAL_AI_MODELS.find(entry => entry.name === name)
  if (!model || !Number.isFinite(status.totalMemory) || !Number.isFinite(status.freeMemory)) return 'unavailable'
  if (status.totalMemory < model.minRamBytes || status.freeMemory < model.estimatedBytes * 1.5) return 'memory'
  if (status.freeStorageBytes !== undefined && status.freeStorageBytes < model.estimatedBytes * 1.1) return 'storage'
  return undefined
}
