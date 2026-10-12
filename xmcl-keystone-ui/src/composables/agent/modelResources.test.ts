import { expect, test } from 'vitest'
import type { OllamaStatus } from '@xmcl/runtime-api'
import { modelResourceIssue } from './modelResources'

const status: OllamaStatus = { installed: true, running: true, models: [], recommendedModels: [], totalMemory: 32 * 1024 ** 3, freeMemory: 18 * 1024 ** 3, freeStorageBytes: 30 * 1024 ** 3, cpuCount: 16 }

test('does not label a failed runtime on a 32 GiB machine as insufficient RAM', () => {
  expect(modelResourceIssue({ ...status, running: false, runtimeError: 'ollama_store_locked_or_readonly' })).toBe('unavailable')
  expect(modelResourceIssue(status)).toBeUndefined()
})
test('distinguishes genuinely insufficient free RAM from insufficient disk space', () => {
  expect(modelResourceIssue({ ...status, freeMemory: 1024 ** 3 })).toBe('memory')
  expect(modelResourceIssue({ ...status, freeStorageBytes: 1 })).toBe('storage')
})
