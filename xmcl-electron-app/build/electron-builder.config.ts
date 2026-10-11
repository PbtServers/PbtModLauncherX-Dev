/* eslint-disable no-template-curly-in-string */
import { config as dotenv } from 'dotenv'
import type { Configuration } from 'electron-builder'
import { resolve } from 'path'
import { validateOllamaBundle } from '../../xmcl-runtime/agent/runtimeBundle'
import { validateFactoryModel } from '../../xmcl-runtime/agent/modelBundle'

dotenv()

const linuxPackageScripts = {
  afterInstall: 'build/linux/after-install.tpl',
  afterRemove: 'build/linux/after-remove.tpl',
  appArmorProfile: 'build/linux/apparmor-profile.tpl',
  fpm: [`--after-upgrade=${resolve(__dirname, 'linux', 'after-install.tpl')}`],
}

export const config = {
  beforePack: async (context) => {
    const platform = context.electronPlatformName
    const arch = ({ 0: 'ia32', 1: 'x64', 2: 'arm', 3: 'arm64' } as Record<number, string>)[context.arch] || 'unsupported'
    const folder = ({ win32: 'win', darwin: 'mac', linux: 'linux' } as Record<string, string>)[platform]
    await validateOllamaBundle(resolve(__dirname, 'ollama', `${folder}-${arch}`), platform, arch)
    await validateFactoryModel(resolve(__dirname, 'ollama', 'ollama-model'))
  },
  extraFiles: process.env.PBT_DISTRIBUTION_MODE === 'portable' ? [{ from: 'build/pbt-portable.json', to: 'pbt-portable.json' }] : [],
  productName: 'PbtModLauncherX',
  appId: 'PbtModLauncherX',
  directories: {
    output: 'build/output',
    buildResources: 'build',
    app: '.',
  },
  protocols: {
    name: 'PbtModLauncherX',
    schemes: ['xmcl'],
  },
  // assign publish for auto-updater
  // set this to your own repo!
  publish: [{
    provider: 'github',
    owner: 'PbtServers',
    repo: 'PbtModLauncherX-Dev',
  }],
  files: [{
    from: 'dist',
    to: '.',
    filter: ['**/*.js', '**/*.ico', '**/*.png', '**/*.webp', '**/*.svg', '*.node', '*.dll', '**/*.html', '**/*.css', '**/*.woff2', '**/*.wasm'],
  }, {
    from: '.',
    to: '.',
    filter: 'package.json',
  }],
  extraResources: [{ from: 'build/ollama/${os}-${arch}', to: 'ollama', filter: ['**/*'] }, { from: 'build/ollama/ollama-model', to: 'ollama-model', filter: ['**/*'] }, {
    from: 'main/agent-documents',
    to: 'agent-documents',
    filter: ['**/*.md'],
  }, {
    from: '../PbtModLauncherX-Data/PbtAdmin/knowledge',
    to: 'pbtadmin-knowledge',
    filter: ['*.md', 'sources.json'],
  }],
  artifactName: 'pbtmodlauncherx-${version}-${platform}-${arch}.${ext}',
  appx: {
    displayName: 'PbtModLauncherX',
    applicationId: 'pbtmodlauncherx',
    identityName: 'pbtmodlauncherx',
    backgroundColor: 'transparent',
    publisher: process.env.PUBLISHER || 'CN=DAFB9390-F5BD-4F94-828C-242F8DAA6FDE',
    publisherDisplayName: 'PbtServers',
    setBuildNumber: true,
  },
  dmg: {
    artifactName: 'pbtmodlauncherx-${version}-${arch}.${ext}',
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications',
      },
      {
        x: 130,
        y: 150,
        type: 'file',
      },
    ],
  },
  mac: {
    // Preserve the independently signed, hash-verified official runtime.
    signIgnore: ['resources/ollama/.*'],
    icon: 'icons/dark.icns',
    darkModeSupport: true,
    target: [
      {
        target: 'dmg',
        arch: [process.env.PBT_PACKAGE_ARCH === 'x64' ? 'x64' : 'arm64'],
      },
    ],
    extendInfo: {
      NSLocalNetworkUsageDescription: 'PbtModLauncherX and Minecraft need access to your local network to discover and connect to LAN games and servers.',
      NSMicrophoneUsageDescription: 'A Minecraft mod wants to access your microphone.',
      NSCameraUsageDescription: 'Please give us access to your camera',
      'com.apple.security.device.audio-input': true,
      'com.apple.security.device.camera': true,
    },
  },
  win: {
    signtoolOptions: {
      certificateFile: undefined as string | undefined,
      publisherName: 'CI010',
    },
    icon: 'icons/dark.ico',
    electronLanguages: ['en-US'],
    target: [
      {
        target: 'zip',
        arch: [
          'x64',
        ],
      },
      'appx',
    ],
  },
  linux: {
    executableName: 'pbtmodlauncherx',
    electronLanguages: ['en-US'],
    desktop: {
      entry: {
        MimeType: 'x-scheme-handler/xmcl',
        StartupWMClass: 'xmcl',
      },
    },
    category: 'Game',
    icon: 'icons/dark@256x256.png',
    artifactName: 'pbtmodlauncherx-${version}-${arch}.${ext}',
    target: [
      { target: 'deb', arch: [process.env.PBT_PACKAGE_ARCH === 'arm64' ? 'arm64' : 'x64'] },
      { target: 'rpm', arch: [process.env.PBT_PACKAGE_ARCH === 'arm64' ? 'arm64' : 'x64'] },
      { target: 'AppImage', arch: [process.env.PBT_PACKAGE_ARCH === 'arm64' ? 'arm64' : 'x64'] },
      { target: 'tar.xz', arch: [process.env.PBT_PACKAGE_ARCH === 'arm64' ? 'arm64' : 'x64'] },
      { target: 'pacman', arch: [process.env.PBT_PACKAGE_ARCH === 'arm64' ? 'arm64' : 'x64'] },
    ],
  },
  deb: linuxPackageScripts,
  rpm: linuxPackageScripts,
  pacman: linuxPackageScripts,
  snap: {
    publish: [
      'github',
    ],
  },
} satisfies Configuration
