import { chromium } from 'playwright';
import { PerspectiveCamera, Vector3 } from 'three';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdir, copyFile, readFile, writeFile, rm } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { MAP, REGIONS } from '../src/data/game.js';
import { createGame, phase } from '../src/core/engine.js';
import { serialize, deserialize } from '../src/core/save.js';
import { FACILITY_POSITIONS, SCENERY } from '../src/render/landscape.js';
import { CENTER_CAMERA, CENTER_SCALE } from '../src/render/world.js';

const out = resolve('test-results');
await mkdir(out, { recursive: true });
const standalone = resolve(out, 'scenery-standalone.html');
await copyFile('index.html', standalone);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { checks: [], errors: [], external: [], metrics: {} };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.setOffline(true);
  const page = await context.newPage();
  page.on('pageerror', (e) => report.errors.push(e.message));
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) report.external.push(r.url());
  });
  await page.goto(pathToFileURL(standalone).href);
  await page.waitForLoadState('networkidle');
  const make = () =>
    createGame(
      [
        { lord: 0, ai: false },
        { lord: 1, ai: false },
      ],
      true,
      42,
    );
  const current = async () => deserialize(await page.evaluate(() => localStorage.getItem('dingli-save-v1')));
  async function load(s) {
    if (await page.locator('#dialog[open]').count())
      await page.getByRole('button', { name: '关闭面板', exact: true }).click();
    const playing = await page.locator('.game-top').count();
    if (playing) await page.getByRole('button', { name: '存档', exact: true }).click();
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: playing ? '导入JSON存档' : '导入存档', exact: true }).click(),
    ]);
    const text = serialize(s);
    await chooser.setFiles({ name: 'scenery.json', mimeType: 'application/json', buffer: Buffer.from(text) });
    await page.waitForFunction((text) => localStorage.getItem('dingli-save-v1') === text, text);
    await page.getByRole('button', { name: '我已就位，继续', exact: true }).click();
  }
  const shots = [];
  for (const city of MAP.filter((t) => t.group >= 0)) {
    const s = make();
    s.players[0].pos = city.id;
    s.players[0].region = city.group;
    await load(s);
    await page.getByRole('button', { name: '近看中央', exact: true }).click();
    await page.waitForTimeout(950);
    assert.equal(await page.locator('#scene').getAttribute('data-scenery-city'), city.name);
    const file = resolve(out, `scenery-city-${city.id}.png`);
    await page.locator('#scene').screenshot({ path: file });
    shots.push({ city, file });
    // Every region must retain real 3D facility picking despite its new terrain.
    if (MAP.find((t) => t.group === city.group).id === city.id) {
      await page.getByRole('button', { name: '近看中央', exact: true }).click();
      await page.waitForTimeout(180);
      const rect = await page.locator('#scene').boundingBox();
      const camera = new PerspectiveCamera(39, rect.width / rect.height, 0.1, 320);
      camera.position.set(...CENTER_CAMERA);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      for (const [name, title] of [
        ['roster', '将府军备'],
        ['cards', '行军锦囊'],
        ['recruit', '整备三军'],
      ]) {
        const [x, z] = FACILITY_POSITIONS[name],
          p = new Vector3(x, 0.55, z).multiplyScalar(CENTER_SCALE).project(camera);
        await page.mouse.click(rect.x + ((p.x + 1) * rect.width) / 2, rect.y + ((1 - p.y) * rect.height) / 2);
        await page.locator('#dialog[open]').waitFor();
        assert.match(await page.locator('#dialog-title').innerText(), new RegExp(title));
        await page.getByRole('button', { name: '关闭面板', exact: true }).click();
      }
    }
  }
  report.checks.push('46 city screenshots, all eight regional compositions, 24 real 3D facility picks');
  let s = make();
  s.players[0].pos = 6;
  s.players[0].region = 1;
  s.players[0].cards = [8, 8];
  s.players[0].cash = 3000;
  await load(s);
  await page.getByRole('button', { name: '锦囊台 · 览策', exact: true }).click();
  await page.getByRole('button', { name: '施用此计', exact: true }).first().click();
  if ((await current()).phase === 'shop')
    await page.getByRole('button', { name: '离开商店，继续机遇', exact: true }).click();
  await page.getByRole('button', { name: '采购30粮 · 40金', exact: true }).click();
  assert.equal(await page.locator('#scene').getAttribute('data-scenery-city'), '长安');
  await page.getByRole('button', { name: '锦囊台 · 览策', exact: true }).click();
  await page.getByRole('button', { name: '施用此计', exact: true }).click();
  assert.equal(await page.locator('#scene').getAttribute('data-scenery-city'), '陈仓');
  report.checks.push(
    'actual movement retains Chang’an scenery on the market and changes to Chencang on the next city',
  );
  s = make();
  s.players[0].region = 5;
  s.players[0].pos = 26;
  s.players[1].region = 6;
  s.players[1].pos = 31;
  phase(s, 'end');
  await load(s);
  await page.getByRole('button', { name: '结束回合', exact: true }).click();
  await page.getByRole('button', { name: '我已就位，继续', exact: true }).click();
  assert.equal(await page.locator('#scene').getAttribute('data-region'), '江东');
  report.checks.push('turn handover changes scenery to the new active player');
  await page.getByRole('button', { name: '画质与声音设置', exact: true }).click();
  await page.locator('#low').check();
  await page.locator('#reduced').check();
  await page.getByRole('button', { name: '保存设置', exact: true }).click();
  for (const viewport of [
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.getByRole('button', { name: '将台 · 点将', exact: true }).click();
    assert.match(await page.locator('#dialog-title').innerText(), /将府军备/);
    await page.getByRole('button', { name: '关闭面板', exact: true }).click();
    await page.screenshot({ path: resolve(out, `scenery-layout-${viewport.width}.png`) });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const cdp = await context.newCDPSession(page);
  await cdp.send('HeapProfiler.collectGarbage');
  const before = (await cdp.send('Runtime.getHeapUsage')).usedSize;
  for (let i = 0; i < 24; i++) {
    const t = MAP.filter((t) => t.group >= 0)[i % 22],
      state = make();
    state.players[0].pos = t.id;
    state.players[0].region = t.group;
    await load(state);
    await page.waitForTimeout(55);
  }
  await cdp.send('HeapProfiler.collectGarbage');
  const after = (await cdp.send('Runtime.getHeapUsage')).usedSize;
  report.metrics.heapGrowth = after - before;
  assert.ok(after - before < 8 * 1024 * 1024);
  report.checks.push(
    'low quality, reduced motion, tablet/narrow layout and bounded heap across 24 scenery switches',
  );
  const sheet = await context.newPage();
  for (const [name, chosen] of [
    ['scenery-regions', shots.filter((x) => MAP.find((t) => t.group === x.city.group).id === x.city.id)],
    ['scenery-cities', shots],
  ]) {
    const tiles = await Promise.all(
      chosen.map(
        async (x) =>
          `<article><h2>${REGIONS[x.city.group].name} · ${x.city.name} · ${SCENERY[x.city.group].title}</h2><img src="data:image/png;base64,${(await readFile(x.file)).toString('base64')}"></article>`,
      ),
    );
    await sheet.setViewportSize({ width: 1200, height: Math.ceil(chosen.length / 2) * 420 });
    await sheet.setContent(
      `<body style="margin:0;background:#101b20;color:#e4d6b5;font:14px sans-serif"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px">${tiles.join('')}</div><style>article{margin:0;background:#16252a}h2{font-size:16px;padding:5px 14px;margin:0}img{width:100%;display:block}</style></body>`,
    );
    await sheet.locator('img').evaluateAll((imgs) => Promise.all(imgs.map((i) => i.decode())));
    await sheet.screenshot({ path: resolve(out, `${name}.png`), fullPage: true });
  }
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.external, []);
  await writeFile(resolve(out, 'scenery-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const page = browser.contexts().flatMap((c) => c.pages())[0];
  if (page) await page.screenshot({ path: resolve(out, 'scenery-failure.png') });
  console.error(report.errors);
  throw error;
} finally {
  await browser.close();
  await rm(standalone, { force: true });
}
