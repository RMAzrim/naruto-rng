import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <AppHeader />
      <Outlet />
      <footer className="app-footer">
        <span>Shinobi Genesis · Naruto / Boruto / Two Blue Vortex</span>
        <span className="app-footer-note">Fan project · tidak berafiliasi dengan pemegang hak Naruto</span>
      </footer>
    </div>
  );
}
