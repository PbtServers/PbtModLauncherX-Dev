import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, expect, test, vi } from 'vitest'
import { ManagedOllama, modelDirectory } from './managedOllama'
import { validateOllamaBundle } from './runtimeBundle'

vi.mock('./runtimeBundle', () => ({ validateOllamaBundle: vi.fn(async (path: string) => {
  if (path === 'missing') throw Object.assign(new Error('absent'), { code: 'ENOENT' })
  return { executable: process.execPath, manifest: { version: 'v1.2.3' } }
}) }))
vi.mock('./ollamaPortOwner', () => ({ ownsOllamaPort: vi.fn(async () => true) }))
// This fixture has no worker descendants. Native taskkill is independently
// exercised and may be denied by the Windows sandbox; do not claim tree cleanup.
vi.mock('./ollamaSupervisor', () => ({ OLLAMA_SUPERVISOR: String.raw`
const { spawn } = require('node:child_process');
const engine = spawn(process.argv[1], ['serve'], { stdio: 'ignore', shell: false, env: process.env });
let stopping = false;
engine.on('spawn', () => process.stdout.write(JSON.stringify({pid: engine.pid}) + '\n'));
engine.on('error', () => process.exit(1));
engine.on('exit', code => process.exit(stopping ? 0 : (code || 0)));
process.stdin.resume();
process.stdin.on('end', () => { stopping = true; engine.kill() });
` }))
const engines: ManagedOllama[] = []
const directories: string[] = []
afterEach(async () => { for (const engine of engines.splice(0)) await engine.stop(); for (const path of directories.splice(0)) await rm(path, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }) })
async function fixture(body?: string) {
  const data = await mkdtemp(join(tmpdir(), 'Pbt IA unicode-')); directories.push(data)
  // A real Node child simulates only the API/lifecycle. It is NOT Ollama inference.
  await writeFile(join(data, 'serve'), body || `require('node:http').createServer((q,r)=>{r.setHeader('content-type','application/json');r.end(JSON.stringify({version:'1.2.3'}))}).listen(Number(process.env.OLLAMA_HOST.split(':').pop()),'127.0.0.1');`)
  const bundle = join(data, 'bundle')
  await mkdir(bundle)
  await writeFile(join(bundle, 'bundle.json'), '{}')
  const engine = new ManagedOllama({ bundle, data, readinessTimeoutMs: 2000 }); engines.push(engine)
  return { engine, data }
}
test('starts one supervised child for concurrent requests and closes/restarts without deleting models', async () => {
  const { engine, data } = await fixture()
  const [a, b] = await Promise.all([engine.ensure(), engine.ensure()]); expect(a).toBe(b); expect(a).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/)
  await writeFile(join(data, 'models', 'retained-model'), 'unchanged')
  await engine.stop()
  await expect(fetch(a)).rejects.toThrow()
  expect(await readFile(join(data, 'models', 'retained-model'), 'utf8')).toBe('unchanged')
  expect(await engine.ensure()).toMatch(/^http:\/\/127\.0\.0\.1:/)
}, 15000)
test('rejects a second manager sharing a live model store', async () => {
  const { engine, data } = await fixture(); await engine.ensure()
  const validations = vi.mocked(validateOllamaBundle).mock.calls.length
  const other = new ManagedOllama({ bundle: engine.options.bundle, data }); engines.push(other)
  await expect(other.ensure()).rejects.toThrow('store_locked')
  await expect(other.ensure()).rejects.toThrow('store_locked')
  expect(vi.mocked(validateOllamaBundle).mock.calls.length).toBe(validations)
})
test('times out and releases its own lock for recovery', async () => {
  const { engine, data } = await fixture('setInterval(()=>{},1000)')
  engine.options.readinessTimeoutMs = 200
  await expect(engine.ensure()).rejects.toThrow('readiness_timeout')
  await expect(readFile(join(data, 'models', '.pbtadmin-engine.lock'))).rejects.toThrow()
})
test('missing integrated engine never probes an external service without consent', async () => {
  const { data } = await fixture(); const fetch = vi.fn()
  const engine = new ManagedOllama({ bundle: 'missing', data }, fetch); engines.push(engine)
  await expect(engine.ensure()).rejects.toThrow('absent'); expect(fetch).not.toHaveBeenCalled()
  await expect(engine.configure({ externalOrigin: 'http://0.0.0.0:11434' })).rejects.toThrow('invalid_external')
})
test('portable relative model paths follow folder relocation and persist without copying models', async () => {
  const { engine, data } = await fixture(); engine.options.portableBase = data
  await engine.configure({ modelsDirectory: join(data, 'custom-models') })
  expect((await engine.configuration()).modelsDirectory).toBe('custom-models')
  expect(modelDirectory({ ...engine.options, portableBase: join(data, 'moved') }, await engine.configuration())).toBe(join(data, 'moved', 'custom-models'))
  expect((await engine.storage()).freeBytes).toBeGreaterThan(0)
})

test('explicit external consent permits a missing bundle without owning or stopping that service', async () => {
  const { data } = await fixture()
  const fetch = vi.fn(async () => new Response(JSON.stringify({ version: '0.34.0' })))
  const engine = new ManagedOllama({ bundle: 'missing', data }, fetch); engines.push(engine)
  await engine.configure({ externalOrigin: 'http://127.0.0.1:11434' })
  expect(await engine.ensure()).toBe('http://127.0.0.1:11434')
  await engine.stop()
  expect(fetch).toHaveBeenCalledTimes(1)
  expect((await engine.configuration()).externalOrigin).toBe('http://127.0.0.1:11434')
})

test('cancelling readiness stops the owned child and releases its store', async () => {
  const { engine, data } = await fixture('setInterval(()=>{},1000)')
  const started = engine.ensure()
  const rejected = expect(started).rejects.toThrow('start_cancelled')
  await engine.stop()
  await rejected
  await expect(readFile(join(data, 'models', '.pbtadmin-engine.lock'))).rejects.toThrow()
})
