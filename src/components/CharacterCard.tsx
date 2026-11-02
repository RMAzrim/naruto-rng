import type { Character } from '@/types';

interface CharacterCardProps {
  character: Character;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CharacterCard({ character, onSelect, onDelete }: CharacterCardProps) {
  return (
    <div className="card" style={{ cursor: 'pointer', minHeight: '44px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{character.name}</div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {character.era.label} • {character.rank.rank.label} • Tier {character.rank.combatTier}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
            {character.clan.label} • {character.fightingStyle.primary.label}
          </div>
        </div>
        <span className={`badge ${character.title.rarity.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
          {character.title.rarity}
        </span>
      </div>
      <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
        {character.title.label}
      </div>
      <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-secondary"
          onClick={(e) => { e.stopPropagation(); onSelect(character.id); }}
          style={{ minHeight: '36px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
        >
          Inspect
        </button>
        <button
          className="btn btn-danger"
          onClick={(e) => { e.stopPropagation(); onDelete(character.id); }}
          style={{ minHeight: '36px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
