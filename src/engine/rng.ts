// Seeded random source (mulberry32). Deterministic and testable.
// Same seed + same data version => reproducible results.
export class SeededRandom {
  private state: number;

  constructor(seed: string) {
    // Hash string seed to a 32-bit integer
    this.state = hashString(seed) >>> 0;
    if (this.state === 0) this.state = 0x1234567;
  }

  next(): number {
    // mulberry32 PRNG
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  pick<T>(items: T[]): T {
    if (items.length === 0) throw new Error('Empty pool');
    return items[this.nextInt(items.length)];
  }

  shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type WeightedOption<T> = { item: T; weight: number };

export function weightedSelect<T>(
  rng: SeededRandom,
  options: WeightedOption<T>[],
  excludedId?: (item: T) => boolean
): { item: T; weight: number; totalWeight: number } {
  const pool = options.filter((o) => o.weight > 0 && (!excludedId || !excludedId(o.item)));

  if (pool.length === 0) {
    throw new Error('Empty eligible pool after filtering');
  }

  const totalWeight = pool.reduce((sum, o) => sum + o.weight, 0);
  let r = rng.next() * totalWeight;
  let acc = 0;

  for (const o of pool) {
    acc += o.weight;
    if (r < acc) {
      return { item: o.item, weight: o.weight, totalWeight };
    }
  }

  // Fallback (floating point safety)
  return { item: pool[pool.length - 1].item, weight: pool[pool.length - 1].weight, totalWeight };
}

export function normalizeWeights(options: WeightedOption<unknown>[]): { item: unknown; weight: number; probability: number }[] {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  if (total <= 0) return [];
  return options.map((o) => ({ item: o.item, weight: o.weight, probability: o.weight / total }));
}

export function createSeed(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}
