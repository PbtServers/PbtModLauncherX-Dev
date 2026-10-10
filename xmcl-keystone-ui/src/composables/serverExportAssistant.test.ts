import { expect, test } from 'vitest'
import { serverExportAssistantContext, type ServerExportPlan } from '@xmcl/runtime-api'
import { buildAgentSystemPrompt } from './agent/prompt'

test('PbtAdmin receives both axes, provenance and actual selection without private paths', () => {
  const plan = { minecraft: '26.1', loader: 'fabric', loaderVersion: 'fixture', warnings: [], blockers: [], mods: [{ path: 'mods/private.jar', ids: ['fixture'], version: '1.0', side: 'both', selected: true, evidence: [], required: ['library'], classification: { originalType: 'both', originalServer: 'unknown', userDecision: { server: 'recommended' }, type: { value: 'both', evidence: [{ source: 'descriptor', reason: 'descriptor', confidence: 'high' }] }, server: { value: 'recommended', evidence: [{ source: 'user', reason: 'userDecision', confidence: 'user' }] } } }] } as unknown as ServerExportPlan
  const data = JSON.parse(serverExportAssistantContext(plan, []))
  expect(data.mods[0]).toMatchObject({ side: 'both', necessity: 'recommended', selected: false, required: ['library'], classification: { originalServer: 'unknown', userDecision: { server: 'recommended' } } })
  expect(data.mods[0].classification.server[0].source).toBe('user')
  expect(JSON.stringify(data)).not.toContain('private.jar')
})

test('server export assistant shares only evidence after explicit UI consent and requires no private tools', () => {
  const plan = { minecraft: '26.1', loader: 'fabric', loaderVersion: 'fixture', recommendedMemoryMiB: 4096, warnings: [], blockers: [], files: [{ path: 'G:/Private/config.json', contents: 'PASSWORD_PRIVATE' }], tokens: 'TOKEN_PRIVATE', mods: [{ path: 'G:/Private/user/mod.jar', archivePath: 'mods/user.jar', ids: ['create'], version: 'fixture', side: 'both', evidence: ['fabric.environment=*'], required: [], privateLog: 'LOG_PRIVATE' }] } as unknown as ServerExportPlan
  const evidence = serverExportAssistantContext(plan)
  for (const secret of ['G:/Private', 'PASSWORD_PRIVATE', 'TOKEN_PRIVATE', 'LOG_PRIVATE', 'mods/user.jar']) expect(evidence).not.toContain(secret)
  expect(evidence).toContain('26.1'); expect(evidence).toContain('create')
  const prompt = buildAgentSystemPrompt({ role: 'launcher-main', locale: 'es-ES', readonly: true, tools: [], sessionContext: { scope: 'global' } })
  expect(prompt).toContain('PbtAdmin')
  expect(prompt).toContain('Available tools: (none)')
  expect(prompt).not.toContain('Instance path:')
  expect(prompt).not.toContain('Selected user id:')
  expect(prompt).toContain('Never invent hardware')
})
