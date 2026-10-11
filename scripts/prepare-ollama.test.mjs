import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { prepare, runtimeAsset } from './prepare-ollama.mjs'

describe('official runtime preparation', () => {
  test('selects exact official assets and rejects ia32', () => {
    expect(runtimeAsset('v1.2.3', 'win32', 'x64')).toBe('ollama-windows-amd64.zip')
    expect(runtimeAsset('v1.2.3', 'linux', 'arm64')).toBe('ollama-linux-arm64.tar.zst')
    expect(() => runtimeAsset('latest', 'win32', 'x64')).toThrow()
    expect(() => runtimeAsset('v1.2.3', 'win32', 'ia32')).toThrow()
    expect(runtimeAsset('v1.2.3', 'darwin', 'arm64')).toBe('ollama-darwin.tgz')
  })
  test('a manually downloaded archive still requires an independent official digest', async () => {
    const root = await mkdtemp(join(tmpdir(), 'pbt-prepare-'))
    try {
      const archive = join(root, 'official.zip'); await writeFile(archive, 'bad')
      const metadata = join(root, 'metadata.json')
      const release = { tag_name: 'v1.2.3', assets: [{ name: 'ollama-windows-amd64.zip', size: 3, browser_download_url: 'https://github.com/ollama/ollama/releases/download/v1.2.3/ollama-windows-amd64.zip' }] }
      await writeFile(metadata, JSON.stringify(release))
      const args = { version: 'v1.2.3', platform: 'win32', arch: 'x64', archive, metadata, output: join(root, 'bundle') }
      await expect(prepare(args)).rejects.toThrow('trusted SHA-256')
      release.assets[0].digest = 'sha256:' + 'a'.repeat(64); await writeFile(metadata, JSON.stringify(release))
      await expect(prepare(args)).rejects.toThrow('size/hash')
    } finally { await rm(root, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }) }
  })
})
