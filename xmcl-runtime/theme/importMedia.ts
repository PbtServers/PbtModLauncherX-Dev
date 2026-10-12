import { randomUUID } from 'crypto'
import { constants } from 'fs'
import { copyFile, mkdir } from 'fs/promises'
import { join } from 'path'

/** Separate imports must never overwrite an asset still used by another theme. */
export async function importMedia(file: string, folder: string, extension: string) {
  const name = `${randomUUID()}.${extension}`
  await mkdir(folder, { recursive: true })
  await copyFile(file, join(folder, name), constants.COPYFILE_EXCL)
  return name
}
