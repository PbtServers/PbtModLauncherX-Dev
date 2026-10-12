/** Fixed program executed by this launcher's Node/Electron runtime. The parent
 * owns its stdin pipe: even a parent crash closes it and triggers tree cleanup.
 * No model output, user command or shell text is executed here. */
export const OLLAMA_SUPERVISOR = String.raw`
const { spawn, execFile } = require('node:child_process');
const path = require('node:path');
const executable = process.argv[1];
const lockPath = process.argv[2];
const lockNonce = process.argv[3];
// Parent death also closes diagnostic pipes. EPIPE must not interrupt owned
// engine cleanup or leave the model-store lease behind.
process.stdout.on('error', () => {});
process.stderr.on('error', () => {});
const engine = spawn(executable, ['serve'], { cwd: process.cwd(), env: process.env, shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'ignore', 'pipe'] });
let stopping = false;
function finish(code) {
  if (code === 0 && lockPath && lockNonce) {
    try {
      const fs = require('node:fs');
      const owner = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
      if (owner.nonce === lockNonce) {
        fs.unlinkSync(lockPath);
        try { fs.unlinkSync(path.join(path.dirname(lockPath), '.pbtadmin-engine.owner-' + lockNonce + '.json')) } catch (error) { if (error.code !== 'ENOENT') throw error }
      }
    } catch (error) { if (error.code !== 'ENOENT') code = 1 }
  }
  process.exit(code);
}
function stop() {
  if (stopping) return;
  stopping = true;
  if (!engine.pid || engine.exitCode !== null || engine.signalCode !== null) return finish(0);
  if (process.platform === 'win32') {
    execFile(path.join(process.env.SystemRoot || process.env.SYSTEMROOT || 'C:\\Windows', 'System32', 'taskkill.exe'), ['/PID', String(engine.pid), '/T', '/F'], { windowsHide: true, timeout: 3000 }, error => {
      if (error) { try { engine.kill() } catch {}; return finish(1) }
      finish(0);
    });
  } else {
    try { process.kill(-engine.pid, 'SIGTERM') } catch {}
    setTimeout(() => { try { process.kill(-engine.pid, 'SIGKILL') } catch {}; finish(0) }, 1000);
  }
}
engine.on('spawn', () => process.stdout.write(JSON.stringify({ pid: engine.pid }) + '\n'));
engine.on('error', () => finish(1));
engine.on('exit', code => { if (!stopping) finish(code || 0) });
engine.stderr.on('data', data => { if (!stopping) process.stderr.write(data) });
process.stdin.resume();
process.stdin.on('end', stop);
process.stdin.on('error', stop);
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
`
