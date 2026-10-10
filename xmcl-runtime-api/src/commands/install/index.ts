import { commands } from '../registry'
import { installModCommand, installResourcePackCommand, installShaderPackCommand, installSaveCommand } from './commands'

export * from './installResource'
export {
  installModCommand,
  installResourcePackCommand,
  installShaderPackCommand,
  installSaveCommand,
} from './commands'

/**
 * Register the built-in install commands. Idempotent.
 */
export function registerInstallCommands() {
  for (const cmd of [installModCommand, installResourcePackCommand, installShaderPackCommand, installSaveCommand]) {
    if (!commands.has(cmd.id)) commands.register(cmd)
  }
}
