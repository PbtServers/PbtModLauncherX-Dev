import { expect, test } from 'vitest'
import { normalizeLaunchMemory } from './launchMemory'

test('preserves the selected maximum when an inherited minimum exceeds it', () => {
  expect(normalizeLaunchMemory(1024, 512)).toEqual({ minMemory: 512, maxMemory: 512 })
  expect(normalizeLaunchMemory(512, 2048)).toEqual({ minMemory: 512, maxMemory: 2048 })
})

test('normalizes integer MiB without inventing a maximum for automatic memory', () => {
  expect(normalizeLaunchMemory(1024)).toEqual({ minMemory: 1024, maxMemory: undefined })
  expect(normalizeLaunchMemory(512.5, 2048.5)).toEqual({ minMemory: 512, maxMemory: 2048 })
  for (const invalid of [0, -1, NaN, Infinity]) {
    expect(normalizeLaunchMemory(invalid, invalid)).toEqual({ minMemory: undefined, maxMemory: undefined })
  }
})
