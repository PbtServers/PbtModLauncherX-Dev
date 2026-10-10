import type { ResourceMetadata } from '@xmcl/resource'
import type { ServerExportLoader, ServerExportMod, ServerExportPlan } from '@xmcl/runtime-api'
import { serverExportMissingDependencies } from '@xmcl/runtime-api'
import { VersionRange, parseVersion } from '@xmcl/runtime-api'
// Scoped adapter to the existing workspace parser; no global compiler or dependency policy changes.
import { parseSemanticVersion, parseVersionRange } from '../../packages/semver'

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}
function array(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(object) : []
}

/** Dependency side is not the mod's side. Names never establish compatibility. */
export function classifyServerMod(metadata: ResourceMetadata, loader: ServerExportLoader): Pick<ServerExportMod, 'ids' | 'version' | 'side' | 'evidence' | 'required' | 'provided' | 'incompatible' | 'versionRequirements' | 'versions'> {
  const result: ReturnType<typeof classifyServerMod> = { ids: [], version: '', side: 'unknown', evidence: [], required: [], provided: [], versionRequirements: [], versions: {} }
  const fabrics = Array.isArray(metadata.fabric) ? metadata.fabric : metadata.fabric ? [metadata.fabric] : []
  if (fabrics.length && (loader === 'fabric' || loader === 'quilt' && !metadata.quilt)) {
    const root = fabrics[0]
    result.ids = fabrics.filter((mod, index) => index === 0 || mod.environment !== 'client').map(mod => mod.id)
    result.version = root.version
    result.side = root.environment === 'client' ? 'client' : root.environment === 'server' ? 'server' : 'both'
    result.evidence.push(`fabric.environment=${root.environment ?? '*'}`)
    result.provided = fabrics.filter(mod => mod.environment !== 'client').flatMap(mod => mod.provides ?? [])
    result.required = fabrics.filter(mod => mod.environment !== 'client').flatMap(mod => Object.keys(mod.depends ?? {}))
    for (const mod of fabrics.filter(mod => mod.environment !== 'client')) {
      result.versions![mod.id] = mod.version
      for (const [id, range] of Object.entries(mod.depends ?? {})) result.versionRequirements!.push({ id, range, format: 'fabric' })
    }
  } else if (metadata.quilt && loader === 'quilt') {
    const quilt = object(metadata.quilt)
    const root = object(quilt.quilt_loader)
    const environment = object(root.minecraft).environment
    result.ids = typeof root.id === 'string' ? [root.id] : []
    result.version = String(root.version ?? '')
    result.side = environment === 'client' ? 'client' : environment === 'dedicated_server' ? 'server' : 'both'
    result.evidence.push(`quilt.minecraft.environment=${environment ?? '*'}`)
    result.required = array(root.depends).filter(dep => !dep.optional && !dep.unless && !Array.isArray(dep.id)).map(dep => String(dep.id ?? '')).filter(Boolean)
    result.provided = array(root.provides).map(dep => String(dep.id ?? '')).filter(Boolean)
  } else if (metadata.forge && loader === 'forge' || metadata.neoforge && loader === 'neoforge') {
    const root = object(metadata.neoforge ?? metadata.forge)
    const mods = metadata.neoforge ? [root, ...array(root.children)] : array(root.modsToml)
    const annotations = array(root.modAnnotations)
    result.ids = [...mods.map(mod => String(mod.modid ?? '')), ...annotations.map(mod => String(mod.modid ?? ''))].filter(Boolean)
    if (!result.ids.length && typeof root.modid === 'string') result.ids.push(root.modid)
    result.version = String(root.version ?? mods[0]?.version ?? '')
    const explicitClient = root.clientSideOnly === true || mods.length > 0 && mods.every(mod => mod.clientSideOnly === true) || annotations.length > 0 && annotations.every(mod => mod.clientSideOnly === true)
    const explicitServer = annotations.length > 0 && annotations.every(mod => mod.serverSideOnly === true)
    result.side = explicitClient ? 'client' : explicitServer ? 'server' : 'unknown'
    result.evidence.push(explicitClient ? 'forge.clientSideOnly=true' : explicitServer ? 'forge.serverSideOnly=true' : 'forge.side=unspecified')
    result.required = mods.flatMap(mod => array(mod.dependencies).filter(dep => dep.side !== 'CLIENT' && (dep.mandatory === true || dep.type === 'required')).map(dep => String(dep.modId ?? ''))).filter(Boolean)
    for (const mod of mods) {
      if (typeof mod.modid === 'string' && typeof mod.version === 'string') result.versions![mod.modid] = mod.version
      for (const dep of array(mod.dependencies).filter(dep => dep.side !== 'CLIENT' && (dep.mandatory === true || dep.type === 'required'))) {
        if (typeof dep.modId === 'string' && typeof dep.versionRange === 'string') result.versionRequirements!.push({ id: dep.modId, range: dep.versionRange, format: 'maven' })
      }
    }
  } else if (metadata.fabric || metadata.quilt || metadata.forge || metadata.neoforge) {
    result.incompatible = 'incompatibleLoader'
    result.evidence.push('descriptor.loader does not match instance.loader')
  }
  result.ids = [...new Set(result.ids)]
  result.required = [...new Set(result.required)]
  return result
}

export const missingServerDependencies = serverExportMissingDependencies

export function serverDependencyVersionMatches(requirement: NonNullable<ServerExportMod['versionRequirements']>[number], version: string): boolean | undefined {
  try {
    const ranges = Array.isArray(requirement.range) ? requirement.range : [requirement.range]
    const results = ranges.map(range => range === '*' || (requirement.format === 'maven'
      ? VersionRange.createFromVersionSpec(range)?.containsVersion(parseVersion(version))
      : parseVersionRange(range).test(parseSemanticVersion(version))))
    return results.includes(true) ? true : results.includes(undefined) ? undefined : false
  } catch { return undefined }
}

export function incompatibleServerDependencies(mods: ServerExportMod[], selected: Set<string>, recipe: { minecraft: string; java: number; loader: ServerExportLoader; loaderVersion: string }) {
  const versions: Record<string, string> = { minecraft: recipe.minecraft, ...(recipe.java > 0 ? { java: String(recipe.java) } : {}), [recipe.loader]: recipe.loaderVersion, fabricloader: recipe.loaderVersion, quilt_loader: recipe.loaderVersion }
  for (const mod of mods.filter(mod => selected.has(mod.path))) Object.assign(versions, mod.versions, Object.fromEntries([...mod.ids, ...mod.provided].map(id => [id, mod.versions?.[id] ?? mod.version])))
  return mods.filter(mod => selected.has(mod.path)).flatMap(mod => (mod.versionRequirements ?? []).filter(requirement => versions[requirement.id] && serverDependencyVersionMatches(requirement, versions[requirement.id]) === false).map(requirement => `${mod.ids[0] || mod.path}: ${requirement.id}`))
}

export function validateServerSelection(plan: ServerExportPlan, paths: string[], decisions: Record<string, 'include' | 'exclude'>) {
  if (plan.blockers.length || !plan.recipe) throw new Error('unsupportedRecipe')
  const selected = new Set(paths)
  if (selected.size !== paths.length) throw new Error('invalidSelection')
  const entries = [...plan.files, ...plan.mods]
  for (const path of selected) {
    const file = entries.find(file => file.path === path)
    if (!file || file.excluded || plan.mods.some(mod => mod.path === path && (mod.side === 'client' || mod.incompatible || mod.classification?.server.value === 'no'))) throw new Error('invalidSelection')
  }
  for (const mod of plan.mods.filter(mod => (mod.side === 'unknown' || mod.classification?.server.value === 'unknown') && mod.classification?.server.value !== 'no' && !mod.excluded && !mod.incompatible)) {
    if (!['include', 'exclude'].includes(decisions[mod.path]) || selected.has(mod.path) !== (decisions[mod.path] === 'include')) throw new Error('unknownDecisionRequired')
  }
  if (missingServerDependencies(plan.mods, selected, plan.loader).length) throw new Error('missingDependency')
  if (incompatibleServerDependencies(plan.mods, selected, plan.recipe).length) throw new Error('incompatibleVersion')
  return selected
}
