import type { Character } from '@/types';

interface CharacterCardProps {
  character: Character;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CharacterCard({ character, onSelect, onDelete }: CharacterCardProps) {
  return (
    <div className="card" style={{ minHeight: '44px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: '1.05rem', overflowWrap: 'anywhere' }}>{character.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            {character.era.label} · {character.rank.rank.label} · Tier {character.rank.combatTier}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem', opacity: 0.8 }}>
            {character.clan.label} · {character.fightingStyle.primary.label}
          </div>
        </div>
        <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
          <div style={{ color: 'var(--accent)', fontSize: '1.35rem', fontWeight: 1000, lineHeight: 1 }}>
            {Math.round(character.combatRating.score)}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            power
          </div>
        </div>
      </div>

      <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span className={`badge ${character.title.rarity.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
          {character.title.rarity}
        </span>
        <span style={{ fontSize: '0.82rem', color: 'var(--ink)' }}>{character.title.label}</span>
      </div>

      <div style={{ marginTop: '0.7rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-secondary"
          onClick={() => onSelect(character.id)}
          style={{ minHeight: '36px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          Lihat
        </button>
        <button
          className="btn btn-danger"
          onClick={() => onDelete(character.id)}
          style={{ minHeight: '36px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
