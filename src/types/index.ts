export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
export type SourceStatus = 'canon' | 'oc' | 'game-original' | 'unverified';
export type CanonStatus = 'canon' | 'oc' | 'au' | 'unverified';
export type GameMode = 'strict' | 'au';

export type SpinOption = {
  id: string;
  label: string;
  category?: string;
  rarity: Rarity;
  weight: number;
  sourceStatus: SourceStatus;
  description?: string;
  eraEligibility?: string[]; // era IDs where allowed
  prerequisites?: string[]; // option IDs required
  exclusions?: string[]; // option IDs that cannot coexist
  tags?: string[];
  combatEffect?: string;
  narrativeEffect?: string;
  /** Rank metadata used by the combat rating pipeline. */
  combatTier?: number;
  /** Clan-specific affinities/buffs (only meaningful for clan entries). */
  buffs?: string[];
};

export type SpinDefinition = {
  id: string;
  name: string;
  description: string;
  options: SpinOption[];
  affectsCombat: boolean;
};

export type SpinResult = {
  spinId: string;
  optionId: string;
  label: string;
  category?: string;
  rarity: Rarity;
  sourceStatus: SourceStatus;
  explanation?: string;
  buffs?: string[];
};

export type OriginData = {
  birthplace: SpinResult;
  raisedIn: SpinResult;
  currentAffiliation: SpinResult;
};

export type HeritageData = {
  status: SpinResult;
  confidence: 'confirmed' | 'probable' | 'rumored' | 'unknown';
  ancestryIds: string[];
  notes: string;
};

export type BloodlineData = {
  trait: SpinResult;
  state: 'absent' | 'dormant' | 'awakened' | 'mastered';
  description: string;
  sourceStatus: SourceStatus;
};

export type DojutsuData = {
  eye: SpinResult;
  stage: string;
  mastery: 'none' | 'basic' | 'advanced' | 'transcendent';
  staminaCost: number;
  limitations: string[];
  sourceStatus: SourceStatus;
};

export type ChakraData = {
  natureCount: number; // 1-5 basic elemental natures possessed
  primary: SpinResult;
  secondary: SpinResult | null;
  additional: SpinResult[]; // extra basic natures beyond primary/secondary
  combined: SpinResult | null;
  control: number; // 0-100
  reserves: number; // 0-100
};

export type AffiliationData = {
  organization: SpinResult;
  role?: string;
  isPast: boolean;
  startEra?: string;
  endEra?: string;
};

export type FightingStyleData = {
  primary: SpinResult;
  secondary: SpinResult | null;
  description: string;
  requirements: string[];
};

export type SummoningData = {
  contract: SpinResult;
  proficiency: 'none' | 'basic' | 'advanced' | 'master';
  specialLimitations: string[];
};

export type RankData = {
  rank: SpinResult;
  combatTier: number; // 1-7
};

export type PersonalityData = {
  primaryTrait: string;
  secondaryTraits: string[];
  socialTendency: string;
  decisionStyle: string;
  emotionalControl: string;
  motivation: string;
  fearOrConflict?: string;
};

export type WeaknessData = {
  id: string;
  category: string;
  label: string;
  description: string;
  trigger?: string;
  gameplayEffect?: string;
  severity: 'minor' | 'moderate' | 'major';
};

export type ReputationData = {
  label: string;
  description: string;
  byRegion?: Record<string, string>;
};

export type Ability = {
  id: string;
  name: string;
  type: 'ninjutsu' | 'taijutsu' | 'genjutsu' | 'kenjutsu' | 'fuinjutsu' | 'medical' | 'puppetry' | 'sensor' | 'barrier' | 'summoning';
  description: string;
  cost: number;
  range: 'melee' | 'short' | 'mid' | 'long';
  setupTime: number; // turns
  cooldown: number; // turns
  limitations: string[];
  mastery: 'none' | 'basic' | 'advanced' | 'transcendent';
  sourceStatus: SourceStatus;
};

export type CharacterStats = {
  ninjutsu: number;
  taijutsu: number;
  genjutsu: number;
  kenjutsu: number;
  chakraControl: number;
  chakraReserves: number;
  speed: number;
  strength: number;
  durability: number;
  intelligence: number;
  perception: number;
  stamina: number;
};

export type CombatRating = {
  score: number;
  breakdown: Record<string, number>;
  explanation: string;
};

export type ValidationReport = {
  valid: boolean;
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  infos: ValidationMessage[];
  /** Overall canon compatibility classification. */
  canonClassification: 'canon-verified' | 'canon-compatible' | 'au' | 'unverified';
};

export type ValidationMessage = {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
};

export type CharacterHistoryEntry = {
  action: 'generate' | 'reroll' | 'edit' | 'load';
  field?: string;
  previous?: string;
  current?: string;
  at: string;
};

export type Character = {
  id: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  generationSeed: string;
  datasetVersion: string;
  name: string;
  nameSource: 'manual' | 'generated';
  canonStatus: CanonStatus;
  mode: GameMode;
  era: SpinResult;
  alignment: SpinResult;
  title: SpinResult;
  origin: OriginData;
  clan: SpinResult;
  heritage: HeritageData;
  bloodline: BloodlineData;
  dojutsu: DojutsuData;
  chakra: ChakraData;
  affiliation: AffiliationData[];
  fightingStyle: FightingStyleData;
  summoning: SummoningData;
  rank: RankData;
  personality: PersonalityData;
  weaknesses: WeaknessData[];
  fate: SpinResult;
  reputation: ReputationData;
  abilities: Ability[];
  stats: CharacterStats;
  combatRating: CombatRating;
  validation: ValidationReport;
  history: CharacterHistoryEntry[];
  /** Conditional progression results populated by the conditional spin engine. */
  sharinganTomoe?: 'one' | 'two' | 'three' | null;
  mangekyoAbility?: string | null;
  susanooStage?: 'ribcage' | 'skeletal' | 'humanoid' | 'armored' | 'perfect' | null;
  byakuganMastery?: 'basic' | 'advanced' | 'transcendent' | null;
  tenseiganMastery?: 'basic' | 'advanced' | null;
  rinneganPath?: 'deva' | 'asura' | 'human' | 'animal' | 'preta' | null;
  woodRelease?: boolean;
  iceRelease?: boolean;
};

export type Collection = {
  version: number;
  exportedAt: string;
  appVersion: string;
  datasetVersion: string;
  characters: Character[];
};

export type RuleType =
  | 'requires'
  | 'excludes'
  | 'eraRange'
  | 'originRange'
  | 'heritageMatch'
  | 'masteryGate'
  | 'customOnly'
  | 'warningOnly';

export type CompatibilityRule = {
  id: string;
  type: RuleType;
  optionId: string;
  targetOptionId?: string;
  targetSpinId?: string;
  eraIds?: string[];
  originIds?: string[];
  heritageStatuses?: string[];
  message: string;
  severity: 'error' | 'warning' | 'info';
  customOnly: boolean;
};

export type SeedSource = {
  seed: string;
  dataVersion: string;
};

export type ConditionalSpinState = 'locked' | 'available' | 'completed' | 'failed';

export type ConditionalSpinPrerequisite = {
  spinId: string;
  optionId: string;
  message?: string;
};

export type ConditionalSpinDefinition = {
  id: string;
  name: string;
  description: string;
  prerequisites: ConditionalSpinPrerequisite[];
  eligibilityConditions?: CompatibilityRule[];
  resultPool: string[];
  probabilityModifiers?: Record<string, number>;
  failureOutcome?: string;
  nextUnlockedSpin?: string | null;
  acquisitionMethod: 'inheritance' | 'transplantation' | 'training' | 'awakening' | 'natural';
  explanation: string;
};

export type ConditionalSpinResult = {
  spinId: string;
  optionId: string;
  label: string;
  state: ConditionalSpinState;
  unlockedBy?: string[];
};
