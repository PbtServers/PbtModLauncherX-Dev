import { expect, test } from 'vitest'
import { checkPullEvent, safePullError } from './prepare-ollama-model.mjs'

test('reports actionable engine download errors without signed URLs or credentials', () => {
  const error = 'download failed: Get https://example.invalid/blob?token=private: x509: certificate signed by unknown authority'
  expect(() => checkPullEvent(JSON.stringify({ error }))).toThrow('x509: certificate signed by unknown authority')
  expect(safePullError(error)).not.toContain('private')
  expect(safePullError('Bearer abc password=hidden')).not.toMatch(/abc|hidden/)
})

test('preserves success and progress events, bounds untrusted diagnostics', () => {
  expect(checkPullEvent('{"status":"success"}').status).toBe('success')
  expect(checkPullEvent('{"status":"pulling","completed":42}').completed).toBe(42)
  expect(safePullError('x'.repeat(5000))).toHaveLength(1200)
  expect(safePullError('error\nforged log')).toBe('error forged log')
})
