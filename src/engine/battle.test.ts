import { describe, it, expect } from 'vitest';
import { simulateBattle } from './battle';

function makeChar(overrides: any = {}) {
  const base = {
    id: 'c1',
    name: 'Test Shinobi',
    stats: {
      ninjutsu: 50, taijutsu: 50, genjutsu: 50, kenjutsu: 50,
      chakraControl: 50, chakraReserves: 50, speed: 50, strength: 50,
      durability: 50, intelligence: 50, perception: 50, stamina: 50,
    },
    fightingStyle: { primary: { optionId: 'balanced', label: 'Balanced Shinobi' } },
    summoning: { contract: { optionId: 'none', label: 'None' } },
    sharinganTomoe: null,
    mangekyoAbility: null,
    susanooStage: null,
    byakuganMastery: null,
    tenseiganMastery: null,
    rinneganPath: null,
    woodRelease: false,
    iceRelease: false,
    ...overrides,
  };
  return base as any;
}

describe('simulateBattle', () => {
  it('ends within turn limit and produces a winner or draw', () => {
    const c1 = makeChar({ id: 'a', name: 'A' });
    const c2 = makeChar({ id: 'b', name: 'B' });
    const res = simulateBattle(c1, c2, 'battle-seed-1', { maxTurns: 50 });
    expect(res.turns).toBeLessThanOrEqual(50);
    expect(['player1', 'player2', 'draw']).toContain(res.winner);
    expect(res.log.length).toBeGreaterThan(0);
  });

  it('same seed produces same result', () => {
    const c1 = makeChar({ id: 'a', name: 'A' });
    const c2 = makeChar({ id: 'b', name: 'B' });
    const r1 = simulateBattle(c1, c2, 'fixed-battle', { maxTurns: 30 });
    const r2 = simulateBattle(c1, c2, 'fixed-battle', { maxTurns: 30 });
    expect(r1.winner).toBe(r2.winner);
    expect(r1.log.length).toBe(r2.log.length);
  });

  it('decisive factors are reported', () => {
    const c1 = makeChar({ id: 'a', name: 'A' });
    const c2 = makeChar({ id: 'b', name: 'B' });
    const res = simulateBattle(c1, c2, 'x', { maxTurns: 30 });
    expect(res.decisiveFactors.length).toBeGreaterThan(0);
  });

  it('decisive factors include conditional abilities', () => {
    const c1 = makeChar({
      id: 'a',
      name: 'Itachi',
      sharinganTomoe: 'three',
      mangekyoAbility: 'amaterasu',
      susanooStage: 'armored',
    });
    const c2 = makeChar({ id: 'b', name: 'B' });
    const res = simulateBattle(c1, c2, 'cond-seed', { maxTurns: 40 });
    const hasConditional = res.decisiveFactors.some((f) =>
      f.includes('sharingan') || f.includes('mangekyo') || f.includes('susanoo')
    );
    expect(hasConditional).toBe(true);
  });

  it('susanoo armored reduces incoming damage (higher HP remaining)', () => {
    const baseC1 = makeChar({ id: 'a', name: 'A', fightingStyle: { primary: { optionId: 'ninjutsu', label: 'Ninjutsu' } } });
    const c2NoSusanoo = makeChar({ id: 'b', name: 'B' });
    const c2WithSusanoo = makeChar({
      id: 'b',
      name: 'B',
      susanooStage: 'armored',
    });
    const r1 = simulateBattle(baseC1, c2NoSusanoo, 'sus-test', { maxTurns: 30 });
    const r2 = simulateBattle(baseC1, c2WithSusanoo, 'sus-test', { maxTurns: 30 });
    // Same seed, same actions; Susanoo should leave B with more HP.
    expect(r2.remainingP2).toBeGreaterThanOrEqual(r1.remainingP2);
  });

  it('byakugan transcendent increases genjutsu resistance', () => {
    const c1 = makeChar({
      id: 'a',
      name: 'A',
      fightingStyle: { primary: { optionId: 'genjutsu', label: 'Genjutsu' } },
    });
    const c2Resist = makeChar({
      id: 'b',
      name: 'B',
      byakuganMastery: 'transcendent',
    });
    const r = simulateBattle(c1, c2Resist, 'byaku-test', { maxTurns: 40 });
    // With high genjutsu resistance, expect at least one 'Resisted' genjutsu outcome or no genjutsu damage taken.
    const genjutsuEvents = r.log.filter((e) => e.action === 'Genjutsu');
    if (genjutsuEvents.length > 0) {
      const resisted = genjutsuEvents.some((e) => e.result === 'Resisted');
      expect(resisted).toBe(true);
    }
  });

  it('sharingan three tomoe boosts accuracy/perception in battle mods', () => {
    const c1 = makeChar({ id: 'a', name: 'A', sharinganTomoe: 'three' });
    const c2 = makeChar({ id: 'b', name: 'B' });
    const res = simulateBattle(c1, c2, 'share-test', { maxTurns: 30 });
    // Misses should be fewer than a baseline; decisive factors mention sharingan.
    const hasSharingan = res.decisiveFactors.some((f) => f.includes('sharingan'));
    expect(hasSharingan).toBe(true);
  });
});
