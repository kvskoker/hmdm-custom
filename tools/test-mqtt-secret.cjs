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
  const cases = ['', 'fixture_new-123', 'special&value', 'quoted"value', "single'quote",
    ' leading and trailing ', '<xml>&"\'|\\$!#=;`()', 'back\\slash|amp&', 'caf\u00e9-\u03a9',
    'line\nbreak', 'carriage\rreturn', 'tab\tvalue', 'control\x01value', 'delete\x7fvalue'];
  const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
  for (const secret of cases) {
    fs.writeFileSync(ctx, original);
    const result = spawnSync(bash, ['-s'], {
      input: script, encoding: 'utf8',
      env: { ...process.env, CTX: ctx.replace(/\\/g, '/'), HMDM_SHARED_SECRET: secret },
    });
    if (result.error) throw result.error;
    const valid = !/[\x00-\x1f\x7f]/.test(secret);
    assert.equal(result.status, valid ? 0 : 1);
    assert.equal(fs.readFileSync(ctx, 'utf8'), valid && secret ? original.replace('fixture-old', () => escapeXml(secret)) : original);
    if (valid && secret) {
      const parsed = spawnSync('pwsh', ['-NoProfile', '-Command',
        '[xml]$doc = Get-Content -Raw -LiteralPath $env:CTX; if ($doc.Context.Parameter.value -cne $env:HMDM_SHARED_SECRET) { exit 1 }'],
        { encoding: 'utf8', env: { ...process.env, CTX: ctx, HMDM_SHARED_SECRET: secret } });
      if (parsed.error) throw parsed.error;
      assert.equal(parsed.status, 0, 'XML must decode to the exact original secret');
    }
    if (secret) assert.ok(!(result.stdout + result.stderr).includes(secret), 'Secret must not be logged');
  }
  fs.writeFileSync(ctx, '<Context/>\n');
  const result = spawnSync(bash, ['-s'], {
    input: script, encoding: 'utf8',
    env: { ...process.env, CTX: ctx.replace(/\\/g, '/'), HMDM_SHARED_SECRET: 'fixture-secret' },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /parameter missing/);
  console.log(`PASS: ${cases.length + 1} MQTT secret rendering cases, including XML round trips`);
} finally {
  if (fs.existsSync(ctx)) fs.unlinkSync(ctx);
  fs.rmdirSync(dir);
}
