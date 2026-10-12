/** Keep the existing RAF loop but render expensive backgrounds at at most 60 Hz.
 * Accumulating elapsed time avoids falling to 48 Hz on a 144 Hz display. */
export function backgroundFrameTime(previous: number | undefined, now: number) {
  if (previous === undefined) return now
  const interval = 1000 / 60
  const elapsed = now - previous
  // RAF timestamps have floating-point rounding at an exact 60 Hz boundary.
  const tolerance = 0.01
  return elapsed + tolerance < interval ? undefined : previous + Math.max(1, Math.floor((elapsed + tolerance) / interval)) * interval
}
