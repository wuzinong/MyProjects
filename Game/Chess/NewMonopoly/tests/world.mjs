import { chromium } from 'playwright';
import { PerspectiveCamera, Vector3 } from 'three';
import { mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { MAP, ROUTE, ROUTE_INDEX, HOUSE_SUPPLY, PALACE_SUPPLY, advanceTile } from '../src/data/game.js';
import { createGame } from '../src/core/engine.js';
import { serialize, deserialize } from '../src/core/save.js';
import { tilePosition, CLOSE_CAMERA, WORLD_CAMERA } from '../src/render/world.js';

const out = resolve('test-results'),
  file = resolve(out, 'world-standalone.html');
await mkdir(out, { recursive: true });
await copyFile('index.html', file);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { checks: [], errors: [], external: [] };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.setOffline(true);
  const page = await context.newPage();
  page.on('pageerror', (e) => report.errors.push(e.message));
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) report.external.push(r.url());
  });
  await page.goto(pathToFileURL(file).href);
  await page.waitForLoadState('networkidle');
  async function load(text) {
    const playing = await page.locator('.game-top').count();
    if (playing) await page.getByRole('button', { name: '存档', exact: true }).click();
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: playing ? '导入JSON存档' : '导入存档', exact: true }).click(),
    ]);
    await chooser.setFiles({ name: 'world.json', mimeType: 'application/json', buffer: Buffer.from(text) });
    await page.getByRole('button', { name: '我已就位，继续', exact: true }).click();
  }
  const make = () =>
    createGame(
      [
        { lord: 0, ai: false },
        { lord: 1, ai: false },
      ],
      true,
      42,
    );
  let s = make();
  await load(serialize(s));
  await page.getByRole('button', { name: '⌂ 复位视角', exact: true }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: resolve(out, 'world-overview.png') });
  const overviewRect = await page.locator('#scene').boundingBox();
  const overview = new PerspectiveCamera(39, overviewRect.width / overviewRect.height, 0.1, 320);
  overview.position.set(...WORLD_CAMERA).multiplyScalar(Math.max(1, 1.1 / overview.aspect));
  overview.lookAt(0, 0, 0);
  overview.updateMatrixWorld();
  for (const id of ROUTE) {
    const p = tilePosition(id);
    p.y = 2.5;
    p.project(overview);
    assert.ok(Math.abs(p.x) < 0.92 && Math.abs(p.y) < 0.85, `tile ${id} outside readable overview`);
  }
  await page.getByRole('button', { name: '天下地图', exact: true }).click();
  const ids = await page
    .locator('.map-grid button')
    .evaluateAll((bs) => bs.map((b) => Number(b.dataset.tile)));
  assert.deepEqual(ids, ROUTE);
  await page.getByRole('button', { name: '关闭面板', exact: true }).click();
  for (const id of ROUTE) {
    await page.getByRole('button', { name: '天下地图', exact: true }).click();
    await page.locator(`.map-grid [data-tile="${id}"]`).click();
    assert.equal(await page.locator('#scene').getAttribute('data-focused-tile'), String(id));
    await page.waitForTimeout(80);
    const target = tilePosition(id),
      other = advanceTile(id, 1);
    const rect = await page.locator('#scene').boundingBox();
    const camera = new PerspectiveCamera(39, rect.width / rect.height, 0.1, 320);
    camera.position.copy(target).add(new Vector3(...CLOSE_CAMERA));
    camera.lookAt(target);
    camera.updateMatrixWorld();
    const p = tilePosition(other);
    p.y = 0.28;
    p.project(camera);
    await page.mouse.click(rect.x + ((p.x + 1) * rect.width) / 2, rect.y + ((1 - p.y) * rect.height) / 2);
    assert.match(await page.locator('.land-panel').innerText(), new RegExp(MAP[other].name));
    assert.match(
      await page.locator('.tile-heading small').innerText(),
      new RegExp(`第${ROUTE_INDEX[other] + 1}格`),
    );
    if ([40, 43, 46, 49, 52, 55, 58, 61].includes(id))
      await page.screenshot({ path: resolve(out, `world-close-${id}.png`) });
  }
  report.checks.push('all 64 tiles in route order, all focus controls and all 64 neighboring 3D tile picks');
  assert.equal(await page.locator('#scene').getAttribute('data-region'), '凉州');
  s = make();
  s.players[0].pos = 3;
  s.players[0].cards = [8];
  s.players[0].region = 0;
  await load(serialize(s));
  await page.getByRole('button', { name: '跟随主公', exact: true }).click();
  await page.getByRole('button', { name: '锦囊台 · 览策', exact: true }).click();
  await page.getByRole('button', { name: '施用此计', exact: true }).click();
  await page.waitForTimeout(700);
  assert.equal(await page.locator('#scene').getAttribute('data-focused-tile'), '40');
  assert.equal(await page.locator('#scene').getAttribute('data-scenery-city'), '酒泉');
  await page.getByRole('button', { name: '购入城池', exact: true }).click();
  let saved = deserialize(await page.evaluate(() => localStorage.getItem('dingli-save-v1')));
  assert.equal(saved.assets[40].owner, 0);
  await page.screenshot({ path: resolve(out, 'world-follow.png') });
  report.checks.push(
    'actual one-step movement follows the road into a new city, camera follows, purchase persists',
  );
  s = make();
  s.assets[39].owner = 0;
  s.assets[39].level = 2;
  s.houses -= 2;
  s.players[0].pos = 39;
  s.players[0].region = 7;
  const old = JSON.stringify({
    format: 'dingli-save',
    version: 2,
    state: {
      ...s,
      version: 2,
      assets: s.assets.slice(0, 40),
      houses: s.houses - HOUSE_SUPPLY + 32,
      palaces: s.palaces - PALACE_SUPPLY + 12,
    },
  });
  await load(old);
  saved = deserialize(await page.evaluate(() => localStorage.getItem('dingli-save-v1')));
  assert.equal(saved.version, 4);
  assert.equal(saved.assets.length, 64);
  assert.equal(saved.assets[39].level, 2);
  assert.ok(saved.assets.slice(40).every((a) => a.owner === -1));
  assert.equal(saved.houses, HOUSE_SUPPLY - 2);
  report.checks.push(
    'actual old JSON file import migrates original ownership/buildings and expands bank stock',
  );
  await page.getByRole('button', { name: '画质与声音设置', exact: true }).click();
  await page.locator('#low').check();
  await page.locator('#reduced').check();
  await page.getByRole('button', { name: '保存设置', exact: true }).click();
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.getByRole('button', { name: '跟随主公', exact: true }).click();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: resolve(out, `world-layout-${width}.png`) });
    await page.getByRole('button', { name: '近看中央', exact: true }).click();
    await page.getByRole('button', { name: '将台 · 点将', exact: true }).click();
    assert.match(await page.locator('#dialog-title').innerText(), /将府军备/);
    await page.getByRole('button', { name: '关闭面板', exact: true }).click();
  }
  report.checks.push(
    'low quality/reduced motion; tablet and narrow follow views; central facility still interactive',
  );
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.external, []);
  await writeFile(resolve(out, 'world-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const page = browser.contexts().flatMap((c) => c.pages())[0];
  if (page) await page.screenshot({ path: resolve(out, 'world-failure.png') });
  throw error;
} finally {
  await browser.close();
  await rm(file, { force: true });
}
