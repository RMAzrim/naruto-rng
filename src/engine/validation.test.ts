import { describe, it, expect } from 'vitest';
import { validateCharacter } from './validation';
import type { CompatibilityRule, SpinResult, SourceStatus } from '@/types';

const spin = (optionId: string, label: string, sourceStatus: SourceStatus = 'game-original'): SpinResult => ({
  spinId: 's',
  optionId,
  label,
  rarity: 'Common',
  sourceStatus,
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

  it('Sharingan blocked in Ancient Era (eraRange dojutsu)', () => {
    const char = {
      era: spin('ancient', 'Ancient Era', 'canon'),
      dojutsu: { eye: spin('sharingan', 'Sharingan', 'canon'), stage: 'None', mastery: 'none', staminaCost: 0, limitations: [], sourceStatus: 'canon' },
    } as any;
    const rules: CompatibilityRule[] = [
      {
        id: 'r-share-era',
        type: 'eraRange',
        optionId: 'sharingan',
        targetSpinId: 'dojutsu',
        eraIds: ['warring-states', 'founding', 'first-war', 'second-war', 'third-war', 'pre-naruto', 'naruto-part1', 'shippuden', 'fourth-war', 'blank-period', 'the-last', 'boruto', 'two-blue-vortex'],
        message: 'Sharingan is not attested before the Warring States Era.',
        severity: 'error',
        customOnly: false,
      },
    ];
    const report = validateCharacter(char, rules, 'strict');
    expect(report.valid).toBe(false);
    expect(report.errors.some((e) => e.message.includes('Sharingan'))).toBe(true);
  });

  it('Sharingan allowed in Shippuden Era', () => {
    const char = {
      era: spin('shippuden', 'Shippuden Era', 'canon'),
      dojutsu: { eye: spin('sharingan', 'Sharingan', 'canon'), stage: 'None', mastery: 'none', staminaCost: 0, limitations: [], sourceStatus: 'canon' },
    } as any;
    const rules: CompatibilityRule[] = [
      { id: 'r-share-era2', type: 'eraRange', optionId: 'sharingan', targetSpinId: 'dojutsu', eraIds: ['shippuden'], message: 'ok', severity: 'error', customOnly: false },
    ];
    const report = validateCharacter(char, rules, 'strict');
    expect(report.valid).toBe(true);
  });

  it('Rinnegan restricted to Sage/Ancient era', () => {
    const char = {
      era: spin('shippuden', 'Shippuden Era', 'canon'),
      dojutsu: { eye: spin('rinnegan', 'Rinnegan', 'canon'), stage: 'None', mastery: 'none', staminaCost: 0, limitations: [], sourceStatus: 'canon' },
    } as any;
    const rules: CompatibilityRule[] = [
      { id: 'r-rinne-era', type: 'eraRange', optionId: 'rinnegan', targetSpinId: 'dojutsu', eraIds: ['sage-six-paths', 'ancient'], message: 'Rinnegan restricted', severity: 'error', customOnly: false },
    ];
    const report = validateCharacter(char, rules, 'strict');
    expect(report.valid).toBe(false);
    expect(report.errors.some((e) => e.message.includes('Rinnegan'))).toBe(true);
  });

  it('Kage blocked before Founding Era', () => {
    const char = {
      era: spin('warring-states', 'Warring States Era', 'canon'),
      rank: { rank: spin('kage', 'Kage', 'canon'), combatTier: 5 },
    } as any;
    const rules: CompatibilityRule[] = [
      { id: 'r-kage-era', type: 'eraRange', optionId: 'kage', targetSpinId: 'rank', eraIds: ['founding', 'first-war'], message: 'Kage needs village', severity: 'error', customOnly: false },
    ];
    const report = validateCharacter(char, rules, 'strict');
    expect(report.valid).toBe(false);
    expect(report.errors.some((e) => e.message.includes('Kage'))).toBe(true);
  });

  it('Uzushio village blocked after Second War', () => {
    const char = {
      era: spin('third-war', 'Third Shinobi World War', 'canon'),
      origin: { birthplace: spin('uzushio', 'Uzushio', 'canon') },
    } as any;
    const rules: CompatibilityRule[] = [
      { id: 'r-uzushio-era', type: 'eraRange', optionId: 'uzushio', targetSpinId: 'birthplace', eraIds: ['ancient', 'warring-states', 'founding', 'first-war', 'second-war'], message: 'Uzushio destroyed', severity: 'error', customOnly: false },
    ];
    const report = validateCharacter(char, rules, 'strict');
    expect(report.valid).toBe(false);
    expect(report.errors.some((e) => e.message.includes('Uzushio'))).toBe(true);
  });

  it('canonClassification is canon-verified in strict mode with all canon sources', () => {
    const char = {
      era: spin('era', 'Era', 'canon'),
      clan: spin('clan', 'Clan', 'canon'),
      dojutsu: { eye: spin('none', 'None', 'canon'), stage: 'None', mastery: 'none', staminaCost: 0, limitations: [], sourceStatus: 'canon' },
    } as any;
    const report = validateCharacter(char, [], 'strict');
    expect(report.canonClassification).toBe('canon-verified');
  });

  it('canonClassification is au in au mode', () => {
    const char = { era: spin('era', 'Era', 'canon') } as any;
    const report = validateCharacter(char, [], 'au');
    expect(report.canonClassification).toBe('au');
  });

  it('canonClassification is unverified when unverified source present', () => {
    const char = { era: spin('era', 'Era', 'unverified') } as any;
    const report = validateCharacter(char, [], 'strict');
    expect(report.canonClassification).toBe('unverified');
    expect(report.warnings.some((w) => w.field === 'era')).toBe(true);
  });
});
