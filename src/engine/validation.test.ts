import { describe, it, expect } from 'vitest';
import { validateCharacter } from './validation';
import type { CompatibilityRule, SpinResult } from '@/types';

const spin = (optionId: string, label: string): SpinResult => ({
  spinId: 's',
  optionId,
  label,
  rarity: 'Common',
  sourceStatus: 'game-original',
});

const baseRules: CompatibilityRule[] = [
  {
    id: 'r-1',
    type: 'excludes',
    optionId: 'rinnegan',
    targetOptionId: 'sharingan',
    targetSpinId: 'dojutsu',
    message: 'Cannot have both.',
    severity: 'error',
    customOnly: false,
  },
];

describe('validateCharacter', () => {
  it('valid character passes', () => {
    const char = {
      era: spin('era', 'Era'),
      alignment: spin('al', 'Alignment'),
      clan: spin('clan', 'Clan'),
      dojutsu: { eye: spin('none', 'None'), stage: 'None', mastery: 'none', staminaCost: 0, limitations: [], sourceStatus: 'game-original' },
    } as any;
    const report = validateCharacter(char, baseRules, 'strict');
    expect(report.valid).toBe(true);
    expect(report.errors.length).toBe(0);
  });

  it('excluded combination produces error', () => {
    const char = {
      clan: spin('clan-uchiha', 'Uchiha'),
      dojutsu: { eye: spin('rinnegan', 'Rinnegan'), stage: 'None', mastery: 'none', staminaCost: 0, limitations: [], sourceStatus: 'game-original' },
    } as any;
    // Add a rule: dojutsu rinnegan excludes clan uchiha via targetSpinId clan
    const rules: CompatibilityRule[] = [
      {
        id: 'r-2',
        type: 'excludes',
        optionId: 'rinnegan',
        targetOptionId: 'clan-uchiha',
        targetSpinId: 'clan',
        message: 'Rinnegan not for Uchiha.',
        severity: 'error',
        customOnly: false,
      },
    ];
    const report = validateCharacter(char, rules, 'strict');
    expect(report.valid).toBe(false);
    expect(report.errors.some((e) => e.message.includes('Rinnegan'))).toBe(true);
  });

  it('warning-only rule does not invalidate', () => {
    const char = { era: spin('era-x', 'Era X') } as any;
    const rules: CompatibilityRule[] = [
      {
        id: 'r-3',
        type: 'warningOnly',
        optionId: 'era-x',
        targetSpinId: 'era',
        message: 'only warning',
        severity: 'warning',
        customOnly: false,
      },
    ];
    const report = validateCharacter(char, rules, 'strict');
    expect(report.valid).toBe(true);
    expect(report.warnings.length).toBe(1);
  });
});
