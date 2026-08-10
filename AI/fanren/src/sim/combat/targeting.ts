/** 自动索敌与施法调度：最近目标、标签过滤、冷却与资源门禁。 */
export interface Targetable {
  id: number;
  x: number;
  y: number;
  tags: string[];
  alive: boolean;
}

export function selectTarget<T extends Targetable>(
  candidates: readonly T[],
  x: number,
  y: number,
  range: number,
  requiredTag: string | undefined,
): T | null {
  let best: T | null = null;
  let bestDist = range * range;
  for (const c of candidates) {
    if (!c.alive) continue;
    if (requiredTag && !c.tags.includes(requiredTag)) continue;
    const dx = c.x - x;
    const dy = c.y - y;
    const d2 = dx * dx + dy * dy;
    if (d2 <= bestDist) {
      bestDist = d2;
      best = c;
    }
  }
  return best;
}

export class CastScheduler {
  private cooldowns: Map<string, number> = new Map();

  step(dt: number): void {
    for (const [key, value] of this.cooldowns) {
      const next = value - dt;
      if (next <= 0) this.cooldowns.delete(key);
      else this.cooldowns.set(key, next);
    }
  }

  ready(skillId: string): boolean {
    return !this.cooldowns.has(skillId);
  }

  /** 冷却完成且资源扣除成功才进入冷却并返回 true。 */
  tryCast(
    skillId: string,
    cooldownSeconds: number,
    manaCost: number,
    trySpendMana: (cost: number) => boolean,
  ): boolean {
    if (!this.ready(skillId)) return false;
    if (!trySpendMana(manaCost)) return false;
    this.cooldowns.set(skillId, cooldownSeconds);
    return true;
  }
}
