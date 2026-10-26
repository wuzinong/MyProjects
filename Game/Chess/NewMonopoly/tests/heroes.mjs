import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { mkdir, copyFile, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { createGame, command, phase } from '../src/core/engine.js';
import { makeFighter, gainExperience } from '../src/core/progression.js';
import { serialize, deserialize } from '../src/core/save.js';
import { BIOGRAPHIES } from '../src/data/people.js';
import { xpNeeded } from '../src/data/progression.js';
import { skillFor } from '../src/data/skills.js';
import { skillTargets } from '../src/core/combat.js';
import { chooseBattle } from '../src/ai/strategy.js';

const out = resolve('test-results'),
  standalone = resolve(out, 'heroes-standalone.html');
await mkdir(out, { recursive: true });
await copyFile('index.html', standalone);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [],
  external = [],
  checks = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.setOffline(true);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) external.push(r.url());
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
      31,
    );
  async function load(s) {
    await page.evaluate((text) => localStorage.setItem('dingli-save-v1', text), serialize(s));
    await page.reload();
    await page.getByRole('button', { name: '续写征程', exact: true }).click();
    if (await page.locator('[data-action="handoff"]').count())
      await page.locator('[data-action="handoff"]').click();
  }
  const saved = async () => deserialize(await page.evaluate(() => localStorage.getItem('dingli-save-v1')));
  const close = async () => page.getByRole('button', { name: '关闭面板', exact: true }).click();
  await page.getByRole('button', { name: /执棋入局/ }).click();
  await page.locator('#seat-count').selectOption('4');
  await page.locator('#type-0').selectOption('human');
  await page.locator('[data-lord="6"]').click();
  assert.match(await page.locator('.biography').innerText(), /吕布/);
  await page.locator('[data-action="bio-back"]').click();
  assert.equal(await page.locator('#seat-count').inputValue(), '4');
  assert.equal(await page.locator('#lord-0').inputValue(), '6');
  checks.push('lord card biography preserves four-seat setup and selected lord');
  await load(make());
  await page.locator('[data-action="codex"]').click();
  assert.equal(await page.locator('.codex-card').count(), 97);
  for (const name of Object.keys(BIOGRAPHIES)) {
    await page.locator(`.codex-card[data-bio="${name}"]`).click();
    assert.match(await page.locator('#dialog-title').innerText(), new RegExp(name));
    assert.ok((await page.locator('.biography-summary').innerText()).length >= 50);
    assert.ok((await page.locator('.biography li').count()) >= 2);
    await page.locator('[data-action="bio-back"]').click();
  }
  await page.locator('#codex-search input').fill('陈庆之');
  await page.locator('#codex-search button').click();
  assert.equal(await page.locator('.codex-card').count(), 1);
  await page.locator('.codex-card').click();
  await page.screenshot({ path: resolve(out, 'heroes-biography.png') });
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.codex-card').count(), 1);
  await close();
  checks.push('97 real card-detail biographies, filtered codex and Escape return');

  let s = make();
  s.players[0].hero = makeFighter(-1, 4, 0);
  s.players[0].generals[0] = makeFighter(0, 5);
  s.players[0].generals[0].loadout = [205, 0];
  s.players[0].hero.xp = xpNeeded(4) - 1;
  s.players[0].manuals = [2, 3];
  s.players[0].relics = [{ id: s.nextItem++, type: 1 }];
  await load(s);
  await page.locator('[data-action="roster"]').click();
  await page.locator('[data-general="-1"]').click();
  await page.getByRole('button', { name: /训练 / }).click();
  assert.equal((await saved()).players[0].hero.level, 5);
  assert.equal((await saved()).players[0].hero.title, 0);
  await page.locator('[data-hero-choice="manual"]').selectOption('2');
  await page.locator('[data-hero-choice="relic"]').selectOption(String(s.players[0].relics[0].id));
  assert.equal((await saved()).players[0].hero.manual, 2);
  const item = s.players[0].items[0];
  await page.locator(`[data-equip="${item.slot}"]`).selectOption(String(item.id));
  assert.equal((await saved()).players[0].hero.gear[item.slot], item.id);
  await page.screenshot({ path: resolve(out, 'heroes-growth.png') });
  await page.locator('.portrait-button').click();
  await page.locator('[data-action="bio-back"]').click();
  assert.equal(await page.locator('.general-list .selected').getAttribute('data-general'), '-1');
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: resolve(out, `heroes-roster-${width}.png`) });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('[data-general="0"]').click();
  assert.equal(await page.locator('[data-skill-slot="1"]').inputValue(), '0');
  assert.equal(await page.locator('[data-skill-slot="1"] option[value=""]').count(), 0);
  await close();
  checks.push(
    'actual training crosses level 5, unlocks skill and title; lord gear/manual/relic and responsive roster',
  );

  s = await saved();
  s.assets[1].owner = 1;
  s.players[0].pos = 1;
  phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
  await load(s);
  await page.getByRole('button', { name: /点将攻城/ }).click();
  await page.locator('[name="siege-general"]').uncheck();
  await page.locator('[data-action="begin-siege"]').click();
  assert.equal((await saved()).battle.units.filter((u) => u.side === 0).length, 1);
  await page.locator('#battle-skill').selectOption('302');
  await page.locator('[data-action="skill"]').click();
  await page.waitForFunction(() => document.querySelector('#scene').dataset.combatStage === 'impact');
  assert.equal(await page.locator('#scene').getAttribute('data-combat-effect'), 'ice');
  await page.screenshot({ path: resolve(out, 'heroes-lord-ice.png') });
  const sequence = (await saved()).sequence;
  await page.locator('[data-action="skip-combat"]').click();
  assert.equal((await saved()).sequence, sequence);
  checks.push('lord-only siege, selectable learned manual, ice attack and skip without duplicate settlement');

  const samples = [
    [1, 204, 'blades'],
    [0, 209, 'charge'],
    [0, 207, 'lance'],
    [4, 214, 'arrows'],
    [5, 215, 'formation'],
    [5, 216, 'storm'],
    [5, 217, 'ice'],
    [5, 218, 'wind'],
    [7, 224, 'heal'],
    [7, 222, 'barrier'],
    [1, 202, 'quake'],
    [4, 211, 'fire'],
  ];
  for (const [id, ability, effect] of samples) {
    s = make();
    s.players[0].generals = [makeFighter(id, 50)];
    s.players[0].generals[0].loadout = [ability];
    s.players[1].generals = [13, 14, 15].map((id) => ({ ...makeFighter(id, 50), guard: 1 }));
    s.assets[1].owner = 1;
    phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
    s = command(s, { type: 'siege', generals: [id], hero: false });
    s.battle.cursor = s.battle.order.indexOf(0);
    s.battle.units.forEach((u) => {
      u.hp = Math.ceil(u.max * 0.65);
    });
    await load(s);
    const u = s.battle.units.find((u) => u.id === 0),
      skill = skillFor(u);
    const target = skillTargets(s.battle, u, skill)[0];
    if (await page.locator('#skill-target').count())
      await page.locator('#skill-target').selectOption(String(target.id));
    await page.locator('[data-action="skill"]').click();
    await page.waitForFunction(() => document.querySelector('#scene').dataset.combatStage === 'impact');
    assert.equal(await page.locator('#scene').getAttribute('data-combat-effect'), effect);
    await page.screenshot({ path: resolve(out, `heroes-effect-${effect}.png`) });
    await page.locator('[data-action="skip-combat"]').click();
  }
  checks.push('12 distinct effect families captured at impact, including level-50 skills and title effects');

  for (let lord = 0; lord < 7; lord++) {
    s = createGame(
      [
        { lord, ai: false },
        { lord: (lord + 1) % 7, ai: false },
      ],
      true,
      31,
    );
    s.assets[1].owner = 1;
    phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
    s = command(s, { type: 'siege', hero: true, generals: [] });
    s.battle.cursor = s.battle.order.indexOf(3);
    await load(s);
    await page.locator('[data-action="skill"]').click();
    await page.waitForFunction(() => document.querySelector('#scene').dataset.combatStage === 'impact');
    await page.screenshot({ path: resolve(out, `heroes-lord-${lord}.png`) });
    await page.locator('[data-action="skip-combat"]').click();
    assert.equal((await saved()).combatEvent.skillId, 100 + lord);
  }
  checks.push('all seven lords can cast their own distinct starting skill through battle controls');

  s = make();
  for (const p of s.players) {
    p.hero = makeFighter(-1, 50, p.lord);
    p.generals = (p.id ? [13, 14, 15] : [0, 1, 2]).map((id) => ({
      ...makeFighter(id, 50),
      guard: p.id ? 1 : -1,
    }));
    p.generals.forEach((g, i) => {
      g.title = i * 3 + p.id;
    });
  }
  s.players[1].pos = 1;
  s.assets[1].owner = 1;
  phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
  s = command(s, { type: 'siege', hero: true, generals: [0, 1, 2] });
  await load(s);
  await page.screenshot({ path: resolve(out, 'heroes-four-versus-four.png') });
  assert.equal(await page.locator('.battle-unit').count(), 9);
  checks.push('four-versus-four plus wall is rendered with both lords and title ornaments');

  const titled = s.battle.units.filter((u) => u.gid >= 0 || u.gid === -3);
  for (let group = 0; group < 2; group++) {
    titled.forEach((u, i) => {
      const p = s.players[u.side === 0 ? s.battle.attacker : s.battle.defender],
        g = u.gid === -3 ? p.hero : p.generals.find((g) => g.id === u.gid);
      g.title = Math.min(9, group * 5 + i);
    });
    await load(s);
    await page.screenshot({ path: resolve(out, `heroes-title-group-${group}.png`) });
  }
  checks.push('all ten title styles rendered across two battle lineups');

  s.players.forEach((p) => {
    p.hand = [];
  });
  s.battle.units.forEach((u) => {
    u.max = u.hp = 9000;
  });
  await load(s);
  const cdp = await context.newCDPSession(page);
  const heap = async () => {
    await cdp.send('HeapProfiler.collectGarbage');
    return (await cdp.send('Runtime.getHeapUsage')).usedSize;
  };
  let heapBefore = 0;
  for (let i = 0; i < 24; i++) {
    if (await page.locator('[data-action="handoff"]').count())
      await page.locator('[data-action="handoff"]').click();
    const c = chooseBattle(await saved());
    assert.ok(['attack', 'skill'].includes(c.type));
    if (c.type === 'skill') {
      await page.locator('#battle-skill').selectOption(String(c.skill));
      if (await page.locator('#skill-target').count())
        await page.locator('#skill-target').selectOption(String(c.target));
    } else await page.locator('#battle-target').selectOption(String(c.target));
    await page.locator(`[data-action="${c.type}"]`).click();
    await page.waitForFunction(() => Boolean(document.querySelector('#scene').dataset.combatStage));
    await page.waitForFunction(() => !document.querySelector('#scene').dataset.combatStage);
    if (i === 7) heapBefore = await heap();
  }
  const heapAfter = await heap();
  assert.ok(heapAfter - heapBefore < 5 * 1024 * 1024, 'Repeated combat animations retain excessive JS heap');
  checks.push(
    `24 continuous battle actions without reload; post-warmup retained JS heap delta ${heapAfter - heapBefore} bytes`,
  );

  s = make();
  gainExperience(s.players[0], s.players[0].hero, 180);
  s.assets[1].owner = 1;
  phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
  s = command(s, { type: 'siege', hero: true, generals: [] });
  s.battle.units
    .filter((u) => u.side === 1)
    .forEach((u) => {
      u.hp = u.gid === -2 ? 1 : 0;
    });
  s.battle.cursor = s.battle.order.indexOf(3);
  await load(s);
  await page.locator('#battle-target').selectOption('19');
  await page.locator('[data-action="attack"]').click();
  await page.waitForFunction(() => document.querySelector('#scene').dataset.combatStage === 'impact');
  await page.locator('[data-action="skip-combat"]').click();
  assert.equal((await saved()).reports.length, 1);
  const result = serialize(await saved());
  await page.locator('[data-action="reports"]').click();
  assert.match(await page.locator('.campaign-report').innerText(), /经验/);
  await page.screenshot({ path: resolve(out, 'heroes-report.png') });
  await close();
  await page.locator('[data-action="reports"]').click();
  assert.equal(serialize(await saved()), result);
  await close();
  await load(await saved());
  assert.equal(serialize(await saved()), result);
  checks.push(
    'actual final hit generates persistent experience report; reopening and reload do not grant twice',
  );
  await page.locator('[data-action="settings"]').click();
  await page.locator('#low').check();
  await page.locator('#reduced').check();
  await page.locator('[data-action="apply-settings"]').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-action="reports"]').click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: resolve(out, 'heroes-report-390.png') });
  checks.push('low-quality reduced-motion and narrow report controls');
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  await writeFile(resolve(out, 'heroes-report.json'), JSON.stringify({ checks, errors, external }, null, 2));
  console.log(checks.join('\n'));
} catch (error) {
  const page = browser.contexts()[0]?.pages()[0];
  if (page) await page.screenshot({ path: resolve(out, 'heroes-failure.png') });
  throw error;
} finally {
  await browser.close();
  await unlink(standalone);
}
