import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteCharacter, getCharacter } from '@/engine/persistence';
import type { Character } from '@/types';

const STAT_ROWS: [keyof Character['stats'], string][] = [
  ['ninjutsu', 'Ninjutsu'],
  ['taijutsu', 'Taijutsu'],
  ['genjutsu', 'Genjutsu'],
  ['kenjutsu', 'Kenjutsu'],
  ['chakraControl', 'Kontrol chakra'],
  ['chakraReserves', 'Cadangan chakra'],
  ['speed', 'Kecepatan'],
  ['strength', 'Kekuatan'],
  ['durability', 'Daya tahan'],
  ['intelligence', 'Kecerdasan'],
  ['perception', 'Persepsi'],
  ['stamina', 'Stamina'],
];

function powerClass(tier: number): string {
  if (tier >= 5) return 'Kelas Kage';
  if (tier >= 4) return 'Elit Jōnin';
  if (tier >= 3) return 'Chūnin';
  if (tier >= 2) return 'Genin';
  if (tier >= 1) return 'Akademi';
  return 'Sipil';
}

export default function CharacterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = id ? getCharacter(id) : undefined;
    setCharacter(found ?? null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div className="page container"><div className="card">Memuat dossier…</div></div>;
  }

  if (!character) {
    return (
      <div className="page container">
        <div className="card alert alert-error">Karakter tidak ditemukan.</div>
        <button className="btn btn-secondary" onClick={() => navigate('/collection')}>
          Kembali ke koleksi
        </button>
      </div>
    );
  }

  return (
    <div className="page container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div className="eyebrow">Dossier shinobi</div>
          <h1 style={{ fontSize: '1.35rem' }}>{character.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/collection')}>
            Kembali
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (confirm(`Hapus ${character.name} dari koleksi?`)) {
                deleteCharacter(character.id);
                navigate('/collection');
              }
            }}
          >
            Hapus
          </button>
        </div>
      </div>

      <section className="card dossier-hero">
        <div>
          <h2 className="dossier-name">{character.name}</h2>
          <div className="dossier-meta">
            <span className={`badge ${character.title.rarity.toLowerCase()}`}>{character.title.rarity}</span>
            <span>{character.canonStatus.toUpperCase()}</span>
            <span>{character.mode.toUpperCase()}</span>
            <span>{character.era.label}</span>
          </div>
          <p className="dossier-title">{character.title.label}</p>
          <p className="dossier-sub">
            {character.clan.label} · {character.rank.rank.label} · {character.fightingStyle.primary.label}
          </p>
        </div>

        <div className="dossier-power">
          <span>Kekuatan</span>
          <strong>{Math.round(character.combatRating.score)}</strong>
          <small>{powerClass(character.rank.combatTier)}</small>
        </div>
      </section>

      <div className="grid" style={{ marginTop: '1rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.6rem', color: 'var(--accent)' }}>Identitas</h3>
          <div className="dossier-list">
            <div><strong>Nama:</strong> {character.name}</div>
            <div><strong>Sumber nama:</strong> {character.nameSource === 'manual' ? 'ditulis pemain' : 'diacak'}</div>
            <div><strong>Alignment:</strong> {character.alignment.label}</div>
            <div><strong>Title:</strong> {character.title.label}</div>
            <div><strong>Fate:</strong> {character.fate.label}</div>
            <div><strong>Reputasi:</strong> {character.reputation.label}</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.6rem', color: 'var(--accent)' }}>Asal &amp; warisan</h3>
          <div className="dossier-list">
            <div><strong>Lahir di:</strong> {character.origin.birthplace.label}</div>
            <div><strong>Dibesarkan di:</strong> {character.origin.raisedIn.label}</div>
            <div><strong>Klan:</strong> {character.clan.label}</div>
            <div><strong>Status warisan:</strong> {character.heritage.status.label} ({character.heritage.confidence})</div>
            <div><strong>Sifat darah:</strong> {character.bloodline.trait.label} ({character.bloodline.state})</div>
            {character.clan.buffs && character.clan.buffs.length > 0 && (
              <div><strong>Buff klan:</strong> {character.clan.buffs.join(' · ')}</div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.6rem', color: 'var(--accent)' }}>Kemampuan</h3>
          <div className="dossier-list">
            <div><strong>Dōjutsu:</strong> {character.dojutsu.eye.label} ({character.dojutsu.stage})</div>
            {character.sharinganTomoe && (
              <div><strong>Sharingan:</strong> {character.sharinganTomoe} tomoe</div>
            )}
            {character.mangekyoAbility && (
              <div><strong>Mangekyō:</strong> {character.mangekyoAbility}</div>
            )}
            {character.susanooStage && (
              <div><strong>Susanoo:</strong> {character.susanooStage}</div>
            )}
            {character.byakuganMastery && (
              <div><strong>Byakugan mastery:</strong> {character.byakuganMastery}</div>
            )}
            {character.tenseiganMastery && (
              <div><strong>Tenseigan mastery:</strong> {character.tenseiganMastery}</div>
            )}
            {character.rinneganPath && (
              <div><strong>Rinnegan path:</strong> {character.rinneganPath}</div>
            )}
            <div>
              <strong>Chakra:</strong> {character.chakra.natureCount ?? 1} elemen ·{' '}
              {character.chakra.primary.label}
              {character.chakra.secondary ? ` + ${character.chakra.secondary.label}` : ''}
              {character.chakra.additional?.length
                ? ` · +${character.chakra.additional.length}`
                : ''}
              {character.chakra.combined ? ` · Gabungan: ${character.chakra.combined.label}` : ''}
            </div>
            <div>
              <strong>Jinchuriki:</strong>{' '}
              {character.jinchuriki?.isJinchuriki && character.jinchuriki.tailedBeast
                ? `${character.jinchuriki.tailedBeast.label} · ${character.jinchuriki.mastery?.label ?? 'Uncontrolled'}`
                : 'Bukan jinchuriki'}
            </div>
            {(character.woodRelease || character.iceRelease) && (
              <div>
                <strong>Kekkei Genkai:</strong>{' '}
                {[character.woodRelease ? 'Wood Release' : null, character.iceRelease ? 'Ice Release' : null]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            )}
            <div><strong>Gaya:</strong> {character.fightingStyle.primary.label}</div>
            <div><strong>Summoning:</strong> {character.summoning.contract.label} ({character.summoning.proficiency})</div>
            <div><strong>Kemampuan:</strong> {character.abilities.map((ability) => ability.name).join(', ') || '—'}</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.6rem', color: 'var(--accent)' }}>Kepribadian &amp; kelemahan</h3>
          <div className="dossier-list">
            <div><strong>Sifat utama:</strong> {character.personality.primaryTrait}</div>
            <div><strong>Sekunder:</strong> {character.personality.secondaryTraits.join(', ') || '—'}</div>
            <div><strong>Motivasi:</strong> {character.personality.motivation}</div>
            {character.weaknesses.map((weakness) => (
              <div key={weakness.id}>
                <strong>Kelemahan:</strong> {weakness.label} — {weakness.description}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.7rem', color: 'var(--accent)' }}>Statistik tempur</h3>
        <div className="stat-lines">
          {STAT_ROWS.map(([key, label]) => (
            <div className="stat-line" key={key}>
              <span>{label}</span>
              <span className="bar"><i style={{ width: `${character.stats[key]}%` }} /></span>
              <strong>{character.stats[key]}</strong>
            </div>
          ))}
        </div>
        <p className="power-note" style={{ marginTop: '0.8rem' }}>
          Combat rating {character.combatRating.score} — {character.combatRating.explanation}
        </p>
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>Validasi</h3>
        <div style={{ fontSize: '0.85rem', color: character.validation.valid ? 'var(--success)' : 'var(--danger)' }}>
          {character.validation.valid ? 'Valid — tidak ada error.' : 'Ada masalah validasi.'}
        </div>
        {character.validation.warnings.length > 0 && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--accent)' }}>
            <strong>Peringatan:</strong> {character.validation.warnings.map((warning) => warning.message).join('; ')}
          </div>
        )}
        {character.validation.errors.length > 0 && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--danger)' }}>
            <strong>Error:</strong> {character.validation.errors.map((error) => error.message).join('; ')}
          </div>
        )}
      </section>
    </div>
  );
}
