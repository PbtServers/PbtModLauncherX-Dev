/** Legacy vanilla profiles name LWJGL 2 and JNA platform under different
 * Maven groups/artifacts than LabyMod's replacements. Ordinary inheritance
 * therefore keeps both, although their Java packages collide at runtime. */
export function normalizeLabyModLibraries<T extends { name: string; groupId: string; artifactId: string }>(libraries: T[]): T[] {
  if (!libraries.some(library => library.name.startsWith('net.labymod:LabyMod:'))) return libraries
  const lwjgl3 = libraries.some(library => library.groupId === 'org.lwjgl')
  const modernJnaPlatform = libraries.some(library => library.groupId === 'net.java.dev.jna' && library.artifactId.startsWith('jna-platform'))
  return libraries.filter(library => !(lwjgl3 && library.groupId === 'org.lwjgl.lwjgl')
    && !(modernJnaPlatform && library.groupId === 'net.java.dev.jna' && library.artifactId === 'platform'))
}
