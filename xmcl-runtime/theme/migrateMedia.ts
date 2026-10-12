import { constants } from 'fs'
import { copyFile, lstat, mkdir } from 'fs/promises'
import { dirname } from 'path'

/** Recover legacy media even when the new folder already contains other assets.
 * Keep originals and never replace a file already present at the destination. */
export async function copyLegacyThemeMedia(source: string, destination: string) {
  try {
    const info = await lstat(source)
    if (!info.isFile() || info.isSymbolicLink()) return false
    await mkdir(dirname(destination), { recursive: true })
    await copyFile(source, destination, constants.COPYFILE_EXCL)
    return true
  } catch (error) {
    if (['ENOENT', 'EEXIST'].includes((error as NodeJS.ErrnoException).code || '')) return false
    throw error
  }
}
