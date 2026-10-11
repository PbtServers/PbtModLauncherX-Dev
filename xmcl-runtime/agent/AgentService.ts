import { LOCAL_AI_MODELS, OLLAMA_ENDPOINT, isOllamaEndpoint } from '@xmcl/runtime-api'
import { activeLocalChats } from './ollamaChat'
import { OllamaController } from './ollama'
import { ManagedOllama, kOllamaResourceRoot, type LocalRuntimeConfig } from './managedOllama'
import { validateOllamaBundle } from './runtimeBundle'
import { XMCL_CLOUD_ENABLED, assertIndependentUrl, isXmclExclusiveUrl, isLoopbackServiceUrl } from '@xmcl/runtime-api'
import {
  AgentServiceKey,
  BUILTIN_AGENT_FLIGHT,
  DEFAULT_AGENT_ENDPOINT,
  DEFAULT_AGENT_MODEL,
  type AgentConversationKey,
  type AgentMessage,
  type AgentProviderSettings,
  type AgentRunTrace,
  type AgentService as IAgentService,
  type LegacyConversationImport,
  type UpdateAgentProviderSettings,
} from '@xmcl/runtime-api'
import { randomUUID } from 'crypto'
import { totalmem, freemem, cpus } from 'os'
import { join } from 'path'
import { Inject, LauncherAppKey, type LauncherApp } from '~/app'
import { IS_DEV } from '~/constant'
import { kFlights } from '~/infra'
import { kSettings } from '~/settings'
import { AbstractService, ExposeServiceKey } from '~/service'
import { AgentApiKeyStore } from './apiKey'
import { kXmclSessionAuthorization, XmclAccountService } from '~/xmclAccount'
import { sanitizeAgentEndpoint, sanitizeAgentLog } from './debug'
import { AgentArtifactStore } from './artifacts'
import { AgentDocumentStore, kAgentDocumentDirectory } from './documents'
import { AgentHistoryStore } from './history'

export { SECRET_SERVICE as AGENT_SECRET_SERVICE } from './apiKey'

export type ResolvedAgentProvider =
  | { mode: 'builtin' }
  | { mode: 'custom'; endpoint: string; model: string; apiKey: string; contextWindow?: number; toolsSupported?: boolean; localOrigin?: string }
  | { mode: 'unconfigured' }

export const kResolvedAgentProvider = Symbol('resolved-agent-provider')

@ExposeServiceKey(AgentServiceKey)
export class AgentService extends AbstractService implements IAgentService {
  private localAgentRequested = false
  private engine: ManagedOllama
  private ollama: OllamaController
  private history = new AgentHistoryStore(join(this.app.appDataPath, 'agent', 'history'), message => this.warn(message))
  private artifacts = new AgentArtifactStore(join(this.app.appDataPath, 'agent', 'artifacts'))
  private documents: AgentDocumentStore
  private agentLogger = this.app.getLogger('Agent', 'agent')
  private apiKeys = new AgentApiKeyStore(this.app.secretStorage, async () => {
    const settings = await this.app.registry.get(kSettings)
    return settings.agentEndpoint || DEFAULT_AGENT_ENDPOINT
  })

  constructor(
    @Inject(LauncherAppKey) app: LauncherApp,
    @Inject(kAgentDocumentDirectory) private readonly documentDirectory: string | string[],
    @Inject(kOllamaResourceRoot) resourceRoot: string,
  ) {
    super(app)
    this.engine = new ManagedOllama({ bundle: resourceRoot, data: join(app.appDataPath, 'ai'), portableBase: process.env.PBT_PORTABLE_BASE }, (...args) => app.fetch(...args), () => {})
    this.ollama = new OllamaController((...args) => app.fetch(...args), async () => {
      try { await validateOllamaBundle(resourceRoot); return true } catch { return false }
    }, undefined, () => this.engine.ensure())
    app.registryDisposer(() => { this.ollama.cancel(); return this.engine.stop() })
    this.documents = new AgentDocumentStore(documentDirectory, message => this.warn(message))
  }

  async getProviderSettings(): Promise<AgentProviderSettings> {
    const settings = await this.app.registry.get(kSettings)
    const endpoint = settings.agentEndpoint || OLLAMA_ENDPOINT
    let runtimeError: string | undefined
    let provider: ResolvedAgentProvider
    try { provider = await this[kResolvedAgentProvider]() } catch (error) {
      if (!isOllamaEndpoint(endpoint)) throw error
      const message = (error as Error).message
      runtimeError = /^ollama_[a-z_]+$/.test(message) ? message : (error as NodeJS.ErrnoException).code === 'ENOENT' ? 'ollama_runtime_missing' : 'ollama_runtime_unavailable'
      this.warn(`[local.runtime] provider unavailable: ${runtimeError}`)
      provider = { mode: 'unconfigured' }
    }
    const configured = provider.mode === 'custom'
      ? true
      : provider.mode === 'builtin' && !!await this.app.registry.getOrCreate(XmclAccountService)
        .then(service => service[kXmclSessionAuthorization]())
        .catch(() => undefined)
    return {
      endpoint,
      ...(runtimeError ? { runtimeError } : {}),
      model: provider.mode === 'custom' ? provider.model : settings.agentModel || DEFAULT_AGENT_MODEL,
      ...(provider.mode === 'custom' && provider.localOrigin ? { detectedEndpoint: new URL('/v1/chat/completions', provider.localOrigin).href } : {}),
      configured,
      toolsSupported: provider.mode === 'custom' ? provider.toolsSupported !== false : false,
      mode: provider.mode,
      historyEnabled: settings.agentHistoryEnabled !== false,
      contextWindow: provider.mode === 'custom' ? provider.contextWindow ?? 128_000 : 8192,
    }
  }

  async setProviderSettings(input: UpdateAgentProviderSettings) {
    const settings = await this.app.registry.get(kSettings)
    const endpoint = input.endpoint.trim()
    if (endpoint) {
      assertIndependentUrl(endpoint)
      const url = new URL(endpoint)
      if (url.username || url.password || url.search || url.hash || (url.protocol !== 'https:' && !isLoopbackServiceUrl(endpoint))) throw new Error('agent_invalid_endpoint')
    }
    this.logAgent(`[provider.settings] ${sanitizeAgentLog({
      endpoint: sanitizeAgentEndpoint(endpoint),
      hasModel: !!input.model,
      hasApiKey: input.apiKey !== undefined,
    })}`)
    if (input.apiKey !== undefined && endpoint) {
      await this.apiKeys.put(endpoint, input.apiKey)
    }
    settings.agentProviderSet({
      endpoint,
      model: input.model.trim(),
      historyEnabled: input.historyEnabled,
    })
  }

  async [kResolvedAgentProvider](): Promise<ResolvedAgentProvider> {
    const settings = await this.app.registry.get(kSettings)
    const endpoint = settings.agentEndpoint.trim() || OLLAMA_ENDPOINT
    let model = settings.agentModel.trim()
    if (settings.lowResourceMode && !this.localAgentRequested && isOllamaEndpoint(endpoint)) return { mode: 'unconfigured' }
    if (isOllamaEndpoint(endpoint)) await this.engine.ensure()
    if (!model && isOllamaEndpoint(endpoint)) {
      const local = await this.ollama.resolveModel('qwen3:4b-q4_K_M')
      if (local) {
        const latest = await this.app.registry.get(kSettings)
        if (latest.agentModel.trim() || (latest.agentEndpoint.trim() || OLLAMA_ENDPOINT) !== endpoint) return this[kResolvedAgentProvider]()
        model = local.name
        await settings.agentProviderSet({ endpoint, model, historyEnabled: settings.agentHistoryEnabled })
      }
    }
    if (endpoint || model) {
      if (!endpoint || !model || isXmclExclusiveUrl(endpoint)) return { mode: 'unconfigured' }
      if (isOllamaEndpoint(endpoint)) {
        const local = await this.ollama.resolveModel(model)
        return local ? { mode: 'custom', endpoint, model, apiKey: '', contextWindow: local.contextWindow, toolsSupported: local.compatible, localOrigin: await this.engine.ensure() } : { mode: 'unconfigured' }
      }
      const apiKey = (await this.apiKeys.get(endpoint)) ?? ''
      if (!apiKey && !isLoopbackServiceUrl(endpoint)) return { mode: 'unconfigured' }
      return { mode: 'custom', endpoint, model, apiKey }
    }

    const flights = await this.app.registry.get(kFlights).catch((): Record<string, any> => ({}))
    return XMCL_CLOUD_ENABLED && flights[BUILTIN_AGENT_FLIGHT] === true ? { mode: 'builtin' } : { mode: 'unconfigured' }
  }

  async activateLocalAgent() { this.localAgentRequested = true; await this.engine.ensure() }

  async releaseLocalAgent() {
    const settings = await this.app.registry.get(kSettings)
    if (!settings.lowResourceMode || activeLocalChats() || this.ollama.getDownloadStatus().state === 'running') return false
    this.localAgentRequested = false
    await this.engine.stop()
    return true
  }

  async getOllamaStatus() {
    if ((await this.app.registry.get(kSettings)).lowResourceMode && !this.localAgentRequested) return { installed: undefined, running: false, models: [], recommendedModels: [], totalMemory: totalmem(), freeMemory: freemem(), cpuCount: cpus().length, runtimeError: 'ollama_runtime_unavailable' }
    let runtimeError: string | undefined
    try { await this.engine.ensure() } catch (e) {
      const message = (e as Error).message
      runtimeError = message.startsWith('ollama_') ? message : (e as NodeJS.ErrnoException).code === 'ENOENT' ? 'ollama_runtime_missing' : 'ollama_runtime_unavailable'
    }
    if (runtimeError) return { installed: undefined, running: false, models: [], recommendedModels: [], totalMemory: totalmem(), freeMemory: freemem(), cpuCount: cpus().length, runtimeError }
    const status = await this.ollama.inspect()
    if (runtimeError) return { ...status, runtimeError }
    const storage = await this.engine.storage()
    return { ...status, ...storage, freeStorageBytes: storage.freeBytes, recommendedModels: status.recommendedModels.filter(name => storage.freeBytes >= (LOCAL_AI_MODELS.find(entry => entry.name === name)?.estimatedBytes ?? 0) * 1.1) }
  }
  async getLocalRuntimeStorage() { return this.engine.storage() }
  async configureLocalRuntime(input: LocalRuntimeConfig) { await this.engine.configure(input) }
  async prepareOllamaDownload(model: string) {
    const preview = this.ollama.prepare(model)
    if ((await this.engine.storage()).freeBytes < preview.estimatedBytes * 1.1) throw new Error('ollama_storage_insufficient')
    return preview
  }
  async startOllamaDownload(confirmationId: string) { this.ollama.start(confirmationId) }
  async getOllamaDownloadStatus() { return this.ollama.getDownloadStatus() }
  async cancelOllamaDownload() { this.ollama.cancel() }

  private async historyEnabled() {
    return (await this.app.registry.get(kSettings)).agentHistoryEnabled !== false
  }

  async getConversation(key: AgentConversationKey) {
    return await this.historyEnabled() ? this.history.load(key) : { key, messages: [] }
  }

  async updateConversationContext(key: AgentConversationKey, context: Record<string, unknown>) {
    if (await this.historyEnabled()) return this.history.updateContext(key, context)
  }

  async appendConversationMessages(key: AgentConversationKey, messages: AgentMessage[]) {
    if (await this.historyEnabled()) for (const message of messages) await this.history.appendMessage(key, message)
  }

  async replaceConversationMessages(key: AgentConversationKey, messages: AgentMessage[]) {
    if (await this.historyEnabled()) return this.history.replaceMessages(key, messages)
  }

  async startNewConversation(key: AgentConversationKey) {
    if (!await this.historyEnabled()) return undefined
    const archiveId = randomUUID()
    const historyArchived = await this.history.archive(key, archiveId)
    try {
      const artifactsArchived = await this.artifacts.archive(key, archiveId)
      return historyArchived || artifactsArchived ? archiveId : undefined
    } catch (error) {
      if (historyArchived) await this.history.restoreArchive(key, archiveId)
      throw error
    }
  }

  async resetConversation(key: AgentConversationKey) {
    await Promise.all([this.history.reset(key), this.artifacts.reset(key)])
  }

  writeArtifact(key: AgentConversationKey, input: { content: string; toolName: string }) {
    return this.artifacts.write(key, input.content, input.toolName)
  }

  listArtifacts(key: AgentConversationKey) {
    return this.artifacts.list(key)
  }

  readArtifact(key: AgentConversationKey, input: { path: string; offset?: number; limit?: number }) {
    return this.artifacts.read(key, input.path, input.offset, input.limit)
  }

  grepArtifact(key: AgentConversationKey, input: { path: string; pattern: string; ignoreCase: boolean; offset?: number; limit?: number }) {
    return this.artifacts.grep(key, input.path, input.pattern, input.ignoreCase, input.offset, input.limit)
  }

  listDocuments() {
    return this.documents.list()
  }

  searchDocuments(input: { query: string; limit?: number }) {
    return this.documents.search(input.query, input.limit)
  }

  readDocument(id: string) {
    return this.documents.read(id)
  }

  importLegacyConversation(input: LegacyConversationImport) {
    return this.history.importLegacy(input)
  }

  async reportRunTrace(trace: AgentRunTrace) {
    this.app.emit('agent-run-trace', trace)
  }

  private logAgent(message: string) {
    if (!IS_DEV) return
    this.agentLogger.log(message)
    this.log(message)
  }
}
