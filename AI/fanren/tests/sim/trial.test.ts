import { describe, expect, it } from 'vitest';
import { BLOOD_TRIAL, TrialConfigSchema } from '@/content/trial';
import { TrialRun } from '@/sim/trial/run';

describe('Blood Trial configuration', () => {
  it('validates against the schema', () => {
    expect(() => TrialConfigSchema.parse(BLOOD_TRIAL)).not.toThrow();
  });

  it('phases cover 0 to boss spawn without gaps', () => {
    const sorted = [...BLOOD_TRIAL.phases].sort((a, b) => a.startSeconds - b.startSeconds);
    expect(sorted[0]?.startSeconds).toBe(0);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]?.startSeconds).toBe(sorted[i - 1]?.endSeconds);
    }
    expect(sorted[sorted.length - 1]?.endSeconds).toBe(BLOOD_TRIAL.boss.spawnAtSeconds);
  });

  it('every phase enemy id and the boss id exist', () => {
    const ids = new Set(BLOOD_TRIAL.enemies.map((e) => e.id));
    for (const phase of BLOOD_TRIAL.phases) {
      for (const id of phase.enemyIds) expect(ids.has(id)).toBe(true);
    }
    expect(ids.has(BLOOD_TRIAL.boss.enemyId)).toBe(true);
  });
});

describe('TrialRun timeline (accelerated)', () => {
  it('emits phase changes in configured order', () => {
    const phases: string[] = [];
    const run = new TrialRun(BLOOD_TRIAL, 42, { maxHealth: 1e9 }, {
      onPhaseChange: (id) => phases.push(id),
    });
    run.advanceSeconds(500);
    expect(phases).toEqual(['opening', 'pressure', 'elite', 'frenzy']);
  });

  it('spawns enemies according to the active phase', () => {
    const run = new TrialRun(BLOOD_TRIAL, 42, { maxHealth: 1e9 });
    run.advanceSeconds(10);
    const kinds = new Set(run.enemies.map((e) => e.config.id));
    expect(run.enemies.length).toBeGreaterThan(0);
    for (const kind of kinds) {
      expect(['poison-toad', 'black-wind-wolf']).toContain(kind);
    }
  });

  it('fog steps shrink the safe radius at configured times', () => {
    const radii: number[] = [];
    const run = new TrialRun(BLOOD_TRIAL, 1, { maxHealth: 1e9 }, {
      onFogStep: (r) => radii.push(r),
    });
    run.advanceSeconds(481);
    expect(radii.length).toBe(3);
    expect(radii[0]).toBeCloseTo(1024 * 0.7);
    expect(radii[2]).toBeCloseTo(1024 * 0.35);
  });

  it('fog damages a player outside the safe area every tick', () => {
    const run = new TrialRun(BLOOD_TRIAL, 1, { maxHealth: 100000, moveSpeed: 0 });
    run.advanceSeconds(301); // first fog step passed
    run.player.x = 5;
    run.player.y = 5; // far corner, outside safe radius
    const before = run.player.health;
    run.advanceSeconds(5);
    const lost = before - run.player.health;
    expect(lost).toBeGreaterThanOrEqual(4 * BLOOD_TRIAL.fogDamagePerTick);
  });

  it('boss spawns at 9:50 and stops normal phases', () => {
    let bossSpawned = false;
    const run = new TrialRun(BLOOD_TRIAL, 7, { maxHealth: 1e9 }, {
      onBossSpawn: () => (bossSpawned = true),
    });
    run.advanceSeconds(591);
    expect(bossSpawned).toBe(true);
    expect(run.phase).toBe('boss');
    expect(run.boss).not.toBeNull();
  });

  it('boss telegraphs precede damage and only hit players in range', () => {
    const telegraphs: string[] = [];
    const run = new TrialRun(BLOOD_TRIAL, 7, { maxHealth: 1e9, moveSpeed: 0 }, {
      onTelegraph: (t) => telegraphs.push(t.kind),
    });
    run.advanceSeconds(592);
    // keep player at safe-area center and move the boss far away:
    // telegraphs resolve without hitting an out-of-range player
    run.player.x = BLOOD_TRIAL.worldSize / 2;
    run.player.y = BLOOD_TRIAL.worldSize / 2;
    if (run.boss) {
      run.boss.x = 1;
      run.boss.y = 1;
    }
    // remove leftover normal enemies so only telegraph damage could apply
    for (const enemy of run.enemies) {
      if (enemy !== run.boss) enemy.alive = false;
    }
    const before = run.player.health;
    run.advanceSeconds(8);
    expect(telegraphs.length).toBeGreaterThan(0);
    expect(run.player.health).toBe(before); // out of range: no telegraph damage
  });

  it('killing elites drops a treasure box that yields a talisman once', () => {
    const run = new TrialRun(BLOOD_TRIAL, 3, { maxHealth: 1e9 });
    const spider = run.enemies.find((e) => e.config.elite) ??
      (() => {
        // force-spawn an elite for the test
        const config = BLOOD_TRIAL.enemies.find((e) => e.id === 'blood-jade-spider');
        if (!config) throw new Error('missing spider');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (run as any).spawnEnemy(config);
      })();
    spider.x = run.player.x;
    spider.y = run.player.y;
    run.damageEnemy(spider, 10000);
    run.advanceSeconds(0.1);
    expect(run.talismans).toContain('talisman-golden-brick');
  });

  it('golden brick talisman clears normal enemies and is single-use', () => {
    const run = new TrialRun(BLOOD_TRIAL, 3, { maxHealth: 1e9 });
    run.advanceSeconds(30);
    run.talismans.push('talisman-golden-brick');
    const aliveBefore = run.enemies.filter((e) => e.alive).length;
    expect(aliveBefore).toBeGreaterThan(0);
    expect(run.useTalisman(0)).toBe(true);
    expect(run.enemies.filter((e) => e.alive && !e.config.tags.includes('boss')).length).toBe(0);
    expect(run.useTalisman(0)).toBe(false);
  });

  it('player death produces a defeat result exactly once with partial rewards', () => {
    const results: string[] = [];
    const run = new TrialRun(BLOOD_TRIAL, 5, { maxHealth: 10 }, {
      onResult: (r) => results.push(r.outcome),
    });
    run.player.applyDamage(10, 'fog');
    run.player.applyDamage(10, 'fog');
    run.advanceSeconds(1);
    expect(results).toEqual(['defeat']);
    expect(run.result?.outcome).toBe('defeat');
    const fullReward = BLOOD_TRIAL.victoryRewards['spirit-stone-low'] ?? 0;
    expect(run.result?.rewards['spirit-stone-low']).toBe(Math.floor(fullReward * BLOOD_TRIAL.defeatRewardFraction));
  });

  it('killing the boss produces a victory result exactly once with full rewards', () => {
    const results: string[] = [];
    const run = new TrialRun(BLOOD_TRIAL, 9, { maxHealth: 1e9 }, {
      onResult: (r) => results.push(r.outcome),
    });
    run.advanceSeconds(591);
    const boss = run.boss;
    expect(boss).not.toBeNull();
    if (boss) {
      run.damageEnemy(boss, 1e9);
      run.damageEnemy(boss, 1e9);
    }
    expect(results).toEqual(['victory']);
    // 胜利奖励包含配置奖励 + 局内灵石（含首领 500）
    const baseStones = BLOOD_TRIAL.victoryRewards['spirit-stone-low'] ?? 0;
    expect(run.result?.rewards['spirit-stone-low'] ?? 0).toBeGreaterThanOrEqual(baseStones + 500);
    expect(run.result?.rewards['herb-blood-spirit']).toBe(BLOOD_TRIAL.victoryRewards['herb-blood-spirit']);
    // frozen after result
    const elapsed = run.elapsedSeconds;
    run.advanceSeconds(5);
    expect(run.elapsedSeconds).toBe(elapsed);
  });

  it('run ids are stable per seed for reload safety', () => {
    const a = new TrialRun(BLOOD_TRIAL, 12);
    const b = new TrialRun(BLOOD_TRIAL, 12);
    expect(a.runId).toBe(b.runId);
  });

  it('experience gain levels the player at thresholds', () => {
    const run = new TrialRun(BLOOD_TRIAL, 2, { maxHealth: 1e9 });
    const levels: number[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (run as any).events.onLevelUp = (l: number) => levels.push(l);
    run.gainExperience(1000);
    expect(run.level).toBeGreaterThan(3);
    expect(run.pendingLevelUps).toBe(run.level - 1);
  });
});
