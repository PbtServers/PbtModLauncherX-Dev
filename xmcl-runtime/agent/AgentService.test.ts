import { BUILTIN_AGENT_FLIGHT } from '@xmcl/runtime-api'
import { describe, expect, test, vi } from 'vitest'
import { FACTORY_MODEL, HF_FACTORY_MODEL } from './modelBundle'
import { handleOllamaChat, activeLocalChats } from './ollamaChat'
import { Readable } from 'node:stream'

vi.mock('~/app', () => ({
  Inject: () => () => {},
  LauncherApp: class {},
  LauncherAppKey: Symbol('LauncherAppKey'),
}))

vi.mock('~/infra', () => ({
  kFlights: Symbol('kFlights'),
}))

vi.mock('~/settings', () => ({
  kSettings: Symbol('kSettings'),
}))

vi.mock('~/xmclAccount', () => ({
  kXmclSessionAuthorization: Symbol('kXmclSessionAuthorization'),
  XmclAccountService: class {},
}))

vi.mock('~/service', () => ({
  AbstractService: class {},
  ExposeServiceKey: () => () => {},
}))

const { AgentService, kResolvedAgentProvider } = await import('./AgentService')
const { kFlights } = await import('~/infra')
const { kSettings } = await import('~/settings')

describe('low resource local engine policy', () => {
  test('does not stop a live native chat stream; releases the activity lease on close', async () => {
    const ctx = { request: { body: Buffer.from(JSON.stringify({ messages: [] })) }, response: {} } as any
    await handleOllamaChat(ctx, { model: 'local', localOrigin: 'http://127.0.0.1:32123' }, vi.fn(async () => new Response('{"done":true}\n')) as any)
    const service = createServiceContext({})
    Object.assign(service.settings, { lowResourceMode: true })
    Object.assign(service.ollama, { getDownloadStatus: () => ({ state: 'idle' }) })
    Object.assign(service.engine, { stop: vi.fn() })
    expect(activeLocalChats()).toBe(1)
    expect(await AgentService.prototype.releaseLocalAgent.call(service as any)).toBe(false)
    expect((service.engine as any).stop).not.toHaveBeenCalled()
    const closed = new Promise<void>(resolve => ctx.response.body.once('close', resolve))
    ;(ctx.response.body as Readable).destroy()
    await closed
    expect(activeLocalChats()).toBe(0)
  })
  test('does not discover or start Ollama during passive provider queries', async () => {
    const service = createServiceContext({})
    Object.assign(service.settings, { lowResourceMode: true, agentModel: HF_FACTORY_MODEL })
    await expect((AgentService.prototype as any)[kResolvedAgentProvider].call(service)).resolves.toEqual({ mode: 'unconfigured' })
    expect(service.engine.ensure).not.toHaveBeenCalled()
    expect(service.ollama.resolveModel).not.toHaveBeenCalled()
    expect(service.settings.agentModel).toBe(HF_FACTORY_MODEL)
  })
  test('explicit activation permits the preserved local model', async () => {
    const service = createServiceContext({})
    Object.assign(service.settings, { lowResourceMode: true, agentModel: 'user-choice' })
    await AgentService.prototype.activateLocalAgent.call(service as any)
    await expect((AgentService.prototype as any)[kResolvedAgentProvider].call(service)).resolves.toMatchObject({ mode: 'custom', model: 'user-choice' })
    expect(service.engine.ensure).toHaveBeenCalled()
  })
  test('does not stop an active download', async () => {
    const service = createServiceContext({})
    Object.assign(service.settings, { lowResourceMode: true })
    Object.assign(service.ollama, { getDownloadStatus: () => ({ state: 'running' }) })
    Object.assign(service.engine, { stop: vi.fn() })
    expect(await AgentService.prototype.releaseLocalAgent.call(service as any)).toBe(false)
    expect((service.engine as any).stop).not.toHaveBeenCalled()
  })
  test('releases only the managed engine when idle and keeps user configuration', async () => {
    const service = createServiceContext({})
    Object.assign(service.settings, { lowResourceMode: true, agentModel: 'user-choice' })
    Object.assign(service.ollama, { getDownloadStatus: () => ({ state: 'idle' }) })
    Object.assign(service.engine, { stop: vi.fn() })
    expect(await AgentService.prototype.releaseLocalAgent.call(service as any)).toBe(true)
    expect((service.engine as any).stop).toHaveBeenCalledOnce()
    expect(service.settings.agentModel).toBe('user-choice')
  })
  test('keeps external providers independent of the local pause', async () => {
    const service = createServiceContext({})
    Object.assign(service.settings, { lowResourceMode: true, agentEndpoint: 'https://api.openai.com/v1/chat/completions', agentModel: 'external-model' })
    service.apiKeys.get.mockResolvedValue('test-secret')
    await expect((AgentService.prototype as any)[kResolvedAgentProvider].call(service)).resolves.toMatchObject({ mode: 'custom', model: 'external-model' })
    expect(service.engine.ensure).not.toHaveBeenCalled()
  })
})

function createServiceContext(flights: Record<string, unknown>) {
  const settings = {
    agentEndpoint: '',
    agentModel: '',
    agentProviderSet: vi.fn(),
  }
  return {
    app: {
      registry: {
        get: vi.fn(async key => key === kSettings ? settings : key === kFlights ? flights : undefined),
      },
      secretStorage: {
        get: vi.fn().mockResolvedValue(''),
        put: vi.fn(),
      },
    },
    settings,
    ollama: { resolveModel: vi.fn(async (name: string) => name === FACTORY_MODEL || name === HF_FACTORY_MODEL ? undefined : ({ name, compatible: true, size: 1, contextWindow: 4096 })) },
    engine: { ensure: vi.fn(async () => 'http://127.0.0.1:32123') },
    apiKeys: {
      get: vi.fn().mockResolvedValue(''),
    },
  }
}

describe('AgentService provider resolution', () => {
  test('rejects a selected local model when its installed metadata is incompatible or unavailable', async () => {
    const context = createServiceContext({})
    context.settings.agentModel = 'not-installed'
    context.ollama.resolveModel.mockResolvedValue(undefined as any)
    await expect((AgentService.prototype as any)[kResolvedAgentProvider].call(context)).resolves.toEqual({ mode: 'unconfigured' })
    expect(context.apiKeys.get).not.toHaveBeenCalled()
  })

  test('disabled history neither loads nor writes existing conversations', async () => {
    const context = createServiceContext({})
    Object.assign(context.settings, { agentHistoryEnabled: false })
    const history = { load: vi.fn(), updateContext: vi.fn(), appendMessage: vi.fn(), replaceMessages: vi.fn(), archive: vi.fn() }
    const service = Object.assign(Object.create(AgentService.prototype), context, { history })
    const key = { agentId: 'launcher', scope: 'instance' }
    await expect(service.getConversation(key)).resolves.toEqual({ key, messages: [] })
    await service.appendConversationMessages(key, [{ role: 'user', content: 'not persisted' }])
    await service.updateConversationContext(key, { context: 'not persisted' })
    await service.replaceConversationMessages(key, [])
    await service.startNewConversation(key)
    for (const operation of Object.values(history)) expect(operation).not.toHaveBeenCalled()
  })
  test('reports empty settings as unconfigured when the built-in flight is absent', async () => {
    const context = createServiceContext({})
    const service = Object.assign(Object.create(AgentService.prototype), context)

    await expect(service.getProviderSettings()).resolves.toEqual({
      endpoint: 'http://127.0.0.1:11434/v1/chat/completions',
      model: '',
      configured: false,
      toolsSupported: false,
      mode: 'unconfigured',
      historyEnabled: true,
      contextWindow: 8192,
    })
  })

  test('does not select the built-in provider when its flight is absent', async () => {
    const service = createServiceContext({})

    await expect((AgentService.prototype as any)[kResolvedAgentProvider].call(service))
      .resolves.toEqual({ mode: 'unconfigured' })
  })

  test('ignores a legacy enabled XMCL built-in flight', async () => {
    const service = createServiceContext({ [BUILTIN_AGENT_FLIGHT]: true })

    await expect((AgentService.prototype as any)[kResolvedAgentProvider].call(service))
      .resolves.toEqual({ mode: 'unconfigured' })
  })

  test('requires endpoint, model, and API key for a custom provider', async () => {
    const service = createServiceContext({ [BUILTIN_AGENT_FLIGHT]: true })
    service.settings.agentEndpoint = 'https://provider.example/v1/chat/completions'
    service.settings.agentModel = 'provider-model'

    await expect((AgentService.prototype as any)[kResolvedAgentProvider].call(service))
      .resolves.toEqual({ mode: 'unconfigured' })
  })

  test('selects custom only when endpoint, model, and API key are all configured', async () => {
    const service = createServiceContext({})
    service.settings.agentEndpoint = 'https://provider.example/v1/chat/completions'
    service.settings.agentModel = 'provider-model'
    service.apiKeys.get.mockResolvedValue('provider-key')

    await expect((AgentService.prototype as any)[kResolvedAgentProvider].call(service))
      .resolves.toEqual({
        mode: 'custom',
        endpoint: 'https://provider.example/v1/chat/completions',
        model: 'provider-model',
        apiKey: 'provider-key',
      })
  })

  test('does not fall back to builtin for a partial custom configuration', async () => {
    const service = createServiceContext({ [BUILTIN_AGENT_FLIGHT]: true })
    service.settings.agentEndpoint = 'https://provider.example/v1/chat/completions'

    await expect((AgentService.prototype as any)[kResolvedAgentProvider].call(service))
      .resolves.toEqual({ mode: 'unconfigured' })
  })
})
test('uses a local AI server without an XMCL account or a fabricated API key', async () => {
  const service = createServiceContext({ builtinAgent: true })
  service.settings.agentEndpoint = 'http://127.0.0.1:11434/v1/chat/completions'
  service.settings.agentModel = 'local-model'
  await expect((AgentService.prototype as any)[kResolvedAgentProvider].call(service)).resolves.toEqual({
    mode: 'custom', endpoint: service.settings.agentEndpoint, model: 'local-model', apiKey: '', contextWindow: 4096, toolsSupported: true, localOrigin: 'http://127.0.0.1:32123',
  })
})

test('selects the factory model only after the local engine verifies usable metadata', async () => {
  const service = createServiceContext({})
  service.ollama.resolveModel.mockResolvedValue({ name: FACTORY_MODEL, compatible: false, size: 1, contextWindow: 4096 })
  await expect((AgentService.prototype as any)[kResolvedAgentProvider].call(service)).resolves.toMatchObject({ mode: 'custom', model: FACTORY_MODEL, apiKey: '', toolsSupported: false })
  expect(service.settings.agentProviderSet).toHaveBeenCalledWith(expect.objectContaining({ model: FACTORY_MODEL }))
  expect(service.apiKeys.get).not.toHaveBeenCalled()
})

test('returns the resolved imported model immediately and refreshes the dynamic endpoint after engine restart', async () => {
  const service = createServiceContext({})
  service.ollama.resolveModel.mockResolvedValue({ name: HF_FACTORY_MODEL, compatible: true, size: 1, contextWindow: 4096 })
  Object.assign(service, { [kResolvedAgentProvider]: () => (AgentService.prototype as any)[kResolvedAgentProvider].call(service) })
  const read = () => AgentService.prototype.getProviderSettings.call(service)
  await expect(read()).resolves.toMatchObject({ model: HF_FACTORY_MODEL, configured: true, detectedEndpoint: 'http://127.0.0.1:32123/v1/chat/completions' })
  service.engine.ensure.mockResolvedValue('http://127.0.0.1:32124')
  await expect(read()).resolves.toMatchObject({ detectedEndpoint: 'http://127.0.0.1:32124/v1/chat/completions' })
  expect(service.apiKeys.get).not.toHaveBeenCalled()
})

test('does not overwrite a user choice made while automatic discovery is awaiting the engine', async () => {
  const service = createServiceContext({})
  Object.assign(service, { [kResolvedAgentProvider]: () => (AgentService.prototype as any)[kResolvedAgentProvider].call(service) })
  service.ollama.resolveModel.mockImplementation(async name => {
    if (name === HF_FACTORY_MODEL) service.settings.agentModel = 'user-choice'
    return { name, compatible: true, size: 1, contextWindow: 4096 }
  })
  await expect((AgentService.prototype as any)[kResolvedAgentProvider].call(service)).resolves.toMatchObject({ model: 'user-choice' })
  expect(service.settings.agentProviderSet).not.toHaveBeenCalled()
})

test('preserves an existing local model selection instead of selecting the factory model', async () => {
  const service = createServiceContext({})
  service.settings.agentModel = 'qwen3:1.7b-q4_K_M'
  await expect((AgentService.prototype as any)[kResolvedAgentProvider].call(service)).resolves.toMatchObject({ model: 'qwen3:1.7b-q4_K_M' })
  expect(service.settings.agentProviderSet).not.toHaveBeenCalled()
  expect(service.ollama.resolveModel).not.toHaveBeenCalledWith(FACTORY_MODEL)
})
