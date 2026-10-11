import { createHash } from 'crypto'
import { constants } from 'fs'
import { lstat, open, realpath, readdir } from 'fs/promises'
import { isAbsolute, join, relative, resolve, sep } from 'path'
import type { ServerExportFile } from '@xmcl/runtime-api'
import { open as openZip, readAllEntries, readEntry } from '@xmcl/unzip'

export function safeServerArchivePath(path: string) {
  if (!path || path.includes('\\') || path.includes(':') || [...path].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127) || isAbsolute(path) || path.split('/').some(part => !part || part === '.' || part === '..' || /[<>"|?*]/.test(part) || /[. ]$/.test(part) || /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(part))) throw new Error('unsafePath')
  return path
}

export function isUnder(root: string, path: string) {
  const rel = relative(root, path)
  return rel === '' || !isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`)
}

/** Reject symlinks/junctions at every component, including the selected root. */
export async function requireSafeServerPath(root: string, path: string) {
  const absolute = resolve(root, ...safeServerArchivePath(path).split('/'))
  if (!isUnder(root, absolute)) throw new Error('unsafePath')
  let current = root
  for (const part of ['', ...path.split('/')]) {
    if (part) current = join(current, part)
    if ((await lstat(current)).isSymbolicLink()) throw new Error('symlink')
  }
  if (!isUnder(await realpath(root), await realpath(absolute))) throw new Error('unsafePath')
  return absolute
}

export function serverFilePrivacyReason(path: string, data?: Buffer) {
  if (/(?:^|\/)(?:\.env(?:\..*)?|.*(?:token|secret|credential|password|session).*|accounts?.*|usercache\.json|.*\.pem|.*\.key|logs|crash-reports|playerdata|stats|advancements|session\.lock)(?:\/|$)/i.test(path)) return 'privacy'
  if (!data) return undefined
  const text = data.toString('utf8')
  if (/(?:access[_-]?token|refresh[_-]?token|api[_-]?key|password|passwd|secret|authorization|webhook)["']?\s*[:=]\s*["']?[^\s"'#,;{}\r\n]+/i.test(text) || /-----BEGIN .*PRIVATE KEY-----|(?:Bearer\s+[A-Za-z0-9._-]{10,})|(?:sk-[A-Za-z0-9_-]{16,})/.test(text)) return 'secret'
  if (/[A-Za-z]:[\\/]|(?:^|["'=\s])\/(?:home|Users|mnt|media|Volumes)\//m.test(text)) return 'absolutePath'
  return undefined
}

export async function inspectServerArchive(data: Buffer, depth = 0): Promise<string | undefined> {
  if (depth > 2) return 'unsupportedFile'
  const zip = await openZip(data)
  try {
    const entries = await readAllEntries(zip)
    if (entries.length > 20000 || entries.reduce((sum, entry) => sum + entry.uncompressedSize, 0) > 512 * 1024 ** 2) return 'tooLarge'
    const names = new Set<string>()
    for (const entry of entries) {
      const name = entry.fileName.replace(/\/$/, '')
      try { safeServerArchivePath(name) } catch { return 'unsafePath' }
      if (((entry.externalFileAttributes >>> 16) & 0o170000) === 0o120000) return 'symlink'
      if (names.has(name.toLowerCase())) return 'unsafePath'
      names.add(name.toLowerCase())
      if (serverFilePrivacyReason(name)) return 'privacy'
      if (/\.(json|json5|toml|cfg|conf|properties|yml|yaml|js|zs|mcfunction)$/i.test(name)) {
        if (entry.uncompressedSize > 4 * 1024 ** 2) return 'tooLarge'
        const reason = serverFilePrivacyReason(name, await readEntry(zip, entry))
        if (reason) return reason
      }
      if (/\.(jar|zip)$/i.test(name)) {
        if (entry.uncompressedSize > 256 * 1024 ** 2) return 'tooLarge'
        const reason = await inspectServerArchive(await readEntry(zip, entry), depth + 1)
        if (reason) return reason
      }
    }
    return undefined
  } finally { zip.close() }
}

export async function readSafeServerFile(root: string, path: string, limit: number, signal?: AbortSignal) {
  signal?.throwIfAborted()
  const absolute = await requireSafeServerPath(root, path)
  const before = await lstat(absolute)
  if (!before.isFile() || before.size > limit) throw new Error('tooLarge')
  const handle = await open(absolute, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0))
  try {
    const opened = await handle.stat()
    if (!opened.isFile() || opened.ino !== before.ino || opened.dev !== before.dev || opened.size > limit) throw new Error('changedFiles')
    const data = await handle.readFile({ signal })
    await requireSafeServerPath(root, path)
    const after = await handle.stat()
    if (after.size !== before.size || after.mtimeMs !== before.mtimeMs || data.length > limit) throw new Error('changedFiles')
    return data
  } finally { await handle.close() }
}

export async function scanServerTree(root: string, path: string, archiveRoot: string, files: ServerExportFile[], signal?: AbortSignal) {
  safeServerArchivePath(path)
  safeServerArchivePath(archiveRoot)
  signal?.throwIfAborted()
  if (files.length >= 20000) throw new Error('tooManyFiles')
  const absolute = join(root, ...path.split('/'))
  let stat
  try { stat = await lstat(absolute) } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return; throw new Error('readError') }
  const blocked = (excluded: string) => files.push({ path, archivePath: archiveRoot, size: stat.size, sha256: '', selected: false, excluded })
  try { await requireSafeServerPath(root, path) } catch { blocked('symlink'); return }
  if (serverFilePrivacyReason(path)) { blocked('privacy'); return }
  if (stat.isDirectory()) {
    for (const entry of (await readdir(absolute)).sort()) await scanServerTree(root, `${path}/${entry}`, `${archiveRoot}/${entry}`, files, signal)
  } else if (stat.isFile()) {
    // Region files/mod JARs are binary; scripts/config must be inspectable text.
    const binary = /^mods\/.*\.jar(?:\.disabled)?$/i.test(path) || /^(?:saves\/.*|datapacks\/.*)\.(?:zip|mca|dat|dat_old|nbt)$/i.test(path)
    const allowedText = /\.(json|json5|toml|cfg|conf|properties|yml|yaml|txt|md|js|zs|snbt|mcfunction|mcmeta|csv)$/i.test(path) || /(?:^|\/)(?:LICENSE|COPYING|NOTICE)(?:\.[^/]*)?$/i.test(path)
    if (!binary && !allowedText) { blocked('unsupportedFile'); return }
    try {
      const data = await readSafeServerFile(root, path, binary ? 256 * 1024 ** 2 : 4 * 1024 ** 2, signal)
      const reason = /\.(jar(?:\.disabled)?|zip)$/i.test(path) ? await inspectServerArchive(data) : binary ? undefined : data.includes(0) ? 'unsupportedFile' : serverFilePrivacyReason(path, data)
      files.push({ path, archivePath: archiveRoot, size: data.length, sha256: createHash('sha256').update(data).digest('hex'), selected: !reason, excluded: reason })
    } catch (e) { signal?.throwIfAborted(); blocked((e as Error).message === 'tooLarge' ? 'tooLarge' : 'readError') }
  } else blocked('unsupportedFile')
}
