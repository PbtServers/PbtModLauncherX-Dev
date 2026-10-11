import { z } from 'zod'
import { defineCommand } from '../registry'
import { UserServiceKey } from '../../services/UserService'

/** Remove a user account from the launcher. */
export const logoutUserCommand = defineCommand({
  id: 'user.logout',
  title: 'Logout User',
  description: 'Remove a user account from the launcher.',
  category: 'user',
  input: z.object({
    user: z.string().min(1),
  }),
  cli: {
    name: 'user logout',
    positionals: ['user'],
  },
  ui: { icon: 'logout' },
  async handler(input, ctx) {
    const user = await ctx.resolveUser(input.user)
    await ctx.call(UserServiceKey, 'removeUser', user)
    ctx.out.log(`Logged out ${user.username} (${user.id})`)
    ctx.out.json({ ok: true, command: 'user.logout', data: { id: user.id } })
  },
})

/** Refresh a user's tokens / profiles. */
export const refreshUserCommand = defineCommand({
  id: 'user.refresh',
  title: 'Refresh User',
  description: 'Refresh tokens and game profiles for a user.',
  category: 'user',
  input: z.object({
    user: z.string().optional(),
  }),
  cli: {
    name: 'user refresh',
    positionals: ['user'],
  },
  ui: { icon: 'refresh' },
  async handler(input, ctx) {
    const user = await ctx.resolveUser(input.user)
    const refreshed = await ctx.call(UserServiceKey, 'refreshUser', user.id)
    ctx.out.log(`Refreshed ${refreshed.username}`)
    ctx.out.json({ ok: true, command: 'user.refresh', data: { id: refreshed.id, username: refreshed.username } })
  },
})
