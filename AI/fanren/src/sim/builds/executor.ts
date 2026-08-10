/** 技能执行器：把构筑状态接到 TrialRun（自动索敌施法、被动、飞剑、虫群、大庚剑阵）。 */
import type { TrialRun, EnemyInstance } from '@/sim/trial/run';
import { BuildState, ULTIMATE_DPS_MULTIPLIER } from '@/sim/builds/state';
import { BUILD_CATALOG } from '@/content/builds';
import { CastScheduler, selectTarget } from '@/sim/combat/targeting';
import { resolveDamage, type Element } from '@/sim/combat/damage';
import { SeededRng } from '@/sim/core/rng';
import { SIM_DT } from '@/sim/core/clock';

export class SkillExecutor {
  readonly builds: BuildState;
  private scheduler = new CastScheduler();
  private rng: SeededRng;
  private ultimateTickAccumulator = 0;

  constructor(private readonly run: TrialRun, seed: number) {
    this.rng = new SeededRng(seed ^ 0x5eed);
    this.builds = new BuildState(
      BUILD_CATALOG,
      (cost, id) => this.run.player.occupySense(cost, id),
    );
  }

  /** 每个固定步调用一次。 */
  step(): void {
    const passives = this.builds.passives;
    this.scheduler.step(SIM_DT);
    this.builds.stepCooldowns(SIM_DT);
    if (passives.healthRegenPerSecond > 0) {
      this.run.player.heal(passives.healthRegenPerSecond * SIM_DT);
    }
    for (const [id, level] of this.builds.owned) {
      const option = BUILD_CATALOG.find((o) => o.id === id);
      if (!option || option.effectType === 'passive-stats') continue;
      const data = option.levels[level - 1];
      if (!data || data.damage === undefined) continue;
      const cooldown = (data.cooldownSeconds ?? 1) * passives.cooldownMultiplier;
      const manaCost = data.manaCost ?? 0;
      const range = data.range ?? 250;
      const target = selectTarget(
        this.run.enemies, this.run.player.x, this.run.player.y, range,
        option.effectType === 'summon-insects' ? 'elite' : undefined,
      ) ?? (option.effectType === 'summon-insects'
        ? selectTarget(this.run.enemies, this.run.player.x, this.run.player.y, range, 'boss')
        : null);
      if (!target) continue;
      const cast = this.scheduler.tryCast(id, cooldown, manaCost, (cost) =>
        this.run.player.spendMana(cost),
      );
      if (!cast) continue;
      this.run.fx.push({
        kind: 'projectile',
        fromX: this.run.player.x, fromY: this.run.player.y,
        toX: target.x, toY: target.y,
        element: option.element as Element,
        speed: option.effectType === 'orbiting-swords' ? 660 : 430,
      });
      if (option.effectType === 'aoe-burst') {
        this.run.fx.push({ kind: 'aoe', x: target.x, y: target.y, radius: 100, element: option.element as Element });
      }
      this.applyHit(option.id, option.element as Element, data.damage, target);
      if (option.effectType === 'aoe-burst') {
        for (const enemy of this.run.enemies) {
          if (enemy === target || !enemy.alive) continue;
          const dx = enemy.x - target.x;
          const dy = enemy.y - target.y;
          if (dx * dx + dy * dy <= 100 * 100) this.applyHit(option.id, option.element as Element, data.damage * 0.6, enemy);
        }
      }
      if (option.effectType === 'orbiting-swords' && this.builds.swordMilestones.chainLightning) {
        let chained = 0;
        for (const enemy of this.run.enemies) {
          if (chained >= 5 || enemy === target || !enemy.alive) continue;
          const dx = enemy.x - target.x;
          const dy = enemy.y - target.y;
          if (dx * dx + dy * dy <= 160 * 160) {
            this.applyHit(option.id, 'lightning', data.damage * 0.5, enemy);
            chained++;
          }
        }
      }
    }
    this.stepUltimate();
  }

  private stepUltimate(): void {
    if (this.builds.swordMilestones.ultimateReady && this.builds.ultimateActiveRemaining === 0) {
      if (this.builds.tryActivateUltimate()) this.run.fx.push({ kind: 'ultimate-start' });
    }
    if (this.builds.ultimateActiveRemaining <= 0) return;
    this.ultimateTickAccumulator += SIM_DT;
    if (this.ultimateTickAccumulator < 0.25) return;
    this.ultimateTickAccumulator -= 0.25;
    const option = BUILD_CATALOG.find((o) => o.id === 'azure-swords');
    const level = this.builds.levelOf('azure-swords');
    const damage = (option?.levels[level - 1]?.damage ?? 50) * ULTIMATE_DPS_MULTIPLIER * 0.25;
    for (const enemy of this.run.enemies) {
      if (enemy.alive) {
        this.applyHit('azure-swords', 'lightning', damage, enemy);
        enemy.status.apply({ kind: 'slow', duration: 0.3, magnitude: 0.05 });
      }
    }
  }

  private applyHit(sourceId: string, element: Element, amount: number, enemy: EnemyInstance): void {
    const option = BUILD_CATALOG.find((o) => o.id === sourceId);
    const result = resolveDamage(
      {
        amount,
        channel: 'magical',
        element,
        sourceTags: [sourceId],
        critChance: 0.05,
        critMultiplier: 2,
        tagBonuses: option?.tagBonuses,
      },
      {
        physicalDefense: enemy.config.physicalDefense,
        magicalDefense: enemy.config.magicalDefense,
        spiritualDefense: enemy.config.spiritualDefense,
        element: enemy.config.element as Element,
        tags: enemy.config.tags,
        statusModifiers: enemy.status.modifiers,
      },
      this.rng,
    );
    this.run.damageEnemy(enemy, result.finalAmount);
    this.run.fx.push({
      kind: 'hit', x: enemy.x, y: enemy.y, element,
      amount: Math.round(result.finalAmount), crit: result.breakdown.wasCrit,
    });
    if (sourceId === 'ice-spike') {
      enemy.status.apply({ kind: 'slow', duration: 1.5, magnitude: 0.5 });
    }
    if (sourceId === 'azure-swords' && this.builds.swordMilestones.lightningWard && this.rng.chance(0.25)) {
      enemy.status.apply({ kind: 'paralyze', duration: 0.5, magnitude: 1 });
    }
  }
}
