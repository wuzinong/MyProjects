import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { createGame, phase } from '../src/core/engine.js';
import { serialize, deserialize } from '../src/core/save.js';
import { MAP } from '../src/data/game.js';

const out = resolve('test-results');
await mkdir(out, { recursive: true });
const url = pathToFileURL(resolve('index.html')).href;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { checks: [], metrics: {}, errors: [], external: [] };
try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, acceptDownloads: true });
  await context.setOffline(true);
  const page = await context.newPage();
  page.on('pageerror', (error) => report.errors.push(error.message));
  page.on('request', (r) => {
    if (/^https?:/.test(r.url())) report.external.push(r.url());
  });
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /执棋入局/ }).click();
  await page.locator('#seat-count').selectOption('4');
  await page.getByRole('button', { name: /举兵入局/ }).click();
  await page.getByRole('button', { name: '我已就位，继续' }).click();
  assert.equal(await page.locator('.player-row').count(), 4);
  await page.getByRole('button', { name: '画质与声音设置' }).click();
  await page.locator('#reduced').check();
  await page.locator('#fast').check();
  await page.getByRole('button', { name: '保存设置' }).click();
  assert.equal(await page.locator('body.reduced').count(), 1);
  report.checks.push('four-player mixed setup and functional reduced-motion / fast settings');

  const s = createGame(
    [
      { lord: 0, ai: false },
      { lord: 1, ai: true },
      { lord: 2, ai: true },
      { lord: 3, ai: true },
    ],
    true,
    42,
  );
  phase(s, 'end');
  await page.evaluate((text) => localStorage.setItem('dingli-save-v1', text), serialize(s));
  await page.reload();
  await page.getByRole('button', { name: '续写征程' }).click();
  await page.getByRole('button', { name: '我已就位，继续' }).click();
  await page.getByRole('button', { name: '快速 / 跳过动画' }).click();
  await page.getByRole('button', { name: '结束回合', exact: true }).click();
  await page.waitForFunction(
    () => {
      const s = JSON.parse(localStorage.getItem('dingli-save-v1')).state;
      return s.turn === 0 && s.round >= 2;
    },
    null,
    { timeout: 30000 },
  );
  await page.getByRole('button', { name: '我已就位，继续' }).click();
  report.checks.push('three AI opponents execute their complete turns and return control to the human');

  await page.getByRole('button', { name: '存档', exact: true }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: '导出JSON存档', exact: true }).click(),
  ]);
  const exported = resolve(out, 'round-trip.json');
  await download.saveAs(exported);
  const exportedState = deserialize(await readFile(exported, 'utf8'));
  assert.equal(exportedState.round, 2);
  const invalid = resolve(out, 'invalid.json');
  await writeFile(invalid, '{"format":"wrong"}');
  let [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: '导入JSON存档', exact: true }).click(),
  ]);
  await chooser.setFiles(invalid);
  await page.waitForFunction(() => document.querySelector('#toast').textContent.includes('导入失败'));
  assert.deepEqual(
    deserialize(await page.evaluate(() => localStorage.getItem('dingli-save-v1'))),
    exportedState,
  );
  [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: '导入JSON存档', exact: true }).click(),
  ]);
  await chooser.setFiles(exported);
  await page.waitForFunction(() => document.querySelector('#toast').textContent.includes('存档恢复成功'));
  report.checks.push(
    'real download, file chooser import, and corrupt-file rejection without losing current game',
  );
  if (await page.getByRole('button', { name: '我已就位，继续' }).count())
    await page.getByRole('button', { name: '我已就位，继续' }).click();

  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(120);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: resolve(out, `board-${viewport.width}.png`) });
    await page.getByRole('button', { name: '天下地图', exact: true }).click();
    assert.equal(await page.locator('.map-grid button').count(), MAP.length);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#dialog[open]').count(), 0);
  }
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.getByRole('button', { name: '画质与声音设置' }).click();
  await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement)));
  await page.keyboard.press('Escape');
  report.checks.push(
    'desktop, tablet and narrow-screen board layouts; 64-tile keyboard alternative; native modal focus and Escape',
  );

  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  await cdp.send('HeapProfiler.collectGarbage');
  const before = (await cdp.send('Performance.getMetrics')).metrics.find(
    (m) => m.name === 'JSHeapUsedSize',
  ).value;
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: '存档', exact: true }).click();
    await page.getByRole('button', { name: '返回主菜单', exact: true }).click();
    await page.getByRole('button', { name: /执棋入局/ }).click();
    await page.locator('#seat-count').selectOption(i % 2 ? '4' : '2');
    await page.getByRole('button', { name: /举兵入局/ }).click();
    await page.getByRole('button', { name: '我已就位，继续' }).click();
  }
  await cdp.send('HeapProfiler.collectGarbage');
  const after = (await cdp.send('Performance.getMetrics')).metrics.find(
    (m) => m.name === 'JSHeapUsedSize',
  ).value;
  const frameIntervals = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const frames = [];
        let previous = 0;
        function sample(t) {
          if (previous) frames.push(t - previous);
          previous = t;
          if (frames.length < 90) requestAnimationFrame(sample);
          else resolve(frames);
        }
        requestAnimationFrame(sample);
      }),
  );
  report.metrics = {
    heapBefore: before,
    heapAfter: after,
    heapDelta: after - before,
    averageAnimationFrameMs: frameIntervals.reduce((a, b) => a + b, 0) / frameIntervals.length,
    note: 'Headless Edge browser frame pacing, not a hardware-independent GPU FPS claim.',
  };
  assert.ok(after - before < 5 * 1024 * 1024, 'Repeated new games caused excessive retained JS heap');
  assert.ok(report.metrics.averageAnimationFrameMs < 80, 'Animation loop is severely blocked');
  report.checks.push(
    'four new-game cycles including 4→2 seats; bounded heap after collection and measured frame pacing',
  );

  const blocked = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  await blocked.setOffline(true);
  await blocked.addInitScript(() => {
    Storage.prototype.getItem = function () {
      throw new DOMException('Storage disabled', 'SecurityError');
    };
    Storage.prototype.setItem = function () {
      throw new DOMException('Storage disabled', 'SecurityError');
    };
  });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(url);
  await blockedPage.getByRole('button', { name: /执棋入局/ }).click();
  await blockedPage.getByRole('button', { name: /举兵入局/ }).click();
  assert.match(await blockedPage.locator('#toast').innerText(), /保存失败|不可用/);
  await blockedPage.getByRole('button', { name: '我已就位，继续' }).click();
  await blockedPage.getByRole('button', { name: '存档', exact: true }).click();
  const [backup] = await Promise.all([
    blockedPage.waitForEvent('download'),
    blockedPage.getByRole('button', { name: '导出JSON存档', exact: true }).click(),
  ]);
  assert.ok(backup.suggestedFilename().endsWith('.json'));
  await blocked.close();
  report.checks.push('disabled localStorage reports failure explicitly and still permits file export');

  const noGLBrowser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const noGL = await noGLBrowser.newContext();
    await noGL.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (type.startsWith('webgl')) return null;
        return getContext.call(this, type, ...args);
      };
    });
    const noGLPage = await noGL.newPage();
    await noGLPage.goto(url);
    assert.match(await noGLPage.locator('.graphics-error').innerText(), /WebGL2|硬件加速/);
  } finally {
    await noGLBrowser.close();
  }
  report.checks.push('WebGL unavailable produces a visible recovery instruction rather than a blank page');
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.external, []);
  await writeFile(resolve(out, 'quality-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
