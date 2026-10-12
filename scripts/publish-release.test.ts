import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { assertPublicationContext, checkRelease, githubClient, isLauncherInstaller, publishRelease, verifyStaging } from './publish-release.mjs'

const roots: string[] = []
const sha = (data: string | Buffer) => createHash('sha256').update(data).digest('hex')
const release = { id: 123, tag_name: 'v1.0.7', draft: false, prerelease: false, published_at: '2026-10-12T03:19:38Z', upload_url: 'https://uploads.github.com/repos/PbtServers/PbtModLauncherX-Dev/releases/123/assets{?name,label}' }
const context = { GITHUB_EVENT_NAME: 'push', GITHUB_REF: 'refs/heads/master', GITHUB_REPOSITORY: 'PbtServers/PbtModLauncherX-Dev', BUILD_RESULT: 'success' }

afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }) })

async function staging() {
  const root = await mkdtemp(join(tmpdir(), 'pbt-publish-'))
  roots.push(root)
  const names = ['pbtmodlauncherx-1.0.7-win32-x64.zip', 'pbtmodlauncherx-1.0.7-arm64.dmg', 'manifest-win.json']
  for (const name of names) await writeFile(join(root, name), `verified ${name}`)
  await writeFile(join(root, 'SHA256SUMS.txt'), names.map(name => `${sha(`verified ${name}`)}  ${name}\n`).join(''))
  return root
}

function fakeApi(initial: any[] = []) {
  const assets = [...initial]
  const api = {
    latest: vi.fn(async () => ({ ...release })),
    assets: vi.fn(async (_id: number) => [...assets]),
    upload: vi.fn(async (_release: any, file: any) => {
      // Reservation creation is atomic, just as GitHub rejects duplicate names.
      if (assets.some(asset => asset.name === file.name)) throw new Error('GitHub API 422: duplicate asset')
      const data = file.data ?? await readFile(file.path)
      const asset = { id: assets.length + 1, name: file.name, size: data.length, state: 'uploaded', digest: `sha256:${sha(data)}` }
      assets.push(asset)
      return asset
    }),
    digest: vi.fn(async () => { throw new Error('Unexpected asset download') }),
  }
  return { api, assets }
}

const installers = [
  'pbtmodlauncherx-1.0.7-win32-x64.zip', 'pbtmodlauncherx-1.0.7-win32-x64.appx',
  'pbtmodlauncherx-deskgap-1.0.7-win32-x64.exe', 'pbtmodlauncherx-1.0.7-x64.dmg',
  'pbtmodlauncherx-1.0.7-arm64.dmg', 'pbtmodlauncherx-1.0.7-x86_64.AppImage',
  'pbtmodlauncherx-1.0.7-amd64.deb', 'pbtmodlauncherx-1.0.7-aarch64.rpm',
  'pbtmodlauncherx-1.0.7-x64.pacman', 'pbtmodlauncherx-1.0.7-arm64.tar.xz',
]

describe('release installer detection', () => {
  it.each(installers)('recognizes the actual launcher package %s', name => expect(isLauncherInstaller(name)).toBe(true))
  it.each(['backup.zip', 'ollama-win32-x64.zip', 'pbtmodlauncherx-documentation.zip', 'pbtmodlauncherx-1.0.7-win32-x64.zip.sha256', 'pbtmodlauncherx-1.0.7-x64.dmg.blockmap', 'latest.yml', 'manifest-win.json', 'debug.log', 'main.js.map', 'README.txt'])('excludes %s', name => expect(isLauncherInstaller(name)).toBe(false))
  it('recognizes a multipart launcher distribution without treating a runtime part as an installer', () => {
    expect(isLauncherInstaller('pbtmodlauncherx-1.0.7-x86_64.AppImage.part001')).toBe(true)
    expect(isLauncherInstaller('ollama.zip.part001')).toBe(false)
  })
})

describe('safe publication with simulated GitHub API', () => {
  it.each([{ initial: [] }, { initial: [{ name: 'README.txt', size: 10 }] }])('publishes a release with only documentation or no assets (%j)', async ({ initial }) => {
    const { api, assets } = fakeApi(initial)
    const root = await staging()
    const report = vi.fn()
    const result = await publishRelease({ api, version: '1.0.7', root, runId: '42', report, log: vi.fn() })
    expect(result.status).toBe('published')
    expect(api.upload.mock.calls[0][1].name).toBe('pbtmodlauncherx-publication.json')
    expect(result.uploaded).toHaveLength(5)
    expect(assets).toHaveLength(initial.length + 5)
    expect(api.assets).toHaveBeenCalledTimes(3)
    expect(report.mock.calls.at(-1)![0].status).toBe('published')
  })
  it.each(installers)('returns success without any writes when release contains %s', async name => {
    const { api } = fakeApi([{ name, size: 20 }])
    expect((await publishRelease({ api, version: '1.0.7', root: 'not-needed', log: vi.fn() })).status).toBe('skipped')
    expect(api.upload).not.toHaveBeenCalled()
  })
  it('does not upload when all installers already exist', async () => {
    const { api } = fakeApi(installers.map(name => ({ name, size: 20 })))
    expect((await checkRelease(api, '1.0.7')).status).toBe('skipped')
    expect(api.upload).not.toHaveBeenCalled()
  })
  it('fails a changed local checksum before performing any write', async () => {
    const root = await staging()
    await writeFile(join(root, 'pbtmodlauncherx-1.0.7-win32-x64.zip'), 'corrupt')
    const { api } = fakeApi()
    await expect(publishRelease({ api, version: '1.0.7', root, log: vi.fn() })).rejects.toThrow('SHA-256 mismatch')
    expect(api.upload).not.toHaveBeenCalled()
  })
  it('fails version mismatch and API errors without uploading blindly', async () => {
    const { api } = fakeApi()
    await expect(checkRelease(api, '1.0.8')).rejects.toThrow('does not match')
    api.assets.mockRejectedValueOnce(new Error('GitHub API 503'))
    await expect(checkRelease(api, '1.0.7')).rejects.toThrow('503')
    expect(api.upload).not.toHaveBeenCalled()
  })
  it('checks again immediately before publishing and skips an intervening publication', async () => {
    const { api, assets } = fakeApi()
    api.assets.mockImplementation(async () => {
      if (api.assets.mock.calls.length === 2) assets.push({ name: installers[0], size: 20 })
      return [...assets]
    })
    expect((await publishRelease({ api, version: '1.0.7', root: await staging(), log: vi.fn() })).status).toBe('skipped')
    expect(api.upload).not.toHaveBeenCalled()
  })
  it('serial executions publish once, then skip without duplicating files', async () => {
    const { api, assets } = fakeApi()
    const root = await staging()
    expect((await publishRelease({ api, version: '1.0.7', root, log: vi.fn() })).status).toBe('published')
    expect((await publishRelease({ api, version: '1.0.7', root, log: vi.fn() })).status).toBe('skipped')
    expect(new Set(assets.map(asset => asset.name)).size).toBe(assets.length)
    expect(api.upload).toHaveBeenCalledTimes(5)
  })
  it('concurrent uncoordinated attempts cannot both reserve the same release', async () => {
    const { api, assets } = fakeApi()
    const root = await staging()
    const results = await Promise.allSettled([1, 2].map(runId => publishRelease({ api, version: '1.0.7', root, runId, log: vi.fn() })))
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
    expect(assets.filter(asset => asset.name === 'pbtmodlauncherx-publication.json')).toHaveLength(1)
    expect(new Set(assets.map(asset => asset.name)).size).toBe(assets.length)
  })
  it('records partial publication, preserves uploaded assets and blocks unsafe retry', async () => {
    const { api, assets } = fakeApi()
    const report = vi.fn()
    api.upload.mockImplementation(async (_release, file) => {
      if (file.name !== 'pbtmodlauncherx-publication.json') throw new Error('GitHub API 502')
      const asset = { id: 1, name: file.name, size: file.bytes, state: 'uploaded', digest: `sha256:${file.sha256}` }
      assets.push(asset)
      return asset
    })
    await expect(publishRelease({ api, version: '1.0.7', root: await staging(), report, log: vi.fn() })).rejects.toThrow('502')
    expect(report.mock.calls.at(-1)![0]).toMatchObject({ status: 'failed', uploaded: [{ name: 'pbtmodlauncherx-publication.json' }] })
    await expect(checkRelease(api, '1.0.7')).rejects.toThrow('controlled recovery')
    expect(assets).toHaveLength(1)
  })
  it('fails final size or digest verification instead of reporting success', async () => {
    const { api, assets } = fakeApi()
    api.assets.mockImplementation(async () => api.assets.mock.calls.length === 3 ? assets.map(asset => ({ ...asset, digest: 'sha256:bad' })) : [...assets])
    await expect(publishRelease({ api, version: '1.0.7', root: await staging(), log: vi.fn() })).rejects.toThrow('SHA-256 differs')
  })
  it('fails when the final API listing loses an uploaded installer', async () => {
    const { api, assets } = fakeApi()
    api.assets.mockImplementation(async () => api.assets.mock.calls.length === 3 ? assets.filter(asset => asset.name !== installers[0]) : [...assets])
    await expect(publishRelease({ api, version: '1.0.7', root: await staging(), log: vi.fn() })).rejects.toThrow('Published asset missing')
  })
  it('rejects a different latest release discovered by the last check', async () => {
    const { api } = fakeApi()
    api.latest.mockResolvedValueOnce({ ...release }).mockResolvedValueOnce({ ...release, id: 456 })
    await expect(publishRelease({ api, version: '1.0.7', root: await staging(), log: vi.fn() })).rejects.toThrow('Latest release changed')
    expect(api.upload).not.toHaveBeenCalled()
  })
  it('uses a download checksum when GitHub does not provide a digest', async () => {
    const { api, assets } = fakeApi()
    api.assets.mockImplementation(async () => assets.map(({ digest: _digest, ...asset }) => asset))
    api.digest.mockImplementation(async asset => assets.find(candidate => candidate.id === asset.id)!.digest.slice(7))
    expect((await publishRelease({ api, version: '1.0.7', root: await staging(), log: vi.fn() })).status).toBe('published')
    expect(api.digest).toHaveBeenCalledTimes(5)
  })
  it('never overwrites colliding metadata even if no installer is present', async () => {
    const { api } = fakeApi([{ name: 'manifest-win.json', size: 99 }])
    await expect(publishRelease({ api, version: '1.0.7', root: await staging(), log: vi.fn() })).rejects.toThrow('collides')
    expect(api.upload).not.toHaveBeenCalled()
  })
  it('requires complete checksum coverage', async () => {
    const root = await staging()
    await writeFile(join(root, 'unexpected.txt'), 'not checked')
    await expect(verifyStaging(root)).rejects.toThrow('cover every')
  })
})

describe('GitHub REST transport and workflow safety', () => {
  it.each(['skip', 'publish', 'checksum-error'])('CLI exits successfully only for deliberate omission or verified publication: %s', async scenario => {
    const fixture = await mkdtemp(join(tmpdir(), 'pbt-publish-cli-'))
    roots.push(fixture)
    const root = await staging()
    if (scenario === 'checksum-error') await writeFile(join(root, installers[0]), 'tampered')
    const hook = join(fixture, 'mock-github.mjs')
    await writeFile(hook, `
      import { createHash } from 'node:crypto';
      const release = ${JSON.stringify(release)};
      const assets = ${JSON.stringify(scenario === 'skip' ? [{ name: installers[0], size: 20 }] : [])};
      globalThis.fetch = async (input, options = {}) => {
        const url = new URL(input);
        if (url.hostname === 'api.github.com' && url.pathname.endsWith('/releases/latest')) return Response.json(release);
        if (url.hostname === 'api.github.com' && url.pathname.endsWith('/releases/123/assets')) return Response.json(assets);
        if (url.hostname === 'uploads.github.com' && options.method === 'POST') {
          const chunks = [];
          for await (const bytes of options.body) chunks.push(Buffer.isBuffer(bytes) ? bytes : Buffer.from([bytes]));
          const data = Buffer.concat(chunks);
          const asset = { id: assets.length + 1, name: url.searchParams.get('name'), size: data.length, state: 'uploaded', digest: 'sha256:' + createHash('sha256').update(data).digest('hex') };
          assets.push(asset);
          return Response.json(asset, { status: 201 });
        }
        throw new Error('Unexpected network call in fixture: ' + url.pathname);
      };
    `)
    const result = spawnSync(process.execPath, ['--import', pathToFileURL(hook).href, resolve('scripts/publish-release.mjs'), root], {
      cwd: fixture, encoding: 'utf8', timeout: 20000,
      env: { ...process.env, ...context, GITHUB_TOKEN: 'fixture-token', GITHUB_RUN_ID: 'cli-fixture' },
    })
    const receipt = JSON.parse(await readFile(join(fixture, 'publication-result.json'), 'utf8').catch(error => { throw new Error(`${error.message}\n${result.stderr}`) }))
    if (scenario === 'checksum-error') {
      expect(result.status).not.toBe(0)
      expect(receipt.status).toBe('failed')
      expect(receipt.uploaded).toEqual([])
    } else {
      expect(result.status, result.stderr).toBe(0)
      expect(receipt.status).toBe(scenario === 'skip' ? 'skipped' : 'published')
      expect(result.stdout).toContain(scenario === 'skip' ? 'Publicación omitida correctamente' : 'Publicación completada correctamente')
    }
  })
  it('uploads the exact file stream with authenticated POST and verifies download bytes', async () => {
    const root = await staging()
    const [file] = await verifyStaging(root)
    const expected = await readFile(file.path)
    const fetchImpl = vi.fn(async (url: any, options: any) => {
      if (options.method === 'POST') {
        expect(new URL(url).origin).toBe('https://uploads.github.com')
        expect(new URL(url).searchParams.get('name')).toBe(file.name)
        expect(options.headers.Authorization).toBe('Bearer fixture-token')
        expect(options.headers['Content-Length']).toBe(String(expected.length))
        const chunks = []
        for await (const chunk of options.body) chunks.push(chunk)
        expect(Buffer.concat(chunks)).toEqual(expected)
        return new Response(JSON.stringify({ id: 1, name: file.name, state: 'uploaded', size: expected.length }), { status: 201 })
      }
      expect(options.headers.Accept).toBe('application/octet-stream')
      return new Response(expected)
    })
    const api = githubClient({ repo: context.GITHUB_REPOSITORY, token: 'fixture-token', fetchImpl })
    const asset = await api.upload(release, file)
    expect(await api.digest(asset)).toBe(file.sha256)
  })
  it('paginates all assets and finds an installer beyond the first page', async () => {
    const fetchImpl = vi.fn(async (url: any) => new Response(JSON.stringify(String(url).endsWith('page=1') ? Array.from({ length: 100 }, (_, i) => ({ name: `doc-${i}.txt`, size: 1 })) : [{ name: installers[0], size: 20 }]), { status: 200 }))
    const api = githubClient({ repo: context.GITHUB_REPOSITORY, token: 'fixture-token', fetchImpl })
    expect((await api.assets(123)).some(asset => isLauncherInstaller(asset.name))).toBe(true)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })
  it('propagates HTTP errors and rejects untrusted upload URLs', async () => {
    const fetchImpl = vi.fn(async () => new Response('', { status: 403 }))
    const api = githubClient({ repo: context.GITHUB_REPOSITORY, token: 'fixture-token', fetchImpl })
    await expect(api.latest()).rejects.toThrow('403')
    await expect(api.upload({ ...release, upload_url: 'https://example.com/stolen' }, {})).rejects.toThrow('Unexpected GitHub upload URL')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
  it.each([
    { BUILD_RESULT: 'failure' }, { BUILD_RESULT: 'cancelled' },
    { GITHUB_EVENT_NAME: 'pull_request' }, { GITHUB_EVENT_NAME: 'workflow_dispatch' },
    { GITHUB_REF: 'refs/heads/other' }, { GITHUB_REPOSITORY: 'fork/PbtModLauncherX-Dev' },
  ])('rejects an unauthorized or failed build context %j', overrides => expect(() => assertPublicationContext({ ...context, ...overrides })).toThrow())
  it('allows successful builds on upstream master and keeps failures mandatory', async () => {
    expect(() => assertPublicationContext(context)).not.toThrow()
    const { load } = createRequire(new URL('../xmcl-runtime/package.json', import.meta.url))('js-yaml')
    const workflow = load(await readFile('.github/workflows/build.yml', 'utf8'))
    expect(workflow.permissions).toEqual({ contents: 'read' })
    expect(workflow.jobs.build.strategy.matrix.include).toHaveLength(5)
    expect(workflow.jobs.publish.needs).toBe('build')
    expect(workflow.jobs.publish.if).toContain("needs.build.result == 'success'")
    expect(workflow.jobs.publish.if).toContain("github.ref == 'refs/heads/master'")
    expect(workflow.jobs.publish.concurrency).toEqual({ group: 'pbtmodlauncherx-release-assets', 'cancel-in-progress': false })
    expect(workflow.jobs.release.concurrency).toEqual(workflow.jobs.publish.concurrency)
    expect(workflow.jobs.publish.permissions).toEqual({ contents: 'write' })
    expect(workflow.jobs.publish.steps.find((step: any) => step.id === 'publication').if).toBeUndefined()
    expect(workflow.jobs.build.steps.some((step: any) => step.run?.includes('scripts/publish-release.test.ts'))).toBe(true)
    expect(workflow.jobs.publish.steps.find((step: any) => step.name === 'Download final packages from this run').with).toMatchObject({ pattern: 'build-*', 'merge-multiple': false })
    expect(JSON.stringify(workflow.jobs.publish)).not.toContain('latest_version.json')
    expect(JSON.stringify(workflow)).not.toContain('continue-on-error')
    expect(JSON.stringify(workflow)).not.toContain('--clobber')
    const core = load(await readFile('.github/workflows/core-build.yml', 'utf8'))
    expect(core.jobs.automation.steps.some((step: any) => step.run?.includes('pnpm coverage'))).toBe(true)
    expect(core.jobs.automation.steps.some((step: any) => step.run?.includes('pnpm check'))).toBe(true)
    expect(JSON.stringify(core)).not.toContain('continue-on-error')
  })
})
