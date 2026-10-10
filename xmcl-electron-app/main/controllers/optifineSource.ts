import type { OptifineVersion } from '@xmcl/runtime-api'

export type OptifineDownloadSource =
  | { type: 'mirror'; url: string }
  | { type: 'official'; fileName: string }

export async function resolveOptifineInstallerUrl(
  version: OptifineVersion,
  mirrorEnabled: boolean,
  official: (fileName: string) => Promise<string>,
) {
  const source = resolveOptifineDownloadSource(version, mirrorEnabled)
  if (source.type === 'mirror') return source.url
  const result = new URL(await official(source.fileName))
  if (result.protocol !== 'https:' || !['optifine.net', 'optifined.net'].includes(result.hostname)
    || result.pathname !== '/downloadx.php') throw new Error('Invalid official OptiFine download URL')
  return result.toString()
}

export function parseOfficialOptifineName(name: string) {
  const [hd, edition, release, preview] = name.trim().replace(/^OptiFine\s+/, '').split(/\s+/)
  return preview?.startsWith('pre')
    ? { type: `${hd}_${edition}_${release}`, patch: preview }
    : { type: `${hd}_${edition}`, patch: release }
}

export function resolveOptifineDownloadSource(
  version: OptifineVersion,
  mirrorEnabled: boolean,
): OptifineDownloadSource {
  if (mirrorEnabled) {
    let minecraft = version.mcversion
    if (minecraft === '1.9' || minecraft === '1.8') minecraft += '.0'
    return {
      type: 'mirror',
      url: `https://bmclapi2.bangbang93.com/optifine/${minecraft}/${version.type}/${version.patch}`,
    }
  }
  return {
    type: 'official',
    fileName: version.patch.startsWith('pre')
      ? `preview_OptiFine_${version.mcversion}_${version.type}_${version.patch}.jar`
      : `OptiFine_${version.mcversion}_${version.type}_${version.patch}.jar`,
  }
}
