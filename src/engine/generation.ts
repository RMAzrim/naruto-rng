import type {
  Ability,
  AffiliationData,
  BloodlineData,
  Character,
  CharacterStats,
  ChakraData,
  DojutsuData,
  FightingStyleData,
  GameMode,
  HeritageData,
  OriginData,
  PersonalityData,
  RankData,
  ReputationData,
  SpinOption,
  SpinResult,
  SummoningData,
  WeaknessData,
} from '@/types';
import { SeededRandom, weightedSelect } from './rng';

const DATA_VERSION = '1.0.0';
const SCHEMA_VERSION = 1;

export interface GenerationSettings {
  mode: GameMode;
  name?: string;
  nameSource?: 'manual' | 'generated';
  eraId?: string;
  seed?: string;
}

export interface DataContext {
  eras: SpinOption[];
  alignments: SpinOption[];
  titles: SpinOption[];
  villages: SpinOption[];
  clans: SpinOption[];
  heritageStatuses: SpinOption[];
  bloodlineTraits: SpinOption[];
  dojutsu: SpinOption[];
  chakraNatures: SpinOption[];
  affiliations: SpinOption[];
  fightingStyles: SpinOption[];
  summonings: SpinOption[];
  ranks: SpinOption[];
  personalities: SpinOption[];
  weaknesses: SpinOption[];
  fates: SpinOption[];
  reputations: SpinOption[];
  abilities: Ability[];
  rules: any[];
}

export function generateCharacter(
  settings: GenerationSettings,
  data: DataContext
): Character {
  const rng = new SeededRandom(settings.seed || createSeed('gen'));
  const mode = settings.mode;

  const eraOpt = pickOption(data.eras, rng, settings.eraId, undefined, undefined, mode);
  const era = toSpinResult(eraOpt);
  const name = settings.name || generateRandomName(rng);
  const nameSource = settings.nameSource || (settings.name ? 'manual' : 'generated');

  const alignment = toSpinResult(pickOption(data.alignments, rng));
  const origin = generateOrigin(data.villages, rng, era, mode);
  const clanOpt = pickOption(data.clans, rng, undefined, origin, era, mode);
  const clan = toSpinResult(clanOpt);
  const heritage = generateHeritage(data.heritageStatuses, rng, clan, era, mode);
  const bloodline = generateBloodline(data.bloodlineTraits, rng, heritage, clan, mode);
  const dojutsu = generateDojutsu(data.dojutsu, rng, clan, heritage, bloodline, mode);
  const chakra = generateChakra(data.chakraNatures, rng, clan, bloodline, mode);
  const affiliation = generateAffiliations(data.affiliations, rng, era, mode);
  const fightingStyleOpt = pickOption(data.fightingStyles, rng);
  const fightingStyle = toSpinResult(fightingStyleOpt);
  const summoning = generateSummoning(data.summonings, rng, mode);
  const rankOpt = pickOption(data.ranks, rng);
  const rankData: RankData = {
    rank: toSpinResult(rankOpt),
    combatTier: (rankOpt as any).combatTier || 2,
  };
  const fightingStyleData = buildFightingStyleData(fightingStyle, data.fightingStyles);
  const personality = generatePersonality(data.personalities, rng);
  const weaknesses = generateWeaknesses(data.weaknesses, rng, mode);
  const fate = toSpinResult(pickOption(data.fates, rng));
  const reputation = generateReputation(data.reputations, rng, alignment, affiliation);

  const abilities = deriveAbilities(data.abilities, fightingStyleOpt, chakra, bloodline, dojutsu, summoning, rankOpt);
  const stats = deriveStats(rankOpt, fightingStyleOpt, abilities, weaknesses, chakra);
  const combatRating = calculateCombatRating(stats, abilities, fightingStyleOpt, weaknesses);

  const validation = {
    valid: true,
    errors: [] as any[],
    warnings: [] as any[],
    infos: [] as any[],
  };

  const now = new Date().toISOString();
  const id = `char-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  return {
    id,
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    generationSeed: settings.seed || 'session',
    datasetVersion: DATA_VERSION,
    name,
    nameSource,
    canonStatus: mode === 'au' ? 'au' : 'canon',
    mode,
    era,
    alignment,
    title: toSpinResult(pickOption(data.titles, rng)),
    origin,
    clan,
    heritage,
    bloodline,
    dojutsu,
    chakra,
    affiliation,
    fightingStyle: fightingStyleData,
    summoning,
    rank: rankData,
    personality,
    weaknesses,
    fate,
    reputation,
    abilities,
    stats,
    combatRating,
    validation,
    history: [
      { action: 'generate', at: now },
    ],
  };
}

function toSpinResult(opt: SpinOption): SpinResult {
  return {
    spinId: opt.id,
    optionId: opt.id,
    label: opt.label,
    category: opt.category,
    rarity: opt.rarity,
    sourceStatus: opt.sourceStatus,
    explanation: opt.description,
  };
}

function pickOption(
  options: SpinOption[],
  rng: SeededRandom,
  preferredId?: string,
  origin?: OriginData,
  era?: SpinResult,
  mode: GameMode = 'strict'
): SpinOption {
  let pool = options.filter((o) => !o.eraEligibility || !era || o.eraEligibility.includes(era.optionId));
  if (mode !== 'au') {
    pool = pool.filter((o) => o.sourceStatus !== 'oc');
  }
  if (pool.length === 0) pool = options;
  if (preferredId) {
    const pref = pool.find((o) => o.id === preferredId);
    if (pref) return pref;
  }
  const weighted = pool.map((o) => ({ item: o, weight: o.weight }));
  return weightedSelect(rng, weighted).item;
}

function generateOrigin(
  villages: SpinOption[],
  rng: SeededRandom,
  era: SpinResult,
  mode: GameMode
): OriginData {
  const birthplace = toSpinResult(pickOption(villages, rng, undefined, undefined, era, mode));
  const raisedIn = toSpinResult(pickOption(villages, rng, undefined, undefined, era, mode));
  const currentAffiliation = toSpinResult(pickOption(villages, rng, undefined, undefined, era, mode));
  return { birthplace, raisedIn, currentAffiliation };
}

function generateHeritage(
  statuses: SpinOption[],
  rng: SeededRandom,
  clan: SpinResult,
  era: SpinResult,
  mode: GameMode
): HeritageData {
  const status = toSpinResult(pickOption(statuses, rng, undefined, undefined, era, mode));
  const confidence: HeritageData['confidence'] = rng.pick(['confirmed', 'probable', 'rumored', 'unknown']);
  const ancestryIds = clan.optionId !== 'clanless' ? [clan.optionId] : [];
  return {
    status,
    confidence,
    ancestryIds,
    notes: `Heritage status: ${status.label}.`,
  };
}

function generateBloodline(
  traits: SpinOption[],
  rng: SeededRandom,
  heritage: HeritageData,
  clan: SpinResult,
  mode: GameMode
): BloodlineData {
  const trait = toSpinResult(pickOption(traits, rng));
  const state: BloodlineData['state'] = trait.optionId === 'none' ? 'absent' : rng.pick(['dormant', 'awakened', 'mastered']);
  return {
    trait,
    state,
    description: `${trait.label} — ${state}.`,
    sourceStatus: trait.sourceStatus,
  };
}

function generateDojutsu(
  dojutsuList: SpinOption[],
  rng: SeededRandom,
  clan: SpinResult,
  heritage: HeritageData,
  bloodline: BloodlineData,
  mode: GameMode
): DojutsuData {
  const eye = toSpinResult(pickOption(dojutsuList, rng));
  let stage = 'None';
  let mastery: DojutsuData['mastery'] = 'none';
  let staminaCost = 0;
  const limitations: string[] = [];

  if (eye.optionId !== 'none') {
    stage = 'Basic';
    mastery = rng.pick(['basic', 'advanced']);
    staminaCost = rng.nextInt(20) + 10;
    limitations.push('Chakra drain per use');
  }

  return { eye, stage, mastery, staminaCost, limitations, sourceStatus: eye.sourceStatus };
}

function generateChakra(
  natures: SpinOption[],
  rng: SeededRandom,
  clan: SpinResult,
  bloodline: BloodlineData,
  mode: GameMode
): ChakraData {
  const primary = toSpinResult(pickOption(natures, rng));
  const secondary = rng.next() < 0.3 ? toSpinResult(pickOption(natures, rng)) : null;
  return {
    primary,
    secondary,
    combined: null,
    control: rng.nextInt(40) + 40,
    reserves: rng.nextInt(50) + 30,
  };
}

function generateAffiliations(
  affiliations: SpinOption[],
  rng: SeededRandom,
  era: SpinResult,
  mode: GameMode
): AffiliationData[] {
  const count = rng.next() < 0.7 ? 1 : 2;
  const result: AffiliationData[] = [];
  for (let i = 0; i < count; i++) {
    const org = toSpinResult(pickOption(affiliations, rng, undefined, undefined, era, mode));
    result.push({
      organization: org,
      role: 'Member',
      isPast: i === 1 && count === 2,
      startEra: era.optionId,
    });
  }
  return result;
}

function buildFightingStyleData(style: SpinResult, allStyles: SpinOption[]): FightingStyleData {
  const def = allStyles.find((s) => s.id === style.optionId);
  return {
    primary: style,
    secondary: null,
    description: def?.description || '',
    requirements: def?.tags || [],
  };
}

function generateSummoning(
  summonings: SpinOption[],
  rng: SeededRandom,
  mode: GameMode
): SummoningData {
  const contract = toSpinResult(pickOption(summonings, rng));
  const proficiency: SummoningData['proficiency'] = contract.optionId === 'none' ? 'none' : rng.pick(['basic', 'advanced', 'master']);
  return {
    contract,
    proficiency,
    specialLimitations: [],
  };
}

function generatePersonality(
  personalities: SpinOption[],
  rng: SeededRandom
): PersonalityData {
  const primary = rng.pick(personalities).label;
  const secondary = rng.shuffle(personalities).slice(0, 2).map((p) => p.label);
  return {
    primaryTrait: primary,
    secondaryTraits: secondary.filter((s) => s !== primary),
    socialTendency: rng.pick(['Outgoing', 'Reserved', 'Balanced']).toString(),
    decisionStyle: rng.pick(['Logical', 'Intuitive', 'Impulsive']).toString(),
    emotionalControl: rng.pick(['Steady', 'Volatile', 'Reserved']).toString(),
    motivation: 'Personal growth and duty.',
  };
}

function generateWeaknesses(
  weaknesses: SpinOption[],
  rng: SeededRandom,
  mode: GameMode
): WeaknessData[] {
  const primary = toSpinResult(pickOption(weaknesses, rng));
  const result: WeaknessData[] = [
    {
      id: primary.optionId,
      category: primary.category || 'General',
      label: primary.label,
      description: primary.explanation || '',
      severity: rng.pick(['minor', 'moderate', 'major']),
    },
  ];
  if (rng.next() < 0.4) {
    const secondary = toSpinResult(pickOption(weaknesses, rng));
    result.push({
      id: secondary.optionId,
      category: secondary.category || 'General',
      label: secondary.label,
      description: secondary.explanation || '',
      severity: rng.pick(['minor', 'moderate']),
    });
  }
  return result;
}

function generateReputation(
  reputations: SpinOption[],
  rng: SeededRandom,
  alignment: SpinResult,
  affiliation: AffiliationData[]
): ReputationData {
  const rep = toSpinResult(pickOption(reputations, rng));
  return {
    label: rep.label,
    description: `${rep.label} reputation based on alignment and history.`,
  };
}

function deriveAbilities(
  allAbilities: Ability[],
  fightingStyle: SpinOption,
  chakra: ChakraData,
  bloodline: BloodlineData,
  dojutsu: DojutsuData,
  summoning: SummoningData,
  rank: SpinOption
): Ability[] {
  const base = allAbilities.find((a) => a.id === 'basic-attack');
  const abilities: Ability[] = base ? [{ ...base }] : [];

  if (fightingStyle.id === 'ninjutsu' || fightingStyle.id === 'balanced') {
    const natureAbility = allAbilities.find((a) => a.type === 'ninjutsu' && a.name.includes(chakra.primary.label));
    if (natureAbility) abilities.push({ ...natureAbility });
  }

  if (fightingStyle.id === 'taijutsu') {
    const strike = allAbilities.find((a) => a.id === 'kenjutsu-strike');
    if (strike) abilities.push({ ...strike });
  }

  if (fightingStyle.id === 'genjutsu' || dojutsu.eye.optionId !== 'none') {
    const gj = allAbilities.find((a) => a.id === 'genjutsu-binding');
    if (gj) abilities.push({ ...gj });
  }

  if (summoning.contract.optionId !== 'none') {
    const sum = allAbilities.find((a) => a.id === 'summon-toad');
    if (sum) abilities.push({ ...sum });
  }

  return abilities;
}

function deriveStats(
  rank: SpinOption,
  fightingStyle: SpinOption,
  abilities: Ability[],
  weaknesses: WeaknessData[],
  chakra: ChakraData
): CharacterStats {
  const tier = (rank as any).combatTier || 2;
  const base = 40 + tier * 10;
  const clamp = (val: number) => Math.min(100, Math.max(0, Math.round(val)));

  const stats: CharacterStats = {
    ninjutsu: clamp(base + 10),
    taijutsu: clamp(base + 10),
    genjutsu: clamp(base),
    kenjutsu: clamp(base),
    chakraControl: clamp(chakra.control),
    chakraReserves: clamp(chakra.reserves),
    speed: clamp(base + 5),
    strength: clamp(base),
    durability: clamp(base + 5),
    intelligence: clamp(base + 5),
    perception: clamp(base),
    stamina: clamp(base),
  };

  const mods: Record<string, Record<string, number>> = {
    taijutsu: { taijutsu: 10, speed: 5, strength: 5 },
    ninjutsu: { ninjutsu: 10, chakraControl: 5, chakraReserves: 5 },
    genjutsu: { genjutsu: 10, intelligence: 5, perception: 5 },
    kenjutsu: { kenjutsu: 10, speed: 5 },
    balanced: { ninjutsu: 3, taijutsu: 3, genjutsu: 2, speed: 2 },
  };
  const m = mods[fightingStyle.id];
  if (m) {
    for (const [key, val] of Object.entries(m)) {
      if (key in stats) {
        (stats as any)[key] = clamp((stats as any)[key] + val);
      }
    }
  }

  for (const w of weaknesses) {
    if (w.label.includes('Low Chakra')) stats.chakraReserves = clamp(stats.chakraReserves - 15);
    if (w.label.includes('Reduced Mobility')) stats.speed = clamp(stats.speed - 8);
    if (w.label.includes('Low Endurance')) stats.stamina = clamp(stats.stamina - 10);
  }

  return stats;
}

function calculateCombatRating(
  stats: CharacterStats,
  abilities: Ability[],
  fightingStyle: SpinOption,
  weaknesses: WeaknessData[]
): any {
  const statSum = Object.values(stats).reduce((acc: number, val: number) => acc + val, 0);
  const abilityBonus = abilities.length * 5;
  const weaknessPenalty = weaknesses.length * 3;
  const score = Math.max(0, Math.round((statSum / 12 + abilityBonus - weaknessPenalty) * 10) / 10);

  const breakdown: Record<string, number> = {
    stats: Math.round(statSum / 12),
    abilities: abilityBonus,
    weaknesses: -weaknessPenalty,
  };

  return {
    score,
    breakdown,
    explanation: `Combat rating derived from 12 core stats (${Math.round(statSum / 12)}), ${abilities.length} abilities (+${abilityBonus}), and ${weaknesses.length} weaknesses (-${weaknessPenalty}).`,
  };
}

function createSeed(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

function generateRandomName(rng: SeededRandom): string {
  const firsts = ['Hikari', 'Ren', 'Sora', 'Kaito', 'Emi', 'Daiki', 'Mei', 'Ryo', 'Yua', 'Jin'];
  const lasts = ['Uzumaki', 'Suzuki', 'Tanaka', 'Kato', 'Yamada', 'Kobayashi', 'Sato', 'Watanabe', 'Mori', 'Abe'];
  return `${rng.pick(firsts)} ${rng.pick(lasts)}`;
}
