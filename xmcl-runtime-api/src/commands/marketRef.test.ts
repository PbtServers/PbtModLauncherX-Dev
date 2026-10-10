import { describe, test, expect } from 'vitest'
import { parseMarketRef, stringifyMarketRef } from './marketRef'

describe('parseMarketRef', () => {
  test('parses modrinth slug only', () => {
    expect(parseMarketRef('modrinth:fabric-api')).toEqual({
      source: 'modrinth',
      project: 'fabric-api',
    })
  })

  test('parses modrinth slug with version', () => {
    expect(parseMarketRef('modrinth:fabric-api@0.105.0')).toEqual({
      source: 'modrinth',
      project: 'fabric-api',
      version: '0.105.0',
    })
  })

  test('rejects modrinth ref with empty slug', () => {
    expect(() => parseMarketRef('modrinth:')).toThrow(/missing project slug/)
    expect(() => parseMarketRef('modrinth:@1.0')).toThrow(/missing project slug/)
  })

  test('rejects modrinth ref with empty version', () => {
    expect(() => parseMarketRef('modrinth:fabric-api@')).toThrow(/empty version/)
  })

  test('parses curseforge project only', () => {
    expect(parseMarketRef('curseforge:238222')).toEqual({
      source: 'curseforge',
      project: 238222,
    })
  })

  test('parses curseforge project + file', () => {
    expect(parseMarketRef('curseforge:238222/4567890')).toEqual({
      source: 'curseforge',
      project: 238222,
      file: 4567890,
    })
  })

  test('rejects non-numeric curseforge project', () => {
    expect(() => parseMarketRef('curseforge:abc')).toThrow(/positive integer/)
  })

  test('rejects non-numeric curseforge file', () => {
    expect(() => parseMarketRef('curseforge:238222/xyz')).toThrow(/file id/)
  })

  test('parses http(s) urls', () => {
    expect(parseMarketRef('https://example.com/mod.jar')).toEqual({
      source: 'url',
      url: 'https://example.com/mod.jar',
    })
    expect(parseMarketRef('http://example.com/mod.jar')).toEqual({
      source: 'url',
      url: 'http://example.com/mod.jar',
    })
  })

  test('falls back to file path', () => {
    expect(parseMarketRef('./mods/foo.jar')).toEqual({
      source: 'file',
      path: './mods/foo.jar',
    })
    expect(parseMarketRef('C:/mods/foo.jar')).toEqual({
      source: 'file',
      path: 'C:/mods/foo.jar',
    })
  })

  test('rejects empty string', () => {
    expect(() => parseMarketRef('')).toThrow(/Empty/)
    expect(() => parseMarketRef('   ')).toThrow(/Empty/)
  })

  test('passes through and validates object form', () => {
    expect(parseMarketRef({ source: 'modrinth', project: 'fabric-api' })).toEqual({
      source: 'modrinth',
      project: 'fabric-api',
    })
    expect(() =>
      parseMarketRef({ source: 'curseforge', project: -1 } as any),
    ).toThrow()
  })
})

describe('stringifyMarketRef', () => {
  test('round-trips all variants', () => {
    const cases = [
      'modrinth:fabric-api',
      'modrinth:fabric-api@0.105.0',
      'curseforge:238222',
      'curseforge:238222/4567890',
      'https://example.com/x.jar',
      './mods/foo.jar',
    ]
    for (const c of cases) {
      expect(stringifyMarketRef(parseMarketRef(c))).toBe(c)
    }
  })
})
