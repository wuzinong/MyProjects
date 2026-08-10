/** 统一伤害管线：通道防御 → 五行克制 → 标签加成 → 暴击 → 状态修正。 */
import type { SeededRng } from '@/sim/core/rng';

export type DamageChannel = 'physical' | 'magical' | 'spiritual';
export type Element = 'none' | 'metal' | 'wood' | 'water' | 'fire' | 'earth' | 'wind' | 'lightning' | 'ice';

export interface TagBonus {
  targetTag: string;
  multiplier: number;
}

export interface DamageEvent {
  amount: number;
  channel: DamageChannel;
  element: Element;
  sourceTags: string[];
  critChance: number;
  critMultiplier: number;
  tagBonuses?: TagBonus[];
}

export interface StatusModifiers {
  damageTakenMultiplier: number;
  armorBreakFlat: number;
}

export interface DefenderProfile {
  physicalDefense: number;
  magicalDefense: number;
  spiritualDefense: number;
  element: Element;
  tags: string[];
  statusModifiers: StatusModifiers;
}

export interface DamageBreakdown {
  base: number;
  afterDefense: number;
  elementMultiplier: number;
  tagMultiplier: number;
  wasCrit: boolean;
  statusMultiplier: number;
}

export interface DamageResult {
  finalAmount: number;
  breakdown: DamageBreakdown;
}

/** 五行克制矩阵：火克金、金克木、木克土、土克水、水克火。风/雷/冰无基础克制。 */
export const DEFAULT_ELEMENT_MATRIX = {
  advantageMultiplier: 1.3,
  disadvantageMultiplier: 0.8,
  beats: {
    fire: 'metal',
    metal: 'wood',
    wood: 'earth',
    earth: 'water',
    water: 'fire',
  } as Partial<Record<Element, Element>>,
};

export function elementMultiplier(
  attacker: Element,
  defender: Element,
  matrix = DEFAULT_ELEMENT_MATRIX,
): number {
  if (matrix.beats[attacker] === defender) return matrix.advantageMultiplier;
  if (matrix.beats[defender] === attacker) return matrix.disadvantageMultiplier;
  return 1;
}

export function resolveDamage(
  event: DamageEvent,
  defender: DefenderProfile,
  rng: SeededRng,
  matrix = DEFAULT_ELEMENT_MATRIX,
): DamageResult {
  const defense =
    event.channel === 'physical'
      ? defender.physicalDefense
      : event.channel === 'magical'
        ? defender.magicalDefense
        : defender.spiritualDefense;
  const effectiveDefense = Math.max(0, defense - defender.statusModifiers.armorBreakFlat);
  const afterDefense = Math.max(1, event.amount - effectiveDefense);

  const elemMult = elementMultiplier(event.element, defender.element, matrix);

  let tagMult = 1;
  if (event.tagBonuses) {
    for (const bonus of event.tagBonuses) {
      if (defender.tags.includes(bonus.targetTag)) tagMult *= bonus.multiplier;
    }
  }

  const wasCrit = rng.chance(event.critChance);
  const critMult = wasCrit ? event.critMultiplier : 1;
  const statusMult = defender.statusModifiers.damageTakenMultiplier;

  const finalAmount = afterDefense * elemMult * tagMult * critMult * statusMult;
  return {
    finalAmount,
    breakdown: {
      base: event.amount,
      afterDefense,
      elementMultiplier: elemMult,
      tagMultiplier: tagMult,
      wasCrit,
      statusMultiplier: statusMult,
    },
  };
}
