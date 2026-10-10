import { z } from 'zod'
import { defineCommand } from '../registry'
import { UserServiceKey } from '../../services/UserService'

/** List all known users (logged-in accounts). */
export const listUsersCommand = defineCommand({
  id: 'user.list',
  title: 'List Users',
  description: 'List all logged-in user accounts.',
  category: 'user',
  input: z.object({}).default({}),
  cli: { name: 'user list' },
  ui: { icon: 'people' },
  async handler(_input, ctx) {
    const state = await ctx.call(UserServiceKey, 'getUserState')
    const rows = Object.values(state.users).map((u) => ({
      id: u.id,
      username: u.username,
      authority: u.authority,
      profiles: Object.keys(u.profiles).length,
    }))
    ctx.out.table(rows)
    ctx.out.json({ ok: true, command: 'user.list', data: rows })
    return rows
  },
})
