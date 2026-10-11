import { expect, test, vi } from 'vitest'
import { config } from './electron-builder.config'
import * as runtimeBundle from '../../xmcl-runtime/agent/runtimeBundle'

test('a verified runtime can be packaged without any model seed', async () => {
  const validate = vi.spyOn(runtimeBundle, 'validateOllamaBundle').mockResolvedValueOnce({} as any)
  try {
    await expect(config.beforePack({ electronPlatformName: 'win32', arch: 1 } as any)).resolves.toBeUndefined()
    expect(validate).toHaveBeenCalledWith(expect.stringMatching(/win-x64$/), 'win32', 'x64')
  } finally { validate.mockRestore() }
})

test('packaging rejects unsupported architectures before advertising integrated AI', async () => {
  await expect(config.beforePack({ electronPlatformName: 'win32', arch: 0 } as any)).rejects.toThrow('architecture_unsupported')
})

test('packaging includes external runtime resources and excludes unsupported Windows ia32', () => {
  expect(config.extraResources).toContainEqual({ from: 'build/ollama/${os}-${arch}', to: 'ollama', filter: ['**/*'] })
  expect(config.extraResources.some(resource => resource.to === 'ollama-model')).toBe(false)
  expect(config.win.target[0]).toEqual({ target: 'zip', arch: ['x64'] })
  expect(config.mac.signIgnore).toContain('resources/ollama/.*')
})
