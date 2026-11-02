import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GeneratorPage from './pages/GeneratorPage';
import CharacterPage from './pages/CharacterPage';
import ArenaPage from './pages/ArenaPage';
import CollectionPage from './pages/CollectionPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generator" element={<GeneratorPage />} />
        <Route path="/character/:id" element={<CharacterPage />} />
        <Route path="/arena" element={<ArenaPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </HashRouter>
  );
}
