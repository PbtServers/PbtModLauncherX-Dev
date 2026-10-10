import { describe, expect, it } from 'vitest'
import { parseCFG } from './cfg'

describe('parseCFG', () => {
  it('parses simple key/value pairs', () => {
    const result = parseCFG('name=Test\nnotes=hello')
    expect(result.name).toBe('Test')
    expect(result.notes).toBe('hello')
  })

  it('preserves "=" inside values (gh #1386)', () => {
    const result = parseCFG('WrapperCommand=prime-run env LIBVA_DRIVER_NAME=radeonsi')
    expect(result.WrapperCommand).toBe('prime-run env LIBVA_DRIVER_NAME=radeonsi')
  })

  it('skips blank lines, comments and section headers', () => {
    const result = parseCFG('[General]\n# a comment\n\nname=Test\n')
    expect(result.name).toBe('Test')
    expect(Object.keys(result)).toEqual(['name'])
  })

  it('handles CRLF line endings', () => {
    const result = parseCFG('name=Test\r\nnotes=hi')
    expect(result.name).toBe('Test')
    expect(result.notes).toBe('hi')
  })
})
