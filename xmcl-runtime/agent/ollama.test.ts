import { createServer } from 'http'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { OllamaController, parseOllamaModel } from './ollama'

const hardware = () => ({ totalMemory: 16 * 1024 ** 3, freeMemory: 10 * 1024 ** 3, cpuCount: 8 })
const show = { capabilities: ['completion', 'tools'], model_info: { 'qwen3.context_length': 40960 }, parameters: 'num_ctx 8192' }
const tags = { models: [{ name: 'qwen3:4b-q4_K_M', size: 2_600_000_000 }] }
const controllers: OllamaController[] = []
afterEach(() => { for (const controller of controllers.splice(0)) controller.cancel() })
const controller = (fetch: typeof globalThis.fetch) => {
  const value = new OllamaController(fetch, async () => false, hardware)
  controllers.push(value)
  return value
}

describe('local Ollama', () => {
  test('recommends the optional light model on constrained hardware without downloading or changing selection', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ models: [] })))
    const value = new OllamaController(fetch, async () => true, () => ({ totalMemory: 6 * 1024 ** 3, freeMemory: 3 * 1024 ** 3, cpuCount: 2 }))
    expect((await value.inspect()).recommendedModels).toEqual(['qwen3:1.7b-q4_K_M'])
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(value.getDownloadStatus().state).toBe('idle')
    expect(() => value.start('unapproved-light-model')).toThrow('ollama_confirmation_required')
  })
  test('distinguishes denied local connections from a stopped service', async () => {
    const fetch = vi.fn(async () => { throw Object.assign(new Error('fetch failed'), { cause: { code: 'EACCES' } }) })
    expect(await controller(fetch).inspect()).toMatchObject({ running: false, error: 'connectionFailed' })
  })
  test('resolves verified local chat-only models without advertising tools', async () => {
    const fetch = vi.fn(async (url: any) => new Response(JSON.stringify(String(url).endsWith('/api/tags') ? tags : { capabilities: ['completion'] })))
    expect(await controller(fetch).resolveModel('qwen3:4b-q4_K_M')).toMatchObject({ chatCompatible: true, compatible: false })
    expect(parseOllamaModel('model:cloud', 10, { capabilities: ['completion'] }).chatCompatible).toBe(false)
    expect(parseOllamaModel('model', 10, {}).chatCompatible).toBe(false)
  })
  test('rejects text-only and cloud models and limits the context budget', () => {
    expect(parseOllamaModel('qwen3:4b-q4_K_M', 10, show)).toMatchObject({ compatible: true, contextWindow: 8192 })
    expect(parseOllamaModel('qwen3:4b-q4_K_M', 10, { ...show, parameters: '' }).contextWindow).toBe(8192)
    for (const metadata of [{ capabilities: ['completion'] }, { ...show, remote_host: 'https://ollama.com' }, { ...show, remote_model: 'remote' }]) {
      expect(parseOllamaModel('model', 10, metadata).compatible).toBe(false)
    }
    expect(parseOllamaModel('model:cloud', 10, show).compatible).toBe(false)
    expect(parseOllamaModel('model', 0, show).compatible).toBe(false)
  })

  test('detects engine/models without any pull or generation request', async () => {
    const fetch = vi.fn(async (url: any) => new Response(JSON.stringify(String(url).endsWith('/api/tags') ? tags : show)))
    const value = await controller(fetch).inspect()
    expect(value).toMatchObject({ installed: true, running: true, cpuCount: 8, recommendedModels: ['qwen3:1.7b-q4_K_M', 'qwen3:4b-q4_K_M', 'qwen3:8b'] })
    expect(value.models[0]).toMatchObject({ name: 'qwen3:4b-q4_K_M', compatible: true })
    expect(fetch.mock.calls.map(([url]) => url)).toEqual(['http://127.0.0.1:11434/api/tags', 'http://127.0.0.1:11434/api/show'])
  })

  test('returns bounded unavailable state and does not claim an engine is installed', async () => {
    const value = await controller(vi.fn().mockRejectedValue(new Error('offline'))).inspect()
    expect(value).toMatchObject({ installed: false, running: false, error: 'unavailable', models: [] })
  })

  test('rejects missing models, tool-incompatible models and invalid responses', async () => {
    expect(await controller(vi.fn(async () => new Response('{}'))).resolveModel('missing')).toBeUndefined()
    expect(await controller(vi.fn(async () => new Response('{}'))).inspect()).toMatchObject({ error: 'invalidResponse' })
  })

  test('preview requires a single-use confirmation and never downloads automatically', async () => {
    const fetch = vi.fn(async () => new Response('{"status":"success"}\n'))
    const client = controller(fetch)
    expect(() => client.start('unapproved')).toThrow('ollama_confirmation_required')
    expect(() => client.prepare('evil/unknown:cloud')).toThrow('ollama_model_not_allowed')
    const preview = client.prepare('qwen3:4b-q4_K_M')
    expect(preview.estimatedBytes).toBe(2_600_000_000)
    expect(fetch).not.toHaveBeenCalled()
    client.start(preview.confirmationId)
    await vi.waitFor(() => expect(client.getDownloadStatus().state).toBe('completed'))
    expect(() => client.start(preview.confirmationId)).toThrow('ollama_confirmation_required')
  })

  test('expired previews cannot start a pull', () => {
    const client = controller(vi.fn())
    const preview = client.prepare('qwen3:4b-q4_K_M')
    const now = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 6 * 60_000)
    try { expect(() => client.start(preview.confirmationId)).toThrow('ollama_confirmation_required') } finally { now.mockRestore() }
  })

  test('a cancelled pull cannot overwrite the progress of a later consented retry', async () => {
    let finishFirst!: (response: Response) => void
    const fetch = vi.fn<typeof globalThis.fetch>()
      .mockImplementationOnce(() => new Promise(resolve => { finishFirst = resolve }))
      .mockImplementationOnce((_url, init) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('abort')), { once: true })
      }))
    const client = controller(fetch)
    client.start(client.prepare('qwen3:4b-q4_K_M').confirmationId)
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    client.cancel()
    client.start(client.prepare('qwen3:4b-q4_K_M').confirmationId)
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    finishFirst(new Response('{"status":"success"}\n'))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(client.getDownloadStatus().state).toBe('running')
    client.cancel()
  })

  test('handles corrupt progress and cancellation without claiming completion', async () => {
    const corrupt = controller(vi.fn(async () => new Response('broken\n')))
    corrupt.start(corrupt.prepare('qwen3:4b-q4_K_M').confirmationId)
    await vi.waitFor(() => expect(corrupt.getDownloadStatus()).toMatchObject({ state: 'failed', error: 'downloadFailed' }))
    const pending = controller(vi.fn((_url, init) => new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('abort')), { once: true }))))
    pending.start(pending.prepare('qwen3:4b-q4_K_M').confirmationId)
    pending.cancel()
    await vi.waitFor(() => expect(pending.getDownloadStatus().state).toBe('cancelled'))
  })

  test('integration: actual temporary HTTP server streams split NDJSON progress', async () => {
    const paths: string[] = []
    const server = createServer((req, res) => {
      paths.push(req.url || '')
      if (req.url === '/api/tags') return res.end(JSON.stringify(tags))
      if (req.url === '/api/show') return res.end(JSON.stringify(show))
      if (req.url === '/api/pull') {
        res.write('{"status":"downloading","completed":10,');
        res.write('"total":20}\n{"status":"success"}'); res.end()
      } else { res.statusCode = 404; res.end() }
    })
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const address = server.address() as { port: number }
    const client = controller((input, init) => globalThis.fetch(String(input).replace('127.0.0.1:11434', `127.0.0.1:${address.port}`), init))
    try {
      expect((await client.inspect()).models[0].compatible).toBe(true)
      client.start(client.prepare('qwen3:4b-q4_K_M').confirmationId)
      await vi.waitFor(() => expect(client.getDownloadStatus().state).toBe('completed'))
      expect(paths).toEqual(['/api/tags', '/api/show', '/api/pull'])
    } finally { client.cancel(); await new Promise<void>(resolve => server.close(() => resolve())) }
  })
})
