/**
 * 确定性伪随机数生成器（mulberry32 变体）。
 * 战斗模拟内所有随机行为必须通过 SeededRng，禁止 Math.random。
 */
export class SeededRng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
    if (this.state === 0) this.state = 0x9e3779b9;
  }

  /** 返回 [0, 1) 的浮点数。 */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** 返回 [min, max] 内的整数（含端点）。 */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** 返回 [min, max) 内的浮点数。 */
  float(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** 以概率 p 返回 true；p<=0 恒为 false，p>=1 恒为 true。 */
  chance(p: number): boolean {
    if (p <= 0) return false;
    if (p >= 1) return true;
    return this.next() < p;
  }

  /** 从非空数组中确定性选取一个元素。 */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('SeededRng.pick: empty list');
    return items[Math.floor(this.next() * items.length)] as T;
  }

  /**
   * 派生一个独立的确定性子流。
   * 子流消耗自身状态，不影响父流后续序列。
   */
  fork(label: string): SeededRng {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < label.length; i++) {
      h = Math.imul(h ^ label.charCodeAt(i), 16777619);
    }
    return new SeededRng((this.state ^ h) >>> 0);
  }
}
