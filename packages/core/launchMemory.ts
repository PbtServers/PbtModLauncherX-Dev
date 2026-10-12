/** JVM heap sizes are positive integer MiB; an initial heap cannot exceed its maximum. */
export function normalizeLaunchMemory(minMemory?: number, maxMemory?: number) {
  const megabytes = (value?: number) => typeof value === 'number' && Number.isFinite(value) && value >= 1 ? Math.floor(value) : undefined
  const maximum = megabytes(maxMemory)
  const minimum = megabytes(minMemory)
  return {
    minMemory: minimum !== undefined && maximum !== undefined ? Math.min(minimum, maximum) : minimum,
    maxMemory: maximum,
  }
}
