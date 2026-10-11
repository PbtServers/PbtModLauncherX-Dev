import { EventEmitter } from 'events'
import { runInNewContext } from 'vm'
import { expect, test, vi } from 'vitest'
import { OLLAMA_SUPERVISOR } from './ollamaSupervisor'

function fixture(denied: boolean) {
  const engine = Object.assign(new EventEmitter(), { pid: 12345, exitCode: null, signalCode: null, stderr: new EventEmitter(), kill: vi.fn() })
  const stdin = Object.assign(new EventEmitter(), { resume: vi.fn() })
  const process = Object.assign(new EventEmitter(), { platform: 'win32', argv: ['node', 'verified/ollama.exe'], env: { SystemRoot: 'C:/Windows' }, cwd: () => 'private/data', stdin, stdout: { write: vi.fn() }, stderr: { write: vi.fn() }, exit: vi.fn() })
  const spawn = vi.fn((_path: string, _args: string[], _options: { shell: boolean }) => engine)
  const execFile = vi.fn((_path: string, _args: string[], _options: unknown, callback: (error: Error | null) => void) => callback(denied ? new Error('Access denied') : null))
  runInNewContext(OLLAMA_SUPERVISOR, { process, require: (name: string) => name === 'node:child_process' ? { spawn, execFile } : { join: (...parts: string[]) => parts.join('/') }, setTimeout })
  return { engine, process, spawn, execFile, stdin }
}

test('supervisor uses fixed serve arguments and stops only its owned PID tree on parent EOF', () => {
  const f = fixture(false); f.stdin.emit('end')
  expect(f.spawn.mock.calls[0][1]).toEqual(['serve'])
  expect(f.spawn.mock.calls[0][2].shell).toBe(false)
  expect(f.execFile.mock.calls[0][1]).toEqual(['/PID', '12345', '/T', '/F'])
  expect(f.process.exit).toHaveBeenCalledWith(0)
})

test('denied tree cleanup reports failure even after best effort termination of its own engine', () => {
  const f = fixture(true); f.stdin.emit('end')
  expect(f.engine.kill).toHaveBeenCalledOnce()
  expect(f.process.exit).toHaveBeenCalledWith(1)
})
