import {
  ServerFSExporter,
  ServerSSHExporter,
  parseInstanceFiles,
  parseLauncherData,
  type InstanceFile,
} from '@xmcl/instance'
import {
  InstanceIOServiceKey,
  type ExportInstanceAsServerOptions,
  type InstanceIOService as IInstanceIOService,
  type InstanceType,
  type ThirdPartyLauncherManifest,
} from '@xmcl/runtime-api'
import { AnyError, isSystemError } from '@xmcl/utils'
import { join } from 'path'
import { ModrinthV2Client } from '@xmcl/modrinth'
import { CurseforgeV1Client } from '@xmcl/curseforge'
import { ResourceDomain, isValidCurseforgeRef, isValidModrinthRef } from '@xmcl/resource'
import { kResourceManager, kResourceWorker } from '~/resource'
import { VersionMetadataService } from '~/install/VersionMetadataService'
import type { ServerExportAnalysisOptions, ServerExportRequest, ServerModOverride, ServerModNecessity } from '@xmcl/runtime-api'
import { ServerExportController } from './serverExport'
import { officialServerUrl } from './serverExportRecipe'
import { resolveServerInstallRecipe } from './serverExportMetadata'
import { serverLoader } from './serverExport'
import { ServerModDecisionStore, serverModDecisionKey, validateServerModOverride } from './serverModDecisions'
import { classifyModrinthEnvironment } from './serverModClassification'
import { Inject, LauncherAppKey, kGameDataPath, type PathResolver } from '~/app'
import { SSHManager } from '~/infra'
import { InstanceService } from '~/instance'
import { LaunchService } from '~/launch'
import { AbstractService, ExposeServiceKey } from '~/service'
import { VersionService } from '~/launch'
import { LauncherApp } from '../app/LauncherApp'
import { copyPassively, isPathDiskRootPath } from '../util/fs'
import { uploadSSH } from './utils/uploadSSH'
import { importLauncherInstance } from './utils/importLauncherInstance'

@ExposeServiceKey(InstanceIOServiceKey)
export class InstanceIOService extends AbstractService implements IInstanceIOService {
  private serverModDecisions = new ServerModDecisionStore(() => this.getPath('server-mod-classification'))
  private serverExport = new ServerExportController(
    async (minecraft, loader, version) => resolveServerInstallRecipe(minecraft, loader, version, await this.app.registry.get(VersionMetadataService), (url, json) => this.serverFetch(url, json)),
    async (path, sha1, online, runtime) => {
      const manager = await this.app.registry.get(kResourceManager)
      const worker = await this.app.registry.get(kResourceWorker)
      const cached = await manager.getMetadataByHash(sha1)
      const parsed = await worker.parse({ path, domain: ResourceDomain.Mods, fileType: 'zip' })
      const metadata = { ...cached, ...parsed.metadata }
      if (!online) return { metadata }
      const provider = { evidence: [] as string[], side: undefined as 'client' | 'server' | 'both' | undefined, necessity: undefined as ServerModNecessity | undefined, compatible: undefined as boolean | undefined, required: [] as string[], provided: [] as string[] }
      if (isValidModrinthRef(cached?.modrinth)) {
        try {
          const client = await this.app.registry.get(ModrinthV2Client)
          const signal = AbortSignal.timeout(8000)
          const version = await client.getProjectVersion(cached.modrinth.versionId, signal)
          if (!version.files.some(file => file.hashes.sha1 === sha1)) throw new Error('hashMismatch')
          const project = await client.getProject(version.project_id, signal)
          const environment = 'environment' in project && typeof project.environment === 'string' ? project.environment : undefined
          const classification = classifyModrinthEnvironment({ ...project, environment })
          provider.side = classification.side; provider.necessity = classification.necessity
          provider.evidence.push(...classification.evidence, `modrinth.version=${version.id}`)
          provider.compatible = version.game_versions.includes(runtime.minecraft) && version.loaders.includes(runtime.neoForged ? 'neoforge' : runtime.forge ? 'forge' : runtime.quiltLoader ? 'quilt' : 'fabric')
          provider.required.push(...version.dependencies.filter(dep => dep.dependency_type === 'required' && dep.project_id).map(dep => `modrinth:${dep.project_id}`))
          provider.provided.push(`modrinth:${version.project_id}`)
        } catch { provider.evidence.push('modrinth.metadataUnavailable') }
      }
      if (isValidCurseforgeRef(cached?.curseforge)) {
        try {
          const client = await this.app.registry.get(CurseforgeV1Client)
          const file = await client.getModFile(cached.curseforge.projectId, cached.curseforge.fileId, AbortSignal.timeout(8000))
          if (!file.hashes.some(hash => hash.algo === 1 && hash.value.toLowerCase() === sha1)) throw new Error('hashMismatch')
          provider.evidence.push(`curseforge.file=${file.id}`, 'curseforge.side=unspecified')
          if (!file.gameVersions.includes(runtime.minecraft)) provider.compatible = false
          const loaderTags = file.gameVersions.filter(value => ['Forge', 'NeoForge', 'Fabric', 'Quilt'].includes(value))
          const expectedLoader = runtime.neoForged ? 'NeoForge' : runtime.forge ? 'Forge' : runtime.quiltLoader ? 'Quilt' : 'Fabric'
          if (loaderTags.length && !loaderTags.includes(expectedLoader)) provider.compatible = false
          provider.required.push(...file.dependencies.filter(dep => dep.relationType === 3).map(dep => `curseforge:${dep.modId}`))
          provider.provided.push(`curseforge:${file.modId}`)
        } catch { provider.evidence.push('curseforge.metadataUnavailable') }
      }
      return { metadata, provider }
    },
    this.serverModDecisions,
  )

  async getInstanceServerModClassifications(instancePath: string, onlineMetadata = false) {
    const instance = this.instanceService.state.all[instancePath]
    if (!instance || instance.edition === 'bedrock') throw new Error('unsupportedInstance')
    const plan = await this.serverExport.analyze({ instancePath, includeConfig: false, includeDatapacks: false, onlineMetadata }, instance.runtime, true)
    this.serverExport.cancel(plan.id)
    return plan.mods
  }

  async setServerModOverride(instancePath: string, sha256: string, override: ServerModOverride) {
    validateServerModOverride(override)
    const mods = await this.getInstanceServerModClassifications(instancePath)
    if (!mods.some(mod => mod.sha256 === sha256)) throw new Error('changedFiles')
    const runtime = this.instanceService.state.all[instancePath].runtime
    const loader = serverLoader(runtime)
    await this.serverModDecisions.update(instancePath, { [serverModDecisionKey(runtime.minecraft, loader.loader, loader.version, sha256)]: { override } })
  }

  async analyzeServerExport(options: ServerExportAnalysisOptions) {
    const instance = this.instanceService.state.all[options.instancePath]
    if (!instance || instance.edition === 'bedrock') throw new Error('unsupportedInstance')
    const plan = await this.serverExport.analyze(options, instance.runtime)
    if (this.serverPlanInstances.size >= 8) this.serverPlanInstances.delete(this.serverPlanInstances.keys().next().value!)
    this.serverPlanInstances.set(plan.id, options.instancePath)
    return plan
  }

  async exportServerZip(request: ServerExportRequest) {
    // Controller owns a reviewed snapshot; resolve the current runtime by its opaque plan scope.
    const plan = this.serverPlanInstances.get(request.planId)
    const instance = plan && this.instanceService.state.all[plan]
    if (!instance) throw new Error('expiredPlan')
    try { return await this.serverExport.export(request, instance.runtime) } finally { this.serverPlanInstances.delete(request.planId) }
  }

  private serverPlanInstances = new Map<string, string>()

  async cancelServerExport(planId: string) {
    this.serverExport.cancel(planId)
    this.serverPlanInstances.delete(planId)
  }

  private async serverFetch(url: string, json = true): Promise<any> {
    const response = await this.app.fetch(officialServerUrl(url), { signal: AbortSignal.timeout(12000), redirect: 'error' })
    if (!response.ok || Number(response.headers.get('content-length') ?? 0) > 2 * 1024 ** 2) throw new Error('metadataUnavailable')
    const reader = response.body?.getReader()
    if (!reader) throw new Error('metadataUnavailable')
    const chunks: Uint8Array[] = []
    let size = 0
    try {
      while (true) {
        const next = await reader.read()
        if (next.done) break
        size += next.value.length
        if (size > 2 * 1024 ** 2) throw new Error('metadataUnavailable')
        chunks.push(next.value)
      }
    } finally { await reader.cancel(); reader.releaseLock() }
    const text = Buffer.concat(chunks).toString('utf8')
    return json ? JSON.parse(text) : text
  }


  constructor(
    @Inject(LauncherAppKey) app: LauncherApp,
    @Inject(InstanceService) private instanceService: InstanceService,
    @Inject(kGameDataPath) protected getPath: PathResolver,
    @Inject(VersionService) protected versionService: VersionService,
  ) {
    super(app)
  }

  async exportInstanceAsServer(options: ExportInstanceAsServerOptions): Promise<void> {
    const launchService = await this.app.registry.get(LaunchService)
    const versionService = await this.app.registry.get(VersionService)
    const serverVersion = await versionService.resolveServerVersion(options.options.version)
    const ops = await launchService.generateServerOptions(options.options, serverVersion)
    if (options.output.type === 'folder') {
      await new ServerFSExporter(this.getPath(), options.output.path).exportInstance(
        options.options.gameDirectory,
        ops,
        options.files.map((f) => f.path),
      )
    } else if (options.output.type === 'ssh') {
      const manager = await this.app.registry.getOrCreate(SSHManager)
      const ssh = await manager.open({
        host: options.output.host,
        port: options.output.port,
        username: options.output.username,
        credentials: options.output.credentials,
      })
      const sftp = await manager.openSFTP(ssh)
      if (!sftp) {
        throw new Error('Failed to open sftp')
      }
      const exporter = new ServerSSHExporter(this.getPath(), options.output.path, ssh, sftp)

      await uploadSSH(
        exporter,
        options.options.gameDirectory,
        ops,
        options.files.map((f) => f.path),
      )

      sftp.end()
      ssh.end()
    }
  }

  async getGameDefaultPath(type?: 'modrinth' | 'modrinth-instances' | 'vanilla' | 'curseforge') {
    if (type === 'modrinth' || type === 'modrinth-instances') {
      const dir = join(this.app.host.getPath('appData'), 'com.modrinth.theseus')
      if (type === 'modrinth-instances') {
        return join(dir, 'profiles')
      }
      return dir
    }
    if (type === 'curseforge') {
      return join(this.app.host.getPath('home'), 'curseforge', 'minecraft')
    }
    return join(this.app.host.getPath('appData'), '.minecraft')
  }

  async parseInstanceFiles(path: string, type?: InstanceType): Promise<InstanceFile[]> {
    const result = await parseInstanceFiles(path, type === 'prism' ? 'mmc' : type)
    return result
  }

  async parseLauncherData(path: string, type?: InstanceType): Promise<ThirdPartyLauncherManifest> {
    // Refuse drive-root paths up front. The recursive scanners below would
    // otherwise descend into kernel-locked Windows entries (pagefile.sys,
    // System Volume Information, …) and surface noisy EBUSY exceptions
    // during the first-launch migrate wizard.
    if (isPathDiskRootPath(path)) {
      throw new AnyError('BadInstance', `Refusing to scan drive root: ${path}`, undefined, { path })
    }
    try {
      const result = await parseLauncherData(path, type === 'prism' ? 'mmc' : type)
      return result
    } catch (e) {
      if (isSystemError(e)) {
        if (e.code === 'ENOENT') {
          throw new AnyError('BadInstance', undefined, { cause: e }, { path })
        }
      }
      throw e
    }
  }

  async importLauncherData(data: ThirdPartyLauncherManifest): Promise<void> {
    const { instances, folder } = data

    if (folder.assets) {
      await copyPassively(folder.assets, this.getPath('assets'))
    }
    if (folder.libraries) {
      await copyPassively(folder.libraries, this.getPath('libraries'))
    }
    if (folder.versions) {
      await copyPassively(folder.versions, this.getPath('versions'))
    }
    if (folder.jre) {
      await copyPassively(folder.jre, this.getPath('jre'))
    }

    for (const instance of instances) {
      await importLauncherInstance(
        instance,
        this.getPath(),
        (options) => this.instanceService.createInstance(options),
        (id) => this.versionService.refreshVersion(id),
      )
    }
  }
}
