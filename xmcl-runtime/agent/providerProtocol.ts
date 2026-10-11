import { handleOllamaChat } from './ollamaChat'
import { BUILTIN_AGENT_ENDPOINT, LOCAL_AGENT_TRANSPORT_ENDPOINT, isLoopbackServiceUrl, isAnthropicEndpoint, isOllamaEndpoint } from '@xmcl/runtime-api'
import type { Handler } from '~/app'
import type { ResolvedAgentProvider } from './AgentService'

const transportUrls = [BUILTIN_AGENT_ENDPOINT, LOCAL_AGENT_TRANSPORT_ENDPOINT, 'https://agent.runtime/v1/messages'].map(value => new URL(value))
const builtinProviderUrl = 'https://ai.xmcl.app/v1/chat/completions'

export interface AgentXmclAuthorization {
  accessToken: string
  accountId: string
  tokenType?: 'DPoP' | 'Bearer'
  dpopProof?: string
}

export interface AgentXmclAuthorizationRequest {
  method: string
  url: string | URL
}

function setHeader(headers: Record<string, any>, name: string, value?: string) {
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === name.toLowerCase()) delete headers[key]
  }
  if (value) headers[name] = value
}

export function createAgentProtocolHandler(
  resolveProvider: () => Promise<ResolvedAgentProvider>,
  resolveXmclAuthorization: (
    request?: AgentXmclAuthorizationRequest,
  ) => Promise<AgentXmclAuthorization | undefined>,
  localFetch?: typeof globalThis.fetch,
): Handler {
  return async (ctx) => {
    const { request, response } = ctx
    if (!transportUrls.some(url => request.url.origin === url.origin && request.url.pathname === url.pathname))
      return

    setHeader(request.headers, 'authorization')
    setHeader(request.headers, 'x-api-key')
    setHeader(request.headers, 'DPoP')
    setHeader(request.headers, 'x-xmcl-account-id')
    const provider = await resolveProvider()
    if (provider.mode === 'custom') {
      if (!provider.apiKey && !isLoopbackServiceUrl(provider.endpoint)) {
        response.status = 401
        response.headers = { 'content-type': 'application/json' }
        response.body = JSON.stringify({ error: { message: 'Agent API key is not configured' } })
        response.handled = true
        return
      }
      if (localFetch && isOllamaEndpoint(provider.endpoint)) {
        await handleOllamaChat(ctx, provider, localFetch)
        return
      }
      let endpoint: URL
      try {
        endpoint = new URL(provider.endpoint)
        if (endpoint.protocol !== 'https:' && endpoint.protocol !== 'http:')
          throw new Error('invalid protocol')
      } catch {
        response.status = 400
        response.headers = { 'content-type': 'application/json' }
        response.body = JSON.stringify({ error: { message: 'Invalid custom agent endpoint' } })
        response.handled = true
        return
      }
      request.url = endpoint
      if (isAnthropicEndpoint(provider.endpoint)) {
        setHeader(request.headers, 'x-api-key', provider.apiKey)
        setHeader(request.headers, 'anthropic-version', '2023-06-01')
      } else {
        setHeader(request.headers, 'authorization', provider.apiKey ? `Bearer ${provider.apiKey}` : undefined)
      }
      request.skipRemainingHandlers = true
      return
    }

    if (provider.mode === 'unconfigured') {
      response.status = 401
      response.headers = { 'content-type': 'application/json' }
      response.body = JSON.stringify({ error: { message: 'Custom agent provider is not configured' } })
      response.handled = true
      return
    }

    const targetUrl = new URL(builtinProviderUrl)
    const authorization = await resolveXmclAuthorization({
      method: request.method,
      url: targetUrl,
    })
    if (!authorization) {
      response.status = 401
      response.headers = { 'content-type': 'application/json' }
      response.body = JSON.stringify({ error: { message: 'XMCL account session is required' } })
      response.handled = true
      return
    }
    const tokenType = authorization.tokenType === 'DPoP' ? 'DPoP' : 'Bearer'
    setHeader(request.headers, 'authorization', `${tokenType} ${authorization.accessToken}`)
    setHeader(request.headers, 'DPoP', authorization.dpopProof)
    setHeader(request.headers, 'x-xmcl-account-id', authorization.accountId)
    request.url = targetUrl
    request.skipRemainingHandlers = true
  }
}
