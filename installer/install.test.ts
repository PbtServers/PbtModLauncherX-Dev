import { spawnSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

const root = resolve(__dirname, '..')
const gitExecPath = spawnSync('git', ['--exec-path'], { encoding: 'utf8' }).stdout?.trim()
const gitShell = process.platform === 'win32' && gitExecPath
  ? resolve(gitExecPath, '../../../usr/bin/sh.exe')
  : 'sh'
const shellAvailable = spawnSync(gitShell, ['-c', 'command -v tar']).status === 0
let fixture: string
beforeEach(() => {
  fixture = join(root, 'temp', `installer-tests-${randomUUID()}`)
  mkdirSync(fixture, { recursive: true })
})
afterEach(() => rmSync(fixture, { recursive: true, force: true }))
const shellPath = (path: string) => path.replaceAll('\\', '/').replace(/^([A-Za-z]):/, (_, drive: string) => `/${drive.toLowerCase()}`)

describe.skipIf(process.platform !== 'win32')('Windows portable installation with mocked release downloads', () => {
  function run(mode: 'valid' | 'invalid-hash' | 'existing' | 'foreign') {
    const destination = join(fixture, 'installed')
    const runner = join(fixture, 'runner.ps1')
    writeFileSync(runner, `
$ErrorActionPreference = 'Stop'
$fixture = $env:PBT_INSTALL_FIXTURE
$inputDirectory = Join-Path $fixture 'input'
New-Item -ItemType Directory -Path $inputDirectory | Out-Null
Set-Content -LiteralPath (Join-Path $inputDirectory 'PbtModLauncherX.exe') -Value 'fixture executable; never launched'
Compress-Archive -Path (Join-Path $inputDirectory '*') -DestinationPath (Join-Path $fixture 'payload.zip')
$hash = (Get-FileHash -LiteralPath (Join-Path $fixture 'payload.zip') -Algorithm SHA256).Hash
if ($env:PBT_INSTALL_MODE -eq 'invalid-hash') { $hash = '0' * 64 }
Set-Content -LiteralPath (Join-Path $fixture 'payload.sha256') -Value $hash
function Invoke-RestMethod {
  param($Uri)
  $base = 'https://github.com/PbtServers/PbtModLauncherX-Dev/releases/download/v1.0.6/'
  if ($env:PBT_INSTALL_MODE -eq 'foreign') { $base = 'https://github.com/Voxelum/x-minecraft-launcher/releases/download/v1.0.6/' }
  @{ tag_name = 'v1.0.6'; assets = @(
    @{name='pbtmodlauncherx-1.0.6-win32-x64.zip'; browser_download_url=$base+'archive.zip'},
    @{name='pbtmodlauncherx-1.0.6-win32-x64.zip.sha256'; browser_download_url=$base+'archive.zip.sha256'}
  ) }
}
function Invoke-WebRequest {
  param($Uri, $OutFile)
  $file = if ($Uri.EndsWith('.sha256')) { 'payload.sha256' } else { 'payload.zip' }
  Copy-Item -LiteralPath (Join-Path $fixture $file) -Destination $OutFile
}
& (Join-Path $env:PBT_INSTALL_ROOT 'installer/install.ps1') -Version 1.0.6 -InstallDir (Join-Path $fixture 'installed')
`)
    if (mode === 'existing') {
      mkdirSync(destination)
      writeFileSync(join(destination, 'user-data.txt'), 'keep existing data')
    }
    const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', runner], {
      encoding: 'utf8', env: { ...process.env, PROCESSOR_ARCHITECTURE: 'AMD64', PBT_INSTALL_ROOT: root, PBT_INSTALL_FIXTURE: fixture, PBT_INSTALL_MODE: mode },
    })
    return { result, destination }
  }
  test('extracts only a verified official artifact and keeps its executable metadata intact', () => {
    const { result, destination } = run('valid')
    expect(result.status, result.stderr).toBe(0)
    expect(readFileSync(join(destination, 'PbtModLauncherX.exe'), 'utf8')).toContain('fixture executable; never launched')
  })
  test.each(['invalid-hash', 'foreign'] as const)('refuses %s before installing', mode => {
    const { result, destination } = run(mode)
    expect(result.status).not.toBe(0)
    expect(existsSync(destination)).toBe(false)
  })
  test('preserves an existing destination', () => {
    const { result, destination } = run('existing')
    expect(result.status).not.toBe(0)
    expect(readFileSync(join(destination, 'user-data.txt'), 'utf8')).toBe('keep existing data')
  })
})

describe.skipIf(!shellAvailable)('Linux portable installation with mocked release downloads', () => {
  function run(validHash: boolean, existing = false) {
    const input = join(fixture, 'input')
    const commands = join(fixture, 'commands')
    const destination = join(fixture, 'installed')
    mkdirSync(input); mkdirSync(commands)
    if (process.platform === 'win32') {
      // Windows bsdtar has built-in xz support; Git's GNU tar may lack xz.exe.
      const windowsTar = shellPath(join(process.env.SystemRoot!, 'System32', 'tar.exe'))
      writeFileSync(join(commands, 'tar'), `#!/bin/sh\nexec '${windowsTar}' "$@"\n`, { mode: 0o755 })
    }
    writeFileSync(join(input, 'pbtmodlauncherx'), '#!/bin/sh\nexit 0\n')
    const archive = join(fixture, 'payload.tar.xz')
    const created = process.platform === 'win32'
      ? spawnSync(join(process.env.SystemRoot!, 'System32', 'tar.exe'), ['-cJf', archive, '-C', input, '.'])
      : spawnSync(gitShell, ['-c', `tar -cJf '${shellPath(archive)}' -C '${shellPath(input)}' .`])
    expect(created.status).toBe(0)
    const hash = validHash ? createHash('sha256').update(readFileSync(archive)).digest('hex') : '0'.repeat(64)
    writeFileSync(join(fixture, 'payload.sha256'), hash)
    writeFileSync(join(commands, 'uname'), '#!/bin/sh\nif [ "$1" = -s ]; then echo Linux; else echo x86_64; fi\n', { mode: 0o755 })
    writeFileSync(join(commands, 'curl'), `#!/bin/sh
output=
url=
while [ "$#" -gt 0 ]; do
  case "$1" in -o) output="$2"; shift 2 ;; https://github.com/PbtServers/PbtModLauncherX-Dev/*) url="$1"; shift ;; -*) shift ;; *) exit 99 ;; esac
done
[ -n "$url" ] || exit 98
case "$url" in *.sha256) cp '${shellPath(join(fixture, 'payload.sha256'))}' "$output" ;; *) cp '${shellPath(archive)}' "$output" ;; esac
`, { mode: 0o755 })
    if (existing) { mkdirSync(destination); writeFileSync(join(destination, 'user-data.txt'), 'keep existing data') }
    const result = spawnSync(gitShell, ['-c', `export PATH='${shellPath(commands)}':/usr/bin:/bin:"$PATH"; sh '${shellPath(join(root, 'installer/install.sh'))}' --version 1.0.6 --install-dir '${shellPath(destination)}'`], { encoding: 'utf8' })
    return { result, destination }
  }
  test('extracts an official archive after verifying its SHA-256', () => {
    const { result, destination } = run(true)
    expect(result.status, result.stderr).toBe(0)
    expect(existsSync(join(destination, 'pbtmodlauncherx'))).toBe(true)
  })
  test('rejects an invalid hash before installation', () => {
    const { result, destination } = run(false)
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('SHA-256 mismatch')
    expect(existsSync(destination)).toBe(false)
  })
  test('preserves an existing destination', () => {
    const { result, destination } = run(true, true)
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('destination already exists')
    expect(readFileSync(join(destination, 'user-data.txt'), 'utf8')).toBe('keep existing data')
  })
})
