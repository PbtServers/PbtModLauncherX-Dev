import type { ServerExportMod, ServerModNecessity, ServerModSide } from '@xmcl/runtime-api'

export function findServerModClassification(installed: { hash?: string; fileName?: string; path: string }[], mods: ServerExportMod[]) {
  if (installed.length !== 1) return undefined // Different installed builds must not share a label.
  const file = installed[0]
  return mods.find(mod => mod.sha1 && file.hash ? mod.sha1 === file.hash : mod.path.split('/').at(-1) === (file.fileName ?? file.path.replaceAll('\\', '/').split('/').at(-1)))
}
export function matchesServerModFilters(mod: ServerExportMod | undefined, type?: ServerModSide | null, server?: ServerModNecessity | null) {
  return (!type || (mod?.classification?.type.value ?? 'unknown') === type) && (!server || (mod?.classification?.server.value ?? 'unknown') === server)
}
