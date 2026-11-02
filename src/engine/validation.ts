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
