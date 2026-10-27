import { chromium } from 'playwright';
import { mkdir, copyFile, unlink, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { createGame, command, phase, currentUnit } from '../src/core/engine.js';
import { makeFighter } from '../src/core/progression.js';
import { serialize, deserialize } from '../src/core/save.js';
import { skillById, TACTICAL_SKILLS } from '../src/data/skills.js';
import { skillTargets } from '../src/core/combat.js';
import { fighterStyle } from '../src/render/fighter-style.js';
import { GENERALS } from '../src/data/game.js';

const out = resolve('test-results'),
  standalone = resolve(out, 'defense-standalone.html');
await mkdir(out, { recursive: true });
await copyFile('index.html', standalone);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { checks: [], errors: [], external: [], metrics: {} },
  shots = [];
function make(id = 0, quality = 4) {
  const lord = id >= 90 ? id - 90 : 0;
  const s = createGame(
    [
      { lord, ai: false },
      { lord: (lord + 1) % 7, ai: false },
    ],
    true,
    123,
  );
  s.assets[1].owner = 1;
  s.players[0].pos = 1;
  s.players[0].generals = [makeFighter(id < 90 ? id : 0, 30)];
  s.players[0].hero = makeFighter(-1, 30, lord);
  const g = id < 90 ? s.players[0].generals[0] : s.players[0].hero;
  g.loadout = [id < 90 ? id : 100 + lord];
  g.gear[2] = s.nextItem++;
  s.players[0].items.push({ id: g.gear[2], slot: 2, quality });
  s.players[1].generals = [13, 14, 15].map((n) => ({ ...makeFighter(n, 30), guard: 1 }));
  phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
  return s;
}
function battle(id = 0, quality = 4) {
  let s = make(id, quality);
  s = command(s, { type: 'siege', generals: id < 90 ? [id] : [], hero: id >= 90 });
  s = command(s, { type: 'defend', generals: [], hero: true });
  s.battle.cursor = s.battle.order.indexOf(id < 90 ? 0 : 3);
  return s;
}
let page;
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.setOffline(true);
  page = await context.newPage();
  page.on('pageerror', (e) => report.errors.push(e.message));
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) report.external.push(r.url());
  });
  await page.goto(pathToFileURL(standalone).href);
  await page.waitForLoadState('networkidle');
  const saved = async () => deserialize(await page.evaluate(() => localStorage.getItem('dingli-save-v1')));
  const handoff = async () => {
    if (await page.locator('[data-action="handoff"]').count())
      await page.locator('[data-action="handoff"]').click();
  };
  const drain = async () => {
    for (let i = 0; await page.locator('.reward-controls [data-action="close"]').count(); i++) {
      assert.ok(i < 10);
      await page.locator('.reward-controls [data-action="close"]').click();
    }
    await handoff();
  };
  async function load(s) {
    await drain();
    if (await page.locator('#dialog[open]').count())
      await page.getByRole('button', { name: '关闭面板', exact: true }).click();
    await page.getByRole('button', { name: '存档', exact: true }).click();
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: '导入JSON存档', exact: true }).click(),
    ]);
    await chooser.setFiles({
      name: 'battle.json',
      mimeType: 'application/json',
      buffer: Buffer.from(serialize(s)),
    });
    await page.locator('[data-action="handoff"]').waitFor();
    await handoff();
  }
  let s = make();
  s.players[1].generals[0].guard = -1;
  s.players[1].generals[2].guard = -1;
  await page.evaluate((text) => localStorage.setItem('dingli-save-v1', text), serialize(s));
  await page.reload();
  await page.locator('[data-action="resume"]').click();
  await handoff();
  await page.locator('[data-action="siege"]').click();
  assert.equal(await page.locator('#dialog .siege-pick').count(), 1);
  await page.locator('[data-action="begin-siege"]').click();
  assert.equal((await saved()).phase, 'defense');
  assert.equal(await page.locator('[name="defense-general"]').count(), 0);
  assert.equal(await page.locator('[data-action="handoff"]').count(), 1);
  const pending = await saved();
  await page.reload();
  await page.locator('[data-action="resume"]').click();
  await handoff();
  assert.deepEqual(await saved(), pending);
  await page.locator('[data-action="defense"]').click();
  assert.match(await page.locator('.defense-garrison').innerText(), /徐晃/);
  assert.equal(await page.locator('[name="defense-general"]').count(), 2);
  await page.locator('[name="defense-general"][value="15"]').uncheck();
  await page.screenshot({ path: resolve(out, 'defense-selection.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.locator('#dialog').evaluate((e) => e.scrollWidth > e.clientWidth), false);
  await page.screenshot({ path: resolve(out, 'defense-selection-mobile.png') });
  await page.locator('[data-action="begin-defense"]').click();
  s = await saved();
  assert.equal(s.players[0].food, 40);
  assert.deepEqual(
    s.battle.units.filter((u) => u.side === 1 && u.gid >= 0).map((u) => u.gid),
    [14, 13],
  );
  assert.ok(s.battle.units.some((u) => u.side === 1 && u.gid === -3));
  assert.equal(s.players[1].pos, 0);
  report.checks.push(
    'real declaration, defender privacy handoff, pending reload, fixed garrison, selected reserves and remote lord at 390px',
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  s = make();
  s.players[1].ai = true;
  s = command(s, { type: 'siege', generals: [0], hero: true });
  await page.evaluate((text) => localStorage.setItem('dingli-save-v1', text), serialize(s));
  await page.reload();
  await page.locator('[data-action="resume"]').click();
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem('dingli-save-v1')).state.phase === 'battle',
  );
  await handoff();
  assert.equal((await saved()).battle.units.filter((u) => u.side === 1).length, 5);
  s = make();
  s.players[0].ai = true;
  s = command(s, { type: 'siege', generals: [0], hero: true });
  await load(s);
  await page.locator('[data-action="defense"]').click();
  assert.equal(await page.locator('#defense-hero').isChecked(), true);
  await page.locator('[data-action="begin-defense"]').click();
  assert.equal((await saved()).phase, 'battle');
  report.checks.push(
    'AI defenders choose and begin battle without human input; human defends against an AI declaration',
  );

  s = battle();
  currentUnit(s).statuses.push({ kind: 'stun', power: 0, turns: 1 });
  await load(s);
  assert.equal(await page.locator('[data-action="attack"]').count(), 0);
  await page.getByRole('button', { name: '整息恢复', exact: true }).click();
  await page.waitForFunction(() => !document.body.classList.contains('animating'));
  assert.ok(!(await saved()).battle.units.find((u) => u.id === 0).statuses.some((x) => x.kind === 'stun'));
  s = battle();
  s.battle.units.find((u) => u.id === 10).statuses.push({ kind: 'counter', power: 75, turns: 2 });
  const expected = command(s, { type: 'attack', target: 10 });
  await load(s);
  await page.locator('#battle-target').selectOption('10');
  await page.locator('[data-action="attack"]').click();
  await page.waitForFunction(() => document.querySelector('#scene').dataset.combatStage === 'counter');
  await page.screenshot({ path: resolve(out, 'defense-counter.png') });
  await page.waitForFunction(() => !document.body.classList.contains('animating'));
  assert.deepEqual(await saved(), expected);
  assert.equal(expected.combatEvent.reactions.length, 1);
  report.checks.push('stun recovery and real counter damage/animation match the rule result exactly');

  const samples = new Set([0, 1, 2, 3, 4, 5, 6, 7, 13, 26, 35, 36, 64, 75, 90, 91, 92, 96]);
  const styles = new Set();
  const renderAction = async (s, kind, screenshot) => {
    await load(s);
    const u = currentUnit(s),
      ability = skillById(u.skills[0]);
    if (kind === 'skill') {
      await page.locator('#battle-skill').selectOption(String(ability.id));
      const target = skillTargets(s.battle, u, ability)[0];
      if (await page.locator('#skill-target').count())
        await page.locator('#skill-target').selectOption(String(target.id));
    } else await page.locator('#battle-target').selectOption('10');
    await page.locator(`[data-action="${kind}"]`).click();
    await page.waitForFunction(() => document.querySelector('#scene').dataset.combatStage === 'impact');
    assert.equal(
      await page.locator('#scene').getAttribute('data-fighter-style'),
      String(fighterStyle(u, s.players[0]).id),
    );
    if (screenshot) {
      await page.screenshot({ path: resolve(out, screenshot) });
      shots.push(screenshot);
    }
    if (await page.locator('[data-action="skip-combat"]').count())
      await page.locator('[data-action="skip-combat"]').click();
    await page.waitForFunction(() => !document.body.classList.contains('animating'));
    assert.ok((await saved()).sequence > s.sequence);
  };
  for (let id = 0; id < 97; id++) {
    s = battle(id);
    const style = fighterStyle(currentUnit(s), s.players[0]);
    styles.add(
      JSON.stringify([
        style.effect,
        style.stance,
        style.path,
        style.arc,
        style.sweep,
        style.marks,
        style.tilt,
        style.tempo,
      ]),
    );
    await renderAction(s, 'attack', samples.has(id) ? `defense-attack-${id}.png` : null);
    await renderAction(s, 'skill', samples.has(id) ? `defense-skill-${id}.png` : null);
  }
  assert.equal(styles.size, 97);
  for (const ability of TACTICAL_SKILLS) {
    const role = Math.floor((ability.id - 400) / 2),
      roles = ['vanguard', 'rider', 'archer', 'strategist', 'support'],
      id = GENERALS.find((g) => g.role === roles[role]).id;
    s = battle(id);
    s.players[0].generals[0].loadout = [ability.id];
    currentUnit(s).skills = [ability.id];
    currentUnit(s).cooldowns = [0];
    await renderAction(s, 'skill', `defense-tactic-${ability.id}.png`);
  }
  for (let quality = 0; quality < 5; quality++)
    await renderAction(battle(0, quality), 'attack', `defense-weapon-${quality}.png`);
  report.checks.push(
    '97 characters each perform a real normal attack and base skill; ten new tactical skills and five weapon quality effects render offline',
  );

  const cdp = await context.newCDPSession(page);
  await cdp.send('HeapProfiler.collectGarbage');
  const before = (await cdp.send('Runtime.getHeapUsage')).usedSize;
  for (let i = 0; i < 18; i++) await renderAction(battle(i % 6), 'attack', null);
  await cdp.send('HeapProfiler.collectGarbage');
  report.metrics.heapDelta = (await cdp.send('Runtime.getHeapUsage')).usedSize - before;
  assert.ok(report.metrics.heapDelta < 10 * 1024 * 1024);
  await page.locator('[data-action="settings"]').click();
  await page.locator('#low').check();
  await page.locator('#reduced').check();
  await page.locator('[data-action="apply-settings"]').click();
  s = battle();
  await load(s);
  await page.locator('[data-action="attack"]').click();
  assert.equal(await page.locator('#combat-banner').count(), 0);
  assert.equal((await saved()).sequence, s.sequence + 1);
  report.checks.push(
    'same-page repeated battles release resources; reduced-motion/low-quality still applies exactly one real command',
  );
  const contact = await context.newPage();
  const rows = await Promise.all(
    shots
      .slice(0, 36)
      .map(
        async (name) =>
          `<figure><img src="data:image/png;base64,${(await readFile(resolve(out, name))).toString('base64')}"><figcaption>${name}</figcaption></figure>`,
      ),
  );
  await contact.setViewportSize({ width: 1440, height: 1000 });
  await contact.setContent(
    `<style>body{margin:0;background:#102127;color:#eee;display:grid;grid-template-columns:repeat(3,1fr);font:14px sans-serif}figure{margin:4px}img{width:100%}</style>${rows.join('')}`,
  );
  await contact.locator('img').evaluateAll((imgs) => Promise.all(imgs.map((img) => img.decode())));
  await contact.screenshot({ path: resolve(out, 'defense-contact.png'), fullPage: true });
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.external, []);
  await writeFile(resolve(out, 'defense-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  if (page) await page.screenshot({ path: resolve(out, 'defense-failure.png') });
  throw error;
} finally {
  await browser.close();
  await unlink(standalone);
}
