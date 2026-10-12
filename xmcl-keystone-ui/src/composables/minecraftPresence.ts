import type { XboxPresenceInfo } from '@xmcl/runtime-api'

export function minecraftPresenceStatus(presence?: XboxPresenceInfo, native?: { status: string }): 'unknown' | 'offline' | 'online' | 'playing' | 'away' {
  if (native) {
    switch (native.status) {
      case 'OFFLINE': return 'offline'
      case 'ONLINE': return 'online'
      case 'PLAYING_OFFLINE':
      case 'PLAYING_REALMS':
      case 'PLAYING_SERVER':
      case 'PLAYING_HOSTED_SERVER': return 'playing'
      default: return 'unknown'
    }
  }
  switch (presence?.state?.toLowerCase()) {
    case 'offline': return 'offline'
    case 'online': return presence?.titleName ? 'playing' : 'online'
    case 'away': return 'away'
    default: return 'unknown'
  }
}
