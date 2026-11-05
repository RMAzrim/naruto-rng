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
  JinchurikiData,
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
  alignmentId?: string;
  villageId?: string;
  seed?: string;
  /** Optional overrides used by the staged wheel flow. */
  clanId?: string;
  heritageId?: string;
  bloodlineId?: string;
  dojutsuId?: string;
  chakraCountId?: string;
  chakraId?: string;
  jinchurikiId?: string;
  tailedBeastId?: string;
  jinchurikiMasteryId?: string;
  affiliationId?: string;
  rankId?: string;
  fightingStyleId?: string;
  summoningId?: string;
  personalityId?: string;
  weaknessId?: string;
  fateId?: string;
  titleId?: string;
  reputationId?: string;
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
  chakraCounts: SpinOption[];
  tailedBeasts: SpinOption[];
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

  const alignmentOpt = pickOption(data.alignments, rng, settings.alignmentId, undefined, era, mode);
  const alignment = toSpinResult(alignmentOpt);

  // Resolve the village before the clan so village-specific clans can be filtered.
  // A clan override also fixes the birthplace when the requested village cannot host it.
  const clanOverride = settings.clanId
    ? data.clans.find((option) => option.id === settings.clanId)
    : undefined;
  const preferredVillageId = resolveVillagePreference(settings.villageId, clanOverride);
  const origin = generateOrigin(data.villages, rng, era, mode, preferredVillageId);
  const clanOpt = pickOption(data.clans, rng, settings.clanId, origin, era, mode);
  const clan = toSpinResult(clanOpt);
  const heritage = generateHeritage(data.heritageStatuses, rng, clan, era, mode, settings.heritageId);
  const bloodline = generateBloodline(data.bloodlineTraits, rng, heritage, clan, mode, settings.bloodlineId);
  const dojutsu = generateDojutsu(data.dojutsu, rng, clan, heritage, bloodline, mode, settings.dojutsuId);
  const chakra = generateChakra(
    data.chakraNatures,
    data.chakraCounts,
    rng,
    clan,
    mode,
    settings.chakraId,
    settings.chakraCountId
  );
  const jinchuriki = generateJinchuriki(
    data.tailedBeasts,
    rng,
    era,
    mode,
    settings.jinchurikiId,
    settings.tailedBeastId,
    settings.jinchurikiMasteryId
  );

  const affiliationOpt = pickOption(data.affiliations, rng, settings.affiliationId, undefined, era, mode);
  const affiliation = generateAffiliations(data.affiliations, rng, era, mode, settings.affiliationId);
  const fightingStyleOpt = pickOption(data.fightingStyles, rng, settings.fightingStyleId);
  const fightingStyle = toSpinResult(fightingStyleOpt);
  const summoningOpt = pickOption(data.summonings, rng, settings.summoningId);
  const summoning = generateSummoning(data.summonings, rng, mode, settings.summoningId);
  const rankOpt = pickOption(data.ranks, rng, settings.rankId);
  const rankData: RankData = {
    rank: toSpinResult(rankOpt),
    combatTier: rankOpt.combatTier ?? 2,
  };
  const fightingStyleData = buildFightingStyleData(fightingStyle, data.fightingStyles);
  const personalityOpt = pickOption(data.personalities, rng, settings.personalityId);
  const personality = generatePersonality(data.personalities, rng, settings.personalityId);
  const weaknessOpt = pickOption(data.weaknesses, rng, settings.weaknessId);
  const weaknesses = generateWeaknesses(data.weaknesses, rng, mode, settings.weaknessId);
  const fateOpt = pickOption(data.fates, rng, settings.fateId);
  const fate = toSpinResult(fateOpt);
  const reputationOpt = pickOption(data.reputations, rng, settings.reputationId);
  const reputation = generateReputation(data.reputations, rng, alignment, affiliation, settings.reputationId);
  const titleOpt = pickOption(data.titles, rng, settings.titleId, undefined, era, mode);
  const title = toSpinResult(titleOpt);

  const abilities = deriveAbilities(data.abilities, fightingStyleOpt, chakra, bloodline, dojutsu, summoning, rankOpt);
  const stats = deriveStats(rankOpt, fightingStyleOpt, abilities, weaknesses, chakra);
  const combatRating = calculateCombatRating(stats, abilities, fightingStyleOpt, weaknesses);

  const validation = {
    valid: true,
    errors: [] as any[],
    warnings: [] as any[],
    infos: [] as any[],
    canonClassification: 'canon-verified' as const,
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
    title,
    origin,
    clan,
    heritage,
    bloodline,
    dojutsu,
    chakra,
    jinchuriki,
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
    woodRelease: chakra.combined?.optionId === 'wood',
    iceRelease: chakra.combined?.optionId === 'ice',
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
    buffs: opt.buffs,
  };
}

/** Village IDs that can host an option. No list means the option is unrestricted. */
function allowedVillages(option: SpinOption): string[] {
  return option.villages ?? [];
}

/** Options marked "independent" are available in every village. */
function isVillageRestricted(option: SpinOption): boolean {
  const villages = allowedVillages(option);
  return villages.length > 0 && !villages.includes('independent');
}

function isAvailableInVillage(option: SpinOption, villageId?: string): boolean {
  if (!isVillageRestricted(option)) return true;
  return Boolean(villageId) && allowedVillages(option).includes(villageId as string);
}

/** Pick a birthplace that is compatible with a clan override. */
function resolveVillagePreference(
  requestedVillageId: string | undefined,
  clan: SpinOption | undefined
): string | undefined {
  if (!clan || !isVillageRestricted(clan)) return requestedVillageId;
  const allowed = allowedVillages(clan);
  if (requestedVillageId && allowed.includes(requestedVillageId)) return requestedVillageId;
  return allowed[0];
}

function pickOption(
  options: SpinOption[],
  rng: SeededRandom,
  preferredId?: string,
  origin?: OriginData,
  era?: SpinResult,
  mode: GameMode = 'strict'
): SpinOption {
  if (preferredId) {
    const preferred = options.find((o) => o.id === preferredId);
    if (preferred) return preferred;
  }

  // Determine village context from origin birthplace for village-specific filtering (e.g. clans).
  const villageId = origin?.birthplace?.optionId;

  const eligibleByEra = options.filter(
    (o) => !o.eraEligibility || !era || o.eraEligibility.includes(era.optionId)
  );
  const eligibleByMode =
    mode === 'au' ? eligibleByEra : eligibleByEra.filter((o) => o.sourceStatus !== 'oc');

  let pool = eligibleByMode.filter((o) => isAvailableInVillage(o, villageId));

  // Never fall back to a clan from the wrong village. If a dataset has no
  // village-neutral entries, retry without the village constraint rather than
  // returning an invalid option.
  if (pool.length === 0) {
    pool = eligibleByMode.filter((o) => !isVillageRestricted(o));
  }
  if (pool.length === 0) pool = eligibleByMode;
  if (pool.length === 0) pool = options;

  const weighted = pool.map((o) => ({ item: o, weight: o.weight }));
  return weightedSelect(rng, weighted).item;
}

function generateOrigin(
  villages: SpinOption[],
  rng: SeededRandom,
  era: SpinResult,
  mode: GameMode,
  preferredId?: string
): OriginData {
  const birthplace = toSpinResult(pickOption(villages, rng, preferredId, undefined, era, mode));
  const raisedIn = toSpinResult(pickOption(villages, rng, undefined, undefined, era, mode));
  const currentAffiliation = toSpinResult(pickOption(villages, rng, undefined, undefined, era, mode));
  return { birthplace, raisedIn, currentAffiliation };
}

function generateHeritage(
  statuses: SpinOption[],
  rng: SeededRandom,
  clan: SpinResult,
  era: SpinResult,
  mode: GameMode,
  preferredId?: string
): HeritageData {
  const status = toSpinResult(pickOption(statuses, rng, preferredId, undefined, era, mode));
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
  mode: GameMode,
  preferredId?: string
): BloodlineData {
  const trait = toSpinResult(pickOption(traits, rng, preferredId));
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
  mode: GameMode,
  preferredId?: string
): DojutsuData {
  // Conditional progression options live in the same dataset but must never
  // appear on the direct dōjutsu wheel.
  const directPool = dojutsuList.filter((option) => !option.tags?.includes('conditional'));
  const eye = toSpinResult(
    pickOption(directPool.length > 0 ? directPool : dojutsuList, rng, preferredId, undefined, undefined, mode)
  );
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

const BASIC_NATURE_IDS = ['fire', 'wind', 'lightning', 'earth', 'water'];

const COMBINED_NATURES: Record<string, { requiredClan?: string; requiredNatures: string[]; optionId: string }> = {
  wood: { requiredClan: 'senju', requiredNatures: ['earth', 'water'], optionId: 'wood' },
  ice: { requiredClan: 'yuki', requiredNatures: ['water', 'wind'], optionId: 'ice' },
};

function isBasicNature(opt: SpinOption): boolean {
  return BASIC_NATURE_IDS.includes(opt.id);
}

function parseNatureCount(chakraCountId?: string): number {
  if (!chakraCountId) return 1;
  const match = chakraCountId.match(/count-(\d)/);
  return match ? Math.min(5, Math.max(1, parseInt(match[1], 10))) : 1;
}

/** Roll the number of basic natures from the dedicated count spin. */
function rollNatureCount(countOptions: SpinOption[], rng: SeededRandom): number {
  if (countOptions.length > 0) {
    const selected = weightedSelect(
      rng,
      countOptions.map((option) => ({ item: option, weight: option.weight }))
    ).item;
    return parseNatureCount(selected.id);
  }
  return parseNatureCount(`count-${rng.nextInt(5) + 1}`);
}

function generateChakra(
  natures: SpinOption[],
  countOptions: SpinOption[],
  rng: SeededRandom,
  clan: SpinResult,
  mode: GameMode,
  preferredId?: string,
  preferredCountId?: string
): ChakraData {
  const basicNatures = natures.filter(isBasicNature);
  // "Jumlah Elemen" only covers the five basic natures, so the primary nature
  // must come from that same pool.
  const primaryPool = basicNatures.length > 0 ? basicNatures : natures;
  const primaryOpt = pickOption(primaryPool, rng, preferredId, undefined, undefined, mode);
  const primary = toSpinResult(primaryOpt);

  // Nature count: 1-5, weighted toward lower counts (rarer to possess many elements).
  // A staged answer fixes the count; direct generation rolls from the data table.
  const preferredCountOption = preferredCountId
    ? countOptions.find((option) => option.id === preferredCountId)
    : undefined;
  const natureCount = preferredCountOption
    ? parseNatureCount(preferredCountOption.id)
    : rollNatureCount(countOptions, rng);

  // Pool of basic natures excluding the primary (no duplicates).
  const remainingBasic = basicNatures.filter((n) => n.id !== primaryOpt.id);

  let secondary: SpinResult | null = null;
  const additional: SpinResult[] = [];

  if (natureCount >= 2 && remainingBasic.length > 0) {
    const secondaryOpt = pickOption(remainingBasic, rng);
    secondary = toSpinResult(secondaryOpt);
    const afterSecondary = remainingBasic.filter((n) => n.id !== secondaryOpt.id);
    if (natureCount > 2 && afterSecondary.length > 0) {
      const toPick = Math.min(natureCount - 2, afterSecondary.length);
      const shuffled = rng.shuffle([...afterSecondary]);
      for (let i = 0; i < toPick; i += 1) {
        additional.push(toSpinResult(shuffled[i]));
      }
    }
  }

  // Validate combined transformations against possessed natures + clan eligibility.
  const natureIds = new Set([
    primaryOpt.id,
    ...(secondary ? [secondary.optionId] : []),
    ...additional.map((a) => a.optionId),
  ]);
  let combined: SpinResult | null = null;
  for (const def of Object.values(COMBINED_NATURES)) {
    const hasAllNatures = def.requiredNatures.every((nid) => natureIds.has(nid));
    const hasClan = !def.requiredClan || clan.optionId === def.requiredClan;
    if (hasAllNatures && hasClan) {
      const combinedOpt = natures.find((n) => n.id === def.optionId);
      if (combinedOpt) {
        combined = toSpinResult(combinedOpt);
        break;
      }
    }
  }

  return {
    natureCount,
    primary,
    secondary,
    additional,
    combined,
    control: rng.nextInt(40) + 40,
    reserves: rng.nextInt(50) + 30,
  };
}

function generateJinchuriki(
  allOptions: SpinOption[],
  rng: SeededRandom,
  era: SpinResult,
  mode: GameMode,
  preferredJinchurikiId?: string,
  preferredBeastId?: string,
  preferredMasteryId?: string
): JinchurikiData {
  const jinchurikiOptions = allOptions.filter((option) => option.tags?.includes('jinchuriki'));
  if (jinchurikiOptions.length === 0) {
    return { isJinchuriki: false, tailedBeast: null, mastery: null };
  }

  const statusOption = pickOption(
    jinchurikiOptions,
    rng,
    preferredJinchurikiId,
    undefined,
    era,
    mode
  );
  const isJinchuriki = statusOption.id === 'jinchuriki-yes';

  if (!isJinchuriki) {
    return { isJinchuriki: false, tailedBeast: null, mastery: null };
  }

  const beastPool = allOptions.filter((option) => option.tags?.includes('tailed-beast'));
  const masteryPool = allOptions.filter((option) => option.tags?.includes('mastery'));
  const beastOption = beastPool.length > 0 ? pickOption(beastPool, rng, preferredBeastId) : null;
  const masteryOption =
    masteryPool.length > 0 ? pickOption(masteryPool, rng, preferredMasteryId) : null;

  return {
    isJinchuriki: true,
    tailedBeast: beastOption ? toSpinResult(beastOption) : null,
    mastery: masteryOption ? toSpinResult(masteryOption) : null,
  };
}

function generateAffiliations(
  affiliations: SpinOption[],
  rng: SeededRandom,
  era: SpinResult,
  mode: GameMode,
  preferredId?: string
): AffiliationData[] {
  const count = rng.next() < 0.7 ? 1 : 2;
  const result: AffiliationData[] = [];
  for (let i = 0; i < count; i++) {
    const org = toSpinResult(pickOption(affiliations, rng, i === 0 ? preferredId : undefined, undefined, era, mode));
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
  mode: GameMode,
  preferredId?: string
): SummoningData {
  const contract = toSpinResult(pickOption(summonings, rng, preferredId));
  const proficiency: SummoningData['proficiency'] = contract.optionId === 'none' ? 'none' : rng.pick(['basic', 'advanced', 'master']);
  return {
    contract,
    proficiency,
    specialLimitations: [],
  };
}

function generatePersonality(
  personalities: SpinOption[],
  rng: SeededRandom,
  preferredId?: string
): PersonalityData {
  const primaryOpt = pickOption(personalities, rng, preferredId);
  const primary = primaryOpt.label;
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
  mode: GameMode,
  preferredId?: string
): WeaknessData[] {
  const primaryOpt = pickOption(weaknesses, rng, preferredId);
  const primary = toSpinResult(primaryOpt);
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
    const secondaryOpt = pickOption(weaknesses, rng);
    const secondary = toSpinResult(secondaryOpt);
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
  affiliation: AffiliationData[],
  preferredId?: string
): ReputationData {
  const rep = toSpinResult(pickOption(reputations, rng, preferredId));
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
  const tier = rank.combatTier ?? 2;
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
