import { kAgentDocumentDirectory } from '@xmcl/runtime/agent/documents'
import { kOllamaResourceRoot } from '@xmcl/runtime/agent/managedOllama'
import { IS_DEV } from '@xmcl/runtime/constant'
import { join } from 'path'
import type { LauncherAppPlugin } from '~/app'

export function resolveAgentDocumentDirectory(isDev: boolean, resourcesPath = process.resourcesPath) {
  return isDev
    ? join(__dirname, '..', 'main', 'agent-documents')
    : join(resourcesPath, 'agent-documents')
}

export const pluginAgentDocuments: LauncherAppPlugin = (app) => {
  app.registry.register(kOllamaResourceRoot, IS_DEV ? join(__dirname, '..', 'build', 'ollama', `${({ win32: 'win', linux: 'linux', darwin: 'mac' } as Record<string, string>)[process.platform]}-${process.arch}`) : join(process.resourcesPath, 'ollama'))
  app.registry.register(kAgentDocumentDirectory, [resolveAgentDocumentDirectory(IS_DEV), resolvePbtAdminKnowledgeDirectory(IS_DEV)])
}

export function resolvePbtAdminKnowledgeDirectory(isDev: boolean, resourcesPath = process.resourcesPath) {
  return isDev
    ? join(__dirname, '..', '..', 'PbtModLauncherX-Data', 'PbtAdmin', 'knowledge')
    : join(resourcesPath, 'pbtadmin-knowledge')
}
