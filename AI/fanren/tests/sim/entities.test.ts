import { describe, expect, it } from 'vitest';
import { EntityPool } from '@/sim/core/entities';
import { SpatialGrid } from '@/sim/core/grid';

describe('EntityPool', () => {
  it('allocates increasing numeric ids and reuses freed slots', () => {
    const pool = new EntityPool(4);
    const a = pool.spawn();
    const b = pool.spawn();
    expect(a).not.toBe(b);
    expect(pool.alive(a)).toBe(true);
    pool.despawn(a);
    expect(pool.alive(a)).toBe(false);
    const c = pool.spawn();
    expect(pool.alive(c)).toBe(true);
    expect(pool.count).toBe(2);
  });

  it('grows beyond initial capacity', () => {
    const pool = new EntityPool(2);
    const ids = Array.from({ length: 100 }, () => pool.spawn());
    expect(new Set(ids).size).toBe(100);
    expect(pool.count).toBe(100);
  });

  it('deferred despawn queue applies at flush', () => {
    const pool = new EntityPool(8);
    const a = pool.spawn();
    pool.queueDespawn(a);
    expect(pool.alive(a)).toBe(true);
    pool.flushDespawns();
    expect(pool.alive(a)).toBe(false);
  });

  it('iterates only live entities', () => {
    const pool = new EntityPool(8);
    const a = pool.spawn();
    const b = pool.spawn();
    const c = pool.spawn();
    pool.despawn(b);
    const seen: number[] = [];
    pool.forEach((id) => seen.push(id));
    expect(seen.sort()).toEqual([a, c].sort());
  });
});

describe('SpatialGrid', () => {
  it('finds entities within radius', () => {
    const grid = new SpatialGrid(64, 1024);
    grid.insert(1, 100, 100);
    grid.insert(2, 130, 100);
    grid.insert(3, 500, 500);
    const out: number[] = [];
    grid.queryCircle(100, 100, 50, (id) => out.push(id));
    expect(out.sort()).toEqual([1, 2]);
  });

  it('update moves an entity between cells', () => {
    const grid = new SpatialGrid(64, 1024);
    grid.insert(1, 10, 10);
    grid.update(1, 900, 900);
    let found = 0;
    grid.queryCircle(10, 10, 100, () => found++);
    expect(found).toBe(0);
    grid.queryCircle(900, 900, 10, () => found++);
    expect(found).toBe(1);
  });

  it('remove eliminates an entity from queries', () => {
    const grid = new SpatialGrid(64, 1024);
    grid.insert(7, 50, 50);
    grid.remove(7);
    let found = 0;
    grid.queryCircle(50, 50, 100, () => found++);
    expect(found).toBe(0);
  });

  it('handles hundreds of entities without error', () => {
    const grid = new SpatialGrid(64, 2048);
    for (let i = 0; i < 800; i++) {
      grid.insert(i, (i * 37) % 2048, (i * 91) % 2048);
    }
    let found = 0;
    grid.queryCircle(1024, 1024, 512, () => found++);
    expect(found).toBeGreaterThan(0);
  });
});
