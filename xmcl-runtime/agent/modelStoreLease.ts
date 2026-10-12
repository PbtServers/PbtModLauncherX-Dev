import { lstat, open, readFile, rename, unlink, writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export const managedLeaseOwnerPath = (models: string, nonce: string) => join(models, `.pbtadmin-engine.owner-${nonce}.json`)

export async function writeManagedLeaseOwner(models: string, owner: { pid: number; nonce: string; supervisorPid: number; enginePid: number }) {
  const temporary = join(models, `.pbtadmin-owner-${randomUUID()}.tmp`)
  try {
    await writeFile(temporary, JSON.stringify(owner), { flag: 'wx', mode: 0o600 })
    await rename(temporary, managedLeaseOwnerPath(models, owner.nonce))
  } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error }) }
}

function isAlive(pid: number) {
  try { process.kill(pid, 0); return true } catch (error) { return (error as NodeJS.ErrnoException).code !== 'ESRCH' }
}

/** A forced Windows exit may kill the supervisor too. Reclaim only a fully
 * attributed lease whose launcher, supervisor and engine have all exited.
 * Legacy or incomplete records remain protected for explicit recovery. */
export async function recoverInactiveManagedLease(models: string, alive = isAlive) {
  const path = join(models, '.pbtadmin-engine.lock')
  try {
    const info = await lstat(path)
    if (!info.isFile() || info.isSymbolicLink()) return false
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
  const recoveryPath = join(models, '.pbtadmin-recovery.lock')
  const recovery = await open(recoveryPath, 'wx', 0o600).catch(() => { throw new Error('ollama_store_locked_or_readonly') })
  try {
    let lease: { pid: number; nonce: string }
    let owner: { pid: number; nonce: string; supervisorPid: number; enginePid: number }
    try {
      lease = JSON.parse(await readFile(path, 'utf8'))
      if (!/^[a-f0-9-]{36}$/.test(lease.nonce || '')) return false
      owner = JSON.parse(await readFile(managedLeaseOwnerPath(models, lease.nonce), 'utf8'))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT' || error instanceof SyntaxError) return false
      throw error
    }
    const pids = [owner.pid, owner.supervisorPid, owner.enginePid]
    if (owner.nonce !== lease.nonce || owner.pid !== lease.pid || pids.some(pid => !Number.isSafeInteger(pid) || pid <= 0 || alive(pid))) return false
    await rename(path, join(models, `.pbtadmin-engine.lock.stale-${lease.nonce}.json`))
    return true
  } finally { await recovery.close(); await unlink(recoveryPath) }
}
