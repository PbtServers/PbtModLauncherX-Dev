import { randomUUID } from 'node:crypto'
import { link, lstat, rename, unlink } from 'node:fs/promises'
import { bundlePath, type OllamaBundle } from '../../xmcl-runtime/agent/runtimeBundle'

/** Run only after validateOllamaBundle has verified every path and digest.
 * Library aliases keep their exact names, bytes and modes as regular files.
 * Tar/cpio can store repeated inodes once; no symbolic links are introduced. */
export async function deduplicateRuntime(root: string, files: OllamaBundle['files']) {
  const canonical = new Map<string, string>()
  let aliases = 0
  let savedBytes = 0
  for (const file of files) {
    if (!/\.so(?:\.\d+)*$/.test(file.path)) continue
    const path = bundlePath(root, file.path)
    const info = await lstat(path)
    if (!info.isFile() || info.isSymbolicLink()) throw new Error('Runtime deduplication requires verified regular files')
    const key = `${file.sha256}:${info.size}:${info.mode}`
    const original = canonical.get(key)
    if (!original) { canonical.set(key, path); continue }
    const source = await lstat(original)
    if (source.ino === info.ino && source.dev === info.dev) continue
    const temporary = `${path}.${randomUUID()}.hardlink`
    try {
      await link(original, temporary)
      await rename(temporary, path)
    } finally { await unlink(temporary).catch(() => {}) }
    aliases++
    savedBytes += info.size
  }
  return { aliases, savedBytes }
}
