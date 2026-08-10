import { describe, expect, it } from 'vitest';
import { TrialRun } from '@/sim/trial/run';
import { BLOOD_TRIAL } from '@/content/trial';
import { SkillExecutor } from '@/sim/builds/executor';
import { BUILD_CATALOG } from '@/content/builds';
import { SpatialGrid } from '@/sim/core/grid';

/**
 * 压力基准（任务 8.2/8.3）：500+ 活跃敌人下模拟步耗与内存稳定性。
 * 基准档案: Node（V8）单线程；60Hz 预算 = 16.67ms/步，其中模拟目标 ≤ 8ms。
 */
describe('stress fixture: 500 enemies', () => {
  function makeStressedRun(): { run: TrialRun; executor: SkillExecutor } {
    const run = new TrialRun(BLOOD_TRIAL, 1234, { maxHealth: 1e9 });
    const executor = new SkillExecutor(run, 1234);
    for (const id of ['fireball', 'ice-spike', 'wind-blade', 'earth-spike', 'azure-swords', 'gold-insects']) {
      const option = BUILD_CATALOG.find((o) => o.id === id);
      if (!option) continue;
      for (let i = 0; i < option.maxLevel; i++) executor.builds.select(option);
    }
    // 直接生成 500 敌人
    const config = BLOOD_TRIAL.enemies.find((e) => e.id === 'gold-ant-swarm');
    if (!config) throw new Error('missing enemy');
    for (let i = 0; i < 500; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (run as any).spawnEnemy(config);
    }
    return { run, executor };
  }

  it('sustains 500 active enemies within the simulation step budget', () => {
    const { run, executor } = makeStressedRun();
    expect(run.enemies.filter((e) => e.alive).length).toBeGreaterThanOrEqual(500);
    // 预热
    for (let i = 0; i < 60; i++) {
      run.step();
      executor.step();
    }
    const start = performance.now();
    const steps = 600; // 10 秒模拟
    for (let i = 0; i < steps; i++) {
      run.step();
      executor.step();
    }
    const elapsed = performance.now() - start;
    const msPerStep = elapsed / steps;
    // 模拟步预算 8ms（渲染另计）
    expect(msPerStep).toBeLessThan(8);
  }, 30000);

  it('does not grow memory monotonically across simulation batches', () => {
    const { run, executor } = makeStressedRun();
    const samples: number[] = [];
    for (let batch = 0; batch < 5; batch++) {
      for (let i = 0; i < 300; i++) {
        run.step();
        executor.step();
      }
      global.gc?.();
      samples.push(process.memoryUsage().heapUsed);
    }
    const first = samples[1] ?? 0; // 跳过首批（缓存建立）
    const last = samples[samples.length - 1] ?? 0;
    // 允许波动，但不允许 5 批内增长超过 50%
    expect(last).toBeLessThan(first * 1.5 + 20 * 1024 * 1024);
  }, 30000);

  it('spatial grid queries stay fast at 1500 entities', () => {
    const grid = new SpatialGrid(64, 2048);
    for (let i = 0; i < 1500; i++) {
      grid.insert(i, (i * 37) % 2048, (i * 91) % 2048);
    }
    const start = performance.now();
    let total = 0;
    for (let q = 0; q < 1000; q++) {
      grid.queryCircle((q * 17) % 2048, (q * 29) % 2048, 200, () => total++);
    }
    const elapsed = performance.now() - start;
    expect(total).toBeGreaterThan(0);
    expect(elapsed / 1000).toBeLessThan(1); // 每次查询 < 1ms
  });
});
