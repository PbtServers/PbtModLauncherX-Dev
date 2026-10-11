import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import yaml from 'js-yaml'
import { parse } from '@vue/compiler-sfc'
import { describe, expect, test } from 'vitest'

const ui = resolve(import.meta.dirname, '../..')
const source = (path: string) => readFileSync(resolve(ui, path), 'utf8')
describe('Phase 15.1 structural and catalog regressions (not visual validation)', () => {
  test('mod rows keep the original labels without server columns or exclusive filters', () => {
    const row = source('views/ModItem.vue')
    const list = source('views/Mod.vue')
    expect(row).not.toContain('ModServerClassification')
    expect(row).toContain('ModLabels')
    expect(list).not.toContain('serverClassification')
    expect(list).toContain('disabledOnly')
  })
  test('server review remains available outside the normal mod list', () => {
    const exporter = source('views/AppServerExportDialog.vue')
    expect(exporter).toContain('serverExport')
    expect(source('composables/serverModClassification.ts')).toContain('refresh')
  })
  test('Catalan retains original Unicode rather than literal question-mark corruption', () => {
    const ca: any = yaml.load(readFileSync(resolve(ui, '../locales/ca.yaml'), 'utf8'))
    expect(JSON.stringify(ca)).toContain('instàncies')
    expect(JSON.stringify(ca)).toContain('col·leccions')
    expect(JSON.stringify(ca)).toContain('proveïdor')
    for (const key of ['applyChanges', 'replaceCss', 'cssState', 'stageChanges', 'contextTooSmall', 'ollamaRequestFailed']) {
      expect(ca.pbtadmin[key]).not.toMatch(/\w\?\w/)
    }
  })
  test.each(['ca', 'es-ES', 'en'])('provider status messages exist in %s', locale => {
    const catalog: any = yaml.load(readFileSync(resolve(ui, `../locales/${locale}.yaml`), 'utf8'))
    for (const key of ['chatOnly', 'selectModel', 'externalSetup', 'runningExternal']) expect(catalog.pbtadmin[key]).toBeTruthy()
  })
  test('changed Vue templates compile and use bounded opaque themed chat surfaces', () => {
    for (const path of ['views/AppAgentChat.vue', 'views/AppOmniDialog.vue', 'views/Mod.vue', 'views/ModItem.vue', 'components/LocalAiSetup.vue']) {
      expect(parse(source(path)).errors).toEqual([])
    }
    const chat = source('views/AppAgentChat.vue')
    expect(chat).toContain('background: rgb(var(--v-theme-surface)) !important')
    expect(chat).toContain('overflow-wrap: anywhere')
    expect(chat).toContain('min-width: 0')
    expect(source('views/SettingGeneral.vue')).toContain('agentResolvedEndpoint !== OLLAMA_ENDPOINT')
  })
})
