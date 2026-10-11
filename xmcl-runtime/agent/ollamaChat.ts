import { Readable } from 'stream'
import { randomUUID } from 'crypto'
import type { Context } from '../app/LauncherProtocolHandler'

/** Inspect only a bounded error string; never relay provider bodies or private content. */
export function classifyOllamaError(error: unknown) {
  const text = typeof error === 'string' ? error.slice(0, 4096).toLowerCase() : ''
  if (/out of memory|not enough memory|insufficient memory|requires more.*memory|unable to allocate/.test(text)) return 'pbtadmin.ollamaMemory'
  if (/context.*(exceed|full|too (large|long)|length)|token.*(limit|exceed)|input.*too long/.test(text)) return 'pbtadmin.contextTooSmall'
  if (/timeout|timed out/.test(text)) return 'pbtadmin.ollamaTimeout'
  return 'pbtadmin.ollamaRequestFailed'
}

export function toOllamaChat(input: any, model: string, contextWindow: number) {
  if (!Array.isArray(input?.messages)) throw new Error('invalid_agent_messages')
  const toolNames = new Map<string, string>()
  for (const message of input.messages) for (const call of message.tool_calls ?? []) toolNames.set(call.id, call.function?.name)
  return {
    model, stream: true, think: false,
    options: { num_ctx: contextWindow, num_predict: Math.min(2048, Math.floor(contextWindow / 4)) },
    messages: input.messages.map((message: any) => ({
      role: message.role,
      content: typeof message.content === 'string' ? message.content : (message.content ?? []).filter((part: any) => part.type === 'text').map((part: any) => part.text).join('\n'),
      ...(message.tool_call_id ? { tool_name: toolNames.get(message.tool_call_id) } : {}),
      ...(message.tool_calls?.length ? { tool_calls: message.tool_calls.map((call: any) => ({ function: { name: call.function.name, arguments: typeof call.function.arguments === 'string' ? JSON.parse(call.function.arguments) : call.function.arguments } })) } : {}),
    })),
    ...(input.tools?.length ? { tools: input.tools } : {}),
  }
}

let localChats = 0
export const activeLocalChats = () => localChats

export async function handleOllamaChat(...args: Parameters<typeof handleNativeChat>) {
  localChats++
  let released = false
  const release = () => { if (!released) { released = true; localChats-- } }
  try {
    await handleNativeChat(...args)
    const body = args[0].response.body
    if (body instanceof Readable) { body.once('end', release); body.once('close', release); body.once('error', release) }
    else release()
  } catch (error) { release(); throw error }
}

/** Native API sets a bounded runtime context without changing models or executing commands. */
async function handleNativeChat(ctx: Context, provider: { model: string; contextWindow?: number; toolsSupported?: boolean; localOrigin?: string }, fetch: typeof globalThis.fetch) {
  let raw = ''
  if (ctx.request.body instanceof Readable) {
    const chunks: Buffer[] = []
    let bytes = 0
    for await (const chunk of ctx.request.body) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      bytes += buffer.length
      if (bytes > 4_000_000) throw new Error('agent_request_too_large')
      chunks.push(buffer)
    }
    raw = Buffer.concat(chunks).toString('utf8')
  } else raw = ctx.request.body?.toString() || '{}'
  if (Buffer.byteLength(raw) > 4_000_000) throw new Error('agent_request_too_large')
  const body = toOllamaChat(JSON.parse(raw), provider.model, provider.contextWindow ?? 8192)
  console.info('[local.context]', JSON.stringify({ contextWindow: body.options.num_ctx, responseReserve: body.options.num_predict,
    messageCount: body.messages.length, toolCount: body.tools?.length || 0,
    toolSchemaCharacters: JSON.stringify(body.tools || []).length,
    messageCharacters: body.messages.reduce((sum: number, message: any) => sum + message.content.length, 0) }))
  if (provider.toolsSupported === false && (body.tools?.length || body.messages.some((message: any) => message.role === 'tool' || message.tool_calls?.length))) throw new Error('ollama_chat_only')
  const controller = new AbortController()
  const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(10 * 60_000), ...(ctx.request.signal ? [ctx.request.signal] : [])])
  const origin = provider.localOrigin || 'http://127.0.0.1:11434'
  const url = new URL(origin)
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('ollama_invalid_local_origin')
  const result = await fetch(origin + '/api/chat', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body), redirect: 'error', signal,
  }).catch(error => { if (signal.reason?.name === 'TimeoutError') throw new Error('pbtadmin.ollamaTimeout'); throw error })
  ctx.response.handled = true
  ctx.response.status = result.status
  if (!result.ok || !result.body) {
    // Do not relay arbitrary server error bodies or credential-like data.
    ctx.response.headers = { 'content-type': 'application/json' }
    let error: unknown
    try { const reader = result.body?.getReader(); const chunk = await reader?.read(); await reader?.cancel(); error = JSON.parse(new TextDecoder().decode(chunk?.value)).error } catch {}
    ctx.response.body = JSON.stringify({ error: { message: classifyOllamaError(error) } })
    controller.abort()
    return
  }
  ctx.response.headers = { 'content-type': 'text/event-stream' }
  const id = randomUUID()
  ctx.response.body = Readable.from((async function* () {
    const reader = result.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let toolIndex = 0
    let done = false
    const encode = (data: any) => `data: ${JSON.stringify({ id, object: 'chat.completion.chunk', model: provider.model, ...data })}\n\n`
    const convert = (event: any) => {
      if (event.error) throw new Error(classifyOllamaError(event.error))
      const delta: any = { role: 'assistant' }
      if (event.message?.content) delta.content = event.message.content
      if (event.message?.tool_calls?.length) delta.tool_calls = event.message.tool_calls.map((call: any) => ({
        index: toolIndex++, id: randomUUID(), type: 'function', function: { name: call.function.name, arguments: JSON.stringify(call.function.arguments) },
      }))
      done ||= event.done === true
      return encode({ choices: [{ index: 0, delta, finish_reason: done ? toolIndex ? 'tool_calls' : 'stop' : null }],
        ...(done ? { usage: { prompt_tokens: event.prompt_eval_count || 0, completion_tokens: event.eval_count || 0, total_tokens: (event.prompt_eval_count || 0) + (event.eval_count || 0) } } : {}),
      })
    }
    try {
      for (;;) {
        const chunk = await reader.read()
        buffer += decoder.decode(chunk.value, { stream: !chunk.done })
        if (buffer.length > 1_000_000) throw new Error('pbtadmin.ollamaRequestFailed')
        let end: number
        while ((end = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, end); buffer = buffer.slice(end + 1)
          if (line.trim()) yield convert(JSON.parse(line))
        }
        if (chunk.done) break
      }
      if (buffer.trim()) yield convert(JSON.parse(buffer))
      if (!done) throw new Error('pbtadmin.ollamaRequestFailed')
      yield 'data: [DONE]\n\n'
    } finally { controller.abort(); await reader.cancel().catch(() => {}) }
  })())
}
