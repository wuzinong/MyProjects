import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, copyFile, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createGame, command } from '../src/core/engine.js';
import { serialize, deserialize } from '../src/core/save.js';
import { MAP, REGIONS } from '../src/data/game.js';

const out = resolve('test-results'),
  standalone = resolve(out, 'free-build-standalone.html');
await mkdir(out, { recursive: true });
await copyFile('index.html', standalone);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { checks: [], errors: [], external: [] };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.setOffline(true);
  const page = await context.newPage();
  page.on('pageerror', (e) => report.errors.push(e.message));
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) report.external.push(r.url());
  });
  await page.goto(pathToFileURL(standalone).href);
  await page.waitForLoadState('networkidle');
  const stored = () => page.evaluate(() => localStorage.getItem('dingli-save-v1'));
  const close = () => page.getByRole('button', { name: '关闭面板', exact: true }).click();
  await page.locator('[data-action="setup"]').click();
  assert.equal(await page.locator('#free-build').isChecked(), false);
  await page.locator('#seat-count').selectOption('2');
  await page.locator('#type-1').selectOption('human');
  await page.locator('#enhanced').uncheck();
  await page.locator('#free-build').check();
  await page.locator('.lord-card').first().click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#free-build').isChecked(), true);
  assert.equal(await page.locator('#enhanced').isChecked(), false);
  await page.screenshot({ path: resolve(out, 'free-build-setup.png') });
  await page.locator('[data-action="start"]').click();
  if (await page.locator('[data-action="handoff"]').count())
    await page.locator('[data-action="handoff"]').click();
  let s = deserialize(await stored());
  assert.equal(s.freeBuild, true);
  assert.equal(s.enhanced, false);
  report.checks.push('opt-in setup works independently of enhanced mode and survives biography navigation');
  async function load(text) {
    if (await page.locator('#dialog[open]').count()) await close();
    await page.getByRole('button', { name: '存档', exact: true }).click();
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: '导入JSON存档', exact: true }).click(),
    ]);
    await chooser.setFiles({
      name: 'construction.json',
      mimeType: 'application/json',
      buffer: Buffer.from(text),
    });
    await page.locator('[data-action="handoff"]').waitFor();
    await page.locator('[data-action="handoff"]').click();
  }
  s = createGame(
    [
      { lord: 0, ai: false },
      { lord: 1, ai: false },
    ],
    true,
    42,
  );
  s.assets[1].owner = 0;
  s.players[0].cash = 3000;
  const old = { ...s, version: 4 };
  delete old.freeBuild;
  await load(JSON.stringify({ format: 'dingli-save', version: 4, state: old }));
  assert.equal(deserialize(await stored()).freeBuild, false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '规则', exact: true }).click();
  await page.locator('[data-action="enable-free-build"]').click();
  assert.equal(deserialize(await stored()).freeBuild, false);
  await page.locator('#confirm-free-build').check();
  await page.screenshot({ path: resolve(out, 'free-build-mobile-rule.png') });
  await page.locator('[data-action="enable-free-build"]').click();
  assert.equal(deserialize(await stored()).freeBuild, true);
  assert.equal(await page.locator('#confirm-free-build').count(), 0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: resolve(out, 'free-build-rules.png') });
  await close();
  await page.locator('[data-action="assets"]').click();
  const city = page
    .locator('.asset-card')
    .filter({ has: page.getByRole('heading', { name: MAP[1].name, exact: true }) });
  for (let level = 1; level <= 3; level++) {
    await city.getByRole('button', { name: /^建设/ }).click();
    assert.equal(deserialize(await stored()).assets[1].level, level);
  }
  assert.equal(deserialize(await stored()).players[0].pos, 0);
  await page.screenshot({ path: resolve(out, 'free-build-city.png') });
  const built = await stored();
  await close();
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.locator('[data-action="resume"]').click();
  await page.locator('[data-action="handoff"]').click();
  assert.equal(await stored(), built);
  report.checks.push(
    'v4 file import defaults off; explicit one-way enable; lone remote city upgrades repeatedly and survives reload',
  );

  s = deserialize(built);
  const region = MAP.filter((t) => t.group === 0);
  region.forEach((t) => {
    s.assets[t.id].owner = 0;
  });
  s.assets[6].owner = 1;
  await load(serialize(s));
  const unchanged = await stored();
  assert.equal(await page.locator('.center-banner .region-legend button').count(), 8);
  await page.locator('.center-banner [data-region="0"]').click();
  assert.equal(await page.locator('.region-collection').count(), 8);
  assert.equal(await page.locator('.region-collection button[data-tile]').count(), 46);
  for (let id = 0; id < REGIONS.length; id++) {
    const cities = MAP.filter((t) => t.group === id);
    assert.equal(await page.locator(`#region-${id} button`).count(), cities.length);
    for (const t of cities)
      assert.equal(await page.locator(`#region-${id} [data-tile="${t.id}"] strong`).innerText(), t.name);
  }
  assert.match(await page.locator('#region-0 header').innerText(), /已成套.*5\/5/);
  assert.match(await page.locator('#region-1 [data-tile="6"]').innerText(), /曹操/);
  await page.screenshot({ path: resolve(out, 'region-collections.png') });
  await page.locator('#region-0 [data-tile="1"]').click();
  await page.waitForTimeout(850);
  assert.match(await page.locator('.region-progress').innerText(), /5\/5/);
  await page.screenshot({ path: resolve(out, 'region-closeup.png') });
  await page.locator('[data-action="camera"]').click();
  await page.waitForTimeout(350);
  await page.screenshot({ path: resolve(out, 'region-overview.png') });
  assert.equal(await stored(), unchanged);
  report.checks.push(
    'all 46 cities appear in the correct eight sets with ownership/progress; region navigation is read-only',
  );
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: resolve(out, `region-board-${width}.png`) });
    await page.locator('.center-banner [data-region="7"]').click();
    assert.equal(await page.locator('#dialog').evaluate((el) => el.scrollWidth > el.clientWidth), false);
    await page.screenshot({ path: resolve(out, `region-list-${width}.png`) });
    await page.keyboard.press('Escape');
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  s = createGame(
    [
      { lord: 0, ai: false },
      { lord: 1, ai: false },
    ],
    false,
    2,
  );
  s = command(s, { type: 'roll' });
  assert.equal(s.phase, 'buy');
  await load(serialize(s));
  await page.getByRole('button', { name: '规则', exact: true }).click();
  assert.equal(await page.locator('#confirm-free-build').isDisabled(), true);
  report.checks.push(
    'responsive region controls at 1024/390px; construction rule cannot be enabled during a pending decision',
  );
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.external, []);
  await writeFile(resolve(out, 'free-build-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await unlink(standalone);
}
