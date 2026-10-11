import { describe, expect, test, vi } from 'vitest'
import { createQwenInstaller, QWEN_BYTES, QWEN_MODEL } from './qwenInstaller'

function fixture(installed = false) {
  let present = installed
  let time = 0
  const service = {
    prepareOllamaDownload: vi.fn(async () => ({ model: QWEN_MODEL, estimatedBytes: QWEN_BYTES, confirmationId: 'consented' })),
    startOllamaDownload: vi.fn(async () => {}),
    getOllamaDownloadStatus: vi.fn(async () => ({ state: 'idle' as const } as any)),
    cancelOllamaDownload: vi.fn(async () => {}),
  }
  const hooks = { activate: vi.fn(async () => {}), refresh: vi.fn(async () => { present = true }), installed: () => present }
  return { service, hooks, installer: createQwenInstaller(service, hooks, () => time), advance: (value: number) => { time += value } }
}

describe('Qwen3 installation lifecycle', () => {
  test('missing model is offered without downloading; consent is required', async () => {
    const { installer, service } = fixture()
    expect(installer.phase.value).toBe('missing')
    expect(installer.percent.value).toBeUndefined()
    await installer.start(false)
    expect(service.prepareOllamaDownload).not.toHaveBeenCalled()
    expect(service.startOllamaDownload).not.toHaveBeenCalled()
  })
  test('preparation is asynchronous and can be cancelled before a pull starts', async () => {
    const { installer, service, hooks } = fixture()
    let ready!: () => void
    hooks.activate.mockImplementationOnce(() => new Promise<void>(resolve => { ready = resolve }))
    const started = installer.start(true)
    expect(installer.phase.value).toBe('preparing')
    expect(installer.percent.value).toBeUndefined()
    await installer.cancel()
    ready()
    await started
    expect(installer.phase.value).toBe('cancelled')
    expect(service.startOllamaDownload).not.toHaveBeenCalled()
  })
  test('download percentage and speed come only from observed bytes and time', async () => {
    const { installer, service, advance } = fixture()
    await installer.start(true)
    expect(installer.phase.value).toBe('downloading')
    service.getOllamaDownloadStatus.mockResolvedValue({ state: 'running', model: QWEN_MODEL, completed: 100, total: 1000 })
    await installer.poll()
    expect(installer.percent.value).toBe(10)
    expect(installer.speed.value).toBeUndefined()
    advance(2000)
    service.getOllamaDownloadStatus.mockResolvedValue({ state: 'running', model: QWEN_MODEL, completed: 300, total: 1000 })
    await installer.poll()
    expect(installer.percent.value).toBe(30)
    expect(installer.speed.value).toBe(100)
    service.getOllamaDownloadStatus.mockResolvedValue({ state: 'running', model: QWEN_MODEL })
    await installer.poll()
    expect(installer.percent.value).toBeUndefined()
    expect(installer.speed.value).toBeUndefined()
  })
  test('completion refreshes the provider and activates chat without restarting', async () => {
    const { installer, service, hooks } = fixture()
    await installer.start(true)
    let refreshed!: () => void
    hooks.refresh.mockImplementationOnce(() => new Promise<void>(resolve => { refreshed = resolve }))
    service.getOllamaDownloadStatus.mockResolvedValue({ state: 'completed', model: QWEN_MODEL })
    const completion = installer.poll()
    await vi.waitFor(() => expect(installer.phase.value).toBe('completed'))
    refreshed()
    await completion
    expect(hooks.refresh).toHaveBeenCalledOnce()
    // If provider inspection hasn't confirmed the model, the completed state stays visible.
    expect(installer.phase.value).toBe('completed')
    await installer.reconnect()
    expect(installer.phase.value).toBe('installed')
  })
  test('successful completion automatically makes the model available', async () => {
    const { installer, service } = fixture()
    await installer.start(true)
    service.getOllamaDownloadStatus.mockResolvedValue({ state: 'completed', model: QWEN_MODEL })
    await installer.poll()
    expect(installer.phase.value).toBe('installed')
  })
  test('cancelled download can be retried only with renewed consent', async () => {
    const { installer, service } = fixture()
    await installer.start(true)
    await installer.cancel()
    expect(installer.phase.value).toBe('cancelled')
    expect(service.cancelOllamaDownload).toHaveBeenCalledOnce()
    await installer.start(false)
    expect(service.startOllamaDownload).toHaveBeenCalledTimes(1)
    await installer.start(true)
    expect(service.startOllamaDownload).toHaveBeenCalledTimes(2)
  })
  test('errors are translated and retry clears the error', async () => {
    const { installer, service } = fixture()
    service.prepareOllamaDownload.mockRejectedValueOnce(new Error('ollama_storage_insufficient'))
    await installer.start(true)
    expect(installer.phase.value).toBe('error')
    expect(installer.errorKey.value).toBe('qwenInstall.storageError')
    await installer.start(true)
    expect(installer.errorKey.value).toBe('')
    service.getOllamaDownloadStatus.mockResolvedValue({ state: 'failed', model: QWEN_MODEL, error: 'downloadFailed' })
    await installer.poll()
    expect(installer.phase.value).toBe('error')
    expect(installer.errorKey.value).toBe('pbtadmin.downloadFailed')
  })
  test('installed model opens chat without preparation or download', async () => {
    const { installer, service, hooks } = fixture(true)
    expect(installer.phase.value).toBe('installed')
    await installer.start(true)
    expect(hooks.activate).not.toHaveBeenCalled()
    expect(service.prepareOllamaDownload).not.toHaveBeenCalled()
  })
})
