import { describe, expect, it } from 'vitest'
import { buildPbtAdminWorkingPrompt, isPbtAdminConversation, pbtAdminToolNames } from './requestPolicy'
import { boundAgentProviderContext } from './compaction'
import { buildAgentSystemPrompt } from './prompt'
import { readFileSync } from 'node:fs'

describe('PbtAdmin request context policy', () => {
  it.each(['es-ES', 'ca', 'en'])('preserves Unicode error translations in %s', locale => {
    const source = readFileSync(`xmcl-keystone-ui/locales/${locale}.yaml`, 'utf8')
    const messages = JSON.parse(source.match(/^pbtadmin: (\{.*\})$/m)![1])
    expect(messages.ollamaMemory).not.toMatch(/[?\uFFFD]/)
    expect(messages.ollamaTimeout).not.toMatch(/[?\uFFFD]/)
    if (locale === 'es-ES') expect(messages.ollamaMemory).toContain('explícitamente')
    if (locale === 'ca') expect(messages.ollamaMemory).toContain('memòria')
  })
  it.each(['Hola', 'Hello!', 'Bon dia', '¿Quién eres?', '¿Quién es 0ftome?', 'Cuéntame la historia de JuanD', 'Què és Minecraft?'])('keeps %s free of tool schemas', input => {
    expect(isPbtAdminConversation(input)).toBe(true)
    expect(pbtAdminToolNames(input)).toEqual([])
  })
  it.each(['Diagnostica mi instancia', 'Lee el crash log', 'Instala Fabric', 'Comprueba PbtServers', 'Elimina este archivo'])('retains real tools for %s', input => {
    expect(isPbtAdminConversation(input)).toBe(false)
    expect(pbtAdminToolNames(input)).toContain('vfs_shell')
  })
  it('fits identity, localized evidence and a greeting into the actual 4096 context', () => {
    const systemPrompt = buildPbtAdminWorkingPrompt('es-ES', [])
    const messages: any[] = [{ role: 'user', content: 'Local evidence: '.repeat(180), timestamp: 1 }, { role: 'user', content: 'Hola', timestamp: 2 }]
    expect(systemPrompt).toContain('PbtinaDev')
    expect(systemPrompt).toContain('feminine')
    expect(systemPrompt).toContain('PbtServers is the community you assist')
    expect(systemPrompt).toContain('not its owner or creator')
    expect(boundAgentProviderContext({ systemPrompt, messages }, 4096, 1024).messages).toHaveLength(2)
  })
  it('reproduces catalogue exhaustion before a greeting and fits the working diagnostic gateway', () => {
    const tools = [{ name: 'vfs_shell', description: 'Run one allowlisted virtual launcher command; discover syntax with help.', parameters: { type: 'object', properties: { command: { type: 'string' } } } }]
    const messages: any[] = [{ role: 'user', content: 'Hola', timestamp: 1 }]
    const documents = Array.from({ length: 24 }, (_, i) => ({ id: 'pbt-document-' + i, description: 'Documented community narrative, characters, alias and sources. '.repeat(3) }))
    const legacy = buildAgentSystemPrompt({ role: 'launcher-main', locale: 'es-ES', tools, readonly: false, documents })
    expect(() => boundAgentProviderContext({ systemPrompt: legacy, tools, messages }, 4096, 1024)).toThrow('pbtadmin.contextTooSmall')
    const working = buildPbtAdminWorkingPrompt('es-ES', ['vfs_shell'])
    expect(boundAgentProviderContext({ systemPrompt: working, tools, messages }, 4096, 1024).messages).toEqual(messages)
  })
  it('bounds ten turns without changing saved history or replaying tool calls in plain chat', () => {
    const messages: any[] = Array.from({ length: 10 }, (_, i) => [{ role: 'user', content: 'text '.repeat(800), timestamp: i }, { role: 'assistant', content: [{ type: 'text', text: 'answer' }, { type: 'toolCall', id: 'old', name: 'vfs_shell', arguments: {} }], timestamp: i }]).flat()
    messages.push({ role: 'user', content: 'Hola', timestamp: 11 })
    const bounded = boundAgentProviderContext({ systemPrompt: buildPbtAdminWorkingPrompt('ca', []), messages }, 4096, 1024)
    expect(bounded.messages.length).toBeLessThan(messages.length)
    expect(messages).toHaveLength(21)
    expect(JSON.stringify(bounded.messages)).not.toContain('toolCall')
    expect(bounded.messages.at(-1)).toMatchObject({ content: 'Hola' })
  })
})
