import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createI18n } from 'vue-i18n'
import { ca, es } from 'vuetify/locale'
import { describe, expect, it } from 'vitest'
import { LOCALES_DIR, MAIN_LOCALES_DIR, REPO_ROOT } from './i18n-core.mjs'
import { parseCatalog, validatePair, validateProject } from './validate-translations.mjs'
import { createI18n as createMainI18n } from '../../xmcl-electron-app/main/utils/i18n'

describe('strict translation validation', () => {
  it('rejects duplicate YAML keys', () => expect(() => parseCatalog('name: One\nname: Two')).toThrow())
  it('rejects duplicate nested JSON keys', () => expect(() => parseCatalog('{"a":{"x":1,"x":2}}', 'json')).toThrow(/Duplicate/))
  it('allows the same JSON key in separate objects', () => expect(parseCatalog('{"a":{"x":1},"b":{"x":2}}', 'json')).toEqual({ a: { x: 1 }, b: { x: 2 } }))
  it.each([['yaml', 'a: ['], ['json', '{"a":']])('rejects invalid %s syntax', (format, source) => expect(() => parseCatalog(source, format)).toThrow())
  it('reports missing and legacy keys', () => {
    const result = validatePair({ a: 'A', b: 'B' }, { a: 'Una', legacy: 'Anterior' }, 'ca')
    expect(result.missing).toEqual(['b'])
    expect(result.extra).toEqual(['legacy'])
  })
  it('rejects empty messages', () => expect(validatePair({ a: 'A' }, { a: ' ' }, 'ca').invalid[0].code).toBe('empty'))
  it('rejects YAML null messages', () => expect(validatePair({ a: 'A' }, parseCatalog('a:'), 'ca').invalid[0].code).toBe('type'))
  it('rejects extra and omitted interpolation names', () => {
    expect(validatePair({ a: '{name}' }, { a: '{nom}' }, 'ca').invalid[0].code).toBe('placeholders')
    expect(validatePair({ a: '{name}' }, { a: 'Hola' }, 'ca').placeholders[0].code).toBe('placeholders-missing')
  })
  it('accepts literal braces, plurals and repeated parameters', () => {
    const result = validatePair({ a: "{'{'} {name} {'}'}", b: '{count} item | {count} items' }, { a: "{'{'} {name} {name} {'}'}", b: '{count} element | {count} elements' }, 'ca')
    expect([...result.invalid, ...result.placeholders]).toEqual([])
  })
  it('has complete compilable Spanish and Catalan catalogs, including component messages', () => expect(validateProject().failures).toBe(0), 30_000)
})

describe('selectable application locales', () => {
  const registry = parseCatalog(readFileSync(join(REPO_ROOT, 'assets/locales.json'), 'utf8'), 'json')
  const load = (directory, locale) => parseCatalog(readFileSync(join(directory, `${locale}.yaml`), 'utf8'))
  const messages = Object.fromEntries(['en', 'es-ES', 'ca'].map(locale => [locale, load(LOCALES_DIR, locale)]))
  it.each([['en', 'Language'], ['es-ES', 'Idioma'], ['ca', 'Idioma']])('loads and selects %s without fallback', (locale, label) => {
    expect(registry[locale]).toBeTruthy()
    const missing = []
    const i18n = createI18n({ legacy: false, locale, fallbackLocale: false, messages, missing: (_, key) => missing.push(key) })
    expect(i18n.global.t('setting.language')).toBe(label)
    expect(i18n.global.t('agent.marketConfirmTarget', { instance: 'Prueba' })).toContain('Prueba')
    expect(i18n.global.t('modInstall.noVersionSupported', { supported: '1.21' })).toContain('1.21')
    expect(i18n.global.t('resourcepack.searchOnModrinth')).toBe(i18n.global.t('mod.searchOnModrinth'))
    expect(i18n.global.t('localCollection.projects', 2)).toMatch(/^2 /)
    expect(missing).toEqual([])
  })
  it.each(['es-ES', 'ca'])('loads Electron notifications and menu labels in %s', (locale) => {
    const main = createMainI18n(Object.fromEntries(['en', 'es-ES', 'ca'].map(language => [language, load(MAIN_LOCALES_DIR, language)])), 'en')
    main.use(locale)
    expect(main.locales).toContain(locale)
    expect(main.t('autoCloseHint', { time: 3 })).toContain(locale === 'ca' ? '3 segons' : '3 segundos')
    expect(main.t('makeDesktopShortcut')).not.toBe('Make Desktop Shortcut')
    expect(main.t('title')).toBe('PbtModLauncherX')
  })
  it('provides Spanish and Catalan component-library labels', () => {
    expect(es.close).toBe('Cerrar')
    expect(ca.close).toBe('Tancar')
  })
})
