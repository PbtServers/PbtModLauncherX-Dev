import { describe, expect, it, vi } from 'vitest'
import { removeEmptyInstallDirectory } from './removeEmptyInstallDirectory'

const failure = (code: string) => Object.assign(new Error(code), { code })

describe('empty install directory cleanup', () => {
  it('retries transient Windows ENOTEMPTY after a child directory was removed', async () => {
    const remove = vi.fn().mockRejectedValueOnce(failure('ENOTEMPTY')).mockResolvedValue(undefined)
    const wait = vi.fn().mockResolvedValue(undefined)
    await removeEmptyInstallDirectory('staging', { platform: 'win32', remove, wait })
    expect(remove).toHaveBeenCalledTimes(2)
    expect(wait).toHaveBeenCalledExactlyOnceWith(20)
  })
  it('preserves a staging directory with another installation and never recursively deletes it', async () => {
    const remove = vi.fn().mockRejectedValue(failure('ENOTEMPTY'))
    const list = vi.fn().mockResolvedValue(['another-operation.json'])
    await removeEmptyInstallDirectory('staging', { platform: 'win32', remove, list, wait: vi.fn().mockResolvedValue(undefined) })
    expect(remove).toHaveBeenCalledTimes(4)
    expect(list).toHaveBeenCalledExactlyOnceWith('staging')
  })
  it('does not silently report success when an empty directory remains inaccessible', async () => {
    const remove = vi.fn().mockRejectedValue(failure('ENOTEMPTY'))
    await expect(removeEmptyInstallDirectory('staging', { platform: 'win32', remove, list: async () => [], wait: async () => {} })).rejects.toThrow('ENOTEMPTY')
    expect(remove).toHaveBeenCalledTimes(4)
  })
  it('propagates permissions and unexpected filesystem errors', async () => {
    await expect(removeEmptyInstallDirectory('staging', { remove: async () => { throw failure('EACCES') } })).rejects.toThrow('EACCES')
  })
  it('tolerates an already removed directory without waiting', async () => {
    const wait = vi.fn()
    await removeEmptyInstallDirectory('staging', { remove: async () => { throw failure('ENOENT') }, wait })
    expect(wait).not.toHaveBeenCalled()
  })
})
