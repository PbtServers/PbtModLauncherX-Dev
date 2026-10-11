/** Keep the last verified public feed even when SWRV's freshness window expires. */
export async function fetchNewsFeed<T>(url: string, key: string, parse: (input: unknown) => T, setOffline: (offline: boolean) => void, load?: () => Promise<unknown>): Promise<T> {
  try {
    const input = await (load ? load() : (async () => {
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!response.ok) throw new Error(`News feed: ${response.status}`)
      return response.json()
    })())
    const result = parse(input)
    try { localStorage.setItem(key, JSON.stringify(input)) } catch { /* Read-only storage still allows online news. */ }
    setOffline(false)
    return result
  } catch (error) {
    setOffline(true)
    try {
      const cached = localStorage.getItem(key)
      if (cached) return parse(JSON.parse(cached))
    } catch { /* Invalid caches cannot replace verified feeds. */ }
    throw error
  }
}
