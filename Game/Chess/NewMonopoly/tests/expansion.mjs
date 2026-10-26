import { chromium } from 'playwright';
import { PerspectiveCamera, Vector3 } from 'three';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createGame, command, phase } from '../src/core/engine.js';
import { serialize, deserialize } from '../src/core/save.js';
import { REGIONS, GENERALS } from '../src/data/game.js';
import { SKILLS } from '../src/data/skills.js';
import { FACILITY_POSITIONS } from '../src/render/landscape.js';
import { CENTER_CAMERA, CENTER_SCALE } from '../src/render/world.js';
const out = resolve('test-results');
await mkdir(out, { recursive: true });
await copyFile('index.html', resolve(out, 'expansion-standalone.html'));
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
  await page.goto(pathToFileURL(resolve(out, 'expansion-standalone.html')).href);
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
    if (await page.locator('.game-top').count())
      await page.getByRole('button', { name: '存档', exact: true }).click();
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page
        .getByRole('button', {
          name: (await page.locator('.game-top').count()) ? '导入JSON存档' : '导入存档',
          exact: true,
        })
        .click(),
    ]);
    const text = serialize(s);
    await chooser.setFiles({
      name: 'scenario.json',
      mimeType: 'application/json',
      buffer: Buffer.from(text),
    });
    await page.waitForFunction((text) => localStorage.getItem('dingli-save-v1') === text, text);
    await page.getByRole('button', { name: '我已就位，继续', exact: true }).click();
  }
  let s = make();
  s.assets[1].owner = 0;
  s.players[0].cards = [8];
  await load(s);
  await page.getByRole('button', { name: '锦囊台 · 览策', exact: true }).click();
  await page.getByRole('button', { name: '施用此计', exact: true }).click();
  assert.equal((await current()).phase, 'develop');
  await page.getByRole('button', { name: '建设民居', exact: true }).click();
  assert.equal((await current()).assets[1].level, 1);
  assert.equal((await current()).phase, 'end');
  report.checks.push('real card movement → own landing → one-step development without owning the region');
  for (let level = 2; level <= 5; level++) {
    s = await current();
    s.players[0].cash = 3000;
    phase(s, 'develop', { tile: 1 });
    await load(s);
    await page.locator('button[data-cmd]').filter({ hasText: /^建设/ }).click();
    assert.equal((await current()).assets[1].level, level);
  }
  await page.screenshot({ path: resolve(out, 'expanded-palace.png') });
  report.checks.push(
    'all five building stages, including palace conversion, through visible upgrade buttons',
  );
  s = make();
  s.players[0].pos = 1;
  s.players[0].cards = [8];
  s.seed = 0;
  s = command(s, { type: 'card', index: 0 });
  await load(s);
  await page.getByRole('button', { name: '查看秘密商店', exact: true }).click();
  assert.equal(await page.locator('.shop-offers article').count(), 3);
  await page.screenshot({ path: resolve(out, 'secret-shop.png') });
  const offer = s.decision.offers[0];
  await page.locator('.shop-offers button').first().click();
  assert.equal((await current()).players[0].cash, s.players[0].cash - offer.price);
  await page.getByRole('button', { name: '关闭面板', exact: true }).click();
  await page.getByRole('button', { name: '查看秘密商店', exact: true }).click();
  assert.equal(await page.locator('.shop-offers button').first().isDisabled(), true);
  await page.getByRole('button', { name: '收摊离开', exact: true }).click();
  assert.equal((await current()).phase, 'event');
  await page.getByRole('button', { name: '免费招募武将', exact: true }).click();
  if (await page.locator('#dialog[open]').count())
    await page.getByRole('button', { name: '关闭面板', exact: true }).click();
  report.checks.push(
    'secret shop: prices, three fixed items, purchase reveal, sold-out protection and original event reward',
  );

  for (let region = 0; region < 8; region++) {
    s = make();
    s.players[0].region = region;
    s.players[0].pos = [1, 6, 11, 16, 21, 26, 31, 37][region];
    s.players[0].generals = [0, 2, 5].map((id) => ({
      id,
      level: 1,
      injury: 0,
      guard: -1,
      gear: Array(6).fill(null),
    }));
    await load(s);
    await page.waitForTimeout(950);
    assert.equal(await page.locator('#scene').getAttribute('data-region'), REGIONS[region].name);
    await page.screenshot({ path: resolve(out, `region-${region}.png`) });
  }
  await page.getByRole('button', { name: '近看中央', exact: true }).click();
  await page.waitForTimeout(200);
  const rect = await page.locator('#scene').boundingBox();
  const camera = new PerspectiveCamera(39, rect.width / rect.height, 0.1, 320);
  camera.position.set(...CENTER_CAMERA);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  for (const [point, title] of [
    [[FACILITY_POSITIONS.roster[0], 0.55, FACILITY_POSITIONS.roster[1]], '将府军备'],
    [[FACILITY_POSITIONS.cards[0], 0.55, FACILITY_POSITIONS.cards[1]], '行军锦囊'],
    [[FACILITY_POSITIONS.recruit[0], 0.55, FACILITY_POSITIONS.recruit[1]], '整备三军'],
  ]) {
    const v = new Vector3(...point).multiplyScalar(CENTER_SCALE).project(camera);
    await page.mouse.click(rect.x + ((v.x + 1) * rect.width) / 2, rect.y + ((1 - v.y) * rect.height) / 2);
    await page.locator('#dialog[open]').waitFor();
    assert.match(await page.locator('#dialog-title').innerText(), new RegExp(title));
    await page.getByRole('button', { name: '关闭面板', exact: true }).click();
  }
  report.checks.push(
    'eight regional scenery screenshots and actual raycast clicks on all three central 3D facilities',
  );
  s = make();
  s.players[0].pos = 5;
  s.players[0].cards = [8, 8];
  await load(s);
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: '锦囊台 · 览策', exact: true }).click();
    await page.getByRole('button', { name: '施用此计', exact: true }).first().click();
    if (i === 0) await page.getByRole('button', { name: '购入城池', exact: true }).click();
  }
  await page.waitForTimeout(950);
  assert.equal((await current()).players[0].pos, 7);
  assert.equal(await page.locator('#scene').getAttribute('data-region'), '关中');
  report.checks.push('scenery follows actual city landing and remains unchanged on a special tile');
  function fight(id) {
    let s = make();
    const general = (id, guard = -1) => ({ id, level: 1, injury: 0, guard, gear: Array(6).fill(null) });
    s.players[0].generals = [id, (id + 1) % 40, (id + 2) % 40].map((i) => general(i));
    s.players[1].generals = [13, 14, 15].map((i) => general(i, 1));
    s.assets[1].owner = 1;
    s.players[0].pos = 1;
    phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
    s = command(s, { type: 'siege', generals: s.players[0].generals.map((g) => g.id) });
    s.battle.order = [0, 1, 2, 10, 11, 12];
    s.battle.cursor = 0;
    s.battle.units
      .filter((u) => u.side === 0)
      .forEach((u) => {
        u.hp = Math.floor(u.max * 0.6);
      });
    return s;
  }
  for (let id = 0; id < 40; id++) {
    await load(fight(id));
    await page.locator('[data-action=skill]').click();
    await page.waitForFunction(() => document.querySelector('#scene').dataset.combatStage === 'impact');
    assert.equal(await page.locator('[data-action=attack]').isDisabled(), true);
    assert.match(await page.locator('#combat-banner').innerText(), new RegExp(SKILLS[id].name));
    if ([0, 2, 4, 5, 16, 25, 26, 39].includes(id))
      await page.screenshot({ path: resolve(out, `skill-${id}-impact.png`) });
    if (id === 0) {
      const resolved = await current();
      await page.getByRole('button', { name: '跳过本次演出', exact: true }).click();
      assert.deepEqual(await current(), resolved);
    }
    await page.waitForFunction(() => !document.body.classList.contains('animating'));
    assert.equal((await current()).combatEvent.skillId, id);
  }
  report.checks.push(
    'all 40 named skills render through impact and recovery, block double actions, and preserve saved results when skipped',
  );
  s = fight(0);
  s.players.forEach((p) => {
    p.cards = [];
  });
  await load(s);
  await page.getByRole('button', { name: '自动战斗', exact: true }).click();
  await page.waitForFunction(() => document.body.classList.contains('animating'));
  const autoSequence = (await current()).sequence;
  await page.waitForTimeout(650);
  assert.equal((await current()).sequence, autoSequence);
  await page.getByRole('button', { name: '跳过本次演出', exact: true }).click();
  await page.waitForFunction(() => document.body.classList.contains('animating'));
  assert.equal((await current()).sequence, autoSequence + 1);
  await page.getByRole('button', { name: '跳过本次演出', exact: true }).click();
  await page.getByRole('button', { name: '停止自动', exact: true }).click();
  report.checks.push('automatic battle waits for each animation and advances exactly once after skipping');
  for (const troop of ['步', '骑', '弓']) {
    const id = GENERALS.findIndex((g) => g.troop === troop);
    await load(fight(id));
    await page.locator('[data-action=attack]').click();
    await page.waitForFunction(() => document.querySelector('#scene').dataset.combatStage === 'impact');
    await page.screenshot({ path: resolve(out, `attack-${['步', '骑', '弓'].indexOf(troop)}.png`) });
    await page.waitForFunction(() => !document.body.classList.contains('animating'));
  }
  report.checks.push('infantry weapon swing, cavalry charge and archer projectile sequences');
  s = fight(0);
  s.battle.units
    .filter((u) => u.side === 1)
    .forEach((u) => {
      u.hp = u.gid === -2 ? 1 : 0;
    });
  await load(s);
  await page.locator('#skill-target').selectOption('19');
  await page.locator('[data-action=skill]').click();
  assert.equal((await current()).battle, null);
  assert.equal(await page.locator('body.fighting.animating').count(), 1);
  await page.getByRole('button', { name: '跳过本次演出', exact: true }).click();
  assert.equal(await page.locator('body.fighting').count(), 0);
  assert.equal((await current()).assets[1].owner, 0);
  report.checks.push(
    'final blow remains on the battlefield for its animation, then returns to captured city without double settlement',
  );

  await page.getByRole('button', { name: '画质与声音设置', exact: true }).click();
  await page.locator('#low').check();
  await page.locator('#reduced').check();
  await page.getByRole('button', { name: '保存设置', exact: true }).click();
  await load(fight(26));
  await page.locator('[data-action=skill]').click();
  assert.equal(await page.locator('body.animating').count(), 0);
  assert.equal((await current()).combatEvent.skillId, 26);
  report.checks.push('low quality / reduced motion resolves the same skill without animation locks');
  const cdp = await context.newCDPSession(page);
  await cdp.send('HeapProfiler.collectGarbage');
  const start = (await cdp.send('Runtime.getHeapUsage')).usedSize;
  for (let i = 0; i < 16; i++) {
    s = make();
    s.players[0].region = i % 8;
    await load(s);
    await page.waitForTimeout(70);
  }
  await cdp.send('HeapProfiler.collectGarbage');
  const end = (await cdp.send('Runtime.getHeapUsage')).usedSize;
  report.metrics.scenerySwitchHeapGrowth = end - start;
  assert.ok(end - start < 8 * 1024 * 1024, 'repeated scenery transitions retain too much heap');
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.external, []);
  await writeFile(resolve(out, 'expansion-report.json'), JSON.stringify(report, null, 2));
  console.log(report.checks.join('\n'));
  console.log(JSON.stringify(report.metrics));
} catch (error) {
  const page = browser.contexts().flatMap((c) => c.pages())[0];
  if (page) await page.screenshot({ path: resolve(out, 'expansion-failure.png') });
  console.error(report.errors);
  throw error;
} finally {
  await browser.close();
}
