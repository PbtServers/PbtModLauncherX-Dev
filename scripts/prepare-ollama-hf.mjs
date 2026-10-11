import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { lstat, mkdir, open, readFile, rename, writeFile, rmdir, statfs } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve, join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const require = createRequire(new URL('../xmcl-electron-app/package.json', import.meta.url))
// LICENSE was added after the pinned weights revision. This official raw URL
// has been checked independently; preserve the fetched text and provenance.
export const QWEN_LICENSE_URL = 'https://huggingface.co/Qwen/Qwen3-4B-GGUF/raw/main/LICENSE'
export async function fetchQwenLicense(request = officialFetch) {
  let response
  try { response = await request(QWEN_LICENSE_URL) } catch (error) {
    throw new Error(`Official license network error (${error.cause?.code || error.code || error.name}); TLS verification remains enabled`, { cause: error })
  }
  if (response.status === 404) throw new Error('Official LICENSE not found at configured URL; inspect license source, not model weights')
  if (!response.ok) throw new Error(`Official license HTTP ${response.status}`)
  const license = await response.text()
  if (!license.includes('Apache License') || !license.includes('Version 2.0') || !license.includes('END OF TERMS AND CONDITIONS') || !license.includes('Copyright 2025 Alibaba Cloud') || license.includes('"""')) throw new Error('Official license response is incomplete or incorrect')
  return license
}
async function compiled(entry) {
  const { build } = require('esbuild')
  const result = await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', write: false })
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'))
}
async function hash(path) {
  const sha = createHash('sha256')
  for await (const bytes of createReadStream(path)) sha.update(bytes)
  return sha.digest('hex')
}
export function authorizedHfUrl(value) {
  const url = new URL(value)
  return url.protocol === 'https:' && !url.username && !url.password && (!url.port || url.port === '443') &&
    (url.hostname === 'huggingface.co' || url.hostname.endsWith('.huggingface.co') || url.hostname === 'hf.co' || url.hostname.endsWith('.hf.co'))
}
async function officialFetch(url, headers = {}) {
  for (let count = 0; count < 8; count++) {
    if (!authorizedHfUrl(url)) throw new Error('Unauthorized Hugging Face redirect')
    const response = await fetch(url, { redirect: 'manual', headers, signal: AbortSignal.timeout(2 * 60 * 60 * 1000) })
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      await response.body?.cancel()
      if (!location) throw new Error('Missing download redirect')
      url = new URL(location, url).href
    } else return response
  }
  throw new Error('Too many Hugging Face redirects')
}
async function safeSize(path) {
  try {
    const stat = await lstat(path)
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('Unsafe staging file')
    return stat.size
  } catch (error) { if (error.code === 'ENOENT') return undefined; throw error }
}
export function validateRange(response, offset, total) {
  if (response.status === 206) {
    const range = response.headers.get('content-range')?.match(/^bytes (\d+)-(\d+)\/(\d+)$/)
    if (!range || Number(range[1]) !== offset || Number(range[3]) !== total || Number(range[2]) !== total - 1) throw new Error('Invalid resumed download range')
    return offset
  }
  if (response.status === 200) return 0 // Server ignored Range: restart the partial, never append twice.
  throw new Error(`Hugging Face download HTTP ${response.status}`)
}
export async function downloadVerified({ url, path, sha256, bytes }) {
  const existing = await safeSize(path)
  if (existing !== undefined) {
    if (existing !== bytes || await hash(path) !== sha256) throw new Error('Existing GGUF is invalid; preserved for inspection')
    console.log('Verified GGUF reused: ' + path)
    return path
  }
  const partial = path + '.partial'
  let offset = await safeSize(partial) || 0
  if (offset > bytes) throw new Error('Oversized partial GGUF; preserved for inspection')
  const space = await statfs(resolve(path, '..'))
  if (space.bavail * space.bsize < bytes - offset + 16 * 1024 ** 2) throw new Error('Insufficient space for GGUF download')
  if (offset < bytes) {
    const response = await officialFetch(url, offset ? { Range: `bytes=${offset}-` } : {})
    offset = validateRange(response, offset, bytes)
    if (!response.body) throw new Error('Missing download body')
    const file = await open(partial, offset ? 'r+' : 'w')
    let last = Date.now()
    try {
      for await (const chunk of response.body) {
        if (offset + chunk.length > bytes) throw new Error('GGUF exceeds official size')
        let written = 0
        while (written < chunk.length) written += (await file.write(chunk, written, chunk.length - written, offset + written)).bytesWritten
        offset += chunk.length
        if (Date.now() - last > 2000) { console.log(`GGUF ${offset}/${bytes} bytes (${(100 * offset / bytes).toFixed(1)}%)`); last = Date.now() }
      }
      await file.sync()
    } finally { await file.close() }
  }
  if (offset !== bytes || await hash(partial) !== sha256) throw new Error('GGUF SHA-256/size mismatch; partial preserved')
  const file = await open(partial, 'r'); const magic = Buffer.alloc(4)
  try { await file.read(magic, 0, 4, 0) } finally { await file.close() }
  if (magic.toString('ascii') !== 'GGUF') throw new Error('Not GGUF')
  await rename(partial, path)
  console.log('Official GGUF verified SHA-256: ' + sha256)
  return path
}

export async function prepareHuggingFace(options = {}) {
  const lock = resolve('xmcl-electron-app/build/ollama/hf-preparation.lock')
  await mkdir(resolve(lock, '..'), { recursive: true })
  // Fail closed if another preparation owns the cache. Never delete another lock.
  await mkdir(lock)
  try { return await prepareUnlocked(options) } finally { await rmdir(lock) }
}
async function prepareUnlocked({ downloadOnly = false } = {}) {
  const model = await compiled('xmcl-runtime/agent/modelBundle.ts')
  const target = resolve('xmcl-electron-app/build/ollama/ollama-model')
  try {
    await lstat(target)
    const verified = await model.validateFactoryModel(target)
    if (verified.index.model !== model.HF_FACTORY_MODEL) throw new Error('Existing seed uses another source; preserved')
    console.log('Verified imported staging reused: ' + target)
    return
  } catch (error) { if (error.code !== 'ENOENT') throw error }
  const cache = resolve('xmcl-electron-app/build/ollama/hf-qwen3-4b')
  await mkdir(cache, { recursive: true })
  if ((await lstat(cache)).isSymbolicLink()) throw new Error('Unsafe GGUF cache')
  const gguf = await downloadVerified({ url: model.HF_SOURCE, path: join(cache, 'Qwen3-4B-Q4_K_M.gguf'), sha256: model.HF_SHA256, bytes: model.HF_BYTES })
  if (downloadOnly) return
  const license = await fetchQwenLicense()
  await writeFile(join(cache, 'LICENSE'), license)
  await writeFile(join(cache, 'license-source.json'), JSON.stringify({ url: QWEN_LICENSE_URL, sha256: createHash('sha256').update(license).digest('hex') }, null, 2))
  const { ManagedOllama } = await compiled('xmcl-runtime/agent/managedOllama.ts')
  const { validateOllamaBundle } = await compiled('xmcl-runtime/agent/runtimeBundle.ts')
  const platform = { win32: 'win', linux: 'linux', darwin: 'mac' }[process.platform]
  const runtimePath = resolve(`xmcl-electron-app/build/ollama/${platform}-${process.arch}`)
  const runtime = await validateOllamaBundle(runtimePath, process.platform, process.arch)
  const work = target + '.hf-preparing' // Fixed isolated store permits recovery, never a personal profile.
  const store = join(work, 'models')
  await mkdir(store, { recursive: true })
  const space = await statfs(store)
  // The official CLI imports a blob into the isolated store; allow room for it.
  const storedBlob = join(store, 'blobs', 'sha256-' + model.HF_SHA256)
  const storedSize = await safeSize(storedBlob)
  if (storedSize === undefined && space.bavail * space.bsize < model.HF_BYTES + 32 * 1024 ** 2) throw new Error('Insufficient space for isolated Ollama import')
  const engine = new ManagedOllama({ bundle: runtimePath, data: join(work, 'engine'), readinessTimeoutMs: 120000 }, undefined, (event, details) => console.log('Ollama HF import:', event, JSON.stringify(details || {})))
  await engine.configure({ modelsDirectory: store })
  await writeFile(join(cache, 'Modelfile'), `FROM ./Qwen3-4B-Q4_K_M.gguf\nLICENSE """${license}"""\nPARAMETER num_ctx 4096\n`)
  try {
    const origin = await engine.ensure()
    // CLI uploads the local verified GGUF; it never pulls registry weights.
    await promisify(execFile)(runtime.executable, ['create', model.HF_FACTORY_MODEL, '-f', join(cache, 'Modelfile')], {
      cwd: cache, env: { ...process.env, OLLAMA_HOST: origin, OLLAMA_MODELS: store }, windowsHide: true, timeout: 30 * 60 * 1000, maxBuffer: 2 * 1024 * 1024,
    })
    const response = await fetch(origin + '/api/show', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: model.HF_FACTORY_MODEL }), redirect: 'error', signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error('Imported metadata unavailable')
    const show = await response.json()
    if (show.details?.family !== 'qwen3' || show.details?.quantization_level !== 'Q4_K_M' || !show.capabilities?.includes('completion')) throw new Error('Imported Qwen3 metadata incompatible')
    console.log(JSON.stringify({ model: model.HF_FACTORY_MODEL, details: show.details, capabilities: show.capabilities }))
    const manifest = await readFile(join(store, model.HF_FACTORY_MANIFEST))
    const licenseDescriptor = JSON.parse(manifest).layers.find(entry => entry.mediaType === 'application/vnd.ollama.image.license')
    if (!licenseDescriptor || !/^sha256:[a-f0-9]{64}$/.test(licenseDescriptor.digest)) throw new Error('Imported license missing')
    const importedLicense = await readFile(join(store, 'blobs', licenseDescriptor.digest.replace(':', '-')), 'utf8')
    if (importedLicense.trim() !== license.trim()) throw new Error('Imported license differs from manufacturer license')
    await writeFile(join(store, 'official-manifest.json'), manifest)
    await writeFile(join(store, 'LICENSE'), importedLicense)
    await writeFile(join(store, 'seed.json'), JSON.stringify({ schema: 1, model: model.HF_FACTORY_MODEL, source: model.HF_SOURCE, referenceSha256: createHash('sha256').update(manifest).digest('hex') }, null, 2))
  } finally { await engine.stop() }
  const checked = await model.validateFactoryModel(store)
  await rename(store, target)
  console.log(JSON.stringify({ staging: target, model: checked.index.model, bytes: checked.bytes, sourceSha256: model.HF_SHA256, gguf }))
}
