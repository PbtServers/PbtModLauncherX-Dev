import locales from '../../../assets/locales.json'

export const DEFAULT_LAUNCHER_LOCALE = 'es-ES'

/** Saved, supported preferences win. Never infer the initial language from the OS. */
export function resolveLauncherLocale(preferred: unknown): string {
  return typeof preferred === 'string' && Object.hasOwn(locales, preferred)
    ? preferred
    : DEFAULT_LAUNCHER_LOCALE
}
