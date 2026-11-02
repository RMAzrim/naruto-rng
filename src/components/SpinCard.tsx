import type { SpinOption, SpinResult } from '@/types';

interface SpinCardProps {
  spin: { id: string; name: string; description: string };
  result: SpinResult | null;
  options: SpinOption[];
  onSpin: () => void;
  spinning: boolean;
  onReroll?: () => void;
  reducedMotion?: boolean;
  disabled?: boolean;
}

export function SpinCard({
  spin,
  result,
  options,
  onSpin,
  spinning,
  onReroll,
  reducedMotion = false,
  disabled = false,
}: SpinCardProps) {
  const rarityColor: Record<string, string> = {
    Common: '#94a3b8',
    Uncommon: '#22d3ee',
    Rare: '#38bdf8',
    Epic: '#c084fc',
    Legendary: '#fbbf24',
    Mythic: '#818cf8',
  };

  return (
    <div className="card spin-card">
      <div className="label">{spin.name}</div>
      <p className="spin-description">{spin.description}</p>

      <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {result ? (
          <span
            className={`badge ${result.rarity.toLowerCase()}`}
            style={{ backgroundColor: rarityColor[result.rarity] || '#94a3b8', color: '#000' }}
          >
            {result.rarity}
          </span>
        ) : (
          <span className="badge badge-common" style={{ opacity: 0.5 }}>
            Not rolled
          </span>
        )}
        {result?.sourceStatus === 'oc' && (
          <span className="badge badge-common" style={{ background: '#334155', color: '#94a3b8' }}>
            OC
          </span>
        )}
      </div>

      {result ? (
        <div style={{ fontWeight: '600', marginBottom: '0.6rem', minHeight: '1.2rem' }}>
          {result.label}
        </div>
      ) : (
        <div style={{ color: '#64748b', fontStyle: 'italic', marginBottom: '0.6rem', minHeight: '1.2rem' }}>
          —
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          onClick={onSpin}
          disabled={spinning || disabled}
          style={{ flex: 1, minHeight: '44px' }}
        >
          {spinning ? 'Spinning...' : result ? 'Re-roll' : 'Spin'}
        </button>
        {result && onReroll && (
          <button
            className="btn btn-secondary"
            onClick={onReroll}
            disabled={spinning || disabled}
            style={{ minHeight: '44px' }}
          >
            Reroll
          </button>
        )}
      </div>

      {result?.explanation && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          {result.explanation}
        </div>
      )}
    </div>
  );
}
