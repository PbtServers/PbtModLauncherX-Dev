import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadVerifiedUpdate, replaceVerifiedAsar } from './updateDownload'
import { releaseAssetURL } from './updatePolicy'

let directory: string
beforeEach(async () => {
  // Each test owns a unique directory under the ignored temp tree.
  const workspaceTemp = join(import.meta.dirname, '../../..', 'temp')
  await mkdir(workspaceTemp, { recursive: true })
  directory = await mkdtemp(join(workspaceTemp, 'phase12-test-'))
})
afterEach(async () => { if (directory) await rm(directory, { recursive: true, force: true }) })
const bytes = Buffer.from('verified synthetic application')
const hash = createHash('sha256').update(bytes).digest('hex')
const asset = { url: releaseAssetURL('1.0.7', 'app-1.0.7-linux.asar'), size: bytes.length }
const fetcher = (body: Buffer = bytes, digest = hash) => vi.fn<typeof fetch>().mockImplementation(async url =>
  new Response(String(url).endsWith('.sha256') ? digest : new Uint8Array(body)))

describe('verified update publication', () => {
  it('downloads and verifies synthetic bytes over a real loopback HTTP server, without executing them', async () => {
    const requests: string[] = []
    const server = createServer((request, response) => {
      requests.push(request.url!)
      response.end(request.url === '/hash' ? hash : bytes)
    })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    try {
      const address = server.address() as { port: number }
      // Map only the fixture's approved HTTPS asset URL to the isolated server.
      // Production policy remains HTTPS-only and has no localhost exception.
      const transport: typeof fetch = (input, init) => fetch(`http://127.0.0.1:${address.port}/${String(input).endsWith('.sha256') ? 'hash' : 'asset'}`, init)
      const path = join(directory, 'pending_update')
      await downloadVerifiedUpdate(transport, asset, path)
      expect(await readFile(path)).toEqual(bytes)
      expect(requests).toEqual(['/hash', '/asset'])
    } finally {
      server.closeAllConnections()
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    }
  })
  it('publishes exact bytes only after verifying the reference and reports progress', async () => {
    const progress = vi.fn()
    const path = join(directory, 'pending_update')
    expect(await downloadVerifiedUpdate(fetcher(), asset, path, undefined, progress)).toBe(hash)
    expect(await readFile(path)).toEqual(bytes)
    expect(progress).toHaveBeenLastCalledWith(bytes.length)
    expect(await readdir(directory)).toEqual(['pending_update'])
  })
  it.each(['wrong', '0'.repeat(64), 'x'.repeat(129)])('rejects invalid/mismatched checksum %s without replacing a working file', async digest => {
    const path = join(directory, 'pending_update')
    await writeFile(path, 'previous')
    await expect(downloadVerifiedUpdate(fetcher(bytes, digest), asset, path)).rejects.toThrow()
    expect(await readFile(path, 'utf8')).toBe('previous')
    expect(await readdir(directory)).toEqual(['pending_update'])
  })
  it.each([Buffer.from('short'), Buffer.concat([bytes, Buffer.from('extra')])])('rejects wrong download size', async body => {
    await expect(downloadVerifiedUpdate(fetcher(body), asset, join(directory, 'pending_update'))).rejects.toThrow()
    expect(await readdir(directory)).toEqual([])
  })
  it('rejects an interrupted stream and cleans only its own partial file', async () => {
    const f = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(hash)).mockResolvedValueOnce(new Response(new ReadableStream({
      start(controller) { controller.enqueue(new Uint8Array(bytes.subarray(0, 3))); controller.error(new Error('Interrupted')) },
    })))
    await expect(downloadVerifiedUpdate(f, asset, join(directory, 'pending_update'))).rejects.toThrow('Interrupted')
    expect(await readdir(directory)).toEqual([])
  })
  it('cancels an active download and permits a clean retry', async () => {
    const controller = new AbortController()
    const path = join(directory, 'pending_update')
    await expect(downloadVerifiedUpdate(fetcher(), asset, path, controller.signal, () => controller.abort())).rejects.toThrow()
    expect(await readdir(directory)).toEqual([])
    await downloadVerifiedUpdate(fetcher(), asset, path)
    expect(await readFile(path)).toEqual(bytes)
  })
  it('preserves Unicode paths and user data during a staged replacement and keeps a working backup', async () => {
    const home = join(directory, 'datos con espacios à 日本語')
    await mkdir(home)
    const active = join(home, 'app.asar'), pending = join(directory, 'pending_update')
    const settings = JSON.stringify({ locale: 'ca', root: 'G:\\Minecraft personal', agentModel: 'local', classifications: { abc: 'required' } })
    await writeFile(join(home, 'setting.json'), settings)
    await writeFile(active, 'working 1.0.6')
    await writeFile(pending, bytes)
    const backup = await replaceVerifiedAsar(pending, active, hash)
    expect(await readFile(active)).toEqual(bytes)
    expect(await readFile(backup, 'utf8')).toBe('working 1.0.6')
    expect(await readFile(join(home, 'setting.json'), 'utf8')).toBe(settings)
  })
  it('rejects modification after download before touching the installed app', async () => {
    const active = join(directory, 'app.asar'), pending = join(directory, 'pending_update')
    await writeFile(active, 'working'); await writeFile(pending, 'tampered')
    await expect(replaceVerifiedAsar(pending, active, hash)).rejects.toThrow('changed')
    expect(await readFile(active, 'utf8')).toBe('working')
  })
  it('reports a missing destination parent without damaging another file', async () => {
    await writeFile(join(directory, 'working'), 'safe')
    await expect(downloadVerifiedUpdate(fetcher(), asset, join(directory, 'missing', 'pending'))).rejects.toThrow()
    expect(await readFile(join(directory, 'working'), 'utf8')).toBe('safe')
  })
})
