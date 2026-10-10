import { expect, test } from 'vitest'
import { Settings } from './setting'
import { SettingSchema } from './setting.schema'

test('new and old profiles default to disabled; invalid input is safe', () => {
  expect(SettingSchema.parse({}).lowResourceMode).toBe(false)
  expect(SettingSchema.parse({ lowResourceMode: 'true' }).lowResourceMode).toBe(false)
})
test('round trip preserves the preference and Minecraft, language and agent choices', () => {
  const initial = new Settings()
  initial.config(SettingSchema.parse({ agentModel: 'user-model', locale: 'ca', globalMaxMemory: 2048 }))
  initial.lowResourceModeSet(true)
  const reopened = new Settings()
  reopened.config(SettingSchema.parse(JSON.parse(JSON.stringify(initial))))
  expect(reopened.lowResourceMode).toBe(true)
  expect(reopened.agentModel).toBe('user-model')
  expect(reopened.locale).toBe('ca')
  expect(reopened.globalMaxMemory).toBe(2048)
  reopened.lowResourceModeSet(false)
  expect(reopened.lowResourceMode).toBe(false)
})
