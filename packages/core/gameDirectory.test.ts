import { expect, test } from 'vitest'
import { normalizeGameDirectory } from './gameDirectory'

test('deduplicates inherited and user gameDir without dropping loader options', () => {
  expect(normalizeGameDirectory(['--gameDir', 'parent', '--tweakClass', 'LabyMod', '--gameDir=child', '--version', '1.8.9'], 'D:/Minecraft data/instance')).toEqual(['--gameDir', 'D:/Minecraft data/instance', '--tweakClass', 'LabyMod', '--version', '1.8.9'])
})
test('preserves vanilla and other loader arguments', () => {
  const args = ['--gameDir', '/instance', '--fml.forgeVersion', '47.2.0']
  expect(normalizeGameDirectory(args, '/instance')).toEqual(args)
  expect(normalizeGameDirectory(['--demo'], '/instance')).toEqual(['--demo'])
})
test('does not swallow the next option when a gameDir value is missing', () => {
  expect(normalizeGameDirectory(['--gameDir', '--tweakClass', 'LabyMod'], '/instance')).toEqual(['--gameDir', '/instance', '--tweakClass', 'LabyMod'])
})
