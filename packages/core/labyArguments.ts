/** LabyMod's complete launch profile is inherited from vanilla. The resolver
 * concatenates both game argument arrays; keep the child's value for vanilla
 * singleton options while preserving all repeatable and loader-specific options. */
export function normalizeLabyModArguments(args: string[]): string[] {
  const singleton = new Set(['--username', '--version', '--gameDir', '--assetsDir', '--assetIndex', '--uuid', '--accessToken', '--clientId', '--xuid', '--userType', '--versionType', '--userProperties', '--width', '--height'])
  const last = new Map<string, number>()
  for (let i = 0; i < args.length; i++) {
    const option = args[i].split('=', 1)[0]
    if (singleton.has(option)) last.set(option, i)
  }
  const result: string[] = []
  for (let i = 0; i < args.length; i++) {
    const option = args[i].split('=', 1)[0]
    if (singleton.has(option) && last.get(option) !== i) {
      if (args[i] === option && i + 1 < args.length && !args[i + 1].startsWith('--')) i++
      continue
    }
    result.push(args[i])
  }
  return result
}
