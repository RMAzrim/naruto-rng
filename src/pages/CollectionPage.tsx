import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadCollection, deleteCharacter } from '@/engine/persistence';
import { CharacterCard } from '@/components/CharacterCard';

export default function CollectionPage() {
  const [characters, setCharacters] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();

  const reload = useCallback(() => setCharacters(loadCollection()), []);
  useEffect(() => { reload(); }, []);

  const filtered = characters.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = useCallback((id: string) => {
    if (!confirm('Delete this character?')) return;
    deleteCharacter(id);
    setConfirmId(null);
    reload();
  }, [reload]);

  return (
    <div className="page container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Collection</h2>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <input
            className="form-input"
            placeholder="Search by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ minHeight: '44px' }}
          />
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{characters.length} characters saved</div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No characters yet. <a href="/generator" style={{ color: '#38bdf8', fontWeight: '600' }}>Create one</a>.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
          {filtered.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              onSelect={(id) => navigate(`/character/${id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
