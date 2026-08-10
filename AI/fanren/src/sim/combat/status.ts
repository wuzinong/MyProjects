/** 计时状态系统：减速、麻痹、破甲、易伤、护盾，支持免疫标签。 */
import type { StatusModifiers } from './damage';

export type StatusKind = 'slow' | 'paralyze' | 'armorBreak' | 'vulnerable' | 'shield';

export interface StatusEffect {
  kind: StatusKind;
  duration: number;
  magnitude: number;
}

interface ActiveStatus extends StatusEffect {
  remaining: number;
}

export class StatusTracker {
  private active: ActiveStatus[] = [];

  constructor(private readonly immunities: readonly StatusKind[] = []) {}

  apply(effect: StatusEffect): void {
    if (this.immunities.includes(effect.kind)) return;
    this.active.push({ ...effect, remaining: effect.duration });
  }

  step(dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const s = this.active[i] as ActiveStatus;
      s.remaining -= dt;
      if (s.remaining <= 0) {
        this.active[i] = this.active[this.active.length - 1] as ActiveStatus;
        this.active.pop();
      }
    }
  }

  get speedMultiplier(): number {
    let mult = 1;
    for (const s of this.active) {
      if (s.kind === 'slow') mult = Math.min(mult, s.magnitude);
    }
    return this.paralyzed ? 0 : mult;
  }

  get paralyzed(): boolean {
    return this.active.some((s) => s.kind === 'paralyze');
  }

  get shieldRemaining(): number {
    let total = 0;
    for (const s of this.active) {
      if (s.kind === 'shield') total += s.magnitude;
    }
    return total;
  }

  /** 用护盾吸收伤害，返回穿透护盾的剩余伤害。 */
  absorbDamage(amount: number): number {
    let remaining = amount;
    for (const s of this.active) {
      if (s.kind !== 'shield' || remaining <= 0) continue;
      const absorbed = Math.min(s.magnitude, remaining);
      s.magnitude -= absorbed;
      remaining -= absorbed;
      if (s.magnitude <= 0) s.remaining = 0;
    }
    this.step(0);
    return remaining;
  }

  get modifiers(): StatusModifiers {
    let armorBreak = 0;
    let taken = 1;
    for (const s of this.active) {
      if (s.kind === 'armorBreak') armorBreak = Math.max(armorBreak, s.magnitude);
      if (s.kind === 'vulnerable') taken = Math.max(taken, s.magnitude);
    }
    return { damageTakenMultiplier: taken, armorBreakFlat: armorBreak };
  }
}
