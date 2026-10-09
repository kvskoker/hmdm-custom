const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs/promises');
const base = 'http://localhost:8087';
const compose = path.resolve(__dirname, '../docker-compose.v7-test.yml');
const output = path.resolve(__dirname, '../test-results/v7-refinements');
function sql(query) {
  return execFileSync('docker', ['compose', '-f', compose, 'exec', '-T', 'db', 'psql', '-U', 'hmdm', '-d', 'hmdm', '-v', 'ON_ERROR_STOP=1', '-c', query], { encoding: 'utf8' });
}
async function api(context, route) {
  const response = await context.request.get(`${base}/rest/${route}`);
  const result = await response.json();
  assert.equal(result.status, 'OK', JSON.stringify(result));
  return result.data;
}
async function login(context, login = 'admin') {
  const response = await context.request.post(`${base}/rest/public/auth/login`, { data: { login, password: '21232F297A57A5A743894A0E4A801FC3' } });
  assert.equal((await response.json()).status, 'OK');
}
async function sameRow(page, selector) {
  const boxes = await page.locator(selector).evaluateAll(elements => elements.map(el => {
    const r = el.getBoundingClientRect(); return { y: r.y, h: r.height };
  }));
  assert.ok(boxes.length >= 4);
  assert.ok(Math.max(...boxes.map(b => b.y)) - Math.min(...boxes.map(b => b.y)) < 3, 'Form fields and save button must share a row');
  assert.ok(boxes.every(b => Math.abs(b.h - 56) < 2), 'Form control heights must match');
}
(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    // Synthetic rows in the dedicated test stack only. No command is pending.
    sql(`INSERT INTO devices (number, description, imei, info, infojson, customerId, configurationId)
      SELECT 'V7-UI-SEARCH', 'Fleet search fixture', '990000000000017', '{"serial":"V7-SERIAL-017"}', '{"serial":"V7-SERIAL-017"}'::jsonb, customerId, 1 FROM users WHERE login='admin';
      INSERT INTO plugin_devicereset_password (deviceId,customerId,newPassword,requestedBy,requestTime,status)
      SELECT d.id,d.customerId,'not-a-real-pin','V7-UI-pagination',1700000000000+n,2 FROM devices d CROSS JOIN generate_series(1,205) n WHERE d.number='V7-UI-SEARCH';
      INSERT INTO users (login,password,customerId,userRoleId,allDevicesAvailable,passwordReset)
      SELECT 'v7-ui-restricted',password,customerId,userRoleId,false,false FROM users WHERE login='admin';`);
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const anonymous = await context.request.get(`${base}/rest/plugins/devicereset/private/history/page`);
    assert.ok([401,403].includes(anonymous.status()) || (await anonymous.json()).status !== 'OK');
    await login(context);
    const query = 'plugins/devicereset/private/history/page?kind=password&search=V7-UI-pagination&size=10';
    const first = await api(context, query);
    const last = await api(context, `${query}&page=20`);
    assert.equal(first.totalItemsCount, 205); assert.equal(first.items.length, 10);
    assert.equal(last.items.length, 5); assert.notEqual(first.items[0].id, last.items[0].id);
    assert.ok(!JSON.stringify(first).includes('not-a-real-pin'));
    assert.equal((await api(context, `${query}&status=0`)).totalItemsCount, 0);
    assert.equal((await api(context, `${query}&after=${Date.now() - 86400000}`)).totalItemsCount, 0);
    assert.equal((await api(context, query.replace('V7-UI-pagination', '990000000000017'))).totalItemsCount, 205);
    const restricted = await browser.newContext(); await login(restricted, 'v7-ui-restricted');
    assert.equal((await api(restricted, query)).totalItemsCount, 0);
    await restricted.close();
    console.log('PASS: server pagination beyond 200, search, status/date filters, PIN privacy and group access');
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${base}/home/fleet/management`);
    await page.getByRole('heading', { name: 'Device management', exact: true }).waitFor();
    const cookie = page.getByRole('button', { name: 'Got it', exact: true });
    if (await cookie.isVisible()) await cookie.click();
    if (!await page.locator('mat-drawer.mat-drawer-opened').count()) await page.locator('.header-menu').click();
    const nav = await page.locator('mat-drawer').innerText();
    const labels = ['Dashboard', 'Devices', 'Device management', 'Device tracking', 'Device enrollment'];
    for (let i = 1; i < labels.length; i++) assert.ok(nav.indexOf(labels[i-1]) < nav.indexOf(labels[i]), 'Menu order');
    await page.locator('.header-menu').click();
    const input = page.getByLabel('Device number, IMEI or serial', { exact: true });
    await input.fill('990000000000017');
    await page.getByRole('button', { name: 'Find device', exact: true }).click();
    await page.getByRole('button', { name: 'Wipe device', exact: true }).waitFor();
    assert.ok((await page.locator('core-device-management').innerText()).includes('V7-UI-SEARCH'));
    const searchBox = await page.locator('.search-fields mat-form-field').boundingBox();
    const findButton = await page.getByRole('button', { name: 'Find device', exact: true }).boundingBox();
    assert.ok(Math.abs(searchBox.height - findButton.height) < 2);
    for (const term of ['V7-SERIAL-017', 'Fleet search fixture']) {
      await input.fill(term); await page.getByRole('button', { name: 'Find device', exact: true }).click();
      await page.getByRole('button', { name: 'Wipe device', exact: true }).waitFor();
      assert.ok((await page.locator('core-device-management').innerText()).includes('V7-UI-SEARCH'));
    }
    await input.fill('V7-'); await page.getByRole('button', { name: 'Find device', exact: true }).click();
    await page.getByRole('table', { name: 'Matching devices' }).waitFor();
    assert.ok(await page.getByRole('button', { name: 'Select', exact: true }).count() >= 2);
    await page.getByLabel('Search history', { exact: true }).fill('V7-UI-pagination');
    await page.waitForFunction(() => document.querySelector('[aria-label="History pagination"]')?.textContent.includes('205'));
    assert.equal(await page.locator('.history-table tbody tr').count(), 10);
    await page.locator('[aria-label="History pagination"]').getByRole('button', { name: 'Last page' }).click();
    await page.waitForFunction(() => document.querySelectorAll('.history-table tbody tr').length === 5);
    await page.getByRole('tab', { name: 'Reboot and wipe requests', exact: true }).click();
    await page.getByLabel('Command', { exact: true }).click();
    await page.getByRole('option', { name: 'Wipe', exact: true }).click();
    await page.waitForTimeout(500);
    assert.ok((await page.locator('.history-table tbody').innerText()).includes('Wipe'));
    await page.getByRole('tab', { name: 'Locked devices', exact: true }).click();
    await page.getByRole('button', { name: 'Manage', exact: true }).first().waitFor();
    await page.screenshot({ path: path.join(output, 'management-desktop.png') });
    console.log('PASS: menu order, IMEI/serial/description lookup, multiple matches, aligned search and history tabs/pagination');
    for (const route of ['enrollment', 'tracking']) {
      await page.goto(`${base}/home/fleet/${route}`);
      await page.getByRole('heading', { name: `Device ${route}`, exact: true }).waitFor();
      await page.getByRole('button', { name: route === 'enrollment' ? 'Save rule' : 'Save settings', exact: true }).waitFor();
      await sameRow(page, '.inline-form mat-form-field, .inline-form .field-button');
      if (route === 'tracking') {
        assert.equal(await page.getByLabel('Map tile URL', { exact: true }).count(), 0);
        assert.equal(await page.getByLabel('Map attribution', { exact: true }).count(), 0);
        const search = await page.getByLabel('Search devices', { exact: true }).boundingBox();
        const map = await page.locator('.map').boundingBox();
        assert.ok(search.y + search.height < map.y);
        await page.getByLabel('Search devices', { exact: true }).fill('not-a-device');
        assert.equal(await page.locator('.leaflet-interactive').count(), 0);
        await page.getByLabel('Search devices', { exact: true }).fill('');
      }
      await page.screenshot({ path: path.join(output, `${route}-desktop.png`), fullPage: true });
      await page.locator('.inline-form').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `${route}-form-desktop.png`) });
      console.log(`PASS: ${route} inline form`);
    }
    for (const route of ['management', 'enrollment', 'tracking']) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${base}/home/fleet/${route}`);
      await page.getByRole('heading', { name: `Device ${route}`, exact: true }).waitFor();
      await page.waitForTimeout(800);
      if (await page.locator('mat-drawer.mat-drawer-opened').count()) await page.locator('.header-menu').click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      await page.screenshot({ path: path.join(output, `${route}-mobile.png`), fullPage: true });
    }
    assert.deepEqual(errors, []);
    console.log('PASS: mobile layouts and no browser runtime errors');
  } finally {
    sql(`DELETE FROM plugin_devicereset_password WHERE requestedBy='V7-UI-pagination';
      DELETE FROM devices WHERE number='V7-UI-SEARCH'; DELETE FROM users WHERE login='v7-ui-restricted';`);
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
