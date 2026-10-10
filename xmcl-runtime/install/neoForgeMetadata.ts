export function getNeoForgeProject(minecraft: string): 'forge' | 'neoforge' {
  return minecraft === '1.20.1' ? 'forge' : 'neoforge'
}

/** NeoForge 21.0 targets 1.21; 21.1 targets 1.21.1, not the whole 1.21 family. */
export function filterNeoForgeVersions(minecraft: string, versions: readonly string[]) {
  const match = /^1\.(\d+)(?:\.(\d+))?$/.exec(minecraft)
  const prefix = match ? `${match[1]}.${match[2] ?? '0'}.` : `${minecraft}.`
  return [...new Set(versions.filter(version => minecraft === '1.20.1'
    ? version.startsWith('1.20.1-47.1.')
    : version.startsWith(prefix)))]
}
