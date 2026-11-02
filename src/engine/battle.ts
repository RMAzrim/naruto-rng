import type { Character } from '@/types';
import { SeededRandom } from './rng';

export type BattleAction =
  | 'basic-attack'
  | 'specialized-attack'
  | 'defensive'
  | 'evasion'
  | 'setup'
  | 'genjutsu'
  | 'support'
  | 'summoning';

export type BattleEvent = {
  turn: number;
  actor: string;
  action: string;
  target: string;
  result: string;
  cost: number;
  damage: number;
  explanation: string;
};

export type BattleResult = {
  winner: 'player1' | 'player2' | 'draw';
  log: BattleEvent[];
  remainingP1: number;
  remainingP2: number;
  turns: number;
  decisiveFactors: string[];
  seed: string;
};

export interface BattleConfig {
  maxTurns: number;
}

interface Fighter {
  char: Character;
  hp: number;
  chakra: number;
  stamina: number;
  defending: boolean;
  setup: number;
}

export function simulateBattle(
  c1: Character,
  c2: Character,
  seed: string,
  config: BattleConfig = { maxTurns: 50 }
): BattleResult {
  const rng = new SeededRandom(seed);
  const log: BattleEvent[] = [];
  const decisiveFactors: string[] = [];

  const f1: Fighter = {
    char: c1,
    hp: 100 + Math.floor(c1.stats.durability / 2),
    chakra: c1.stats.chakraReserves,
    stamina: c1.stats.stamina,
    defending: false,
    setup: 0,
  };
  const f2: Fighter = {
    char: c2,
    hp: 100 + Math.floor(c2.stats.durability / 2),
    chakra: c2.stats.chakraReserves,
    stamina: c2.stats.stamina,
    defending: false,
    setup: 0,
  };

  // Initiative
  const init1 = c1.stats.speed + c1.stats.perception + rng.nextInt(20);
  const init2 = c2.stats.speed + c2.stats.perception + rng.nextInt(20);
  const p1First = init1 >= init2;
  if (init1 !== init2) {
    decisiveFactors.push(
      `${p1First ? c1.name : c2.name} won initiative (${Math.max(init1, init2)} vs ${Math.min(init1, init2)}).`
    );
  }

  let turn = 0;
  let winner: BattleResult['winner'] = 'draw';

  while (turn < config.maxTurns && f1.hp > 0 && f2.hp > 0) {
    turn++;
    const first = p1First ? f1 : f2;
    const second = p1First ? f2 : f1;

    for (const fighter of [first, second]) {
      if (f1.hp <= 0 || f2.hp <= 0) break;
      const opponent = fighter === f1 ? f2 : f1;

      const action = selectAction(rng, fighter.char, fighter.stamina, fighter.chakra, fighter.defending);
      const result = executeAction(rng, action, fighter, opponent);

      // Apply damage/defending state
      opponent.hp = Math.max(0, opponent.hp - result.damage);
      fighter.chakra = Math.max(0, fighter.chakra - result.cost);
      fighter.stamina = Math.max(0, fighter.stamina - result.staminaCost);
      fighter.defending = action === 'defensive';
      fighter.setup = action === 'setup' ? fighter.setup + 1 : 0;

      log.push({
        turn,
        actor: fighter.char.name,
        action: result.actionLabel,
        target: opponent.char.name,
        result: result.outcome,
        cost: result.cost,
        damage: result.damage,
        explanation: result.explanation,
      });

      if (opponent.hp <= 0) {
        winner = fighter === f1 ? 'player1' : 'player2';
        break;
      }
    }
  }

  if (turn >= config.maxTurns && f1.hp > 0 && f2.hp > 0) {
    winner = f1.hp > f2.hp ? 'player1' : f2.hp > f1.hp ? 'player2' : 'draw';
    decisiveFactors.push('Battle ended by turn limit; higher remaining HP decided.');
  }

  return {
    winner,
    log,
    remainingP1: f1.hp,
    remainingP2: f2.hp,
    turns: turn,
    decisiveFactors,
    seed,
  };
}

function selectAction(
  rng: SeededRandom,
  char: Character,
  stamina: number,
  chakra: number,
  defending: boolean
): BattleAction {
  const weights: { action: BattleAction; weight: number }[] = [
    { action: 'basic-attack', weight: 30 },
    { action: 'specialized-attack', weight: 20 },
    { action: 'defensive', weight: 15 },
    { action: 'evasion', weight: 10 },
    { action: 'setup', weight: 10 },
    { action: 'genjutsu', weight: 8 },
    { action: 'support', weight: 5 },
    { action: 'summoning', weight: 2 },
  ];

  const style = char.fightingStyle.primary.optionId;
  if (style === 'taijutsu') {
    weights.find((w) => w.action === 'basic-attack')!.weight += 15;
    weights.find((w) => w.action === 'specialized-attack')!.weight += 10;
  }
  if (style === 'ninjutsu') {
    weights.find((w) => w.action === 'specialized-attack')!.weight += 20;
  }
  if (style === 'genjutsu') {
    weights.find((w) => w.action === 'genjutsu')!.weight += 20;
  }
  if (style === 'barrier' || style === 'defensive') {
    weights.find((w) => w.action === 'defensive')!.weight += 15;
  }
  if (style === 'medical') {
    weights.find((w) => w.action === 'support')!.weight += 15;
  }
  if (style === 'tactical') {
    weights.find((w) => w.action === 'setup')!.weight += 10;
  }

  if (chakra < 15) {
    for (const w of weights) {
      if (['specialized-attack', 'genjutsu', 'summoning', 'support'].includes(w.action)) {
        w.weight = Math.max(0, w.weight - 10);
      }
    }
  }
  if (stamina < 20) {
    for (const w of weights) {
      if (['basic-attack'].includes(w.action)) {
        w.weight = Math.max(0, w.weight - 5);
      }
    }
  }
  if (defending) {
    for (const w of weights) {
      if (w.action === 'defensive') w.weight = Math.max(0, w.weight - 10);
    }
  }

  const total = weights.reduce((s, w) => s + w.weight, 0);
  let r = rng.next() * total;
  for (const w of weights) {
    r -= w.weight;
    if (r <= 0) return w.action;
  }
  return 'basic-attack';
}

interface ActionResult {
  actionLabel: string;
  outcome: string;
  cost: number;
  staminaCost: number;
  damage: number;
  explanation: string;
}

function executeAction(
  rng: SeededRandom,
  action: BattleAction,
  attacker: Fighter,
  defender: Fighter
): ActionResult {
  const atkStat = attacker.char.stats;
  const defStat = defender.char.stats;
  const baseDmg = 10 + Math.floor(atkStat.strength / 10) + Math.floor(atkStat.ninjutsu / 10);
  const accRoll = rng.next() * 100;
  const hitChance = 75 + Math.floor((atkStat.perception - defStat.perception) / 5);
  const hit = accRoll < hitChance;

  switch (action) {
    case 'basic-attack': {
      const damage = hit ? Math.floor(baseDmg * 0.8 * (defender.defending ? 0.6 : 1)) : 0;
      return {
        actionLabel: 'Basic Attack',
        outcome: hit ? 'Hit' : 'Miss',
        cost: 0,
        staminaCost: 5,
        damage,
        explanation: hit
          ? `${attacker.char.name} strikes ${defender.char.name} for ${damage} damage.`
          : `${attacker.char.name}'s attack missed.`,
      };
    }
    case 'specialized-attack': {
      const cost = 20;
      if (attacker.chakra < cost) {
        return {
          actionLabel: 'Specialized Attack',
          outcome: 'Failed (low chakra)',
          cost: 0,
          staminaCost: 5,
          damage: 0,
          explanation: `${attacker.char.name} lacked chakra for the technique.`,
        };
      }
      const bonus = attacker.setup > 0 ? 1 + attacker.setup * 0.5 : 1;
      const damage = hit ? Math.floor(baseDmg * 1.5 * bonus * (defender.defending ? 0.6 : 1)) : 0;
      return {
        actionLabel: 'Specialized Attack',
        outcome: hit ? 'Hit' : 'Miss',
        cost,
        staminaCost: 10,
        damage,
        explanation: hit
          ? `${attacker.char.name} unleashes a specialized technique for ${damage} damage.`
          : `${attacker.char.name}'s technique missed.`,
      };
    }
    case 'defensive': {
      return {
        actionLabel: 'Defensive Stance',
        outcome: 'Defending',
        cost: 5,
        staminaCost: 5,
        damage: 0,
        explanation: `${attacker.char.name} takes a defensive stance.`,
      };
    }
    case 'evasion': {
      return {
        actionLabel: 'Evasion',
        outcome: 'Evading',
        cost: 0,
        staminaCost: 10,
        damage: 0,
        explanation: `${attacker.char.name} attempts to evade.`,
      };
    }
    case 'setup': {
      return {
        actionLabel: 'Setup / Charge',
        outcome: 'Charging',
        cost: 10,
        staminaCost: 5,
        damage: 0,
        explanation: `${attacker.char.name} prepares for a stronger move.`,
      };
    }
    case 'genjutsu': {
      const cost = 18;
      if (attacker.chakra < cost) {
        return {
          actionLabel: 'Genjutsu',
          outcome: 'Failed (low chakra)',
          cost: 0,
          staminaCost: 5,
          damage: 0,
          explanation: `${attacker.char.name} lacked chakra for genjutsu.`,
        };
      }
      const success = hit && rng.next() < 0.6;
      const damage = success ? 5 : 0;
      return {
        actionLabel: 'Genjutsu',
        outcome: success ? 'Hit' : 'Resisted',
        cost,
        staminaCost: 5,
        damage: Math.floor(damage * (defender.defending ? 0.6 : 1)),
        explanation: success
          ? `${attacker.char.name} traps ${defender.char.name} in an illusion.`
          : `${defender.char.name} resisted the genjutsu.`,
      };
    }
    case 'support': {
      return {
        actionLabel: 'Support / Recovery',
        outcome: 'Recovering',
        cost: 20,
        staminaCost: 5,
        damage: 0,
        explanation: `${attacker.char.name} recovers chakra and stabilizes.`,
      };
    }
    case 'summoning': {
      const cost = 30;
      if (attacker.chakra < cost || attacker.char.summoning.contract.optionId === 'none') {
        return {
          actionLabel: 'Summoning',
          outcome: 'Failed (no contract)',
          cost: 0,
          staminaCost: 5,
          damage: 0,
          explanation: `${attacker.char.name} has no usable summoning contract.`,
        };
      }
      const damage = hit ? Math.floor(baseDmg * 1.2 * (defender.defending ? 0.6 : 1)) : 0;
      return {
        actionLabel: 'Summoning Attack',
        outcome: hit ? 'Hit' : 'Miss',
        cost,
        staminaCost: 10,
        damage,
        explanation: hit
          ? `${attacker.char.name}'s summon strikes for ${damage} damage.`
          : `${attacker.char.name}'s summon missed.`,
      };
    }
    default:
      return { actionLabel: 'Basic Attack', outcome: 'Miss', cost: 0, staminaCost: 5, damage: 0, explanation: 'No action.' };
  }
}
