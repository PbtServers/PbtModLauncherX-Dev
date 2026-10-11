import { describe, test, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import { defineCommand, CommandRegistry } from '@xmcl/runtime-api'
import { runCli } from './cliDriver'
import { BackendCommandHost } from './BackendCommandHost'

function makeHost(commandHandler: (input: any) => any) {
  const registry = new CommandRegistry()
  registry.register(defineCommand({
    id: 'instance.launch',
    title: 'Launch',
    category: 'instance',
    input: z.object({
      instance: z.string(),
      user: z.string().optional(),
      modCount: z.number().optional(),
      dry: z.boolean().optional(),
    }),
    cli: {
      name: 'launch',
      positionals: ['instance'],
      flags: {
        user: { alias: 'u' },
        modCount: { type: 'number' },
        dry: { type: 'boolean' },
      },
    },
    handler: async (input) => commandHandler(input),
  }))

  const host = {
    registry,
    app: { version: '9.9.9' } as any,
    serviceLocator: () => undefined,
    bridge: {} as any,
    defaultOut: { log: () => {}, json: () => {}, table: () => {} },
    resolveService: vi.fn(),
    createContext: vi.fn(),
    dispatch: vi.fn(async (id, input) => registry.dispatch(id, input, {} as any)),
  } as unknown as BackendCommandHost
  return host
}

const stdoutWrites: string[] = []
const stderrWrites: string[] = []
beforeEach(() => {
  stdoutWrites.length = 0
  stderrWrites.length = 0
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk: any) => {
    stdoutWrites.push(typeof chunk === 'string' ? chunk : chunk.toString())
    return true
  })
  vi.spyOn(process.stderr, 'write').mockImplementation((chunk: any) => {
    stderrWrites.push(typeof chunk === 'string' ? chunk : chunk.toString())
    return true
  })
})

describe('runCli', () => {
  test('returns handled=false when argv has no command', async () => {
    const host = makeHost(() => undefined)
    const r = await runCli(host, { argv: ['/bin/xmcl'] })
    expect(r.handled).toBe(false)
    expect(r.exitCode).toBe(0)
  })

  test('--help prints top-level help and exits 0', async () => {
    const host = makeHost(() => undefined)
    const r = await runCli(host, { argv: ['xmcl', '--help'] })
    expect(r).toMatchObject({ handled: true, exitCode: 0 })
    expect(stdoutWrites.join('')).toContain('launch')
  })

  test('--version prints app.version and exits 0', async () => {
    const host = makeHost(() => undefined)
    const r = await runCli(host, { argv: ['xmcl', '--version'] })
    expect(r.exitCode).toBe(0)
    expect(stdoutWrites.join('')).toContain('9.9.9')
  })

  test('command with -h prints command help', async () => {
    const host = makeHost(() => undefined)
    const r = await runCli(host, { argv: ['xmcl', 'launch', '-h'] })
    expect(r).toMatchObject({ handled: true, exitCode: 0 })
    expect(stdoutWrites.join('')).toContain('--user')
  })

  test('dispatches a parsed command to the host', async () => {
    const handler = vi.fn(() => 1234)
    const host = makeHost(handler)
    const r = await runCli(host, { argv: ['xmcl', 'launch', '/inst/foo', '--user', 'u1'] })
    expect(r.exitCode).toBe(0)
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ instance: '/inst/foo', user: 'u1' }))
  })

  test('enrichInput is applied before dispatch', async () => {
    const handler = vi.fn(() => undefined)
    const host = makeHost(handler)
    await runCli(host, {
      argv: ['xmcl', 'launch', '/inst/foo'],
      enrichInput: async (id, input) => {
        expect(id).toBe('instance.launch')
        return { ...input, modCount: 42 }
      },
    })
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ modCount: 42 }))
  })

  test('schema validation error returns exit 2 and human error', async () => {
    const host = makeHost(() => undefined)
    const r = await runCli(host, { argv: ['xmcl', 'launch', '/inst/foo', '--mod-count', 'NaN'] })
    expect(r.exitCode).toBe(2)
    expect(stderrWrites.join('')).toContain('mod')
  })

  test('handler throwing returns exit 1', async () => {
    const host = makeHost(() => { throw new Error('boom') })
    const r = await runCli(host, { argv: ['xmcl', 'launch', '/inst/foo'] })
    expect(r.exitCode).toBe(1)
    expect(stderrWrites.join('')).toContain('boom')
  })

  test('--json error envelope', async () => {
    const host = makeHost(() => { throw new Error('boom') })
    await runCli(host, { argv: ['xmcl', '--json', 'launch', '/inst/foo'] })
    const out = stdoutWrites.join('')
    expect(out).toContain('"ok":false')
    expect(out).toContain('"command":"instance.launch"')
    expect(out).toContain('boom')
  })

  test('parse errors (e.g. unknown flag) return exit 2', async () => {
    const host = makeHost(() => undefined)
    const r = await runCli(host, { argv: ['xmcl', 'launch', '/inst/foo', '-z', 'x'] })
    expect(r.exitCode).toBe(2)
  })
})
