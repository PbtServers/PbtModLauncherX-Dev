import type { ServerExportLoader, ServerInstallRecipe, VersionMetadataService } from '@xmcl/runtime-api'
import { getNeoForgeProject } from '~/install/neoForgeMetadata'
import { exactServerVersion, officialServerUrl } from './serverExportRecipe'

export async function resolveServerInstallRecipe(minecraft: string, loader: ServerExportLoader, version: string, metadata: VersionMetadataService, fetchMetadata: (url: string, json?: boolean) => Promise<any>): Promise<ServerInstallRecipe> {
    exactServerVersion(minecraft)
    if (loader !== 'vanilla') exactServerVersion(version)
    const entry = (await metadata.getMinecraftVersions()).versions.find(entry => entry.id === minecraft)
    if (!entry) throw new Error('metadataUnavailable')
    const raw = await fetchMetadata(entry.url)
    if (raw.id !== minecraft || !Number.isSafeInteger(raw.javaVersion?.majorVersion)) throw new Error('metadataUnavailable')
    const recipe: ServerInstallRecipe = { loader, minecraft, loaderVersion: version, java: raw.javaVersion.majorVersion, download: { url: '', sha1: '', name: 'installer.jar' }, installArgs: [], instructionsUrl: 'https://www.minecraft.net/en-us/download/server' }
    if (loader === 'vanilla') {
      recipe.download = { ...raw.downloads?.server, name: 'server.jar' }
      recipe.launchJar = 'server.jar'
    } else if (loader === 'forge') {
      const forge = (await metadata.getForgeVersions(minecraft)).find(build => build.version === version)
      if (!forge?.installer || recipe.java < 16) throw new Error('unsupportedRecipe')
      recipe.download.url = `https://maven.minecraftforge.net/net/minecraftforge/forge/${minecraft}-${version}/forge-${minecraft}-${version}-installer.jar`
      recipe.download.sha1 = forge.installer.sha1
      recipe.installArgs = ['--installServer']
      recipe.instructionsUrl = 'https://files.minecraftforge.net/'
    } else if (loader === 'neoforge') {
      if (!(await metadata.getNeoForgedVersions(minecraft)).includes(version)) throw new Error('unsupportedRecipe')
      const project = getNeoForgeProject(minecraft)
      recipe.download.url = `https://maven.neoforged.net/releases/net/neoforged/${project}/${version}/${project}-${version}-installer.jar`
      recipe.installArgs = ['--installServer']
      recipe.instructionsUrl = 'https://docs.neoforged.net/user/docs/server/'
    } else {
      const versions = loader === 'fabric' ? await metadata.getFabricVersions() : await metadata.getQuiltVersions()
      if (!versions.gameVersions.includes(minecraft) || !versions.loaderVersions.some(build => build.version === version)) throw new Error('unsupportedRecipe')
      // Verify the selected loader/Minecraft pair rather than assuming global availability.
      const pair = await fetchMetadata(`https://meta.${loader === 'fabric' ? 'fabricmc.net/v2' : 'quiltmc.org/v3'}/versions/loader/${minecraft}/${version}`)
      if (pair.loader?.version !== version) throw new Error('unsupportedRecipe')
      const installers = await fetchMetadata(`https://meta.${loader === 'fabric' ? 'fabricmc.net/v2' : 'quiltmc.org/v3'}/versions/installer`)
      const installer = installers.find((build: { stable?: boolean; version: string; url: string }) => build.stable) ?? installers[0]
      recipe.installerVersion = exactServerVersion(installer.version)
      recipe.download.url = officialServerUrl(installer.url)
      recipe.launchJar = `${loader}-server-launch.jar`
      recipe.installArgs = loader === 'fabric' ? ['server', '-mcversion', minecraft, '-loader', version, '-downloadMinecraft'] : []
      recipe.instructionsUrl = loader === 'fabric' ? 'https://fabricmc.net/use/server/' : 'https://quiltmc.org/en/install/server/'
    }
    recipe.download.url = officialServerUrl(recipe.download.url)
    if (!recipe.download.sha1) recipe.download.sha1 = String(await fetchMetadata(recipe.download.url + '.sha1', false)).trim().split(/\s/)[0]
    if (!/^[a-fA-F0-9]{40}$/.test(recipe.download.sha1)) throw new Error('metadataUnavailable')
    return recipe
  }