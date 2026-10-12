import { cp, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { expect, test, vi } from 'vitest'
import * as bundle from '../../xmcl-runtime/agent/runtimeBundle'
import { verifyPackedResources } from './verifyPackedResources'

test('checks copied lore and knowledge, refuses weights and modified documents', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pbt-packed-resources-'))
  const validate = vi.spyOn(bundle, 'validateOllamaBundle').mockResolvedValue({ manifest: { version: 'v0.34.0' } } as never)
  try {
    await cp(resolve('xmcl-electron-app/main/agent-documents'), join(root, 'agent-documents'), { recursive: true })
    await cp(resolve('PbtModLauncherX-Data/PbtAdmin/knowledge'), join(root, 'pbtadmin-knowledge'), { recursive: true })
    await expect(verifyPackedResources(root, 'win32', 'x64')).resolves.toBeUndefined()
    await mkdir(join(root, 'ollama-model'))
    await expect(verifyPackedResources(root, 'win32', 'x64')).rejects.toThrow('installed on demand')
    await rm(join(root, 'ollama-model'), { recursive: true })
    await writeFile(join(root, 'pbtadmin-knowledge/sources.json'), '{}')
    await expect(verifyPackedResources(root, 'win32', 'x64')).rejects.toThrow('knowledge mismatch')
  } finally { validate.mockRestore(); await rm(root, { recursive: true, force: true }) }
})
