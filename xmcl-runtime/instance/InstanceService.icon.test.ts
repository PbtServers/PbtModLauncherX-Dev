import { createHash } from 'crypto'
import { getMediaIconPath, resolveInstanceIcon, serializeInstanceIcon, toMediaIconUrl } from './instanceIcon'
import { validateInstanceGif } from './instanceGif'
import * as fs from 'fs-extra'
import { Instance } from '@xmcl/instance'
import { InstanceState } from '@xmcl/runtime-api'
import { ensureDir, mkdtemp, pathExists, readFile, readJson, rm, writeFile } from 'fs-extra'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('fs-extra', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs-extra')>()
  const base = (actual as typeof actual & { default: typeof actual }).default || actual
  return { ...base, ...actual, stat: vi.fn(base.stat), rename: vi.fn(base.rename) }
})

vi.mock('~/app', () => ({
  Inject: () => () => { },
  LauncherAppKey: Symbol('LauncherAppKey'),
  PathResolver: class { },
  kGameDataPath: Symbol('kGameDataPath'),
}))

vi.mock('~/infra', () => ({
  ImageStorage: class { },
  Tasks: class { },
  kTasks: Symbol('kTasks'),
}))

vi.mock('~/install', () => ({
  VersionMetadataService: class { },
}))

const { InstanceService } = await import('./InstanceService')

function iconName(data: Buffer, ext: string) { return 'icon-' + createHash('sha256').update(data).digest('hex') + '.' + ext }

function createInstance(path: string): Instance {
  return {
    name: 'Test',
    author: '',
    description: '',
    version: '',
    edition: 'java',
    runtime: {
      minecraft: '1.20.1',
      forge: '',
      fabricLoader: '',
      optifine: '',
      quiltLoader: '',
      neoForged: '',
      labyMod: '',
    },
    icon: '',
    url: '',
    fileApi: '',
    playtime: 0,
    lastPlayedDate: 0,
    creationDate: Date.now(),
    lastAccessDate: Date.now(),
    path,
  }
}

describe('InstanceService icon storage', () => {
  const animatedGif = Buffer.from(
    'R0lGODlhEAAQAIEAACR0zAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQAMgAAACwAAAAAEAAQAAAIHQABCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFgQEBACH5BAEyAAEALAAAAAAQABAAgeaiPAAAAAAAAAAAAAgdAAEIHEiwoMGDCBMqXMiwocOHECNKnEixosWBAQEAOw==',
    'base64',
  )
  let appDataPath: string
  let instancePath: string

  beforeEach(async () => {
    appDataPath = await mkdtemp(join(tmpdir(), 'xmcl-instance-icon-'))
    instancePath = join(appDataPath, 'instances', 'test')
    await ensureDir(instancePath)
  })


  afterEach(async () => {
    vi.restoreAllMocks()
    // Windows can transiently retain directory handles after the awaited copy.
    // Retry only fs.rm's documented transient errors, with a bounded budget.
    await rm(appDataPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
  })

  function createService(state: InstanceState, fetch = vi.fn()) {
    const logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const app = {
      appDataPath,
      minecraftDataPath: appDataPath,
      getLogger: () => logger,
      controller: { broadcast: vi.fn() },
      mutex: { of: vi.fn() },
      fetch,
    }
    const store = { registerStatic: () => state }
    return new InstanceService(
      app as any,
      store as any,
      {} as any,
      (...paths: string[]) => join(appDataPath, ...paths),
      {} as any,
      { create: () => ({ controller: new AbortController(), complete: vi.fn(), fail: vi.fn() }) } as any,
    )
  }

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  // Small encoded images, not header-only fixtures.
  const jpeg = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDq6KKK/os/Kj//2Q==', 'base64')
  const webp = Buffer.from('UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA', 'base64')

  function setup(fetch = vi.fn()) {
    const state = new InstanceState() as InstanceState & { subscribe: ReturnType<typeof vi.fn> }
    state.subscribe = vi.fn()
    state.instanceAdd(createInstance(instancePath))
    return { state, service: createService(state, fetch) }
  }

  test.each([['PNG', png, 'png'], ['JPEG', jpeg, 'jpg'], ['WebP', webp, 'webp']] as const)('stores %s by content even with a misleading extension', async (_name, bytes, ext) => {
    const source = join(appDataPath, 'área #1 & imágenes %.txt')
    await writeFile(source, bytes)
    const { service, state } = setup()
    await service.editInstance({ instancePath, icon: toMediaIconUrl(source) })
    expect(await readFile(getMediaIconPath(state.all[instancePath].icon)!)).toEqual(bytes)
    expect((await readJson(join(instancePath, 'instance.json'))).icon).toBe(iconName(bytes, ext))
  })

  test('changes consecutive icons immediately, persists and restores the default without deleting resources', async () => {
    const { service, state } = setup()
    const source = join(appDataPath, 'selected.png')
    await writeFile(source, png)
    await service.editInstance({ instancePath, icon: source })
    const previous = state.all[instancePath].icon
    await writeFile(source, webp)
    await service.editInstance({ instancePath, icon: source })
    const current = state.all[instancePath].icon
    expect(current).not.toBe(previous)
    const persisted = await readJson(join(instancePath, 'instance.json'))
    expect(resolveInstanceIcon(persisted.icon, instancePath)).toBe(current)
    await service.editInstance({ instancePath, icon: '' })
    expect(state.all[instancePath].icon).toBe('')
    expect((await readJson(join(instancePath, 'instance.json'))).icon).toBe('')
    expect(await readFile(getMediaIconPath(previous)!)).toEqual(png)
    expect(await readFile(getMediaIconPath(current)!)).toEqual(webp)
  })

  test('copies an imported relative icon into an independent instance and preserves the original', async () => {
    const { service, state } = setup()
    await writeFile(join(instancePath, 'imported.png'), png)
    await service.editInstance({ instancePath, icon: 'imported.png' })
    const original = state.all[instancePath].icon
    const copy = await service.createInstance({ name: 'Copied', icon: original, runtime: { minecraft: '1.20.1' } })
    expect(state.all[copy].icon).not.toBe(original)
    expect(serializeInstanceIcon(state.all[copy].icon, copy)).toBe(iconName(png, 'png'))
    expect(await readFile(getMediaIconPath(state.all[copy].icon)!)).toEqual(png)
    expect(await readFile(getMediaIconPath(original)!)).toEqual(png)
  })

  test('loads the saved icon in a fresh service after a restart', async () => {
    const { service } = setup()
    const created = await service.createInstance({ name: 'Restart test', runtime: { minecraft: '1.20.1' } })
    await writeFile(join(created, 'imported.png'), png)
    await service.editInstance({ instancePath: created, icon: 'imported.png' })
    const freshState = new InstanceState() as InstanceState & { subscribe: ReturnType<typeof vi.fn> }
    freshState.subscribe = vi.fn()
    const restarted = createService(freshState)
    await expect(restarted.loadInstance(created)).resolves.toBe(true)
    expect(freshState.all[created].icon).toBe(toMediaIconUrl(join(created, iconName(png, 'png'))))
    expect(await readFile(getMediaIconPath(freshState.all[created].icon)!)).toEqual(png)
  })

  test('changing a different instance never updates the first instance icon', async () => {
    const { service, state } = setup()
    const second = join(appDataPath, 'instances', 'second')
    await ensureDir(second)
    state.instanceAdd(createInstance(second))
    await writeFile(join(instancePath, 'selected.png'), png)
    await writeFile(join(second, 'selected.png'), webp)
    await service.editInstance({ instancePath, icon: 'selected.png' })
    const first = state.all[instancePath].icon
    await service.editInstance({ instancePath: second, icon: 'selected.png' })
    expect(state.all[instancePath].icon).toBe(first)
    expect(state.all[second].icon).not.toBe(first)
    expect(await readFile(getMediaIconPath(first)!)).toEqual(png)
    expect(await readFile(getMediaIconPath(state.all[second].icon)!)).toEqual(webp)
  })

  test('imports from the workspace drive through a long Unicode path without modifying the source', async () => {
    const directory = await mkdtemp(join(process.cwd(), 'temp', 'phase8-icon-source-'))
    try {
      const nested = join(directory, 'long'.repeat(18), 'path'.repeat(18), 'área # & %')
      await ensureDir(nested)
      const source = join(nested, 'original image.png')
      await writeFile(source, png)
      const { service, state } = setup()
      await service.editInstance({ instancePath, icon: toMediaIconUrl(source) + '&revision=1' })
      expect(await readFile(getMediaIconPath(state.all[instancePath].icon)!)).toEqual(png)
      expect(await readFile(source)).toEqual(png)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  test('preserves the icon through the real directory duplication service', async () => {
    const { service, state } = setup()
    const original = await service.createInstance({ name: 'Original', runtime: { minecraft: '1.20.1' } })
    await writeFile(join(original, 'imported.png'), png)
    await service.editInstance({ instancePath: original, icon: 'imported.png' })
    const copied = await service.duplicateInstance(original)
    expect(copied).not.toBe(original)
    expect(await readFile(getMediaIconPath(state.all[copied].icon)!)).toEqual(png)
    expect((await readJson(join(copied, 'instance.json'))).icon).toBe(iconName(png, 'png'))
    await service.editInstance({ instancePath: copied, icon: '' })
    expect(state.all[original].icon).not.toBe('')
    expect(await readFile(getMediaIconPath(state.all[original].icon)!)).toEqual(png)
  })

  test('resolves the icon after the renamed instance directory is moved on reload', async () => {
    const { service } = setup()
    const original = await service.createInstance({ name: 'Before', runtime: { minecraft: '1.20.1' } })
    await writeFile(join(original, 'imported.png'), png)
    await service.editInstance({ instancePath: original, icon: 'imported.png' })
    await service.editInstance({ instancePath: original, name: 'After' })
    // Non-icon edits are persisted by the live state subscription. This isolated
    // service has no live subscriber, so persist that rename explicitly.
    const metadata = await readJson(join(original, 'instance.json'))
    await fs.writeJson(join(original, 'instance.json'), { ...metadata, name: 'After' })
    const freshState = new InstanceState() as InstanceState & { subscribe: ReturnType<typeof vi.fn> }
    freshState.subscribe = vi.fn()
    const restarted = createService(freshState)
    await expect(restarted.loadInstance(original)).resolves.toBe(true)
    const renamed = join(appDataPath, 'instances', 'After')
    expect(freshState.all[renamed].icon).toBe(toMediaIconUrl(join(renamed, iconName(png, 'png'))))
    expect(await readFile(getMediaIconPath(freshState.all[renamed].icon)!)).toEqual(png)
  })

  test.each(['missing.png', '../outside.png', 'file:///not-authorized.png'])('rejects invalid reference %s without clearing the previous icon', async (icon) => {
    const { service, state } = setup()
    await writeFile(join(instancePath, 'original.png'), png)
    await service.editInstance({ instancePath, icon: 'original.png' })
    const previous = state.all[instancePath].icon
    await expect(service.editInstance({ instancePath, icon })).rejects.toThrow()
    expect(state.all[instancePath].icon).toBe(previous)
    expect((await readJson(join(instancePath, 'instance.json'))).icon).toBe(iconName(png, 'png'))
  })

  test.each([Buffer.from('not an image'), png.subarray(0, 35), webp.subarray(0, 25), jpeg.subarray(0, jpeg.length - 2), Buffer.from('<svg><script>alert(1)</script></svg>')])('rejects corrupt or unsafe bytes without replacing the previous icon', async (bytes) => {
    const { service, state } = setup()
    await writeFile(join(instancePath, 'original.png'), png)
    await service.editInstance({ instancePath, icon: 'original.png' })
    const previous = state.all[instancePath].icon
    const source = join(appDataPath, 'invalid.png')
    await writeFile(source, bytes)
    await expect(service.editInstance({ instancePath, icon: source })).rejects.toThrow()
    expect(state.all[instancePath].icon).toBe(previous)
    expect(await readFile(getMediaIconPath(previous)!)).toEqual(png)
  })

  test('preserves metadata and icon when reading is denied', async () => {
    const { service, state } = setup()
    await writeFile(join(instancePath, 'original.png'), png)
    await service.editInstance({ instancePath, icon: 'original.png' })
    const previous = state.all[instancePath].icon
    const denied = Object.assign(new Error('Permission denied'), { code: 'EACCES' })
    vi.mocked(fs.stat).mockRejectedValueOnce(denied)
    await expect(service.editInstance({ instancePath, icon: join(appDataPath, 'protected.png') })).rejects.toThrow('Permission denied')
    expect(state.all[instancePath].icon).toBe(previous)
  })

  test('preserves the previous icon and JSON if metadata replacement is denied', async () => {
    const { service, state } = setup()
    await writeFile(join(instancePath, 'original.png'), png)
    await service.editInstance({ instancePath, icon: 'original.png' })
    const previous = state.all[instancePath].icon
    const metadata = await readFile(join(instancePath, 'instance.json'))
    await writeFile(join(instancePath, 'new.webp'), webp)
    const actual = await vi.importActual<typeof import('fs-extra')>('fs-extra')
    const base = (actual as typeof actual & { default: typeof actual }).default || actual
    vi.mocked(fs.rename).mockImplementationOnce(base.rename).mockRejectedValueOnce(Object.assign(new Error('Permission denied'), { code: 'EACCES' }))
    await expect(service.editInstance({ instancePath, icon: 'new.webp' })).rejects.toThrow('Permission denied')
    expect(state.all[instancePath].icon).toBe(previous)
    expect(await readFile(join(instancePath, 'instance.json'))).toEqual(metadata)
    expect((await fs.readdir(instancePath)).filter((name) => name.endsWith('.tmp'))).toEqual([])
  })

  test('rejects oversized downloads even without a content-length header', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(Buffer.alloc(8 * 1024 * 1024 + 1)))
    const { service, state } = setup(fetch)
    await expect(service.editInstance({ instancePath, icon: 'https://example.com/huge.png' })).rejects.toThrow('maximum size')
    expect(state.all[instancePath].icon).toBe('')
  })

  test('keeps the latest requested icon when an older download completes later', async () => {
    let complete!: (response: Response) => void
    const fetch = vi.fn().mockImplementation(() => new Promise<Response>((resolve) => { complete = resolve }))
    const { service, state } = setup(fetch)
    const older = service.editInstance({ instancePath, icon: 'https://example.com/slow.png' })
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled())
    await writeFile(join(instancePath, 'new.webp'), webp)
    await service.editInstance({ instancePath, icon: 'new.webp' })
    complete(new Response(png))
    await older
    expect(state.all[instancePath].icon).toBe(toMediaIconUrl(join(instancePath, iconName(webp, 'webp'))))
    expect((await readJson(join(instancePath, 'instance.json'))).icon).toBe(iconName(webp, 'webp'))
  })

  test('copies a shared launcher image into the instance folder when setting the icon', async () => {
    const imageHash = '0123456789abcdef0123456789abcdef01234567'
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
    await ensureDir(join(appDataPath, 'resource-images'))
    await writeFile(join(appDataPath, 'resource-images', imageHash), png)

    const state = new InstanceState() as InstanceState & { subscribe: ReturnType<typeof vi.fn> }
    state.subscribe = vi.fn()
    state.instanceAdd(createInstance(instancePath))
    const service = createService(state)

    await service.editInstance({
      instancePath,
      icon: `http://launcher/image/${imageHash}`,
    })

    expect(state.all[instancePath].icon).toBe(toMediaIconUrl(join(instancePath, iconName(png, 'png'))))
    expect(await pathExists(join(instancePath, iconName(png, 'png')))).toBe(true)
  })

  test('downloads a remote image into the instance folder when setting the icon URL', async () => {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
    const state = new InstanceState() as InstanceState & { subscribe: ReturnType<typeof vi.fn> }
    state.subscribe = vi.fn()
    state.instanceAdd(createInstance(instancePath))
    const fetch = vi.fn().mockResolvedValue(new Response(png, {
      headers: { 'content-type': 'image/png' },
    }))
    const service = createService(state, fetch)

    await service.editInstance({
      instancePath,
      icon: 'https://example.com/icon.png',
    })

    expect(fetch).toHaveBeenCalledWith('https://example.com/icon.png')
    expect(state.all[instancePath].icon).toBe(toMediaIconUrl(join(instancePath, iconName(png, 'png'))))
    expect(await pathExists(join(instancePath, iconName(png, 'png')))).toBe(true)
  })

  test('keeps a local GIF icon animated', async () => {
    const sourcePath = join(appDataPath, 'animated.gif')
    await writeFile(sourcePath, animatedGif)

    const state = new InstanceState() as InstanceState & { subscribe: ReturnType<typeof vi.fn> }
    state.subscribe = vi.fn()
    state.instanceAdd(createInstance(instancePath))
    const service = createService(state)

    await service.editInstance({
      instancePath,
      icon: `http://launcher/media?path=${sourcePath}`,
    })

    expect(state.all[instancePath].icon).toBe(toMediaIconUrl(join(instancePath, iconName(animatedGif, 'gif'))))
    expect(await pathExists(join(instancePath, iconName(animatedGif, 'gif')))).toBe(true)
    expect(await readFile(join(instancePath, iconName(animatedGif, 'gif')))).toEqual(animatedGif)
    expect(validateInstanceGif(await readFile(join(instancePath, iconName(animatedGif, 'gif'))))).toBe(2)
  })

  test('preserves both GIF frames during duplication and updates URLs when switching to a static GIF', async () => {
    const { service, state } = setup()
    const original = await service.createInstance({ name: 'Animated', runtime: { minecraft: '1.20.1' } })
    await writeFile(join(original, 'selected.gif'), animatedGif)
    await service.editInstance({ instancePath: original, icon: 'selected.gif' })
    const originalUrl = state.all[original].icon
    const copied = await service.duplicateInstance(original)
    const copyBytes = await readFile(getMediaIconPath(state.all[copied].icon)!)
    expect(copyBytes).toEqual(animatedGif)
    expect(validateInstanceGif(copyBytes)).toBe(2)
    const still = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64')
    await writeFile(join(original, 'selected.gif'), still)
    await service.editInstance({ instancePath: original, icon: 'selected.gif' })
    expect(state.all[original].icon).not.toBe(originalUrl)
    expect(validateInstanceGif(await readFile(getMediaIconPath(state.all[original].icon)!))).toBe(1)
    expect(await readFile(getMediaIconPath(state.all[copied].icon)!)).toEqual(animatedGif)
  })

  test('stores a remote GIF with its original format', async () => {
    const state = new InstanceState() as InstanceState & { subscribe: ReturnType<typeof vi.fn> }
    state.subscribe = vi.fn()
    state.instanceAdd(createInstance(instancePath))
    const fetch = vi.fn().mockResolvedValue(new Response(animatedGif, {
      headers: { 'content-type': 'image/gif' },
    }))
    const service = createService(state, fetch)

    await service.editInstance({
      instancePath,
      icon: 'https://example.com/icon.gif',
    })

    expect(state.all[instancePath].icon).toBe(toMediaIconUrl(join(instancePath, iconName(animatedGif, 'gif'))))
    expect(await pathExists(join(instancePath, iconName(animatedGif, 'gif')))).toBe(true)
    expect(await readFile(join(instancePath, iconName(animatedGif, 'gif')))).toEqual(animatedGif)
  })

  test('persists an animated remote thumbnail when creating a modpack instance', async () => {
    const state = new InstanceState() as InstanceState & { subscribe: ReturnType<typeof vi.fn> }
    state.subscribe = vi.fn()
    const icon = 'https://media.forgecdn.net/avatars/thumbnails/1735/273/256/256/icon_animated.gif'
    const fetch = vi.fn().mockResolvedValue(new Response(animatedGif, {
      headers: { 'content-type': 'image/gif', 'content-length': String(animatedGif.byteLength) },
    }))
    const service = createService(state, fetch)

    const path = await service.createInstance({
      name: 'GIF modpack',
      runtime: { minecraft: '1.20.1' },
      icon,
      upstream: { type: 'curseforge-modpack', modId: 385053, fileId: 8813051 },
    })

    expect(fetch).toHaveBeenCalledExactlyOnceWith(icon)
    expect(state.all[path].icon).toBe(toMediaIconUrl(join(path, iconName(animatedGif, 'gif'))))
    expect((await readJson(join(path, 'instance.json'))).icon).toBe(iconName(animatedGif, 'gif'))
    expect(await readFile(join(path, iconName(animatedGif, 'gif')))).toEqual(animatedGif)
  })
})
