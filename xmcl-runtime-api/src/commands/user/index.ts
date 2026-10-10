import { commands } from '../registry'
import { listUsersCommand } from './list'
import { loginUserCommand } from './login'
import { logoutUserCommand, refreshUserCommand } from './logout'

export { listUsersCommand } from './list'
export { loginUserCommand } from './login'
export { logoutUserCommand, refreshUserCommand } from './logout'

/**
 * Register the built-in user commands. Idempotent.
 */
export function registerUserCommands() {
  for (const cmd of [listUsersCommand, loginUserCommand, logoutUserCommand, refreshUserCommand]) {
    if (!commands.has(cmd.id)) commands.register(cmd)
  }
}
