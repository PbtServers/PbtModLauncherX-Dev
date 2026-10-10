import { commands } from '../registry'
import { createInstanceCommand } from './create'
import { deleteInstanceCommand } from './delete'
import { launchInstanceCommand } from './launch'
import { listInstancesCommand } from './list'

export { createInstanceCommand } from './create'
export { deleteInstanceCommand } from './delete'
export { launchInstanceCommand, LaunchInstanceInputSchema } from './launch'
export type { LaunchInstanceInput, LaunchInstanceResult } from './launch'
export { listInstancesCommand } from './list'

/**
 * Built-in instance commands. Calling this idempotently registers them
 * on the process-wide registry — safe to invoke from both renderer and
 * backend host bootstrapping.
 */
export function registerInstanceCommands() {
  for (const cmd of [launchInstanceCommand, listInstancesCommand, createInstanceCommand, deleteInstanceCommand]) {
    if (!commands.has(cmd.id)) commands.register(cmd)
  }
}
