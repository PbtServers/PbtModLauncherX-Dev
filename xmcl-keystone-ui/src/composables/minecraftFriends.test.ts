import { effectScope, nextTick, ref, type EffectScope } from 'vue'
import { AUTHORITY_MICROSOFT } from '@xmcl/runtime-api'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useMinecraftFriendsImpl } from './minecraftFriends'

const backend = vi.hoisted(() => ({ getFriends: vi.fn(), getFriendsPreferences: vi.fn(), setFriendsPreferences: vi.fn() }))
vi.mock('./service', () => ({ useService: () => backend }))
vi.mock('./user', () => ({ kUserContext: Symbol('UserContext') }))
let scope: EffectScope
let browser: EventTarget
beforeEach(() => {
  vi.useFakeTimers()
  vi.resetAllMocks()
  browser = new EventTarget()
  Object.assign(browser, { setInterval, clearInterval })
  vi.stubGlobal('window', browser)
  vi.stubGlobal('document', Object.assign(new EventTarget(), { visibilityState: 'visible' }))
  backend.getFriendsPreferences.mockResolvedValue({ friendsEnabled: true, acceptInvites: true })
  scope = effectScope()
})
afterEach(() => { scope.stop(); vi.useRealTimers(); vi.unstubAllGlobals() })
const user = (id: string) => ({ id, authority: AUTHORITY_MICROSOFT, invalidated: false } as any)
const list = (name: string) => ({ friends: [{ profileId: name, name }], incomingRequests: [], outgoingRequests: [], fetchedAt: 1 })
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}

test('fetches immediately after login and joins concurrent refreshes', async () => {
  const request = deferred<any>()
  backend.getFriends.mockReturnValue(request.promise)
  const profile = ref(user('a'))
  const friends = scope.run(() => useMinecraftFriendsImpl({ userProfile: profile }))!
  const refresh = friends.refresh()
  expect(backend.getFriends).toHaveBeenCalledTimes(1)
  expect(backend.getFriends).toHaveBeenCalledWith(profile.value, true)
  request.resolve(list('a'))
  await refresh
  expect(friends.data.value?.friends[0].name).toBe('a')
  expect(friends.loading.value).toBe(false)
})
test('late list and privacy replies from the previous account never leak into the new account', async () => {
  const a = deferred<any>(); const prefs = deferred<any>()
  backend.getFriends.mockReturnValueOnce(a.promise).mockResolvedValueOnce(list('b'))
  backend.getFriendsPreferences.mockReturnValueOnce(prefs.promise).mockResolvedValueOnce({ friendsEnabled: false, acceptInvites: false })
  const profile = ref(user('a'))
  const friends = scope.run(() => useMinecraftFriendsImpl({ userProfile: profile }))!
  profile.value = user('b')
  await nextTick(); await nextTick()
  expect(backend.getFriends.mock.calls.map(([profile]) => profile.id)).toEqual(['a', 'b'])
  a.resolve(list('a')); prefs.resolve({ friendsEnabled: true, acceptInvites: true })
  await nextTick(); await nextTick()
  expect(friends.data.value?.friends[0].name).toBe('b')
  expect(friends.preferences.value?.acceptInvites).toBe(false)
})
test('forces synchronization when Internet returns and removes listeners on disposal', async () => {
  backend.getFriends.mockResolvedValue(list('a'))
  const profile = ref(user('a'))
  const friends = scope.run(() => useMinecraftFriendsImpl({ userProfile: profile }))!
  await friends.refresh()
  browser.dispatchEvent(new Event('online'))
  await nextTick()
  expect(backend.getFriends).toHaveBeenCalledTimes(2)
  expect(backend.getFriends).toHaveBeenLastCalledWith(profile.value, true)
  scope.stop()
  browser.dispatchEvent(new Event('online'))
  expect(backend.getFriends).toHaveBeenCalledTimes(2)
})
