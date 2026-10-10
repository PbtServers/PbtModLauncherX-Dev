import { expect, it } from 'vitest'
import { createLocalMultiplayerRoomApi } from './localMultiplayerPolicy'

it('supports local ICE initialization without network, account or relay credentials', async () => {
  const api = createLocalMultiplayerRoomApi()
  await expect(api.getIceServerCredential()).resolves.toEqual({ stuns: [], servers: [], ttl: 300 })
  await expect(api.createRoom('local', 8)).rejects.toThrow('pbt_xmcl_cloud_disabled')
})
