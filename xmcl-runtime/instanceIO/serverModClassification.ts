import type { ServerExportMod, ServerModClassification, ServerModOverride, ServerModProviderEvidence, ServerModExplanation } from '@xmcl/runtime-api'

/** Official Modrinth environment definitions, when supplied by its stable API. */
export function classifyModrinthEnvironment(project: { environment?: string; server_side?: string; client_side?: string }): Pick<ServerModProviderEvidence, 'side' | 'necessity' | 'evidence'> {
  if (project.environment !== undefined) {
    const entries: Record<string, [ServerModProviderEvidence['side'], ServerModProviderEvidence['necessity']]> = {
      client_only: ['client', 'no'], singleplayer_only: ['client', 'no'],
      server_only: ['server', 'unknown'], dedicated_server_only: ['server', 'unknown'],
      client_and_server: ['both', 'required'], server_only_client_optional: ['both', 'required'],
      client_only_server_optional: ['both', 'recommended'], client_or_server_prefers_both: ['both', 'recommended'], client_or_server: ['both', 'recommended'],
    }
    const values = entries[project.environment]
    return { side: values?.[0], necessity: values?.[1] ?? 'unknown', evidence: [`modrinth.environment=${project.environment}`] }
  }
  const side = project.server_side === 'unsupported' && project.client_side !== 'unsupported' ? 'client' : project.client_side === 'unsupported' && project.server_side !== 'unsupported' ? 'server' : project.server_side === 'required' || project.server_side === 'optional' ? 'both' : undefined
  const necessity = project.server_side === 'required' ? 'required' : project.server_side === 'optional' ? 'recommended' : project.server_side === 'unsupported' ? 'no' : 'unknown'
  return { side, necessity, evidence: [`modrinth.server_side=${project.server_side ?? 'unknown'}`, 'modrinth.environment=legacy'] }
}

/** Side capability does not prove necessity. No mod-name heuristics. */
export function classifyServerNecessity(mod: ServerExportMod, provider?: ServerModProviderEvidence): ServerModClassification {
  const typeEvidence: ServerModExplanation[] = mod.evidence.map(detail => ({ source: detail.startsWith('modrinth.') ? 'modrinth' : detail.startsWith('curseforge.') ? 'curseforge' : detail.startsWith('analysis.') ? 'analysis' : 'descriptor', reason: detail.includes('contradictory') ? 'contradictory' : detail.includes('unavailable') || detail.includes('Unavailable') ? 'insufficient' : provider?.cached && /^(modrinth|curseforge)\./.test(detail) ? 'cachedMetadata' : 'descriptor', confidence: mod.side === 'unknown' || detail.includes('contradictory') || /unavailable/i.test(detail) ? 'low' : provider?.cached && /^(modrinth|curseforge)\./.test(detail) ? 'medium' : 'high', detail }))
  if (!typeEvidence.length) typeEvidence.push({ source: 'analysis', reason: 'insufficient', confidence: 'low', detail: '' })
  const server: ServerModClassification['server'] = { value: 'unknown', evidence: [{ source: 'analysis', reason: 'insufficient', confidence: 'low' }] }
  if (mod.side === 'client' || mod.incompatible || mod.excluded && mod.excluded !== 'disabledMod') {
    server.value = 'no'; server.evidence = [{ source: 'analysis', reason: mod.side === 'client' ? 'clientOnly' : 'incompatible', confidence: 'high', detail: mod.incompatible ?? mod.excluded }]
  } else if (mod.excluded === 'disabledMod') {
    server.evidence = [{ source: 'analysis', reason: 'insufficient', confidence: 'low', detail: 'disabledMod' }]
  } else if (!mod.evidence.includes('analysis.contradictory') && provider?.compatible !== false && provider?.necessity && provider.necessity !== 'unknown') {
    server.value = provider.necessity
    server.evidence = [{ source: 'modrinth', reason: provider.cached ? 'cachedMetadata' : provider.necessity === 'required' ? 'providerRequired' : provider.necessity === 'no' ? 'clientOnly' : 'providerOptional', confidence: 'medium', detail: provider.evidence.join('; ') }]
  }
  return { type: { value: mod.side, evidence: typeEvidence }, server, originalType: mod.side, originalServer: server.value, baseServer: server.value }
}

export function applyServerModOverride(mod: ServerExportMod, override?: ServerModOverride) {
  const classification = mod.classification!
  if (!override || !Object.keys(override).length) return
  classification.userDecision = { ...override }
  if (override.type) {
    classification.type = { value: override.type, evidence: [...classification.type.evidence, { source: 'user', reason: 'userDecision', confidence: 'user' }] }
    // Keep verified client/incompatible exclusion even if the user's label differs.
    if (!mod.excluded && !mod.incompatible) mod.side = override.type
  }
  if (override.server && classification.server.value !== 'no') classification.server = { value: override.server, evidence: [...classification.server.evidence, { source: 'user', reason: 'userDecision', confidence: 'user' }] }
  if (classification.type.value === 'client' || classification.server.value === 'no') {
    classification.server.value = 'no'
    mod.selected = false
  }
}

/** Only dependencies of enabled non-client, compatible mods affect the server graph. */
export function classifyServerDependencyGraph(mods: ServerExportMod[]) {
  for (const mod of mods) {
    const classification = mod.classification!
    classification.server.evidence = classification.server.evidence.filter(item => item.source !== 'dependency')
    classification.server.value = classification.baseServer === 'no' || classification.type.value === 'client' ? 'no' : classification.userDecision?.server ?? classification.baseServer ?? classification.originalServer
  }
  for (const parent of mods.filter(mod => !mod.excluded && !mod.incompatible && ['both', 'server'].includes(mod.classification?.type.value ?? '') && mod.classification?.server.value !== 'no')) {
    for (const id of parent.required) {
      const target = mods.find(mod => [...mod.ids, ...mod.provided].includes(id))
      if (!target || target.excluded || target.incompatible || target.classification?.type.value === 'client' || target.classification?.server.value === 'no') continue
      const server = target.classification!.server
      server.value = 'required'
      server.evidence.push({ source: 'dependency', reason: 'dependencyRequired', confidence: 'high', detail: `${parent.ids[0] || parent.path}: ${id}` })
    }
  }
  for (const mod of mods) mod.selected = !mod.excluded && !mod.incompatible && ['required', 'recommended'].includes(mod.classification!.server.value)
}
