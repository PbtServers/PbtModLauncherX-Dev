import { InstanceFile } from '@xmcl/instance'
import { Tracker, onProgress } from '@xmcl/installer'
import { Platform } from '@xmcl/runtime-api'
import { isSystemError } from '@xmcl/utils'
import { copyFile, ensureDir, stat, unlink } from 'fs-extra'
import { dirname } from 'path'
import { ENOENT_ERROR, isInSameDisk, linkWithTimeoutOrCopy } from '../../util/fs'
import { InstallInstanceTrackerEvents } from '@xmcl/runtime-api'

async function handleLink(
  job: { file: InstanceFile; src: string; destination: string },
  platform: Platform,
  finished: Set<string>,
  progress: { progress: number; total: number },
) {
  if (finished.has(job.file.path)) return
  const src = job.src
  const dest = job.destination

  const destStat = await stat(dest).catch(() => undefined)
  const srcStat = await stat(src)

  if (destStat) {
    if (destStat.ino === srcStat.ino) {
      // existed file, but same
      finished.add(job.file.path)
      progress.progress++
      return
    }

    // existed file, but different
    await unlink(dest)
  }

  await ensureDir(dirname(dest))

  if (isInSameDisk(src, dest, platform.os)) {
    await linkWithTimeoutOrCopy(src, dest)
  } else {
    await copyFile(src, dest)
  }

  progress.progress++
  finished.add(job.file.path)
}

/**
 * Link existed files into temp folder.
 *
 * All unhandled files are added to unhandled array.
 */
export async function linkInstanceFiles(
  files: Array<{ file: InstanceFile; src: string; destination: string }>,
  platform: Platform,
  finished: Set<string>,
  unhandled: Array<InstanceFile>,
  signal: AbortSignal,
  tracker?: Tracker<InstallInstanceTrackerEvents>,
): Promise<void> {
  const progress = onProgress(tracker, 'install-instance.link', { count: files.length })
  progress.total = files.length

  // second pass, link or copy all files
  const result = await Promise.allSettled(
    files.map(async (job) => {
      signal.throwIfAborted()
      return handleLink(job, platform, finished, progress).catch((e) => {
        if (isSystemError(e) && e.code === ENOENT_ERROR) {
          // The source file is missing (e.g., the cached resource was
          // evicted between resource discovery and linking). Route this
          // file to the `unhandled` list so the caller can fall back to
          // downloading or unzipping. Treat it as a non-error here so a
          // single missing source does not abort the whole install.
          unhandled.push(job.file)
          return
        }
        throw e
      })
    }),
  )

  const errors = result.filter((r) => r.status === 'rejected').map((r) => (r as any).reason)
  if (errors.length > 0) {
    throw new AggregateError(errors.flatMap((e) => (e instanceof AggregateError ? e.errors : e)))
  }
}
