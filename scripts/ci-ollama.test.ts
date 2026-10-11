import { readFileSync } from 'node:fs'
import { config } from '../xmcl-electron-app/build/electron-builder.config'
import { expect, test } from 'vitest'

test('CI prepares and verifies AI before packaging, including every configured architecture', () => {
  const workflow = readFileSync('.github/workflows/build.yml', 'utf8')
  const prepare = workflow.indexOf('pnpm exec tsx scripts/ci-ollama.ts\n')
  const verify = workflow.indexOf('pnpm exec tsx scripts/ci-ollama.ts --verify-only')
  const build = workflow.indexOf('- name: Build\n')
  expect(prepare).toBeGreaterThan(0)
  expect(verify).toBeGreaterThan(prepare)
  expect(build).toBeGreaterThan(verify)
  expect(config.win.target[0].arch).toEqual(['x64'])
  expect(config.mac.target[0].arch).toEqual([process.env.PBT_PACKAGE_ARCH === 'x64' ? 'x64' : 'arm64'])
  for (const target of config.linux.target) expect(target.arch).toEqual([process.env.PBT_PACKAGE_ARCH === 'arm64' ? 'arm64' : 'x64'])
  const matrix = workflow.split('        include:')[1].split('      fail-fast:')[0]
  expect([...matrix.matchAll(/- os: (\S+)\s+package_arch: (\S+)/g)].map(([, os, arch]) => `${os}/${arch}`)).toEqual([
    'ubuntu-latest/x64', 'ubuntu-latest/arm64', 'macos-latest/x64', 'macos-latest/arm64', 'windows-latest/x64',
  ])
})

test('release updates assets only after successful builds and never creates or edits notes', () => {
  const workflow = readFileSync('.github/workflows/build.yml', 'utf8').split('  release:')[1]
  expect(workflow).toContain("needs.build.result == 'success'")
  expect(workflow).toContain('gh release view "$RELEASE_TAG"')
  expect(workflow).toContain('gh release upload "$RELEASE_TAG" build/* --clobber')
  expect(workflow).not.toMatch(/release create|release edit|RELEASE_BODY|body_path/)
})
