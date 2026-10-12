import { expect, test } from 'vitest'
import { minecraftPresenceStatus } from './minecraftPresence'

test('unknown and missing presence are never classified as offline or online', () => {
  expect(minecraftPresenceStatus()).toBe('unknown')
  expect(minecraftPresenceStatus({ state: 'unavailable', titleName: 'Minecraft' })).toBe('unknown')
})
test('only confirmed backend states produce online, playing, away or offline', () => {
  expect(minecraftPresenceStatus({ state: 'Online' })).toBe('online')
  expect(minecraftPresenceStatus({ state: 'Online', titleName: 'Minecraft' })).toBe('playing')
  expect(minecraftPresenceStatus({ state: 'Away' })).toBe('away')
  expect(minecraftPresenceStatus({ state: 'Offline', titleName: 'Minecraft' })).toBe('offline')
})
test('native Java statuses distinguish playing from launcher online and override stale Xbox data', () => {
  expect(minecraftPresenceStatus(undefined, { status: 'ONLINE' })).toBe('online')
  for (const status of ['PLAYING_OFFLINE', 'PLAYING_REALMS', 'PLAYING_SERVER', 'PLAYING_HOSTED_SERVER']) expect(minecraftPresenceStatus(undefined, { status })).toBe('playing')
  expect(minecraftPresenceStatus({ state: 'Online' }, { status: 'OFFLINE' })).toBe('offline')
  expect(minecraftPresenceStatus({ state: 'Online' }, { status: 'unavailable' })).toBe('unknown')
})
