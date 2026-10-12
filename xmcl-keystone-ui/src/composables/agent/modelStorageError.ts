export function modelStorageErrorKey(error: unknown, fallback = 'pbtadmin.integratedFailed') {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('ollama_storage_insufficient')) return 'qwenInstall.storageError'
  if (/ollama_migration_integrity|ollama_seed_copy_mismatch/.test(message)) return 'modelStorage.integrityError'
  if (/ollama_storage_unavailable|ollama_store_locked_or_readonly|ollama_migration_invalid|EACCES|EPERM|EROFS/.test(message)) return 'modelStorage.accessError'
  return fallback
}
