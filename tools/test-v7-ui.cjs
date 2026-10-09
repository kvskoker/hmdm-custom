const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

// This check targets only the isolated stack, never a fleet server.
const base = 'http://localhost:8087';
const output = path.resolve(__dirname, '../test-results/v7');
(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const login = await context.request.post(`${base}/rest/public/auth/login`, {
      data: { login: 'admin', password: '21232F297A57A5A743894A0E4A801FC3' },
    });
    assert.equal((await login.json()).status, 'OK');
    for (const [route, heading] of [['management', 'Device management'], ['enrollment', 'Device enrollment'], ['tracking', 'Device tracking']]) {
      await page.goto(`${base}/home/fleet/${route}`);
      await page.getByRole('heading', { name: heading, exact: true }).waitFor();
      await page.waitForTimeout(1500);
      const cookieNotice = page.getByRole('button', { name: 'Got it', exact: true });
      if (await cookieNotice.isVisible()) await cookieNotice.click();
      assert.equal(await page.locator('[role="alert"]').count(), 0, `${route}: unexpected error`);
      for (const label of await page.locator('mat-form-field mat-label').all()) {
        assert.equal(await label.isVisible(), true, `${route}: field label is hidden`);
      }
      if (route === 'management') {
        await page.getByLabel('Device number, IMEI or serial', { exact: true }).fill('V7-TEST001');
        await page.getByRole('button', { name: 'Find device' }).click();
        await page.getByRole('button', { name: 'Wipe device', exact: true }).click();
        const confirm = page.getByRole('button', { name: 'Confirm wipe device', exact: true });
        assert.equal(await confirm.isDisabled(), true);
        await page.getByLabel('Confirm device number').fill('WRONG');
        assert.equal(await confirm.isDisabled(), true);
        await page.getByLabel('Confirm device number').fill('V7-TEST001');
        assert.equal(await confirm.isEnabled(), true);
        // Do not submit destructive commands from a visual test.
      }
      if (route === 'enrollment') await page.getByRole('cell', { name: 'TV7007', exact: true }).waitFor();
      if (route === 'tracking') {
        assert.equal(await page.locator('.leaflet-container').count(), 1);
        await page.waitForFunction(() => {
          const tiles = [...document.querySelectorAll('.leaflet-tile')];
          return tiles.length > 0 && tiles.every(tile => tile.complete && tile.naturalWidth > 0);
        }, null, { timeout: 90000 });
      }
      await page.screenshot({ path: path.join(output, `${route}-desktop.png`), fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 });
      if (await page.locator('mat-drawer.mat-drawer-opened').count()) await page.locator('.header-menu').click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(output, `${route}-mobile.png`), fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(overflow, false, `${route}: page overflows mobile viewport`);
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.locator('.header-menu').click();
      console.log(`PASS: ${route} desktop and mobile`);
    }
    assert.deepEqual(errors, [], 'Browser runtime errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
