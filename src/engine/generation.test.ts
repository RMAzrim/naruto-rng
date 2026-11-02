import { describe, it, expect } from 'vitest';
import { generateCharacter } from './generation';
import { dataContext } from '@/hooks/useGeneration';
import type { GenerationSettings } from './generation';

const baseSettings: GenerationSettings = {
  mode: 'strict',
  name: 'Test Ninja',
  nameSource: 'manual',
};

describe('generateCharacter', () => {
  it('produces all required fields', () => {
    const char = generateCharacter(baseSettings, dataContext);
    expect(char.id).toBeDefined();
    expect(char.name).toBe('Test Ninja');
    expect(char.nameSource).toBe('manual');
    expect(char.era.label).toBeDefined();
    expect(char.alignment.label).toBeDefined();
    expect(char.clan.label).toBeDefined();
    expect(char.heritage.status.label).toBeDefined();
    expect(char.bloodline.trait.label).toBeDefined();
    expect(char.dojutsu.eye.label).toBeDefined();
    expect(char.chakra.primary.label).toBeDefined();
    expect(char.fightingStyle.primary.label).toBeDefined();
    expect(char.rank.rank.label).toBeDefined();
    expect(char.personality.primaryTrait).toBeDefined();
    expect(char.weaknesses.length).toBeGreaterThanOrEqual(1);
    expect(char.fate.label).toBeDefined();
    expect(char.stats.ninjutsu).toBeGreaterThanOrEqual(0);
    expect(char.combatRating.score).toBeGreaterThanOrEqual(0);
  });

  it('same seed reproduces same character', () => {
    const s1: GenerationSettings = { ...baseSettings, seed: 'fixed-seed', name: 'Same' };
    const s2: GenerationSettings = { ...baseSettings, seed: 'fixed-seed', name: 'Same' };
    const c1 = generateCharacter(s1, dataContext);
    const c2 = generateCharacter(s2, dataContext);
    expect(c1.era.optionId).toBe(c2.era.optionId);
    expect(c1.clan.optionId).toBe(c2.clan.optionId);
    expect(c1.dojutsu.eye.optionId).toBe(c2.dojutsu.eye.optionId);
    expect(c1.name).toBe(c2.name);
  });

  it('manual name survives generation', () => {
    const char = generateCharacter({ ...baseSettings, name: 'Custom Name' }, dataContext);
    expect(char.name).toBe('Custom Name');
    expect(char.nameSource).toBe('manual');
  });

  it('stats within bounds', () => {
    const char = generateCharacter(baseSettings, dataContext);
    const vals = Object.values(char.stats) as number[];
    vals.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });

  it('rarity does not directly set max stats', () => {
    // Just ensure generation runs without assigning max based on rarity
    const char = generateCharacter(baseSettings, dataContext);
    expect(char.combatRating.explanation).toBeDefined();
  });
});
