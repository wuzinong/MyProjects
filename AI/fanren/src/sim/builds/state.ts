/** 构筑状态：三选一生成、升级应用、飞剑里程碑与噬金虫吞噬。 */
import type { SeededRng } from '@/sim/core/rng';
import type { BuildOption } from '@/content/builds';

export interface BuildChoice {
  kind: 'option' | 'fallback';
  option?: BuildOption;
  /** fallback 资源奖励（灵气）。 */
  fallbackExperience?: number;
}

export interface SwordMilestones {
  swordCount: number;
  lightningWard: boolean;
  chainLightning: boolean;
  ultimateReady: boolean;
}

export const ULTIMATE_DURATION_SECONDS = 8;
export const ULTIMATE_COOLDOWN_SECONDS = 30;
export const ULTIMATE_DPS_MULTIPLIER = 3.5;

export class BuildState {
  private levels: Map<string, number> = new Map();
  private ultimateCooldown = 0;
  ultimateActiveRemaining = 0;

  constructor(
    private readonly catalog: readonly BuildOption[],
    private readonly senseAvailable: (cost: number, id: string) => boolean,
    private readonly realmIndex = 0,
  ) {}

  levelOf(id: string): number {
    return this.levels.get(id) ?? 0;
  }

  get owned(): ReadonlyArray<[string, number]> {
    return [...this.levels.entries()];
  }

  /** 生成三个不同的候选（确定性）；不足时用 fallback 灵气补齐。 */
  generateChoices(rng: SeededRng): BuildChoice[] {
    const eligible = this.catalog.filter((option) => {
      if (option.requiresRealmIndex > this.realmIndex) return false;
      const level = this.levelOf(option.id);
      if (level >= option.maxLevel) return false;
      if (level === 0 && option.senseCost > 0 && !this.senseAvailable(option.senseCost, option.id)) return false;
      return true;
    });

    const picked: BuildOption[] = [];
    const pool = [...eligible];
    while (picked.length < 3 && pool.length > 0) {
      const totalWeight = pool.reduce((sum, o) => sum + o.weight, 0);
      let roll = rng.float(0, totalWeight);
      let index = 0;
      for (let i = 0; i < pool.length; i++) {
        roll -= (pool[i] as BuildOption).weight;
        if (roll <= 0) {
          index = i;
          break;
        }
      }
      picked.push(pool[index] as BuildOption);
      pool.splice(index, 1);
    }

    const choices: BuildChoice[] = picked.map((option) => ({ kind: 'option', option }));
    while (choices.length < 3) {
      choices.push({ kind: 'fallback', fallbackExperience: 20 });
    }
    return choices;
  }

  /** 应用选择，返回新等级。 */
  select(option: BuildOption): number {
    const current = this.levelOf(option.id);
    if (current >= option.maxLevel) throw new Error(`${option.id} 已满级`);
    const next = current + 1;
    this.levels.set(option.id, next);
    return next;
  }

  /** 心法被动汇总。 */
  get passives() {
    let healthRegenPerSecond = 0;
    let moveSpeedMultiplier = 1;
    let cooldownMultiplier = 1;
    for (const [id, level] of this.levels) {
      const option = this.catalog.find((o) => o.id === id);
      if (!option || option.effectType !== 'passive-stats') continue;
      const data = option.levels[level - 1];
      if (!data) continue;
      if (id === 'spring-art') healthRegenPerSecond = data.magnitude ?? 0;
      if (id === 'misty-steps') moveSpeedMultiplier = 1 + (data.magnitude ?? 0);
      if (id === 'great-development') cooldownMultiplier = 1 - (data.magnitude ?? 0);
    }
    return { healthRegenPerSecond, moveSpeedMultiplier, cooldownMultiplier };
  }

  /** 青竹蜂云剑里程碑（剑意层数 = 配置 magnitude）。 */
  get swordMilestones(): SwordMilestones {
    const option = this.catalog.find((o) => o.id === 'azure-swords');
    const level = this.levelOf('azure-swords');
    const swordCount = level > 0 && option ? (option.levels[level - 1]?.magnitude ?? 0) : 0;
    return {
      swordCount,
      lightningWard: swordCount >= 12,
      chainLightning: swordCount >= 36,
      ultimateReady: swordCount >= 72,
    };
  }

  stepCooldowns(dt: number): void {
    this.ultimateCooldown = Math.max(0, this.ultimateCooldown - dt);
    this.ultimateActiveRemaining = Math.max(0, this.ultimateActiveRemaining - dt);
  }

  /** 触发大庚剑阵：需 72 口且冷却完成。 */
  tryActivateUltimate(): boolean {
    if (!this.swordMilestones.ultimateReady) return false;
    if (this.ultimateCooldown > 0 || this.ultimateActiveRemaining > 0) return false;
    this.ultimateActiveRemaining = ULTIMATE_DURATION_SECONDS;
    this.ultimateCooldown = ULTIMATE_COOLDOWN_SECONDS;
    return true;
  }
}

export interface ConsumableEffect {
  tags: string[];
  magnitude: number;
}

/** 噬金虫吞噬判定：可吞噬标签 + 概率 → 转化法力。 */
export function tryConsumeEffect(
  effect: ConsumableEffect,
  consumeChance: number,
  manaPerConsume: number,
  rng: SeededRng,
  gainMana: (amount: number) => void,
): boolean {
  const consumable =
    effect.tags.includes('consumable-projectile') || effect.tags.includes('consumable-shield');
  if (!consumable) return false;
  if (!rng.chance(consumeChance)) return false;
  gainMana(manaPerConsume);
  return true;
}
