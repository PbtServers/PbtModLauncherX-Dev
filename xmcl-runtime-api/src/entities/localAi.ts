export const OLLAMA_ENDPOINT = 'http://127.0.0.1:11434/v1/chat/completions'
export const AGENT_PROVIDER_PRESETS = [
  { id: 'ollama', endpoint: OLLAMA_ENDPOINT },
  { id: 'openai', endpoint: 'https://api.openai.com/v1/chat/completions' },
  { id: 'anthropic', endpoint: 'https://api.anthropic.com/v1/messages' },
  { id: 'gemini', endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' },
  { id: 'compatible', endpoint: '' },
] as const

export function isOllamaEndpoint(endpoint: string) {
  return endpoint === OLLAMA_ENDPOINT
}

export function isAnthropicEndpoint(endpoint: string) {
  try {
    const url = new URL(endpoint)
    return url.origin === 'https://api.anthropic.com' && url.pathname === '/v1/messages'
  } catch { return false }
}

/** Estimates, not hardware benchmarks; leave room for Minecraft and context. */
export const LOCAL_AI_MODELS = [
  { name: 'qwen3:4b', estimatedBytes: 2_600_000_000, minRamBytes: 8 * 1024 ** 3 },
  { name: 'qwen3:8b', estimatedBytes: 5_200_000_000, minRamBytes: 16 * 1024 ** 3 },
] as const

export interface LocalAiModel {
  name: string
  size: number
  compatible: boolean
  /** Verified local completion capability, independently of tool support. */
  chatCompatible?: boolean
  contextWindow: number
}

export interface OllamaStatus {
  installed: boolean | undefined
  running: boolean
  models: LocalAiModel[]
  totalMemory: number
  freeMemory: number
  cpuCount: number
  recommendedModels: string[]
  error?: 'unavailable' | 'invalidResponse' | 'connectionFailed'
}

export interface OllamaDownloadPreview {
  confirmationId: string
  model: string
  estimatedBytes: number
}

export interface OllamaDownloadStatus {
  state: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled'
  model?: string
  completed?: number
  total?: number
  error?: 'downloadFailed' | 'timeout'
}
