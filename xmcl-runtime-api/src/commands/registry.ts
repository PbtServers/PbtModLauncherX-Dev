import type { z } from 'zod'
import type {
  Command,
  CommandCategory,
  CommandCliBinding,
  CommandContext,
  CommandUiBinding,
} from './types'

/**
 * Spec passed to {@link defineCommand}. Generic over the Zod schema so the
 * handler's `input` parameter is automatically inferred.
 */
export interface CommandSpec<S extends z.ZodType, O> {
  id: string
  title: string
  description?: string
  category: CommandCategory
  input: S
  cli?: CommandCliBinding<z.infer<S>>
  ui?: CommandUiBinding
  handler(input: z.infer<S>, ctx: CommandContext): Promise<O>
}

/**
 * Helper to declare a {@link Command}. Preserves type inference between the
 * Zod schema and the handler's input parameter.
 */
export function defineCommand<S extends z.ZodType, O>(spec: CommandSpec<S, O>): Command<z.infer<S>, O> {
  return spec as Command<z.infer<S>, O>
}

/**
 * Thrown when a dispatched command id is not registered.
 */
export class CommandNotFoundError extends Error {
  constructor(public readonly commandId: string) {
    super(`Command not found: ${commandId}`)
    this.name = 'CommandNotFoundError'
  }
}

/**
 * Thrown when the handler needs interactive input that the current context
 * cannot provide (e.g. CLI in non-TTY mode without the required flag).
 */
export class MissingInputError extends Error {
  constructor(
    public readonly field: string,
    public readonly commandId?: string,
  ) {
    super(commandId
      ? `Missing required input '${field}' for command '${commandId}'`
      : `Missing required input '${field}'`)
    this.name = 'MissingInputError'
  }
}

/**
 * Thrown when a referenced instance cannot be resolved by path or name.
 */
export class InstanceNotFoundError extends Error {
  constructor(public readonly ref: string) {
    super(`Instance not found: ${ref}`)
    this.name = 'InstanceNotFoundError'
  }
}

/**
 * Thrown when a referenced user cannot be resolved by id or username.
 */
export class UserNotFoundError extends Error {
  constructor(public readonly ref: string) {
    super(`User not found: ${ref}`)
    this.name = 'UserNotFoundError'
  }
}

export interface CommandFilter {
  category?: CommandCategory
  /** When set, only return commands that have a CLI / UI binding. */
  mode?: 'cli' | 'renderer'
}

/**
 * Registry of {@link Command} definitions. One instance lives per process —
 * commands are populated at module-load time via `defineCommand` + `register`.
 *
 * The same module is imported by both renderer and backend, so each process
 * has an identical, independently-populated registry. This is fine because
 * commands are pure descriptors.
 */
// Storage type — `any` because Command is invariant in its input parameter
// (the `cli` binding mentions `keyof I`, which makes wider types incompatible).
type AnyCommand = Command<any, any>

export class CommandRegistry {
  private readonly commands = new Map<string, AnyCommand>()

  /** Register a command. Throws if the id is already taken. */
  register(cmd: AnyCommand): this {
    if (this.commands.has(cmd.id)) {
      throw new Error(`Duplicate command id: ${cmd.id}`)
    }
    this.commands.set(cmd.id, cmd)
    return this
  }

  /** Register many commands at once. */
  registerAll(cmds: ReadonlyArray<AnyCommand>): this {
    for (const c of cmds) this.register(c)
    return this
  }

  get(id: string): AnyCommand | undefined {
    return this.commands.get(id)
  }

  has(id: string): boolean {
    return this.commands.has(id)
  }

  list(filter?: CommandFilter): AnyCommand[] {
    const all = [...this.commands.values()]
    if (!filter) return all
    return all.filter((c) => {
      if (filter.category && c.category !== filter.category) return false
      if (filter.mode === 'cli' && !c.cli) return false
      // Currently every command is invokable from the palette; we only filter
      // out commands that explicitly declared themselves CLI-only in future.
      return true
    })
  }

  /**
   * Validate `rawInput` against the command's schema and invoke its handler.
   *
   * @throws {CommandNotFoundError} when no command with `id` is registered.
   * @throws {z.ZodError} when input validation fails.
   */
  async dispatch<O = unknown>(id: string, rawInput: unknown, ctx: CommandContext): Promise<O> {
    const cmd = this.commands.get(id)
    if (!cmd) throw new CommandNotFoundError(id)
    const parsed = cmd.input.parse(rawInput)
    return cmd.handler(parsed, ctx) as Promise<O>
  }
}

/**
 * The single, process-wide registry instance. Importing this module in a
 * given process always returns the same registry.
 */
export const commands = new CommandRegistry()
