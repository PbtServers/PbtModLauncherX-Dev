import { LOCAL_AI_MODELS, type LocalAiModel, type OllamaStatus, type OllamaDownloadPreview, type OllamaDownloadStatus } from '@xmcl/runtime-api'
import { randomUUID } from 'crypto'
import { access } from 'fs/promises'
import { cpus, freemem, totalmem } from 'os'
import { delimiter, join } from 'path'

const ORIGIN = 'http://127.0.0.1:11434'
type Fetch = typeof globalThis.fetch

export async function detectOllamaInstalled(): Promise<boolean | undefined> {
  const names = process.platform === 'win32' ? ['ollama.exe'] : ['ollama']
  const directories = (process.env.PATH ?? '').split(delimiter)
  if (process.env.LOCALAPPDATA) directories.push(join(process.env.LOCALAPPDATA, 'Programs', 'Ollama'))
  if (process.platform === 'darwin') directories.push('/usr/local/bin', '/Applications/Ollama.app/Contents/Resources')
  let inaccessible = false
  for (const directory of directories.filter(Boolean)) {
    for (const name of names) {
      try { await access(join(directory.replace(/^"|"$/g, ''), name)); return true } catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'EACCES' || (e as NodeJS.ErrnoException).code === 'EPERM') inaccessible = true
      }
    }
  }
  return inaccessible ? undefined : false
}

export function parseOllamaModel(name: string, size: number, show: any): LocalAiModel {
  const capabilities = Array.isArray(show?.capabilities) ? show.capabilities : []
  const lengths = Object.entries(show?.model_info ?? {}).filter(([key]) => key.endsWith('.context_length')).map(([, value]) => Number(value)).filter(Number.isFinite)
  const configuredContext = typeof show?.parameters === 'string' ? Number(show.parameters.match(/(?:^|\n)\s*num_ctx\s+(\d+)/)?.[1]) : 0
  return {
    name, size,
    chatCompatible: capabilities.includes('completion') && !show?.remote_host && !show?.remote_model && !name.endsWith(':cloud') && size > 0,
    // Ollama can route cloud models through localhost: do not treat those as offline models.
    compatible: capabilities.includes('tools') && capabilities.includes('completion') && !show?.remote_host && !show?.remote_model && !name.endsWith(':cloud') && size > 0,
    // Respect an explicit Modelfile setting. The native chat bridge sets a
    // bounded context per request without changing the saved model.
    contextWindow: Math.max(512, Math.min(8192, lengths[0] || 4096, configuredContext || 8192)),
  }
}

export class OllamaController {
  private confirmations = new Map<string, { model: string; expires: number }>()
  private controller?: AbortController
  private status: OllamaDownloadStatus = { state: 'idle' }

  constructor(private fetch: Fetch, private installed = detectOllamaInstalled,
    private hardware = () => ({ totalMemory: totalmem(), freeMemory: freemem(), cpuCount: cpus().length }),
    private origin = async () => ORIGIN) {}

  private async json(path: string, body?: unknown) {
    const response = await this.fetch(await this.origin() + path, {
      method: body ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(3000),
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!response.ok) throw new Error('ollama_unavailable')
    return response.json()
  }

  async resolveModel(name: string): Promise<LocalAiModel | undefined> {
    try {
      const tags: any = await this.json('/api/tags')
      const installed = tags?.models?.find((entry: any) => entry.name === name)
      if (!installed || !Number.isFinite(installed.size)) return undefined
      const model = parseOllamaModel(name, installed.size, await this.json('/api/show', { model: name }))
      return model.chatCompatible ? model : undefined
    } catch { return undefined }
  }

  async inspect(): Promise<OllamaStatus> {
    const hardware = this.hardware()
    const status: OllamaStatus = {
      ...hardware, installed: await this.installed(), running: false, models: [],
      recommendedModels: LOCAL_AI_MODELS.filter(model => hardware.totalMemory >= model.minRamBytes && hardware.freeMemory >= model.estimatedBytes * 1.5).map(model => model.name),
    }
    try {
      const tags: any = await this.json('/api/tags')
      if (!Array.isArray(tags?.models)) return { ...status, error: 'invalidResponse' }
      status.running = true
      status.installed = true
      // Bound work and do not inspect model files or start a model during detection.
      for (const model of tags.models.slice(0, 32)) {
        if (typeof model.name !== 'string' || !Number.isFinite(model.size)) continue
        try {
          status.models.push(parseOllamaModel(model.name, model.size, await this.json('/api/show', { model: model.name })))
        } catch { status.models.push({ name: model.name, size: model.size, compatible: false, contextWindow: 4096 }) }
      }
      return status
    } catch (e) {
      const code = (e as { cause?: { code?: string }; name?: string }).cause?.code
      return { ...status, error: code && code !== 'ECONNREFUSED' || (e as Error).name === 'TimeoutError' ? 'connectionFailed' : 'unavailable' }
    }
  }

  prepare(model: string): OllamaDownloadPreview {
    const entry = LOCAL_AI_MODELS.find(entry => entry.name === model)
    if (!entry) throw new Error('ollama_model_not_allowed')
    if (this.status.state === 'running') throw new Error('ollama_download_running')
    const confirmationId = randomUUID()
    this.confirmations.clear()
    this.confirmations.set(confirmationId, { model, expires: Date.now() + 5 * 60_000 })
    return { confirmationId, model, estimatedBytes: entry.estimatedBytes }
  }

  start(confirmationId: string) {
    const preview = this.confirmations.get(confirmationId)
    if (!preview || preview.expires < Date.now()) throw new Error('ollama_confirmation_required')
    if (this.status.state === 'running') throw new Error('ollama_download_running')
    this.confirmations.delete(confirmationId)
    const controller = new AbortController()
    this.controller = controller
    this.status = { state: 'running', model: preview.model }
    void this.pull(preview.model, controller)
  }

  getDownloadStatus(): OllamaDownloadStatus { return { ...this.status } }
  cancel() { this.controller?.abort(); if (this.status.state === 'running') this.status = { ...this.status, state: 'cancelled' } }

  private async pull(model: string, controller: AbortController) {
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    try {
      const response = await this.fetch(await this.origin() + '/api/pull', {
        method: 'POST', redirect: 'error', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30 * 60_000)]),
        headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model, stream: true }),
      })
      if (!response.ok || !response.body) throw new Error('downloadFailed')
      reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let success = false
      for (;;) {
        let timer: ReturnType<typeof setTimeout> | undefined
        const chunk = await Promise.race([
          reader.read(),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => { controller.abort(); reject(new Error('timeout')) }, 60_000)
            timer.unref()
          }),
        ]).finally(() => clearTimeout(timer))
        if (chunk.done) { buffer += decoder.decode(); break }
        buffer += decoder.decode(chunk.value, { stream: true })
        if (buffer.length > 1_000_000) throw new Error('downloadFailed')
        let end: number
        while ((end = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, end); buffer = buffer.slice(end + 1)
          if (!line.trim()) continue
          const event = JSON.parse(line)
          if (event.error) throw new Error('downloadFailed')
          if (event.status === 'success') success = true
          this.status = { state: 'running', model, completed: event.completed, total: event.total }
        }
      }
      if (buffer.trim()) {
        const event = JSON.parse(buffer)
        if (event.error) throw new Error('downloadFailed')
        success ||= event.status === 'success'
      }
      if (!success) throw new Error('downloadFailed')
      this.status = { state: 'completed', model }
    } catch (e) {
      if (this.status.state !== 'cancelled') this.status = { state: 'failed', model, error: (e as Error).message === 'timeout' ? 'timeout' : 'downloadFailed' }
    } finally {
      await reader?.cancel().catch(() => {})
      if (this.controller === controller) this.controller = undefined
    }
  }
}
