import { z } from 'zod'
import { defineCommand } from '../registry'
import { InstanceServiceKey } from '../../services/InstanceService'

/**
 * Snapshot the launcher's known instances.
 */
export const listInstancesCommand = defineCommand({
  id: 'instance.list',
  title: 'List Instances',
  description: 'List all instances known to the launcher.',
  category: 'instance',
  input: z.object({}).default({}),
  cli: {
    name: 'instance list',
  },
  ui: { icon: 'list' },
  async handler(_input, ctx) {
    const state = await ctx.call(InstanceServiceKey, 'getSharedInstancesState')
    const rows = state.instances.map((i) => ({
      name: i.name,
      path: i.path,
      version: i.runtime.minecraft,
      modLoader: i.runtime.forge ? `forge ${i.runtime.forge}`
        : i.runtime.neoForged ? `neoforge ${i.runtime.neoForged}`
          : i.runtime.fabricLoader ? `fabric ${i.runtime.fabricLoader}`
            : i.runtime.quiltLoader ? `quilt ${i.runtime.quiltLoader}`
              : '',
    }))
    ctx.out.table(rows)
    ctx.out.json({ ok: true, command: 'instance.list', data: rows })
    return rows
  },
})
