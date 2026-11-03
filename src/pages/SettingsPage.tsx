import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { exportCollection, importCollection, resetCollection } from '@/engine/persistence';
import { THEME_OPTIONS, useTheme } from '@/theme/ThemeContext';

export default function SettingsPage() {
  const { theme, setTheme, reducedMotion, setReducedMotion, mode, setMode } = useTheme();
  const [msg, setMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const flash = useCallback((message: string) => {
    setMsg(message);
    window.setTimeout(() => setMsg(''), 2600);
  }, []);

  const handleExport = useCallback(() => {
    const json = exportCollection();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'shinobi-genesis-collection.json';
    anchor.click();
    URL.revokeObjectURL(url);
    flash('Koleksi diekspor sebagai JSON.');
  }, [flash]);

  const handleImport = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const text = loadEvent.target?.result as string;
      const { success, characters, errors } = importCollection(text);
      flash(success ? `${characters.length} karakter diimpor.` : errors.join(' '));
      if (success) window.setTimeout(() => window.location.reload(), 600);
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [flash]);

  return (
    <div className="page container">
      <h1 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>Data &amp; penyimpanan</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
        Semua karakter tersimpan di browser ini. Ekspor JSON untuk pindah perangkat atau cadangan.
      </p>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.95rem', marginBottom: '0.65rem', color: 'var(--accent)' }}>Tampilan</h2>

        <label className="label" htmlFor="settings-theme">Tema latar</label>
        <select
          id="settings-theme"
          className="form-input"
          value={theme}
          onChange={(event) => setTheme(event.target.value as typeof theme)}
        >
          {THEME_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>

        <label className="label" htmlFor="settings-mode" style={{ marginTop: '0.85rem' }}>Mode data</label>
        <select
          id="settings-mode"
          className="form-input"
          value={mode}
          onChange={(event) => setMode(event.target.value as typeof mode)}
        >
          <option value="strict">Lore ketat — tanpa OC</option>
          <option value="au">Alternatif — OC aktif</option>
        </select>
        <p style={{ marginTop: '0.35rem', color: 'var(--muted)', fontSize: '0.75rem' }}>
          Berlaku untuk undian berikutnya.
        </p>

        <label
          style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', marginTop: '0.85rem', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(event) => setReducedMotion(event.target.checked)}
            style={{ marginTop: '0.2rem', accentColor: 'var(--accent)' }}
          />
          <span>
            Kurangi gerakan
            <small style={{ display: 'block', color: 'var(--muted)', fontSize: '0.75rem' }}>
              Animasi roda dipersingkat dan transisi dimatikan.
            </small>
          </span>
        </label>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.95rem', marginBottom: '0.65rem', color: 'var(--accent)' }}>Koleksi karakter</h2>
        <button className="btn btn-secondary" onClick={handleExport} style={{ width: '100%', marginBottom: '0.55rem' }}>
          Ekspor koleksi (JSON)
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
        <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} style={{ width: '100%' }}>
          Impor koleksi (JSON)
        </button>

        {msg && (
          <div style={{ marginTop: '0.65rem', color: 'var(--success)', fontSize: '0.82rem' }}>
            {msg}
          </div>
        )}
      </div>

      <div className="card" style={{ borderColor: 'rgba(255,107,107,0.35)' }}>
        <h2 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--danger)' }}>Zona berbahaya</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.65rem', lineHeight: 1.55 }}>
          LocalStorage bisa terhapus saat data browser dibersihkan. Ekspor koleksi secara berkala.
        </p>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm('Hapus semua karakter lokal? Tindakan ini tidak bisa dibatalkan.')) {
              resetCollection();
              flash('Semua karakter lokal dihapus.');
            }
          }}
          style={{ width: '100%' }}
        >
          Reset data lokal
        </button>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.7 }}>
        <div>Shinobi Genesis v0.1.0 · dataset 1.0.0</div>
        <div>Fan project — tidak berafiliasi dengan pemegang hak Naruto.</div>
      </div>
    </div>
  );
}
