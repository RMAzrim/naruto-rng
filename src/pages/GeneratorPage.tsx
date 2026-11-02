import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpinCard } from '@/components/SpinCard';
import { useGeneration } from '@/hooks/useGeneration';
import {
  eras, alignments, titles, villages, clans, heritageStatuses,
  bloodlineTraits, dojutsu, chakraNatures, affiliations, fightingStyles,
  summonings, ranks, personalities, weaknesses, fates, reputations,
} from '@/data/index';

type SpinKey =
  | 'era' | 'alignment' | 'title' | 'clan' | 'heritage' | 'bloodline'
  | 'dojutsu' | 'chakra' | 'fightingStyle' | 'summoning' | 'rank'
  | 'personality' | 'weakness' | 'fate' | 'reputation';

interface SpinSectionProps {
  title: string;
  keys: SpinKey[];
  character: any;
  spinningKey: SpinKey | null;
  handleSpin: (key: SpinKey) => void;
  loading: boolean;
  resultFor: (key: SpinKey) => any;
}

const SPINS: Record<SpinKey, { id: string; name: string; description: string; options: any[] }> = {
  era: { id: 'era', name: 'Era', description: 'The historical period of the shinobi world.', options: eras },
  alignment: { id: 'alignment', name: 'Alignment', description: 'Moral compass and core motivation.', options: alignments },
  title: { id: 'title', name: 'Title', description: 'Epithet or title earned by the shinobi.', options: titles },
  clan: { id: 'clan', name: 'Clan', description: 'Bloodline or clan lineage.', options: clans },
  heritage: { id: 'heritage', name: 'Heritage Status', description: 'Ancestry and inherited legacy.', options: heritageStatuses },
  bloodline: { id: 'bloodline', name: 'Bloodline Trait', description: 'Inherited ability, if any.', options: bloodlineTraits },
  dojutsu: { id: 'dojutsu', name: 'Dojutsu', description: 'Inherited eye ability.', options: dojutsu },
  chakra: { id: 'chakra', name: 'Chakra Nature', description: 'Primary elemental affinity.', options: chakraNatures },
  fightingStyle: { id: 'fightingStyle', name: 'Fighting Style', description: 'Primary combat discipline.', options: fightingStyles },
  summoning: { id: 'summoning', name: 'Summoning', description: 'Animal contract, if any.', options: summonings },
  rank: { id: 'rank', name: 'Rank / Tier', description: 'Shinobi rank and combat tier.', options: ranks },
  personality: { id: 'personality', name: 'Personality', description: 'Multi-dimensional personality profile.', options: personalities },
  weakness: { id: 'weakness', name: 'Weakness', description: 'Meaningful limitation for counterplay.', options: weaknesses },
  fate: { id: 'fate', name: 'Fate', description: 'Narrative hook or destiny.', options: fates },
  reputation: { id: 'reputation', name: 'Reputation', description: 'How others perceive the shinobi.', options: reputations },
};

const SECTIONS: { title: string; keys: SpinKey[] }[] = [
  { title: 'Identity & Timeline', keys: ['era', 'alignment', 'title'] },
  { title: 'Origin & Heritage', keys: ['clan', 'heritage', 'bloodline'] },
  { title: 'Powers & Abilities', keys: ['dojutsu', 'chakra', 'summoning'] },
  { title: 'Combat Profile', keys: ['fightingStyle', 'rank'] },
  { title: 'Personality & Weakness', keys: ['personality', 'weakness', 'fate'] },
];

function SpinSection({ title, keys, character, spinningKey, handleSpin, loading, resultFor }: SpinSectionProps) {
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.6rem', color: '#38bdf8' }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
        {keys.map((key) => {
          const spin = SPINS[key];
          const result = resultFor(key);
          const spinning = spinningKey === key;
          return (
            <SpinCard
              key={key}
              spin={{ id: spin.id, name: spin.name, description: spin.description }}
              result={result}
              options={spin.options}
              onSpin={() => handleSpin(key)}
              spinning={spinning}
              disabled={loading}
              reducedMotion
            />
          );
        })}
      </div>
    </div>
  );
}

export default function GeneratorPage() {
  const navigate = useNavigate();
  const { generate, reroll, character, loading, error } = useGeneration();
  const [name, setName] = useState('');
  const [nameSource, setNameSource] = useState<'manual' | 'generated'>('manual');
  const [mode, setMode] = useState<'strict' | 'au'>('strict');
  const [spinningKey, setSpinningKey] = useState<SpinKey | null>(null);

  const handleGenerate = useCallback(() => {
    generate({
      mode,
      name: name || undefined,
      nameSource,
    });
  }, [generate, mode, name, nameSource]);

  const handleSpin = useCallback((key: SpinKey) => {
    setSpinningKey(key);
    reroll({
      mode,
      name,
      nameSource,
    });
  }, [reroll, mode, name, nameSource]);

  const handleSave = useCallback(() => {
    if (!character) return;
    navigate(`/character/${character.id}`);
  }, [character, navigate]);

  const resultFor = useCallback((key: SpinKey) => {
    if (!character) return null;
    const map: Record<SpinKey, any> = {
      era: character.era,
      alignment: character.alignment,
      title: character.title,
      clan: character.clan,
      heritage: character.heritage.status,
      bloodline: character.bloodline.trait,
      dojutsu: character.dojutsu.eye,
      chakra: character.chakra.primary,
      fightingStyle: character.fightingStyle.primary,
      summoning: character.summoning.contract,
      rank: character.rank.rank,
      personality: { id: 'p', label: character.personality.primaryTrait, category: '', rarity: 'Common' as const, sourceStatus: 'game-original' as const, description: '' },
      weakness: character.weaknesses[0] ? { id: 'w', label: character.weaknesses[0].label, category: '', rarity: 'Common' as const, sourceStatus: 'game-original' as const, description: character.weaknesses[0].description } : null,
      fate: character.fate,
      reputation: { id: 'r', label: character.reputation.label, category: '', rarity: 'Common' as const, sourceStatus: 'game-original' as const, description: character.reputation.description },
    };
    return map[key] || null;
  }, [character]);

  if (error) {
    return (
      <div className="page container">
        <div className="card alert alert-error">{error}</div>
        <button className="btn btn-secondary" onClick={handleGenerate}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="page container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Character Generator</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Spin attributes to build a shinobi dossier.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginRight: '0.5rem' }}>Mode:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="form-input"
            style={{ width: '120px', minHeight: '44px' }}
          >
            <option value="strict">Strict (lore)</option>
            <option value="au">AU (custom)</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          placeholder="Character name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, minWidth: '200px', minHeight: '44px' }}
        />
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading} style={{ minHeight: '44px' }}>
          {loading ? 'Generating...' : 'Generate All'}
        </button>
      </div>

      {SECTIONS.map((section) => (
        <SpinSection
          key={section.title}
          title={section.title}
          keys={section.keys}
          character={character}
          spinningKey={spinningKey}
          handleSpin={handleSpin}
          loading={loading}
          resultFor={resultFor}
        />
      ))}

      {character && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.6rem' }}>Preview</h3>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{character.name}</div>
            <div style={{ color: '#94a3b8', marginBottom: '0.4rem' }}>{character.title.label} • {character.era.label}</div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              {character.clan.label} • {character.fightingStyle.primary.label} • Rank {character.rank.rank.label} (Tier {character.rank.combatTier})
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ minHeight: '44px', flex: 1 }}>
              Save to Collection
            </button>
            <button className="btn btn-secondary" onClick={handleGenerate} disabled={loading} style={{ minHeight: '44px' }}>
              Generate All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
