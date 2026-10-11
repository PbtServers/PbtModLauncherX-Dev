import { describe, expect, test } from 'vitest'
import { isTranscriptNearEnd } from './scroll'

describe('Transcript follow policy (geometry, not visual validation)', () => {
  test('follows empty and short conversations without pushing messages down', () => {
    expect(isTranscriptNearEnd({ scrollHeight: 400, clientHeight: 400, scrollTop: 0 })).toBe(true)
  })
  test('stops following while the reader is reviewing older messages', () => {
    expect(isTranscriptNearEnd({ scrollHeight: 2400, clientHeight: 400, scrollTop: 800 })).toBe(false)
  })
  test('allows rounding at the end but not a deliberate scroll upward', () => {
    expect(isTranscriptNearEnd({ scrollHeight: 2400, clientHeight: 400, scrollTop: 1970.5 })).toBe(true)
    expect(isTranscriptNearEnd({ scrollHeight: 2400, clientHeight: 400, scrollTop: 1900 })).toBe(false)
  })
})
