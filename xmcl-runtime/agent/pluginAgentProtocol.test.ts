import { BUILTIN_AGENT_ENDPOINT, LOCAL_AGENT_TRANSPORT_ENDPOINT } from '@xmcl/runtime-api'
import { describe, expect, test, vi } from 'vitest'
import type { Context } from '~/app'
import { LauncherProtocolHandler } from '../app/LauncherProtocolHandler'
import { createAgentProtocolHandler } from './providerProtocol'

function context(url = BUILTIN_AGENT_ENDPOINT, headers: Record<string, any> = {}): Context {
  return {
    request: {
      method: 'POST',
      url: new URL(url),
      headers,
      body: '{}',
    },
    response: { headers: {} },
    handle: vi.fn(),
  }
}

describe('agent protocol', () => {
  test('routes a keyless local provider without forwarding an XMCL authorization header', async () => {
    const authorization = vi.fn()
    const handler = createAgentProtocolHandler(
      async () => ({ mode: 'custom', endpoint: 'http://127.0.0.1:11434/v1/chat/completions', model: 'local', apiKey: '' }),
      authorization,
    )
    const ctx = context(BUILTIN_AGENT_ENDPOINT, { Authorization: 'old-xmcl-token', DPoP: 'old-proof' })
    await handler(ctx)
    expect(ctx.request.url.hostname).toBe('127.0.0.1')
    expect(ctx.request.headers).not.toHaveProperty('Authorization')
    expect(ctx.request.headers).not.toHaveProperty('DPoP')
    expect(ctx.request.headers).not.toHaveProperty('authorization')
    expect(authorization).not.toHaveBeenCalled()
  })
  test('routes custom mode to its endpoint with its stored key', async () => {
    const handler = createAgentProtocolHandler(
      async () => ({
        mode: 'custom',
        endpoint: 'https://provider.example/v1/chat/completions',
        model: 'custom-model',
        apiKey: 'custom-key',
      }),
      async () => ({ accessToken: 'xmcl-token', accountId: 'account-id' }),
    )
    const ctx = context(BUILTIN_AGENT_ENDPOINT, {
      Authorization: 'Bearer renderer-value',
      'X-XMCL-Account-ID': 'renderer-account',
    })

    await handler(ctx)

    expect(ctx.request.url.toString()).toBe('https://provider.example/v1/chat/completions')
    expect(ctx.request.headers).toEqual({ authorization: 'Bearer custom-key' })
    expect(ctx.request.skipRemainingHandlers).toBe(true)
  })

  test('authenticates builtin mode with the XMCL session and account', async () => {
    const handler = createAgentProtocolHandler(
      async () => ({ mode: 'builtin' }),
      async () => ({ accessToken: 'xmcl-token', accountId: 'account-id' }),
    )
    const ctx = context(BUILTIN_AGENT_ENDPOINT, { authorization: 'Bearer renderer-value' })

    await handler(ctx)

    expect(ctx.request.url.toString()).toBe('https://ai.xmcl.app/v1/chat/completions')
    expect(ctx.request.headers).toEqual({
      authorization: 'Bearer xmcl-token',
      'x-xmcl-account-id': 'account-id',
    })
    expect(ctx.request.skipRemainingHandlers).toBe(true)
  })

  test('authenticates builtin mode with a URL-specific DPoP proof', async () => {
    const resolveXmclAuthorization = vi.fn(async () => ({
      accessToken: 'xmcl-token',
      accountId: 'account-id',
      tokenType: 'DPoP' as const,
      dpopProof: 'proof-for-final-url',
    }))
    const handler = createAgentProtocolHandler(
      async () => ({ mode: 'builtin' }),
      resolveXmclAuthorization,
    )
    const ctx = context(BUILTIN_AGENT_ENDPOINT, { authorization: 'stale' })

    await handler(ctx)

    expect(resolveXmclAuthorization).toHaveBeenCalledWith({
      method: 'POST',
      url: new URL('https://ai.xmcl.app/v1/chat/completions'),
    })
    expect(ctx.request.headers).toMatchObject({
      authorization: 'DPoP xmcl-token',
      DPoP: 'proof-for-final-url',
      'x-xmcl-account-id': 'account-id',
    })
  })

  test('rejects builtin mode without an XMCL session', async () => {
    const handler = createAgentProtocolHandler(
      async () => ({ mode: 'builtin' }),
      async () => undefined,
    )
    const ctx = context()

    await handler(ctx)

    expect(ctx.response.status).toBe(401)
    expect(ctx.response.headers).toEqual({ 'content-type': 'application/json' })
    expect(ctx.response.handled).toBe(true)
  })

  test('rejects unconfigured mode without resolving XMCL authorization', async () => {
    const resolveXmclAuthorization = vi.fn(async () => ({
      accessToken: 'xmcl-token',
      accountId: 'account-id',
    }))
    const handler = createAgentProtocolHandler(
      async () => ({ mode: 'unconfigured' }),
      resolveXmclAuthorization,
    )
    const ctx = context()

    await handler(ctx)

    expect(ctx.response.status).toBe(401)
    expect(ctx.response.handled).toBe(true)
    expect(ctx.request.url.toString()).toBe(BUILTIN_AGENT_ENDPOINT)
    expect(resolveXmclAuthorization).not.toHaveBeenCalled()
  })

  test('ignores unrelated requests', async () => {
    const resolveProvider = vi.fn(async () => ({ mode: 'builtin' as const }))
    const handler = createAgentProtocolHandler(resolveProvider, async () => undefined)
    const ctx = context('https://api.xmcl.api/other')

    await handler(ctx)

    expect(resolveProvider).not.toHaveBeenCalled()
    expect(ctx.response.status).toBeUndefined()
  })
})

 test('dispatches the local virtual transport through the guarded protocol without XMCL credentials', async () => {
  const protocol = new LauncherProtocolHandler()
  const authorization = vi.fn()
  const sink = vi.fn(({ request, response }: Context) => {
    expect(request.url.hostname).toBe('127.0.0.1')
    expect(request.headers).toEqual({})
    response.status = 200
  })
  protocol.registerHandler('https', createAgentProtocolHandler(
    async () => ({ mode: 'custom', endpoint: 'http://127.0.0.1:11434/v1/chat/completions', model: 'local', apiKey: '' }), authorization,
  ))
  protocol.registerHandler('http', sink, true)
  expect((await protocol.handle({ url: LOCAL_AGENT_TRANSPORT_ENDPOINT, method: 'POST', headers: { Authorization: 'stale', DPoP: 'stale' } })).status).toBe(200)
  expect(sink).toHaveBeenCalledOnce()
  expect(authorization).not.toHaveBeenCalled()
  expect((await protocol.handle({ url: BUILTIN_AGENT_ENDPOINT })).status).toBe(503)
  expect(sink).toHaveBeenCalledOnce()
})
