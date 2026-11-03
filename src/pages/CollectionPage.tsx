import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteCharacter, loadCollection } from '@/engine/persistence';
import { CharacterCard } from '@/components/CharacterCard';
import type { Character } from '@/types';

export default function CollectionPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const reload = useCallback(() => setCharacters(loadCollection()), []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = characters.filter((character) =>
    character.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = useCallback((id: string) => {
    if (!confirm('Hapus karakter ini dari koleksi?')) return;
    deleteCharacter(id);
    reload();
  }, [reload]);

  return (
    <div className="page container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div className="eyebrow">Arsip shinobi</div>
          <h1 style={{ fontSize: '1.4rem' }}>Koleksi karakter</h1>
        </div>
        <Link className="btn btn-primary" to="/generator">
          + Buat karakter
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          placeholder="Cari nama shinobi…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          style={{ flex: 1, minWidth: '220px' }}
        />
        <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
          {filtered.length} / {characters.length} karakter
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card">
          <p>
            {characters.length === 0
              ? 'Belum ada karakter. Selesaikan roda takdir pertamamu.'
              : 'Tidak ada nama yang cocok dengan pencarian.'}
          </p>
          {characters.length === 0 && (
            <Link className="btn btn-primary" to="/generator" style={{ marginTop: '0.9rem' }}>
              Mulai generator
            </Link>
          )}
        </div>
      ) : (
        <div className="collection-grid">
          {filtered.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onSelect={(id) => navigate(`/character/${id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
