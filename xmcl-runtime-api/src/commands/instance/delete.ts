import { z } from 'zod'
import { defineCommand } from '../registry'
import { InstanceServiceKey } from '../../services/InstanceService'
import { MissingInputError } from '../registry'

/**
 * Delete a managed instance. Asks for confirmation unless `--yes` was
 * supplied at the global level (and forwarded via the input).
 */
export const deleteInstanceCommand = defineCommand({
  id: 'instance.delete',
  title: 'Delete Instance',
  description: 'Delete an instance from the launcher (and optionally its files).',
  category: 'instance',
  input: z.object({
    instance: z.string().min(1),
    deleteData: z.boolean().default(false),
    yes: z.boolean().default(false),
  }),
  cli: {
    name: 'instance delete',
    positionals: ['instance'],
    flags: {
      deleteData: { type: 'boolean', description: 'Also delete instance files on disk' },
      yes: { type: 'boolean', alias: 'y', description: 'Skip the confirmation prompt' },
    },
  },
  ui: { icon: 'delete' },
  async handler(input, ctx) {
    const inst = await ctx.resolveInstance(input.instance)
    if (!input.yes) {
      const ok = await ctx.confirm(`Delete instance '${inst.name}' (${inst.path})?${input.deleteData ? ' This will delete all files.' : ''}`)
      if (!ok) {
        ctx.out.log('Cancelled.')
        ctx.out.json({ ok: false, command: 'instance.delete', error: { code: 'Cancelled', message: 'User cancelled' } })
        throw new MissingInputError('confirmation', 'instance.delete')
      }
    }
    await ctx.call(InstanceServiceKey, 'deleteInstance', inst.path, input.deleteData)
    ctx.out.log(`Deleted ${inst.path}`)
    ctx.out.json({ ok: true, command: 'instance.delete', data: { path: inst.path } })
  },
})
