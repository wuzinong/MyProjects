import { describe, expect, it } from 'vitest';
import { SeededRng } from '@/sim/core/rng';

describe('SeededRng', () => {
  it('produces identical sequences for identical seeds', () => {
    const a = new SeededRng(12345);
    const b = new SeededRng(12345);
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = new SeededRng(1);
    const b = new SeededRng(2);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).not.toEqual(seqB);
  });

  it('next() returns floats in [0, 1)', () => {
    const rng = new SeededRng(42);
    for (let i = 0; i < 1000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int(min, max) is inclusive and within bounds', () => {
    const rng = new SeededRng(7);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const v = rng.int(3, 6);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(6);
      seen.add(v);
    }
    expect(seen.size).toBe(4);
  });

  it('chance(p) respects 0 and 1 extremes', () => {
    const rng = new SeededRng(9);
    for (let i = 0; i < 50; i++) {
      expect(rng.chance(0)).toBe(false);
      expect(rng.chance(1)).toBe(true);
    }
  });

  it('pick selects only elements from the list deterministically', () => {
    const a = new SeededRng(100);
    const b = new SeededRng(100);
    const items = ['x', 'y', 'z'];
    for (let i = 0; i < 30; i++) {
      const va = a.pick(items);
      expect(items).toContain(va);
      expect(b.pick(items)).toBe(va);
    }
  });

  it('fork creates an independent deterministic stream', () => {
    const a = new SeededRng(555);
    const forkA = a.fork('wave');
    const b = new SeededRng(555);
    const forkB = b.fork('wave');
    expect(Array.from({ length: 10 }, () => forkA.next())).toEqual(
      Array.from({ length: 10 }, () => forkB.next()),
    );
    // fork must not disturb the parent stream identically to a non-forked parent
    const c = new SeededRng(555);
    c.fork('wave');
    expect(a.next()).toBe(c.next());
  });
});
