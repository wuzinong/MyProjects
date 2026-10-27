import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { createGame, phase } from '../src/core/engine.js';
import { serialize, deserialize } from '../src/core/save.js';
import { choose } from '../src/ai/strategy.js';
import { MAP, PALACE_SUPPLY } from '../src/data/game.js';

const out = resolve('test-results');
await mkdir(out, { recursive: true });
await copyFile('index.html', resolve(out, 'standalone.html'));
const url = pathToFileURL(resolve(out, 'standalone.html')).href;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [],
  external = [],
  report = [];
try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, acceptDownloads: true });
  await context.setOffline(true);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) external.push(r.url());
  });
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: resolve(out, 'home.png') });
  await page.getByRole('button', { name: /执棋入局/ }).click();
  assert.equal(await page.locator('.lord-card').count(), 7);
  await page.getByRole('button', { name: /举兵入局/ }).click();
  await page.getByRole('button', { name: '我已就位，继续' }).click();
  await page.getByRole('button', { name: '武将 / 装备', exact: true }).click();
  assert.equal(await page.locator('.equipment-slot').count(), 6);
  await page.screenshot({ path: resolve(out, 'equipment.png') });
  await page.getByRole('button', { name: '关闭面板' }).click();
  await page.getByRole('button', { name: /掷骰行军/ }).click();
  await page.waitForTimeout(250);
  assert.match(await page.locator('.chronicle').innerText(), /掷出/);
  report.push('offline menu, seven lords, setup, six equipment slots and real dice click');

  async function load(s) {
    await page.evaluate((text) => localStorage.setItem('dingli-save-v1', text), serialize(s));
    await page.reload();
    await page.getByRole('button', { name: '续写征程' }).click();
    if (await page.getByRole('button', { name: '我已就位，继续' }).count())
      await page.getByRole('button', { name: '我已就位，继续' }).click();
  }
  const make = (enhanced = true) =>
    createGame(
      [
        { lord: 0, ai: false },
        { lord: 1, ai: false },
        { lord: 3, ai: false },
      ],
      enhanced,
      144,
    );
  let s = make();
  s.assets[1].owner = 0;
  s.assets[3].owner = 0;
  MAP.filter((t) => t.group === 0).forEach((t) => {
    s.assets[t.id].owner = 0;
  });
  s.players[0].cash = 3000;
  s.players[0].items = Array.from({ length: 6 }, (_, slot) => ({ id: 100 + slot, slot, quality: 4 }));
  s.nextItem = 106;
  s.players[0].generals[0].gear = s.players[0].items.map((x) => x.id);
  s.players[0].generals[0].level = 10;
  s.players[0].cards = [0, 16, 18];
  await load(s);
  await page.getByRole('button', { name: '疆域 / 资产', exact: true }).click();
  await page.locator('.asset-card').first().getByRole('button', { name: /建设/ }).click();
  const savedBuild = deserialize(await page.evaluate(() => localStorage.getItem('dingli-save-v1')));
  assert.equal(savedBuild.assets[1].level, 1);
  await page.getByRole('button', { name: '关闭面板' }).click();
  await page.getByRole('button', { name: '武将 / 装备', exact: true }).click();
  assert.equal(await page.locator('.equipment-slot.q4').count(), 6);
  await page.screenshot({ path: resolve(out, 'legendary-equipment.png') });
  await page.getByRole('button', { name: '关闭面板' }).click();
  await page.getByRole('button', { name: /卡牌 ·/ }).click();
  await page.getByRole('button', { name: '施用此计', exact: true }).first().click();
  await page.getByRole('button', { name: '关闭面板' }).click();
  report.push('asset construction, six legendary slots and playable functional card');

  s = make();
  s.players[0].generals[0].level = 10;
  s.assets[1].owner = 1;
  s.players[0].pos = 1;
  s.players[0].items = Array.from({ length: 6 }, (_, slot) => ({ id: 100 + slot, slot, quality: 4 }));
  s.nextItem = 106;
  s.players[0].generals[0].gear = s.players[0].items.map((x) => x.id);
  phase(s, 'rent', { tile: 1, amount: 2, creditor: 1 });
  await load(s);
  await page.getByRole('button', { name: /点将攻城/ }).click();
  await page.getByRole('button', { name: '鸣鼓攻城' }).click();
  await page.locator('[data-action="handoff"]').click();
  await page.getByRole('button', { name: '点将迎战', exact: true }).click();
  await page.getByRole('button', { name: '确认迎战', exact: true }).click();
  if (await page.locator('[data-action="handoff"]').count())
    await page.locator('[data-action="handoff"]').click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: resolve(out, 'battle.png') });
  await page.getByRole('button', { name: '普攻', exact: true }).click();
  await page.waitForFunction(() => !document.body.classList.contains('animating'));
  assert.match(await page.locator('.battle-log').innerText(), /命中/);
  report.push('siege selection, independent 3D battle, targeted manual attack and visible combat log');

  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: resolve(out, `viewport-${viewport.width}.png`) });
  }
  await page.setViewportSize({ width: 1366, height: 768 });

  // Drive the shipped DOM with all seats human. The strategy reads the persisted
  // public fixture solely to select the same commands available to a person.
  for (const enhanced of [false, true]) {
    s = createGame(
      [
        { lord: 0, ai: false },
        { lord: 1, ai: false },
      ],
      enhanced,
      20,
    );
    // A deterministic late-game save makes every UI decision through the real command path.
    s.players[0].cash = 200;
    s.players[1].cash = 60;
    for (const id of [1, 3]) {
      s.assets[id].owner = 0;
      s.assets[id].level = 5;
    }
    s.palaces = PALACE_SUPPLY - 2;
    s.players[1].pos = 1;
    s.turn = 1;
    phase(s, 'rent', { tile: 1, creditor: 0, amount: 250 });
    await load(s);
    await page.getByRole('button', { name: '交纳租金', exact: true }).click();
    await page.getByRole('button', { name: '确认破产', exact: true }).click();
    await page.waitForSelector('.victory');
    assert.match(await page.locator('.victory').innerText(), /刘备 · 胜/);
    report.push(`${enhanced ? 'enhanced' : 'classic'} UI rent → debt → insolvency → victory`);
    await page.getByRole('button', { name: '关闭面板' }).click();
  }
  // Complete games from the opening, acting through visible controls.
  for (const enhanced of [false, true]) {
    s = createGame(
      [
        { lord: 0, ai: false },
        { lord: 1, ai: false },
      ],
      enhanced,
      1,
    );
    await load(s);
    let actions = 0;
    await page.getByRole('button', { name: '快速 / 跳过动画', exact: true }).click();
    while (actions++ < 4000) {
      const text = await page.evaluate(() => localStorage.getItem('dingli-save-v1'));
      s = deserialize(text);
      if (s.phase === 'over') break;
      const hand = page.getByRole('button', { name: '我已就位，继续' });
      if (await hand.count()) await hand.click();
      const c = choose(s);
      if (c.type === 'asset') {
        await page.getByRole('button', { name: '疆域 / 资产', exact: true }).click();
        const selector = `button[data-cmd]`;
        const index = await page.locator('#dialog ' + selector).evaluateAll(
          (buttons, c) =>
            buttons.findIndex((b) => {
              const x = JSON.parse(b.dataset.cmd);
              return x.type === c.type && x.action === c.action && x.tile === c.tile;
            }),
          c,
        );
        assert.ok(index >= 0, `missing asset button ${JSON.stringify(c)}`);
        await page
          .locator('#dialog ' + selector)
          .nth(index)
          .click();
        await page.getByRole('button', { name: '关闭面板' }).click();
      } else if (c.type === 'trade') {
        await page.getByRole('button', { name: '交易', exact: true }).click();
        await page.locator('[name=to]').selectOption(String(c.offer.to));
        for (const key of ['give', 'take'])
          await page.locator(`[name=${key}]`).selectOption(String(c.offer[key]));
        for (const key of ['giveCash', 'takeCash', 'giveEscape', 'takeEscape'])
          await page.locator(`[name=${key}]`).fill(String(c.offer[key]));
        await page.getByRole('button', { name: '递交提案' }).click();
      } else if (['equip', 'train', 'guard', 'manual', 'relic', 'loadSkill'].includes(c.type)) {
        await page.getByRole('button', { name: '武将 / 装备', exact: true }).click();
        await page.locator(`[data-general="${c.general}"]`).click();
        if (c.type === 'equip') await page.locator(`[data-equip="${c.slot}"]`).selectOption(String(c.item));
        if (c.type === 'train') await page.getByRole('button', { name: /训练 / }).click();
        if (c.type === 'manual')
          await page.locator('[data-hero-choice="manual"]').selectOption(String(c.index));
        if (c.type === 'relic') await page.locator('[data-hero-choice="relic"]').selectOption(String(c.item));
        if (c.type === 'loadSkill')
          await page.locator(`[data-skill-slot="${c.slot}"]`).selectOption(String(c.skill));
        if (c.type === 'guard') {
          await page.locator('#guard-tile').selectOption(String(c.tile));
          await page.getByRole('button', { name: '调动驻守' }).click();
        }
        await page.getByRole('button', { name: '关闭面板' }).click();
      } else if (['recruit', 'gear'].includes(c.type)) {
        await page.getByRole('button', { name: '招贤 / 军械', exact: true }).click();
        await page.getByRole('button', { name: c.type === 'recruit' ? /招募一将/ : /铸取装备/ }).click();
        await page.getByRole('button', { name: '关闭面板' }).click();
      } else if (['card', 'discard', 'battleCard'].includes(c.type)) {
        if (c.type === 'discard') await page.getByRole('button', { name: '选择要弃的卡' }).click();
        else if (c.type === 'battleCard')
          await page.getByRole('button', { name: '战术卡', exact: true }).click();
        else await page.getByRole('button', { name: /卡牌 ·/ }).click();
        if (c.type === 'battleCard') {
          await page.locator('#card-target').selectOption(String(c.target));
          await page.locator(`[data-card="${c.index}"]`).click();
        } else {
          await page.locator('.tactic-card').nth(c.index).getByRole('button').click();
        }
        if (await page.locator('#dialog[open]').count())
          await page.getByRole('button', { name: '关闭面板' }).click();
      } else if (c.type === 'siege') {
        await page.getByRole('button', { name: /点将攻城/ }).click();
        await page.locator('#siege-hero').setChecked(Boolean(c.hero));
        for (const checkbox of await page.locator('[name=siege-general]').all()) {
          const id = Number(await checkbox.getAttribute('value'));
          await checkbox.setChecked(c.generals.includes(id));
        }
        await page.getByRole('button', { name: '鸣鼓攻城' }).click();
      } else if (c.type === 'defend') {
        await page.getByRole('button', { name: '点将迎战', exact: true }).click();
        if (await page.locator('#defense-hero').isEnabled())
          await page.locator('#defense-hero').setChecked(c.hero);
        for (const checkbox of await page.locator('[name=defense-general]:enabled').all())
          await checkbox.setChecked(c.generals.includes(Number(await checkbox.getAttribute('value'))));
        await page.getByRole('button', { name: '确认迎战', exact: true }).click();
      } else if (c.type === 'recover') {
        await page.getByRole('button', { name: '整息恢复', exact: true }).click();
      } else if (c.type === 'attack' || c.type === 'skill') {
        if (c.type === 'attack') await page.locator('#battle-target').selectOption(String(c.target));
        else {
          await page.locator('#battle-skill').selectOption(String(c.skill));
          if (await page.locator('#skill-target').count())
            await page.locator('#skill-target').selectOption(String(c.target));
        }
        await page.locator(`[data-action="${c.type}"]`).click();
      } else if (c.type === 'shopBuy') {
        await page.getByRole('button', { name: '查看秘密商店', exact: true }).click();
        await page.locator('.shop-offers button').nth(c.index).click();
      } else if (c.type === 'alliance' || c.type === 'food') {
        await page.getByRole('button', { name: '外交 / 补给', exact: true }).click();
        const index = await page.locator('#dialog button[data-cmd]').evaluateAll(
          (buttons, c) =>
            buttons.findIndex((b) => {
              const x = JSON.parse(b.dataset.cmd);
              return x.type === c.type && (c.target === undefined || x.target === c.target);
            }),
          c,
        );
        assert.ok(index >= 0);
        await page.locator('#dialog button[data-cmd]').nth(index).click();
        if (await page.locator('#dialog[open]').count())
          await page.getByRole('button', { name: '关闭面板' }).click();
      } else if (c.type === 'bid') {
        await page.locator('#bid').fill(String(c.amount));
        await page.getByRole('button', { name: '举牌竞价' }).click();
      } else {
        const index = await page.locator('#app button[data-cmd]').evaluateAll(
          (buttons, c) =>
            buttons.findIndex((b) => {
              const x = JSON.parse(b.dataset.cmd);
              return Object.keys(c).every((k) => x[k] === c[k]);
            }),
          c,
        );
        assert.ok(index >= 0, `missing board button ${JSON.stringify(c)} phase ${s.phase}`);
        await page.locator('#app button[data-cmd]').nth(index).click();
      }
      if (await page.locator('#dialog[open] .victory').count()) break;
      while (await page.locator('#dialog[open] .reveal-stage').count()) {
        await page.getByRole('button', { name: '关闭面板' }).click();
      }
    }
    assert.equal(
      deserialize(await page.evaluate(() => localStorage.getItem('dingli-save-v1'))).phase,
      'over',
    );
    report.push(
      `${enhanced ? 'enhanced' : 'classic'} full opening-to-victory browser game: ${actions} actions`,
    );
    if (await page.locator('#dialog[open]').count())
      await page.getByRole('button', { name: '关闭面板' }).click();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  await writeFile(resolve(out, 'browser-report.json'), JSON.stringify({ report, errors, external }, null, 2));
  console.log(report.join('\n'));
} catch (error) {
  const pages = browser.contexts().flatMap((c) => c.pages());
  if (pages.length) await pages[0].screenshot({ path: resolve(out, 'failure.png') });
  throw error;
} finally {
  await browser.close();
}
