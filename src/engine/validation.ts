import type { Character, CompatibilityRule, GameMode, SpinOption, ValidationMessage, ValidationReport } from '@/types';

export function validateCharacter(
  character: Partial<Character>,
  rules: CompatibilityRule[],
  mode: GameMode = 'strict'
): ValidationReport {
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];
  const infos: ValidationMessage[] = [];

  // Apply hard rules
  for (const rule of rules) {
    if (rule.customOnly && mode !== 'au') continue;

    const triggered = checkRule(character, rule);
    if (!triggered) continue;

    const msg: ValidationMessage = {
      type: rule.severity,
      field: rule.targetSpinId || rule.optionId,
      message: rule.message,
    };

    if (rule.severity === 'error') errors.push(msg);
    else if (rule.severity === 'warning') warnings.push(msg);
    else infos.push(msg);
  }

  // Era-based affiliation restrictions
  if (character.era && character.affiliation) {
    for (const aff of character.affiliation) {
      const eraRule = rules.find(
        (r) => r.type === 'eraRange' && r.optionId === aff.organization.optionId
      );
      if (eraRule && character.era.optionId && !eraRule.eraIds?.includes(character.era.optionId)) {
        errors.push({
          type: 'error',
          field: 'affiliation',
          message: `${aff.organization.label} not available in ${character.era.label} era.`,
        });
      }
    }
  }

  // Unverified source-status warnings
  const unverifiedChecks = [
    { field: 'era', value: character.era?.sourceStatus },
    { field: 'alignment', value: character.alignment?.sourceStatus },
    { field: 'title', value: character.title?.sourceStatus },
    { field: 'clan', value: character.clan?.sourceStatus },
    { field: 'heritage', value: character.heritage?.status.sourceStatus },
    { field: 'bloodline', value: character.bloodline?.sourceStatus },
    { field: 'dojutsu', value: character.dojutsu?.eye.sourceStatus },
    { field: 'chakra', value: character.chakra?.primary.sourceStatus },
    { field: 'birthplace', value: character.origin?.birthplace.sourceStatus },
    { field: 'rank', value: character.rank?.rank.sourceStatus },
    { field: 'fighting-style', value: character.fightingStyle?.primary.sourceStatus },
  ];
  for (const { field, value } of unverifiedChecks) {
    if (value === 'unverified') {
      warnings.push({
        type: 'warning',
        field,
        message: `${field} has unverified lore status.`,
      });
    }
  }

  // Dojutsu prerequisites (clan checks)
  if (character.clan && character.dojutsu) {
    const clanId = character.clan.optionId;
    if (
      character.dojutsu.eye.optionId === 'byakugan' &&
      clanId !== 'clan-hyuga'
    ) {
      errors.push({
        type: 'error',
        field: 'dojutsu',
        message: 'Byakugan requires Hyuga clan lineage.',
      });
    }
    if (
      character.dojutsu.eye.optionId === 'sharingan' &&
      clanId !== 'clan-uchiha'
    ) {
      errors.push({
        type: 'error',
        field: 'dojutsu',
        message: 'Sharingan requires Uchiha clan lineage.',
      });
    }
  }

  // Advanced dojutsu exclusions
  if (character.dojutsu) {
    const advanced = ['mangekyo-sharingan', 'rinnegan', 'tenseigan'];
    const activeAdvanced = advanced.filter((a) => character.dojutsu!.eye.optionId === a);
    if (activeAdvanced.length > 1) {
      errors.push({
        type: 'error',
        field: 'dojutsu',
        message: 'Only one advanced dojutsu may be active.',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    infos,
    canonClassification: classifyCanonStatus(character, mode),
  };
}

function checkRule(character: Partial<Character>, rule: CompatibilityRule): boolean {
  switch (rule.type) {
    case 'requires':
      return requiresSatisfied(character, rule);
    case 'excludes':
      return excludesViolated(character, rule);
    case 'eraRange':
      return eraRangeViolated(character, rule);
    case 'originRange':
      return originRangeViolated(character, rule);
    case 'heritageMatch':
      return heritageMatchViolated(character, rule);
    case 'masteryGate':
      return masteryGateViolated(character, rule);
    case 'customOnly':
      return customOnlyViolated(character, rule);
    case 'warningOnly':
      return warningOnlyTriggered(character, rule);
    default:
      return false;
  }
}

function spinOptionId(spin: any): string | undefined {
  return spin?.optionId;
}

function requiresSatisfied(character: Partial<Character>, rule: CompatibilityRule): boolean {
  // Simplified: check whether required option exists on target spin
  const target = getSpinResult(character, rule.targetSpinId!);
  if (!target) return true; // nothing set yet, no violation
  return target.optionId === rule.targetOptionId;
}

function excludesViolated(character: Partial<Character>, rule: CompatibilityRule): boolean {
  const target = getSpinResult(character, rule.targetSpinId!);
  if (!target) return false;
  return target.optionId === rule.targetOptionId;
}

function eraRangeViolated(character: Partial<Character>, rule: CompatibilityRule): boolean {
  const era = character.era;
  if (!era || !rule.eraIds) return false;

  // If rule targets a specific field, only violate when that field matches rule.optionId.
  if (rule.targetSpinId && rule.optionId) {
    let targetOptionId: string | undefined;
    if (rule.targetSpinId === 'dojutsu') {
      targetOptionId = character.dojutsu?.eye.optionId;
    } else if (rule.targetSpinId === 'clan') {
      targetOptionId = character.clan?.optionId;
    } else if (rule.targetSpinId === 'birthplace') {
      targetOptionId = character.origin?.birthplace.optionId;
    } else if (rule.targetSpinId === 'rank') {
      targetOptionId = character.rank?.rank.optionId;
    } else if (rule.targetSpinId === 'affiliation') {
      // Affiliation era checks are handled separately in validateCharacter.
      return false;
    }
    if (targetOptionId === undefined || targetOptionId !== rule.optionId) return false;
  }

  return !rule.eraIds.includes(era.optionId);
}

function originRangeViolated(character: Partial<Character>, rule: CompatibilityRule): boolean {
  const origin = character.origin;
  if (!origin || !rule.originIds) return false;
  return !rule.originIds.includes(origin.birthplace.optionId);
}

function heritageMatchViolated(character: Partial<Character>, rule: CompatibilityRule): boolean {
  const heritage = character.heritage;
  if (!heritage || !rule.heritageStatuses) return false;
  return !rule.heritageStatuses.includes(heritage.status.optionId);
}

function masteryGateViolated(character: Partial<Character>, rule: CompatibilityRule): boolean {
  return false; // handled at generation time
}

function customOnlyViolated(character: Partial<Character>, rule: CompatibilityRule): boolean {
  // customOnly rules only matter in strict mode; handled at option filter level
  return false;
}

function warningOnlyTriggered(character: Partial<Character>, rule: CompatibilityRule): boolean {
  const target = getSpinResult(character, rule.targetSpinId!);
  if (!target) return false;
  return target.optionId === rule.optionId;
}

function getSpinResult(character: Partial<Character>, spinId: string): any {
  const map: Record<string, any> = {
    era: character.era,
    alignment: character.alignment,
    title: character.title,
    clan: character.clan,
    dojutsu: character.dojutsu,
    fate: character.fate,
    rank: character.rank,
    'fighting-style': character.fightingStyle,
    affiliation: character.affiliation?.[0],
  };
  return map[spinId];
}

function classifyCanonStatus(
  character: Partial<Character>,
  mode: GameMode
): 'canon-verified' | 'canon-compatible' | 'au' | 'unverified' {
  if (mode === 'au') return 'au';

  const statuses: string[] = [];
  const add = (s?: string) => { if (s) statuses.push(s); };

  add(character.era?.sourceStatus);
  add(character.alignment?.sourceStatus);
  add(character.title?.sourceStatus);
  add(character.clan?.sourceStatus);
  add(character.heritage?.status.sourceStatus);
  add(character.bloodline?.sourceStatus);
  add(character.dojutsu?.eye.sourceStatus);
  add(character.chakra?.primary.sourceStatus);
  add(character.chakra?.secondary?.sourceStatus);
  add(character.chakra?.combined?.sourceStatus);
  add(character.origin?.birthplace.sourceStatus);
  add(character.rank?.rank.sourceStatus);
  add(character.fightingStyle?.primary.sourceStatus);
  add(character.fate?.sourceStatus);

  for (const aff of character.affiliation || []) {
    add(aff.organization.sourceStatus);
  }

  if (statuses.includes('unverified')) return 'unverified';
  if (statuses.includes('oc') || statuses.includes('game-original')) return 'canon-compatible';
  return 'canon-verified';
}
