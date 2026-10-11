$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Wrong branch' }
if (Get-Process PbtModLauncherX -ErrorAction SilentlyContinue) { throw 'Close the launcher before rebuilding. Existing processes will not be stopped.' }
function Invoke-CheckedNative {
  param([string]$Command, [string[]]$Arguments, [string]$Log)
  $previousPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = 'Continue'
    & $Command @Arguments 2>&1 | Tee-Object -FilePath $Log -ErrorAction Stop
    $code = $LASTEXITCODE
  } finally { $ErrorActionPreference = $previousPreference }
  if ($code -ne 0) { throw "$Command exited $code. Inspect $Log" }
}
$previous = @{}
foreach ($name in @('PBT_DISTRIBUTION_MODE','BUILD_TARGET','RELEASE','PBT_PORTABLE_DATA')) { $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
try {
  New-Item -ItemType Directory -Force -Path 'temp' | Out-Null
  $env:PBT_DISTRIBUTION_MODE = 'portable'
  $env:RELEASE = 'false'
  Remove-Item Env:BUILD_TARGET -ErrorAction SilentlyContinue
  Invoke-CheckedNative 'pnpm.cmd' @('build:renderer') 'temp/phase158-renderer-external.log'
  Invoke-CheckedNative 'pnpm.cmd' @('--prefix=xmcl-electron-app','build') 'temp/phase158-electron-external.log'
  Invoke-CheckedNative 'node.exe' @('scripts/validate-pbtadmin-lore.mjs','--question=Hola') 'temp/phase158-hello-external.log'
  Invoke-CheckedNative 'node.exe' @('scripts/validate-pbtadmin-lore.mjs') 'temp/phase158-lore-external.log'
  $exe = Join-Path $PWD 'xmcl-electron-app/build/output/win-unpacked/PbtModLauncherX.exe'
  if (!(Test-Path (Join-Path (Split-Path $exe) 'pbt-portable.json'))) { throw 'Portable marker missing' }
  $profile = Join-Path $PWD ('temp/phase158-ui-' + [Guid]::NewGuid())
  New-Item -ItemType Directory -Path $profile | Out-Null
  $env:PBT_PORTABLE_DATA = $profile
  Write-Host "Isolated profile: $profile"
  Write-Host 'Test Hola, identity, 0ftome, JuanD, a Minecraft explanation, and an explicitly requested diagnostic. Continue for ten turns. Verify streaming, sources and errors. Reopen to check history. Enable low-resource mode and start PbtAdmin manually. Do not approve file changes for this test.'
  foreach ($attempt in @(1,2)) {
    $process = Start-Process -FilePath $exe -WindowStyle Normal -PassThru
    Write-Host "Opening $attempt; launcher PID $($process.Id)"
    $process.WaitForExit()
  }
  Write-Host "Return the native logs, UTF-8 result JSON paths and visual observations. Keep the isolated profile at $profile for evidence. No personal profile was selected."
} finally {
  foreach ($name in $previous.Keys) { [Environment]::SetEnvironmentVariable($name, $previous[$name], 'Process') }
}
