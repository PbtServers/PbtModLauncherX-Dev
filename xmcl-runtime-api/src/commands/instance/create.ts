import { z } from 'zod'
import { defineCommand } from '../registry'
import { InstanceServiceKey } from '../../services/InstanceService'

/**
 * Create a new managed instance. Modpack-based creation lives in
 * `instance.import` so this command stays focused on the simple case.
 */
export const createInstanceCommand = defineCommand({
  id: 'instance.create',
  title: 'Create Instance',
  description: 'Create a new managed instance.',
  category: 'instance',
  input: z.object({
    name: z.string().min(1),
    minecraft: z.string().optional(),
    forge: z.string().optional(),
    neoForged: z.string().optional(),
    fabricLoader: z.string().optional(),
    quiltLoader: z.string().optional(),
  }),
  cli: {
    name: 'instance create',
    positionals: ['name'],
    flags: {
      minecraft: { alias: 'm', description: 'Minecraft version' },
      forge: { description: 'Forge version' },
      neoForged: { description: 'NeoForge version' },
      fabricLoader: { description: 'Fabric loader version' },
      quiltLoader: { description: 'Quilt loader version' },
    },
  },
  ui: { icon: 'add' },
  async handler(input, ctx): Promise<string> {
    const runtime: Record<string, string> = {}
    if (input.minecraft) runtime.minecraft = input.minecraft
    if (input.forge) runtime.forge = input.forge
    if (input.neoForged) runtime.neoForged = input.neoForged
    if (input.fabricLoader) runtime.fabricLoader = input.fabricLoader
    if (input.quiltLoader) runtime.quiltLoader = input.quiltLoader
    const path = await ctx.call(InstanceServiceKey, 'createInstance', {
      name: input.name,
      runtime: runtime as any,
    })
    ctx.out.log(`Created instance at ${path}`)
    ctx.out.json({ ok: true, command: 'instance.create', data: { path, name: input.name } })
    return path
  },
})
