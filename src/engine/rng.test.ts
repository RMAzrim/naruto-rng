import { describe, it, expect } from 'vitest';
import { SeededRandom, weightedSelect, normalizeWeights } from './rng';

describe('SeededRandom', () => {
  it('produces same result for same seed', () => {
    const a = new SeededRandom('seed-123');
    const b = new SeededRandom('seed-123');
    const valsA = [a.next(), a.next(), a.next()];
    const valsB = [b.next(), b.next(), b.next()];
    expect(valsA).toEqual(valsB);
  });

  it('different seeds can produce different results', () => {
    const a = new SeededRandom('seed-a');
    const b = new SeededRandom('seed-b');
    expect(a.next()).not.toBe(b.next());
  });

  it('nextInt is within [0, max)', () => {
    const rng = new SeededRandom('x');
    for (let i = 0; i < 1000; i++) {
      const v = rng.nextInt(10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(10);
    }
  });

  it('pick returns an item from the pool', () => {
    const rng = new SeededRandom('x');
    const item = rng.pick(['a', 'b', 'c']);
    expect(['a', 'b', 'c']).toContain(item);
  });

  it('shuffle returns all items', () => {
    const rng = new SeededRandom('x');
    const items = [1, 2, 3, 4, 5];
    const shuffled = rng.shuffle(items);
    expect(shuffled.sort()).toEqual(items);
  });
});

describe('weightedSelect', () => {
  it('selects from weighted pool', () => {
    const rng = new SeededRandom('w');
    const options = [
      { item: 'a', weight: 100 },
      { item: 'b', weight: 0 },
    ];
    const result = weightedSelect(rng, options);
    expect(result.item).toBe('a');
    expect(result.weight).toBe(100);
    expect(result.totalWeight).toBe(100);
  });

  it('throws on empty pool', () => {
    const rng = new SeededRandom('w');
    expect(() => weightedSelect(rng, [])).toThrow('Empty eligible pool');
  });

  it('excludes current item during reroll', () => {
    const rng = new SeededRandom('w');
    const options = [
      { item: { id: 'cur', weight: 1 } as any, weight: 1 },
      { item: { id: 'alt', weight: 1 } as any, weight: 1 },
    ];
    const result = weightedSelect(rng, options, (it) => it.id === 'cur');
    expect(result.item.id).toBe('alt');
  });
});

describe('normalizeWeights', () => {
  it('normalizes to probabilities summing to 1', () => {
    const options = [
      { item: 'a', weight: 1 },
      { item: 'b', weight: 3 },
    ];
    const norm = normalizeWeights(options);
    expect(norm[0].probability).toBeCloseTo(0.25);
    expect(norm[1].probability).toBeCloseTo(0.75);
    const sum = norm.reduce((s: number, n: any) => s + n.probability, 0);
    expect(sum).toBeCloseTo(1);
  });
});
