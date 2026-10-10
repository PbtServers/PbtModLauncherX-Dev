/** Fixed program executed by this launcher's Node/Electron runtime. The parent
 * owns its stdin pipe: even a parent crash closes it and triggers tree cleanup.
 * No model output, user command or shell text is executed here. */
export const OLLAMA_SUPERVISOR = String.raw`
const { spawn, execFile } = require('node:child_process');
const path = require('node:path');
const executable = process.argv[1];
const engine = spawn(executable, ['serve'], { cwd: process.cwd(), env: process.env, shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'ignore', 'pipe'] });
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  if (!engine.pid || engine.exitCode !== null || engine.signalCode !== null) return process.exit(0);
  if (process.platform === 'win32') {
    execFile(path.join(process.env.SystemRoot || process.env.SYSTEMROOT || 'C:\\Windows', 'System32', 'taskkill.exe'), ['/PID', String(engine.pid), '/T', '/F'], { windowsHide: true, timeout: 3000 }, error => {
      if (error) { try { engine.kill() } catch {}; process.exit(1) }
      process.exit(0);
    });
  } else {
    try { process.kill(-engine.pid, 'SIGTERM') } catch {}
    setTimeout(() => { try { process.kill(-engine.pid, 'SIGKILL') } catch {}; process.exit(0) }, 1000);
  }
}
engine.on('spawn', () => process.stdout.write(JSON.stringify({ pid: engine.pid }) + '\n'));
engine.on('error', () => process.exit(1));
engine.on('exit', code => { if (!stopping) process.exit(code || 0) });
engine.stderr.on('data', data => process.stderr.write(data));
process.stdin.resume();
process.stdin.on('end', stop);
process.stdin.on('error', stop);
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
`
