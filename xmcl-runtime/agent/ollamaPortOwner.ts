import { execFile } from 'child_process'
import { readFile, readdir, readlink } from 'fs/promises'
import { join } from 'path'
import { promisify } from 'util'
const exec = promisify(execFile)
export function netstatOwns(output: string, pid: number, port: number) {
  return output.split(/\r?\n/).some(line => {
    const columns = line.trim().split(/\s+/)
    // The unconnected remote address identifies a listener independently of OS language.
    return columns[0] === 'TCP' && columns[1] === `127.0.0.1:${port}` && columns[2] === '0.0.0.0:0' && Number(columns[4]) === pid
  })
}

/** Fail closed if the endpoint cannot be attributed to the process we spawned. */
export async function ownsOllamaPort(pid: number, port: number) {
  if (!Number.isSafeInteger(pid) || pid <= 0 || !Number.isInteger(port) || port < 1 || port > 65535) return false
  if (process.platform === 'win32') {
    const { stdout } = await exec(join(process.env.SystemRoot || process.env.SYSTEMROOT || 'C:\\Windows', 'System32', 'netstat.exe'), ['-ano', '-p', 'tcp'], { windowsHide: true, timeout: 2000 })
    return netstatOwns(stdout, pid, port)
  }
  if (process.platform === 'linux') {
    const tcp = await readFile('/proc/net/tcp', 'utf8')
    const local = `0100007F:${port.toString(16).toUpperCase().padStart(4, '0')}`
    const inodes = tcp.split('\n').map(line => line.trim().split(/\s+/)).filter(columns => columns[1] === local && columns[3] === '0A').map(columns => columns[9])
    for (const fd of await readdir(`/proc/${pid}/fd`)) {
      const link = await readlink(`/proc/${pid}/fd/${fd}`).catch(() => '')
      if (inodes.some(inode => link === `socket:[${inode}]`)) return true
    }
    return false
  }
  if (process.platform === 'darwin') {
    const { stdout } = await exec('/usr/sbin/lsof', ['-nP', `-iTCP@127.0.0.1:${port}`, '-sTCP:LISTEN', '-Fp'], { timeout: 2000 })
    return stdout.split('\n').includes(`p${pid}`)
  }
  return false
}
