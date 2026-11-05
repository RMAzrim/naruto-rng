import type { Character, Collection } from '@/types';

const COLLECTION_KEY = 'shinobi-genesis:collection:v1';
const SETTINGS_KEY = 'shinobi-genesis:settings:v1';
const APP_VERSION = '0.1.0';

export interface AppSettings {
  animation: boolean;
  reducedMotion: boolean;
  sound: boolean;
  theme: 'dark' | 'light';
}

export const defaultSettings: AppSettings = {
  animation: true,
  reducedMotion: false,
  sound: false,
  theme: 'dark',
};

export function saveCollection(characters: Character[]): void {
  try {
    const data: Collection = {
      version: 1,
      exportedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      datasetVersion: '1.0.0',
      characters,
    };
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save collection:', err);
    throw new Error('Gagal menyimpan koleksi ke penyimpanan browser.');
  }
}

export function loadCollection(): Character[] {
  try {
    const raw = localStorage.getItem(COLLECTION_KEY);
    if (!raw) return [];
    const parsed: Collection = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.characters)) return [];
    return parsed.characters.map(migrateCharacter);
  } catch (err) {
    console.error('Failed to load collection:', err);
    return [];
  }
}

export function saveCharacter(character: Character): void {
  const chars = loadCollection();
  const existing = chars.findIndex((c) => c.id === character.id);
  const updated = { ...character, updatedAt: new Date().toISOString() };
  if (existing >= 0) {
    chars[existing] = updated;
  } else {
    chars.push(updated);
  }
  saveCollection(chars);
}

export function deleteCharacter(id: string): void {
  const chars = loadCollection().filter((c) => c.id !== id);
  saveCollection(chars);
}

export function getCharacter(id: string): Character | undefined {
  return loadCollection().find((c) => c.id === id);
}

export function exportCollection(): string {
  const data: Collection = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    datasetVersion: '1.0.0',
    characters: loadCollection(),
  };
  return JSON.stringify(data, null, 2);
}

export function importCollection(json: string): { success: boolean; characters: Character[]; errors: string[] } {
  const errors: string[] = [];
  try {
    const parsed: Collection = JSON.parse(json);

    if (!parsed || typeof parsed !== 'object') {
      errors.push('File JSON tidak valid.');
      return { success: false, characters: [], errors };
    }

    if (!parsed.characters || !Array.isArray(parsed.characters)) {
      errors.push('Koleksi tidak mengandung daftar karakter.');
      return { success: false, characters: [], errors };
    }

    if (parsed.characters.length === 0) {
      errors.push('Koleksi kosong.');
      return { success: false, characters: [], errors };
    }

    const chars: Character[] = [];
    const seenIds = new Set<string>();

    for (let i = 0; i < parsed.characters.length; i++) {
      const c = parsed.characters[i];
      if (!c || !c.id || !c.name) {
        errors.push(`Karakter indeks ${i}: field id atau name hilang.`);
        continue;
      }
      if (seenIds.has(c.id)) {
        errors.push(`Karakter ${c.id}: duplikat ID, dilewati.`);
        continue;
      }
      seenIds.add(c.id);
      chars.push(migrateCharacter(c));
    }

    if (chars.length === 0) {
      errors.push('Tidak ada karakter valid yang diimpor.');
      return { success: false, characters: [], errors };
    }

    const existing = loadCollection();
    const merged = [...existing, ...chars];
    saveCollection(merged);

    return { success: true, characters: chars, errors };
  } catch (err) {
    errors.push('Gagal mengurai file JSON.');
    return { success: false, characters: [], errors };
  }
}

export function resetCollection(): void {
  localStorage.removeItem(COLLECTION_KEY);
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSettings };
  }
}

function migrateCharacter(c: any): Character {
  // Minimal migration: ensure required fields exist
  return {
    id: c.id || `char-${Date.now()}`,
    schemaVersion: c.schemaVersion || 1,
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
    generationSeed: c.generationSeed || 'imported',
    datasetVersion: c.datasetVersion || '1.0.0',
    name: c.name || 'Unknown',
    nameSource: c.nameSource || 'manual',
    canonStatus: c.canonStatus || 'oc',
    mode: c.mode || 'strict',
    era: c.era || { spinId: 'unknown', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original' },
    alignment: c.alignment || { spinId: 'unknown', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original' },
    title: c.title || { spinId: 'unknown', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original' },
    origin: c.origin || {
      birthplace: { spinId: 'unknown', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original' },
      raisedIn: { spinId: 'unknown', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original' },
      currentAffiliation: { spinId: 'unknown', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original' },
    },
    clan: c.clan || { spinId: 'unknown', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original' },
    heritage: c.heritage || {
      status: { spinId: 'unknown', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original' },
      confidence: 'unknown',
      ancestryIds: [],
      notes: '',
    },
    bloodline: c.bloodline || {
      trait: { spinId: 'unknown', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original' },
      state: 'absent',
      description: '',
      sourceStatus: 'game-original',
    },
    dojutsu: c.dojutsu || {
      eye: { spinId: 'unknown', optionId: 'unknown', label: 'None', rarity: 'Common', sourceStatus: 'game-original' },
      stage: 'None',
      mastery: 'none',
      staminaCost: 0,
      limitations: [],
      sourceStatus: 'game-original',
    },
    // Field-level migration keeps characters saved before these fields existed loadable.
    // Preserve saved characters created before natureCount existed by counting
    // the natures actually stored, rather than defaulting everyone to one element.
    chakra: {
      natureCount: c.chakra?.natureCount ?? (1 + (c.chakra?.secondary ? 1 : 0) + (c.chakra?.additional?.length ?? 0)),
      primary: c.chakra?.primary || {
        spinId: 'unknown', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original',
      },
      secondary: c.chakra?.secondary ?? null,
      additional: c.chakra?.additional ?? [],
      combined: c.chakra?.combined ?? null,
      control: c.chakra?.control ?? 50,
      reserves: c.chakra?.reserves ?? 50,
    },
    jinchuriki: {
      isJinchuriki: c.jinchuriki?.isJinchuriki ?? false,
      tailedBeast: c.jinchuriki?.tailedBeast ?? null,
      mastery: c.jinchuriki?.mastery ?? null,
    },
    affiliation: c.affiliation || [],
    fightingStyle: c.fightingStyle || {
      primary: { spinId: 'unknown', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original' },
      secondary: null,
      description: '',
      requirements: [],
    },
    summoning: c.summoning || {
      contract: { spinId: 'unknown', optionId: 'unknown', label: 'None', rarity: 'Common', sourceStatus: 'game-original' },
      proficiency: 'none',
      specialLimitations: [],
    },
    rank: c.rank || {
      rank: { spinId: 'unknown', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original' },
      combatTier: 1,
    },
    personality: c.personality || {
      primaryTrait: 'Unknown',
      secondaryTraits: [],
      socialTendency: 'Unknown',
      decisionStyle: 'Unknown',
      emotionalControl: 'Unknown',
      motivation: '',
    },
    weaknesses: c.weaknesses || [],
    fate: c.fate || { spinId: 'unknown', optionId: 'unknown', label: 'Unknown', rarity: 'Common', sourceStatus: 'game-original' },
    reputation: c.reputation || { label: 'Unknown', description: '' },
    abilities: c.abilities || [],
    stats: c.stats || {
      ninjutsu: 50, taijutsu: 50, genjutsu: 50, kenjutsu: 50,
      chakraControl: 50, chakraReserves: 50, speed: 50, strength: 50,
      durability: 50, intelligence: 50, perception: 50, stamina: 50,
    },
    combatRating: c.combatRating || { score: 50, breakdown: {}, explanation: '' },
    validation: c.validation || { valid: true, errors: [], warnings: [], infos: [] },
    history: c.history || [],
  };
}
