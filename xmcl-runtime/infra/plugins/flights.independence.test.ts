import { expect, it, vi } from 'vitest'
import { pluginFlights } from './flights'
import { kFlights } from '../flights'

it('starts with local flights when XMCL is unreachable, ignoring legacy remote flags', async () => {
  const register = vi.fn()
  const fetch = vi.fn(() => { throw new Error('XMCL unreachable') })
  const handlers = new Map<string, any>()
  await pluginFlights({
    fetch,
    registry: { register },
    protocol: { registerHandler: (scheme: string, handler: any) => handlers.set(scheme, handler) },
  } as any, {} as any)
  expect(fetch).not.toHaveBeenCalled()
  expect(register).toHaveBeenCalledWith(kFlights, { builtinAgent: false, xmclCloud: false })
  const response: any = {}
  handlers.get('http')({ request: { url: new URL('http://launcher/flights') }, response })
  expect(response.status).toBe(200)
  expect(response.body).toContain('"xmclCloud":false')
})
