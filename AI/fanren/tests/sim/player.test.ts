import { describe, expect, it } from 'vitest';
import { PlayerState } from '@/sim/combat/player';
import { SIM_DT } from '@/sim/core/clock';

function makePlayer() {
  return new PlayerState({
    maxHealth: 100,
    maxMana: 50,
    manaRegenPerSecond: 5,
    maxSpiritualSense: 10,
    moveSpeed: 120,
    worldSize: 1000,
  });
}

describe('PlayerState', () => {
  it('moves by normalized intent and clamps to world bounds', () => {
    const p = makePlayer();
    p.x = 5;
    p.y = 5;
    p.setMoveIntent(-1, 0);
    for (let i = 0; i < 60; i++) p.step(SIM_DT);
    expect(p.x).toBe(0);
    expect(p.y).toBe(5);
  });

  it('regenerates mana over time up to the cap', () => {
    const p = makePlayer();
    p.spendMana(50);
    expect(p.mana).toBe(0);
    for (let i = 0; i < 60 * 20; i++) p.step(SIM_DT);
    expect(p.mana).toBe(50);
  });

  it('spendMana fails atomically when insufficient', () => {
    const p = makePlayer();
    p.spendMana(45);
    expect(p.spendMana(10)).toBe(false);
    expect(p.mana).toBe(5);
  });

  it('spiritual sense occupation cannot exceed capacity', () => {
    const p = makePlayer();
    expect(p.occupySense(6, 'sword')).toBe(true);
    expect(p.occupySense(6, 'pet')).toBe(false);
    expect(p.senseAvailable).toBe(4);
    p.releaseSense('sword');
    expect(p.senseAvailable).toBe(10);
  });

  it('damage triggers invulnerability window against contact damage', () => {
    const p = makePlayer();
    p.applyDamage(10, 'contact');
    expect(p.health).toBe(90);
    p.applyDamage(10, 'contact');
    expect(p.health).toBe(90); // still invulnerable
    for (let i = 0; i < 60; i++) p.step(SIM_DT); // 1s passes
    p.applyDamage(10, 'contact');
    expect(p.health).toBe(80);
  });

  it('fog damage ignores the invulnerability window', () => {
    const p = makePlayer();
    p.applyDamage(10, 'contact');
    p.applyDamage(10, 'fog');
    expect(p.health).toBe(80);
  });

  it('dies at zero health exactly once', () => {
    const p = makePlayer();
    let deaths = 0;
    p.onDeath = () => deaths++;
    p.applyDamage(100, 'fog');
    p.applyDamage(100, 'fog');
    expect(p.dead).toBe(true);
    expect(deaths).toBe(1);
  });

  it('healing cannot exceed max health or revive the dead', () => {
    const p = makePlayer();
    p.applyDamage(30, 'fog');
    p.heal(100);
    expect(p.health).toBe(100);
    p.applyDamage(200, 'fog');
    p.heal(50);
    expect(p.health).toBe(0);
    expect(p.dead).toBe(true);
  });
});
