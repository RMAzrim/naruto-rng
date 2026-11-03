import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/theme/ThemeContext';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import GeneratorPage from './pages/GeneratorPage';
import CharacterPage from './pages/CharacterPage';
import ArenaPage from './pages/ArenaPage';
import CollectionPage from './pages/CollectionPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<AppLayout />}>
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/character/:id" element={<CharacterPage />} />
            <Route path="/arena" element={<ArenaPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}
