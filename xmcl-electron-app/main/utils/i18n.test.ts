import { describe, expect, it } from 'vitest'
import { createI18n } from './i18n'

describe('createI18n', () => {
  it('uses Spanish first and English last without replacing a manual preference', () => {
    const i18n = createI18n({
      'es-ES': { greeting: 'Hola', fallback: 'Español' },
      ca: { greeting: 'Hola en català' },
      en: { greeting: 'Hello', fallback: 'English', futureKey: 'New message' },
    }, 'es-ES')
    expect(i18n.t('greeting')).toBe('Hola')
    i18n.use('ca')
    expect(i18n.t('greeting')).toBe('Hola en català')
    expect(i18n.t('fallback')).toBe('Español')
    expect(i18n.t('futureKey')).toBe('New message')
    i18n.use('en')
    expect(i18n.t('greeting')).toBe('Hello')
    i18n.use('unsupported')
    expect(i18n.t('greeting')).toBe('Hola')
  })
  it('replaces every occurrence of a placeholder', () => {
    const i18n = createI18n({
      en: { greeting: '{name} invited {name}' },
    }, 'en')

    expect(i18n.t('greeting', { name: 'Alex' })).toBe('Alex invited Alex')
  })

  it('falls back to the default locale for an unsupported locale', () => {
    const i18n = createI18n({
      en: { greeting: 'Hello' },
    }, 'en')

    i18n.use('fr')

    expect(i18n.t('greeting')).toBe('Hello')
  })
})
