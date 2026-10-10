// Native inference against packaged resources. No downloads, personal profiles,
// fabricated responses, or executable commands supplied by a model.
import { createRequire } from 'node:module'
import { resolve, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
const require = createRequire(new URL('../xmcl-electron-app/package.json', import.meta.url))
const { build } = require('esbuild')
async function moduleFrom(entry) {
  const result = await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', write: false })
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'))
}
const { ManagedOllama } = await moduleFrom('xmcl-runtime/agent/managedOllama.ts')
const { validateFactoryModel } = await moduleFrom('xmcl-runtime/agent/modelBundle.ts')
const { buildAgentSystemPrompt } = await moduleFrom('xmcl-keystone-ui/src/composables/agent/prompt.ts')
const { handleOllamaChat } = await moduleFrom('xmcl-runtime/agent/ollamaChat.ts')
const packaged = resolve(process.argv[2] || 'xmcl-electron-app/build/output/win-unpacked')
const FACTORY_MODEL = (await validateFactoryModel(join(packaged, 'resources', 'ollama-model'))).index.model
const data = resolve('temp', 'phase156-factory-chat-' + randomUUID())
const question = '¿Quién eres, quién es tu creadora y qué sabes de PbtServers?'
const evidence = { packaged, data, model: FACTORY_MODEL, question }
const engine = new ManagedOllama({ bundle: join(packaged, 'resources', 'ollama'), seed: join(packaged, 'resources', 'ollama-model'), data })
try {
  const origin = await engine.ensure()
  const showResponse = await fetch(origin + '/api/show', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: FACTORY_MODEL }), signal: AbortSignal.timeout(10000), redirect: 'error' })
  if (!showResponse.ok) throw new Error('Model metadata request failed')
  const show = await showResponse.json()
  if (!show.capabilities?.includes('completion') || show.details?.quantization_level !== 'Q4_K_M') throw new Error('Factory model metadata incompatible')
  console.log(JSON.stringify({ packaged, data, origin, model: FACTORY_MODEL, details: show.details, capabilities: show.capabilities }))
  Object.assign(evidence, { origin, details: show.details, capabilities: show.capabilities })
  const system = buildAgentSystemPrompt({ role: 'launcher-main', locale: 'es-ES', readonly: true, tools: [], sessionContext: { scope: 'global' } })
  const context = { request: { body: Buffer.from(JSON.stringify({ messages: [{ role: 'system', content: system }, { role: 'user', content: question }] })) }, response: {} }
  await handleOllamaChat(context, { model: FACTORY_MODEL, localOrigin: origin, contextWindow: 4096, toolsSupported: show.capabilities.includes('tools') }, fetch)
  if (context.response.status !== 200) throw new Error('Native chat request failed')
  let buffer = ''; let answer = ''; let chunks = 0
  const decoder = new TextDecoder()
  for await (const chunk of context.response.body) {
    buffer += decoder.decode(chunk, { stream: true })
    const lines = buffer.split('\n'); buffer = lines.pop() || ''
    for (const line of lines) if (line.startsWith('data: ') && line !== 'data: [DONE]') {
      const text = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content
      if (text) { answer += text; chunks++ }
    }
  }
  if (!answer.trim()) throw new Error('No authentic model answer received')
  console.log(JSON.stringify({ streamingChunks: chunks, authenticAnswer: answer }))
  Object.assign(evidence, { streamingChunks: chunks, authenticAnswer: answer })
  console.log('Semantic identity and feminine creator wording require review of the authentic answer above.')
} catch (error) {
  console.error('Native validation error:', error.code || error.message)
  process.exitCode = 1
} finally {
  try { await engine.stop(); console.log('Managed cleanup confirmed'); evidence.cleanupConfirmed = true }
  catch (error) { console.error('Managed cleanup error:', error.message); evidence.cleanupConfirmed = false; process.exitCode = 1 }
  const evidencePath = data + '.result.json'
  await writeFile(evidencePath, JSON.stringify({ ...evidence, exitCode: process.exitCode || 0 }, null, 2), 'utf8')
  console.log('UTF-8 evidence: ' + evidencePath)
}
