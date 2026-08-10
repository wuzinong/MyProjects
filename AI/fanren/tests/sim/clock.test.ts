import { describe, expect, it } from 'vitest';
import { FixedClock, SIM_DT, SIM_HZ } from '@/sim/core/clock';

describe('FixedClock', () => {
  it('uses a 60 Hz fixed step', () => {
    expect(SIM_HZ).toBe(60);
    expect(SIM_DT).toBeCloseTo(1 / 60);
  });

  it('accumulates real time into whole fixed steps', () => {
    const clock = new FixedClock();
    const ticks: number[] = [];
    clock.advance(0.05, () => ticks.push(clock.tick));
    expect(ticks.length).toBe(3); // 0.05s => 3 whole steps at 60 Hz
    expect(clock.tick).toBe(3);
  });

  it('carries the remainder across advances', () => {
    const clock = new FixedClock();
    let steps = 0;
    clock.advance(SIM_DT * 0.6, () => steps++);
    expect(steps).toBe(0);
    clock.advance(SIM_DT * 0.6, () => steps++);
    expect(steps).toBe(1);
  });

  it('does not advance while paused and resumes from the same tick', () => {
    const clock = new FixedClock();
    let steps = 0;
    clock.advance(SIM_DT * 5, () => steps++);
    expect(steps).toBe(5);
    clock.paused = true;
    clock.advance(1, () => steps++);
    expect(steps).toBe(5);
    expect(clock.tick).toBe(5);
    clock.paused = false;
    clock.advance(SIM_DT, () => steps++);
    expect(steps).toBe(6);
  });

  it('clamps huge frame deltas to avoid spiral of death', () => {
    const clock = new FixedClock();
    let steps = 0;
    clock.advance(10, () => steps++); // a 10s hitch must not run 600 steps
    expect(steps).toBeLessThanOrEqual(clock.maxStepsPerAdvance);
  });

  it('elapsed seconds equals tick * dt', () => {
    const clock = new FixedClock();
    clock.advance(SIM_DT * 30, () => {});
    expect(clock.elapsedSeconds).toBeCloseTo(30 * SIM_DT);
  });

  it('stepN test helper advances exactly N ticks', () => {
    const clock = new FixedClock();
    let steps = 0;
    clock.stepN(120, () => steps++);
    expect(steps).toBe(120);
    expect(clock.elapsedSeconds).toBeCloseTo(2);
  });
});
