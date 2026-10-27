import { chromium } from 'playwright';
import { mkdir, copyFile, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { createGame, command, phase } from '../src/core/engine.js';
import { serialize, deserialize } from '../src/core/save.js';
import { GENERALS, CARDS, EVENTS, ITEMS, QUALITY } from '../src/data/game.js';
import { equipmentArt } from '../src/ui/equipment-art.js';
import { rewardContent } from '../src/ui/reward-scenes.js';
import { makeFighter } from '../src/core/progression.js';

const out = resolve('test-results'),
  standalone = resolve(out, 'rewards-standalone.html');
await mkdir(out, { recursive: true });
await copyFile('index.html', standalone);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { checks: [], errors: [], external: [], metrics: {} };
const make = () =>
  createGame(
    [
      { lord: 0, ai: false },
      { lord: 1, ai: false },
    ],
    true,
    42,
  );
function encounter(seed, choice = 'card') {
  const s = make();
  s.seed = seed;
  s.players[0].pos = choice === 'gear' ? 33 : 2;
  phase(s, 'event', { tile: s.players[0].pos });
  return s;
}
const ui = {
  esc: (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    ),
  // Preview sheets use the production biography portrait captured below.
  portrait: () => '',
};
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
  async function drain() {
    for (let n = 0; await page.locator('.reward-stage').count(); n++) {
      assert.ok(n < 10);
      await page.locator('.reward-controls [data-action="close"]').click();
    }
  }
  async function load(s) {
    await drain();
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
    await chooser.setFiles({ name: 'rewards.json', mimeType: 'application/json', buffer: Buffer.from(text) });
    await page.waitForFunction((text) => localStorage.getItem('dingli-save-v1') === text, text);
    await page.getByRole('button', { name: '我已就位，继续', exact: true }).click();
  }
  async function clickCommand(type, extra = {}) {
    const selector = await page.locator('button[data-cmd]').evaluateAll(
      (els, { type, extra }) => {
        const match = els.find((el) => {
          const c = JSON.parse(el.dataset.cmd);
          return c.type === type && Object.entries(extra).every(([k, v]) => c[k] === v);
        });
        return match?.dataset.cmd;
      },
      { type, extra },
    );
    assert.ok(selector, `visible command ${type}`);
    await page
      .locator('button[data-cmd]')
      .filter({ visible: true })
      .evaluateAll((els, value) => els.find((el) => el.dataset.cmd === value).click(), selector);
  }
  const s = make();
  s.players[0].items = Array.from({ length: 6 }, (_, slot) => ({ id: s.nextItem++, slot, quality: 4 }));
  s.players[0].hero.gear = s.players[0].items.map((i) => i.id);
  await load(s);
  await page.getByRole('button', { name: '武将 / 装备', exact: true }).click();
  await page.locator('[data-general="-1"]').click();
  assert.equal(await page.locator('.armory-slot .equipment-art:not(.equipment-empty)').count(), 6);
  await page.locator('.equipment-grid').scrollIntoViewIfNeeded();
  await page.screenshot({ path: resolve(out, 'armory-six-slots.png') });
  await page.getByRole('button', { name: '关闭面板', exact: true }).click();
  // A real duplicate recruitment has a result even though the roster does not grow.
  let recruit = make();
  recruit.seed = 0;
  const e = [],
    drawn = command(recruit, { type: 'recruit' }, e);
  recruit.players[0].generals = [makeFighter(e[0].id)];
  await load(recruit);
  await page.getByRole('button', { name: '招贤 / 军械', exact: true }).click();
  await clickCommand('recruit');
  await page.locator('.reward-stage').waitFor();
  const afterRecruit = await stored();
  assert.ok((await page.locator('.reward-copy').innerText()).includes('转为'));
  const before = await page.locator('.scene-main').evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(550);
  const after = await page.locator('.scene-main').evaluate((el) => getComputedStyle(el).transform);
  assert.notEqual(before, after);
  await page.screenshot({ path: resolve(out, 'reward-general-motion.png') });
  ui.portrait = () => ''; // Each real general portrait is collected for the contact sheet below.
  await page.locator('.reward-general').click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.reward-still').count(), 1);
  assert.equal(await stored(), afterRecruit);
  await drain();
  assert.equal(deserialize(afterRecruit).players[0].cash, drawn.players[0].cash);
  report.checks.push(
    'duplicate draw, real moving frame, biography return without replay or repeated settlement',
  );

  let multiple;
  for (let seed = 0; seed < 3000; seed++) {
    const trial = encounter(seed, 'gear'),
      events = [];
    const result = command(trial, { type: 'event', choice: 'gear' }, events);
    if (events.filter((v) => v.kind === 'gear').length === 2) {
      multiple = { trial, events, result };
      break;
    }
  }
  assert.ok(multiple);
  await load(multiple.trial);
  await clickCommand('event', { choice: 'gear' });
  const savedResult = await stored();
  assert.equal(savedResult, serialize(multiple.result));
  for (const event of multiple.events) {
    assert.equal(await page.locator('.reward-stage').getAttribute('data-reward'), `gear-${event.id}`);
    await page.locator('[data-action="skip-reward"]').click();
    assert.equal(await page.locator('.reward-still').count(), 1);
    await page.locator('.reward-controls [data-action="close"]').click();
  }
  assert.equal(await stored(), savedResult);
  assert.equal(await page.locator('.reward-stage').count(), 0);
  report.checks.push(
    'two equipment drops queued in exact settlement order; skip/continue never changes the save',
  );

  const full = encounter(35);
  full.players[0].cards = Array(8).fill(0);
  await load(full);
  await clickCommand('event', { choice: 'card' });
  await page.screenshot({ path: resolve(out, 'reward-card.png') });
  await drain();
  assert.equal(deserialize(await stored()).phase, 'discard');
  await page.getByRole('button', { name: '选择要弃的卡', exact: true }).click();
  await page.locator('button[data-cmd]').filter({ hasText: '弃置' }).first().click();
  assert.equal(deserialize(await stored()).players[0].cards.length, 8);
  report.checks.push('draw animation does not swallow mandatory overflow discard');

  // Classic mode draws its event on landing, without an enhanced reward decision.
  const classic = createGame(
    [
      { lord: 0, ai: false },
      { lord: 1, ai: false },
    ],
    false,
    42,
  );
  let landed;
  for (let seed = 0; seed < 1000; seed++) {
    classic.seed = seed;
    const events = [],
      result = command(classic, { type: 'roll' }, events);
    if (events.some((v) => v.kind === 'event')) {
      landed = { state: structuredClone(classic), result, events };
      break;
    }
  }
  await load(landed.state);
  await clickCommand('roll');
  await page.locator('.reward-stage').waitFor();
  assert.equal(await stored(), serialize(landed.result));
  await page.screenshot({ path: resolve(out, 'reward-classic.png') });
  await drain();
  report.checks.push(
    'classic event actual dice landing opens its distinct scene and preserves the resulting phase',
  );
  const debtor = encounter(42);
  debtor.players[0].cash = 1;
  const debtIndex = debtor.eventDeck.indexOf(1);
  [debtor.eventDeck[0], debtor.eventDeck[debtIndex]] = [debtor.eventDeck[debtIndex], debtor.eventDeck[0]];
  debtor.eventCursor = 0;
  await load(debtor);
  await clickCommand('event', { choice: 'classic' });
  await drain();
  assert.equal(deserialize(await stored()).phase, 'debt');
  assert.ok(await page.locator('button[data-cmd]').filter({ hasText: '破产' }).count());
  report.checks.push('an expense event returns to the original debt decision rather than dismissing it');

  let battle = make();
  battle.players[0].generals = [0, 3, 4].map((id) => makeFighter(id));
  for (const f of [battle.players[0].hero, ...battle.players[0].generals]) {
    f.gear = Array.from({ length: 6 }, (_, slot) => {
      const item = { id: battle.nextItem++, slot, quality: 4 };
      battle.players[0].items.push(item);
      return item.id;
    });
  }
  battle.players[0].pos = 1;
  battle.assets[1].owner = 1;
  phase(battle, 'rent', { tile: 1, creditor: 1, amount: 2 });
  battle = command(battle, { type: 'siege', hero: true, generals: [0, 3, 4] });
  battle = command(battle, {
    type: 'defend',
    generals: battle.players[1].generals.map((g) => g.id),
    hero: false,
  });
  battle.battle.order = [3, ...battle.battle.order.filter((id) => id !== 3)];
  battle.battle.cursor = 0;
  await load(battle);
  await page.screenshot({ path: resolve(out, 'armory-battle-three-troops.png') });
  for (const u of battle.battle.units.filter((u) => u.side === 1)) u.hp = u.id === 19 ? 1 : 0;
  let won;
  for (let seed = 0; seed < 100; seed++) {
    battle.seed = seed;
    const events = [],
      result = command(battle, { type: 'attack', target: 19 }, events);
    if (events.length) {
      won = { state: structuredClone(battle), result, events };
      break;
    }
  }
  assert.ok(won);
  await load(won.state);
  await page.locator('#battle-target').selectOption('19');
  await page.locator('[data-action="attack"]').click();
  await page.locator('#combat-banner').waitFor();
  assert.equal(await page.locator('.reward-stage').count(), 0);
  await page.waitForTimeout(350);
  await page.screenshot({ path: resolve(out, 'armory-sword-action.png') });
  await page.locator('[data-action="skip-combat"]').click();
  await page.locator('.reward-stage').waitFor();
  assert.equal(await stored(), serialize(won.result));
  assert.equal(
    await page.locator('.reward-stage').getAttribute('data-reward'),
    `${won.events[0].kind}-${won.events[0].id}`,
  );
  await drain();
  assert.equal(await stored(), serialize(won.result));
  report.checks.push(
    'six-slot models on infantry/cavalry/archer; final siege strike finishes before its one-time loot reveal',
  );

  // Use the actual library portrait markup; contact sheets isolate production artwork, not another implementation.
  await page.getByRole('button', { name: '资料', exact: true }).click();
  const portraits = await page
    .locator('.library-card .portrait')
    .evaluateAll((els) => els.map((el) => el.outerHTML));
  ui.portrait = (id) => portraits[id + 7];
  await page.getByRole('button', { name: '关闭面板', exact: true }).click();
  const preview = await context.newPage();
  preview.on('pageerror', (e) => report.errors.push(e.message));
  await preview.goto(pathToFileURL(standalone).href);
  await preview.waitForLoadState('networkidle');
  await preview.evaluate(() => {
    document.querySelector('#app').innerHTML = '';
    document.querySelector('#scene').style.display = 'none';
    const host = document.createElement('main');
    host.id = 'visual-review';
    host.style.cssText =
      'position:fixed;inset:0;z-index:50;overflow:auto;height:100vh;padding:24px;background:#101a20';
    document.body.append(host);
  });
  const renderPreview = async (html) =>
    preview.locator('#visual-review').evaluate((el, html) => {
      el.innerHTML = html;
      el.scrollTop = 0;
    }, html);
  await preview.setViewportSize({ width: 1500, height: 1390 });
  await renderPreview(
    `<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px">${Array.from({ length: 30 }, (_, id) => `<article style="text-align:center;border:1px solid #566265;background:#233037">${equipmentArt(id % 6, Math.floor(id / 6))}<p>${QUALITY[Math.floor(id / 6)]} · ${ITEMS[id % 6]}</p></article>`).join('')}</div>`,
  );
  assert.equal(await preview.locator('#visual-review').evaluate((el) => el.getBoundingClientRect().top), 0);
  await preview.screenshot({ path: resolve(out, 'armory-thirty.png') });
  const previewState = make();
  const all = [
    ...GENERALS.map((g) => ({ kind: 'general', owner: 0, id: g.id })),
    ...CARDS.map((g) => ({ kind: 'card', owner: 0, id: g.id })),
    ...EVENTS.map((_, id) => ({ kind: 'event', owner: 0, id })),
  ];
  const motions = new Set();
  for (const event of all) {
    const html = rewardContent({ event }, previewState, ui, false).body;
    await renderPreview(html);
    assert.equal(
      await preview.locator('.reward-copy h1').innerText(),
      event.kind === 'general'
        ? GENERALS[event.id].name
        : event.kind === 'card'
          ? CARDS[event.id].name
          : EVENTS[event.id].name,
    );
    const motion = await preview.locator('.scene-main').evaluate((el) => getComputedStyle(el).animationName);
    assert.notEqual(motion, 'none');
    motions.add(motion);
    const invalid = await preview.locator('svg').evaluateAll((els) => els.some((el) => !el.getBBox().width));
    assert.equal(invalid, false);
  }
  report.metrics.motionFamilies = motions.size;
  assert.ok(motions.size >= 20);
  for (const kind of ['card', 'event']) {
    const entries = all.filter((e) => e.kind === kind);
    await preview.setViewportSize({ width: 1800, height: kind === 'card' ? 1800 : 1200 });
    await renderPreview(
      `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${entries.map((event) => `<div style="zoom:.52">${rewardContent({ event }, previewState, ui, false).body}</div>`).join('')}</div>`,
    );
    await preview.waitForTimeout(700);
    await preview.screenshot({ path: resolve(out, `reward-${kind}-sheet.png`) });
  }
  await preview.setViewportSize({ width: 1800, height: 1200 });
  const examples = [0, 1, 2, 3, 4, 5, 20, 23, 26, 30, 33, 70];
  await renderPreview(
    `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${examples.map((id) => `<div style="zoom:.58">${rewardContent({ event: { kind: 'general', owner: 0, id } }, previewState, ui, false).body}</div>`).join('')}</div>`,
  );
  await preview.waitForTimeout(600);
  await preview.screenshot({ path: resolve(out, 'reward-generals-sheet.png') });
  report.checks.push(
    'all 90 general / 24 card / 12 event SVG scenes and finite animation families render; 30 armory plates contact sheet',
  );
  await preview.close();

  await load(multiple.trial);
  await page.setViewportSize({ width: 390, height: 844 });
  await clickCommand('event', { choice: 'gear' });
  await page.waitForTimeout(3500);
  assert.equal(
    await page
      .locator('.reward-stage')
      .evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length),
    0,
  );
  assert.equal(await page.locator('#dialog').evaluate((el) => el.scrollWidth > el.clientWidth), false);
  const saveMobile = await stored();
  await page.screenshot({ path: resolve(out, 'reward-390.png') });
  await drain();
  assert.equal(await stored(), saveMobile);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const repeat = make();
  repeat.players[0].cash = 50000;
  await load(repeat);
  const cdp = await context.newCDPSession(page);
  await cdp.send('HeapProfiler.collectGarbage');
  const heapBefore = (await cdp.send('Runtime.getHeapUsage')).usedSize;
  for (let i = 0; i < 18; i++) {
    await page.getByRole('button', { name: '招贤 / 军械', exact: true }).click();
    await clickCommand('recruit');
    await drain();
  }
  await cdp.send('HeapProfiler.collectGarbage');
  report.metrics.repeatedRewardHeapDelta = (await cdp.send('Runtime.getHeapUsage')).usedSize - heapBefore;
  assert.ok(report.metrics.repeatedRewardHeapDelta < 3000000);
  await page.getByRole('button', { name: '招贤 / 军械', exact: true }).click();
  await clickCommand('gear');
  const savedBeforeReload = await stored();
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: '续写征程', exact: true }).click();
  await page.getByRole('button', { name: '我已就位，继续', exact: true }).click();
  assert.equal(await stored(), savedBeforeReload);
  assert.equal(await page.locator('.reward-stage').count(), 0);
  report.checks.push(
    '18 consecutive reveals clean up in one page; reload during reveal restores already-settled state without replay',
  );

  await load(encounter(19));
  await page.getByRole('button', { name: '画质与声音设置', exact: true }).click();
  await page.locator('#reduced').check();
  await page.locator('#low').check();
  await page.getByRole('button', { name: '保存设置', exact: true }).click();
  await clickCommand('event', { choice: 'card' });
  assert.equal(await page.locator('.reward-still.reward-low').count(), 1);
  assert.equal(
    await page.locator('.scene-main').evaluate((el) => getComputedStyle(el).animationName),
    'none',
  );
  await drain();
  const cleanup = await page.evaluate(() => ({
    stages: document.querySelectorAll('.reward-stage').length,
    animations: document.getAnimations().filter((a) => a.effect?.target?.closest('.reward-stage')).length,
  }));
  assert.deepEqual(cleanup, { stages: 0, animations: 0 });
  report.checks.push(
    '390px layout, reduced motion, low-quality composition and removal of dismissed animation DOM',
  );
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.external, []);
  await writeFile(resolve(out, 'rewards-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await unlink(standalone);
}
