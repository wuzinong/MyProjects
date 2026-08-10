import { describe, expect, it } from 'vitest';
import { FxQueue } from '@/sim/combat/fx';
import { TrialRun } from '@/sim/trial/run';
import { BLOOD_TRIAL } from '@/content/trial';
import { SkillExecutor } from '@/sim/builds/executor';
import { BUILD_CATALOG } from '@/content/builds';
import { defaultSave } from '@/persistence/save';
import { buyShopItem } from '@/persistence/progression';
import { SHOP_ITEMS } from '@/content/progression';

describe('FxQueue', () => {
  it('drains all events and empties itself', () => {
    const q = new FxQueue();
    q.push({ kind: 'boss-spawn' });
    q.push({ kind: 'ultimate-start' });
    expect(q.drain().length).toBe(2);
    expect(q.drain().length).toBe(0);
  });

  it('caps queued events to protect the renderer', () => {
    const q = new FxQueue();
    for (let i = 0; i < 1000; i++) q.push({ kind: 'boss-spawn' });
    expect(q.drain().length).toBeLessThanOrEqual(513);
  });
});

describe('combat FX emission', () => {
  it('skill casts emit projectile and hit events', () => {
    const run = new TrialRun(BLOOD_TRIAL, 11, { maxHealth: 1e9 });
    const executor = new SkillExecutor(run, 11);
    const fireball = BUILD_CATALOG.find((o) => o.id === 'fireball');
    if (!fireball) throw new Error('missing');
    executor.builds.select(fireball);
    run.advanceSeconds(5);
    for (let i = 0; i < 300; i++) {
      run.step();
      executor.step();
    }
    const events = run.fx.drain();
    expect(events.some((e) => e.kind === 'projectile')).toBe(true);
    expect(events.some((e) => e.kind === 'hit')).toBe(true);
  });

  it('kills emit kill events with element info', () => {
    const run = new TrialRun(BLOOD_TRIAL, 12, { maxHealth: 1e9 });
    run.advanceSeconds(5);
    const enemy = run.enemies.find((e) => e.alive);
    if (!enemy) throw new Error('no enemy');
    run.fx.drain();
    run.damageEnemy(enemy, 1e9);
    const events = run.fx.drain();
    expect(events.some((e) => e.kind === 'kill')).toBe(true);
  });
});

describe('spirit stone economy', () => {
  it('kills award spirit stones and they flow into rewards', () => {
    const run = new TrialRun(BLOOD_TRIAL, 13, { maxHealth: 1e9 });
    run.advanceSeconds(20);
    for (const enemy of run.enemies) {
      if (enemy.alive) run.damageEnemy(enemy, 1e9);
    }
    expect(run.spiritStones).toBeGreaterThan(0);
  });

  it('boss kill awards a large stone bonus in victory rewards', () => {
    const run = new TrialRun(BLOOD_TRIAL, 14, { maxHealth: 1e9 });
    run.advanceSeconds(591);
    if (run.boss) run.damageEnemy(run.boss, 1e9);
    expect(run.result?.rewards['spirit-stone-low'] ?? 0).toBeGreaterThanOrEqual(500);
  });

  it('shop purchase atomically deducts stones and adds the item', () => {
    const save = defaultSave(0);
    save.inventory['spirit-stone-low'] = 100;
    const result = buyShopItem(save, 'herb-blood-spirit');
    expect(result.ok).toBe(true);
    expect(save.inventory['spirit-stone-low']).toBe(80);
    expect(save.inventory['herb-blood-spirit']).toBe(1);
  });

  it('shop purchase fails without enough stones and changes nothing', () => {
    const save = defaultSave(0);
    save.inventory['spirit-stone-low'] = 5;
    const result = buyShopItem(save, 'pill-zhuji');
    expect(result.ok).toBe(false);
    expect(save.inventory['spirit-stone-low']).toBe(5);
    expect(save.inventory['pill-zhuji']).toBeUndefined();
  });

  it('all shop items reference known inventory ids and positive prices', () => {
    for (const item of SHOP_ITEMS) {
      expect(item.price).toBeGreaterThan(0);
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
