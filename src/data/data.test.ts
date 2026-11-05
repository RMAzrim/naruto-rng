import { describe, expect, it } from 'vitest';
import {
  advancedNatures,
  bloodlineTraits,
  chakraCounts,
  chakraTiers,
  clans,
  fightingStyles,
  heritageStatuses,
  kekkeiGenkai,
  mentors,
  personalities,
  ranks,
  sageModes,
  signatureWeapons,
  specializations,
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
  ['kekkei genkai', kekkeiGenkai],
  ['advanced natures', advancedNatures],
  ['sage modes', sageModes],
  ['specializations', specializations],
  ['signature weapons', signatureWeapons],
  ['chakra tiers', chakraTiers],
  ['mentors', mentors],
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

  it('ships kekkei genkai combination elements', () => {
    const kgs = kekkeiGenkai.filter((option) => option.tags?.includes('kekkei-genkai'));
    expect(kgs.length).toBeGreaterThan(0);
    const wood = kekkeiGenkai.find((k) => k.id === 'wood-release');
    expect(wood?.prerequisites).toContain('clan-senju');
    const ice = kekkeiGenkai.find((k) => k.id === 'ice-release');
    expect(ice?.prerequisites).toContain('clan-yuki');
  });

  it('ships advanced nature / kekkei tota options', () => {
    const dust = advancedNatures.find((a) => a.id === 'dust-release');
    expect(dust?.rarity).toBe('Mythic');
    const none = advancedNatures.find((a) => a.id === 'none');
    expect(none).toBeDefined();
  });

  it('ships sage mode options', () => {
    const sixPaths = sageModes.find((s) => s.id === 'six-paths-sage');
    expect(sixPaths?.rarity).toBe('Mythic');
    const none = sageModes.find((s) => s.id === 'none');
    expect(none).toBeDefined();
  });

  it('ships specialization, weapon, tier, and mentor options', () => {
    expect(specializations.length).toBeGreaterThan(0);
    expect(signatureWeapons.length).toBeGreaterThan(0);
    expect(chakraTiers.length).toBeGreaterThan(0);
    expect(mentors.length).toBeGreaterThan(0);
    const medical = specializations.find((s) => s.id === 'medical-nin');
    expect(medical).toBeDefined();
    const katana = signatureWeapons.find((w) => w.id === 'katana');
    expect(katana).toBeDefined();
    const perfect = chakraTiers.find((t) => t.id === 'perfect-control');
    expect(perfect?.rarity).toBe('Epic');
    const sageDisciple = mentors.find((m) => m.id === 'sage-disciple');
    expect(sageDisciple?.rarity).toBe('Epic');
  });
});
