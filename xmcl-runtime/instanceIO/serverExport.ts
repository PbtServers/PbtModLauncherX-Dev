import type { ResourceMetadata } from '@xmcl/resource'
import type { ServerExportAnalysisOptions, ServerExportLoader, ServerExportMod, ServerExportPlan, ServerExportRequest, ServerExportResult, ServerInstallRecipe, ServerModProviderEvidence } from '@xmcl/runtime-api'
import { serverExportRequiredOmissions } from '@xmcl/runtime-api'
import { createHash, randomUUID } from 'crypto'
import { createReadStream } from 'fs'
import { link, lstat, mkdir, mkdtemp, readdir, realpath, rm, writeFile } from 'fs/promises'
import { basename, dirname, isAbsolute, join, resolve } from 'path'
import { tmpdir } from 'os'
import { ZipFile } from 'yazl'
import { writeZipFile } from '../util/zip'
import { classifyServerMod, incompatibleServerDependencies, validateServerSelection } from './serverExportAnalysis'
import { isUnder, readSafeServerFile, safeServerArchivePath, scanServerTree } from './serverExportFiles'
import { generatedServerFiles, serverPackageGeneratedFiles } from './serverExportRecipe'
import { applyServerModOverride, classifyServerDependencyGraph, classifyServerNecessity } from './serverModClassification'
import { ServerModDecisionStore, serverModDecisionKey } from './serverModDecisions'

interface Runtime { minecraft: string; forge?: string; neoForged?: string; fabricLoader?: string; quiltLoader?: string; optifine?: string; liteloader?: string; labyMod?: string }
interface StoredPlan { root: string; runtime: string; plan: ServerExportPlan; expires: number }

export function serverLoader(runtime: Runtime): { loader: ServerExportLoader; version: string } {
  const loaders = ([['forge', runtime.forge], ['neoforge', runtime.neoForged], ['fabric', runtime.fabricLoader], ['quilt', runtime.quiltLoader]] as const).filter(entry => entry[1])
  if (loaders.length > 1 || runtime.liteloader || runtime.labyMod || runtime.optifine && !loaders.length) throw new Error('unsupportedLoader')
  return { loader: loaders[0]?.[0] ?? 'vanilla', version: loaders[0]?.[1] ?? '' }
}

/** Reuses the existing InstanceIO service and ZIP writer; no installation mutates the source. */
export class ServerExportController {
  private plans = new Map<string, StoredPlan>()
  private active = new Map<string, AbortController>()

  constructor(
    private readonly resolveRecipe: (minecraft: string, loader: ServerExportLoader, version: string) => Promise<ServerInstallRecipe>,
    private readonly modMetadata: (path: string, sha1: string, online: boolean, runtime: Runtime) => Promise<{ metadata: ResourceMetadata; provider?: ServerModProviderEvidence }>,
    private readonly decisions = new ServerModDecisionStore(),
  ) {}

  async analyze(options: ServerExportAnalysisOptions, runtime: Runtime, classificationOnly = false): Promise<ServerExportPlan> {
    const root = resolve(options.instancePath)
    if ((await lstat(root)).isSymbolicLink() || !isAbsolute(options.instancePath)) throw new Error('unsafePath')
    const realRoot = await realpath(root)
    const plan: ServerExportPlan = { id: randomUUID(), minecraft: runtime.minecraft, loader: 'vanilla', loaderVersion: '', recommendedMemoryMiB: 2048, files: [], mods: [], worlds: [], warnings: ['reviewLicenses', 'reviewPrivacy', 'dependencyRangesUnverified'], blockers: [], generatedFiles: generatedServerFiles }
    plan.locale = options.locale === 'ca' || options.locale === 'en' ? options.locale : 'es-ES'
    try {
      const detected = serverLoader(runtime)
      plan.loader = detected.loader
      plan.loaderVersion = detected.version
      if (!classificationOnly) plan.recipe = await this.resolveRecipe(runtime.minecraft, detected.loader, detected.version)
    } catch (e) { const reason = (e as Error).message; plan.blockers.push(['unsupportedLoader', 'unsupportedRecipe'].includes(reason) ? reason : 'metadataUnavailable') }
    const saves = join(root, 'saves')
    try {
      if ((await lstat(saves)).isSymbolicLink()) throw new Error('symlink')
      for (const entry of await readdir(saves, { withFileTypes: true })) {
        if (entry.isDirectory() && !entry.isSymbolicLink()) {
          try { await safeServerArchivePath(entry.name); if ((await lstat(join(saves, entry.name, 'level.dat'))).isFile()) plan.worlds.push(entry.name) } catch { /* not a portable world */ }
        }
      }
    } catch { /* worlds optional; no follow of links */ }
    await scanServerTree(root, 'mods', 'mods', plan.files)
    if (options.includeConfig) for (const path of ['config', 'defaultconfigs', 'kubejs', 'scripts']) await scanServerTree(root, path, path, plan.files)
    if (options.includeDatapacks) await scanServerTree(root, 'datapacks', 'world/datapacks', plan.files)
    for (const path of ['LICENSE', 'LICENSE.txt', 'NOTICE', 'NOTICE.txt']) await scanServerTree(root, path, `instance-attributions/${path}`, plan.files)
    if (options.world) {
      if (!plan.worlds.includes(options.world)) throw new Error('invalidWorld')
      await scanServerTree(root, `saves/${options.world}`, 'world', plan.files)
      plan.warnings.push('worldPrivacy', 'stopGameBeforeExport')
    }
    const mods = plan.files.filter(file => file.path.startsWith('mods/') && (file.path.endsWith('.jar') || classificationOnly && file.path.endsWith('.jar.disabled')))
    if (mods.length > 512) throw new Error('tooManyFiles')
    plan.files = plan.files.filter(file => !mods.includes(file))
    const onlineDeadline = Date.now() + 30_000
    const decisions = await this.decisions.read(root)
    const cacheUpdates: Record<string, { provider: ServerModProviderEvidence }> = {}
    let onlineQueries = 0
    for (const file of mods) {
      const mod: ServerExportMod = { ...file, ids: [], provided: [], version: '', required: [], side: 'unknown', evidence: [], selected: false }
      const decisionKey = file.sha256 ? serverModDecisionKey(runtime.minecraft, plan.loader, plan.loaderVersion, file.sha256) : ''
      let provider: ServerModProviderEvidence | undefined
      if (!file.excluded) {
        try {
          const data = await readSafeServerFile(root, file.path, 256 * 1024 ** 2)
          mod.sha1 = createHash('sha1').update(data).digest('hex')
          if (createHash('sha256').update(data).digest('hex') !== file.sha256) { mod.excluded = 'changedFiles'; throw new Error('changedFiles') }
          const online = options.onlineMetadata === true && onlineQueries++ < 32 && Date.now() < onlineDeadline
          // Parse the exact reviewed bytes, never reopen a mutable instance JAR
          // through an unguarded worker path while another process can replace it.
          const scratch = await mkdtemp(join(tmpdir(), 'pbt-server-analysis-'))
          let parsed
          try {
            const snapshot = join(scratch, basename(file.path))
            await writeFile(snapshot, data, { flag: 'wx' })
            parsed = await this.modMetadata(snapshot, createHash('sha1').update(data).digest('hex'), online, runtime)
          } finally { await rm(scratch, { recursive: true, force: true }) }
          provider = parsed.provider && (parsed.provider.compatible !== undefined || parsed.provider.side) ? parsed.provider : decisions.entries[decisionKey]?.provider ? { ...decisions.entries[decisionKey].provider, cached: true } : parsed.provider
          if (online && parsed.provider && (parsed.provider.compatible !== undefined || parsed.provider.side)) cacheUpdates[decisionKey] = { provider: parsed.provider }
          Object.assign(mod, classifyServerMod(parsed.metadata, plan.loader))
          if (provider) {
            // Contradictory descriptors stay unknown, never silently override evidence.
            if (provider.side && mod.side !== 'unknown' && mod.side !== 'client' && provider.side !== 'client' && mod.side !== provider.side) mod.evidence.push('analysis.contradictory')
            if (provider.side) mod.side = mod.side === 'client' || provider.side === 'client' ? 'client' : mod.side !== 'unknown' && mod.side !== provider.side ? 'unknown' : provider.side
            mod.evidence.push(...provider.evidence)
            if (provider.compatible === false) mod.incompatible = 'incompatibleVersion'
            mod.required.push(...provider.required ?? [])
            mod.provided.push(...provider.provided ?? [])
          }
          if (plan.loader === 'vanilla') mod.incompatible = 'incompatibleLoader'
          if (incompatibleServerDependencies([mod], new Set([mod.path]), plan.recipe ?? { minecraft: runtime.minecraft, loader: plan.loader, loaderVersion: plan.loaderVersion, java: 0 }).length) mod.incompatible = 'incompatibleVersion'
          mod.selected = !mod.incompatible && (mod.side === 'both' || mod.side === 'server')
          if (mod.side === 'client') mod.excluded = 'clientOnly'
          if (mod.incompatible) mod.excluded = mod.incompatible
        } catch { mod.evidence.push('metadata.unavailable'); mod.selected = false }
      }
      if (file.path.endsWith('.disabled')) { mod.excluded = 'disabledMod'; mod.selected = false }
      mod.classification = classifyServerNecessity(mod, provider)
      plan.mods.push(mod)
    }
    classifyServerDependencyGraph(plan.mods)
    for (const mod of plan.mods) {
      mod.classification!.originalServer = mod.classification!.server.value
      if (mod.sha256) applyServerModOverride(mod, decisions.entries[serverModDecisionKey(runtime.minecraft, plan.loader, plan.loaderVersion, mod.sha256)]?.override)
    }
    classifyServerDependencyGraph(plan.mods)
    if (Object.keys(cacheUpdates).length) await this.decisions.update(root, cacheUpdates).catch(() => plan.warnings.push('cacheUnavailable'))
    // Loose non-JAR files in mods/ are never automatically deployed.
    for (const file of plan.files.filter(file => file.path.startsWith('mods/'))) { file.selected = false; file.excluded ??= 'unsupportedFile' }
    const archiveNames = new Set<string>()
    for (const file of [...plan.files, ...plan.mods].filter(file => !file.excluded)) {
      const name = file.archivePath.toLowerCase()
      if (archiveNames.has(name) || generatedServerFiles.some(path => path.toLowerCase() === name)) plan.blockers.push('archiveCollision')
      archiveNames.add(name)
    }
    plan.recommendedMemoryMiB = plan.mods.filter(mod => mod.side !== 'client').length > 50 ? 6144 : plan.mods.length ? 4096 : 2048
    if (plan.recipe?.loader === 'quilt') plan.warnings.push('quiltManualInstall')
    for (const [id, stored] of this.plans) if (stored.expires < Date.now()) this.plans.delete(id)
    if (this.plans.size >= 8) this.plans.delete(this.plans.keys().next().value!)
    this.plans.set(plan.id, { root: realRoot, runtime: JSON.stringify(runtime), plan: structuredClone(plan), expires: Date.now() + 10 * 60_000 })
    return plan
  }

  cancel(id: string) { this.active.get(id)?.abort(); this.plans.delete(id) }

  async export(request: ServerExportRequest, runtime: Runtime): Promise<ServerExportResult> {
    if (request.confirmed !== true || request.rightsReviewed !== true) throw new Error('confirmationRequired')
    const stored = this.plans.get(request.planId)
    if (!stored || stored.expires < Date.now()) throw new Error('expiredPlan')
    if (stored.runtime !== JSON.stringify(runtime)) throw new Error('changedFiles')
    const selected = validateServerSelection(stored.plan, request.selectedPaths, request.unknownDecisions)
    if (!Number.isSafeInteger(request.memoryMiB) || request.memoryMiB < 512 || request.memoryMiB > 65536) throw new Error('invalidMemory')
    safeServerArchivePath(request.packageName)
    if (request.packageName.includes('/') || request.packageName.length > 100) throw new Error('unsafePath')
    if (!isAbsolute(request.destinationDirectory)) throw new Error('unsafePath')
    const destination = resolve(request.destinationDirectory)
    let ancestor = destination
    while (dirname(ancestor) !== ancestor) {
      if ((await lstat(ancestor)).isSymbolicLink()) throw new Error('symlink')
      ancestor = dirname(ancestor)
    }
    if (!(await lstat(destination)).isDirectory()) throw new Error('unsafePath')
    const realDestination = await realpath(destination)
    if (isUnder(stored.root, realDestination)) throw new Error('destinationInsideInstance')
    const output = join(realDestination, `${request.packageName}.zip`)
    try { await lstat(output); throw new Error('destinationExists') } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e }
    if (!this.plans.has(request.planId)) throw new Error('expiredPlan')
    this.plans.delete(request.planId)
    const controller = new AbortController()
    this.active.set(request.planId, controller)
    let staging = ''
    try {
      staging = await mkdtemp(join(realDestination, '.pbt-server-export-'))
      const zip = new ZipFile()
      const entries = [...stored.plan.files, ...stored.plan.mods].filter(file => selected.has(file.path))
      let totalBytes = 0
      for (const file of entries) {
        controller.signal.throwIfAborted()
        const data = await readSafeServerFile(stored.root, file.path, 256 * 1024 ** 2, controller.signal)
        if (createHash('sha256').update(data).digest('hex') !== file.sha256) throw new Error('changedFiles')
        totalBytes += data.length
        if (totalBytes > 8 * 1024 ** 3) throw new Error('tooLarge')
        const temporary = join(staging, 'files', ...safeServerArchivePath(file.archivePath).split('/'))
        await mkdir(dirname(temporary), { recursive: true })
        await writeFile(temporary, data, { flag: 'wx', signal: controller.signal })
        zip.addFile(temporary, file.archivePath)
      }
      const manifest = { schemaVersion: 1, generator: 'PbtModLauncherX', minecraft: stored.plan.minecraft, loader: stored.plan.loader, loaderVersion: stored.plan.loaderVersion, java: stored.plan.recipe!.java, memoryMiB: request.memoryMiB, status: 'installation-required-not-runtime-verified', eulaAccepted: false, warnings: [...stored.plan.warnings, ...(serverExportRequiredOmissions(stored.plan.mods, selected).length ? ['requiredModsExcluded'] : [])], files: entries.map(({ archivePath, sha256, size }) => ({ path: archivePath, sha256, size })), mods: stored.plan.mods.filter(mod => selected.has(mod.path)).map(({ archivePath, ids, version, side, evidence, required, classification }) => ({ path: archivePath, ids, version, side, evidence, required, classification })), excluded: [...stored.plan.files, ...stored.plan.mods].filter(file => !selected.has(file.path)).map(file => ({ path: ['privacy', 'secret', 'absolutePath'].includes(file.excluded ?? '') ? '(private file omitted)' : file.archivePath, reason: file.excluded ?? 'userDecision' })) }
      const generated = serverPackageGeneratedFiles(stored.plan.recipe!, request.memoryMiB, manifest, stored.plan.locale)
      generated['ATTRIBUTIONS.md'] += '\n## Included mods (review original licenses)\n' + manifest.mods.map(mod => `- ${mod.ids.join(', ') || mod.path} ${mod.version}`).join('\n') + '\n'
      for (const [path, text] of Object.entries(generated)) zip.addBuffer(Buffer.from(text, 'utf8'), path, { mode: path.endsWith('.sh') || path.endsWith('.py') ? 0o100755 : 0o100644 })
      const temporaryZip = join(staging, 'package.zip')
      await writeZipFile(zip, temporaryZip, controller.signal)
      const digest = createHash('sha256')
      for await (const chunk of createReadStream(temporaryZip, { signal: controller.signal })) digest.update(chunk)
      controller.signal.throwIfAborted()
      if (await realpath(destination) !== realDestination || (await lstat(destination)).isSymbolicLink() || await realpath(staging) !== staging) throw new Error('unsafePath')
      // Exclusive atomic publication; never overwrite an existing destination.
      await link(temporaryZip, output)
      return { path: output, sha256: digest.digest('hex'), files: entries.length + Object.keys(generated).length }
    } finally {
      this.active.delete(request.planId)
      if (staging) await rm(staging, { recursive: true, force: true })
    }
  }
}
