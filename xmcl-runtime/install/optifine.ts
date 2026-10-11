import { OptifineVersion } from '@xmcl/runtime-api'
import { InjectionKey } from '~/app'
import type { VersionMetadataSource } from './versionMetadataCache'

export const kOptifineInstaller: InjectionKey<(version: OptifineVersion) => Promise<string>> = Symbol('kOptifineInstaller')
export const kOptifineVersionsProvider: InjectionKey<() => Promise<OptifineVersion[]>> = Symbol('kOptifineVersionsProvider')

export function createOptifineMetadataSources(useMirror: boolean, official?: () => Promise<OptifineVersion[]>) {
  const sources: VersionMetadataSource<OptifineVersion[]>[] = []
  if (useMirror) sources.push({
    url: 'https://bmclapi2.bangbang93.com/optifine/versionList',
    parse: response => response.json(),
  })
  if (official) sources.push({
    url: 'https://optifine.net/downloads',
    fetch: async () => new Response(JSON.stringify(await official()), { headers: { 'Content-Type': 'application/json' } }),
    parse: response => response.json(),
  })
  return sources
}
