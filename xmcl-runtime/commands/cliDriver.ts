import {
  CommandNotFoundError,
  CommandRegistry,
  ParsedCli,
  formatCommandHelp,
  formatHelp,
  parseCli,
} from '@xmcl/runtime-api'
import { z } from 'zod'
import { Logger } from '../infra'
import { BackendCommandHost, createStdoutOutput } from './BackendCommandHost'

/** Result of {@link runCli}. The driver leaves process exit decisions to the caller. */
export interface CliRunResult {
  /** True when argv contained a command (or help/version) and the driver handled it. */
  handled: boolean
  /** Exit code suitable for `app.exit(...)`. 0 = success, non-zero = failure. */
  exitCode: number
  /** Resolved parse output (useful for tests / observability). */
  parsed: ParsedCli
}

export interface RunCliOptions {
  /** Pre-parsed argv. Defaults to `process.argv`. */
  argv?: ReadonlyArray<string>
  /** Override the registry (defaults to host's). */
  registry?: CommandRegistry
  /** Program name used in usage text. Defaults to 'xmcl'. */
  programName?: string
  /** Override the logger. */
  logger?: Logger
  /**
   * Optional hook called after parsing succeeds and before dispatch. Lets
   * the host fill in fields that require host-specific knowledge (e.g.
   * counting mods on disk) without leaking that into the pure command.
   */
  enrichInput?: (commandId: string, input: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>
}

/**
 * Drive a single CLI invocation: parse argv, look up the command, execute
 * it through the {@link BackendCommandHost} and emit output. Errors are
 * caught and rendered in the format requested by `--json`.
 */
export async function runCli(host: BackendCommandHost, opts: RunCliOptions = {}): Promise<CliRunResult> {
  const argv = opts.argv ?? process.argv
  const registry = opts.registry ?? host.registry
  const programName = opts.programName ?? 'xmcl'
  const logger = opts.logger
  const parsed = parseCli(argv, registry)

  const out = createStdoutOutput(parsed.globals.json)

  switch (parsed.kind) {
    case 'none':
      return { handled: false, exitCode: 0, parsed }

    case 'help':
      out.log(formatHelp(registry, { programName }))
      return { handled: true, exitCode: 0, parsed }

    case 'help-command': {
      const cmd = registry.get(parsed.commandId)
      if (!cmd) {
        out.log(`Unknown command '${parsed.commandId}'`)
        return { handled: true, exitCode: 1, parsed }
      }
      out.log(formatCommandHelp(cmd, { programName }))
      return { handled: true, exitCode: 0, parsed }
    }

    case 'version':
      out.log(host.app.version)
      return { handled: true, exitCode: 0, parsed }

    case 'error':
      printError(out, parsed.commandId, parsed.message, parsed.globals.json)
      return { handled: true, exitCode: 2, parsed }

    case 'command':
      try {
        const input = opts.enrichInput
          ? await opts.enrichInput(parsed.commandId, { ...parsed.input })
          : parsed.input
        await host.dispatch(parsed.commandId, input, {
          mode: 'cli',
          out,
        })
        return { handled: true, exitCode: 0, parsed }
      } catch (e) {
        const code = e instanceof CommandNotFoundError ? 2 : e instanceof z.ZodError ? 2 : 1
        printError(out, parsed.commandId, e, parsed.globals.json)
        logger?.error(e as Error)
        return { handled: true, exitCode: code, parsed }
      }
  }
}

function printError(out: ReturnType<typeof createStdoutOutput>, commandId: string | undefined, e: unknown, json: boolean) {
  if (json) {
    const error = e instanceof z.ZodError
      ? { code: 'ValidationError', issues: e.issues }
      : e instanceof Error
        ? { code: e.name, message: e.message }
        : { code: 'UnknownError', message: String(e) }
    out.json({ ok: false, command: commandId, error })
    return
  }
  if (e instanceof z.ZodError) {
    process.stderr.write(`Invalid input for '${commandId}':\n`)
    for (const issue of e.issues) {
      process.stderr.write(`  ${issue.path.join('.') || '(root)'}: ${issue.message}\n`)
    }
  } else if (e instanceof Error) {
    process.stderr.write(`${e.name}: ${e.message}\n`)
  } else {
    process.stderr.write(`${String(e)}\n`)
  }
}

/**
 * Quickly inspect argv to decide whether the launcher should suppress its
 * GUI. The check is conservative — it only returns `true` when a known
 * command name appears in argv. Used by the host to defer window creation.
 */
export function shouldDeferWindow(argv: ReadonlyArray<string>, registry: CommandRegistry): boolean {
  const parsed = parseCli(argv, registry)
  if (parsed.globals.noWindow) return true
  return parsed.kind === 'command' || parsed.kind === 'help' || parsed.kind === 'help-command' || parsed.kind === 'version'
}
