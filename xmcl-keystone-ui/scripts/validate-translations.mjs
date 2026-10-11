#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'
import ts from 'typescript'
import {
  BASE_LOCALE, LOCALES_DIR, MAIN_LOCALES_DIR, REPO_ROOT,
  buildState, computeInvalid, computeLint, computeWarnings, flatten,
} from './i18n-core.mjs'

/** JSON.parse silently accepts duplicate keys; inspect the parser tree first. */
export function parseCatalog(source, format = 'yaml') {
  if (format === 'yaml') return yaml.load(source)
  if (format !== 'json') throw new Error(`Unsupported catalog format: ${format}`)
  const tree = ts.parseJsonText('catalog.json', source)
  if (tree.parseDiagnostics.length) throw new Error(ts.flattenDiagnosticMessageText(tree.parseDiagnostics[0].messageText, '\n'))
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const names = new Set()
      for (const property of node.properties) {
        const name = property.name?.text
        if (names.has(name)) throw new Error(`Duplicate JSON key: ${name}`)
        names.add(name)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(tree)
  return JSON.parse(source)
}

export function unicodeDamage(value, locale) {
  if (typeof value !== 'string') return false
  const prose = value.replace(/https?:\/\/\S+/g, '')
  return /\uFFFD|[\p{L}]\?[\p{L}]/u.test(prose) || (locale === 'es-ES' && /^\?[^?]+\?/u.test(prose))
}

export function validatePair(reference, translation, locale) {
  const base = flatten(reference)
  const actual = flatten(translation)
  const state = { localeKeys: new Map([[BASE_LOCALE, base], [locale, actual]]), localeErrors: new Map() }
  return {
    locale,
    total: base.size,
    present: [...base.keys()].filter(key => actual.has(key)).length,
    missing: [...base.keys()].filter(key => !actual.has(key)),
    // Retained fork/legacy keys are reported, never deleted automatically.
    extra: [...actual.keys()].filter(key => !base.has(key)),
    invalid: [...computeInvalid(state), ...[...actual].filter(([, value]) => unicodeDamage(value, locale)).map(([key]) => ({ locale, key, code: 'unicodeDamage' }))],
    placeholders: computeWarnings(state),
    identicalReference: [...base.keys()].filter(key => actual.get(key) === base.get(key)),
  }
}

export function validateProject() {
  const results = []
  const syntax = []
  for (const [scope, directory] of [['ui', LOCALES_DIR], ['electron', MAIN_LOCALES_DIR]]) {
    const catalogs = new Map()
    for (const file of readdirSync(directory).filter(name => /\.(yaml|json)$/.test(name))) {
      try {
        const locale = file.replace(/\.(yaml|json)$/, '')
        const catalog = parseCatalog(readFileSync(join(directory, file), 'utf8'), file.endsWith('.json') ? 'json' : 'yaml')
        catalogs.set(locale, catalog)
        for (const [key, value] of flatten(catalog)) if (unicodeDamage(value, locale)) syntax.push({ scope, file, key, message: 'Possible Unicode loss' })
      }
      catch (error) { syntax.push({ scope, file, message: error.message }) }
    }
    if (!catalogs.has(BASE_LOCALE)) syntax.push({ scope, message: 'Missing reference catalog' })
    for (const locale of ['es-ES', 'ca']) {
      if (!catalogs.has(locale)) { syntax.push({ scope, locale, message: 'Missing translation catalog' }); continue }
      if (catalogs.has(BASE_LOCALE)) results.push({ scope, ...validatePair(catalogs.get(BASE_LOCALE), catalogs.get(locale), locale) })
    }
  }
  const state = buildState()
  for (const [file, scan] of state.fileScans) {
    for (const [locale, messages] of scan.localMessages) for (const [key, value] of messages) if (unicodeDamage(value, locale)) syntax.push({ scope: 'component', file, locale, key, message: 'Possible Unicode loss' })
    for (const [locale, message] of scan.localErrors) syntax.push({ scope: 'component', file, locale, message })
    if (!scan.localMessages.has(BASE_LOCALE)) continue
    for (const locale of ['es-ES', 'ca']) {
      const unflatten = entries => {
        const object = {}
        for (const [key, value] of entries) {
          const parts = key.split('.')
          let node = object
          for (const part of parts.slice(0, -1)) node = node[part] ??= {}
          node[parts.at(-1)] = value
        }
        return object
      }
      results.push({ scope: 'component', file, ...validatePair(unflatten(scan.localMessages.get(BASE_LOCALE)), unflatten(scan.localMessages.get(locale) ?? []), locale) })
    }
  }
  const registry = parseCatalog(readFileSync(join(REPO_ROOT, 'assets/locales.json'), 'utf8'), 'json')
  for (const locale of ['en', 'es-ES', 'ca']) if (!registry[locale]) syntax.push({ scope: 'registry', locale, message: 'Locale is not selectable' })
  const audit = computeLint(state)
  const failures = syntax.length + audit.missing.length + results.reduce((count, result) => count + result.missing.length + result.invalid.length + result.placeholders.length, 0)
  return { failures, syntax, results, unusedCandidates: audit.unused, missingCodeKeys: audit.missing, otherLocaleDiagnostics: [...audit.invalid, ...audit.warnings].filter(item => !['en', 'es-ES', 'ca'].includes(item.locale)), allLocaleCoverage: audit.coverage }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = validateProject()
    if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2))
    else {
      for (const catalog of result.results) console.log(`${catalog.scope}/${catalog.locale}: ${catalog.present}/${catalog.total}, missing=${catalog.missing.length}, invalid=${catalog.invalid.length}, placeholders=${catalog.placeholders.length}`)
      console.log(`Syntax errors: ${result.syntax.length}; failures: ${result.failures}; other-language diagnostics: ${result.otherLocaleDiagnostics.length}`)
      if (result.failures) console.error(JSON.stringify(result, null, 2))
    }
    process.exitCode = result.failures ? 1 : 0
  } catch (error) { console.error(error); process.exitCode = 1 }
}
