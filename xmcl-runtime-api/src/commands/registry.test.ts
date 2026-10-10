/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, test, expect, vi } from 'vitest'
import { z } from 'zod'
import {
  CommandNotFoundError,
  CommandRegistry,
  defineCommand,
} from './registry'
import type { CommandContext } from './types'

function makeCtx(overrides: Partial<CommandContext> = {}): CommandContext {
  const ctx: CommandContext = {
    mode: 'cli',
    signal: new AbortController().signal,
    call: vi.fn() as any,
    state: vi.fn() as any,
    resolveInstance: vi.fn() as any,
    resolveUser: vi.fn() as any,
    pickInstance: vi.fn() as any,
    pickUser: vi.fn() as any,
    prompt: vi.fn() as any,
    confirm: vi.fn() as any,
    select: vi.fn() as any,
    task: ((_n: string, run: any) => run({ update: () => {}, child: () => ({} as any) })) as any,
    out: { log: () => {}, json: () => {}, table: () => {} },
    ...overrides,
  }
  return ctx
}

describe('CommandRegistry', () => {
  test('register + dispatch invokes the handler with parsed input', async () => {
    const cmd = defineCommand({
      id: 'test.echo',
      title: 'Echo',
      category: 'system',
      input: z.object({ name: z.string() }),
      async handler(input) {
        return `hello ${input.name}`
      },
    })
    const reg = new CommandRegistry().register(cmd)
    const result = await reg.dispatch<string>('test.echo', { name: 'world' }, makeCtx())
    expect(result).toBe('hello world')
  })

  test('rejects duplicate ids', () => {
    const reg = new CommandRegistry()
    const cmd = defineCommand({
      id: 'dup',
      title: 't',
      category: 'system',
      input: z.object({}),
      async handler() { return undefined },
    })
    reg.register(cmd)
    expect(() => reg.register(cmd)).toThrow(/Duplicate/)
  })

  test('throws CommandNotFoundError when id is unknown', async () => {
    const reg = new CommandRegistry()
    await expect(reg.dispatch('nope', {}, makeCtx())).rejects.toBeInstanceOf(CommandNotFoundError)
  })

  test('schema validation errors propagate', async () => {
    const cmd = defineCommand({
      id: 'test.strict',
      title: 't',
      category: 'system',
      input: z.object({ n: z.number() }),
      async handler() { return undefined },
    })
    const reg = new CommandRegistry().register(cmd)
    await expect(reg.dispatch('test.strict', { n: 'oops' }, makeCtx())).rejects.toThrow()
  })

  test('list filters by category and cli binding', () => {
    const a = defineCommand({
      id: 'a.x', title: 'a', category: 'instance',
      input: z.object({}),
      cli: { name: 'ax' },
      async handler() { return undefined },
    })
    const b = defineCommand({
      id: 'b.x', title: 'b', category: 'user',
      input: z.object({}),
      async handler() { return undefined },
    })
    const reg = new CommandRegistry().registerAll([a, b])
    expect(reg.list({ category: 'instance' })).toEqual([a])
    expect(reg.list({ mode: 'cli' })).toEqual([a])
    expect(reg.list().length).toBe(2)
  })
})
