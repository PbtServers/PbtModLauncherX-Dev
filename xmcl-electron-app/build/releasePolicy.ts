import { lt, valid } from 'semver'

/** Legacy clients install standalone ASARs without proving native runtime
 * compatibility. The architecture transition must use a full package. Keep
 * future releases full-only until legacy-client migration is established. */
export function canEmitLegacyAsarAsset(version: string) {
  return !!valid(version) && lt(version, '1.0.7')
}
