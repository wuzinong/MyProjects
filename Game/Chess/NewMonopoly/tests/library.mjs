import { chromium } from 'playwright';
import { mkdir, copyFile, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { createGame } from '../src/core/engine.js';
import { serialize } from '../src/core/save.js';
import { LIBRARY_CATEGORIES, LIBRARY_ENTRIES } from '../src/ui/library.js';

const out = resolve('test-results'),
  standalone = resolve(out, 'library-standalone.html');
await mkdir(out, { recursive: true });
await copyFile('index.html', standalone);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const checks = [],
  errors = [],
  external = [];
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
  const stored = () => page.evaluate(() => localStorage.getItem('dingli-save-v1'));
  const category = (id) => page.locator(`[data-library-category="${id}"]`).click();
  const search = async (text) => {
    await page.locator('#library-search input').fill(text);
    await page.locator('#library-search button[type="submit"]').click();
  };
  const close = async () => page.getByRole('button', { name: '关闭面板', exact: true }).click();
  await page.getByRole('button', { name: '资料', exact: true }).click();
  for (const [id] of LIBRARY_CATEGORIES) {
    await category(id);
    const entries = LIBRARY_ENTRIES.filter((e) => e.category === id);
    assert.equal(await page.locator('.library-card').count(), entries.length);
    for (const e of entries) {
      await page.locator(`[data-library-entry="${e.id}"]`).click();
      assert.equal(await page.locator('.library-detail h1').innerText(), e.name);
      assert.ok((await page.locator('.library-detail').innerText()).includes(e.summary));
      await page.locator('[data-library-back]').click();
      assert.equal(
        await page.evaluate(() => document.activeElement?.getAttribute('data-library-entry')),
        e.id,
      );
    }
  }
  assert.equal(await stored(), null);
  checks.push('all 257 entries open and return by real buttons without creating a save');
  await category('people');
  await search('陈庆之');
  assert.equal(await page.locator('.library-card').count(), 1);
  await page.locator('.library-card').click();
  await page.screenshot({ path: resolve(out, 'library-person.png') });
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#library-search input').inputValue(), '陈庆之');
  assert.equal(await page.locator('.library-card').count(), 1);
  await search('"><img src=x onerror=alert(1)>');
  assert.equal(await page.locator('.library-card').count(), 0);
  assert.equal(await page.locator('.reference-library img').count(), 0);
  await page.locator('[data-library-clear]').click();
  assert.equal(await page.locator('.library-card').count(), 97);
  checks.push('filtered detail preserves query and focus; escaped search, empty state and clear work');
  await category('places');
  await search('巴蜀');
  await page.screenshot({ path: resolve(out, 'library-cities.png') });
  await page.locator('[data-library-entry="places-37"]').click();
  await page.screenshot({ path: resolve(out, 'library-city-detail.png') });
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.equal(await page.locator('#dialog').evaluate((el) => el.scrollWidth > el.clientWidth), false);
    await page.screenshot({ path: resolve(out, `library-city-${width}.png`) });
  }
  await page.keyboard.press('Escape');
  await close();
  assert.equal(
    await page.locator('[data-action="library"]').evaluate((el) => el === document.activeElement),
    true,
  );
  const make = (enhanced, ai = false) =>
    createGame(
      [
        { lord: 0, ai },
        { lord: 1, ai: false },
      ],
      enhanced,
      31,
    );
  async function load(s) {
    await page.evaluate((text) => localStorage.setItem('dingli-save-v1', text), serialize(s));
    await page.reload();
    await page.getByRole('button', { name: '续写征程', exact: true }).click();
    if (await page.locator('[data-action="handoff"]').count())
      await page.locator('[data-action="handoff"]').click();
  }
  for (const enhanced of [false, true]) {
    await load(make(enhanced));
    const saved = await stored();
    const header = page.locator('.header-tools [data-action="library"]');
    assert.equal(await header.isVisible(), true);
    const bounds = await header.boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 390);
    const turn = await page.locator('.turn-label').boundingBox();
    const top = await page.locator('.game-top').boundingBox();
    assert.ok(turn.y >= top.y && turn.y + turn.height <= top.y + top.height);
    await page.screenshot({
      path: resolve(out, `library-header-${enhanced ? 'enhanced' : 'classic'}-390.png`),
    });
    await header.click();
    await category('equipment');
    await page.locator('[data-library-entry="equipment-26"]').click();
    assert.match(await page.locator('.library-detail').innerText(), /攻击\s*\+20/);
    await page.keyboard.press('Escape');
    await category('treasures');
    assert.equal(await page.locator('.library-card').count(), 14);
    await page.screenshot({ path: resolve(out, 'library-treasures-390.png') });
    await close();
    assert.equal(await stored(), saved);
    assert.equal(await header.evaluate((el) => el === document.activeElement), true);
  }
  checks.push(
    'classic and enhanced menus expose full content and preserve saves; narrow header remains visible',
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await load(make(true, true));
  await page.locator('.header-tools [data-action="library"]').click();
  const paused = await stored();
  await page.waitForTimeout(1800);
  assert.equal(await stored(), paused);
  await close();
  await page.waitForFunction((previous) => localStorage.getItem('dingli-save-v1') !== previous, paused);
  checks.push('reading pauses the active AI; closing resumes the same game');
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  await writeFile(resolve(out, 'library-report.json'), JSON.stringify({ checks, errors, external }, null, 2));
  console.log(checks.join('\n'));
} catch (error) {
  const page = browser.contexts()[0]?.pages()[0];
  if (page) await page.screenshot({ path: resolve(out, 'library-failure.png') });
  throw error;
} finally {
  await browser.close();
  await unlink(standalone);
}
