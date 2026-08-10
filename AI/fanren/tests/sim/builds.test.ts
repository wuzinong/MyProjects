import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { BUILD_CATALOG, BuildCatalogSchema, BuildOptionSchema } from '@/content/builds';
import {
  BuildState, tryConsumeEffect,
  ULTIMATE_COOLDOWN_SECONDS, ULTIMATE_DURATION_SECONDS,
} from '@/sim/builds/state';
import { SeededRng } from '@/sim/core/rng';

const alwaysSense = () => true;

describe('build catalog validation', () => {
  it('catalog parses with unique ids and continuous levels', () => {
    expect(() => BuildCatalogSchema.parse(BUILD_CATALOG)).not.toThrow();
  });

  it('catalog covers all required first-release options', () => {
    const ids = BUILD_CATALOG.map((o) => o.id);
    for (const required of [
      'fireball', 'ice-spike', 'wind-blade', 'earth-spike',
      'azure-swords', 'spring-art', 'misty-steps', 'great-development', 'gold-insects',
    ]) {
      expect(ids).toContain(required);
    }
  });

  it('rejects unknown effect types', () => {
    expect(() =>
      BuildOptionSchema.parse({
        id: 'bad', name: 'bad', category: 'spell', assetId: 'x', element: 'fire',
        effectType: 'not-registered', maxLevel: 1,
        levels: [{ level: 1, description: 'x' }],
      }),
    ).toThrow(z.ZodError);
  });

  it('rejects discontinuous levels', () => {
    const broken = [{
      ...BUILD_CATALOG[0],
      id: 'broken-spell',
      levels: [
        { level: 1, description: 'a' },
        { level: 3, description: 'b' },
      ],
      maxLevel: 2,
    }];
    expect(() => BuildCatalogSchema.parse(broken)).toThrow();
  });
});

describe('three-choice generation', () => {
  it('is deterministic per seed and state', () => {
    const a = new BuildState(BUILD_CATALOG, alwaysSense);
    const b = new BuildState(BUILD_CATALOG, alwaysSense);
    const choicesA = a.generateChoices(new SeededRng(99));
    const choicesB = b.generateChoices(new SeededRng(99));
    expect(choicesA.map((c) => c.option?.id)).toEqual(choicesB.map((c) => c.option?.id));
  });

  it('offers three distinct options', () => {
    const state = new BuildState(BUILD_CATALOG, alwaysSense);
    const choices = state.generateChoices(new SeededRng(5));
    const ids = choices.map((c) => c.option?.id).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
    expect(choices.length).toBe(3);
  });

  it('excludes maxed options and fills with fallback when pool is small', () => {
    const tiny = BUILD_CATALOG.filter((o) => o.id === 'fireball');
    const state = new BuildState(tiny, alwaysSense);
    const first = state.generateChoices(new SeededRng(1));
    expect(first.filter((c) => c.kind === 'option').length).toBe(1);
    expect(first.filter((c) => c.kind === 'fallback').length).toBe(2);
    for (let i = 0; i < 5; i++) {
      const option = tiny[0];
      if (option && state.levelOf('fireball') < option.maxLevel) state.select(option);
    }
    const after = state.generateChoices(new SeededRng(1));
    expect(after.every((c) => c.kind === 'fallback')).toBe(true);
    for (const c of after) expect(c.fallbackExperience).toBeGreaterThan(0);
  });

  it('excludes new sense-costing options when sense is unavailable', () => {
    const state = new BuildState(BUILD_CATALOG, (cost) => cost === 0);
    for (let i = 0; i < 50; i++) {
      const choices = state.generateChoices(new SeededRng(i));
      for (const c of choices) {
        if (c.option) expect(c.option.senseCost).toBe(0);
      }
    }
  });

  it('select raises levels and caps at max', () => {
    const state = new BuildState(BUILD_CATALOG, alwaysSense);
    const fireball = BUILD_CATALOG.find((o) => o.id === 'fireball');
    if (!fireball) throw new Error('missing fireball');
    for (let i = 1; i <= fireball.maxLevel; i++) {
      expect(state.select(fireball)).toBe(i);
    }
    expect(() => state.select(fireball)).toThrow();
  });
});

describe('passive arts', () => {
  it('spring art grants health regen scaling with level', () => {
    const state = new BuildState(BUILD_CATALOG, alwaysSense);
    const spring = BUILD_CATALOG.find((o) => o.id === 'spring-art');
    if (!spring) throw new Error('missing');
    state.select(spring);
    expect(state.passives.healthRegenPerSecond).toBe(1);
    state.select(spring);
    expect(state.passives.healthRegenPerSecond).toBe(2);
  });

  it('misty steps and great development stack their multipliers', () => {
    const state = new BuildState(BUILD_CATALOG, alwaysSense);
    const misty = BUILD_CATALOG.find((o) => o.id === 'misty-steps');
    const dev = BUILD_CATALOG.find((o) => o.id === 'great-development');
    if (!misty || !dev) throw new Error('missing');
    state.select(misty);
    state.select(dev);
    expect(state.passives.moveSpeedMultiplier).toBeCloseTo(1.08);
    expect(state.passives.cooldownMultiplier).toBeCloseTo(0.94);
  });
});

describe('azure bamboo sword milestones', () => {
  function stateAtLevel(level: number): BuildState {
    const state = new BuildState(BUILD_CATALOG, alwaysSense);
    const swords = BUILD_CATALOG.find((o) => o.id === 'azure-swords');
    if (!swords) throw new Error('missing');
    for (let i = 0; i < level; i++) state.select(swords);
    return state;
  }

  it('12 swords unlock lightning ward', () => {
    const m = stateAtLevel(3).swordMilestones;
    expect(m.swordCount).toBe(12);
    expect(m.lightningWard).toBe(true);
    expect(m.chainLightning).toBe(false);
  });

  it('36 swords unlock chain lightning', () => {
    const m = stateAtLevel(5).swordMilestones;
    expect(m.swordCount).toBe(36);
    expect(m.chainLightning).toBe(true);
    expect(m.ultimateReady).toBe(false);
  });

  it('72 swords unlock the ultimate with 8s duration and 30s cooldown', () => {
    const state = stateAtLevel(6);
    expect(state.swordMilestones.ultimateReady).toBe(true);
    expect(state.tryActivateUltimate()).toBe(true);
    expect(state.ultimateActiveRemaining).toBe(ULTIMATE_DURATION_SECONDS);
    expect(state.tryActivateUltimate()).toBe(false); // active
    state.stepCooldowns(ULTIMATE_DURATION_SECONDS + 0.1);
    expect(state.tryActivateUltimate()).toBe(false); // cooling down
    state.stepCooldowns(ULTIMATE_COOLDOWN_SECONDS);
    expect(state.tryActivateUltimate()).toBe(true);
  });

  it('ultimate is locked below 72 swords', () => {
    expect(stateAtLevel(5).tryActivateUltimate()).toBe(false);
  });

  it('sword config carries evil/ghost bonus tags', () => {
    const swords = BUILD_CATALOG.find((o) => o.id === 'azure-swords');
    expect(swords?.tagBonuses).toContainEqual({ targetTag: 'demonic', multiplier: 1.5 });
    expect(swords?.tagBonuses).toContainEqual({ targetTag: 'ghost', multiplier: 1.5 });
  });
});

describe('gold-devouring insects', () => {
  it('consumes tagged projectiles with probability and grants capped mana', () => {
    let mana = 0;
    const gain = (v: number) => (mana += v);
    const consumed = tryConsumeEffect(
      { tags: ['consumable-projectile'], magnitude: 1 },
      1, 5, new SeededRng(1), gain,
    );
    expect(consumed).toBe(true);
    expect(mana).toBe(5);
  });

  it('never consumes untagged effects', () => {
    let mana = 0;
    const consumed = tryConsumeEffect(
      { tags: ['boss-nova'], magnitude: 1 },
      1, 5, new SeededRng(1), (v) => (mana += v),
    );
    expect(consumed).toBe(false);
    expect(mana).toBe(0);
  });

  it('respects zero probability', () => {
    const consumed = tryConsumeEffect(
      { tags: ['consumable-shield'], magnitude: 1 },
      0, 5, new SeededRng(1), () => {},
    );
    expect(consumed).toBe(false);
  });
});
