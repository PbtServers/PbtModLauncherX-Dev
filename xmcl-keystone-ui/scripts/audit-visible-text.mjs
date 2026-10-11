import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseSfc } from '@vue/compiler-sfc'
import { parse } from '@vue/compiler-dom'

// Brands, file formats and technical identifiers are deliberately not translated.
const technical = /^(?:Minecraft|minecraft|forge|Forge|fabric|Fabric|NeoForge|Quilt|LabyMod|Optifine|Iris|Oculus|Java:?|systemd:|PID:|sha1:|EULA|Modrinth|CurseForge|Curseforge|Qwen3 4B|qwen3:1\.7b-q4_K_M|GiB|MiB\/s|Together|XMCL Together|XMCL \/ Voxelum \/ ci010|\(MIT\)\.|PbtModLauncherX|Afdian|Ko-fi|SignPath|Deno Deploy|Deno|BMCLAPI|MCS|CMS|MS\.com|file_type_\w+|minecraft:\w+|\.zip \/ \.mrpack|· SHA-256|· Java|docs\.modrinth\.com|https:\/\/\S+)$/
export function scanVisibleText(source, file = '') {
  const template = parseSfc(source).descriptor.template
  if (!template) return []
  const findings = []
  const check = (text, line) => {
    const value = text.trim()
    const normalized = value.replace(/^[·•]\s*/, '')
    if (/[\p{L}]{3}/u.test(value) && !technical.test(normalized) && !['Microsoft', 'Google', 'Discord', 'SHA-256'].includes(normalized)) findings.push({ file, line: template.loc.start.line + line - 1, text: value })
  }
  function visit(node, parent = '') {
    if (node.type === 2 && !['v-icon', 'code', 'kbd', 'pre'].includes(parent)) check(node.content, node.loc.start.line)
    for (const attr of node.props || []) {
      if (attr.type === 6 && ['title', 'label', 'placeholder', 'aria-label', 'alt'].includes(attr.name) && attr.value) check(attr.value.content, attr.loc.start.line)
    }
    for (const child of node.children || []) visit(child, node.tag)
  }
  visit(parse(template.content))
  return findings
}
export function auditVisibleText(directory = resolve(import.meta.dirname, '../src')) {
  const findings = []
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (path.endsWith('.vue')) findings.push(...scanVisibleText(readFileSync(path, 'utf8'), path))
    }
  }
  walk(directory)
  return findings
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const findings = auditVisibleText()
  console.log(JSON.stringify({ findings, failures: findings.length }, null, 2))
  process.exitCode = findings.length ? 1 : 0
}
