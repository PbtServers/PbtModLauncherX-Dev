import { existsSync, mkdirSync, accessSync, constants } from 'fs'
import { dirname, join, resolve } from 'path'

/** Resolve against the real executable/AppImage, never the extraction directory. */
export function portableDataRoot(executable: string, env: NodeJS.ProcessEnv, marked: (path: string) => boolean = existsSync) {
  const base = resolve(env.PORTABLE_EXECUTABLE_DIR || dirname(env.APPIMAGE || executable))
  const macBundle = executable.match(/^(.*\.app)[/\\]Contents[/\\]MacOS[/\\]/)?.[1]
  if (macBundle && marked(join(macBundle, 'Contents', 'pbt-portable.json'))) return { base: dirname(macBundle), data: env.PBT_PORTABLE_DATA ? resolve(dirname(macBundle), env.PBT_PORTABLE_DATA) : join(dirname(macBundle), 'data') }
  if (!marked(join(base, 'pbt-portable.json')) && !(env.APPIMAGE && marked(join(dirname(executable), 'pbt-portable.json')))) return undefined
  const data = env.PBT_PORTABLE_DATA ? resolve(base, env.PBT_PORTABLE_DATA) : join(base, 'data')
  return { base, data }
}

export function preparePortableData(executable: string, env: NodeJS.ProcessEnv) {
  const result = portableDataRoot(executable, env)
  if (result) {
    mkdirSync(result.data, { recursive: true })
    accessSync(result.data, constants.W_OK)
  }
  return result
}
