import { writeFile } from 'fs/promises'

export function getAppInstallerContent(version: string, publisher: string) {
  const build = process.env.BUILD_NUMBER || '0'
  if (!/^\d+\.\d+\.\d+$/.test(version) || !/^\d+$/.test(build) ||
      [...version.split('.'), build].some(n => Number(n) > 65535)) throw new Error('Invalid AppX package version')
  const escapedPublisher = publisher.replace(/[&"<>']/g, value => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;', "'": '&apos;' })[value]!)
  const result = `<?xml version="1.0" encoding="utf-8"?>
  <AppInstaller
      xmlns="http://schemas.microsoft.com/appx/appinstaller/2018"
      Version="${version}.0"
      Uri="https://github.com/PbtServers/PbtModLauncherX-Dev/releases/latest/download/pbtmodlauncherx.appinstaller" >
      <MainPackage
          Name="pbtmodlauncherx"
          Publisher="${escapedPublisher}"
          Version="${version}.${build}"
          ProcessorArchitecture="x64"
          Uri="https://github.com/PbtServers/PbtModLauncherX-Dev/releases/download/v${version}/pbtmodlauncherx-${version}-win32-x64.appx" />
      <UpdateSettings>
      </UpdateSettings>
  </AppInstaller>`
  return result.padEnd(1024, ' ')
}

export async function buildAppInstaller(version: string, destination: string, publisher: string) {
  await writeFile(destination, getAppInstallerContent(version, publisher))
}
