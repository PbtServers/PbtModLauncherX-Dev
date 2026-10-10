import { ensureDir } from 'fs-extra'
import { join } from 'node:path'

/** Persist only after both mandatory directories are usable. No Java/network dependency. */
export async function prepareInitialRoot(
  appDataPath: string,
  gamePath: string,
  writeRoot: (path: string, value: string) => Promise<void> = async (path, value) => {
    const { writeFile } = await import('atomically')
    await writeFile(path, value)
  },
) {
  await ensureDir(gamePath)
  await ensureDir(join(gamePath, 'temp'))
  await writeRoot(join(appDataPath, 'root'), gamePath)
}

/** Keep IPC retries safe without acknowledging an incomplete data root. */
export function createInitialSetup(prepare: (path: string) => Promise<void>) {
  let selected: string | undefined
  let pending: Promise<void> | undefined
  return (path: string): Promise<void> => {
    if (typeof path !== 'string' || !path.trim()) return Promise.reject(new Error('Invalid setup path'))
    if (pending) {
      return selected === path ? pending : Promise.reject(new Error('Setup already in progress'))
    }
    selected = path
    pending = Promise.resolve().then(() => prepare(path)).catch((error) => {
      pending = undefined
      selected = undefined
      throw error
    })
    return pending
  }
}
