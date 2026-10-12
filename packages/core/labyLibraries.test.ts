import { expect, test } from 'vitest'
import { normalizeLabyModLibraries } from './labyLibraries'
const library = (name: string) => ({ name, groupId: name.split(':')[0], artifactId: name.split(':')[1] })
test('removes only legacy libraries replaced by the modern LabyMod profile', () => {
  const laby = library('net.labymod:LabyMod:4.6.27')
  const lwjgl = library('org.lwjgl:lwjgl:3.4.3')
  const jna = library('net.java.dev.jna:jna-platform:5.17.0')
  const other = library('oshi-project:oshi-core:1.1')
  expect(normalizeLabyModLibraries([library('org.lwjgl.lwjgl:lwjgl:2.9.4'), library('org.lwjgl.lwjgl:lwjgl_util:2.9.4'), library('net.java.dev.jna:platform:3.4.0'), laby, lwjgl, jna, other])).toEqual([laby, lwjgl, jna, other])
})
test('preserves vanilla, other loaders and older LabyMod profiles without replacements', () => {
  const legacy = [library('org.lwjgl.lwjgl:lwjgl:2.9.4'), library('net.java.dev.jna:platform:3.4.0')]
  expect(normalizeLabyModLibraries(legacy)).toBe(legacy)
  expect(normalizeLabyModLibraries([library('net.labymod:LabyMod:4.0.0'), ...legacy])).toEqual([library('net.labymod:LabyMod:4.0.0'), ...legacy])
})
