import { Readable } from 'stream'
import { expect, test, vi } from 'vitest'
import { classifyOllamaError, handleOllamaChat, toOllamaChat } from './ollamaChat'

test('distinguishes memory, context, timeout and unknown errors without disclosing bodies', () => {
  expect(classifyOllamaError('model requires more system memory')).toBe('pbtadmin.ollamaMemory')
  expect(classifyOllamaError('context length exceeded')).toBe('pbtadmin.contextTooSmall')
  expect(classifyOllamaError('request timed out')).toBe('pbtadmin.ollamaTimeout')
  expect(classifyOllamaError('private token secret')).toBe('pbtadmin.ollamaRequestFailed')
})

test('rejects non-loopback managed inference before any request', async () => {
  const fetch = vi.fn()
  const ctx = { request: { body: JSON.stringify({ messages: [] }) }, response: {} } as any
  await expect(handleOllamaChat(ctx, { model: 'local', localOrigin: 'http://0.0.0.0:11434' }, fetch)).rejects.toThrow('invalid_local_origin')
  expect(fetch).not.toHaveBeenCalled()
})

test('chat-only models reject tool requests before contacting Ollama', async () => {
  const fetch = vi.fn()
  for (const input of [
    { messages: [], tools: [{ type: 'function', function: { name: 'write_file' } }] },
    { messages: [{ role: 'tool', content: 'old conversation tool result' }] },
  ]) {
    const ctx = { request: { body: JSON.stringify(input) }, response: {} } as any
    await expect(handleOllamaChat(ctx, { model: 'chat-only', toolsSupported: false }, fetch)).rejects.toThrow('ollama_chat_only')
  }
  expect(fetch).not.toHaveBeenCalled()
})

test('native chat preserves tool results, sets the real selected model and bounds runtime context', () => {
  const body = toOllamaChat({ messages: [
    { role: 'assistant', tool_calls: [{ id: 'id', function: { name: 'vfs_shell', arguments: '{"command":"system info"}' } }] },
    { role: 'tool', tool_call_id: 'id', content: 'actual results' },
  ] }, 'qwen3:4b', 8192)
  expect(body).toMatchObject({ model: 'qwen3:4b', think: false, options: { num_ctx: 8192, num_predict: 2048 } })
  expect(body.messages[0].tool_calls[0].function.arguments).toEqual({ command: 'system info' })
  expect(body.messages[1]).toMatchObject({ tool_name: 'vfs_shell', content: 'actual results' })
  expect(() => toOllamaChat({}, 'model', 8192)).toThrow('invalid_agent_messages')
})

test('native streaming respects request cancellation and never uses an Authorization header', async () => {
  const abort = new AbortController()
  let fetchSignal: AbortSignal | undefined
  const fetch = vi.fn(async (_url: any, init: any) => {
    fetchSignal = init.signal
    expect(init.headers).toEqual({ 'content-type': 'application/json' })
    return new Response(new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('{"message":{"content":"partial"},"done":false}\n')) } }))
  })
  const ctx: any = { request: { body: '{"messages":[]}', signal: abort.signal }, response: { headers: {} } }
  await handleOllamaChat(ctx, { model: 'qwen3:4b', contextWindow: 8192 }, fetch)
  abort.abort()
  expect(fetchSignal?.aborted).toBe(true)
  ;(ctx.response.body as Readable).destroy()
})

test('IPC request bodies preserve Unicode when UTF-8 characters cross chunk boundaries', async () => {
  const raw = Buffer.from(JSON.stringify({ messages: [{ role: 'user', content: 'Català, español' }] }))
  const chunks = [...raw].map(byte => Buffer.from([byte]))
  const ctx: any = { request: { body: Readable.from(chunks) }, response: { headers: {} } }
  const fetch = vi.fn(async (_url: any, init: any) => {
    expect(JSON.parse(init.body).messages[0].content).toBe('Català, español')
    return new Response('{}', { status: 503 })
  })
  await handleOllamaChat(ctx, { model: 'qwen3:4b' }, fetch)
  expect(ctx.response.status).toBe(503)
})
