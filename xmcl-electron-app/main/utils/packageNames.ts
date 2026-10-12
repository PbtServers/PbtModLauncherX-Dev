/** Matches electron-builder 26 getArtifactArchName without shipping build tools. */
export function linuxPackageName(version: string, arch: string, format: string) {
  const aliases: Record<string, Record<string, string>> = {
    x64: { AppImage: 'x86_64', deb: 'amd64', rpm: 'x86_64', pacman: 'x64', 'tar.xz': 'x64' },
    arm64: { AppImage: 'arm64', deb: 'arm64', rpm: 'aarch64', pacman: 'aarch64', 'tar.xz': 'arm64' },
  }
  const name = aliases[arch]?.[format]
  if (!name) throw new Error('Unsupported Linux update format or architecture')
  return `pbtmodlauncherx-${version}-${name}.${format}`
}
