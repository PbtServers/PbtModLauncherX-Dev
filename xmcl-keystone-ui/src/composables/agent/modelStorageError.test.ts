import { expect, test } from 'vitest'
import { modelStorageErrorKey } from './modelStorageError'

test('distinguishes space, access, integrity and unrelated engine failures', () => {
  expect(modelStorageErrorKey(new Error('ollama_storage_insufficient'))).toBe('qwenInstall.storageError')
  expect(modelStorageErrorKey(new Error('ollama_migration_integrity'))).toBe('modelStorage.integrityError')
  expect(modelStorageErrorKey(new Error('EACCES'))).toBe('modelStorage.accessError')
  expect(modelStorageErrorKey(new Error('ollama_store_locked_or_readonly'))).toBe('modelStorage.accessError')
  expect(modelStorageErrorKey(new Error('ollama_spawn_failed'))).toBe('pbtadmin.integratedFailed')
})
