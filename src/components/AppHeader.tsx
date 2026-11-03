import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { THEME_OPTIONS, useTheme } from '@/theme/ThemeContext';

function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, setTheme, reducedMotion, setReducedMotion, mode, setMode } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (panelRef.current && target && !panelRef.current.contains(target)) {
        onClose();
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="settings-panel" id="sg-settings-panel" ref={panelRef} role="dialog" aria-label="Pengaturan tampilan">
      <div className="eyebrow">Pengaturan</div>

      <label className="settings-label" htmlFor="sg-theme-select">Tema latar</label>
      <select
        id="sg-theme-select"
        className="settings-select"
        value={theme}
        onChange={(event) => setTheme(event.target.value as typeof theme)}
      >
        {THEME_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>

      <label className="settings-label" htmlFor="sg-mode-select">Mode data</label>
      <select
        id="sg-mode-select"
        className="settings-select"
        value={mode}
        onChange={(event) => setMode(event.target.value as typeof mode)}
      >
        <option value="strict">Lore ketat — tanpa OC</option>
        <option value="au">Alternatif — OC aktif</option>
      </select>
      <small className="settings-hint">Berlaku untuk undian berikutnya.</small>

      <label className="settings-check">
        <input
          type="checkbox"
          checked={reducedMotion}
          onChange={(event) => setReducedMotion(event.target.checked)}
        />
        <span>
          Kurangi gerakan
          <small>Roda berputar lebih singkat.</small>
        </span>
      </label>

      <Link className="settings-link" to="/settings" onClick={onClose}>
        Data &amp; penyimpanan →
      </Link>
    </div>
  );
}

export function AppHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <Link className="brand" to="/generator" aria-label="Shinobi Genesis — generator">
        <span className="brand-mark" aria-hidden="true">🍥</span>
        <span>
          <span className="brand-name">SHINOBI GENESIS</span>
          <small className="brand-sub">NARUTO RNG · FAN GAME</small>
        </span>
      </Link>

      <nav className="site-nav" aria-label="Navigasi utama">
        <NavLink to="/generator" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Generator
        </NavLink>
        <NavLink to="/collection" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Koleksi
        </NavLink>
        <NavLink to="/arena" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Arena
        </NavLink>
      </nav>

      <div className="settings-anchor">
        <button
          type="button"
          className="icon-button"
          aria-expanded={settingsOpen}
          aria-controls="sg-settings-panel"
          aria-label={settingsOpen ? 'Tutup pengaturan' : 'Buka pengaturan'}
          title="Pengaturan"
          onClick={() => setSettingsOpen((value) => !value)}
        >
          <span aria-hidden="true">⚙</span>
        </button>
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </header>
  );
}
