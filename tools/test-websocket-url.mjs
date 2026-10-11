import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { websocketUrl } from '../hmdm-server/server/src/main/web/projects/core/src/app/shared/utils/websocket-url.ts';

// Optional fixture path supports offline tests without changing the deployment .env.
const envFile = process.argv[2] || new URL('../.env', import.meta.url);
let domain;
try {
  domain = parseEnv(readFileSync(envFile, 'utf8')).HMDM_DOMAIN;
} catch {
  throw new Error('Cannot read .env. Set HMDM_DOMAIN in the repository .env before running this test.');
}
assert.match(domain || '', /^[A-Za-z0-9][A-Za-z0-9.-]*$/, 'HMDM_DOMAIN must be a hostname or IPv4 address, without scheme, port or path');
const origin = new URL(`https://${domain}`).origin;
const socketOrigin = new URL(`wss://${domain}`).origin;
const cases = [
  ['', `${origin}/`, `${socketOrigin}/ws/alerts`],
  ['', 'http://localhost:8088/', 'ws://localhost:8088/ws/alerts'],
  ['', 'https://mdm.example.com/hmdm/', 'wss://mdm.example.com/hmdm/ws/alerts'],
  ['http://localhost:8080/', 'http://localhost:4200/', 'ws://localhost:8080/ws/alerts'],
  ['https://api.example.com/mdm/', 'https://ui.example.com/', 'wss://api.example.com/mdm/ws/alerts'],
];
for (const [base, documentBase, expected] of cases) {
  assert.equal(websocketUrl('ws/alerts', base, documentBase), expected);
}
// The router URL may be nested; the application's <base href="/"> is stable.
const page = new URL(`${origin}/home/fleet/management`);
const documentBase = new URL('/', page).href;
assert.equal(websocketUrl('ws/alerts', '', documentBase), `${socketOrigin}/ws/alerts`);
console.log('PASS: 6 WebSocket URL cases');
