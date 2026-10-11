import { createHash } from 'crypto'
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, expect, test, vi } from 'vitest'
import { authorizedHfUrl, downloadVerified, validateRange, fetchQwenLicense, QWEN_LICENSE_URL } from './prepare-ollama-hf.mjs'

const dirs: string[] = []
test('uses the verified official LICENSE URL rather than the older weights revision', () => {
  expect(QWEN_LICENSE_URL).toBe('https://huggingface.co/Qwen/Qwen3-4B-GGUF/raw/main/LICENSE')
})
test('distinguishes missing LICENSE, HTTP failures, network errors and incomplete responses', async () => {
  await expect(fetchQwenLicense(async () => new Response('', { status: 404 }))).rejects.toThrow('LICENSE not found')
  await expect(fetchQwenLicense(async () => new Response('', { status: 503 }))).rejects.toThrow('HTTP 503')
  await expect(fetchQwenLicense(async () => { throw Object.assign(new Error('denied'), { code: 'EACCES' }) })).rejects.toThrow('network error (EACCES)')
  await expect(fetchQwenLicense(async () => new Response('<html>not license</html>'))).rejects.toThrow('incomplete or incorrect')
})
afterEach(async () => { vi.unstubAllGlobals(); for (const dir of dirs.splice(0)) await rm(dir, { recursive: true, force: true }) })
test('allows only HTTPS official Hugging Face hosts and rejects credential URLs', () => {
  expect(authorizedHfUrl('https://cas-bridge.xethub.hf.co/file')).toBe(true)
  for (const url of ['http://huggingface.co/a', 'https://evil.invalid/a', 'https://huggingface.co.evil.invalid/a', 'https://user:pass@huggingface.co/a', 'https://huggingface.co:444/a']) expect(authorizedHfUrl(url)).toBe(false)
})
test('requires exact ranges, restarts on ignored range and rejects HTTP failures', () => {
  expect(validateRange(new Response('', { status: 206, headers: { 'content-range': 'bytes 4-9/10' } }), 4, 10)).toBe(4)
  expect(validateRange(new Response('', { status: 200 }), 4, 10)).toBe(0)
  expect(() => validateRange(new Response('', { status: 206, headers: { 'content-range': 'bytes 0-9/10' } }), 4, 10)).toThrow('Invalid resumed')
  expect(() => validateRange(new Response('', { status: 404 }), 0, 10)).toThrow('404')
})
test('resumes a partial fixture, verifies hash and reuses complete bytes without another download', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pbt-hf-')); dirs.push(dir)
  const path = join(dir, 'model.gguf'); const body = Buffer.from('GGUF verified synthetic fixture, not weights')
  await writeFile(path + '.partial', body.subarray(0, 4))
  const fetch = vi.fn(async (_url: string, init: any) => {
    expect(init.headers.Range).toBe('bytes=4-')
    return new Response(body.subarray(4), { status: 206, headers: { 'content-range': `bytes 4-${body.length - 1}/${body.length}` } })
  })
  vi.stubGlobal('fetch', fetch)
  const input = { url: 'https://huggingface.co/fixture', path, sha256: createHash('sha256').update(body).digest('hex'), bytes: body.length }
  await downloadVerified(input); await downloadVerified(input)
  expect(await readFile(path)).toEqual(body)
  expect(fetch).toHaveBeenCalledTimes(1)
})
test('rejects corruption and preserves existing files rather than replacing them', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pbt-hf-')); dirs.push(dir)
  const path = join(dir, 'model.gguf'); await writeFile(path, 'corrupt')
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch)
  await expect(downloadVerified({ url: 'https://huggingface.co/fixture', path, bytes: 7, sha256: '0'.repeat(64) })).rejects.toThrow('preserved')
  expect(await readFile(path, 'utf8')).toBe('corrupt'); expect(fetch).not.toHaveBeenCalled()
})
