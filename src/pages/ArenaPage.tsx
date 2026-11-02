import React, { useCallback, useState } from 'react';
import { loadCollection } from '@/engine/persistence';
import { simulateBattle } from '@/engine/battle';

export default function ArenaPage() {
  const [characters, setCharacters] = useState<any[]>([]);
  const [p1, setP1] = useState<string>('');
  const [p2, setP2] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [battling, setBattling] = useState(false);

  const reload = useCallback(() => setCharacters(loadCollection()), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { reload(); }, []);

  const c1 = characters.find((c) => c.id === p1);
  const c2 = characters.find((c) => c.id === p2);

  return (
    <div className="page container">
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Arena — 1v1 Battle</h2>
      <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Select two saved characters for a deterministic turn-based simulation. Result is a game
        simulation, not canon fact.
      </p>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', alignItems: 'start' }}>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <label className="label">Fighter 1</label>
            <select
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              className="form-input"
              style={{ minHeight: '44px', marginBottom: '0.5rem' }}
            >
              <option value="">Select character</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {c1 && (
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                {c1.rank.rank.label} (Tier {c1.rank.combatTier}) • {c1.fightingStyle.primary.label}
              </div>
            )}
          </div>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <label className="label">Fighter 2</label>
            <select
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              className="form-input"
              style={{ minHeight: '44px', marginBottom: '0.5rem' }}
            >
              <option value="">Select character</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {c2 && (
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                {c2.rank.rank.label} (Tier {c2.rank.combatTier}) • {c2.fightingStyle.primary.label}
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={runBattle}
            disabled={battling || !p1 || !p2 || p1 === p2}
            style={{ minHeight: '44px' }}
          >
            {battling ? 'Simulating...' : 'Start Battle'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setResult(null)}
            disabled={!result}
            style={{ minHeight: '44px' }}
          >
            New Battle
          </button>
        </div>
      </div>

      {result && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong style={{ fontSize: '1.1rem' }}>
                {result.winner === 'draw' ? 'Draw' : result.winner === 'player1' ? c1?.name : c2?.name} wins
              </strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {result.turns} turns • P1 HP {Math.round(result.remainingP1)} / P2 HP {Math.round(result.remainingP2)}
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
            {result.decisiveFactors.join(' ')}
          </div>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Battle Log</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', fontSize: '0.85rem', fontFamily: 'monospace', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.75rem' }}>
            {result.log.map((e: any, i: number) => (
              <div key={i} style={{ marginBottom: '0.4rem', paddingBottom: '0.4rem', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#38bdf8', fontWeight: '700' }}>T{e.turn}</span>
                {' '}
                <span style={{ color: '#cbd5e1' }}>{e.actor}</span>
                {' → '}
                <span style={{ color: '#94a3b8' }}>{e.target}</span>
                <span style={{ color: '#64748b' }}> [{e.action}]</span>
                {' '}
                <span style={{ color: '#4ade80' }}>{e.result}</span>
                {e.damage > 0 ? ` (${e.damage} dmg)` : ''}
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.15rem' }}>{e.explanation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  function runBattle() {
    if (!c1 || !c2) return;
    setBattling(true);
    const seed = `battle-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const res = simulateBattle(c1, c2, seed, { maxTurns: 50 });
    setResult(res);
    setBattling(false);
  }
}
