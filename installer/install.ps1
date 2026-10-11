<#
.SYNOPSIS
  Installs the official PbtModLauncherX portable Windows release.
.DESCRIPTION
  Downloads the PbtServers ZIP and verifies SHA-256 before extraction.
  Preserves existing installations and user data. Original XMCL npm
  reconstruction remains available in upstream/install.ps1 (MIT).
#>
[CmdletBinding()]
param(
  [string]$InstallDir = "$env:LOCALAPPDATA\Programs\PbtModLauncherX",
  [ValidatePattern('^(latest|v?[0-9][0-9A-Za-z.+-]*)$')]
  [string]$Version = 'latest',
  [switch]$Launch
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$destination = [IO.Path]::GetFullPath($InstallDir)
if (Test-Path -LiteralPath $destination) { throw "PbtModLauncherX: destination already exists: $destination" }
$architecture = switch ($env:PROCESSOR_ARCHITECTURE) {
  'AMD64' { 'x64' }
  'x86' { 'ia32' }
  default { throw 'PbtModLauncherX: portable Windows releases support x64 and ia32.' }
}
$base = 'https://api.github.com/repos/PbtServers/PbtModLauncherX-Dev/releases'
$endpoint = if ($Version -eq 'latest') { "$base/latest" } else { "$base/tags/v$($Version.TrimStart('v'))" }
$release = Invoke-RestMethod -Uri $endpoint
$releaseVersion = $release.tag_name.TrimStart('v')
if ($releaseVersion -notmatch '^[0-9][0-9A-Za-z.+-]*$') { throw 'PbtModLauncherX: invalid release version.' }
$name = "pbtmodlauncherx-$releaseVersion-win32-$architecture.zip"
$asset = @($release.assets | Where-Object name -eq $name)
$hashAsset = @($release.assets | Where-Object name -eq "$name.sha256")
if ($asset.Count -ne 1 -or $hashAsset.Count -ne 1) { throw "PbtModLauncherX: release has no ZIP and SHA-256 for $architecture." }
$trustedPrefix = 'https://github.com/PbtServers/PbtModLauncherX-Dev/releases/download/'
foreach ($entry in @($asset[0], $hashAsset[0])) {
  if (-not $entry.browser_download_url.StartsWith($trustedPrefix, [StringComparison]::Ordinal)) {
    throw 'PbtModLauncherX: asset is outside the official repository.'
  }
}
$temporary = Join-Path ([IO.Path]::GetTempPath()) ('pbtmodlauncherx-install-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $temporary | Out-Null
try {
  $archive = Join-Path $temporary $name
  $hashFile = Join-Path $temporary "$name.sha256"
  Write-Host "Installing PbtModLauncherX $releaseVersion ($architecture)"
  Invoke-WebRequest -Uri $asset[0].browser_download_url -OutFile $archive
  Invoke-WebRequest -Uri $hashAsset[0].browser_download_url -OutFile $hashFile
  $expected = ((Get-Content -LiteralPath $hashFile -Raw).Trim() -split '\s+')[0]
  if ($expected -notmatch '^[0-9a-fA-F]{64}$' -or (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash -ine $expected) {
    throw 'PbtModLauncherX: portable archive SHA-256 mismatch.'
  }
  $staging = Join-Path $temporary 'application'
  Expand-Archive -LiteralPath $archive -DestinationPath $staging
  if (-not (Test-Path -LiteralPath (Join-Path $staging 'PbtModLauncherX.exe') -PathType Leaf)) {
    throw 'PbtModLauncherX: ZIP has no PbtModLauncherX.exe.'
  }
  if (Test-Path -LiteralPath $destination) { throw 'PbtModLauncherX: destination now exists.' }
  New-Item -ItemType Directory -Force -Path ([IO.Path]::GetDirectoryName($destination)) | Out-Null
  Move-Item -LiteralPath $staging -Destination $destination
  Write-Host "PbtModLauncherX installed at $destination"
  if ($Launch) { Start-Process -FilePath (Join-Path $destination 'PbtModLauncherX.exe') -WindowStyle Hidden }
} finally {
  $resolvedTemporary = [IO.Path]::GetFullPath($temporary)
  $temporaryRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\') + '\'
  if ($resolvedTemporary.StartsWith($temporaryRoot, [StringComparison]::OrdinalIgnoreCase) -and
      [IO.Path]::GetFileName($resolvedTemporary).StartsWith('pbtmodlauncherx-install-')) {
    Remove-Item -LiteralPath $resolvedTemporary -Recurse -Force
  }
}
