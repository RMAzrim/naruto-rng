import { useCallback, useState } from 'react';
import { generateCharacter } from '@/engine/generation';
import type { GenerationSettings, DataContext } from '@/engine/generation';
import {
  eras, titles, alignments, villages, clans, heritageStatuses,
  bloodlineTraits, dojutsu, chakraNatures, affiliations, fightingStyles,
  summonings, ranks, personalities, weaknesses, fates, reputations,
  abilities, rules,
} from '@/data/index';

export const dataContext: DataContext = {
  eras,
  titles,
  alignments,
  villages,
  clans,
  heritageStatuses,
  bloodlineTraits,
  dojutsu,
  chakraNatures,
  affiliations,
  fightingStyles,
  summonings,
  ranks,
  personalities,
  weaknesses,
  fates,
  reputations,
  abilities,
  rules,
};

export function useGeneration() {
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback((settings: GenerationSettings) => {
    setLoading(true);
    setError(null);
    try {
      const char = generateCharacter(settings, dataContext);
      setCharacter(char);
      return char;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reroll = useCallback((settings: GenerationSettings) => {
    return generate(settings);
  }, [generate]);

  return { character, loading, error, generate, reroll, setCharacter };
}
