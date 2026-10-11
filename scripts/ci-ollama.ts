import { access, readFile, readdir, rm, statfs } from 'node:fs/promises'
import { constants } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import * as runtimeBundle from '../xmcl-runtime/agent/runtimeBundle'
import * as modelBundle from '../xmcl-runtime/agent/modelBundle'

const validateOllamaBundle = runtimeBundle.validateOllamaBundle ?? (runtimeBundle as any).default?.validateOllamaBundle
const validateFactoryModel = modelBundle.validateFactoryModel ?? (modelBundle as any).default?.validateFactoryModel
if (typeof validateOllamaBundle !== 'function') throw new Error('Ollama bundle validator unavailable')
if (typeof validateFactoryModel !== 'function') throw new Error('Factory model validator unavailable')

async function main() {
  const version = 'v0.34.0'
  const folder = { win32: 'win', linux: 'linux', darwin: 'mac' }[process.platform]
  if (!folder) throw new Error('Unsupported CI platform')
  const targetArch = process.env.PBT_PACKAGE_ARCH
  if (targetArch && !['x64', 'arm64'].includes(targetArch)) throw new Error('Invalid package architecture')
  const arches = process.platform === 'win32' ? ['x64'] : [...new Set([process.arch, targetArch || 'x64', ...(targetArch ? [] : ['arm64'])])]
  const root = resolve('xmcl-electron-app/build/ollama')
  const verifyOnly = process.argv.includes('--verify-only')

  function run(script: string, args: string[] = []) {
    const result = spawnSync(process.execPath, ['--import', 'tsx', script, ...args], { stdio: 'inherit', windowsHide: true })
    if (result.error || result.status !== 0) throw new Error(`${script} failed (${result.error?.message || result.status})`)
  }

  async function verifyRuntime(arch: string) {
    const path = resolve(root, `${folder}-${arch}`)
    const runtime = await validateOllamaBundle(path, process.platform, arch)
    if (runtime.manifest.version !== version) throw new Error('Unexpected Ollama version')
    const metadata = JSON.parse(await readFile(resolve(path, 'release-metadata.json'), 'utf8'))
    const asset = metadata.assets?.find((item: any) => item.browser_download_url === runtime.manifest.source.url)
    if (metadata.tag_name !== version || metadata.draft || metadata.prerelease || asset?.digest !== `sha256:${runtime.manifest.source.sha256}`) {
      throw new Error('Official runtime provenance mismatch')
    }
    if (!runtime.manifest.files.some((file: { path: string }) => /\.(dll|so(?:\.\d+)*|dylib)$/.test(file.path))) {
      throw new Error('Runtime dependency libraries missing')
    }
    if (process.platform !== 'win32') await access(runtime.executable, constants.X_OK)
    if (arch === process.arch) {
      const result = spawnSync(runtime.executable, ['--version'], { encoding: 'utf8', timeout: 30000, windowsHide: true })
      console.log(result.stdout, result.stderr)
      if (result.error || result.status !== 0) throw new Error('Native Ollama executable check failed')
    }
    console.log(`Verified ${path}: ${runtime.manifest.files.length} hashed files; ${arch === process.arch ? 'native execution checked' : 'header architecture checked, no native execution'}`)
    return runtime
  }

  if (!verifyOnly) {
    const space = await statfs('.')
    console.log(`Free runner space: ${(space.bavail * space.bsize / 1024 ** 3).toFixed(1)} GiB`)
    const requiredGiB = process.platform === 'linux' || process.platform === 'win32' ? 20 : 12
    if (space.bavail * space.bsize < requiredGiB * 1024 ** 3) throw new Error(`At least ${requiredGiB} GiB free space required for bundled AI packaging`)

    for (const arch of arches) {
      let valid = false
      try {
        await verifyRuntime(arch)
        valid = true
      } catch (error) {
        console.log(`No reusable verified ${folder}-${arch} runtime: ${String(error)}`)
      }
      if (valid) continue
      try {
        run('scripts/prepare-ollama.mjs', ['--version', version, '--platform', process.platform, '--arch', arch])
      } finally {
        // Retain the preparer's original output and cleanup semantics.
        for (const name of await readdir(root)) {
          if (name.startsWith(`${folder}-${arch}.preparing-`)) {
            await rm(resolve(root, name), { recursive: true, force: true })
          }
        }
      }
    }

    try {
      run('scripts/prepare-ollama-model.mjs')
    } catch (error) {
      console.error(error)
      console.log('Registry preparation failed; trying independently verified official Qwen GGUF')
      run('scripts/prepare-ollama-model.mjs', ['--source', 'huggingface'])
    }
  }

  for (const arch of arches) await verifyRuntime(arch)
  const model = await validateFactoryModel(resolve(root, 'ollama-model'))
  console.log(`Verified factory model ${model.index.model}: ${model.bytes} bytes, ${model.files.length} files`)
  if (!verifyOnly) await rm(resolve(root, 'hf-qwen3-4b'), { recursive: true, force: true })
}

main().catch(error => { console.error(error); process.exitCode = 1 })
