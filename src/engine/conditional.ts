import type {
  Character,
  ConditionalSpinDefinition,
  ConditionalSpinResult,
  ConditionalSpinState,
  SpinOption,
} from '@/types';
import { SeededRandom, weightedSelect } from './rng';

/**
 * Look up a spin option by id from a data array.
 */
function findOptionById(options: SpinOption[], id: string): SpinOption | undefined {
  return options.find((o) => o.id === id);
}

/**
 * Check whether a character draft satisfies a single prerequisite.
 * A prerequisite is met if the character's history or current answers contain
 * the given spinId with the given optionId.
 */
function prerequisiteMet(
  character: Character,
  prereq: { spinId: string; optionId: string }
): boolean {
  // Check history entries for a matching generate/reroll action.
  const historyMatch = character.history?.some(
    (h) => h.field === prereq.spinId && h.current === prereq.optionId
  );
  if (historyMatch) return true;

  // Chakra prerequisites can match any possessed nature, not only the primary.
  if (prereq.spinId === 'chakra') {
    const natureIds = [
      character.chakra?.primary?.optionId,
      character.chakra?.secondary?.optionId,
      ...(character.chakra?.additional ?? []).map((nature) => nature.optionId),
      character.chakra?.combined?.optionId,
    ].filter(Boolean);
    return natureIds.includes(prereq.optionId);
  }

  // Check top-level character fields by spinId mapping.
  const spinToField: Record<string, (char: Character) => string | undefined> = {
    era: (c) => c.era?.optionId,
    alignment: (c) => c.alignment?.optionId,
    village: (c) => c.origin?.birthplace.optionId,
    clan: (c) => c.clan?.optionId,
    heritage: (c) => c.heritage?.status.optionId,
    bloodline: (c) => c.bloodline?.trait.optionId,
    dojutsu: (c) => c.dojutsu?.eye.optionId,
    affiliation: (c) => c.affiliation?.[0]?.organization.optionId,
    rank: (c) => c.rank?.rank.optionId,
    style: (c) => c.fightingStyle?.primary.optionId,
    summoning: (c) => c.summoning?.contract.optionId,
    personality: (c) => c.personality?.primaryTrait,
    weakness: (c) => c.weaknesses?.[0]?.id,
    fate: (c) => c.fate?.optionId,
    title: (c) => c.title?.optionId,
    reputation: (c) => c.reputation?.label,
  };

  const getter = spinToField[prereq.spinId];
  if (!getter) return false;
  try {
    return getter(character) === prereq.optionId;
  } catch {
    return false;
  }
}

/**
 * Evaluate the state of every conditional spin definition against a character draft.
 * Returns results with state: 'locked' | 'available' | 'completed' | 'failed'.
 */
export function evaluateConditionalSpins(
  character: Character,
  definitions: ConditionalSpinDefinition[]
): ConditionalSpinResult[] {
  return definitions.map((def) => {
    const allPrereqsMet = def.prerequisites.every((p) => prerequisiteMet(character, p));

    // Determine if this spin already has a completed result on the character.
    const existingResult = character.history?.find(
      (h) => h.field === def.id && h.action === 'generate'
    );
    const completed = Boolean(existingResult);

    if (completed) {
      return {
        spinId: def.id,
        optionId: existingResult?.current ?? '',
        label: '',
        state: 'completed' as ConditionalSpinState,
        unlockedBy: def.prerequisites.map((p) => p.spinId),
      };
    }

    if (!allPrereqsMet) {
      return {
        spinId: def.id,
        optionId: '',
        label: '',
        state: 'locked',
        unlockedBy: def.prerequisites.map((p) => p.spinId),
      };
    }

    return {
      spinId: def.id,
      optionId: '',
      label: '',
      state: 'available',
      unlockedBy: def.prerequisites.map((p) => p.spinId),
    };
  });
}

/**
 * Spin a conditional spin: select one option from its result pool,
 * applying eligibility conditions and probability modifiers.
 */
export function spinConditionalSpin(
  definition: ConditionalSpinDefinition,
  character: Character,
  rng: SeededRandom,
  allOptions: SpinOption[]
): { option: SpinOption; explanation: string } | { error: string } {
  // Check prerequisites first.
  const allPrereqsMet = definition.prerequisites.every((p) => prerequisiteMet(character, p));
  if (!allPrereqsMet) {
    return {
      error: definition.failureOutcome || 'Prerequisites not met for this spin.',
    };
  }

  // Build pool from resultPool IDs.
  const pool = definition.resultPool
    .map((id) => findOptionById(allOptions, id))
    .filter((o): o is SpinOption => Boolean(o));

  if (pool.length === 0) {
    return { error: 'No eligible options in result pool.' };
  }

  // Apply probability modifiers.
  const weighted = pool.map((o) => ({
    item: o,
    weight: definition.probabilityModifiers?.[o.id] ?? o.weight,
  }));

  const selected = weightedSelect(rng, weighted).item;

  return {
    option: selected,
    explanation: definition.explanation,
  };
}

const TOMOE_BY_OPTION: Record<string, NonNullable<Character['sharinganTomoe']>> = {
  'sharingan-1-tomoe': 'one',
  'sharingan-2-tomoe': 'two',
  'sharingan-3-tomoe': 'three',
};

const SUSANOO_BY_OPTION: Record<string, NonNullable<Character['susanooStage']>> = {
  'susanoo-ribcage': 'ribcage',
  'susanoo-skeletal': 'skeletal',
  'susanoo-humanoid': 'humanoid',
  'susanoo-armored': 'armored',
  'susanoo-perfect': 'perfect',
};

const BYAKUGAN_BY_OPTION: Record<string, NonNullable<Character['byakuganMastery']>> = {
  'byakugan-basic': 'basic',
  'byakugan-advanced': 'advanced',
  'byakugan-transcendent': 'transcendent',
};

const TENSEIGAN_BY_OPTION: Record<string, NonNullable<Character['tenseiganMastery']>> = {
  'tenseigan-basic': 'basic',
  'tenseigan-advanced': 'advanced',
};

const RINNEGAN_BY_OPTION: Record<string, NonNullable<Character['rinneganPath']>> = {
  'rinnegan-deva': 'deva',
  'rinnegan-asura': 'asura',
  'rinnegan-human': 'human',
  'rinnegan-animal': 'animal',
  'rinnegan-preta': 'preta',
};

/**
 * Fold the chosen conditional spins into a generated character. Every result is
 * also written to history so completed chain nodes remain visible after saving.
 */
export function applyConditionalResults(
  character: Character,
  results: Record<string, SpinOption>
): Character {
  const next: Character = {
    ...character,
    history: [...(character.history ?? [])],
  };
  const resultFields = new Set(Object.keys(results));
  const at = new Date().toISOString();

  next.history = next.history.filter((entry) => !entry.field || !resultFields.has(entry.field));
  for (const [spinId, option] of Object.entries(results)) {
    next.history.push({ action: 'generate', field: spinId, current: option.id, at });
  }

  for (const [spinId, option] of Object.entries(results)) {
    if (spinId === 'sharingan-type' && TOMOE_BY_OPTION[option.id]) {
      next.sharinganTomoe = TOMOE_BY_OPTION[option.id];
    }
    if (spinId === 'mangekyo-abilities') {
      next.mangekyoAbility = option.id;
    }
    if (spinId === 'susanoo-stage' && SUSANOO_BY_OPTION[option.id]) {
      next.susanooStage = SUSANOO_BY_OPTION[option.id];
    }
    if (spinId === 'byakugan-mastery' && BYAKUGAN_BY_OPTION[option.id]) {
      next.byakuganMastery = BYAKUGAN_BY_OPTION[option.id];
    }
    if (spinId === 'tenseigan-mastery' && TENSEIGAN_BY_OPTION[option.id]) {
      next.tenseiganMastery = TENSEIGAN_BY_OPTION[option.id];
    }
    if (spinId === 'rinnegan-path' && RINNEGAN_BY_OPTION[option.id]) {
      next.rinneganPath = RINNEGAN_BY_OPTION[option.id];
    }
    if (spinId === 'wood-release-eligibility' && option.id === 'wood-release-eligible') {
      next.woodRelease = true;
    }
  }

  return next;
}
