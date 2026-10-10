import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { isValidEmail, useLoginValidation } from './user'

afterEach(() => vi.unstubAllGlobals())

describe('isValidEmail', () => {
  it('accepts email addresses containing hyphens', () => {
    expect(isValidEmail('first-last@outlook-mail.com')).toBe(true)
  })

  it('rejects malformed email addresses', () => {
    expect(isValidEmail('first-last@outlook')).toBe(false)
  })
})

describe('Pbt offline login compatibility', () => {
  it('keeps existing non-empty offline names without requiring an email', () => {
    vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
    const { usernameRules } = useLoginValidation(ref(false), ref(true), true)
    expect(usernameRules.value.every(rule => rule('A') === true)).toBe(true)
    expect(usernameRules.value.every(rule => rule('') === true)).toBe(false)
  })

  it('retains upstream strict offline validation for other callers', () => {
    vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
    const { usernameRules } = useLoginValidation(ref(false), ref(true))
    expect(usernameRules.value.every(rule => rule('Steve') === true)).toBe(true)
    expect(usernameRules.value.every(rule => rule('A') === true)).toBe(false)
  })
})
