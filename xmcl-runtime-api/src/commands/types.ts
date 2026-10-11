import type { z } from 'zod'
import type { Instance } from '@xmcl/instance'
import type { UserProfile } from '../entities/user.schema'
import type { ServiceKey } from '../services/Service'
import type { Task } from '../task'

/**
 * Categories used for grouping commands in the palette and `--help` listings.
 */
export type CommandCategory =
  | 'instance'
  | 'user'
  | 'mod'
  | 'modpack'
  | 'resourcepack'
  | 'shaderpack'
  | 'save'
  | 'system'
  | 'ui'

/**
 * A reference to a remote or local resource used by install commands.
 *
 * Accepted CLI string forms (parsed by `parseMarketRef`):
 * - `modrinth:<slug>[@<version>]`
 * - `curseforge:<projectId>[/<fileId>]`
 * - `./local/path` or absolute path
 * - `https://...`
 */
export type MarketRef =
  | { source: 'modrinth'; project: string; version?: string }
  | { source: 'curseforge'; project: number; file?: number }
  | { source: 'file'; path: string }
  | { source: 'url'; url: string }

/**
 * Mode the command is being executed in. Handlers can branch on this when the UX
 * differs meaningfully (e.g. printing a table vs opening a list view).
 */
export type CommandMode = 'cli' | 'renderer' | 'protocol'

/**
 * A single prompt request issued by a command handler via {@link CommandContext.prompt}.
 */
export interface PromptSpec {
  /** Field identifier — used by `--json` errors and form generators. */
  field: string
  /** Human-readable question. */
  message: string
  /** Hint for the input kind. */
  type?: 'text' | 'password' | 'number'
  /** Default value to suggest. */
  default?: string
  /** Validate the answer. Returning a string is treated as an error message. */
  validate?: (value: string) => true | string
}

/**
 * Choice item used by {@link CommandContext.select}.
 */
export interface SelectItem<T> {
  label: string
  description?: string
  value: T
}

export interface SelectOptions<T> {
  field: string
  message: string
  items: SelectItem<T>[]
}

/**
 * Long-running task handle. Mirrors the existing task system but exposes
 * only what command handlers need.
 */
export interface TaskHandle {
  update(progress: number, total?: number, message?: string): void
  child(name: string): TaskHandle
}

/**
 * Output sink. In CLI mode this writes to stdout; in renderer mode it emits
 * notifications + appends to a command output panel.
 */
export interface CommandOutput {
  /** Plain text line. */
  log(message: string): void
  /** Structured payload — printed as JSON in `--json` mode, ignored in renderer. */
  json(payload: unknown): void
  /** Tabular data — pretty-printed in CLI, list-rendered in palette. */
  table(rows: ReadonlyArray<Record<string, unknown>>): void
}

// Helpers to extract args and return types from a service method.
type ArgsOf<F> = F extends (...args: infer A) => any ? A : never
type ReturnOf<F> = F extends (...args: any) => infer R ? Awaited<R> : never

/**
 * The dependency-injection seam between the pure command handler and its
 * environment. Handlers must NOT import services / electron / vue / fs
 * directly — every side effect goes through this object.
 */
export interface CommandContext {
  /** Which frontend is driving the dispatch. */
  readonly mode: CommandMode
  /** Cancellation signal — long-running handlers should respect it. */
  readonly signal: AbortSignal

  /**
   * Invoke a service method. The signature mirrors
   * {@link import('../service').ServiceChannel.call}, so existing services
   * are reachable without changes.
   */
  call<T, M extends keyof T>(
    key: ServiceKey<T>,
    method: M,
    ...args: ArgsOf<T[M]>
  ): Promise<ReturnOf<T[M]>>

  /**
   * Snapshot a state object. Backend reads from the shared registry; renderer
   * unwraps the reactive store. Always returns a non-reactive copy — for live
   * updates use composables outside the command system.
   */
  state<T>(stateCtor: new () => T): Promise<Readonly<T>>

  /**
   * Resolve an instance by path or display name. Throws `InstanceNotFound`
   * if neither matches.
   */
  resolveInstance(ref: string): Promise<Instance>

  /**
   * Resolve a user by id or username. If `ref` is omitted, returns the
   * currently selected user, falling back to {@link pickUser}.
   */
  resolveUser(ref?: string): Promise<UserProfile>

  /** Interactive instance picker (CLI list, renderer dialog). */
  pickInstance(): Promise<Instance>

  /** Interactive user picker. */
  pickUser(): Promise<UserProfile>

  /** Ask for a string. */
  prompt(spec: PromptSpec): Promise<string>

  /** Ask yes/no. */
  confirm(message: string): Promise<boolean>

  /** Ask the user to choose one of the items. */
  select<T>(options: SelectOptions<T>): Promise<T>

  /** Run a long operation and report progress. */
  task<T>(name: string, run: (handle: TaskHandle) => Promise<T>): Promise<T>

  /** Output sink. */
  readonly out: CommandOutput
}

/**
 * Per-flag declarations for {@link CommandCliBinding}.
 */
export interface CommandCliFlag {
  /** Single-letter shortcut (without leading `-`). */
  alias?: string
  /** Help text shown by `--help`. */
  description?: string
  /**
   * Hint for the parser:
   * - `'string'` (default): consumes the next argv element as the value
   * - `'number'`: same, coerced via `Number(...)`
   * - `'boolean'`: presence sets `true`; `--no-<name>` sets `false`; consumes no value
   */
  type?: 'string' | 'number' | 'boolean'
  /**
   * Custom value parser. Mutually exclusive with `type`. Receives the raw
   * string captured from argv and returns the value passed to the schema.
   */
  parse?: (value: string) => unknown
}

/**
 * Per-positional declaration for {@link CommandCliBinding}. Strings map to
 * `{ name }`; supply an object to attach a custom parser.
 */
export type CommandCliPositional<I> =
  | (keyof I & string)
  | {
    name: keyof I & string
    parse?: (value: string) => unknown
  }

/**
 * Declares how a command's input fields map to CLI arguments.
 *
 * Positionals are matched by order; everything else can be passed as
 * `--field-name` (or `-alias`).
 */
export interface CommandCliBinding<I> {
  /** CLI command name. Defaults to the command id with `.` → space. */
  name?: string
  /** Alternative names. */
  aliases?: string[]
  /** Input field names, in order, populated from positional arguments. */
  positionals?: ReadonlyArray<CommandCliPositional<I>>
  /** Per-flag overrides keyed by input field name. */
  flags?: Partial<Record<keyof I & string, CommandCliFlag>>
}

/**
 * UI hints for the spotlight palette.
 */
export interface CommandUiBinding {
  icon?: string
  /** Default keybinding (display only — actual binding lives in renderer). */
  keybinding?: string
}

/**
 * Full command definition. Created with {@link defineCommand}.
 */
export interface Command<I = unknown, O = unknown> {
  /** Unique id, dot-separated (e.g. `instance.launch`). */
  readonly id: string
  /** Short label shown in the palette. */
  readonly title: string
  /** Optional longer description. */
  readonly description?: string
  /** Grouping. */
  readonly category: CommandCategory
  /** Zod schema validating raw input before the handler is called. */
  readonly input: z.ZodType<I, any>
  /** CLI binding — omit to make the command palette-only. */
  readonly cli?: CommandCliBinding<I>
  /** Renderer-only binding. */
  readonly ui?: CommandUiBinding
  /**
   * The handler. Must be deterministic given `(input, ctx)` and must perform
   * all side effects through `ctx`.
   */
  handler(input: I, ctx: CommandContext): Promise<O>
}

/**
 * Matches a {@link Task} produced by `ctx.task(...)` for telemetry/progress.
 */
export type CommandTask = Task
