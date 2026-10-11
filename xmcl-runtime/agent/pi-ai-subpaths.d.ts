declare module '@earendil-works/pi-ai/api/openai-completions.lazy' {
  import type { ProviderStreams } from '@earendil-works/pi-ai'

  export function openAICompletionsApi(): ProviderStreams
}

declare module '@earendil-works/pi-ai/api/anthropic-messages.lazy' {
  import type { ProviderStreams } from '@earendil-works/pi-ai'
  export function anthropicMessagesApi(): ProviderStreams
}
