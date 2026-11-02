import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCharacter, deleteCharacter } from '@/engine/persistence';

export default function CharacterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const c = id ? getCharacter(id) : undefined;
    setCharacter(c ?? null);
    setLoading(false);
  }, [id]);

  if (loading) return <div className="page container">Loading...</div>;
  if (!character) {
    return (
      <div className="page container">
        <div className="card alert alert-error">Character not found.</div>
        <button className="btn btn-secondary" onClick={() => navigate('/collection')}>
          Back to Collection
        </button>
      </div>
    );
  }

  return (
    <div className="page container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Character Dossier</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/collection')} style={{ minHeight: '44px' }}>
            Back
          </button>
          <button className="btn btn-danger" onClick={() => { if (confirm('Delete this character?')) { deleteCharacter(id!); navigate('/collection'); } }} style={{ minHeight: '44px' }}>
            Delete
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{character.name}</div>
        <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
          <span className={`badge ${character.title.rarity.toLowerCase()}`}>{character.title.rarity}</span>
          {' '}
          {character.canonStatus.toUpperCase()} • {character.mode.toUpperCase()}
        </div>
        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{character.title.label}</div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          {character.era.label} • {character.rank.rank.label} • Combat Tier {character.rank.combatTier}
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Identity</h3>
          <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            <div><strong>Name:</strong> {character.name}</div>
            <div><strong>Name source:</strong> {character.nameSource}</div>
            <div><strong>Alignment:</strong> {character.alignment.label}</div>
            <div><strong>Title:</strong> {character.title.label}</div>
            <div><strong>Fate:</strong> {character.fate.label}</div>
            <div><strong>Reputation:</strong> {character.reputation.label}</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Origin & Heritage</h3>
          <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            <div><strong>Birthplace:</strong> {character.origin.birthplace.label}</div>
            <div><strong>Raised in:</strong> {character.origin.raisedIn.label}</div>
            <div><strong>Clan:</strong> {character.clan.label}</div>
            <div><strong>Heritage:</strong> {character.heritage.status.label} ({character.heritage.confidence})</div>
            <div><strong>Bloodline:</strong> {character.bloodline.trait.label} ({character.bloodline.state})</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Abilities</h3>
          <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            <div><strong>Dojutsu:</strong> {character.dojutsu.eye.label} ({character.dojutsu.stage})</div>
            <div><strong>Chakra:</strong> {character.chakra.primary.label} {character.chakra.secondary ? ' + ' + character.chakra.secondary.label : ''}</div>
            <div><strong>Fighting style:</strong> {character.fightingStyle.primary.label}</div>
            <div><strong>Summoning:</strong> {character.summoning.contract.label} ({character.summoning.proficiency})</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Personality & Weakness</h3>
          <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            <div><strong>Primary trait:</strong> {character.personality.primaryTrait}</div>
            <div><strong>Secondary:</strong> {character.personality.secondaryTraits.join(', ') || '—'}</div>
            <div><strong>Motivation:</strong> {character.personality.motivation}</div>
            {character.weaknesses.map((w: any, i: number) => (
              <div key={i}><strong>Weakness {i + 1}:</strong> {w.label} — {w.description}</div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Combat Stats</h3>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.8' }}>
            <div><strong>Ninjutsu:</strong> {character.stats.ninjutsu}</div>
            <div><strong>Taijutsu:</strong> {character.stats.taijutsu}</div>
            <div><strong>Genjutsu:</strong> {character.stats.genjutsu}</div>
            <div><strong>Kenjutsu:</strong> {character.stats.kenjutsu}</div>
            <div><strong>Chakra Control:</strong> {character.stats.chakraControl}</div>
            <div><strong>Chakra Reserves:</strong> {character.stats.chakraReserves}</div>
            <div><strong>Speed:</strong> {character.stats.speed}</div>
            <div><strong>Strength:</strong> {character.stats.strength}</div>
            <div><strong>Durability:</strong> {character.stats.durability}</div>
            <div><strong>Intelligence:</strong> {character.stats.intelligence}</div>
            <div><strong>Perception:</strong> {character.stats.perception}</div>
            <div><strong>Stamina:</strong> {character.stats.stamina}</div>
          </div>
          <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: '#38bdf8' }}>
            <strong>Combat Rating:</strong> {character.combatRating.score}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>{character.combatRating.explanation}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Validation</h3>
        <div style={{ fontSize: '0.85rem', color: character.validation.valid ? '#4ade80' : '#f87171' }}>
          {character.validation.valid ? 'Valid — no errors.' : 'Has validation issues.'}
        </div>
        {character.validation.warnings.length > 0 && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#fbbf24' }}>
            <strong>Warnings:</strong> {character.validation.warnings.map((w: any) => w.message).join('; ')}
          </div>
        )}
        {character.validation.errors.length > 0 && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#f87171' }}>
            <strong>Errors:</strong> {character.validation.errors.map((e: any) => e.message).join('; ')}
          </div>
        )}
      </div>
    </div>
  );
}
