import { OLLAMA_ENDPOINT, isOllamaEndpoint } from '@xmcl/runtime-api'
import { OllamaController } from './ollama'
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
  | { mode: 'custom'; endpoint: string; model: string; apiKey: string; contextWindow?: number; toolsSupported?: boolean }
  | { mode: 'unconfigured' }

export const kResolvedAgentProvider = Symbol('resolved-agent-provider')

@ExposeServiceKey(AgentServiceKey)
export class AgentService extends AbstractService implements IAgentService {
  private ollama = new OllamaController((...args) => this.app.fetch(...args))
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
  ) {
    super(app)
    this.documents = new AgentDocumentStore(documentDirectory, message => this.warn(message))
  }

  async getProviderSettings(): Promise<AgentProviderSettings> {
    const settings = await this.app.registry.get(kSettings)
    const endpoint = settings.agentEndpoint || OLLAMA_ENDPOINT
    const provider = await this[kResolvedAgentProvider]()
    const configured = provider.mode === 'custom'
      ? true
      : provider.mode === 'builtin' && !!await this.app.registry.getOrCreate(XmclAccountService)
        .then(service => service[kXmclSessionAuthorization]())
        .catch(() => undefined)
    return {
      endpoint,
      model: settings.agentModel || DEFAULT_AGENT_MODEL,
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
    // Persist the secret first: it is the only step that can fail (OS keychain
    // errors), and we must not leave the endpoint/model settings committed while
    // the API key write was rejected. The key is scoped to the endpoint being
    // saved, so each provider keeps its own.
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
    const model = settings.agentModel.trim()
    if (endpoint || model) {
      if (!endpoint || !model || isXmclExclusiveUrl(endpoint)) return { mode: 'unconfigured' }
      if (isOllamaEndpoint(endpoint)) {
        const local = await this.ollama.resolveModel(model)
        return local ? { mode: 'custom', endpoint, model, apiKey: '', contextWindow: local.contextWindow, toolsSupported: local.compatible } : { mode: 'unconfigured' }
      }
      const apiKey = (await this.apiKeys.get(endpoint)) ?? ''
      if (!apiKey && !isLoopbackServiceUrl(endpoint)) return { mode: 'unconfigured' }
      return { mode: 'custom', endpoint, model, apiKey }
    }

    const flights = await this.app.registry.get(kFlights).catch((): Record<string, any> => ({}))
    return XMCL_CLOUD_ENABLED && flights[BUILTIN_AGENT_FLIGHT] === true ? { mode: 'builtin' } : { mode: 'unconfigured' }
  }

  getOllamaStatus() { return this.ollama.inspect() }
  async prepareOllamaDownload(model: string) { return this.ollama.prepare(model) }
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
