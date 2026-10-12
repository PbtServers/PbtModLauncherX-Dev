import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { validateOllamaBundle } from '../../xmcl-runtime/agent/runtimeBundle'
import { deduplicateRuntime } from './deduplicateRuntime'

/** Check the copied resources, rather than only their pre-build sources. */
export async function verifyPackedResources(resources: string, platform: string, arch: string, optimize = true) {
  const { manifest } = await validateOllamaBundle(join(resources, 'ollama'), platform, arch)
  if (manifest.version !== 'v0.34.0') throw new Error('Unexpected packaged Ollama version')
  for (const [source, target] of [
    [join(__dirname, '../main/agent-documents'), 'agent-documents'],
    [join(__dirname, '../../PbtModLauncherX-Data/PbtAdmin/knowledge'), 'pbtadmin-knowledge'],
  ]) {
    let count = 0
    for (const name of await readdir(source)) {
      if (!name.endsWith('.md') && name !== 'sources.json') continue
      const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
      if (hash(await readFile(join(source, name))) !== hash(await readFile(join(resources, target, name)))) throw new Error(`Packaged knowledge mismatch: ${target}/${name}`)
      count++
    }
    if (!count) throw new Error(`Missing knowledge source: ${target}`)
  }
  async function rejectWeights(directory: string) {
    for (const item of await readdir(directory, { withFileTypes: true })) {
      if (/\.gguf$/i.test(item.name) || item.name === 'ollama-model' || item.name === 'hf-qwen3-4b') throw new Error('Model weights must be installed on demand')
      if (item.isDirectory()) await rejectWeights(join(directory, item.name))
    }
  }
  await rejectWeights(resources)
  if (platform === 'linux' && optimize) {
    const result = await deduplicateRuntime(join(resources, 'ollama'), manifest.files)
    await validateOllamaBundle(join(resources, 'ollama'), platform, arch)
    console.log(`Verified Linux runtime aliases: ${result.aliases} hardlinks; ${result.savedBytes} duplicate bytes retained once`)
  }
}
