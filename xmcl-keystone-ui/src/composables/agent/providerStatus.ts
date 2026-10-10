import { isOllamaEndpoint, type OllamaStatus } from '@xmcl/runtime-api'

/** Local connection evidence must never be presented as an API-key error. */
export function providerStatusKey(endpoint: string, model: string, configured: boolean, status?: OllamaStatus, toolsSupported = true) {
  if (!isOllamaEndpoint(endpoint)) return configured ? 'pbtadmin.runningExternal' : 'pbtadmin.externalSetup'
  if (configured) return toolsSupported ? 'pbtadmin.running' : 'pbtadmin.chatOnly'
  if (!status) return 'pbtadmin.detectFailed'
  if (status.runtimeError) return status.runtimeError === 'ollama_runtime_missing' ? 'pbtadmin.integratedMissing' : 'pbtadmin.integratedFailed'
  if (status.error === 'invalidResponse' || status.error === 'connectionFailed') return 'pbtadmin.detectFailed'
  if (!status.running) return status.installed === true ? 'pbtadmin.stopped' : status.installed === false ? 'pbtadmin.missing' : 'pbtadmin.detectFailed'
  if (!status.models.length) return 'pbtadmin.noModels'
  if (model && status.models.some(entry => entry.name === model && !entry.chatCompatible && !entry.compatible)) return 'pbtadmin.unsupported'
  return 'pbtadmin.selectModel'
}
