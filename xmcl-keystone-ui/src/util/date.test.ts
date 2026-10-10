import { describe, expect, it } from 'vitest'
import { getLocalDateString } from './date'

describe('launcher date language', () => {
  const date = new Date('2026-01-15T12:00:00Z')
  const options = { dateStyle: 'full' as const }
  it('defaults to Spanish without consulting the browser language', () => {
    expect(getLocalDateString(date.toISOString(), options)).toBe(Intl.DateTimeFormat('es-ES', options).format(date))
  })
  it.each(['ca', 'en', 'en-IN', 'fr'])('respects the selected language %s', (locale) => {
    expect(getLocalDateString(date.toISOString(), options, locale)).toBe(Intl.DateTimeFormat(locale, options).format(date))
  })
  it.each(['unsupported', 'lolcat'])('uses Spanish for a tag Intl cannot format: %s', (locale) => {
    expect(getLocalDateString(date.toISOString(), options, locale)).toBe(Intl.DateTimeFormat('es-ES', options).format(date))
  })
})
