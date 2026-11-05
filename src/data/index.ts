import type { ConditionalSpinDefinition, SpinOption } from '@/types';

import erasRaw from './eras.json';
import titlesRaw from './titles.json';
import alignmentsRaw from './alignments.json';
import villagesRaw from './villages.json';
import clansRaw from './clans.json';
import heritageRaw from './heritage-statuses.json';
import bloodlineRaw from './bloodline-traits.json';
import dojutsuRaw from './dojutsu.json';
import conditionalSpinsRaw from './conditional-spins.json';
import chakraRaw from './chakra-natures.json';
import chakraCountsRaw from './chakra-counts.json';
import fightingStylesRaw from './fighting-styles.json';
import personalitiesRaw from './personalities.json';
import weaknessesRaw from './weaknesses.json';
import affiliationsRaw from './affiliations.json';
import summoningsRaw from './summonings.json';
import tailedBeastsRaw from './tailed-beasts.json';
import ranksRaw from './ranks.json';
import fatesRaw from './fates.json';
import reputationsRaw from './reputations.json';
import abilitiesRaw from './abilities.json';
import rulesRaw from './compatibility-rules.json';

function toSpinOption(raw: any, idField: string = 'id'): SpinOption {
  return {
    id: raw[idField],
    label: raw.label || raw[idField],
    category: raw.category,
    rarity: raw.rarity ?? 'Common',
    weight: raw.weight ?? 10,
    sourceStatus: raw.sourceStatus ?? 'game-original',
    description: raw.description,
    eraEligibility: raw.eraEligibility,
    villages: raw.villages,
    prerequisites: raw.prerequisites,
    exclusions: raw.exclusions,
    tags: raw.tags,
    combatEffect: raw.combatEffect,
    narrativeEffect: raw.narrativeEffect,
    combatTier: raw.combatTier,
  };
}

export const eras: SpinOption[] = erasRaw.map((r) => toSpinOption(r));
export const titles: SpinOption[] = titlesRaw.map((r) => toSpinOption(r));
export const alignments: SpinOption[] = alignmentsRaw.map((r) => toSpinOption(r));
export const villages: SpinOption[] = villagesRaw.map((r) => toSpinOption(r));
export const clans: SpinOption[] = clansRaw.map((r) => toSpinOption(r));
export const heritageStatuses: SpinOption[] = heritageRaw.map((r) => toSpinOption(r));
export const bloodlineTraits: SpinOption[] = bloodlineRaw.map((r) => toSpinOption(r));
export const dojutsu: SpinOption[] = dojutsuRaw.map((r) => toSpinOption(r));
export const conditionalSpins: ConditionalSpinDefinition[] = conditionalSpinsRaw as unknown as ConditionalSpinDefinition[];
export const chakraNatures: SpinOption[] = chakraRaw.map((r) => toSpinOption(r));
export const chakraCounts: SpinOption[] = chakraCountsRaw.map((r) => toSpinOption(r));
export const fightingStyles: SpinOption[] = fightingStylesRaw.map((r) => toSpinOption(r));
export const personalities: SpinOption[] = personalitiesRaw.map((r) => toSpinOption(r));
export const weaknesses: SpinOption[] = weaknessesRaw.map((r) => toSpinOption(r));
export const affiliations: SpinOption[] = affiliationsRaw.map((r) => toSpinOption(r));
export const summonings: SpinOption[] = summoningsRaw.map((r) => toSpinOption(r));
export const tailedBeasts: SpinOption[] = tailedBeastsRaw.map((r) => toSpinOption(r));
export const ranks: SpinOption[] = ranksRaw.map((r) => toSpinOption(r));
export const fates: SpinOption[] = fatesRaw.map((r) => toSpinOption(r));
export const reputations: SpinOption[] = reputationsRaw.map((r) => toSpinOption(r));
export const abilities = abilitiesRaw as any[];
export const rules = rulesRaw as any[];

export function findOption(options: SpinOption[], id: string): SpinOption | undefined {
  return options.find((o) => o.id === id);
}

export function rarityBadge(rarity: SpinOption['rarity']): string {
  return `badge-${rarity.toLowerCase()}`;
}
