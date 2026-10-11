import { z } from 'zod'
import { defineCommand } from '../registry'
import { UserServiceKey } from '../../services/UserService'

/**
 * Login a user account. Authority defaults to the official Microsoft
 * service. Username + password are only required for password-based
 * authorities (offline / Yggdrasil); the device-code flow used by
 * Microsoft will populate them itself.
 */
export const loginUserCommand = defineCommand({
  id: 'user.login',
  title: 'Login User',
  description: 'Log in to a Microsoft, offline, or Yggdrasil-compatible account.',
  category: 'user',
  input: z.object({
    authority: z.string().default('microsoft'),
    username: z.string().optional(),
    password: z.string().optional(),
  }),
  cli: {
    name: 'user login',
    flags: {
      authority: { alias: 'a', description: 'Authority url or builtin (microsoft, offline)' },
      username: { alias: 'u', description: 'Username (required for offline / yggdrasil)' },
      password: { alias: 'p', description: 'Password (yggdrasil only)' },
    },
  },
  ui: { icon: 'login' },
  async handler(input, ctx) {
    let username = input.username
    if (!username && input.authority !== 'microsoft') {
      username = await ctx.prompt({ field: 'username', message: 'Username:' })
    }
    const profile = await ctx.call(UserServiceKey, 'login', {
      username: username ?? '',
      password: input.password,
      authority: input.authority,
    })
    ctx.out.log(`Logged in as ${profile.username} (${profile.id})`)
    ctx.out.json({ ok: true, command: 'user.login', data: { id: profile.id, username: profile.username, authority: profile.authority } })
    return profile
  },
})
