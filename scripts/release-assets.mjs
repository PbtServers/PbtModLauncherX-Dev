import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { open, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'

const root = resolve(process.argv[2] || 'build')
let files = (await readdir(root)).filter(name => name !== 'SHA256SUMS.txt').sort()
if (!files.length) throw new Error('No release artifacts downloaded')
const instructions = []
for (const name of files) {
  const path = join(root, name)
  const info = await stat(path)
  if (!info.isFile()) throw new Error(`Unexpected directory: ${name}`)
  if (info.size < 2 * 1024 ** 3) continue
  // Future distributions may exceed GitHub's individual asset limit. Preserve every
  // byte in ordered 1 GiB parts; users reconstruct before installing.
  const parts = []
  const source = await open(path, 'r')
  const digest = createHash('sha256')
  try {
    let offset = 0
    const buffer = Buffer.alloc(8 * 1024 ** 2)
    while (offset < info.size) {
      const part = `${name}.part${String(parts.length + 1).padStart(3, '0')}`
      const output = await open(join(root, part), 'wx')
      try {
        let size = 0
        while (size < 1024 ** 3 && offset < info.size) {
          const { bytesRead } = await source.read(buffer, 0, Math.min(buffer.length, 1024 ** 3 - size), offset)
          if (!bytesRead) throw new Error('Unexpected EOF while splitting release asset')
          digest.update(buffer.subarray(0, bytesRead))
          let written = 0
          while (written < bytesRead) written += (await output.write(buffer, written, bytesRead - written)).bytesWritten
          size += bytesRead; offset += bytesRead
        }
      } finally { await output.close() }
      parts.push(part)
    }
  } finally { await source.close() }
  instructions.push({ file: name, bytes: info.size, sha256: digest.digest('hex'), parts })
  await unlink(path)
}
if (instructions.length) {
  // Updater metadata references whole installers, never multipart assets.
  // Retain existing release metadata instead of advertising a missing file.
  for (const name of files.filter(name => /^latest.*\.ya?ml$/.test(name))) await unlink(join(root, name))
  await writeFile(join(root, 'SPLIT-ASSETS.json'), JSON.stringify(instructions, null, 2))
  await writeFile(join(root, 'REASSEMBLE.txt'), 'Large AI distributions are split because GitHub limits assets to 2 GiB. Download all parts and verify SHA256SUMS.txt first.\nLinux/macOS: cat filename.part* > filename\nPowerShell: $out=[IO.File]::Create("filename"); try { Get-ChildItem "filename.part*" | Sort-Object Name | ForEach-Object { $input=[IO.File]::OpenRead($_.FullName); try { $input.CopyTo($out) } finally { $input.Dispose() } } } finally { $out.Dispose() }\nVerify the reconstructed size and SHA-256 against SPLIT-ASSETS.json before installing.\n')
}
files = (await readdir(root)).filter(name => name !== 'SHA256SUMS.txt').sort()
const sums = []
for (const name of files) {
  const path = join(root, name)
  const info = await stat(path)
  if (!info.isFile()) throw new Error(`Unexpected directory: ${name}`)
  if (info.size >= 2 * 1024 ** 3) throw new Error(`Release asset exceeds GitHub 2 GiB limit: ${name}`)
  const hash = createHash('sha256')
  for await (const bytes of createReadStream(path)) hash.update(bytes)
  sums.push(`${hash.digest('hex')}  ${name}\n`)
  console.log(`${name}: ${info.size} bytes`)
}
await writeFile(join(root, 'SHA256SUMS.txt'), sums.join(''))
