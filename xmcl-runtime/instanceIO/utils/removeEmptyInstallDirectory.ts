import { readdir, rmdir } from 'fs-extra'
import { setTimeout } from 'timers/promises'

interface Operations {
  platform?: NodeJS.Platform
  remove?: (path: string) => Promise<unknown>
  list?: (path: string) => Promise<string[]>
  wait?: (ms: number) => Promise<unknown>
}

/** Remove only an empty staging directory, never another operation's files. */
export async function removeEmptyInstallDirectory(path: string, {
  platform = process.platform, remove = rmdir, list = readdir, wait = setTimeout,
}: Operations = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      await remove(path)
      return
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code === 'ENOENT') return
      if (!['ENOTEMPTY', 'EEXIST', 'EBUSY', 'EPERM'].includes(code ?? '')) throw error
      // Windows directory entries may outlive the just-completed deletion for
      // a short time. A bounded retry is part of this cleanup, not a new poller.
      if (platform === 'win32' && attempt < 3) {
        await wait(20 * 2 ** attempt)
        continue
      }
      if (code === 'ENOTEMPTY' || code === 'EEXIST') {
        const entries = await list(path).catch(listError => {
          if ((listError as NodeJS.ErrnoException).code === 'ENOENT') return undefined
          throw listError
        })
        if (entries === undefined || entries.length > 0) return
      }
      // An empty directory that still cannot be removed is a genuine failure.
      throw error
    }
  }
}
