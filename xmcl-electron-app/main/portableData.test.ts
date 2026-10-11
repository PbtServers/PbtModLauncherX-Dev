import { expect, test } from 'vitest'
import { join, dirname, resolve } from 'path'
import { portableDataRoot } from './portableData'
test('portable data follows the real executable when moved and supports Unicode', () => {
  for (const base of ['G:/Pbt carpeta àé', 'H:/otra carpeta ñ']) {
    const executable = join(base, 'PbtModLauncherX.exe')
    expect(portableDataRoot(executable, {}, () => true)?.data).toBe(join(dirname(executable), 'data'))
  }
})
test('installer profiles remain unchanged without a portable marker', () => {
  expect(portableDataRoot('G:/launcher/PbtModLauncherX.exe', {}, () => false)).toBeUndefined()
})
test('AppImage resolves persistent data outside its mounted extraction directory', () => {
  const info = portableDataRoot('/tmp/mount/launcher', { APPIMAGE: '/media/drive/Pbt.AppImage' }, () => true)
  expect(info?.data).toBe(join(resolve(dirname('/media/drive/Pbt.AppImage')), 'data'))
})
test('an explicit alternate writable data root is supported without permanent environment edits', () => {
  const info = portableDataRoot('G:/launcher/Pbt.exe', { PBT_PORTABLE_DATA: 'data-alternative' }, () => true)
  expect(info?.data.endsWith('data-alternative')).toBe(true)
})
