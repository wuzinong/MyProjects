import { describe, expect, it } from 'vitest';
import { CURRENT_SAVE_VERSION, SaveStore, defaultSave, type StorageLike } from '@/persistence/save';
import {
  breakthrough, claimRunRewards, matureHerb, realmBonuses, refinePill, settleOffline,
} from '@/persistence/progression';
import { SeededRng } from '@/sim/core/rng';
import type { RunResult } from '@/sim/trial/run';

class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

const HOUR = 3_600_000;

describe('SaveStore', () => {
  it('creates a fresh default save when storage is empty', () => {
    const store = new SaveStore(new MemoryStorage(), () => 1000);
    const result = store.load();
    expect(result.status).toBe('fresh');
    if (result.status === 'fresh') {
      expect(result.save.version).toBe(CURRENT_SAVE_VERSION);
      expect(result.save.unlockedTrials).toContain('blood-trial');
    }
  });

  it('round-trips a persisted save', () => {
    const storage = new MemoryStorage();
    const store = new SaveStore(storage, () => 1000);
    const save = defaultSave(1000);
    save.greenLiquid = 7;
    save.inventory['pill-zhuji'] = 2;
    expect(store.persist(save)).toBe(true);
    const loaded = store.load();
    expect(loaded.status).toBe('ok');
    if (loaded.status === 'ok') {
      expect(loaded.save.greenLiquid).toBe(7);
      expect(loaded.save.inventory['pill-zhuji']).toBe(2);
    }
  });

  it('migrates versionless legacy saves to the current version', () => {
    const storage = new MemoryStorage();
    storage.setItem('fanren-save', JSON.stringify({ greenLiquid: 3 }));
    const result = new SaveStore(storage, () => 1000).load();
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.save.version).toBe(CURRENT_SAVE_VERSION);
      expect(result.save.greenLiquid).toBe(3);
    }
  });

  it('recovers from corrupt JSON without crashing', () => {
    const storage = new MemoryStorage();
    storage.setItem('fanren-save', '{not-json');
    const result = new SaveStore(storage, () => 1000).load();
    expect(result.status).toBe('corrupt-recovered');
  });

  it('refuses to load or overwrite newer save versions', () => {
    const storage = new MemoryStorage();
    storage.setItem('fanren-save', JSON.stringify({ version: CURRENT_SAVE_VERSION + 5 }));
    const store = new SaveStore(storage, () => 1000);
    const result = store.load();
    expect(result.status).toBe('newer-version');
    expect(store.persist(defaultSave(1000))).toBe(false);
    expect(JSON.parse(storage.getItem('fanren-save') ?? '{}').version).toBe(CURRENT_SAVE_VERSION + 5);
  });
});

describe('heaven vial offline settlement', () => {
  it('accumulates one drop per hour up to capacity', () => {
    const save = defaultSave(0);
    const result = settleOffline(save, 5 * HOUR);
    expect(result.drops).toBe(5);
    expect(save.greenLiquid).toBe(5);
  });

  it('caps a single settlement at 12 hours', () => {
    const save = defaultSave(0);
    const result = settleOffline(save, 14 * HOUR);
    expect(result.cappedHours).toBe(12);
    expect(save.greenLiquid).toBe(12);
  });

  it('never exceeds the 12-drop capacity', () => {
    const save = defaultSave(0);
    save.greenLiquid = 10;
    settleOffline(save, 12 * HOUR);
    expect(save.greenLiquid).toBe(12);
  });

  it('grants zero drops and flags clock rollback', () => {
    const save = defaultSave(10 * HOUR);
    const result = settleOffline(save, 5 * HOUR);
    expect(result.clockRollback).toBe(true);
    expect(result.drops).toBe(0);
    expect(save.greenLiquid).toBe(0);
  });
});

describe('herb maturation and alchemy', () => {
  it('matures an herb atomically when liquid suffices', () => {
    const save = defaultSave(0);
    save.greenLiquid = 5;
    const result = matureHerb(save, 'herb-jiuqu-ginseng');
    expect(result.ok).toBe(true);
    expect(save.greenLiquid).toBe(1);
    expect(save.inventory['herb-jiuqu-ginseng']).toBe(1);
  });

  it('rejects maturation with insufficient liquid and changes nothing', () => {
    const save = defaultSave(0);
    save.greenLiquid = 1;
    const result = matureHerb(save, 'herb-jiuqu-ginseng');
    expect(result.ok).toBe(false);
    expect(save.greenLiquid).toBe(1);
    expect(save.inventory['herb-jiuqu-ginseng']).toBeUndefined();
  });

  it('refines the foundation pill consuming materials exactly once', () => {
    const save = defaultSave(0);
    save.inventory['herb-blood-spirit'] = 2;
    save.inventory['herb-jiuqu-ginseng'] = 1;
    const outcome = refinePill(save, 'pill-zhuji', new SeededRng(1));
    expect(outcome.ok).toBe(true);
    expect(save.inventory['herb-blood-spirit']).toBe(0);
    expect(save.inventory['herb-jiuqu-ginseng']).toBe(0);
    const produced = outcome.produced;
    expect(produced === 'pill-zhuji' || produced === 'pill-waste').toBe(true);
    expect(save.inventory[produced as string]).toBe(1);
  });

  it('rejects refining without materials', () => {
    const save = defaultSave(0);
    const outcome = refinePill(save, 'pill-zhuji', new SeededRng(1));
    expect(outcome.ok).toBe(false);
  });
});

describe('realm breakthrough', () => {
  it('consumes the pill, raises the realm, and unlocks content', () => {
    const save = defaultSave(0);
    save.inventory['pill-zhuji'] = 1;
    const result = breakthrough(save);
    expect(result.ok).toBe(true);
    expect(save.realmIndex).toBe(1);
    expect(save.inventory['pill-zhuji']).toBe(0);
    expect(realmBonuses(save).startingHealthBonus).toBe(40);
    expect(realmBonuses(save).startingSkillSlots).toBe(2);
  });

  it('fails without the required pill', () => {
    const save = defaultSave(0);
    expect(breakthrough(save).ok).toBe(false);
    expect(save.realmIndex).toBe(0);
  });
});

describe('run reward claiming', () => {
  const result: RunResult = {
    runId: 'blood-trial-42',
    outcome: 'victory',
    survivedSeconds: 600,
    kills: 500,
    level: 12,
    rewards: { 'spirit-stone-low': 60 },
  };

  it('claims rewards exactly once per run id', () => {
    const save = defaultSave(0);
    expect(claimRunRewards(save, result)).toBe(true);
    expect(claimRunRewards(save, result)).toBe(false);
    expect(save.inventory['spirit-stone-low']).toBe(60);
  });

  it('claim state survives a persist/load cycle (reload safety)', () => {
    const storage = new MemoryStorage();
    const store = new SaveStore(storage, () => 1000);
    const save = defaultSave(0);
    claimRunRewards(save, result);
    store.persist(save);
    const loaded = store.load();
    if (loaded.status !== 'ok') throw new Error('load failed');
    expect(claimRunRewards(loaded.save, result)).toBe(false);
    expect(loaded.save.inventory['spirit-stone-low']).toBe(60);
  });
});
