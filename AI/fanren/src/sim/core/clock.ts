/** 模拟固定步长频率（Hz）。 */
export const SIM_HZ = 60;
/** 每步秒数。 */
export const SIM_DT = 1 / SIM_HZ;

/**
 * 固定步长模拟时钟：把可变帧时间累积为整步回调。
 * 暂停时不推进；单次 advance 有步数上限以避免死亡螺旋。
 */
export class FixedClock {
  tick = 0;
  paused = false;
  readonly maxStepsPerAdvance = 30;
  private accumulator = 0;

  get elapsedSeconds(): number {
    return this.tick * SIM_DT;
  }

  /** 累积真实帧时间 dtSeconds，并对每个整步调用 step。 */
  advance(dtSeconds: number, step: () => void): void {
    if (this.paused) return;
    this.accumulator += dtSeconds;
    let steps = 0;
    while (this.accumulator >= SIM_DT && steps < this.maxStepsPerAdvance) {
      this.accumulator -= SIM_DT;
      this.tick++;
      steps++;
      step();
    }
    if (steps >= this.maxStepsPerAdvance) {
      this.accumulator = 0;
    }
  }

  /** 测试辅助：精确推进 N 步（忽略暂停上限规则之外的时间累积）。 */
  stepN(n: number, step: () => void): void {
    for (let i = 0; i < n; i++) {
      if (this.paused) return;
      this.tick++;
      step();
    }
  }
}
