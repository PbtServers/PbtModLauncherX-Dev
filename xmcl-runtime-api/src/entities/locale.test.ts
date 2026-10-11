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

  it.each(Object.keys(locales))('uses reviewed languages or English for %s', (locale) => {
    expect(resolveLauncherLocale(locale)).toBe(['es-ES', 'ca', 'en'].includes(locale) ? locale : 'en')
  })

  it.each([undefined, null, '', 123])('falls back to Spanish for an absent preference %s', (locale) => {
    expect(resolveLauncherLocale(locale)).toBe('es-ES')
  })
  it.each(['unsupported', 'en-GB', '__proto__'])('uses English for %s', locale => {
    expect(resolveLauncherLocale(locale)).toBe('en')
  })
})
