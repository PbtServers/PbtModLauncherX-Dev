export const parseCFG = (cfg: string) => {
  const lines = cfg.split(/\r?\n/).map((line) => line.trim())
  const result: Record<string, string> = {}
  for (const line of lines) {
    if (!line || line.startsWith('#') || line.startsWith('[')) continue
    const eq = line.indexOf('=')
    if (eq < 0) continue
    const key = line.substring(0, eq).trim()
    // Values may legitimately contain '=' (e.g. WrapperCommand with env vars),
    // so split on the first '=' only.
    result[key] = line.substring(eq + 1)
  }
  return result
}
