import { describe, expect, it } from 'vitest'
import { assertIndependentUrl, isXmclExclusiveUrl, XMCL_CLOUD_ENABLED, isLoopbackServiceUrl } from './servicePolicy'

describe('PbtServers independent service policy', () => {
  it('disables XMCL cloud without changing official authentication', () => {
    expect(XMCL_CLOUD_ENABLED).toBe(false)
  })
  it.each(['https://api.xmcl.app/auth', 'https://AI.XMCL.APP/v1/chat', 'wss://signaling.xmcl.app/room', 'https://api.xmcl.app./news', 'https://xmcl-core-api.azurewebsites.net/api/flights', 'https://github.com/Voxelum/x-minecraft-launcher/releases/download/v1/app.asar', 'https://api.github.com/repos/Voxelum/x-minecraft-launcher/releases/latest'])('rejects exclusive endpoints: %s', url => {
    expect(isXmclExclusiveUrl(url)).toBe(true)
    expect(() => assertIndependentUrl({ url })).toThrow('pbt_xmcl_cloud_disabled')
  })
  it.each(['https://login.microsoftonline.com/consumers', 'https://api.minecraftservices.com/entitlements/mcstore', 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json', 'https://api.modrinth.com/v2', 'https://api.curseforge.com/v1', 'https://maven.minecraftforge.net', 'https://maven.neoforged.net', 'https://meta.fabricmc.net', 'https://meta.quiltmc.org', 'https://pbtservers.com', 'https://github.com/PbtServers/PbtModLauncherX-Dev/releases/latest', 'http://localhost:3000', 'http://launcher/image/hash', 'https://xmcl.app.example.org', 'https://github.com/Voxelum/minecraft-mods-database/releases/latest/download/db.sqlite'])('preserves public and local providers: %s', url => {
    expect(isXmclExclusiveUrl(url)).toBe(false)
  })
})

it('allows keyless AI only on explicit loopback HTTP endpoints', () => {
  for (const url of ['http://localhost:11434/v1', 'http://127.0.0.1/v1', 'http://[::1]/v1']) expect(isLoopbackServiceUrl(url)).toBe(true)
  for (const url of ['https://localhost.example.org', 'https://remote-provider.example', 'file:///tmp/model', 'http://user@localhost']) expect(isLoopbackServiceUrl(url)).toBe(false)
})
