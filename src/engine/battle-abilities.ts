import type { Character } from '@/types';

/**
 * Battle modifiers derived from conditional progression results (dōjutsu,
 * Susanoo, chakra natures, etc.). All functions are pure and side-effect free.
 */

export interface BattleAbilityMods {
  accuracyBonus: number; // percent added to hit chance
  damageBonus: number; // multiplier on damage
  damageReduction: number; // percent reduced when defending/hit
  chakraCostReduction: number; // percent reduced chakra cost
  genjutsuResistance: number; // percent chance to resist genjutsu
  perceptionBonus: number; // flat bonus to perception
  staminaCostReduction: number; // percent reduced stamina cost
  specialActions: string[]; // unlocked special action labels
}

/**
 * Return the Sharingan tomoe bonus (0 if none).
 */
export function sharinganTomoeBonus(char: Character): number {
  if (char.sharinganTomoe === 'three') return 3;
  if (char.sharinganTomoe === 'two') return 2;
  if (char.sharinganTomoe === 'one') return 1;
  return 0;
}

/**
 * Compute aggregate battle modifiers from all conditional abilities.
 */
export function computeBattleAbilityMods(char: Character): BattleAbilityMods {
  const mods: BattleAbilityMods = {
    accuracyBonus: 0,
    damageBonus: 0,
    damageReduction: 0,
    chakraCostReduction: 0,
    genjutsuResistance: 0,
    perceptionBonus: 0,
    staminaCostReduction: 0,
    specialActions: [],
  };

  const tomoe = sharinganTomoeBonus(char);
  if (tomoe >= 1) {
    mods.accuracyBonus += 5 * tomoe;
    mods.perceptionBonus += 5 * tomoe;
    mods.genjutsuResistance += 10 * tomoe;
    mods.specialActions.push(`sharingan-${tomoe}-tomoe`);
  }

  // Mangekyō abilities grant unique special actions and damage bonuses.
  if (char.mangekyoAbility) {
    const ability = char.mangekyoAbility;
    mods.specialActions.push(`mangekyo-${ability}`);
    switch (ability) {
      case 'amaterasu':
      case 'kagutsuchi':
        mods.damageBonus += 0.25;
        break;
      case 'tsukuyomi':
      case 'kotoamatsukami':
        mods.genjutsuResistance += 20;
        mods.damageBonus += 0.1;
        break;
      case 'kamui':
        mods.damageReduction += 15;
        mods.damageBonus += 0.15;
        break;
      default:
        break;
    }
  }

  // EMS reduces chakra cost and damage taken.
  if (char.mangekyoAbility && char.susanooStage) {
    mods.chakraCostReduction += 10;
    mods.damageReduction += 5;
  }

  // Susanoo stages grant strong damage reduction.
  if (char.susanooStage) {
    const stageReduction: Record<string, number> = {
      ribcage: 10,
      skeletal: 15,
      humanoid: 20,
      armored: 30,
      perfect: 40,
    };
    mods.damageReduction += stageReduction[char.susanooStage] ?? 0;
    mods.specialActions.push(`susanoo-${char.susanooStage}`);
  }

  // Byakugan mastery grants perception and genjutsu resistance.
  if (char.byakuganMastery) {
    const byakuganBonus: Record<string, { perception: number; genjutsu: number }> = {
      basic: { perception: 5, genjutsu: 10 },
      advanced: { perception: 10, genjutsu: 20 },
      transcendent: { perception: 15, genjutsu: 35 },
    };
    const b = byakuganBonus[char.byakuganMastery];
    if (b) {
      mods.perceptionBonus += b.perception;
      mods.genjutsuResistance += b.genjutsu;
      mods.specialActions.push(`byakugan-${char.byakuganMastery}`);
    }
  }

  // Tenseigan mastery grants chakra and damage bonuses.
  if (char.tenseiganMastery) {
    const tenseiganBonus: Record<string, { damage: number; chakra: number }> = {
      basic: { damage: 0.1, chakra: 10 },
      advanced: { damage: 0.2, chakra: 25 },
    };
    const t = tenseiganBonus[char.tenseiganMastery];
    if (t) {
      mods.damageBonus += t.damage;
      mods.chakraCostReduction += t.chakra;
      mods.specialActions.push(`tenseigan-${char.tenseiganMastery}`);
    }
  }

  // Rinnegan paths grant path-specific bonuses.
  if (char.rinneganPath) {
    const pathBonus: Record<string, Partial<BattleAbilityMods>> = {
      deva: { damageBonus: 0.15, damageReduction: 10 },
      asura: { damageBonus: 0.2 },
      human: { genjutsuResistance: 15, accuracyBonus: 5 },
      animal: { chakraCostReduction: 10 },
      preta: { damageReduction: 15, chakraCostReduction: 15 },
    };
    const p = pathBonus[char.rinneganPath];
    if (p) {
      if (p.damageBonus !== undefined) mods.damageBonus += p.damageBonus;
      if (p.damageReduction !== undefined) mods.damageReduction += p.damageReduction;
      if (p.genjutsuResistance !== undefined) mods.genjutsuResistance += p.genjutsuResistance;
      if (p.accuracyBonus !== undefined) mods.accuracyBonus += p.accuracyBonus;
      if (p.chakraCostReduction !== undefined) mods.chakraCostReduction += p.chakraCostReduction;
      mods.specialActions.push(`rinnegan-${char.rinneganPath}`);
    }
  }

  // Jinchuriki gain a flat biju bonus plus a scaling mastery bonus.
  if (char.jinchuriki?.isJinchuriki && char.jinchuriki.tailedBeast) {
    mods.damageBonus += 0.15;
    mods.specialActions.push(`jinchuriki-${char.jinchuriki.tailedBeast.optionId}`);

    const masteryBonus: Record<
      string,
      { damage: number; chakra: number; reduction: number; stamina: number }
    > = {
      'mastery-poor': { damage: 0, chakra: 0, reduction: 0, stamina: 0 },
      'mastery-low': { damage: 0.05, chakra: 5, reduction: 0, stamina: 0 },
      'mastery-average': { damage: 0.1, chakra: 10, reduction: 0, stamina: 0 },
      'mastery-good': { damage: 0.15, chakra: 15, reduction: 5, stamina: 0 },
      'mastery-excellent': { damage: 0.25, chakra: 20, reduction: 10, stamina: 5 },
      'mastery-perfect': { damage: 0.35, chakra: 25, reduction: 15, stamina: 10 },
    };
    const masteryId = char.jinchuriki.mastery?.optionId;
    const mastery = masteryId ? masteryBonus[masteryId] : undefined;
    if (mastery) {
      mods.damageBonus += mastery.damage;
      mods.chakraCostReduction += mastery.chakra;
      mods.damageReduction += mastery.reduction;
      mods.staminaCostReduction += mastery.stamina;
      mods.specialActions.push(`biju-mastery-${masteryId}`);
    }
  }

  // Combined natures grant minor bonuses.
  if (char.woodRelease) {
    mods.damageReduction += 5;
    mods.chakraCostReduction += 5;
    mods.specialActions.push('wood-release');
  }
  if (char.iceRelease) {
    mods.damageBonus += 0.1;
    mods.genjutsuResistance += 5;
    mods.specialActions.push('ice-release');
  }

  // Kekkei Genkai combination elements grant combat bonuses.
  if (char.kekkeiGenkai && char.kekkeiGenkai.optionId !== 'none') {
    const kgBonus: Record<string, Partial<BattleAbilityMods>> = {
      'wood-release': { damageReduction: 5, chakraCostReduction: 5 },
      'ice-release': { damageBonus: 0.1, genjutsuResistance: 5 },
      'magnet-release': { accuracyBonus: 5, perceptionBonus: 5 },
      'steel-release': { damageReduction: 10 },
      'explosion-release': { damageBonus: 0.15 },
      'lava-release': { damageBonus: 0.1 },
      'boil-release': { damageBonus: 0.1 },
      'storm-release': { accuracyBonus: 10 },
    };
    const kb = kgBonus[char.kekkeiGenkai.optionId];
    if (kb) {
      if (kb.damageBonus !== undefined) mods.damageBonus += kb.damageBonus;
      if (kb.damageReduction !== undefined) mods.damageReduction += kb.damageReduction;
      if (kb.chakraCostReduction !== undefined) mods.chakraCostReduction += kb.chakraCostReduction;
      if (kb.genjutsuResistance !== undefined) mods.genjutsuResistance += kb.genjutsuResistance;
      if (kb.accuracyBonus !== undefined) mods.accuracyBonus += kb.accuracyBonus;
      if (kb.perceptionBonus !== undefined) mods.perceptionBonus += kb.perceptionBonus;
      mods.specialActions.push(`kekkei-genkai-${char.kekkeiGenkai.optionId}`);
    }
  }

  // Advanced Nature / Kekkei Tōta grant major combat bonuses.
  if (char.advancedNature && char.advancedNature.optionId !== 'none') {
    const advBonus: Record<string, Partial<BattleAbilityMods>> = {
      'dust-release': { damageBonus: 0.25, damageReduction: 20 },
      'dark-release': { damageReduction: 15, chakraCostReduction: 20 },
    };
    const ab = advBonus[char.advancedNature.optionId];
    if (ab) {
      if (ab.damageBonus !== undefined) mods.damageBonus += ab.damageBonus;
      if (ab.damageReduction !== undefined) mods.damageReduction += ab.damageReduction;
      if (ab.chakraCostReduction !== undefined) mods.chakraCostReduction += ab.chakraCostReduction;
      mods.specialActions.push(`advanced-nature-${char.advancedNature.optionId}`);
    }
  }

  // Sage Mode grants substantial all-around bonuses.
  if (char.sageMode && char.sageMode.optionId !== 'none') {
    const sageBonus: Record<string, Partial<BattleAbilityMods>> = {
      'toad-sage': { damageBonus: 0.2, perceptionBonus: 10 },
      'snake-sage': { damageBonus: 0.15, genjutsuResistance: 10 },
      'slug-sage': { chakraCostReduction: 15, damageReduction: 5 },
      'six-paths-sage': { damageBonus: 0.3, damageReduction: 25, perceptionBonus: 15 },
    };
    const sb = sageBonus[char.sageMode.optionId];
    if (sb) {
      if (sb.damageBonus !== undefined) mods.damageBonus += sb.damageBonus;
      if (sb.damageReduction !== undefined) mods.damageReduction += sb.damageReduction;
      if (sb.chakraCostReduction !== undefined) mods.chakraCostReduction += sb.chakraCostReduction;
      if (sb.genjutsuResistance !== undefined) mods.genjutsuResistance += sb.genjutsuResistance;
      if (sb.accuracyBonus !== undefined) mods.accuracyBonus += sb.accuracyBonus;
      if (sb.perceptionBonus !== undefined) mods.perceptionBonus += sb.perceptionBonus;
      mods.specialActions.push(`sage-mode-${char.sageMode.optionId}`);
    }
  }

  // Specialization grants role-specific bonuses.
  if (char.specialization && char.specialization.optionId !== 'none') {
    const specBonus: Record<string, Partial<BattleAbilityMods>> = {
      'medical-nin': { chakraCostReduction: 10, damageReduction: 5 },
      'anbu': { perceptionBonus: 10, accuracyBonus: 5 },
      'puppeteer': { damageBonus: 0.1, accuracyBonus: 5 },
      'sensor': { perceptionBonus: 15, accuracyBonus: 5 },
      'barrier-nin': { damageReduction: 15 },
      'fuinjutsu-master': { chakraCostReduction: 10, damageReduction: 10 },
      'taijutsu-specialist': { damageBonus: 0.1, staminaCostReduction: 5 },
      'ninjutsu-specialist': { damageBonus: 0.15, chakraCostReduction: 5 },
      'genjutsu-specialist': { genjutsuResistance: 15, perceptionBonus: 5 },
    };
    const sp = specBonus[char.specialization.optionId];
    if (sp) {
      if (sp.damageBonus !== undefined) mods.damageBonus += sp.damageBonus;
      if (sp.damageReduction !== undefined) mods.damageReduction += sp.damageReduction;
      if (sp.chakraCostReduction !== undefined) mods.chakraCostReduction += sp.chakraCostReduction;
      if (sp.genjutsuResistance !== undefined) mods.genjutsuResistance += sp.genjutsuResistance;
      if (sp.accuracyBonus !== undefined) mods.accuracyBonus += sp.accuracyBonus;
      if (sp.perceptionBonus !== undefined) mods.perceptionBonus += sp.perceptionBonus;
      if (sp.staminaCostReduction !== undefined) mods.staminaCostReduction += sp.staminaCostReduction;
      mods.specialActions.push(`specialization-${char.specialization.optionId}`);
    }
  }

  // Signature Weapon grants weapon-specific bonuses.
  if (char.signatureWeapon && char.signatureWeapon.optionId !== 'none') {
    const wpBonus: Record<string, Partial<BattleAbilityMods>> = {
      'katana': { damageBonus: 0.15 },
      'kunai-specialist': { accuracyBonus: 10 },
      'shuriken-specialist': { accuracyBonus: 10 },
      'puppet': { damageBonus: 0.2, accuracyBonus: 5 },
      'war-fan': { genjutsuResistance: 10, damageReduction: 5 },
      'staff': { damageReduction: 10, staminaCostReduction: 5 },
      'great-sword': { damageBonus: 0.25 },
      'scythe': { damageBonus: 0.15, accuracyBonus: 5 },
    };
    const wb = wpBonus[char.signatureWeapon.optionId];
    if (wb) {
      if (wb.damageBonus !== undefined) mods.damageBonus += wb.damageBonus;
      if (wb.damageReduction !== undefined) mods.damageReduction += wb.damageReduction;
      if (wb.chakraCostReduction !== undefined) mods.chakraCostReduction += wb.chakraCostReduction;
      if (wb.genjutsuResistance !== undefined) mods.genjutsuResistance += wb.genjutsuResistance;
      if (wb.accuracyBonus !== undefined) mods.accuracyBonus += wb.accuracyBonus;
      if (wb.perceptionBonus !== undefined) mods.perceptionBonus += wb.perceptionBonus;
      if (wb.staminaCostReduction !== undefined) mods.staminaCostReduction += wb.staminaCostReduction;
      mods.specialActions.push(`signature-weapon-${char.signatureWeapon.optionId}`);
    }
  }

  // Chakra Tier grants reserve and control bonuses.
  if (char.chakraTier && char.chakraTier.optionId !== 'none') {
    const ctBonus: Record<string, Partial<BattleAbilityMods>> = {
      'low-reserves': { chakraCostReduction: 10 },
      'average-reserves': {},
      'high-reserves': { chakraCostReduction: 5 },
      'exceptional-control': { chakraCostReduction: 20 },
      'massive-reserves': { chakraCostReduction: 10 },
      'perfect-control': { chakraCostReduction: 30 },
      'balanced-chakra': { chakraCostReduction: 10, damageReduction: 5 },
    };
    const ctb = ctBonus[char.chakraTier.optionId];
    if (ctb) {
      if (ctb.chakraCostReduction !== undefined) mods.chakraCostReduction += ctb.chakraCostReduction;
      if (ctb.damageReduction !== undefined) mods.damageReduction += ctb.damageReduction;
      mods.specialActions.push(`chakra-tier-${char.chakraTier.optionId}`);
    }
  }

  // Mentor grants narrative and combat bonuses.
  if (char.mentor && char.mentor.optionId !== 'none') {
    const mentorBonus: Record<string, Partial<BattleAbilityMods>> = {
      'clan-heir': { damageBonus: 0.1 },
      'village-elite': { damageBonus: 0.15 },
      'orphan-prodigy': { damageBonus: 0.05 },
      'former-anbu': { perceptionBonus: 5, accuracyBonus: 5 },
      'missing-nin': { damageBonus: 0.1 },
      'sage-disciple': { chakraCostReduction: 10 },
      'clan-leader': { damageBonus: 0.1 },
      'rival-duo': { damageBonus: 0.05, staminaCostReduction: 5 },
    };
    const mb = mentorBonus[char.mentor.optionId];
    if (mb) {
      if (mb.damageBonus !== undefined) mods.damageBonus += mb.damageBonus;
      if (mb.damageReduction !== undefined) mods.damageReduction += mb.damageReduction;
      if (mb.chakraCostReduction !== undefined) mods.chakraCostReduction += mb.chakraCostReduction;
      if (mb.genjutsuResistance !== undefined) mods.genjutsuResistance += mb.genjutsuResistance;
      if (mb.accuracyBonus !== undefined) mods.accuracyBonus += mb.accuracyBonus;
      if (mb.perceptionBonus !== undefined) mods.perceptionBonus += mb.perceptionBonus;
      if (mb.staminaCostReduction !== undefined) mods.staminaCostReduction += mb.staminaCostReduction;
      mods.specialActions.push(`mentor-${char.mentor.optionId}`);
    }
  }

  return mods;
}

/**
 * Human-readable explanations for active conditional abilities in battle.
 */
/**
 * Apply attacker damage bonus and defender damage reduction to a raw damage value.
 */
export function applyDamageMods(
  damage: number,
  mods: BattleAbilityMods,
  defMods: BattleAbilityMods
): number {
  let d = damage * (1 + mods.damageBonus);
  d = d * (1 - defMods.damageReduction / 100);
  return Math.max(0, Math.floor(d));
}

/**
 * Apply chakra cost reduction from attacker mods.
 */
export function applyChakraCost(cost: number, mods: BattleAbilityMods): number {
  return Math.max(0, Math.floor(cost * (1 - mods.chakraCostReduction / 100)));
}

/**
 * Apply stamina cost reduction from attacker mods.
 */
export function applyStaminaCost(cost: number, mods: BattleAbilityMods): number {
  return Math.max(0, Math.floor(cost * (1 - mods.staminaCostReduction / 100)));
}

export function battleAbilityExplanations(char: Character): string[] {
  const explanations: string[] = [];
  const tomoe = sharinganTomoeBonus(char);
  if (tomoe >= 1) {
    explanations.push(`Sharingan ${tomoe} tomoe: +${tomoe * 5}% accuracy/perception, +${tomoe * 10}% genjutsu resistance.`);
  }
  if (char.mangekyoAbility) {
    explanations.push(`Mangekyō: ${char.mangekyoAbility}.`);
  }
  if (char.susanooStage) {
    explanations.push(`Susanoo: ${char.susanooStage}.`);
  }
  if (char.byakuganMastery) {
    explanations.push(`Byakugan: ${char.byakuganMastery} mastery.`);
  }
  if (char.tenseiganMastery) {
    explanations.push(`Tenseigan: ${char.tenseiganMastery} mastery.`);
  }
  if (char.rinneganPath) {
    explanations.push(`Rinnegan: ${char.rinneganPath} Path.`);
  }
  if (char.jinchuriki?.isJinchuriki && char.jinchuriki.tailedBeast) {
    const masteryLabel = char.jinchuriki.mastery?.label ?? 'Uncontrolled';
    explanations.push(
      `Jinchuriki: ${char.jinchuriki.tailedBeast.label} (${masteryLabel}).`
    );
  }
  if (char.woodRelease) explanations.push('Wood Release (Mokuton).');
  if (char.iceRelease) explanations.push('Ice Release (Hyōton).');
  if (char.kekkeiGenkai && char.kekkeiGenkai.optionId !== 'none') {
    explanations.push(`Kekkei Genkai: ${char.kekkeiGenkai.label}.`);
  }
  if (char.advancedNature && char.advancedNature.optionId !== 'none') {
    explanations.push(`Nature Advanced: ${char.advancedNature.label}.`);
  }
  if (char.sageMode && char.sageMode.optionId !== 'none') {
    explanations.push(`Sage Mode: ${char.sageMode.label}.`);
  }
  if (char.specialization && char.specialization.optionId !== 'none') {
    explanations.push(`Spesialisasi: ${char.specialization.label}.`);
  }
  if (char.signatureWeapon && char.signatureWeapon.optionId !== 'none') {
    explanations.push(`Senjata Khusus: ${char.signatureWeapon.label}.`);
  }
  if (char.chakraTier && char.chakraTier.optionId !== 'none') {
    explanations.push(`Tingkat Chakra: ${char.chakraTier.label}.`);
  }
  if (char.mentor && char.mentor.optionId !== 'none') {
    explanations.push(`Mentor: ${char.mentor.label}.`);
  }
  return explanations;
}
