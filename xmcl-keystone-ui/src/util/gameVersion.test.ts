import { describe, expect, test } from 'vitest'
import { getSelectableGameVersionIds, isSelectableGameVersion } from './gameVersion'

describe('gameVersion', () => {
  test('accepts modern release ids including 26.1', () => {
    expect(isSelectableGameVersion('1.21.11')).toBe(true)
    expect(isSelectableGameVersion('26.1')).toBe(true)
  })

  test('rejects snapshots and prereleases', () => {
    expect(isSelectableGameVersion('24w14a')).toBe(false)
    expect(isSelectableGameVersion('1.21-pre1')).toBe(false)
    expect(isSelectableGameVersion('1.21.6-rc1')).toBe(false)
  })

  test('keeps the current release visible even if metadata is stale', () => {
    expect(getSelectableGameVersionIds(['1.21.11', '1.21.10'], '26.1')).toEqual(['26.1', '1.21.11', '1.21.10'])
  })
  test.each(['26.1.2-rc-1', '26.1-rc-3', '26.1-snapshot-1'])('preserves selected manifest version %s without substituting 1.21.11', current => {
    expect(getSelectableGameVersionIds(['1.21.11', current, '26.1'], current)).toEqual([current, '1.21.11', '26.1'])
  })
  test.each(['1.8', '1.12.2', '1.20.1', '1.21.1', '26.1', '26.1.1', '26.1.2'])('keeps exact release identifier %s', version => {
    expect(getSelectableGameVersionIds([version, version], version)).toEqual([version])
  })
  test('does not invent a missing snapshot or add arbitrary profile labels', () => {
    expect(getSelectableGameVersionIds(['26.1'], 'custom-profile')).toEqual(['26.1'])
  })
})
