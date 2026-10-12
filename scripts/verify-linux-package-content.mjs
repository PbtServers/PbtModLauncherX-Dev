import { execFile } from 'node:child_process'
import { mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import * as packedResourceModule from '../xmcl-electron-app/build/verifyPackedResources.ts'
import * as runtimeBundleModule from '../xmcl-runtime/agent/runtimeBundle.ts'
import { packageFileName, requiredFormats } from './verify-release-packages.mjs'
import { readFile } from 'node:fs/promises'

// tsx exposes package-local CommonJS TypeScript through the default namespace
// on Node 24; use named exports directly when loaded as an ES module instead.
const { verifyPackedResources } = packedResourceModule.default ?? packedResourceModule
const { validateExecutableArchitecture, validateOllamaBundle } = runtimeBundleModule.default ?? runtimeBundleModule
if (process.argv[2] === '--check-imports') {
  if ([verifyPackedResources, validateExecutableArchitecture, validateOllamaBundle].some(value => typeof value !== 'function')) throw new Error('Package validator module exports are unavailable')
  console.log(`Package validator TypeScript imports verified on Node ${process.versions.node}`)
  process.exit(0)
}

const run = promisify(execFile)
const output = resolve(process.argv[2])
const arch = process.argv[3]
if (process.platform !== 'linux' || process.arch !== arch) throw new Error('Package validation requires the matching native Linux runner')
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const results = []
for (const format of requiredFormats.Linux) {
  const name = packageFileName('Linux', arch, version, format)
  const file = join(output, name)
  const temporary = await mkdtemp(join(tmpdir(), 'pbt-linux-package-'))
  try {
    const options = { cwd: temporary, maxBuffer: 32 * 1024 ** 2, timeout: 15 * 60 * 1000 }
    if (format === 'AppImage') {
      await run(file, ['--appimage-extract'], options)
    } else {
      await run('bsdtar', ['-xf', file, '-C', temporary], options)
      if (format === 'deb') {
        const data = (await readdir(temporary)).filter(name => /^data\.tar(?:\.[a-z0-9]+)?$/.test(name))
        if (data.length !== 1) throw new Error('Missing or ambiguous Debian data archive')
        await run('bsdtar', ['-xf', join(temporary, data[0]), '-C', temporary], options)
      }
    }
    // Follow only actual directories, never external symlink targets.
    const candidates = []
    async function find(directory) {
      for (const item of await readdir(directory, { withFileTypes: true })) {
        if (!item.isDirectory()) continue
        const path = join(directory, item.name)
        if (item.name === 'resources') {
          try { await stat(join(path, 'ollama/bundle.json')); candidates.push(path) } catch (error) { if (error.code !== 'ENOENT') throw error }
        } else await find(path)
      }
    }
    await find(temporary)
    if (candidates.length !== 1) throw new Error(`Missing or ambiguous packaged resources: ${name}`)
    const resources = candidates[0]
    await verifyPackedResources(resources, 'linux', arch, false)
    await validateExecutableArchitecture(join(dirname(resources), 'pbtmodlauncherx'), 'linux', arch)
    const { manifest, executable } = await validateOllamaBundle(join(resources, 'ollama'), 'linux', arch)
    const runtime = await run(executable, ['--version'], options)
    if (!/\b0\.34\.0\b/.test(runtime.stdout + runtime.stderr)) throw new Error(`Packaged Ollama did not execute correctly: ${name}`)
    const result = { name, arch, runtimeFiles: manifest.files.length, runtimeVersion: manifest.version, hashesVerified: true, knowledgeVerified: true, executableVerified: true }
    results.push(result)
    console.log(JSON.stringify(result))
  } finally {
    if (dirname(temporary) !== resolve(tmpdir()) || !basename(temporary).startsWith('pbt-linux-package-')) throw new Error('Unsafe package cleanup path')
    await rm(temporary, { recursive: true, force: true })
  }
}
await writeFile(join(output, `content-Linux-${arch}.json`), JSON.stringify({ version, results }, null, 2) + '\n')
