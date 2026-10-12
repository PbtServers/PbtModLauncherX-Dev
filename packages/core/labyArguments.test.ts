import { expect, test } from 'vitest'
import { normalizeLabyModArguments } from './labyArguments'

test('preserves the complete child profile and repeatable loader flags after vanilla inheritance', () => {
  const parent = ['--username', 'user', '--assetsDir', '/vanilla', '--gameDir', '/parent', '--version', 'vanilla']
  const child = ['--username', 'user', '--assetsDir', '/laby assets', '--gameDir', '/instance with spaces', '--version', 'LabyMod', '--dummyMinecraftClass', 'net.minecraft.client.main.Main', '--tweakClass', 'first', '--tweakClass', 'second']
  expect(normalizeLabyModArguments([...parent, ...child])).toEqual(child)
})
test('supports equals syntax and does not deduplicate unrelated arguments', () => {
  expect(normalizeLabyModArguments(['--assetsDir', '/parent', '--assetsDir=/child', '--custom', 'a', '--custom', 'b'])).toEqual(['--assetsDir=/child', '--custom', 'a', '--custom', 'b'])
})
