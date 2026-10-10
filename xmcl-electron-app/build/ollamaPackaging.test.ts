import { expect, test } from 'vitest'
import { config } from './electron-builder.config'

test('packaging rejects unsupported architectures before advertising integrated AI', async () => {
  await expect(config.beforePack({ electronPlatformName: 'win32', arch: 0 } as any)).rejects.toThrow('architecture_unsupported')
})

test('packaging includes external runtime resources and excludes unsupported Windows ia32', () => {
  expect(config.extraResources).toContainEqual({ from: 'build/ollama/${os}-${arch}', to: 'ollama', filter: ['**/*'] })
  expect(config.extraResources).toContainEqual({ from: 'build/ollama/ollama-model', to: 'ollama-model', filter: ['**/*'] })
  expect(config.win.target[0]).toEqual({ target: 'zip', arch: ['x64'] })
  expect(config.mac.signIgnore).toContain('resources/ollama/.*')
})
