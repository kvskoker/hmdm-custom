import assert from 'node:assert/strict';
import { websocketUrl } from '../hmdm-server/server/src/main/web/projects/core/src/app/shared/utils/websocket-url.ts';

const cases = [
  ['', 'https://mdm.maxcit.com/', 'wss://mdm.maxcit.com/ws/alerts'],
  ['', 'http://localhost:8088/', 'ws://localhost:8088/ws/alerts'],
  ['', 'https://mdm.example.com/hmdm/', 'wss://mdm.example.com/hmdm/ws/alerts'],
  ['http://localhost:8080/', 'http://localhost:4200/', 'ws://localhost:8080/ws/alerts'],
  ['https://api.example.com/mdm/', 'https://ui.example.com/', 'wss://api.example.com/mdm/ws/alerts'],
];
for (const [base, documentBase, expected] of cases) {
  assert.equal(websocketUrl('ws/alerts', base, documentBase), expected);
}
// The router URL may be nested; the application's <base href="/"> is stable.
const page = new URL('https://mdm.maxcit.com/home/fleet/management');
const documentBase = new URL('/', page).href;
assert.equal(websocketUrl('ws/alerts', '', documentBase), 'wss://mdm.maxcit.com/ws/alerts');
console.log('PASS: 6 WebSocket URL cases');
