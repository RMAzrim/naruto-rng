import { describe, it, expect } from 'vitest';
import { evaluateConditionalSpins, spinConditionalSpin } from './conditional';
import { SeededRandom } from './rng';
import { conditionalSpins } from '@/data/index';
import type { Character } from '@/types';

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-test',
    schemaVersion: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    generationSeed: 'test',
    datasetVersion: '1.0.0',
    name: 'Test',
    nameSource: 'manual',
    canonStatus: 'canon',
    mode: 'strict',
    era: { spinId: 'era', optionId: 'third-war', label: 'Third Shinobi World War', rarity: 'Common', sourceStatus: 'canon' },
    alignment: { spinId: 'alignment', optionId: 'hero', label: 'Hero', rarity: 'Common', sourceStatus: 'canon' },
    title: { spinId: 'title', optionId: 't1', label: 'Title', rarity: 'Common', sourceStatus: 'canon' },
    origin: {
      birthplace: { spinId: 'village', optionId: 'konoha', label: 'Konoha', rarity: 'Common', sourceStatus: 'canon' },
      raisedIn: { spinId: 'village', optionId: 'konoha', label: 'Konoha', rarity: 'Common', sourceStatus: 'canon' },
      currentAffiliation: { spinId: 'village', optionId: 'konoha', label: 'Konoha', rarity: 'Common', sourceStatus: 'canon' },
    },
    clan: { spinId: 'clan', optionId: 'clanless', label: 'Clanless', rarity: 'Common', sourceStatus: 'game-original' },
    heritage: { status: { spinId: 'heritage', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original' }, confidence: 'unknown', ancestryIds: [], notes: '' },
    bloodline: { trait: { spinId: 'bloodline', optionId: 'none', label: 'None', rarity: 'Common', sourceStatus: 'game-original' }, state: 'absent', description: '', sourceStatus: 'game-original' },
    dojutsu: { eye: { spinId: 'dojutsu', optionId: 'none', label: 'None', rarity: 'Common', sourceStatus: 'game-original' }, stage: 'None', mastery: 'none', staminaCost: 0, limitations: [], sourceStatus: 'game-original' },
    chakra: { natureCount: 1, primary: { spinId: 'chakra', optionId: 'fire', label: 'Fire Release', rarity: 'Common', sourceStatus: 'canon' }, secondary: null, additional: [], combined: null, control: 50, reserves: 50 },
    affiliation: [],
    fightingStyle: { primary: { spinId: 'style', optionId: 'taijutsu', label: 'Taijutsu', rarity: 'Common', sourceStatus: 'game-original' }, secondary: null, description: '', requirements: [] },
    summoning: { contract: { spinId: 'summoning', optionId: 'none', label: 'None', rarity: 'Common', sourceStatus: 'game-original' }, proficiency: 'none', specialLimitations: [] },
    rank: { rank: { spinId: 'rank', optionId: 'genin', label: 'Genin', rarity: 'Common', sourceStatus: 'canon' }, combatTier: 2 },
    personality: { primaryTrait: 'Calm', secondaryTraits: [], socialTendency: 'Balanced', decisionStyle: 'Logical', emotionalControl: 'Steady', motivation: 'Growth' },
    weaknesses: [],
    fate: { spinId: 'fate', optionId: 'f1', label: 'Fate', rarity: 'Common', sourceStatus: 'canon' },
    reputation: { label: 'Unknown', description: '' },
    abilities: [],
    stats: { ninjutsu: 50, taijutsu: 50, genjutsu: 50, kenjutsu: 50, chakraControl: 50, chakraReserves: 50, speed: 50, strength: 50, durability: 50, intelligence: 50, perception: 50, stamina: 50 },
    combatRating: { score: 50, breakdown: {}, explanation: '' },
    validation: { valid: true, errors: [], warnings: [], infos: [], canonClassification: 'canon-verified' },
    history: [],
    ...overrides,
  };
}

describe('evaluateConditionalSpins', () => {
  it('locks Sharingan Eligibility for non-Uchiha clan', () => {
    const char = makeCharacter({ clan: { spinId: 'clan', optionId: 'clanless', label: 'Clanless', rarity: 'Common', sourceStatus: 'game-original' } });
    const results = evaluateConditionalSpins(char, conditionalSpins);
    const sharingan = results.find((r) => r.spinId === 'sharingan-eligibility');
    expect(sharingan?.state).toBe('locked');
  });

  it('makes Sharingan Eligibility available for Uchiha clan', () => {
    const char = makeCharacter({ clan: { spinId: 'clan', optionId: 'uchiha', label: 'Uchiha', rarity: 'Rare', sourceStatus: 'canon' } });
    const results = evaluateConditionalSpins(char, conditionalSpins);
    const sharingan = results.find((r) => r.spinId === 'sharingan-eligibility');
    expect(sharingan?.state).toBe('available');
  });

  it('locks Sharingan Type without Sharingan Eligibility + Dojutsu', () => {
    const char = makeCharacter({
      clan: { spinId: 'clan', optionId: 'uchiha', label: 'Uchiha', rarity: 'Rare', sourceStatus: 'canon' },
      dojutsu: { eye: { spinId: 'dojutsu', optionId: 'none', label: 'None', rarity: 'Common', sourceStatus: 'game-original' }, stage: 'None', mastery: 'none', staminaCost: 0, limitations: [], sourceStatus: 'game-original' },
    });
    // Mark sharingan-eligibility as completed in history
    char.history.push({ action: 'generate', field: 'sharingan-eligibility', previous: '', current: 'sharingan-eligible', at: '2024-01-01T00:00:00.000Z' });
    const results = evaluateConditionalSpins(char, conditionalSpins);
    const type = results.find((r) => r.spinId === 'sharingan-type');
    expect(type?.state).toBe('locked'); // no Sharingan dojutsu yet
  });

  it('makes Sharingan Type available when eligible + Sharingan dojutsu', () => {
    const char = makeCharacter({
      clan: { spinId: 'clan', optionId: 'uchiha', label: 'Uchiha', rarity: 'Rare', sourceStatus: 'canon' },
      dojutsu: { eye: { spinId: 'dojutsu', optionId: 'sharingan', label: 'Sharingan', rarity: 'Rare', sourceStatus: 'canon' }, stage: 'Basic', mastery: 'basic', staminaCost: 15, limitations: [], sourceStatus: 'canon' },
    });
    char.history.push({ action: 'generate', field: 'sharingan-eligibility', previous: '', current: 'sharingan-eligible', at: '2024-01-01T00:00:00.000Z' });
    const results = evaluateConditionalSpins(char, conditionalSpins);
    const type = results.find((r) => r.spinId === 'sharingan-type');
    expect(type?.state).toBe('available');
  });

  it('marks completed spin as completed', () => {
    const char = makeCharacter({
      clan: { spinId: 'clan', optionId: 'uchiha', label: 'Uchiha', rarity: 'Rare', sourceStatus: 'canon' },
    });
    char.history.push({ action: 'generate', field: 'sharingan-eligibility', previous: '', current: 'sharingan-eligible', at: '2024-01-01T00:00:00.000Z' });
    const results = evaluateConditionalSpins(char, conditionalSpins);
    const sharingan = results.find((r) => r.spinId === 'sharingan-eligibility');
    expect(sharingan?.state).toBe('completed');
    expect(sharingan?.optionId).toBe('sharingan-eligible');
  });

  it('shows unlock prerequisite chain', () => {
    const char = makeCharacter({ clan: { spinId: 'clan', optionId: 'uchiha', label: 'Uchiha', rarity: 'Rare', sourceStatus: 'canon' } });
    const results = evaluateConditionalSpins(char, conditionalSpins);
    const sharingan = results.find((r) => r.spinId === 'sharingan-eligibility');
    expect(sharingan?.unlockedBy).toContain('clan');
  });
});

describe('spinConditionalSpin', () => {
  it('picks an eligible option from pool', () => {
    const char = makeCharacter({
      clan: { spinId: 'clan', optionId: 'uchiha', label: 'Uchiha', rarity: 'Rare', sourceStatus: 'canon' },
    });
    const def = conditionalSpins.find((d) => d.id === 'sharingan-eligibility');
    expect(def).toBeDefined();
    if (!def) return;
    const rng = new SeededRandom('test-seed');
    const pool = def.resultPool.map((id) => ({ id, label: id, rarity: 'Common' as const, weight: 1, sourceStatus: 'canon' as const }));
    const result = spinConditionalSpin(def, char, rng, pool);
    if ('error' in result) throw new Error(result.error);
    expect(def.resultPool).toContain(result.option.id);
  });

  it('returns error when prerequisites not met', () => {
    const char = makeCharacter({ clan: { spinId: 'clan', optionId: 'clanless', label: 'Clanless', rarity: 'Common', sourceStatus: 'game-original' } });
    const def = conditionalSpins.find((d) => d.id === 'sharingan-eligibility')!;
    const rng = new SeededRandom('test-seed');
    const allDojutsu = [
      { id: 'sharingan-eligible', label: 'Sharingan Eligible', rarity: 'Rare' as const, weight: 5, sourceStatus: 'canon' as const },
      { id: 'sharingan-ineligible', label: 'Sharingan Ineligible', rarity: 'Common' as const, weight: 95, sourceStatus: 'canon' as const },
    ];
    const result = spinConditionalSpin(def, char, rng, allDojutsu);
    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.error).toContain('tidak dapat');
  });

  it('locks Byakugan Mastery for non-Hyuga', () => {
    const char = makeCharacter({ clan: { spinId: 'clan', optionId: 'clanless', label: 'Clanless', rarity: 'Common', sourceStatus: 'game-original' } });
    const results = evaluateConditionalSpins(char, conditionalSpins);
    const byakugan = results.find((r) => r.spinId === 'byakugan-mastery');
    expect(byakugan?.state).toBe('locked');
  });

  it('makes Byakugan Mastery available for Hyuga with Byakugan dojutsu', () => {
    const char = makeCharacter({
      clan: { spinId: 'clan', optionId: 'hyuga', label: 'Hyuga', rarity: 'Uncommon', sourceStatus: 'canon' },
      dojutsu: { eye: { spinId: 'dojutsu', optionId: 'byakugan', label: 'Byakugan', rarity: 'Uncommon', sourceStatus: 'canon' }, stage: 'Basic', mastery: 'basic', staminaCost: 10, limitations: [], sourceStatus: 'canon' },
    });
    char.history.push({ action: 'generate', field: 'byakugan-eligibility', previous: '', current: 'byakugan-eligible', at: '2024-01-01T00:00:00.000Z' });
    const results = evaluateConditionalSpins(char, conditionalSpins);
    const mastery = results.find((r) => r.spinId === 'byakugan-mastery');
    expect(mastery?.state).toBe('available');
  });

  it('locks Tenseigan Eligibility for non-Otsutsuki', () => {
    const char = makeCharacter({ clan: { spinId: 'clan', optionId: 'clanless', label: 'Clanless', rarity: 'Common', sourceStatus: 'game-original' } });
    const results = evaluateConditionalSpins(char, conditionalSpins);
    const tenseigan = results.find((r) => r.spinId === 'tenseigan-eligibility');
    expect(tenseigan?.state).toBe('locked');
  });

  it('makes Tenseigan Eligibility available for Otsutsuki with Ancient/Mythic heritage', () => {
    const char = makeCharacter({
      clan: { spinId: 'clan', optionId: 'otsutsuki', label: 'Ōtsutsuki', rarity: 'Mythic', sourceStatus: 'canon' },
      heritage: { status: { spinId: 'heritage', optionId: 'ancient-mythic', label: 'Ancient / Mythic Ancestry', rarity: 'Mythic', sourceStatus: 'game-original' }, confidence: 'confirmed', ancestryIds: ['otsutsuki'], notes: 'Ancient lineage' },
    });
    const results = evaluateConditionalSpins(char, conditionalSpins);
    const eligibility = results.find((r) => r.spinId === 'tenseigan-eligibility');
    expect(eligibility?.state).toBe('available');
  });

  it('locks Rinnegan Eligibility for non-Otsutsuki', () => {
    const char = makeCharacter({ clan: { spinId: 'clan', optionId: 'clanless', label: 'Clanless', rarity: 'Common', sourceStatus: 'game-original' } });
    const results = evaluateConditionalSpins(char, conditionalSpins);
    const rinnegan = results.find((r) => r.spinId === 'rinnegan-eligibility');
    expect(rinnegan?.state).toBe('locked');
  });

  it('makes Rinnegan Eligibility available for Otsutsuki with Ancient/Mythic heritage', () => {
    const char = makeCharacter({
      clan: { spinId: 'clan', optionId: 'otsutsuki', label: 'Ōtsutsuki', rarity: 'Mythic', sourceStatus: 'canon' },
      heritage: { status: { spinId: 'heritage', optionId: 'ancient-mythic', label: 'Ancient / Mythic Ancestry', rarity: 'Mythic', sourceStatus: 'game-original' }, confidence: 'confirmed', ancestryIds: ['otsutsuki'], notes: 'Ancient lineage' },
    });
    const results = evaluateConditionalSpins(char, conditionalSpins);
    const eligibility = results.find((r) => r.spinId === 'rinnegan-eligibility');
    expect(eligibility?.state).toBe('available');
  });

  it('picks a Rinnegan Path from pool', () => {
    const def = conditionalSpins.find((d) => d.id === 'rinnegan-path');
    expect(def).toBeDefined();
    if (!def) return;
    const char = makeCharacter({
      clan: { spinId: 'clan', optionId: 'otsutsuki', label: 'Ōtsutsuki', rarity: 'Mythic', sourceStatus: 'canon' },
      dojutsu: { eye: { spinId: 'dojutsu', optionId: 'rinnegan', label: 'Rinnegan', rarity: 'Mythic', sourceStatus: 'canon' }, stage: 'Basic', mastery: 'basic', staminaCost: 30, limitations: [], sourceStatus: 'canon' },
    });
    char.history.push({ action: 'generate', field: 'rinnegan-eligibility', previous: '', current: 'rinnegan-eligible', at: '2024-01-01T00:00:00.000Z' });
    const rng = new SeededRandom('rinnegan-test');
    const pool = def.resultPool.map((id) => ({ id, label: id, rarity: 'Rare' as const, weight: 1, sourceStatus: 'canon' as const }));
    const result = spinConditionalSpin(def, char, rng, pool);
    if ('error' in result) throw new Error(result.error);
    expect(def.resultPool).toContain(result.option.id);
  });
});
