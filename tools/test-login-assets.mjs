import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../hmdm-server/server/src/main/web/projects/core/ngsw-config.json', import.meta.url)));
const app = config.assetGroups.find(group => group.name === 'app');
const scripts = config.assetGroups.find(group => group.name === 'scripts');
assert.equal(app.installMode, 'prefetch');
assert.ok(app.resources.files.includes('/index.html'));
assert.ok(!app.resources.files.includes('/*.js'));
assert.equal(scripts.installMode, 'lazy');
assert.equal(scripts.updateMode, 'lazy');
assert.deepEqual(scripts.resources.files, ['/*.js']);
assert.ok(!config.dataGroups?.length, 'Private API responses must not be cached');
console.log('PASS: service worker fetches scripts on demand, retains shell caching, and does not cache APIs');
