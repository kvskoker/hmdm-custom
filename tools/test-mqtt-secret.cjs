const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const entrypoint = fs.readFileSync(path.join(root, 'docker/entrypoint.sh'), 'utf8').replace(/\r/g, '');
const start = entrypoint.indexOf('# --- MQTT shared secret override');
const end = entrypoint.indexOf('# --- first-run database seed', start);
assert.ok(start >= 0 && end > start);
const script = 'set -e\n' + entrypoint.slice(start, end);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hmdm-mqtt-'));
const ctx = path.join(dir, 'ROOT.xml');
const bash = process.env.BASH_EXE || (process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : 'bash');
const original = '<Context>\n    <Parameter name="hash.secret" value="fixture-old"/>\n</Context>\n';
try {
  for (const secret of ['', 'fixture_new-123', 'unsafe&value', 'unsafe"value', 'space value']) {
    fs.writeFileSync(ctx, original);
    const result = spawnSync(bash, ['-s'], {
      input: script, encoding: 'utf8',
      env: { ...process.env, CTX: ctx.replace(/\\/g, '/'), HMDM_SHARED_SECRET: secret },
    });
    if (result.error) throw result.error;
    const valid = !secret || /^[A-Za-z0-9_-]+$/.test(secret);
    assert.equal(result.status, valid ? 0 : 1);
    assert.equal(fs.readFileSync(ctx, 'utf8'), valid && secret ? original.replace('fixture-old', secret) : original);
    if (secret) assert.ok(!(result.stdout + result.stderr).includes(secret), 'Secret must not be logged');
  }
  fs.writeFileSync(ctx, '<Context/>\n');
  const result = spawnSync(bash, ['-s'], {
    input: script, encoding: 'utf8',
    env: { ...process.env, CTX: ctx.replace(/\\/g, '/'), HMDM_SHARED_SECRET: 'fixture-secret' },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /parameter missing/);
  console.log('PASS: 6 MQTT secret rendering cases');
} finally {
  if (fs.existsSync(ctx)) fs.unlinkSync(ctx);
  fs.rmdirSync(dir);
}
