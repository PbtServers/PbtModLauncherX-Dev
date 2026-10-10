import { mkdtemp, rm, writeFile } from 'fs-extra'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { pluginMediaProtocol } from './pluginMediaProtocol'
import { toMediaIconUrl } from '../instance/instanceIcon'

describe('media protocol instance icons', () => {
  let directory: string
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  beforeEach(async () => { directory = await mkdtemp(join(tmpdir(), 'pbt-icon-protocol-')) })
  afterEach(async () => { await rm(directory, { recursive: true, force: true }) })

  async function request(url: string) {
    let handler!: (context: any) => Promise<void>
    pluginMediaProtocol({ platform: { os: process.platform === 'win32' ? 'windows' : 'linux' }, protocol: {
      registerHandler: (scheme: string, callback: typeof handler) => { if (scheme === 'http') handler = callback },
    } } as any, {} as any)
    const response: any = { status: 404, headers: {} }
    await handler({ request: { url: new URL(url) }, response })
    if (response.body) {
      const chunks: Buffer[] = []
      for await (const chunk of response.body) chunks.push(Buffer.from(chunk))
      response.bytes = Buffer.concat(chunks)
    }
    return response
  }

  it.each(['área # & + %.png', 'literal %20.png', 'ordinary.png'])('serves exactly the selected file (%s)', async (name) => {
    const path = join(directory, name)
    await writeFile(path, png)
    const response = await request(toMediaIconUrl(path))
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('image/png')
    expect(response.bytes).toEqual(png)
  })
  it('returns a controlled response for missing or empty paths', async () => {
    expect((await request('http://launcher/media')).status).toBe(400)
    expect((await request(toMediaIconUrl(join(directory, 'missing.png')))).status).toBe(404)
  })
})
