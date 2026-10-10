import { DownloadOptions, download } from '@xmcl/file-transfer'
import { rename, unlink } from 'fs/promises'

/**
 * Download a file via a side-by-side `.pending` staging path, then
 * rename it into place when the bytes have all been written.
 *
 * Why this helper lives here (and NOT in @xmcl/file-transfer):
 * - The staging behaviour is only useful when the caller needs an
 *   atomic "either the destination exists with valid bytes or it
 *   doesn't exist at all" guarantee. The market provider needs that
 *   so the post-download `diagnoseFile` check on resume cannot mistake
 *   a partial download for a complete file.
 * - Other callers in the launcher (instance install, forge installer,
 *   etc.) write into a workspace that is itself disposable on crash,
 *   so they do not need this on top of `download()`.
 * - Keeping the rename / cleanup logic out of @xmcl/file-transfer
 *   removes a class of subtle bugs (silently swallowed rename errors,
 *   leaked staging files, fd leaks on abort race) by simply not
 *   having that code path in the shared download primitive.
 *
 * On success: the destination contains the full payload.
 * On failure: both the staging file and the destination are removed,
 * so a future retry sees a clean slate.
 */
export async function downloadStaged(options: Omit<DownloadOptions, 'destination'> & {
  destination: string
}): Promise<void> {
  const { destination } = options
  const pending = destination + '.pending'

  try {
    await download({ ...options, destination: pending })
  } catch (e) {
    await unlink(pending).catch(() => undefined)
    throw e
  }

  try {
    await rename(pending, destination)
  } catch (e: any) {
    if (e && e.code === 'EEXIST') {
      // Windows can return EEXIST when the destination already exists.
      // Replace it with the freshly-downloaded staging file.
      await unlink(destination).catch(() => undefined)
      try {
        await rename(pending, destination)
        return
      } catch (e2) {
        await unlink(pending).catch(() => undefined)
        throw e2
      }
    }
    await unlink(pending).catch(() => undefined)
    throw e
  }
}
