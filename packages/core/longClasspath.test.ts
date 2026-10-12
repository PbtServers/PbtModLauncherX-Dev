import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, describe, expect, test } from 'vitest'
import { javaMajorFromRelease, prepareLongClasspath, quoteJavaArgument } from './longClasspath'

const roots: string[] = []
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true }) })

describe('Windows long classpath support', () => {
  test.each([['1.8.0_422', 8], ['9.0.4', 9], ['21.0.6', 21], ['24-ea', 24]])('detects the selected Java %s', (version, major) => {
    expect(javaMajorFromRelease(`JAVA_VERSION="${version}"\n`)).toBe(major)
  })
  test('quotes spaces, hashes, quotes, backslashes and line breaks for Java', () => {
    expect(quoteJavaArgument('G:\\área #\\lib "a".jar\n\t')).toBe('"G:\\\\área #\\\\lib \\"a\\".jar\\n\\t"')
  })
  test('reduces only a long classpath and retains gameDir, memory, wrappers and credentials in argv', async () => {
    const root = await mkdtemp(join(tmpdir(), 'pbt-long-classpath-'))
    roots.push(root)
    const home = join(root, 'Java with spaces')
    await mkdir(home)
    await writeFile(join(home, 'release'), 'JAVA_VERSION="21.0.6"')
    const java = join(home, 'bin', 'java.exe')
    const classpath = 'G:/area # con espacios/library.jar;'.repeat(1200)
    const args = ['wrapper', java, '-Xms512M', '-Xmx2048M', '-cp', classpath, 'net.minecraft.client.main.Main', '--gameDir', 'G:/game with spaces', '--accessToken', 'private-test-token']
    const prepared = await prepareLongClasspath(args, java, root, 'win32')
    const argumentFile = prepared.args.find(arg => arg.startsWith('@'))!.slice(1)
    const content = await readFile(argumentFile, 'utf8')
    expect(content).toBe(`${quoteJavaArgument('-cp')}\n${quoteJavaArgument(classpath)}\n`)
    expect(content).not.toContain('private-test-token')
    expect(prepared.args).toEqual(['wrapper', java, '-Xms512M', '-Xmx2048M', '@' + argumentFile, 'net.minecraft.client.main.Main', '--gameDir', 'G:/game with spaces', '--accessToken', 'private-test-token'])
    expect(args[5]).toBe(classpath)
    await prepared.cleanup()
    await prepared.cleanup()
    expect(await readdir(root)).not.toContain(argumentFile.split(/[\\/]/).at(-1))
  })
  test.each(['win32', 'linux', 'darwin'] as const)('does not create an argument file for a short command on %s', async platform => {
    const args = ['java', '-cp', 'library.jar', 'Main']
    expect((await prepareLongClasspath(args, 'java', 'not-accessed', platform)).args).toBe(args)
  })
  test('never uses Java 9 argument files with Java 8', async () => {
    const root = await mkdtemp(join(tmpdir(), 'pbt-java8-classpath-'))
    roots.push(root)
    await writeFile(join(root, 'release'), 'JAVA_VERSION="1.8.0_422"')
    const java = join(root, 'bin', 'java.exe')
    const args = [java, '-cp', 'library.jar;'.repeat(4000), 'Main']
    expect((await prepareLongClasspath(args, java, root, 'win32')).args).toBe(args)
    expect(await readdir(root)).toEqual(['release'])
  })
  test('passes Unicode long commands through CLASSPATH without writing secrets or changing Java 8 flags', async () => {
    const classpath = 'G:/área # con espacios/library.jar;'.repeat(700)
    const args = ['java', '-Xmx512M', '-DlegacyClassPath=' + classpath, '-cp', classpath, 'Main', '--gameDir', 'G:/juego á', '--accessToken', 'private-test-token']
    const prepared = await prepareLongClasspath(args, 'java', 'not-accessed', 'win32', {})
    expect(prepared.classpath).toBe(classpath)
    expect(prepared.args).toEqual(['java', '-Xmx512M', '-DlegacyClassPath=' + classpath, 'Main', '--gameDir', 'G:/juego á', '--accessToken', 'private-test-token'])
    expect(prepared.args).not.toContain('-cp')
    expect(classpath).not.toContain('private-test-token')
  })
  test('does not let JDK_JAVA_OPTIONS override an explicit computed classpath', async () => {
    const classpath = 'library.jar;'.repeat(2000)
    const args = ['java', '-DlegacyClassPath=' + classpath, '-cp', classpath, 'Main']
    expect((await prepareLongClasspath(args, 'java', 'not-accessed', 'win32', { JDK_JAVA_OPTIONS: '-cp user.jar' })).args).toBe(args)
  })
})
