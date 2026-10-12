import { expect, test, vi } from 'vitest'
import { MojangClient, MojangFriendsError, UnauthorizedError } from './mojang'

test('uses the authenticated native presence endpoint and normalizes confirmed profile IDs', async () => {
  const request = vi.fn(async () => new Response(JSON.stringify({ presence: [
    { profileId: '11111111-1111-1111-1111-111111111111', status: 'ONLINE', lastUpdated: '2026-10-12T07:00:00Z' },
    { profileId: 'not-a-profile', status: 'ONLINE' },
  ] })))
  const client = new MojangClient({ fetch: request as any })
  expect(await client.updateFriendsPresence('test-token', 'ONLINE')).toEqual([{ profileId: '11111111111111111111111111111111', status: 'ONLINE', lastUpdated: '2026-10-12T07:00:00Z' }])
  expect(request).toHaveBeenCalledWith('https://api.minecraftservices.com/presence', expect.objectContaining({ method: 'POST', body: '{"status":"ONLINE"}', headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) }))
})
test('does not turn missing, forbidden or malformed presence into offline', async () => {
  const request = vi.fn()
  const client = new MojangClient({ fetch: request as any })
  request.mockResolvedValueOnce(new Response('{}', { status: 401 }))
  await expect(client.updateFriendsPresence('test-token', 'ONLINE')).rejects.toBeInstanceOf(UnauthorizedError)
  request.mockResolvedValueOnce(new Response('{}', { status: 403 }))
  await expect(client.updateFriendsPresence('test-token', 'ONLINE')).rejects.toBeInstanceOf(MojangFriendsError)
  request.mockResolvedValueOnce(new Response('{}'))
  await expect(client.updateFriendsPresence('test-token', 'ONLINE')).rejects.toThrow('Invalid Minecraft presence response')
})
