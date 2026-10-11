import { isOllamaEndpoint, type AgentService, type AgentProviderSettings, type OllamaStatus } from '@xmcl/runtime-api'

/** A later successful engine inspection must also refresh the provider selection.
 * Two bounded reads, no background polling and no fabricated model or endpoint. */
export async function readProviderSnapshot(service: Pick<AgentService, 'getProviderSettings' | 'getOllamaStatus'>) {
  let settings: AgentProviderSettings = await service.getProviderSettings()
  let status: OllamaStatus | undefined
  if (isOllamaEndpoint(settings.endpoint)) {
    status = await service.getOllamaStatus()
    if (!settings.configured && status.running && status.models.length) {
      settings = await service.getProviderSettings()
    }
    if (!status.running) settings = { ...settings, configured: false, detectedEndpoint: undefined, runtimeError: status.runtimeError || settings.runtimeError }
  }
  return { settings, status }
}
