import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { resolveVuetifyLocale } from './locale'

describe('Vuetify language preference', () => {
  it('resolves missing UI messages in Spanish before English and respects English selection', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'ca',
      fallbackLocale: ['es-ES', 'en'],
      missingWarn: false,
      fallbackWarn: false,
      messages: {
        ca: { greeting: 'Hola en català' },
        'es-ES': { greeting: 'Hola', missing: 'Español' },
        en: { greeting: 'Hello', missing: 'English', future: 'New message' },
      },
    })
    expect(i18n.global.t('greeting')).toBe('Hola en català')
    expect(i18n.global.t('missing')).toBe('Español')
    expect(i18n.global.t('future')).toBe('New message')
    i18n.global.locale.value = 'en'
    expect(i18n.global.t('missing')).toBe('English')
  })
  it.each([undefined, ''])('defaults to Spanish for %s', (locale) => {
    expect(resolveVuetifyLocale(locale)).toBe('es')
  })
  it.each([
    ['es-ES', 'es'], ['ca', 'ca'], ['en', 'en'], ['en-IN', 'en'],
    ['fr', 'en'], ['zh-CN', 'en'], ['ar-EG', 'en'], ['unsupported', 'en'],
  ])('keeps the selected %s control language as %s', (locale, expected) => {
    expect(resolveVuetifyLocale(locale)).toBe(expected)
  })
})
