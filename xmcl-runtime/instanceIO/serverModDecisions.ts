import { lstat, open, rename, rm, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID, createHash } from 'crypto'
import type { ServerModOverride, ServerModProviderEvidence } from '@xmcl/runtime-api'
import { readSafeServerFile, requireSafeServerPath } from './serverExportFiles'

const fileName = '.pbt-server-mod-decisions.json'
interface Entry { override?: ServerModOverride; provider?: ServerModProviderEvidence }
interface Document { schema: 1; entries: Record<string, Entry> }
const queues = new Map<string, Promise<unknown>>()
export function serverModDecisionKey(minecraft: string, loader: string, version: string, sha256: string) {
  if (![minecraft, loader, version].every(value => /^[A-Za-z0-9._+-]*$/.test(value)) || !/^[a-f0-9]{64}$/i.test(sha256)) throw new Error('invalidSelection')
  return `${minecraft}|${loader}|${version}|${sha256}`
}
export function validateServerModOverride(value: ServerModOverride) {
  if (!value || typeof value !== 'object' || Object.keys(value).some(key => !['type', 'server'].includes(key)) || value.type !== undefined && !['client', 'server', 'both', 'unknown'].includes(value.type) || value.server !== undefined && !['required', 'recommended', 'no', 'unknown'].includes(value.server)) throw new Error('invalidSelection')
}
export class ServerModDecisionStore {
  constructor(private readonly directory?: () => string) {}
  private location(instanceRoot: string) {
    const root = this.directory?.() ?? instanceRoot
    const name = this.directory ? `${createHash('sha256').update(instanceRoot).digest('hex')}.json` : fileName
    return { root, name }
  }
  async read(root: string): Promise<Document> {
    const location = this.location(root)
    try {
      const document = JSON.parse((await readSafeServerFile(location.root, location.name, 2 * 1024 ** 2)).toString('utf8'))
      if (document.schema !== 1 || !document.entries || typeof document.entries !== 'object' || Array.isArray(document.entries)) throw new Error('invalidSelection')
      for (const entry of Object.values(document.entries) as Entry[]) {
        if (!entry || typeof entry !== 'object') throw new Error('invalidSelection')
        if (entry.override) validateServerModOverride(entry.override)
        const provider = entry.provider
        if (provider && (!Array.isArray(provider.evidence) || provider.side !== undefined && !['client', 'server', 'both'].includes(provider.side) || provider.necessity !== undefined && !['required', 'recommended', 'no', 'unknown'].includes(provider.necessity) || provider.compatible !== undefined && typeof provider.compatible !== 'boolean' || [provider.evidence, provider.required ?? [], provider.provided ?? []].some(values => !Array.isArray(values) || values.length > 512 || values.some(value => typeof value !== 'string' || value.length > 512)))) throw new Error('invalidSelection')
      }
      return document
    } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { schema: 1, entries: {} }; throw error }
  }
  async update(root: string, changes: Record<string, Entry>) {
    const location = this.location(root)
    const queueKey = join(location.root, location.name)
    const previous = queues.get(queueKey) ?? Promise.resolve()
    const operation = previous.catch(() => {}).then(async () => {
      const document = await this.read(root)
      for (const [key, entry] of Object.entries(changes)) document.entries[key] = { ...document.entries[key], ...entry }
      if (Object.keys(document.entries).length > 4096) throw new Error('tooManyFiles')
      const data = JSON.stringify(document, null, 2)
      if (Buffer.byteLength(data) > 2 * 1024 ** 2) throw new Error('tooLarge')
      const temporary = `${location.name}.${randomUUID()}.tmp`
      let created = false
      try {
        if (this.directory) await mkdir(location.root, { recursive: true })
        if ((await lstat(location.root)).isSymbolicLink()) throw new Error('symlink')
        const handle = await open(join(location.root, temporary), 'wx', 0o600)
        created = true
        try { await handle.writeFile(data); await handle.sync() } finally { await handle.close() }
        await requireSafeServerPath(location.root, temporary)
        try { await requireSafeServerPath(location.root, location.name) } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
        await rename(join(location.root, temporary), join(location.root, location.name))
      } finally { if (created) await rm(join(location.root, temporary), { force: true }) }
    })
    queues.set(queueKey, operation)
    try { await operation } finally { if (queues.get(queueKey) === operation) queues.delete(queueKey) }
  }
}
