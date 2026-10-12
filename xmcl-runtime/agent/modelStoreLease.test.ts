import { mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { afterEach, expect, test } from 'vitest'
import { recoverInactiveManagedLease, writeManagedLeaseOwner } from './modelStoreLease'

const roots: string[] = []
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }) })
async function fixture() {
  const models = await mkdtemp(join(tmpdir(), 'pbt107 owned lease-')); roots.push(models)
  const owner = { pid: 111, supervisorPid: 222, enginePid: 333, nonce: randomUUID() }
  const lock = join(models, '.pbtadmin-engine.lock')
  await writeFile(lock, JSON.stringify({ pid: owner.pid, nonce: owner.nonce }))
  await writeManagedLeaseOwner(models, owner)
  await writeFile(join(models, 'retained-model'), 'unchanged')
  return { models, owner, lock }
}

test('archives an attributed inactive lease without deleting any model data', async () => {
  const f = await fixture()
  expect(await recoverInactiveManagedLease(f.models, () => false)).toBe(true)
  await expect(readFile(f.lock)).rejects.toMatchObject({ code: 'ENOENT' })
  expect(JSON.parse(await readFile(join(f.models, `.pbtadmin-engine.lock.stale-${f.owner.nonce}.json`), 'utf8')).nonce).toBe(f.owner.nonce)
  expect(await readFile(join(f.models, 'retained-model'), 'utf8')).toBe('unchanged')
})

test.each([111, 222, 333])('protects a lease when its owner process %s remains active', async alivePid => {
  const f = await fixture()
  expect(await recoverInactiveManagedLease(f.models, pid => pid === alivePid)).toBe(false)
  expect(JSON.parse(await readFile(f.lock, 'utf8')).nonce).toBe(f.owner.nonce)
})

test('does not reclaim legacy or incomplete ownership records', async () => {
  const f = await fixture()
  await writeFile(f.lock, JSON.stringify({ pid: 111 }))
  expect(await recoverInactiveManagedLease(f.models, () => false)).toBe(false)
  expect(JSON.parse(await readFile(f.lock, 'utf8'))).toEqual({ pid: 111 })
})
