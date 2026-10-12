import {
  AUTHORITY_MICROSOFT,
  type MinecraftFriendsList,
  type MinecraftFriendsPreferences,
  type MinecraftFriendsService as IMinecraftFriendsService,
  MinecraftFriendsServiceKey,
  Exception,
  type UserProfile,
} from '@xmcl/runtime-api'
import { MojangClient, MojangFriendsError, UnauthorizedError } from '@xmcl/user'
import { AnyError } from '@xmcl/utils'
import { Inject, LauncherApp, LauncherAppKey } from '~/app'
import { AbstractService, ExposeServiceKey } from '~/service'
import { kUserTokenStorage } from '~/user'
import { UserService } from './UserService'
import { translateMojangFriendsError } from './MinecraftFriendsErrors'
import { kSettings } from '~/settings'
import { LaunchService } from '~/launch'

class UserAuthenticationError extends Exception<{ type: 'userAuthentication' }> {
  name = 'UserAuthenticationError'

  constructor(message: string, options?: ErrorOptions) {
    super({ type: 'userAuthentication' }, message, options)
  }
}
const MinecraftFriendsUnsupportedError = AnyError.make('MinecraftFriendsUnsupportedError')
const AUTH_FAILURE_COOLDOWN_MS = 60_000

interface CacheEntry {
  data: MinecraftFriendsList
  etag?: string
  expiresAt: number
  inFlight?: Promise<MinecraftFriendsList>
}

/**
 * Keep the cache aligned with the renderer's polling interval so repeated
 * consumers do not issue additional conditional requests between ticks.
 */
const REFRESH_COOLDOWN_MS = 60_000

@ExposeServiceKey(MinecraftFriendsServiceKey)
export class MinecraftFriendsService extends AbstractService implements IMinecraftFriendsService {
  private cache = new Map<string, CacheEntry>()
  private authFailureUntil = new Map<string, number>()
  private presenceFailureUntil = new Map<string, number>()
  private publishedPresence = new Set<string>()

  constructor(
    @Inject(LauncherAppKey) app: LauncherApp,
    @Inject(MojangClient) private mojangApi: MojangClient,
    @Inject(UserService) private userService: UserService,
  ) {
    super(app)
  }

  async getFriends(user: UserProfile, force?: boolean): Promise<MinecraftFriendsList> {
    this.assertSupported(user)
    const now = Date.now()
    const entry = this.cache.get(user.id)

    if (entry?.inFlight) return entry.inFlight
    if (!force && entry && entry.expiresAt > now) return entry.data

    const promise = (async () => {
      try {
        const result = await this.withFreshToken(user, (token) =>
          this.mojangApi.getFriends(token, force ? undefined : entry?.etag),
        )
        if ('notModified' in result) {
          // Server says nothing changed — extend the cache window and reuse
          // the previous data.
          if (entry) {
            entry.data = await this.withPresence(user, { ...entry.data, fetchedAt: Date.now() })
            entry.expiresAt = Date.now() + REFRESH_COOLDOWN_MS
            if (result.etag) entry.etag = result.etag
            return entry.data
          }
          // Fallthrough — should not happen (no cached data + 304) but be
          // defensive: re-fetch without etag.
          const fresh = await this.withFreshToken(user, (token) => this.mojangApi.getFriends(token))
          if ('notModified' in fresh) {
            const empty: MinecraftFriendsList = {
              friends: [], incomingRequests: [], outgoingRequests: [], fetchedAt: Date.now(),
            }
            this.cache.set(user.id, { data: empty, expiresAt: Date.now() + REFRESH_COOLDOWN_MS })
            return empty
          }
          const data: MinecraftFriendsList = await this.withPresence(user, {
            friends: fresh.friends,
            incomingRequests: fresh.incomingRequests,
            outgoingRequests: fresh.outgoingRequests,
            fetchedAt: Date.now(),
          })
          this.cache.set(user.id, { data, etag: fresh.etag, expiresAt: Date.now() + REFRESH_COOLDOWN_MS })
          return data
        }
        const data: MinecraftFriendsList = await this.withPresence(user, {
          friends: result.friends,
          incomingRequests: result.incomingRequests,
          outgoingRequests: result.outgoingRequests,
          fetchedAt: Date.now(),
        })
        this.cache.set(user.id, { data, etag: result.etag, expiresAt: Date.now() + REFRESH_COOLDOWN_MS })
        return data
      } catch (e) {
        throw this.translateError(e)
      } finally {
        const cached = this.cache.get(user.id)
        if (cached) cached.inFlight = undefined
      }
    })()

    if (entry) {
      entry.inFlight = promise
    } else {
      this.cache.set(user.id, {
        data: { friends: [], incomingRequests: [], outgoingRequests: [], fetchedAt: 0 },
        expiresAt: 0,
        inFlight: promise,
      })
    }
    return promise
  }

  async addFriendByName(user: UserProfile, name: string): Promise<void> {
    this.assertSupported(user)
    const trimmed = name.trim()
    if (!trimmed) {
      throw new AnyError('MinecraftFriendsError', 'Player name cannot be empty')
    }
    try {
      await this.withFreshToken(user, (token) => this.mojangApi.addFriend(token, { name: trimmed }))
    } catch (e) {
      throw this.translateError(e)
    }
    this.invalidate(user.id)
  }

  async acceptFriendRequest(user: UserProfile, profileId: string): Promise<void> {
    this.assertSupported(user)
    try {
      await this.withFreshToken(user, (token) => this.mojangApi.addFriend(token, { profileId }))
    } catch (e) {
      throw this.translateError(e)
    }
    this.invalidate(user.id)
  }

  async declineFriendRequest(user: UserProfile, profileId: string): Promise<void> {
    return this.removeByProfileId(user, profileId)
  }

  async revokeFriendRequest(user: UserProfile, profileId: string): Promise<void> {
    return this.removeByProfileId(user, profileId)
  }

  async removeFriend(user: UserProfile, profileId: string): Promise<void> {
    return this.removeByProfileId(user, profileId)
  }

  async getFriendsPreferences(user: UserProfile): Promise<MinecraftFriendsPreferences> {
    this.assertSupported(user)
    try {
      const attrs = await this.withFreshToken(user, (token) => this.mojangApi.getPlayerAttributes(token))
      return {
        friendsEnabled: attrs.friendsPreferences?.friends !== 'DISABLED',
        acceptInvites: attrs.friendsPreferences?.acceptInvites !== 'DISABLED',
        sharePresence: (await this.app.registry.get(kSettings)).minecraftFriendsPresenceSharing[user.id] === true,
      }
    } catch (e) {
      throw this.translateError(e)
    }
  }

  async setFriendsPreferences(user: UserProfile, prefs: Partial<MinecraftFriendsPreferences>): Promise<MinecraftFriendsPreferences> {
    this.assertSupported(user)
    if (prefs.sharePresence !== undefined) {
      const settings = await this.app.registry.get(kSettings)
      settings.minecraftFriendsPresenceSharingSet({ userId: user.id, enabled: prefs.sharePresence })
      this.invalidate(user.id)
      if (!prefs.sharePresence && this.publishedPresence.has(user.id)) {
        // Finish an existing ONLINE request before withdrawing our own presence.
        // Never overwrite presence owned by a running Minecraft client.
        await this.cache.get(user.id)?.inFlight?.catch(() => {})
        try {
          const launch = await this.app.registry.getOrCreate(LaunchService)
          if (!settings.minecraftFriendsPresenceSharing[user.id] && !(await launch.getGameProcesses()).some(p => p.side !== 'server' && p.options.user?.id === user.id)) {
            await this.withFreshToken(user, token => this.mojangApi.updateFriendsPresence(token, 'OFFLINE'))
          }
        } catch { /* Keep local sharing disabled when the provider is unavailable. */ }
        if (!settings.minecraftFriendsPresenceSharing[user.id]) this.publishedPresence.delete(user.id)
      }
      if (prefs.friendsEnabled === undefined && prefs.acceptInvites === undefined) return this.getFriendsPreferences(user)
    }
    try {
      // The API requires both fields; merge with current values when only one is provided.
      let friendsEnabled = prefs.friendsEnabled
      let acceptInvites = prefs.acceptInvites
      if (friendsEnabled === undefined || acceptInvites === undefined) {
        const attrs = await this.withFreshToken(user, (token) => this.mojangApi.getPlayerAttributes(token))
        if (friendsEnabled === undefined) {
          friendsEnabled = attrs.friendsPreferences?.friends !== 'DISABLED'
        }
        if (acceptInvites === undefined) {
          acceptInvites = attrs.friendsPreferences?.acceptInvites !== 'DISABLED'
        }
      }
      await this.withFreshToken(user, (token) => this.mojangApi.updatePlayerAttributes(token, {
        friendsEnabled,
        acceptInvites,
      }))
      return { friendsEnabled: friendsEnabled!, acceptInvites: acceptInvites!, sharePresence: (await this.app.registry.get(kSettings)).minecraftFriendsPresenceSharing[user.id] === true }
    } catch (e) {
      throw this.translateError(e)
    }
  }

  // ---------- helpers ----------

  private async withPresence(user: UserProfile, data: MinecraftFriendsList): Promise<MinecraftFriendsList> {
    const unknown = { ...data, friends: data.friends.map(({ presence: _presence, xboxPresence: _xbox, ...friend }) => friend) }
    const settings = await this.app.registry.get(kSettings)
    if (!settings.minecraftFriendsPresenceSharing[user.id]) return { ...unknown, presenceStatus: 'disabled' }
    if (!data.friends.length) return { ...unknown, presenceStatus: 'available' }
    // An active Minecraft client owns its presence. Never overwrite its world,
    // server or hidden status with a launcher's generic ONLINE heartbeat.
    if ((this.presenceFailureUntil.get(user.id) ?? 0) > Date.now()) return { ...unknown, presenceStatus: 'unavailable' }
    try {
      const launch = await this.app.registry.getOrCreate(LaunchService)
      if ((await launch.getGameProcesses()).some(p => p.side !== 'server' && p.options.user?.id === user.id)) return { ...unknown, presenceStatus: 'game' }
      if (!(await this.getFriendsPreferences(user)).friendsEnabled) return { ...unknown, presenceStatus: 'disabled' }
      const records = await this.withFreshToken(user, token => this.mojangApi.updateFriendsPresence(token, 'ONLINE'))
      this.publishedPresence.add(user.id)
      if (!settings.minecraftFriendsPresenceSharing[user.id]) return { ...unknown, presenceStatus: 'disabled' }
      const byProfile = new Map(records.map(record => [record.profileId, record]))
      return { ...unknown, presenceStatus: 'available', friends: unknown.friends.map(friend => {
        const record = byProfile.get(friend.profileId.replace(/-/g, '').toLowerCase())
        return record ? { ...friend, presence: { status: record.status, lastUpdated: record.lastUpdated } } : friend
      }) }
    } catch {
      this.presenceFailureUntil.set(user.id, Date.now() + REFRESH_COOLDOWN_MS)
      return { ...unknown, presenceStatus: 'unavailable' }
    }
  }

  private async removeByProfileId(user: UserProfile, profileId: string): Promise<void> {
    this.assertSupported(user)
    try {
      await this.withFreshToken(user, (token) => this.mojangApi.removeFriend(token, { profileId }))
    } catch (e) {
      throw this.translateError(e)
    }
    this.invalidate(user.id)
  }

  private invalidate(userId: string) {
    const entry = this.cache.get(userId)
    if (entry) entry.expiresAt = 0
  }

  private assertSupported(user: UserProfile) {
    if (user.authority !== AUTHORITY_MICROSOFT) {
      throw new MinecraftFriendsUnsupportedError(
        'Minecraft friends are only available for Microsoft accounts',
      )
    }
  }

  private async getToken(user: UserProfile, force = false): Promise<string> {
    const userTokenStorage = await this.app.registry.get(kUserTokenStorage)
    let token = await userTokenStorage.get(user)
    const now = Date.now()
    const failureUntil = this.authFailureUntil.get(user.id) ?? 0
    let refreshed = false

    // The profile passed by the renderer can be stale after a successful
    // refresh updates UserService state. The token store is the source of
    // truth here; a server-side expiry is handled by withFreshToken's single
    // 401 retry.
    const shouldRefresh = force || !token

    if (failureUntil > now && (force || !token)) {
      throw new UserAuthenticationError('Microsoft account refresh is temporarily unavailable')
    }

    if (shouldRefresh) {
      // Route refreshes through UserService so startup, launch, and a 401
      // retry share its per-user Singleton lock.
      try {
        await this.userService.refreshUser(user.id, {
          silent: true,
          force: force || !token,
        })
        refreshed = true
        this.authFailureUntil.delete(user.id)
      } catch (e) {
        this.authFailureUntil.set(user.id, Date.now() + AUTH_FAILURE_COOLDOWN_MS)
        this.log(`Failed to refresh user ${user.id} before MinecraftFriends call`, e)
      }
      token = await userTokenStorage.get(user)
    }

    if (!token || (shouldRefresh && !refreshed)) {
      this.authFailureUntil.set(user.id, Date.now() + AUTH_FAILURE_COOLDOWN_MS)
      throw new UserAuthenticationError(
        token ? 'Microsoft account refresh failed' : 'No access token available for user',
      )
    }
    return token
  }

  /**
   * Run a Mojang API call with a fresh access token. If the call fails
   * with UnauthorizedError (server-side invalidation, clock skew, etc.),
   * force a token refresh and retry once.
   */
  private async withFreshToken<T>(user: UserProfile, op: (token: string) => Promise<T>): Promise<T> {
    const token = await this.getToken(user)
    try {
      return await op(token)
    } catch (e) {
      if (!(e instanceof UnauthorizedError)) throw e
      const refreshed = await this.getToken(user, true)
      try {
        return await op(refreshed)
      } catch (retryError) {
        if (retryError instanceof UnauthorizedError) {
          this.authFailureUntil.set(user.id, Date.now() + AUTH_FAILURE_COOLDOWN_MS)
        }
        throw retryError
      }
    }
  }

  private translateError(e: unknown): unknown {
    if (e instanceof UnauthorizedError) {
      return new UserAuthenticationError('Minecraft access token is invalid or expired', { cause: e })
    }
    return translateMojangFriendsError(e)
  }
}

export { MojangFriendsError }
