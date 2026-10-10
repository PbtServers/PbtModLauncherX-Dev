import { Readable } from 'stream'
import { randomUUID } from 'crypto'
import type { Context } from '../app/LauncherProtocolHandler'

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

/** Native API sets a bounded runtime context without changing models or executing commands. */
export async function handleOllamaChat(ctx: Context, provider: { model: string; contextWindow?: number }, fetch: typeof globalThis.fetch) {
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
  const controller = new AbortController()
  const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(10 * 60_000), ...(ctx.request.signal ? [ctx.request.signal] : [])])
  const result = await fetch('http://127.0.0.1:11434/api/chat', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body), redirect: 'error', signal,
  })
  ctx.response.handled = true
  ctx.response.status = result.status
  if (!result.ok || !result.body) {
    // Do not relay arbitrary server error bodies or credential-like data.
    ctx.response.headers = { 'content-type': 'application/json' }
    ctx.response.body = JSON.stringify({ error: { message: 'pbtadmin.ollamaRequestFailed' } })
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
      if (event.error) throw new Error('pbtadmin.ollamaRequestFailed')
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
