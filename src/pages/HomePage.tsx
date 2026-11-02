import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="page container">
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Shinobi Genesis</h1>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          Naruto-inspired RNG character generator and 1v1 battle simulator. Generate a coherent
          shinobi dossier, save your collection, and test characters in the Arena.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/generator" className="btn btn-primary" style={{ minHeight: '48px', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            Create Character
          </Link>
          <Link to="/collection" className="btn btn-secondary" style={{ minHeight: '48px', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            Collection
          </Link>
          <Link to="/arena" className="btn btn-secondary" style={{ minHeight: '48px', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            Arena
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>How it works</h2>
        <div className="grid">
          <div className="card" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>1. Generate</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              Spin each attribute wheel. The engine picks the result first, then the wheel animates
              to it. No two spins decide each other's outcome.
            </p>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>2. Collect</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              Save your character to LocalStorage. Export/import your collection as JSON anytime.
            </p>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>3. Battle</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              Two saved characters fight in a deterministic 1v1 simulation. Fighting style and
              weaknesses shape the outcome.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
