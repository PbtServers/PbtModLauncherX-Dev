import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

// Report the engine's actionable error without exposing signed URLs or credentials.
export function safePullError(value) {
  return String(value).replace(/https?:\/\/[^\s"<>]+/gi, '[download URL redacted]')
    .replace(/(bearer\s+|(?:token|password|secret|api[_-]?key)\s*[=:]\s*)[^\s,;]+/gi, '$1[redacted]')
    .replace(/[\r\n\x00-\x1f]+/g, ' ').slice(0, 1200)
}

export function checkPullEvent(line) {
  const event = JSON.parse(line)
  if (event.error) throw new Error('Official model pull: ' + safePullError(event.error))
  return event
}

export async function prepareFactoryModel() {
  const sourceArg = process.argv.indexOf('--source')
  const selectedSource = sourceArg < 0 ? 'ollama' : process.argv[sourceArg + 1]
  if (selectedSource === 'huggingface') {
    const { prepareHuggingFace } = await import('./prepare-ollama-hf.mjs')
    return prepareHuggingFace({ downloadOnly: process.argv.includes('--download-only') })
  }
  if (selectedSource !== 'ollama') throw new Error('Unknown model source')
  const require = createRequire(new URL('../xmcl-electron-app/package.json', import.meta.url))
  const { build } = require('esbuild')
  const compiled = await build({ entryPoints: ['xmcl-runtime/agent/managedOllama.ts'], bundle: true, platform: 'node', format: 'esm', write: false })
  const { ManagedOllama } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'))
  const checked = await build({ entryPoints: ['xmcl-runtime/agent/modelBundle.ts'], bundle: true, platform: 'node', format: 'esm', write: false })
  const { FACTORY_MODEL, FACTORY_MANIFEST, FACTORY_SOURCE, factoryDescriptors, validateFactoryModel } = await import('data:text/javascript;base64,' + Buffer.from(checked.outputFiles[0].text).toString('base64'))
  // This reference is obtained via TLS from the official registry before starting
  // any engine. Blobs must match its descriptor hashes, not a self-hashed download.
  const response = await fetch(FACTORY_SOURCE, { redirect: 'error', signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error(`Official registry HTTP ${response.status}`)
  const reference = await response.text()
  const digest = createHash('sha256').update(reference).digest('hex')
  const advertised = response.headers.get('docker-content-digest')
  if (advertised && advertised !== 'sha256:' + digest) throw new Error('Official reference digest mismatch')
  const source = JSON.parse(reference)
  factoryDescriptors(source)
  const target = resolve('xmcl-electron-app/build/ollama/ollama-model')
  try { await readFile(join(target, 'seed.json')); throw new Error('Existing seed staging must not be overwritten') } catch (error) { if (error.code !== 'ENOENT') throw error }
  const work = target + `.preparing-${process.pid}`
  const store = join(work, 'models')
  await mkdir(store, { recursive: true })
  const platform = { win32: 'win', linux: 'linux', darwin: 'mac' }[process.platform]
  const engine = new ManagedOllama({ bundle: resolve(`xmcl-electron-app/build/ollama/${platform}-${process.arch}`), data: join(work, 'engine'), readinessTimeoutMs: 120000 }, undefined, (event, details) => console.log('Ollama preparation:', event, JSON.stringify(details || {})))
  await engine.configure({ modelsDirectory: store })
  try {
    const origin = await engine.ensure()
    const result = await fetch(origin + '/api/pull', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: FACTORY_MODEL, stream: true }), signal: AbortSignal.timeout(60 * 60 * 1000) })
    if (!result.ok || !result.body) throw new Error(`Official model pull HTTP ${result.status}`)
    let buffer = ''; let successful = false; let lastStatus = ''
    const decoder = new TextDecoder()
    for await (const bytes of result.body) {
      buffer += decoder.decode(bytes, { stream: true })
      if (buffer.length > 1024 * 1024) throw new Error('Invalid pull response')
      const lines = buffer.split('\n'); buffer = lines.pop() || ''
      for (const line of lines.filter(Boolean)) {
        const event = checkPullEvent(line)
        if (event.status !== lastStatus) { console.log(event.status); lastStatus = event.status }
        if (event.status === 'success') successful = true
      }
    }
    buffer += decoder.decode()
    if (buffer.trim()) successful = checkPullEvent(buffer).status === 'success' || successful
    if (!successful) throw new Error('Model pull did not complete')
    await writeFile(join(store, 'official-manifest.json'), reference)
    const license = source.layers.find(entry => entry.mediaType === 'application/vnd.ollama.image.license')
    if (!license) throw new Error('Official license missing')
    await writeFile(join(store, 'LICENSE'), await readFile(join(store, 'blobs', license.digest.replace(':', '-'))))
    await writeFile(join(store, 'seed.json'), JSON.stringify({ schema: 1, model: FACTORY_MODEL, source: FACTORY_SOURCE, referenceSha256: digest }, null, 2))
  } finally { await engine.stop() }
  const verified = await validateFactoryModel(store)
  console.log(JSON.stringify({ model: FACTORY_MODEL, bytes: verified.bytes, referenceSha256: digest, files: verified.files.length, manifest: FACTORY_MANIFEST }))
  await rename(store, target)
  console.log('Verified model staging ready: ' + target)
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) prepareFactoryModel().catch(error => { console.error(error.cause?.code || error.code || '', error.message); process.exitCode = 1 })
