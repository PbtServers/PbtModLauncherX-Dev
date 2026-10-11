import { describe, expect, test } from 'vitest'
import type { ServerExportMod, ServerExportPlan, ServerModProviderEvidence } from '@xmcl/runtime-api'
import { classifyServerMod, validateServerSelection } from './serverExportAnalysis'
import { applyServerModOverride, classifyModrinthEnvironment, classifyServerDependencyGraph, classifyServerNecessity } from './serverModClassification'

function mod(id: string, environment: 'client' | 'server' | '*' = '*', depends: Record<string, string> = {}, provider?: ServerModProviderEvidence) {
  const result: ServerExportMod = { path: `mods/${id}.jar`, archivePath: `mods/${id}.jar`, size: 1, sha256: 'a'.repeat(64), selected: false, ...classifyServerMod({ fabric: { schemaVersion: 1, id, version: '1.0.0', environment, depends } }, 'fabric') }
  result.classification = classifyServerNecessity(result, provider)
  return result
}
function planFor(mods: ServerExportMod[]): ServerExportPlan {
  return { id: 'fixture', minecraft: '1.21.1', loaderVersion: 'fixture', recommendedMemoryMiB: 4096, worlds: [], warnings: [], generatedFiles: [], mods, files: [], blockers: [], loader: 'fabric', recipe: { minecraft: '1.21.1', loader: 'fabric', loaderVersion: 'fixture', java: 21, download: { url: 'https://maven.fabricmc.net/fixture.jar', sha1: 'a'.repeat(40), name: 'installer.jar' }, installArgs: [], instructionsUrl: 'https://fabricmc.net/use/server/' } }
}
describe('independent mod type and server necessity', () => {
  test.each([
    ['client_only', 'client', 'no'], ['singleplayer_only', 'client', 'no'], ['server_only', 'server', 'unknown'], ['dedicated_server_only', 'server', 'unknown'], ['client_and_server', 'both', 'required'], ['server_only_client_optional', 'both', 'required'], ['client_only_server_optional', 'both', 'recommended'], ['client_or_server_prefers_both', 'both', 'recommended'], ['client_or_server', 'both', 'recommended'],
  ])('uses documented environment %s without assuming server necessity from capability', (environment, side, necessity) => {
    expect(classifyModrinthEnvironment({ environment })).toMatchObject({ side, necessity })
  })
  test('unknown modern metadata does not silently inherit obsolete Required fields', () => {
    expect(classifyModrinthEnvironment({ environment: 'unknown', server_side: 'required' }).necessity).toBe('unknown')
    expect(classifyModrinthEnvironment({ server_side: 'required', client_side: 'required' }).necessity).toBe('required')
  })
  test('both-side or server-side execution alone does not prove required installation', () => {
    expect(mod('content').classification?.server.value).toBe('unknown')
    expect(mod('optimization', 'server').classification?.server.value).toBe('unknown')
  })
  test('client-only is No regardless of provider requirement or filename', () => {
    expect(mod('server-library', 'client', {}, { necessity: 'required', evidence: [] }).classification?.server.value).toBe('no')
    expect(mod('sodium').classification?.server.value).toBe('unknown')
  })
  test.each(['required', 'recommended'] as const)('preserves provider %s independently from Both', necessity => {
    const classified = mod('fixture', '*', {}, { necessity, compatible: true, evidence: ['modrinth.server_side=fixture'] })
    expect(classified.classification?.type.value).toBe('both')
    expect(classified.classification?.server.value).toBe(necessity)
    classifyServerDependencyGraph([classified]); expect(classified.selected).toBe(true)
  })
  test('only server-relevant dependencies promote a library, not client requirements', () => {
    const client = mod('client', 'client', { gui: '*' }); const gui = mod('gui')
    const content = mod('content', '*', { library: '*' }); const library = mod('library')
    classifyServerDependencyGraph([client, gui, content, library])
    expect(gui.classification?.server.value).toBe('unknown')
    expect(library.classification?.server.value).toBe('required')
    expect(library.classification?.server.evidence.at(-1)?.detail).toContain('content: library')
  })
  test('a library needed by an optional server mod is still required when that mod is selected', () => {
    const optimization = mod('opt', '*', { library: '*' }, { necessity: 'recommended', evidence: [] })
    const library = mod('library')
    classifyServerDependencyGraph([optimization, library])
    expect(optimization.classification?.server.value).toBe('recommended')
    expect(library.classification?.server.value).toBe('required')
  })
  test('conflicting evidence requires review and incompatible exact versions are No', () => {
    const ambiguous = mod('fixture'); ambiguous.evidence.push('analysis.contradictory'); ambiguous.side = 'unknown'
    expect(classifyServerNecessity(ambiguous, { necessity: 'required', evidence: [] }).server.value).toBe('unknown')
    ambiguous.incompatible = 'incompatibleVersion'
    expect(classifyServerNecessity(ambiguous).server.value).toBe('no')
  })
  test('manual decisions retain original facts and cannot force a client-only mod onto the server', () => {
    const reviewed = mod('content')
    applyServerModOverride(reviewed, { server: 'recommended' })
    expect(reviewed.classification?.originalServer).toBe('unknown')
    expect(reviewed.classification?.server.evidence.at(-1)?.source).toBe('user')
    const client = mod('client', 'client'); client.excluded = 'clientOnly'
    applyServerModOverride(client, { type: 'both', server: 'required' })
    expect(client.classification?.server.value).toBe('no')
    expect(client.excluded).toBe('clientOnly')
  })
  test('unknown necessity requires its own export decision even when type is Both', () => {
    const content = mod('fixture')
    const plan = planFor([content])
    expect(() => validateServerSelection(plan, [], {})).toThrow('unknownDecisionRequired')
    expect(validateServerSelection(plan, [content.path], { [content.path]: 'include' })).toEqual(new Set([content.path]))
    content.classification!.server.value = 'no'
    expect(() => validateServerSelection(plan, [content.path], {})).toThrow('invalidSelection')
  })
  test('user No is not overwritten by dependency inference; export detects the missing dependency', () => {
    const parent = mod('parent', '*', { library: '*' }); const library = mod('library')
    applyServerModOverride(library, { server: 'no' }); classifyServerDependencyGraph([parent, library])
    const plan = planFor([parent, library])
    expect(() => validateServerSelection(plan, [parent.path], { [parent.path]: 'include' })).toThrow('missingDependency')
  })
  test('cached provider evidence has explicit provenance and reduced confidence', () => {
    const cached = mod('fixture', '*', {}, { necessity: 'recommended', compatible: true, cached: true, evidence: ['modrinth.server_side=optional'] })
    expect(cached.classification?.server.evidence[0]).toMatchObject({ source: 'modrinth', reason: 'cachedMetadata', confidence: 'medium' })
  })
  test('recomputing the graph after manual client classification removes stale server requirements', () => {
    const parent = mod('parent', '*', { library: '*' }); const library = mod('library')
    classifyServerDependencyGraph([parent, library]); expect(library.classification?.server.value).toBe('required')
    applyServerModOverride(parent, { type: 'client' })
    classifyServerDependencyGraph([parent, library])
    expect(library.classification?.server.value).toBe('unknown')
    expect(library.classification?.server.evidence.some(item => item.source === 'dependency')).toBe(false)
  })
})
