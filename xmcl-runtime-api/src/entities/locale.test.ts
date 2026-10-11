import { describe, expect, it } from 'vitest'
import locales from '../../../assets/locales.json'
import { DEFAULT_LAUNCHER_LOCALE, resolveLauncherLocale } from './locale'
import { Settings } from './setting'
import { SettingSchema } from './setting.schema'

describe('launcher language preference', () => {
  it('starts in Spanish before settings have loaded', () => {
    expect(new Settings().locale).toBe(DEFAULT_LAUNCHER_LOCALE)
    expect(SettingSchema.parse({}).locale).toBe('es-ES')
  })

  it.each(Object.keys(locales))('preserves the supported preference %s exactly', (locale) => {
    expect(resolveLauncherLocale(locale)).toBe(locale)
  })

  it.each([undefined, null, '', 'unsupported', 'en-GB', 123, '__proto__'])('falls back to Spanish for %s', (locale) => {
    expect(resolveLauncherLocale(locale)).toBe('es-ES')
  })
})
