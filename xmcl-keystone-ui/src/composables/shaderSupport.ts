import type { RuntimeVersions } from '@xmcl/instance'
import { parseVersion, VersionRange } from '@xmcl/runtime-api'
import type { ModFile } from '@/util/mod'
import type { ModDependency } from '@/util/modDependencies'
import { getModCompatiblity } from '@/util/modCompatible'

export interface ShaderProvider {
  id: 'iris' | 'oculus' | 'optifine'
  name: string
  version: string
  icon?: string
}

function accepts(dependency: ModDependency, version: string) {
  if (dependency.optional) return true
  if (!version) return false
  if (dependency.versionRange) {
    try {
      const range = VersionRange.createFromVersionSpec(dependency.versionRange)
      return !!range && range.containsVersion(parseVersion(version))
    }
    catch { return false }
  }
  return getModCompatiblity(dependency, version) === true
}

/** Resolve local metadata only; a filename or an online project association is not evidence of support. */
export function detectShaderProvider(runtime: RuntimeVersions, mods: readonly ModFile[], instancePath?: string): ShaderProvider | undefined {
  if (!runtime.minecraft) return undefined
  const normalize = (path: string) => path.replaceAll('\\', '/').replace(/\/$/, '')
  const belongs = (mod: ModFile) => {
    if (!instancePath) return true
    let path = normalize(mod.path)
    let prefix = `${normalize(instancePath)}/mods/`
    if (/^[a-z]:/i.test(prefix)) { path = path.toLowerCase(); prefix = prefix.toLowerCase() }
    return path.startsWith(prefix)
  }
  const enabled = mods.filter(mod => mod.enabled && belongs(mod))
  const fabric = runtime.fabricLoader || runtime.quiltLoader
  const bridge = enabled.some(mod => (Array.isArray(mod.fabric) ? mod.fabric : [mod.fabric]).some(meta => meta?.id === 'optifabric'))
  if (runtime.optifine && !runtime.neoForged && (!fabric || bridge)) {
    return { id: 'optifine', name: 'OptiFine', version: runtime.optifine }
  }
  for (const mod of enabled) {
    const candidates: { id?: string; name?: string; version?: string; loader: string; dependencies: ModDependency[] }[] = []
    if (runtime.neoForged && mod.neoforge) {
      for (const meta of [mod.neoforge, ...(mod.neoforge.children ?? [])]) {
        candidates.push({ id: meta.modid, name: meta.displayName, version: meta.version, loader: 'neoforge',
          dependencies: (meta.dependencies ?? []).map(dep => ({ modId: dep.modId, versionRange: dep.versionRange, optional: !dep.mandatory })) })
      }
    }
    if (runtime.forge && mod.forge) candidates.push({ id: mod.forge.modid, name: mod.forge.name, version: mod.forge.version,
      loader: 'forge', dependencies: mod.dependencies.forge ?? [] })
    // OptiFine is identified by the existing class-file parser even on vanilla/OptiFabric.
    if (!runtime.neoForged && (!fabric || bridge) && mod.forge?.modid?.toLowerCase() === 'optifine') {
      candidates.push({ id: 'optifine', name: 'OptiFine', version: mod.forge.version, loader: 'optifine',
        dependencies: mod.forge.acceptMinecraft ? [{ modId: 'minecraft', versionRange: mod.forge.acceptMinecraft }] : [] })
    }
    if (fabric) {
      for (const meta of Array.isArray(mod.fabric) ? mod.fabric : mod.fabric ? [mod.fabric] : []) {
        candidates.push({ id: meta.id, name: meta.name, version: meta.version, loader: 'fabric',
          dependencies: Object.entries(meta.depends ?? {}).map(([modId, semanticVersion]) => ({ modId, semanticVersion })) })
      }
    }
    if (runtime.quiltLoader && mod.quilt) {
      const meta = mod.quilt.quilt_loader
      candidates.push({ id: meta.id, name: meta.metadata?.name, version: meta.version, loader: 'quilt',
        dependencies: (meta.depends ?? []).map(dep => ({ modId: dep.id, semanticVersion: dep.versions ?? '*', optional: dep.optional })) })
    }
    for (const candidate of candidates) {
      const id = candidate.id?.toLowerCase()
      if (id !== 'iris' && id !== 'oculus' && id !== 'optifine') continue
      if (id === 'oculus' && candidate.loader !== 'forge' && candidate.loader !== 'neoforge') continue
      if (id === 'iris' && candidate.loader === 'forge') continue
      if (id === 'optifine' && candidate.loader !== 'optifine') continue
      const versions: Record<string, string> = { minecraft: runtime.minecraft, forge: runtime.forge ?? '',
        neoforge: runtime.neoForged ?? '', fabricloader: runtime.fabricLoader ?? '', quilt_loader: runtime.quiltLoader ?? '' }
      // Quilt can load Fabric metadata, but its version is not a Fabric Loader version.
      if (runtime.quiltLoader && !runtime.fabricLoader) delete versions.fabricloader
      if (!candidate.dependencies.filter(dep => dep.modId in versions).every(dep => accepts(dep, versions[dep.modId]))) continue
      return { id, name: candidate.name || id, version: candidate.version ?? mod.version, icon: mod.icon }
    }
  }
}
