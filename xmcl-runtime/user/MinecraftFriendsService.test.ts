import { describe, expect, afterEach, it, vi } from 'vitest'
import { AUTHORITY_MICROSOFT, Exception, type UserProfile } from '@xmcl/runtime-api'
import { UnauthorizedError } from '@xmcl/user'
import { MinecraftFriendsService } from './MinecraftFriendsService'
import { kSettings } from '~/settings'
vi.mock('~/settings', () => ({ kSettings: Symbol('settings') }))
vi.mock('~/launch', () => ({ LaunchService: class {} }))

vi.mock('~/app', () => ({
  Inject: () => () => undefined,
  LauncherApp: class {},
  LauncherAppKey: Symbol('LauncherAppKey'),
  kGameDataPath: Symbol('kGameDataPath'),
}))

function createUser(id: string, expiredAt = Date.now() - 1_000): UserProfile {
  return {
    id,
    username: `${id}@example.invalid`,
    authority: AUTHORITY_MICROSOFT,
    expiredAt,
    invalidated: false,
    profiles: {},
    selectedProfile: '',
  }
}

function createService(tokens: Record<string, string | undefined>, refreshUser = vi.fn()) {
  const storage = {
    get: vi.fn(async (user: UserProfile) => tokens[user.id]),
  }
  const settings = {
    minecraftFriendsPresenceSharing: {} as Record<string, boolean>,
    minecraftFriendsPresenceSharingSet: vi.fn((input: { userId: string; enabled: boolean }) => { settings.minecraftFriendsPresenceSharing[input.userId] = input.enabled }),
  }
  const gameProcesses = vi.fn(async (): Promise<any[]> => [])
  const app = {
    getLogger: () => ({ log: vi.fn(), warn: vi.fn(), error: vi.fn() }),
    registry: {
      get: vi.fn(async key => key === kSettings ? settings : storage),
      getOrCreate: vi.fn(async () => ({ getGameProcesses: gameProcesses })),
    },
  } as any
  const service = new MinecraftFriendsService(app, {} as any, { refreshUser } as any)
  return { service, storage, refreshUser, settings, gameProcesses }
}

describe('MinecraftFriendsService authentication retry policy', () => {
  function presenceFixture() {
    const context = createService({ user: 'access-token' })
    const api = {
      getFriends: vi.fn(async () => ({ friends: [{ profileId: '11111111111111111111111111111111', name: 'Friend' }], incomingRequests: [], outgoingRequests: [] })),
      getPlayerAttributes: vi.fn(async () => ({ friendsPreferences: { friends: 'ENABLED', acceptInvites: 'ENABLED' } })),
      updatePlayerAttributes: vi.fn(),
      updateFriendsPresence: vi.fn(async (_token: string, _status: 'ONLINE' | 'OFFLINE') => [{ profileId: '11111111111111111111111111111111', status: 'ONLINE' }]),
    }
    Object.assign(context.service, { mojangApi: api })
    return { ...context, api }
  }
  it('never publishes presence or changes remote privacy without per-account consent', async () => {
    const { service, api } = presenceFixture()
    expect((await service.getFriends(createUser('user'))).presenceStatus).toBe('disabled')
    expect(api.updateFriendsPresence).not.toHaveBeenCalled()
    expect(api.updatePlayerAttributes).not.toHaveBeenCalled()
  })
  it('maps confirmed native presence after consent, including a fresh presence response for a 304 list', async () => {
    const { service, api, settings } = presenceFixture()
    settings.minecraftFriendsPresenceSharing.user = true
    const first = await service.getFriends(createUser('user'))
    expect(first.friends[0].presence?.status).toBe('ONLINE')
    api.getFriends.mockResolvedValueOnce({ notModified: true } as any)
    api.updateFriendsPresence.mockResolvedValueOnce([{ profileId: '11111111111111111111111111111111', status: 'OFFLINE' }])
    vi.useFakeTimers(); vi.setSystemTime(Date.now() + 61_000)
    const second = await service.getFriends(createUser('user'))
    expect(second.friends[0].presence?.status).toBe('OFFLINE')
    expect(api.updateFriendsPresence).toHaveBeenCalledTimes(2)
  })
  it('does not overwrite the presence of a running Minecraft client', async () => {
    const { service, api, settings, gameProcesses } = presenceFixture()
    settings.minecraftFriendsPresenceSharing.user = true
    gameProcesses.mockResolvedValue([{ side: 'client', options: { user: { id: 'user' } } }])
    expect((await service.getFriends(createUser('user'))).presenceStatus).toBe('game')
    expect(api.updateFriendsPresence).not.toHaveBeenCalled()
  })
  it('clears stale online states and bounds retries when presence temporarily fails', async () => {
    const { service, api, settings } = presenceFixture()
    settings.minecraftFriendsPresenceSharing.user = true
    api.updateFriendsPresence.mockRejectedValue(new Error('temporary failure'))
    const first = await service.getFriends(createUser('user'))
    expect(first.presenceStatus).toBe('unavailable')
    expect(first.friends[0].presence).toBeUndefined()
    await service.getFriends(createUser('user'), true)
    expect(api.updateFriendsPresence).toHaveBeenCalledTimes(1)
  })
  it('stores local presence consent independently of remote invite privacy', async () => {
    const { service, api, settings } = presenceFixture()
    await service.setFriendsPreferences(createUser('user'), { sharePresence: true })
    expect(settings.minecraftFriendsPresenceSharing.user).toBe(true)
    expect(api.updatePlayerAttributes).not.toHaveBeenCalled()
  })
  it('withdraws only presence published by this launcher when sharing is disabled', async () => {
    const { service, api, settings } = presenceFixture()
    settings.minecraftFriendsPresenceSharing.user = true
    await service.getFriends(createUser('user'))
    await service.setFriendsPreferences(createUser('user'), { sharePresence: false })
    expect(api.updateFriendsPresence.mock.calls.map(call => call[1])).toEqual(['ONLINE', 'OFFLINE'])
    expect(settings.minecraftFriendsPresenceSharing.user).toBe(false)
    expect(api.updatePlayerAttributes).not.toHaveBeenCalled()
  })
  it('does not withdraw game-owned presence when disabling launcher sharing', async () => {
    const { service, api, settings, gameProcesses } = presenceFixture()
    settings.minecraftFriendsPresenceSharing.user = true
    await service.getFriends(createUser('user'))
    gameProcesses.mockResolvedValue([{ side: 'client', options: { user: { id: 'user' } } }])
    await service.setFriendsPreferences(createUser('user'), { sharePresence: false })
    expect(api.updateFriendsPresence).toHaveBeenCalledTimes(1)
    expect(api.updatePlayerAttributes).not.toHaveBeenCalled()
  })
  it('allows receiving invites when the backend has no preference and never writes remote privacy automatically', async () => {
    const { service } = createService({ user: 'access-token' })
    const api = { getPlayerAttributes: vi.fn(async () => ({})), updatePlayerAttributes: vi.fn() }
    Object.assign(service, { mojangApi: api })
    expect(await service.getFriendsPreferences(createUser('user'))).toEqual({ friendsEnabled: true, acceptInvites: true, sharePresence: false })
    expect(api.updatePlayerAttributes).not.toHaveBeenCalled()
  })
  it('respects existing restrictions and merges only the privacy preference explicitly changed', async () => {
    const { service } = createService({ user: 'access-token' })
    const api = { getPlayerAttributes: vi.fn(async () => ({ friendsPreferences: { friends: 'DISABLED', acceptInvites: 'DISABLED' } })), updatePlayerAttributes: vi.fn(async () => {}) }
    Object.assign(service, { mojangApi: api })
    expect(await service.getFriendsPreferences(createUser('user'))).toEqual({ friendsEnabled: false, acceptInvites: false, sharePresence: false })
    await service.setFriendsPreferences(createUser('user'), { acceptInvites: true })
    expect(api.updatePlayerAttributes).toHaveBeenCalledWith('access-token', { friendsEnabled: false, acceptInvites: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not refresh repeatedly for a stale renderer expiry timestamp', async () => {
    const { service, refreshUser } = createService({ user: 'access-token' })

    await expect((service as any).getToken(createUser('user'))).resolves.toBe('access-token')

    expect(refreshUser).not.toHaveBeenCalled()
  })

  it('accepts the token after recovering a stale invalidated profile', async () => {
    const { service, refreshUser } = createService({ user: 'fresh-token' })

    await expect((service as any).getToken({ ...createUser('user'), invalidated: true })).resolves.toBe('fresh-token')
    await expect((service as any).getToken({ ...createUser('user'), invalidated: true })).resolves.toBe('fresh-token')

    expect(refreshUser).not.toHaveBeenCalled()
  })

  it('bounds missing-token refreshes per user', async () => {
    const { service, refreshUser } = createService({ first: undefined, second: undefined })
    refreshUser.mockRejectedValue(new Error('refresh unavailable'))

    await expect((service as any).getToken(createUser('first'))).rejects.toMatchObject({
      name: 'UserAuthenticationError',
      exception: { type: 'userAuthentication' },
    })
    await expect((service as any).getToken(createUser('first'))).rejects.toBeInstanceOf(Exception)
    await expect((service as any).getToken(createUser('second'))).rejects.toThrow('No access token')

    expect(refreshUser).toHaveBeenCalledTimes(2)
    expect(refreshUser).toHaveBeenNthCalledWith(1, 'first', { silent: true, force: true })
    expect(refreshUser).toHaveBeenNthCalledWith(2, 'second', { silent: true, force: true })
  })

  it('bounds repeated 401 retries after a refreshed token is rejected', async () => {
    vi.useFakeTimers()
    const tokens = { user: 'stale-token' }
    const { service, refreshUser } = createService(tokens)
    refreshUser.mockResolvedValueOnce(undefined)

    const operation = vi.fn()
      .mockRejectedValueOnce(new UnauthorizedError({}))
      .mockRejectedValueOnce(new UnauthorizedError({}))
      .mockRejectedValueOnce(new UnauthorizedError({}))
      .mockResolvedValueOnce('ok')
    await expect((service as any).withFreshToken(createUser('user'), operation)).rejects.toBeInstanceOf(UnauthorizedError)
    await expect((service as any).withFreshToken(createUser('user'), operation)).rejects.toThrow('temporarily unavailable')
    expect(refreshUser).toHaveBeenCalledOnce()
  })

  it('uses a refreshed token and permits recovery after the cooldown expires', async () => {
    vi.useFakeTimers()
    const tokens = { user: 'stale-token' }
    const { service, refreshUser } = createService(tokens)
    let refreshCount = 0
    refreshUser.mockImplementation(async () => {
      tokens.user = `fresh-token-${++refreshCount}`
    })
    const operation = vi.fn()
      .mockRejectedValueOnce(new UnauthorizedError({}))
      .mockResolvedValueOnce('recovered')
      .mockRejectedValueOnce(new UnauthorizedError({}))
      .mockRejectedValueOnce(new UnauthorizedError({}))
      .mockRejectedValueOnce(new UnauthorizedError({}))
      .mockRejectedValueOnce(new UnauthorizedError({}))
      .mockResolvedValueOnce('recovered-after-cooldown')

    await expect((service as any).withFreshToken(createUser('user'), operation)).resolves.toBe('recovered')
    await expect((service as any).withFreshToken(createUser('user'), operation)).rejects.toBeInstanceOf(UnauthorizedError)
    await expect((service as any).withFreshToken(createUser('user'), operation)).rejects.toThrow('temporarily unavailable')
    vi.advanceTimersByTime(60_001)
    await expect((service as any).withFreshToken(createUser('user'), operation)).resolves.toBe('recovered-after-cooldown')

    expect(tokens.user).toBe('fresh-token-3')
    expect(refreshUser).toHaveBeenCalledTimes(3)
  })
})
