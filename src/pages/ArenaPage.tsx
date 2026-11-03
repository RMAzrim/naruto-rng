import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadCollection } from '@/engine/persistence';
import { simulateBattle } from '@/engine/battle';
import type { Character } from '@/types';

export default function ArenaPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [result, setResult] = useState<any>(null);
  const [battling, setBattling] = useState(false);

  const reload = useCallback(() => setCharacters(loadCollection()), []);

  useEffect(() => {
    reload();
  }, [reload]);

  const c1 = characters.find((character) => character.id === p1);
  const c2 = characters.find((character) => character.id === p2);

  function runBattle() {
    if (!c1 || !c2) return;
    setBattling(true);
    const seed = `battle-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const battleResult = simulateBattle(c1, c2, seed, { maxTurns: 50 });
    setResult(battleResult);
    setBattling(false);
  }

  return (
    <div className="page container">
      <div className="eyebrow">Simulasi 1v1</div>
      <h1 style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>Arena</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: 1.55 }}>
        Pilih dua karakter tersimpan untuk simulasi turn-based deterministik. Hasilnya adalah
        simulasi game, bukan fakta kanon.
      </p>

      {characters.length < 2 ? (
        <div className="card empty-state">
          <p>Butuh minimal dua karakter di koleksi untuk memulai pertarungan.</p>
          <Link className="btn btn-primary" to="/generator" style={{ marginTop: '0.9rem' }}>
            Buat karakter
          </Link>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="arena-fighters">
              <div style={{ padding: '0.25rem', textAlign: 'center' }}>
                <label className="label" htmlFor="fighter-1">Petarung 1</label>
                <select
                  id="fighter-1"
                  value={p1}
                  onChange={(event) => setP1(event.target.value)}
                  className="form-input"
                  style={{ marginBottom: '0.5rem' }}
                >
                  <option value="">Pilih karakter</option>
                  {characters.map((character) => (
                    <option key={character.id} value={character.id}>{character.name}</option>
                  ))}
                </select>
                {c1 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {c1.rank.rank.label} (Tier {c1.rank.combatTier}) · {c1.fightingStyle.primary.label} · Power {Math.round(c1.combatRating.score)}
                  </div>
                )}
              </div>

              <div style={{ padding: '0.25rem', textAlign: 'center' }}>
                <label className="label" htmlFor="fighter-2">Petarung 2</label>
                <select
                  id="fighter-2"
                  value={p2}
                  onChange={(event) => setP2(event.target.value)}
                  className="form-input"
                  style={{ marginBottom: '0.5rem' }}
                >
                  <option value="">Pilih karakter</option>
                  {characters.map((character) => (
                    <option key={character.id} value={character.id}>{character.name}</option>
                  ))}
                </select>
                {c2 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {c2.rank.rank.label} (Tier {c2.rank.combatTier}) · {c2.fightingStyle.primary.label} · Power {Math.round(c2.combatRating.score)}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '0.9rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={runBattle}
                disabled={battling || !p1 || !p2 || p1 === p2}
              >
                {battling ? 'Mensimulasikan…' : 'Mulai pertarungan'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setResult(null)}
                disabled={!result}
              >
                Reset hasil
              </button>
            </div>
          </div>

          {result && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>
                    {result.winner === 'draw' ? 'Seri' : `${result.winner === 'player1' ? c1?.name : c2?.name} menang`}
                  </strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  {result.turns} turn · HP P1 {Math.round(result.remainingP1)} / P2 {Math.round(result.remainingP2)}
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.55 }}>
                {result.decisiveFactors.join(' ')}
              </div>

              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Log pertarungan</h3>
              <div
                style={{
                  maxHeight: '320px',
                  overflowY: 'auto',
                  fontSize: '0.8rem',
                  fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
                  background: 'var(--panel-b)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                }}
              >
                {result.log.map((entry: any, index: number) => (
                  <div
                    key={index}
                    style={{ marginBottom: '0.45rem', paddingBottom: '0.45rem', borderBottom: '1px solid var(--accent-border)' }}
                  >
                    <span style={{ color: 'var(--accent)', fontWeight: 800 }}>T{entry.turn}</span>{' '}
                    <span style={{ color: 'var(--ink)' }}>{entry.actor}</span>{' → '}
                    <span style={{ color: 'var(--muted)' }}>{entry.target}</span>
                    <span style={{ color: 'var(--muted)', opacity: 0.7 }}> [{entry.action}]</span>{' '}
                    <span style={{ color: 'var(--success)' }}>{entry.result}</span>
                    {entry.damage > 0 ? ` (${entry.damage} dmg)` : ''}
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                      {entry.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
