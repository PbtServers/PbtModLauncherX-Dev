import type { TogetherRoomApi } from '@xmcl/multiplayer-core/room'

/** Manual SDP/LAN uses host candidates; no paid relay credential is requested. */
export function createLocalMultiplayerRoomApi(): TogetherRoomApi {
  const unavailable = async (): Promise<never> => {
    throw new Error('pbt_xmcl_cloud_disabled')
  }
  return {
    createRoom: unavailable,
    joinRoom: unavailable,
    closeRoom: unavailable,
    getIceServerCredential: async () => ({ stuns: [], servers: [], ttl: 300 }),
  }
}
