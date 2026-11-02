import React, { useCallback, useState } from 'react';
import { loadSettings, saveSettings, exportCollection, importCollection, resetCollection } from '@/engine/persistence';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(loadSettings());
  const [msg, setMsg] = useState<string>('');

  const handleSave = useCallback(() => {
    saveSettings(settings);
    setMsg('Settings saved.');
    setTimeout(() => setMsg(''), 2000);
  }, [settings]);

  const handleExport = useCallback(() => {
    const json = exportCollection();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shinobi-genesis-collection.json';
    a.click();
    URL.revokeObjectURL(url);
    setMsg('Collection exported.');
  }, []);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { success, characters, errors } = importCollection(text);
      if (success) {
        setMsg(`Imported ${characters.length} characters.`);
      } else {
        setMsg(errors.join(' '));
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="page container">
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Settings</h2>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Preferences</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={settings.animation} onChange={(e) => setSettings({ ...settings, animation: e.target.checked })} />
          Enable animations
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>
          <input type="checkbox" checked={settings.reducedMotion} onChange={(e) => setSettings({ ...settings, reducedMotion: e.target.checked })} />
          Reduced motion
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>
          <input type="checkbox" checked={settings.sound} onChange={(e) => setSettings({ ...settings, sound: e.target.checked })} />
          Sound (deferred)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>
          Theme{' '}
          <select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value as any })} style={{ minHeight: '36px' }}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
        <button className="btn btn-secondary" onClick={handleSave} style={{ marginTop: '0.75rem', minHeight: '40px' }}>
          Save
        </button>
        {msg && <div style={{ marginTop: '0.5rem', color: '#4ade80', fontSize: '0.85rem' }}>{msg}</div>}
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Data Management</h3>
        <button className="btn btn-secondary" onClick={handleExport} style={{ marginBottom: '0.5rem', minHeight: '40px', width: '100%' }}>
          Export Collection (JSON)
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
          <input type="file" accept=".json" onChange={handleImport} style={{ flex: 1 }} />
          <button className="btn btn-primary" style={{ minHeight: '40px' }}>Import</button>
        </label>
      </div>

      <div className="card alert alert-error">
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Danger Zone</h3>
        <p style={{ fontSize: '0.85rem', marginBottom: '0.6rem' }}>
          LocalStorage data is stored in your browser and may be cleared when browser data is deleted.
        </p>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm('Reset all local data? This cannot be undone.')) {
              resetCollection();
              setMsg('All local data cleared.');
            }
          }}
          style={{ minHeight: '40px', width: '100%' }}
        >
          Reset Local Data
        </button>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
        <div>Shinobi Genesis v0.1.0</div>
        <div>Dataset version: 1.0.0</div>
        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}>
          Fan project — not affiliated with Naruto rights holders. Canon references are used for
          reference only; original characters are labeled OC/AU.
        </div>
      </div>
    </div>
  );
}
