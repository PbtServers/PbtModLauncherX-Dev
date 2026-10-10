export * from './types'
export * from './registry'
export * from './marketRef'
export * from './cli'
export * from './instance'
export * from './user'
export * from './install'

import { registerInstallCommands } from './install'
import { registerInstanceCommands } from './instance'
import { registerUserCommands } from './user'

/**
 * Register every built-in command on the process-wide registry. Hosts
 * (electron main, renderer bootstrap) should call this once during startup.
 *
 * Idempotent — safe to call multiple times.
 */
export function registerBuiltinCommands() {
  registerInstanceCommands()
  registerUserCommands()
  registerInstallCommands()
}
