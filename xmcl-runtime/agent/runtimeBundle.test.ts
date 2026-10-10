import { createHash } from 'crypto'
import { mkdtemp, writeFile, rm, realpath } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, expect, test } from 'vitest'
import { bundlePath, validateOllamaBundle } from './runtimeBundle'

const directories: string[] = []
afterEach(async () => { for (const path of directories.splice(0)) await rm(path, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }) })
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'pbt-bundle-')); directories.push(root)
  const executable = Buffer.alloc(512); executable.write('MZ'); executable.writeUInt32LE(128, 60); executable.write('PE\0\0', 128); executable.writeUInt16LE(0x8664, 132)
  const files = [{ path: 'ollama.exe', body: executable }, { path: 'LICENSE', body: Buffer.from('MIT License\nOllama') }]
  for (const file of files) await writeFile(join(root, file.path), file.body)
  const manifest = { version: 'v1.2.3', platform: 'win32', arch: 'x64', executable: 'ollama.exe', source: { url: 'https://github.com/ollama/ollama/releases/download/v1.2.3/ollama-windows-amd64.zip', sha256: 'a'.repeat(64), release: 'https://api.github.com/repos/ollama/ollama/releases/tags/v1.2.3' }, files: files.map(file => ({ path: file.path, sha256: createHash('sha256').update(file.body).digest('hex') })) }
  await writeFile(join(root, 'bundle.json'), JSON.stringify(manifest))
  return { root, manifest }
}
test('validates complete fixture bytes and executable architecture (not an official runtime)', async () => { const { root } = await fixture(); expect((await validateOllamaBundle(root, 'win32', 'x64')).executable).toBe(join(await realpath(root), 'ollama.exe')) })
test.each(['../secret', '/absolute', 'C:/outside', 'lib\\..\\secret', 'lib//file'])('rejects traversal %s', path => expect(() => bundlePath('root', path)).toThrow())
test('rejects changed bytes and unlisted native resources', async () => {
  const { root } = await fixture(); await writeFile(join(root, 'ollama.exe'), 'corrupt')
  await expect(validateOllamaBundle(root, 'win32', 'x64')).rejects.toThrow('hash_mismatch')
  const next = await fixture(); await writeFile(join(next.root, 'unverified.dll'), 'unknown')
  await expect(validateOllamaBundle(next.root, 'win32', 'x64')).rejects.toThrow('unlisted_file')
})
test('rejects ia32, mismatched target, untrusted source and absent binaries', async () => {
  const { root, manifest } = await fixture()
  await expect(validateOllamaBundle(root, 'win32', 'ia32')).rejects.toThrow('unsupported')
  await expect(validateOllamaBundle(root, 'linux', 'x64')).rejects.toThrow('mismatch')
  manifest.source.url = 'https://example.com/untrusted.exe'; await writeFile(join(root, 'bundle.json'), JSON.stringify(manifest))
  await expect(validateOllamaBundle(root, 'win32', 'x64')).rejects.toThrow('untrusted_source')
  await expect(validateOllamaBundle(join(root, 'absent'), 'win32', 'x64')).rejects.toThrow()
})
