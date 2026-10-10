import { expect, test } from 'vitest'
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { findServerModClassification, matchesServerModFilters } from './serverModClassification'
import type { ServerExportMod } from '@xmcl/runtime-api'
const mod = { path: 'mods/example.jar', sha1: 'fixture-sha1', classification: { type: { value: 'both', evidence: [] }, server: { value: 'recommended', evidence: [] }, originalType: 'both', originalServer: 'unknown' } } as unknown as ServerExportMod
test('filters use independent axes, preserve unknowns and exact files rather than project names', () => {
  expect(matchesServerModFilters(mod, 'both', 'recommended')).toBe(true)
  expect(matchesServerModFilters(mod, 'both', 'required')).toBe(false)
  expect(matchesServerModFilters(undefined, 'unknown', 'unknown')).toBe(true)
  expect(findServerModClassification([{ path: 'G:\\Instancia é\\mods\\example.jar', hash: 'fixture-sha1' }], [mod])).toBe(mod)
  expect(findServerModClassification([{ path: 'mods/example.jar', hash: 'different-build' }], [mod])).toBeUndefined()
  expect(findServerModClassification([{ path: 'mods/a.jar' }, { path: 'mods/b.jar' }], [mod])).toBeUndefined()
})
// Compile and server-render the actual isolated Vue column component. No Electron/visual claim.
test.each(['es-ES', 'ca', 'en'])('actual Vue columns expose textual labels and accessible values in %s', async locale => {
  const require = createRequire(import.meta.url)
  const { parse, compileScript } = require('@vue/compiler-sfc')
  const { transpileModule, ModuleKind } = require('typescript')
  const { createSSRApp } = require('vue')
  const { renderToString } = require('vue/server-renderer')
  const { createI18n } = require('vue-i18n')
  const { parse: parseYaml } = require('yaml')
  const componentFile = new URL('../components/ModServerColumns.vue', import.meta.url)
  const descriptor = parse(readFileSync(componentFile, 'utf8'), { filename: componentFile.pathname }).descriptor
  const compiled = compileScript(descriptor, { id: 'server-mod-columns-test', inlineTemplate: true })
  const js = transpileModule(compiled.content, { compilerOptions: { module: ModuleKind.CommonJS } }).outputText
  const componentModule = { exports: {} as { default?: unknown } }
  new Function('require', 'module', 'exports', js)(require, componentModule, componentModule.exports)
  const messages = parseYaml(readFileSync(new URL(`../../locales/${locale}.yaml`, import.meta.url), 'utf8'))
  const app = createSSRApp(componentModule.exports.default, { classification: mod.classification })
  app.use(createI18n({ legacy: false, locale, messages: { [locale]: messages } }))
  const html = await renderToString(app)
  expect(html).toContain(messages.modServer.type)
  expect(html).toContain(messages.modServer.server)
  expect(html).toContain(messages.serverExport.side.both)
  expect(html).toContain(messages.modServer.necessity.recommended)
  expect(html).toContain('aria-label=')
  expect(html.match(/class="mod-server-column"/g)).toHaveLength(2)
})
