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
});
