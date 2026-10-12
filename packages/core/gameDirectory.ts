/** Normalize only the singleton game directory option after inheritance.
 * Keep every unrelated loader option and pass paths as single argv entries. */
export function normalizeGameDirectory(args: string[], directory: string): string[] {
  const result: string[] = []
  let found = false
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--gameDir' || arg.startsWith('--gameDir=')) {
      if (!found) result.push('--gameDir', directory)
      found = true
      if (arg === '--gameDir' && i + 1 < args.length && !args[i + 1].startsWith('--')) i++
    } else result.push(arg)
  }
  return result
}
