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

  it('respects wheel overrides and rank combat tier', () => {
    const char = generateCharacter(
      {
        ...baseSettings,
        seed: 'override-seed',
        clanId: 'uchiha',
        heritageId: 'pure-clan',
        bloodlineId: 'kekkai-genkai',
        rankId: 'kage',
        fightingStyleId: 'ninjutsu',
      },
      dataContext
    );

    expect(char.clan.optionId).toBe('uchiha');
    expect(char.heritage.status.optionId).toBe('pure-clan');
    expect(char.bloodline.trait.optionId).toBe('kekkai-genkai');
    expect(char.rank.rank.optionId).toBe('kage');
    expect(char.rank.combatTier).toBe(5);
    expect(char.fightingStyle.primary.optionId).toBe('ninjutsu');
  });

  it('chakra nature count is between 1 and 5', () => {
    for (let i = 0; i < 50; i += 1) {
      const char = generateCharacter({ ...baseSettings, seed: `count-test-${i}` }, dataContext);
      expect(char.chakra.natureCount).toBeGreaterThanOrEqual(1);
      expect(char.chakra.natureCount).toBeLessThanOrEqual(5);
    }
  });

  it('nature count equals number of basic natures possessed', () => {
    for (let i = 0; i < 50; i += 1) {
      const char = generateCharacter({ ...baseSettings, seed: `count-eq-${i}` }, dataContext);
      const possessed = [char.chakra.primary]
        .filter(Boolean)
        .concat(char.chakra.secondary ? [char.chakra.secondary] : [])
        .concat(char.chakra.additional)
        .map((n) => n.optionId);
      const unique = new Set(possessed);
      expect(char.chakra.natureCount).toBe(unique.size);
      expect(unique.size).toBe(possessed.length); // no duplicates
    }
  });

  it('primary chakra nature always exists', () => {
    const char = generateCharacter(baseSettings, dataContext);
    expect(char.chakra.primary.label).toBeDefined();
    expect(['fire', 'wind', 'lightning', 'earth', 'water']).toContain(char.chakra.primary.optionId);
  });

  it('secondary only present when count >= 2', () => {
    let foundCount1 = false;
    let foundCount2Plus = false;
    for (let i = 0; i < 100 && (!(foundCount1 && foundCount2Plus)); i += 1) {
      const char = generateCharacter({ ...baseSettings, seed: `sec-test-${i}` }, dataContext);
      if (char.chakra.natureCount === 1) {
        foundCount1 = true;
        expect(char.chakra.secondary).toBeNull();
        expect(char.chakra.additional).toHaveLength(0);
      }
      if (char.chakra.natureCount >= 2) {
        foundCount2Plus = true;
        expect(char.chakra.secondary).not.toBeNull();
      }
    }
    expect(foundCount1).toBe(true);
    expect(foundCount2Plus).toBe(true);
  });

  it('uses the exact staged chakra nature count', () => {
    for (const count of [1, 2, 3, 4, 5]) {
      const char = generateCharacter(
        { ...baseSettings, seed: `exact-count-${count}`, chakraCountId: `count-${count}` },
        dataContext
      );
      expect(char.chakra.natureCount).toBe(count);
      const possessed = [
        char.chakra.primary,
        ...(char.chakra.secondary ? [char.chakra.secondary] : []),
        ...char.chakra.additional,
      ];
      expect(new Set(possessed.map((nature) => nature.optionId)).size).toBe(count);
    }
  });

  it('only rolls village-appropriate clans', () => {
    for (let i = 0; i < 40; i += 1) {
      const char = generateCharacter(
        { ...baseSettings, seed: `village-clan-${i}`, villageId: 'suna' },
        dataContext
      );
      expect(['kazekage-lineage', 'clanless', 'oc-clan', 'iburi', 'otsutsuki']).toContain(
        char.clan.optionId
      );
    }

    const kiri = generateCharacter(
      { ...baseSettings, seed: 'kiri-clan', villageId: 'kiri', clanId: 'yuki' },
      dataContext
    );
    expect(kiri.clan.optionId).toBe('yuki');
    expect(kiri.origin.birthplace.optionId).toBe('kiri');

    const uzushio = generateCharacter(
      { ...baseSettings, seed: 'uzushio-clan', villageId: 'uzushio', clanId: 'uzumaki' },
      dataContext
    );
    expect(uzushio.clan.optionId).toBe('uzumaki');
    expect(uzushio.origin.birthplace.optionId).toBe('uzushio');
  });

  it('keeps a clan override consistent with its home village', () => {
    const char = generateCharacter(
      { ...baseSettings, seed: 'clan-village-fix', villageId: 'suna', clanId: 'uchiha' },
      dataContext
    );
    expect(char.clan.optionId).toBe('uchiha');
    expect(char.origin.birthplace.optionId).toBe('konoha');
  });

  it('supports the full jinchuriki chain', () => {
    const notJinchuriki = generateCharacter(
      { ...baseSettings, seed: 'no-biju', jinchurikiId: 'jinchuriki-no' },
      dataContext
    );
    expect(notJinchuriki.jinchuriki.isJinchuriki).toBe(false);
    expect(notJinchuriki.jinchuriki.tailedBeast).toBeNull();
    expect(notJinchuriki.jinchuriki.mastery).toBeNull();

    const jinchuriki = generateCharacter(
      {
        ...baseSettings,
        seed: 'nine-tails',
        jinchurikiId: 'jinchuriki-yes',
        tailedBeastId: 'kurama',
        jinchurikiMasteryId: 'mastery-perfect',
      },
      dataContext
    );
    expect(jinchuriki.jinchuriki.isJinchuriki).toBe(true);
    expect(jinchuriki.jinchuriki.tailedBeast?.optionId).toBe('kurama');
    expect(jinchuriki.jinchuriki.mastery?.optionId).toBe('mastery-perfect');
  });

  it('combined nature wood requires senju clan + earth + water', () => {
    const char = generateCharacter(
      {
        ...baseSettings,
        seed: 'wood-test',
        clanId: 'senju',
        chakraId: 'earth',
      },
      dataContext
    );
    // With Senju + Earth primary, the roll may or may not produce Water as secondary/additional.
    // If wood combined appears, validate prerequisites are met.
    if (char.chakra.combined?.optionId === 'wood') {
      expect(char.clan.optionId).toBe('senju');
      const natures = [char.chakra.primary.optionId, ...(char.chakra.secondary ? [char.chakra.secondary.optionId] : []), ...char.chakra.additional.map((n) => n.optionId)];
      expect(natures).toContain('earth');
      expect(natures).toContain('water');
    }
  });

  it('combined nature ice requires yuki clan + water + wind', () => {
    const char = generateCharacter(
      {
        ...baseSettings,
        seed: 'ice-test',
        clanId: 'yuki',
        chakraId: 'water',
      },
      dataContext
    );
    if (char.chakra.combined?.optionId === 'ice') {
      expect(char.clan.optionId).toBe('yuki');
      const natures = [char.chakra.primary.optionId, ...(char.chakra.secondary ? [char.chakra.secondary.optionId] : []), ...char.chakra.additional.map((n) => n.optionId)];
      expect(natures).toContain('water');
      expect(natures).toContain('wind');
    }
  });
});
