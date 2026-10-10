export function isSelectableGameVersion(version: string) {
  return !version.includes('-') && /^\d+(\.\d+)*$/.test(version)
}

export function getSelectableGameVersionIds(versions: string[], current?: string) {
  const result = [...new Set(versions.filter(isSelectableGameVersion))]
  // Keep an actual selected manifest entry, including snapshots/prereleases.
  // Do not fall back to a different release just because the menu hides snapshots.
  if (current && (isSelectableGameVersion(current) || versions.includes(current)) && !result.includes(current)) {
    result.unshift(current)
  }
  return result
}
