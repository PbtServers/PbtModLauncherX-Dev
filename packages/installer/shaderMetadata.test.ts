import { readFabricMod } from '../mod-parser/fabric'
import { ZipFile } from 'yazl'
import { createWriteStream } from 'node:fs'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { it, expect } from 'vitest'
import type { ModFile } from '../../xmcl-keystone-ui/src/util/mod'
import { detectShaderProvider } from '../../xmcl-keystone-ui/src/composables/shaderSupport'
const runtime = (extra: object) => ({ minecraft: '1.21.1', ...extra }) as any
const mod = (extra: object) => ({ enabled: true, dependencies: {}, ...extra }) as ModFile
  it('reads manually placed and replaced JAR metadata with the real local parser', async ({ temp }) => {
    const directory = await mkdtemp(join(temp, 'phase6-shader-'))
    const modsPath = join(directory, 'mods')
    await mkdir(modsPath)
    const path = join(modsPath, 'arbitrary-name.jar')
    async function writeJar(version: string) {
      const zip = new ZipFile()
      zip.addBuffer(Buffer.from(JSON.stringify({ schemaVersion: 1, id: 'iris', version, depends: { minecraft: '1.21.1' } })), 'fabric.mod.json')
      zip.end()
      await pipeline(zip.outputStream, createWriteStream(path))
    }
    try {
      await writeJar('1.8')
      const first = mod({ path, fabric: await readFabricMod(path) })
      expect(detectShaderProvider(runtime({ fabricLoader: '0.16.10' }), [first], directory)?.version).toBe('1.8')
      await writeJar('1.9')
      const replaced = mod({ path, fabric: await readFabricMod(path) })
      expect(detectShaderProvider(runtime({ fabricLoader: '0.16.10' }), [replaced], directory)?.version).toBe('1.9')
    } finally { await rm(directory, { recursive: true, force: true }) }
  })
