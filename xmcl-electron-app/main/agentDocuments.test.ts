import { AgentDocumentStore } from '@xmcl/runtime/agent/documents'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { describe, expect, test } from 'vitest'
import { resolveAgentDocumentDirectory, resolvePbtAdminKnowledgeDirectory } from './pluginAgentDocuments'

describe('main-process Agent documents', () => {
  const store = new AgentDocumentStore(join(__dirname, 'agent-documents'))

  test('indexes and reads the shader-pack workflow', async () => {
    const results = await store.search('shaderpack gpu')
    expect(results[0]).toEqual(expect.objectContaining({ id: 'shaderpack-enable' }))
    const document = await store.read('shaderpack-enable')
    expect(document.body).toContain('system info')
    expect(document.body).toContain('install-mod <installRef>')
    expect(document.body).toContain('install-shaderpack <installRef>')
    expect(document.body).toContain('instance manifest apply')
    expect(document.body).toContain('config/iris.properties')
    expect(document.body).toContain('config/oculus.properties')
    expect(document.body).toContain('optionsshaders.txt')
    expect(document.body).toContain('enableShaders=true')
    expect(document.body).toContain('Read the config again')
  })

  test('indexes and reads the Sodium NeoForge troubleshooting workflow', async () => {
    const results = await store.search('sodium black screen neoforge')
    expect(results[0]).toEqual(expect.objectContaining({ id: 'sodium-neoforge-black-screen' }))
    const document = await store.read('sodium-neoforge-black-screen')
    expect(document.body).toContain('switch the Sodium version first')
    expect(document.body).toContain('version-metadata loader neoforge')
    expect(document.body).toContain('newest version first')
    expect(document.body).toContain('instance runtime set --loader neoforge')
    expect(document.body).toContain('instance install')
  })

  test('lazily exposes marketplace resource workflow details', async () => {
    const listed = await store.list()
    expect(listed).toContainEqual({
      id: 'marketplace-resource-install',
      description: 'Discover compatible marketplace (modrinth/curseforge) resources, stage exact files, review pending changes, and apply them once.',
    })
    expect(JSON.stringify(listed)).not.toContain('installRef')
    const document = await store.read('marketplace-resource-install')
    expect(document.body).toContain('modrinth search')
    expect(document.body).toContain('curseforge project')
    expect(document.body).toContain('installRef')
    expect(document.body).toContain('instance manifest apply')
  })

  test('indexes and reads the instance runtime change workflow', async () => {
    const results = await store.search('modloader')
    expect(results[0]).toEqual(expect.objectContaining({ id: 'instance-runtime-change' }))
    const listed = await store.list()
    expect(listed).toContainEqual({
      id: 'instance-runtime-change',
      description: 'Change the selected instance Minecraft or mod-loader version, validate compatibility, clear conflicting runtimes, and install the resolved version.',
    })
    const document = await store.read('instance-runtime-change')
    expect(document.body).toContain('version-metadata minecraft')
    expect(document.body).toContain('version-metadata loader <forge|neoforge|fabric|quilt> <minecraftVersion>')
    expect(document.body).toContain('instance runtime set --loader <forge|neoforge|fabric|quilt>')
    expect(document.body).toContain('Set the exact Minecraft and loader versions atomically')
    expect(document.body).toContain('instance install')
    expect(document.body).toContain('instance diagnose')
    expect(document.body).toContain('mod update check` without `--skip-version')
    expect(document.body).toContain('upgrade or downgrade a mod')
    expect(document.body).toContain('mod update stage')
    expect(document.body).toContain('instance manifest apply')
  })

  test('resolves source files in development and resources in packaged builds', () => {
    expect(resolveAgentDocumentDirectory(true)).toBe(join(__dirname, 'agent-documents'))
    expect(resolveAgentDocumentDirectory(false, 'C:/package/resources')).toBe(join('C:/package/resources', 'agent-documents'))
    expect(resolvePbtAdminKnowledgeDirectory(true)).toBe(join(__dirname, '..', '..', 'PbtModLauncherX-Data', 'PbtAdmin', 'knowledge'))
    expect(resolvePbtAdminKnowledgeDirectory(false, 'C:/package/resources')).toBe(join('C:/package/resources', 'pbtadmin-knowledge'))
  })

  test('retrieves local fictional lore alongside existing technical workflows', async () => {
    const combined = new AgentDocumentStore([join(__dirname, 'agent-documents'), resolvePbtAdminKnowledgeDirectory(true)])
    expect((await combined.list()).filter(document => document.id.startsWith('pbt-'))).toHaveLength(24)
    const juand = await combined.read('pbt-juand')
    expect(juand.body).toContain('raid ficticio')
    expect(juand.body).toContain('maintainer-10b')
    expect((await combined.search('JuanD'))[0].excerpt).toMatch(/\[(?:juand-rtf|maintainer-157)/)
    const lore = await combined.read('pbt-fnf-lore')
    for (let part = 1; part <= 9; part++) expect(lore.body).toContain(`parte ${part}/9`)
    expect((await combined.search('Lozeer_55 ascensores'))[0].excerpt).toMatch(/Ficción|Parodia/)
    expect((await combined.search('Hector'))[0].id).toBe('pbt-character-hector')
    expect((await combined.read('pbt-network-history')).body).toContain('Ella es la propietaria')
    expect((await combined.read('shaderpack-enable')).body).toContain('system info')
  })

  test.each(['0ftome101', '0ftome', 'Oftome'])('retrieves the independent builder profile for alias %s', async (alias) => {
    const docs = new AgentDocumentStore(resolvePbtAdminKnowledgeDirectory(true))
    const results = await docs.search(alias)
    expect(results[0].id).toBe('pbt-character-0ftome101')
    const profile = await docs.read(results[0].id)
    expect(profile.body).toContain('No es JuanD')
    expect(profile.body).toContain('parte 2/9')
    expect(results[0].excerpt).toContain('builder')
    expect(results[0].excerpt).toContain('parte 2/9')
  })

  test.each(['2020-08-04', '2020-08-16', '2020-08-18', '2020-09-06', '2020-09-14'])('retrieves the actual narrated event for %s', async (date) => {
    const docs = new AgentDocumentStore(resolvePbtAdminKnowledgeDirectory(true))
    const result = (await docs.search(date))[0]
    expect(result.id).toBe('pbt-juand-history')
    expect(result.excerpt).toContain(date)
    expect(result.excerpt).toContain('[juand-rtf]')
    expect(result.excerpt!.length).toBeLessThanOrEqual(1200)
    if (date === '2020-09-14') expect(result.excerpt).not.toContain('2020-09-06')
  })

  test('keeps author uncertainty, hypothetical relationships and private source outside distributed knowledge', async () => {
    const docs = new AgentDocumentStore(resolvePbtAdminKnowledgeDirectory(true))
    expect((await docs.read('pbt-juand')).body).toContain('quién escribió la historia queda pendiente')
    expect((await docs.read('pbt-character-itsbatsy')).body).toContain('hipótesis del narrador y no hechos')
    expect((await docs.read('pbt-character-pbtinadev')).body).toContain('Alicia BT')
    for (const entry of await docs.list()) {
      const { body } = await docs.read(entry.id)
      expect(body).not.toMatch(/\b(?:\d{1,2} años|diegogamer16|alonsoneitor|neitorgg)\b/i)
      expect(body).not.toContain('colegio de')
      expect(body).not.toContain('\uFFFD')
    }
  })

  test('keeps provenance explicit and never mistakes editorial lore for verified public history', async () => {
    const directory = resolvePbtAdminKnowledgeDirectory(true)
    const sources = JSON.parse(await readFile(join(directory, 'sources.json'), 'utf8'))
    const canonical = sources.sources.find((source: { id: string }) => source.id === 'maintainer-10b')
    expect(canonical.publiclyVerified).toBe(false)
    const docs = new AgentDocumentStore(directory)
    for (const entry of await docs.list()) {
      const { body } = await docs.read(entry.id)
      expect(body).toContain('sources.json')
      expect(body).not.toMatch(/PbtinaDev (?:es el|is he|és el)/)
      for (const source of body.matchAll(/\[([^\]]+)\]/g)) {
        for (const id of source[1].split(' y ')) expect(sources.sources.some((entry: { id: string }) => entry.id === id)).toBe(true)
      }
    }
    expect((await docs.read('pbt-fnf-lore')).body).toContain('No se han verificado públicamente fechas')
  })
})
