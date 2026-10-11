export const DEFAULT_LAUNCHER_LOCALE = 'es-ES'

/** Spanish at first launch; English for preferences outside the three reviewed languages. */
export function resolveLauncherLocale(preferred: unknown): string {
  if (typeof preferred !== 'string' || !preferred) return DEFAULT_LAUNCHER_LOCALE
  return ['es-ES', 'ca', 'en'].includes(preferred) ? preferred : 'en'
}
