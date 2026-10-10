import { resolveLauncherLocale } from '@xmcl/runtime-api'

/** Vuetify uses different tags for a few of the launcher's locales. */
export function resolveVuetifyLocale(preferred: unknown) {
  const locale = resolveLauncherLocale(preferred)
  const aliases: Record<string, string> = {
    'es-ES': 'es',
    'en-IN': 'en',
    'zh-CN': 'zhHans',
    'zh-TW': 'zhHant',
    'zh-HK': 'zhHant',
    'ja-JP': 'ja',
    'ar-EG': 'ar',
  }
  return aliases[locale] || locale
}
