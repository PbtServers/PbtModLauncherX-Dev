import { randomUUID } from 'crypto'
import { readFile, unlink, writeFile } from 'fs/promises'
import { dirname, join } from 'path'

export function quoteJavaArgument(value: string) {
  return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    .replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\f/g, '\\f') + '"'
}

export function javaMajorFromRelease(release: string) {
  const version = release.match(/^JAVA_VERSION="([^"]+)"/m)?.[1]
  if (!version) return undefined
  const parts = version.split('.')
  return Number.parseInt(parts[0] === '1' ? parts[1] : parts[0], 10) || undefined
}

/** Shorten Windows commands using CLASSPATH or a classpath-only file; tokens stay in argv. */
export async function prepareLongClasspath(args: string[], javaPath: string, gamePath: string, platform = process.platform, environment = process.env) {
  const unchanged: { args: string[]; cleanup: () => Promise<void>; classpath?: string } = { args, cleanup: async () => {} }
  const length = args.reduce((sum, arg) => sum + arg.length + 3, 0)
  if (platform !== 'win32' || length < 30_000) return unchanged
  const javaIndex = args.indexOf(javaPath)
  const index = args.findIndex((arg, index) => index > javaIndex && ['-cp', '-classpath', '--class-path'].includes(arg))
  if (javaIndex < 0 || index < 0 || !args[index + 1] || args.slice(javaIndex, index).includes('--disable-@files')) return unchanged
  const classpath = args[index + 1]
  // Windows passes environment variables as Unicode, while Java argument files
  // use the native codepage. CLASSPATH preserves the original JVM property and
  // classloader ordering on Java 8 too; keep below the per-variable Windows limit.
  if (classpath.length < 30_000 && !/(?:^|\s)(?:-cp|-classpath|--class-path)(?:\s|=)/.test(environment.JDK_JAVA_OPTIONS ?? '')) {
    return { args: [...args.slice(0, index), ...args.slice(index + 2)], classpath, cleanup: async () => {} }
  }
  // Argument files were introduced in Java 9. A Minecraft version alone does
  // not identify the user's selected runtime, especially with older loaders.
  let release: string
  try { release = await readFile(join(dirname(dirname(javaPath)), 'release'), 'utf8') } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return unchanged
    throw error
  }
  const major = javaMajorFromRelease(release)
  if (!major || major < 9) return unchanged
  // Do not silently corrupt paths that the selected native codepage cannot
  // represent. Very large non-ASCII classpaths retain the existing launch path.
  if (/[^\x20-\x7e]/.test(classpath)) return unchanged
  const file = join(gamePath, `.xmcl-classpath-${randomUUID()}.args`)
  await writeFile(file, `${quoteJavaArgument(args[index])}\n${quoteJavaArgument(args[index + 1])}\n`, { flag: 'wx', mode: 0o600 })
  let removed = false
  const cleanup = async () => {
    if (removed) return
    await unlink(file).catch(error => {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    })
    removed = true
  }
  return { args: [...args.slice(0, index), '@' + file, ...args.slice(index + 2)], cleanup }
}
