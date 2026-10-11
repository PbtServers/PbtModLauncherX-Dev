#!/usr/bin/env python3
"""Apply PbtModLauncherX macOS/Linux CI fixes to a local checkout. Windows build unchanged."""
from pathlib import Path
import sys
root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()

def edit(path, replacements):
    p=root/path
    s=p.read_text(encoding='utf-8')
    original=s
    for old,new in replacements:
        n=s.count(old)
        if n!=1:
            raise RuntimeError(f'{path}: expected exactly one occurrence ({n}) of {old[:95]!r}')
        s=s.replace(old,new,1)
    p.write_text(s,encoding='utf-8')
    print('Updated',path, '(changed',len(s)-len(original),'chars)')

edit('.github/workflows/build.yml', [
('''      matrix:
        os:
          - ubuntu-latest
          - macos-latest
          - windows-latest''','''      matrix:
        include:
          - os: ubuntu-latest
            package_arch: x64
          - os: ubuntu-latest
            package_arch: arm64
          - os: macos-latest
            package_arch: x64
          - os: macos-latest
            package_arch: arm64
          - os: windows-latest
            package_arch: x64'''),
('''    env:
      ELECTRON_CACHE:''','''    env:
      PBT_PACKAGE_ARCH: ${{ matrix.package_arch }}
      ELECTRON_CACHE:'''),
('''      - name: Build
        shell: bash''','''      - name: Check available packaging space
        if: ${{ runner.os != 'Windows' }}
        shell: bash
        run: |
          df -h .
          du -sh xmcl-electron-app/build/ollama/* 2>/dev/null || true
      - name: Build
        shell: bash'''),
('''          NODE_OPTIONS: --max-old-space-size=32768''','''          NODE_OPTIONS: --max-old-space-size=8192'''),
('''          name: build-${{ runner.os }}''','''          name: build-${{ runner.os }}-${{ matrix.package_arch }}'''),
('''          name: linux-b${{ github.run_number }}-x64''','''          name: linux-b${{ github.run_number }}-${{ matrix.package_arch }}-x64'''),
('''          name: linux-b${{ github.run_number }}-arm64''','''          name: linux-b${{ github.run_number }}-${{ matrix.package_arch }}-arm64'''),
('''          name: mac-b${{ github.run_number }}-x64''','''          name: mac-b${{ github.run_number }}-${{ matrix.package_arch }}-x64'''),
('''          name: mac-b${{ github.run_number }}-arm64''','''          name: mac-b${{ github.run_number }}-${{ matrix.package_arch }}-arm64'''),
])
edit('xmcl-electron-app/build/electron-builder.config.ts', [
("arch: ['arm64', 'x64'],", "arch: [process.env.PBT_PACKAGE_ARCH === 'x64' ? 'x64' : 'arm64'],"),
*[(f"{{ target: '{target}', arch: ['x64', 'arm64'] }}",f"{{ target: '{target}', arch: [process.env.PBT_PACKAGE_ARCH === 'arm64' ? 'arm64' : 'x64'] }}") for target in ('deb','rpm','AppImage','tar.xz','pacman')]
])
edit('scripts/ci-ollama.ts', [
("  const arches = process.platform === 'win32' ? ['x64'] : ['x64', 'arm64']", "  const targetArch = process.env.PBT_PACKAGE_ARCH\n  if (targetArch && !['x64', 'arm64'].includes(targetArch)) throw new Error('Invalid package architecture')\n  // Keep the host-native engine for offline model import, plus the requested package runtime.\n  const arches = process.platform === 'win32' ? ['x64'] : [...new Set([process.arch, targetArch || 'x64', ...(targetArch ? [] : ['arm64'])])]") ,
("    const requiredGiB = process.platform === 'linux' ? 40 : process.platform === 'win32' ? 20 : 12", "    const requiredGiB = process.platform === 'linux' ? 20 : process.platform === 'win32' ? 20 : 12")
])
edit('scripts/prepare-ollama-model.mjs', [
("const engine = new ManagedOllama({ bundle: resolve(`xmcl-electron-app/build/ollama/${platform}-${process.arch}`), data: join(work, 'engine') })", "const engine = new ManagedOllama({ bundle: resolve(`xmcl-electron-app/build/ollama/${platform}-${process.arch}`), data: join(work, 'engine'), readinessTimeoutMs: 120000 }, undefined, (event, details) => console.log('Ollama preparation:', event, JSON.stringify(details || {})))")
])
edit('scripts/prepare-ollama-hf.mjs', [
("const engine = new ManagedOllama({ bundle: runtimePath, data: join(work, 'engine') })", "const engine = new ManagedOllama({ bundle: runtimePath, data: join(work, 'engine'), readinessTimeoutMs: 120000 }, undefined, (event, details) => console.log('Ollama HF import:', event, JSON.stringify(details || {})))")
])
print('Done. Review git diff before pushing. Run CI to verify; not yet validated on GitHub.')
