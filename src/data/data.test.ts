import { describe, expect, it } from 'vitest';
import {
  bloodlineTraits,
  clans,
  fightingStyles,
  heritageStatuses,
  personalities,
  ranks,
  titles,
  weaknesses,
} from './index';
import type { SpinOption } from '@/types';

const systems: [string, SpinOption[]][] = [
  ['titles', titles],
  ['clans', clans],
  ['heritage statuses', heritageStatuses],
  ['bloodline traits', bloodlineTraits],
  ['personalities', personalities],
  ['weaknesses', weaknesses],
  ['fighting styles', fightingStyles],
  ['ranks', ranks],
];

describe('dataset contract', () => {
  it('ships exactly 100 initial titles', () => {
    expect(titles).toHaveLength(100);
  });

  it('keeps every character system populated with unique ids and positive weights', () => {
    for (const [name, options] of systems) {
      expect(options.length, `${name} should not be empty`).toBeGreaterThan(0);
      const ids = options.map((option) => option.id);
      expect(new Set(ids).size, `${name} ids should be unique`).toBe(ids.length);
      expect(
        options.every((option) => option.weight > 0),
        `${name} weights should be positive`
      ).toBe(true);
    }
  });
});
