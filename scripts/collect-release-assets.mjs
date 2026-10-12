import { copyFile, link, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { verifyPackages } from './verify-release-packages.mjs'

// Download artifacts separately so equal names can never silently overwrite.
export async function collectReleaseAssets(input = 'build') {
  const root = resolve(input)
  const destination = join(root, 'release')
  await mkdir(destination, { recursive: true })
  if ((await readdir(destination)).length) throw new Error('Release staging must be empty')
  const targets = ['Windows-x64', 'Linux-x64', 'Linux-arm64', 'macOS-x64', 'macOS-arm64']
  const { version } = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  )
  const selected = new Set()
  const require = createRequire(new URL('../xmcl-electron-app/package.json', import.meta.url))
  const { load, dump } = createRequire(require.resolve('app-builder-lib'))('js-yaml')
  let macFeed
  for (const target of targets) {
    const source = join(root, `build-${target}`)
    const receipt = JSON.parse(await readFile(join(source, `packages-${target}.json`), 'utf8'))
    if (
      receipt.version !== version ||
      `${receipt.os}-${receipt.arch}` !== target ||
      !Array.isArray(receipt.packages) ||
      !receipt.packages.length
    )
      throw new Error(`Invalid build receipt: ${target}`)
    const checked = await verifyPackages(source, receipt.os, receipt.arch, receipt.version)
    if (JSON.stringify(checked) !== JSON.stringify(receipt.packages))
      throw new Error(`Build bytes changed: ${target}`)
    const platform = { Windows: 'win', Linux: 'linux', macOS: 'mac' }[receipt.os]
    const manifest = `manifest-${platform}${receipt.arch === 'arm64' ? '-arm64' : ''}.json`
    const metadata = JSON.parse(await readFile(join(source, manifest), 'utf8'))
    if (
      metadata.version !== version ||
      metadata.platform !== { Windows: 'win32', Linux: 'linux', macOS: 'darwin' }[receipt.os] ||
      metadata.arch !== receipt.arch ||
      metadata.product !== 'PbtModLauncherX' ||
      metadata.updateMode !== 'full-package' ||
      !/^[a-f0-9]{64}$/.test(metadata.dependencies)
    )
      throw new Error(`Invalid package manifest: ${target}`)
    if (receipt.os === 'Linux') {
      const content = JSON.parse(await readFile(join(source, `content-${target}.json`), 'utf8'))
      if (
        content.version !== version ||
        !Array.isArray(content.results) ||
        content.results.length !== checked.length ||
        checked.some((file) => {
          const matches = content.results.filter((result) => result.name === file.name)
          return (
            matches.length !== 1 ||
            matches[0].arch !== receipt.arch ||
            matches[0].runtimeVersion !== 'v0.34.0' ||
            !Number.isInteger(matches[0].runtimeFiles) ||
            matches[0].runtimeFiles < 1 ||
            ['hashesVerified', 'knowledgeVerified', 'executableVerified'].some(
              (key) => matches[0][key] !== true,
            )
          )
        })
      )
        throw new Error(`Incomplete Linux package resource verification: ${target}`)
    }
    const allowed = new Set([
      ...checked.flatMap((file) => [file.name, `${file.name}.sha256`, `${file.name}.blockmap`]),
      `packages-${target}.json`,
      `SHA256SUMS-${target}.txt`,
      manifest,
      ...(receipt.os === 'Linux' ? [`content-${target}.json`] : []),
      ...(receipt.os === 'Windows' ? ['pbtmodlauncherx.appinstaller'] : []),
    ])
    for (const name of await readdir(source)) {
      if (/^builder-(debug|effective-config)\.ya?ml$/.test(name)) continue // diagnostic files are retained in Actions only
      if (name === 'latest-mac.yml') {
        const feed = load(await readFile(join(source, name), 'utf8'))
        if (macFeed && macFeed.version !== feed.version)
          throw new Error('Inconsistent macOS update versions')
        if (!macFeed) macFeed = feed
        else macFeed.files.push(...feed.files)
        continue
      }
      if (!allowed.has(name) && !/^(latest|beta|alpha).*\.yml$/.test(name))
        throw new Error(`Unexpected release asset: ${target}/${name}`)
      if (selected.has(name)) throw new Error(`Duplicate release asset: ${name}`)
      selected.add(name)
      // Staging shares immutable artifact bytes on the same filesystem, avoiding
      // a second full set of installers on the release runner's limited disk.
      try {
        await link(join(source, name), join(destination, name))
      } catch (error) {
        if (!['EXDEV', 'ENOTSUP', 'EPERM'].includes(error.code)) throw error
        await copyFile(join(source, name), join(destination, name), constants.COPYFILE_EXCL)
      }
    }
  }
  if (macFeed) {
    if (new Set(macFeed.files.map((file) => file.url)).size !== macFeed.files.length)
      throw new Error('Duplicate macOS update packages')
    await writeFile(join(destination, 'latest-mac.yml'), dump(macFeed))
  }
  await writeFile(
    join(destination, 'INSTALLATION.txt'),
    'DeskGap Windows EXE: UNSIGNED PREVIEW, manual installation only. The DeskGap updater intentionally rejects unsigned EXEs. Use the APPX signing workflow when a signed Windows package is required.\n',
    { flag: 'wx' },
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await collectReleaseAssets(process.argv[2])
}
