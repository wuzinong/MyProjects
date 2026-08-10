import { describe, expect, it } from 'vitest';
import { StatusTracker } from '@/sim/combat/status';
import { selectTarget, CastScheduler } from '@/sim/combat/targeting';
import { LootField } from '@/sim/combat/loot';
import { SIM_DT } from '@/sim/core/clock';

describe('StatusTracker', () => {
  it('slow reduces speed multiplier while active and expires', () => {
    const s = new StatusTracker();
    s.apply({ kind: 'slow', duration: 1, magnitude: 0.5 });
    expect(s.speedMultiplier).toBe(0.5);
    s.step(1.01);
    expect(s.speedMultiplier).toBe(1);
  });

  it('paralysis blocks movement entirely and expires', () => {
    const s = new StatusTracker();
    s.apply({ kind: 'paralyze', duration: 0.5, magnitude: 1 });
    expect(s.paralyzed).toBe(true);
    s.step(0.6);
    expect(s.paralyzed).toBe(false);
  });

  it('armor break accumulates flat reduction with strongest active', () => {
    const s = new StatusTracker();
    s.apply({ kind: 'armorBreak', duration: 2, magnitude: 20 });
    s.apply({ kind: 'armorBreak', duration: 1, magnitude: 30 });
    expect(s.modifiers.armorBreakFlat).toBe(30);
    s.step(1.5);
    expect(s.modifiers.armorBreakFlat).toBe(20);
  });

  it('vulnerability raises damage taken multiplier', () => {
    const s = new StatusTracker();
    s.apply({ kind: 'vulnerable', duration: 3, magnitude: 1.25 });
    expect(s.modifiers.damageTakenMultiplier).toBe(1.25);
  });

  it('shield absorbs damage before health and reports depletion', () => {
    const s = new StatusTracker();
    s.apply({ kind: 'shield', duration: 10, magnitude: 50 });
    expect(s.absorbDamage(30)).toBe(0);
    expect(s.absorbDamage(30)).toBe(10);
    expect(s.shieldRemaining).toBe(0);
  });

  it('immunity tag blocks matching statuses', () => {
    const s = new StatusTracker(['slow']);
    s.apply({ kind: 'slow', duration: 5, magnitude: 0.2 });
    expect(s.speedMultiplier).toBe(1);
  });
});

describe('targeting and cast scheduling', () => {
  const entities = [
    { id: 1, x: 10, y: 0, tags: ['beast'], alive: true },
    { id: 2, x: 50, y: 0, tags: ['ghost'], alive: true },
    { id: 3, x: 200, y: 0, tags: ['beast'], alive: true },
    { id: 4, x: 5, y: 0, tags: ['beast'], alive: false },
  ];

  it('selects nearest living target within range', () => {
    const t = selectTarget(entities, 0, 0, 100, undefined);
    expect(t?.id).toBe(1);
  });

  it('respects target tag filters', () => {
    const t = selectTarget(entities, 0, 0, 100, 'ghost');
    expect(t?.id).toBe(2);
  });

  it('returns null when nothing is in range', () => {
    const t = selectTarget(entities, 1000, 1000, 50, undefined);
    expect(t).toBeNull();
  });

  it('cast scheduler enforces cooldown and mana', () => {
    const sched = new CastScheduler();
    let manaPool = 30;
    const trySpend = (cost: number) => {
      if (manaPool < cost) return false;
      manaPool -= cost;
      return true;
    };
    expect(sched.tryCast('fireball', 1.0, 10, trySpend)).toBe(true);
    expect(sched.tryCast('fireball', 1.0, 10, trySpend)).toBe(false); // cooling down
    for (let i = 0; i < 61; i++) sched.step(SIM_DT);
    expect(sched.tryCast('fireball', 1.0, 10, trySpend)).toBe(true);
    for (let i = 0; i < 61; i++) sched.step(SIM_DT);
    expect(sched.tryCast('fireball', 1.0, 15, trySpend)).toBe(false); // out of mana (10 left)
    expect(manaPool).toBe(10);
  });
});

describe('LootField', () => {
  it('collects experience within pickup radius exactly once', () => {
    const field = new LootField();
    const id = field.dropExperience(10, 10, 5);
    let xp = 0;
    field.collect(0, 0, 50, { onExperience: (v) => (xp += v), onItem: () => {} });
    field.collect(0, 0, 50, { onExperience: (v) => (xp += v), onItem: () => {} });
    expect(xp).toBe(5);
    expect(field.has(id)).toBe(false);
  });

  it('does not collect outside radius', () => {
    const field = new LootField();
    field.dropExperience(100, 100, 5);
    let xp = 0;
    field.collect(0, 0, 50, { onExperience: (v) => (xp += v), onItem: () => {} });
    expect(xp).toBe(0);
  });

  it('treasure boxes yield their item exactly once', () => {
    const field = new LootField();
    field.dropItem(0, 0, 'talisman-golden-brick');
    const got: string[] = [];
    field.collect(0, 0, 10, { onExperience: () => {}, onItem: (item) => got.push(item) });
    field.collect(0, 0, 10, { onExperience: () => {}, onItem: (item) => got.push(item) });
    expect(got).toEqual(['talisman-golden-brick']);
  });
});
