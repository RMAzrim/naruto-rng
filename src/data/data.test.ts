import { describe, expect, it } from 'vitest';
import {
  bloodlineTraits,
  chakraCounts,
  clans,
  fightingStyles,
  heritageStatuses,
  personalities,
  ranks,
  tailedBeasts,
  titles,
  villages,
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
  ['chakra counts', chakraCounts],
  ['tailed beasts', tailedBeasts],
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

  it('restricts village-specific clans to known villages', () => {
    const villageIds = new Set(villages.map((village) => village.id));
    for (const clan of clans) {
      for (const villageId of clan.villages ?? []) {
        expect(villageIds.has(villageId), `${clan.id} references unknown village ${villageId}`).toBe(true);
      }
    }

    const uchiha = clans.find((clan) => clan.id === 'uchiha');
    expect(uchiha?.villages).toEqual(['konoha']);

    const uzumaki = clans.find((clan) => clan.id === 'uzumaki');
    expect(uzumaki?.villages).toContain('konoha');
    expect(uzumaki?.villages).toContain('uzushio');
  });

  it('ships a complete jinchuriki chain', () => {
    expect(tailedBeasts.filter((option) => option.tags?.includes('jinchuriki'))).toHaveLength(2);
    expect(tailedBeasts.filter((option) => option.tags?.includes('tailed-beast'))).toHaveLength(9);
    expect(tailedBeasts.filter((option) => option.tags?.includes('mastery'))).toHaveLength(6);
    expect(chakraCounts).toHaveLength(5);
  });
});
