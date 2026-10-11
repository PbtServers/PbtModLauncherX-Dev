import { afterEach, describe, expect, it, vi } from 'vitest'
import { setupRequest } from './setupRequest'

describe('setup IPC deadlines', () => {
  afterEach(() => vi.useRealTimers())
  it('returns successful results and propagates IPC/network errors', async () => {
    await expect(setupRequest(async () => 'ready')).resolves.toBe('ready')
    await expect(setupRequest(async () => { throw new Error('IPC failed') })).rejects.toThrow('IPC failed')
  })
  it('releases a slow or stalled request and permits retry', async () => {
    vi.useFakeTimers()
    const result = setupRequest(() => new Promise(() => {}), 100)
    const assertion = expect(result).rejects.toThrow('timed out')
    await vi.advanceTimersByTimeAsync(100)
    await assertion
    await expect(setupRequest(async () => 'recovered')).resolves.toBe('recovered')
    expect(vi.getTimerCount()).toBe(0)
  })
})
