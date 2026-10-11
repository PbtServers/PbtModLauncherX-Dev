// Exercises production local retrieval and the production Ollama chat bridge.
// Script inference is not a visual launcher test. Never downloads models.
import { createRequire } from 'node:module'
import { resolve, join } from 'node:path'
import { randomUUID, createHash } from 'node:crypto'
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { readValidationStream } from './ollama-validation-stream.mjs'

const require = createRequire(new URL('../xmcl-electron-app/package.json', import.meta.url))
const { build } = require('esbuild')
async function moduleFrom(entry) {
  const result = await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', write: false })
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'))
}
const { AgentDocumentStore } = await moduleFrom('xmcl-runtime/agent/documents.ts')
const { pbtAdminKnowledgeQuery, createPbtAdminKnowledgeEvidence } = await moduleFrom('xmcl-keystone-ui/src/composables/agent/knowledge.ts')
const retrievalOnly = process.argv.includes('--retrieval-only')
const sourceKnowledge = process.argv.includes('--source-knowledge')
const packagedArg = process.argv.find(argument => argument.startsWith('--packaged='))?.slice('--packaged='.length)
const packaged = resolve(packagedArg || 'xmcl-electron-app/build/output/win-unpacked')
const source = resolve('PbtModLauncherX-Data/PbtAdmin/knowledge')
const directory = retrievalOnly || sourceKnowledge ? source : join(packaged, 'resources', 'pbtadmin-knowledge')
const data = resolve('temp', 'phase157-lore-' + randomUUID())
const receipt = { mode: retrievalOnly ? 'production-retrieval-only' : 'native-script-inference', knowledgeLocation: retrievalOnly || sourceKnowledge ? 'source-not-packaged' : 'packaged', packaged, directory, data, results: [] }
let engine
try {
  if (!retrievalOnly && !sourceKnowledge) {
    // Refuse inference using a stale package and do not overwrite packaged files.
    for (const file of await readdir(source)) {
      if (!file.endsWith('.md') && file !== 'sources.json') continue
      const digest = content => createHash('sha256').update(content).digest('hex')
      if (digest(await readFile(join(source, file))) !== digest(await readFile(join(directory, file)))) {
        throw new Error('Stale packaged knowledge: rebuild Electron before validation (' + file + ')')
      }
    }
  }
  const store = new AgentDocumentStore(directory)
  receipt.documents = (await store.list()).length
  const questionArg = process.argv.find(argument => argument.startsWith('--question='))?.slice('--question='.length)
  const questions = questionArg ? [questionArg] : [
    '¿Quién es 0ftome y qué hace en PbtServers?',
    '¿Qué ocurrió el 14 de septiembre de 2020?',
    '¿Quién eres y quién es tu creadora?',
  ]
  let origin, model, show, handleOllamaChat, system
  if (!retrievalOnly) {
    const { ManagedOllama } = await moduleFrom('xmcl-runtime/agent/managedOllama.ts')
    const { validateFactoryModel } = await moduleFrom('xmcl-runtime/agent/modelBundle.ts')
    const { buildPbtAdminWorkingPrompt } = await moduleFrom('xmcl-keystone-ui/src/composables/agent/requestPolicy.ts')
    ;({ handleOllamaChat } = await moduleFrom('xmcl-runtime/agent/ollamaChat.ts'))
    model = (await validateFactoryModel(join(packaged, 'resources', 'ollama-model'))).index.model
    receipt.runtimeEvents = []
    engine = new ManagedOllama({ bundle: join(packaged, 'resources', 'ollama'), seed: join(packaged, 'resources', 'ollama-model'), data }, globalThis.fetch,
      (event, details) => { receipt.runtimeEvents.push({ event, details }); console.log(JSON.stringify({ runtimeEvent: event, details })) })
    origin = await engine.ensure()
    const response = await fetch(origin + '/api/show', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model }), signal: AbortSignal.timeout(10000), redirect: 'error' })
    if (!response.ok) throw new Error('Packaged model metadata request failed: HTTP ' + response.status)
    show = await response.json()
    if (!show.capabilities?.includes('completion')) throw new Error('Model does not support completion')
    Object.assign(receipt, { origin, model, details: show.details, capabilities: show.capabilities })
    receipt.contextWindow = Number(show.parameters?.match(/(?:^|\n)\s*num_ctx\s+(\d+)/)?.[1]) || 4096
    system = buildPbtAdminWorkingPrompt('es-ES', [])
    receipt.systemCharacters = system.length
  }
  for (const question of questions) {
    const query = pbtAdminKnowledgeQuery(question)
    const results = await store.search(query, 5)
    const evidence = createPbtAdminKnowledgeEvidence(results)
    if (!evidence && retrievalOnly) throw new Error('No local lore evidence for: ' + question)
    const result = { question, query, documentIds: results.map(result => result.id), evidence }
    if (!retrievalOnly) {
      const context = { request: { body: Buffer.from(JSON.stringify({ messages: [
        { role: 'system', content: system }, ...(evidence ? [{ role: 'user', content: evidence }] : []), { role: 'user', content: question },
      ] })) }, response: {} }
      await handleOllamaChat(context, { model, localOrigin: origin, contextWindow: receipt.contextWindow, toolsSupported: show.capabilities.includes('tools') }, fetch)
      if (context.response.status !== 200) throw new Error('Native lore chat failed')
      const { answer, chunks } = await readValidationStream(context.response.body)
      Object.assign(result, { authenticAnswer: answer, streamingChunks: chunks, semanticReview: 'required' })
    }
    receipt.results.push(result)
    console.log(JSON.stringify(result))
  }
} catch (error) {
  receipt.error = error.message
  process.exitCode = 1
  console.error(error.message)
} finally {
  if (engine) {
    try { await engine.stop(); receipt.cleanupConfirmed = true; console.log('Managed cleanup confirmed') }
    catch (error) { receipt.cleanupError = error.message; process.exitCode = 1 }
  }
  await mkdir(resolve('temp'), { recursive: true })
  const file = data + '.result.json'
  await writeFile(file, JSON.stringify({ ...receipt, exitCode: process.exitCode || 0 }, null, 2), 'utf8')
  console.log('UTF-8 evidence: ' + file)
}
