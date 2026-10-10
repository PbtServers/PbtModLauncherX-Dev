import { z } from 'zod'
import type { MarketRef } from './types'

/**
 * Zod schema for {@link MarketRef}. Use this as a building block in command
 * input schemas.
 */
export const MarketRefSchema = z.discriminatedUnion('source', [
  z.object({
    source: z.literal('modrinth'),
    project: z.string().min(1),
    version: z.string().optional(),
  }),
  z.object({
    source: z.literal('curseforge'),
    project: z.number().int().positive(),
    file: z.number().int().positive().optional(),
  }),
  z.object({
    source: z.literal('file'),
    path: z.string().min(1),
  }),
  z.object({
    source: z.literal('url'),
    url: z.string().url(),
  }),
])

/**
 * Accepts a CLI string form OR a structured `MarketRef` object and returns
 * a normalized `MarketRef`. CLI forms:
 *
 * - `modrinth:<slug>[@<version>]`
 * - `curseforge:<projectId>[/<fileId>]`
 * - `https://...` / `http://...`
 * - any other string is treated as a file path
 *
 * Throws when a recognised prefix is followed by a malformed payload (e.g.
 * `curseforge:abc` — non-numeric id).
 */
export function parseMarketRef(value: string | MarketRef): MarketRef {
  if (typeof value !== 'string') return MarketRefSchema.parse(value)

  const trimmed = value.trim()
  if (!trimmed) throw new Error('Empty market reference')

  if (trimmed.startsWith('modrinth:')) {
    const rest = trimmed.slice('modrinth:'.length)
    const at = rest.indexOf('@')
    if (at === -1) {
      if (!rest) throw new Error('modrinth: reference missing project slug')
      return { source: 'modrinth', project: rest }
    }
    const project = rest.slice(0, at)
    const version = rest.slice(at + 1)
    if (!project) throw new Error('modrinth: reference missing project slug')
    if (!version) throw new Error('modrinth: reference has empty version after @')
    return { source: 'modrinth', project, version }
  }

  if (trimmed.startsWith('curseforge:')) {
    const rest = trimmed.slice('curseforge:'.length)
    const slash = rest.indexOf('/')
    const projectStr = slash === -1 ? rest : rest.slice(0, slash)
    const fileStr = slash === -1 ? '' : rest.slice(slash + 1)
    const project = Number(projectStr)
    if (!Number.isInteger(project) || project <= 0) {
      throw new Error(`curseforge: project id must be a positive integer, got '${projectStr}'`)
    }
    if (!fileStr) return { source: 'curseforge', project }
    const file = Number(fileStr)
    if (!Number.isInteger(file) || file <= 0) {
      throw new Error(`curseforge: file id must be a positive integer, got '${fileStr}'`)
    }
    return { source: 'curseforge', project, file }
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return { source: 'url', url: trimmed }
  }

  return { source: 'file', path: trimmed }
}

/**
 * Inverse of {@link parseMarketRef} — produces a canonical CLI string
 * representation of a `MarketRef`. Useful for logging and `--json` echoes.
 */
export function stringifyMarketRef(ref: MarketRef): string {
  switch (ref.source) {
    case 'modrinth':
      return ref.version ? `modrinth:${ref.project}@${ref.version}` : `modrinth:${ref.project}`
    case 'curseforge':
      return ref.file ? `curseforge:${ref.project}/${ref.file}` : `curseforge:${ref.project}`
    case 'url':
      return ref.url
    case 'file':
      return ref.path
  }
}
