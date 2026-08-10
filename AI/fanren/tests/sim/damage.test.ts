import { describe, expect, it } from 'vitest';
import { resolveDamage, DEFAULT_ELEMENT_MATRIX } from '@/sim/combat/damage';
import type { DamageEvent, DefenderProfile } from '@/sim/combat/damage';
import { SeededRng } from '@/sim/core/rng';

function baseEvent(overrides: Partial<DamageEvent> = {}): DamageEvent {
  return {
    amount: 100,
    channel: 'magical',
    element: 'none',
    sourceTags: [],
    critChance: 0,
    critMultiplier: 2,
    ...overrides,
  };
}

function defender(overrides: Partial<DefenderProfile> = {}): DefenderProfile {
  return {
    physicalDefense: 0,
    magicalDefense: 0,
    spiritualDefense: 0,
    element: 'none',
    tags: [],
    statusModifiers: { damageTakenMultiplier: 1, armorBreakFlat: 0 },
    ...overrides,
  };
}

const rng = () => new SeededRng(1);

describe('damage pipeline', () => {
  it('applies flat defense per channel', () => {
    const result = resolveDamage(baseEvent({ channel: 'physical', amount: 100 }), defender({ physicalDefense: 30 }), rng());
    expect(result.finalAmount).toBe(70);
    expect(result.breakdown.afterDefense).toBe(70);
  });

  it('never reduces damage below 1 from defense alone', () => {
    const result = resolveDamage(baseEvent({ amount: 5, channel: 'physical' }), defender({ physicalDefense: 999 }), rng());
    expect(result.finalAmount).toBe(1);
  });

  it('applies five-element advantage (water beats fire)', () => {
    const result = resolveDamage(
      baseEvent({ element: 'water' }),
      defender({ element: 'fire' }),
      rng(),
    );
    expect(result.finalAmount).toBe(100 * DEFAULT_ELEMENT_MATRIX.advantageMultiplier);
    expect(result.breakdown.elementMultiplier).toBe(DEFAULT_ELEMENT_MATRIX.advantageMultiplier);
  });

  it('applies five-element disadvantage (fire into water)', () => {
    const result = resolveDamage(baseEvent({ element: 'fire' }), defender({ element: 'water' }), rng());
    expect(result.breakdown.elementMultiplier).toBe(DEFAULT_ELEMENT_MATRIX.disadvantageMultiplier);
  });

  it('wind/lightning/ice have no base element interaction', () => {
    const result = resolveDamage(baseEvent({ element: 'lightning' }), defender({ element: 'fire' }), rng());
    expect(result.breakdown.elementMultiplier).toBe(1);
  });

  it('applies conditional tag bonuses (evil ward lightning vs ghost)', () => {
    const result = resolveDamage(
      baseEvent({ element: 'lightning', tagBonuses: [{ targetTag: 'ghost', multiplier: 1.5 }] }),
      defender({ tags: ['ghost'] }),
      rng(),
    );
    expect(result.finalAmount).toBe(150);
  });

  it('spiritual damage uses spiritual defense and ignores physical', () => {
    const result = resolveDamage(
      baseEvent({ channel: 'spiritual', amount: 80 }),
      defender({ physicalDefense: 100, spiritualDefense: 20 }),
      rng(),
    );
    expect(result.finalAmount).toBe(60);
  });

  it('armor break reduces effective defense', () => {
    const result = resolveDamage(
      baseEvent({ channel: 'physical', amount: 100 }),
      defender({ physicalDefense: 50, statusModifiers: { damageTakenMultiplier: 1, armorBreakFlat: 30 } }),
      rng(),
    );
    expect(result.finalAmount).toBe(80);
  });

  it('critical hits multiply after defense', () => {
    const result = resolveDamage(
      baseEvent({ critChance: 1, critMultiplier: 2, channel: 'physical', amount: 100 }),
      defender({ physicalDefense: 20 }),
      rng(),
    );
    expect(result.finalAmount).toBe(160);
    expect(result.breakdown.wasCrit).toBe(true);
  });

  it('status damage-taken multiplier applies last', () => {
    const result = resolveDamage(
      baseEvent({ amount: 100 }),
      defender({ statusModifiers: { damageTakenMultiplier: 1.25, armorBreakFlat: 0 } }),
      rng(),
    );
    expect(result.finalAmount).toBe(125);
  });

  it('breakdown reports every stage for debugging', () => {
    const result = resolveDamage(baseEvent(), defender(), rng());
    expect(result.breakdown).toMatchObject({
      base: 100,
      afterDefense: 100,
      elementMultiplier: 1,
      tagMultiplier: 1,
      wasCrit: false,
    });
  });
});
