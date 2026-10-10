/** Fork policy: local services and explicitly configured providers, never XMCL cloud. */
export const XMCL_CLOUD_ENABLED = false

/** Local AI servers may legitimately expose an OpenAI-compatible API without a key. */
export function isLoopbackServiceUrl(input: string): boolean {
  try {
    const url = new URL(input)
    return (url.protocol === 'http:' || url.protocol === 'https:') &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && !url.username && !url.password
  } catch {
    return false
  }
}

export function isXmclExclusiveUrl(input: string | URL): boolean {
  try {
    const url = new URL(input)
    const host = url.hostname.toLowerCase().replace(/\.$/, '')
    if (host === 'xmcl.app' || host.endsWith('.xmcl.app') || host === 'xmcl-core-api.azurewebsites.net') return true
    // Never accept an upstream launcher release as a fork update.
    if (host === 'github.com' || host === 'api.github.com') {
      return /^\/(?:repos\/)?voxelum\/x[-_]minecraft[-_]launcher\/releases(?:\/|$)/i.test(url.pathname)
    }
    return false
  } catch {
    return false
  }
}

export function assertIndependentUrl(input: string | URL | { url: string }): void {
  const url = typeof input === 'object' && !(input instanceof URL) ? input.url : input
  if (isXmclExclusiveUrl(url)) throw new Error('pbt_xmcl_cloud_disabled')
}
