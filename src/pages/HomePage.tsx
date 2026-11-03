import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="mode-screen" aria-labelledby="mode-title">
      <div className="mode-card">
        <div className="mode-seal" aria-hidden="true">🍥</div>
        <div className="eyebrow">Naruto-inspired RNG</div>
        <h1 id="mode-title">Pilih mode permainan</h1>
        <p className="mode-intro">
          Ciptakan shinobi dengan roda takdir, simpan dossier-nya, lalu uji di Arena.
          Mode offline berjalan sepenuhnya di browser-mu.
        </p>

        <div className="mode-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/generator')}>
            <span aria-hidden="true">🎲</span> Offline
          </button>
          <button type="button" className="btn btn-secondary" disabled>
            Online — Segera
          </button>
        </div>

        <p className="mode-note">
          Tanpa akun · tanpa server · data tersimpan di LocalStorage
        </p>
      </div>

      <p className="mode-footer">
        Shinobi Genesis · Naruto / Boruto / Two Blue Vortex
      </p>
    </main>
  );
}
