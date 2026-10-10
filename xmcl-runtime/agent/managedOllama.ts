import { spawn, type ChildProcess } from 'child_process'
import { constants } from 'fs'
import { access, mkdir, open, readFile, rename, statfs, unlink, writeFile } from 'fs/promises'
import { createServer } from 'net'
import { isAbsolute, join, relative, resolve } from 'path'
import { validateOllamaBundle } from './runtimeBundle'
import { OLLAMA_SUPERVISOR } from './ollamaSupervisor'
import { ownsOllamaPort } from './ollamaPortOwner'
import { installFactoryModel } from './modelBundle'
export const kOllamaResourceRoot = Symbol('ollama-resource-root')

export interface ManagedOllamaOptions { bundle: string; data: string; seed?: string; portableBase?: string; readinessTimeoutMs?: number }
export interface LocalRuntimeConfig { modelsDirectory?: string; externalOrigin?: string }

export function modelDirectory(options: ManagedOllamaOptions, config: LocalRuntimeConfig) {
  const base = options.portableBase || options.data
  if (!config.modelsDirectory) return join(options.data, 'models')
  return isAbsolute(config.modelsDirectory) ? config.modelsDirectory : resolve(base, config.modelsDirectory)
}

function validateExternal(origin: string) {
  const url = new URL(origin)
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('ollama_invalid_external_origin')
  return url.origin
}

export class ManagedOllama {
  private child?: ChildProcess
  private origin?: string
  private pending?: Promise<string>
  private stopping = false
  private lock?: Awaited<ReturnType<typeof open>>
  private lockPath?: string
  private lockRelease?: Promise<void>
  private abort?: AbortController
  constructor(readonly options: ManagedOllamaOptions, private fetch = globalThis.fetch,
    private diagnostic: (event: string, details?: Record<string, string | number>) => void = () => {}) {}

  async configuration(): Promise<LocalRuntimeConfig> {
    try { return JSON.parse(await readFile(join(this.options.data, 'config.json'), 'utf8')) } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return {}
      throw e
    }
  }

  async configure(input: LocalRuntimeConfig) {
    if (input.externalOrigin) validateExternal(input.externalOrigin)
    if (typeof input.modelsDirectory !== 'undefined' && (typeof input.modelsDirectory !== 'string' || input.modelsDirectory.includes('\0'))) throw new Error('ollama_invalid_models_directory')
    await this.stop()
    const chosen = modelDirectory(this.options, input)
    await mkdir(chosen, { recursive: true })
    await access(chosen, constants.W_OK)
    const config = { ...input }
    if (config.modelsDirectory && this.options.portableBase) {
      const name = relative(this.options.portableBase, chosen)
      if (name && !name.startsWith('..') && !isAbsolute(name)) config.modelsDirectory = name
    }
    await mkdir(this.options.data, { recursive: true })
    const temporary = join(this.options.data, `config-${process.pid}.tmp`)
    await writeFile(temporary, JSON.stringify(config), { mode: 0o600 })
    await rename(temporary, join(this.options.data, 'config.json'))
  }

  async storage() {
    const config = await this.configuration()
    const models = modelDirectory(this.options, config)
    await mkdir(models, { recursive: true })
    const space = await statfs(models)
    return { modelsDirectory: models, freeBytes: space.bavail * space.bsize, externalOrigin: config.externalOrigin }
  }

  ensure(): Promise<string> {
    if (this.stopping) return Promise.reject(new Error('ollama_stopping'))
    if (this.origin && (!this.child || this.child.exitCode === null)) return Promise.resolve(this.origin)
    if (!this.pending) this.pending = this.start().catch(error => {
      this.diagnostic('start.error', { code: error.code || (/^ollama_[a-z_]+$/.test(error.message) ? error.message : 'unknown') })
      throw error
    }).finally(() => { this.pending = undefined })
    return this.pending
  }

  private async start() {
    this.diagnostic('start', { executable: process.execPath, bundle: this.options.bundle, seed: this.options.seed || '', data: this.options.data, arch: process.arch })
    const controller = new AbortController()
    this.abort = controller
    const config = await this.configuration()
    let bundle: Awaited<ReturnType<typeof validateOllamaBundle>>
    try { bundle = await validateOllamaBundle(this.options.bundle) } catch (e) {
      // An absent integrated bundle may use only an explicitly saved external service.
      if ((e as NodeJS.ErrnoException).code === 'ENOENT' && config.externalOrigin) {
        const origin = validateExternal(config.externalOrigin)
        const response = await this.fetch(origin + '/api/version', { signal: AbortSignal.timeout(3000), redirect: 'error' })
        if (!response.ok || typeof (await response.json() as any).version !== 'string') throw new Error('ollama_external_unavailable')
        this.origin = origin
        return origin
      }
      throw e
    }
    const models = modelDirectory(this.options, config)
    this.diagnostic('storage', { models })
    await mkdir(models, { recursive: true })
    await mkdir(join(this.options.data, 'home'), { recursive: true })
    await mkdir(join(this.options.data, 'tmp'), { recursive: true })
    this.lockPath = join(models, '.pbtadmin-engine.lock')
    try { this.lock = await open(this.lockPath, 'wx', 0o600) } catch { throw new Error('ollama_store_locked_or_readonly') }
    const reservation = createServer()
    try {
      await this.lock.writeFile(JSON.stringify({ pid: process.pid }))
      if (this.options.seed) {
        this.diagnostic('seed.begin')
        try { await installFactoryModel(this.options.seed, models) } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new Error('ollama_seed_missing')
          throw error
        }
        this.diagnostic('seed.ready')
      }
      if (controller.signal.aborted) throw new Error('ollama_start_cancelled')
      await new Promise<void>((done, reject) => { reservation.once('error', reject); reservation.listen(0, '127.0.0.1', done) })
      const port = (reservation.address() as { port: number }).port
      await new Promise<void>((done, reject) => reservation.close(e => e ? reject(e) : done()))
      const origin = `http://127.0.0.1:${port}`
      const env: NodeJS.ProcessEnv = Object.fromEntries(Object.entries(process.env).filter(([name]) => ['PATH', 'SystemRoot', 'SYSTEMROOT', 'WINDIR', 'LANG', 'LC_ALL', 'LD_LIBRARY_PATH', 'CUDA_VISIBLE_DEVICES', 'HIP_VISIBLE_DEVICES', 'ROCR_VISIBLE_DEVICES', 'GGML_VK_VISIBLE_DEVICES'].includes(name)))
      Object.assign(env, { OLLAMA_HOST: `127.0.0.1:${port}`, OLLAMA_MODELS: models, OLLAMA_ORIGINS: 'http://pbtadmin.invalid', OLLAMA_NO_CLOUD: '1', OLLAMA_NOPRUNE: '1', HOME: join(this.options.data, 'home'), USERPROFILE: join(this.options.data, 'home'), APPDATA: join(this.options.data, 'home'), LOCALAPPDATA: join(this.options.data, 'home'), TMPDIR: join(this.options.data, 'tmp'), TEMP: join(this.options.data, 'tmp'), TMP: join(this.options.data, 'tmp') })
      // The supervisor detects parent death via stdin and owns only this engine's tree.
      const child = spawn(process.execPath, ['-e', OLLAMA_SUPERVISOR, bundle.executable], { cwd: this.options.data, env: { ...env, ELECTRON_RUN_AS_NODE: '1' }, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
      this.child = child
      this.diagnostic('supervisor.spawn', { pid: child.pid || 0, origin })
      let enginePid = 0
      let info = ''
      child.stdout?.on('data', data => {
        info += data.toString()
        if (info.length > 1024) { controller.abort(); return }
        if (info.includes('\n')) { try { enginePid = Number(JSON.parse(info.trim()).pid) } catch { controller.abort() } }
      })
      let failure: Error | undefined
      child.on('error', error => { this.diagnostic('supervisor.error', { code: (error as NodeJS.ErrnoException).code || 'unknown' }); failure = new Error('ollama_spawn_failed') })
      child.stderr?.resume() // Drain diagnostics without logging paths, prompts or keys.
      child.once('exit', code => {
        this.diagnostic('supervisor.exit', { code: code ?? -1 })
        this.origin = undefined
        // Failed tree cleanup cannot authorize a new engine against the same store.
        if (code === 0) {
          if (this.child === child) this.child = undefined
          void this.releaseLock().catch(() => {})
        }
      })
      const timeout = AbortSignal.timeout(this.options.readinessTimeoutMs ?? 20000)
      const signal = AbortSignal.any([timeout, controller.signal])
      let readinessReason = 'not_listening'
      while (!signal.aborted) {
        if (failure) throw failure
        if (child.exitCode !== null || child.signalCode !== null) throw new Error('ollama_process_exited')
        try {
          const response = await this.fetch(origin + '/api/version', { signal: AbortSignal.any([signal, AbortSignal.timeout(500)]), redirect: 'error' })
          if (!response.ok) readinessReason = `http_${response.status}`
          else if ((await response.json() as any).version !== bundle.manifest.version.replace(/^v/, '')) readinessReason = 'version_mismatch'
          else if (!enginePid) readinessReason = 'supervisor_pid_missing'
          else if (!await ownsOllamaPort(enginePid, port)) readinessReason = 'port_owner_mismatch'
          else if (child.exitCode === null && !signal.aborted) { this.origin = origin; this.diagnostic('ready', { pid: enginePid, origin }); return origin }
        } catch (error) {
          const code = (error as NodeJS.ErrnoException).code || (error as { cause?: { code?: string } }).cause?.code || (error as Error).name
          readinessReason = /^[a-zA-Z0-9_]+$/.test(code || '') ? code! : 'connection_error'
        }
        await new Promise<void>(done => { const timer = setTimeout(done, 100); timer.unref() })
      }
      this.diagnostic('readiness.failed', { reason: readinessReason, pid: enginePid, origin })
      throw new Error(controller.signal.aborted ? 'ollama_start_cancelled' : 'ollama_readiness_timeout')
    } catch (e) {
      this.diagnostic('start.failed', { code: (e as NodeJS.ErrnoException).code || (/^ollama_[a-z_]+$/.test((e as Error).message) ? (e as Error).message : 'unknown') })
      reservation.close()
      await this.stopChild()
      await this.releaseLock()
      throw e
    }
  }

  private async stopChild() {
    const child = this.child
    if (!child) return
    if (child.exitCode !== null || child.signalCode !== null) {
      if (child.exitCode !== 0) throw new Error('ollama_cleanup_unconfirmed')
      return
    }
    await new Promise<void>((done, reject) => {
      const timer = setTimeout(() => reject(new Error('ollama_cleanup_timeout')), 5000)
      child.once('exit', code => {
        clearTimeout(timer)
        if (code === 0) done()
        else reject(new Error('ollama_cleanup_unconfirmed'))
      })
      child.stdin?.end()
    })
    this.child = undefined
  }
  private async releaseLock() {
    const lock = this.lock
    const path = this.lockPath
    if (!lock) { await this.lockRelease; return }
    this.lock = undefined
    this.lockPath = undefined
    this.lockRelease = (async () => {
      await lock.close()
      if (path) await unlink(path).catch(e => { if (e.code !== 'ENOENT') throw e })
    })()
    await this.lockRelease.finally(() => { this.lockRelease = undefined })
  }
  async stop() {
    this.stopping = true
    this.abort?.abort()
    await this.pending?.catch(() => {})
    await this.stopChild()
    await this.releaseLock()
    this.origin = undefined
    this.stopping = false
  }
}
