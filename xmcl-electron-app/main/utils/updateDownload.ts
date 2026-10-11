import { createHash, randomUUID } from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import { lstat, rename, unlink } from 'node:fs/promises'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { fetchUpdate } from './updatePolicy'

export async function hashUpdate(path: string, algorithm: 'sha256' | 'sha512' = 'sha256', encoding: 'hex' | 'base64' = 'hex', signal?: AbortSignal) {
  const info = await lstat(path)
  if (!info.isFile() || info.isSymbolicLink()) throw new Error('Invalid pending update file')
  const hash = createHash(algorithm)
  for await (const chunk of createReadStream(path, { signal })) hash.update(chunk)
  return hash.digest(encoding)
}

export async function downloadVerifiedUpdate(
  fetcher: typeof fetch, asset: { url: string; size: number }, destination: string,
  signal?: AbortSignal, progress?: (bytes: number) => void,
) {
  signal?.throwIfAborted()
  const reference = await fetchUpdate(fetcher, `${asset.url}.sha256`, signal)
  // Bound checksum input even if the server omits Content-Length.
  const reader = reference.body?.getReader()
  if (!reader) throw new Error('Missing update checksum')
  let text = ''
  try {
    while (true) {
      const result = await reader.read()
      if (result.done) break
      text += Buffer.from(result.value).toString('ascii')
      if (text.length > 128) throw new Error('Invalid update checksum size')
    }
  } finally {
    await reader.cancel()
  }
  const expected = text.trim().toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(expected)) throw new Error('Invalid update SHA-256 reference')
  const temporary = `${destination}.${randomUUID()}.partial`
  let bytes = 0
  const hash = createHash('sha256')
  try {
    const response = await fetchUpdate(fetcher, asset.url, signal)
    if (!response.body) throw new Error('Empty update download')
    const meter = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        bytes += chunk.length
        if (bytes > asset.size) return callback(new Error('Update size exceeds manifest'))
        hash.update(chunk)
        progress?.(bytes)
        callback(null, chunk)
      },
    })
    await pipeline(Readable.fromWeb(response.body as never), meter, createWriteStream(temporary, { flags: 'wx' }), { signal })
    signal?.throwIfAborted()
    if (bytes !== asset.size || hash.digest('hex') !== expected) throw new Error('Update integrity check failed')
    await rename(temporary, destination)
    return expected
  } finally {
    await unlink(temporary).catch(() => {})
  }
}

/** Same-directory publication avoids EXDEV and keeps the working application
 * intact when staging fails. This function never touches user data. */
export async function replaceVerifiedAsar(pending: string, active: string, expected: string) {
  if (await hashUpdate(pending) !== expected) throw new Error('Pending update has changed')
  const stage = `${active}.${randomUUID()}.partial`
  const backup = `${active}.${randomUUID()}.backup`
  const current = await lstat(active)
  if (!current.isFile() || current.isSymbolicLink()) throw new Error('Invalid active application file')
  let backedUp = false
  try {
    await pipeline(createReadStream(pending), createWriteStream(stage, { flags: 'wx', mode: current.mode }))
    if (await hashUpdate(stage) !== expected) throw new Error('Staged update integrity check failed')
    await rename(active, backup)
    backedUp = true
    try {
      await rename(stage, active)
    } catch (error) {
      await rename(backup, active)
      backedUp = false
      throw error
    }
    // Keep the backup until the next successful installed start / manual cleanup.
    return backup
  } finally {
    await unlink(stage).catch(() => {})
    // Never delete the only known working backup on a failed replacement.
    if (!backedUp) await unlink(backup).catch(() => {})
  }
}
