import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ThemeName = 'naruto' | 'sasuke' | 'sakura' | 'smooth';
export type DataMode = 'strict' | 'au';

const THEME_KEY = 'shinobi-genesis:theme:v1';
const MOTION_KEY = 'shinobi-genesis:reduced-motion:v1';
const MODE_KEY = 'shinobi-genesis:data-mode:v1';

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  mode: DataMode;
  setMode: (mode: DataMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'naruto' || stored === 'sasuke' || stored === 'sakura' || stored === 'smooth') {
      return stored;
    }
  } catch {
    // LocalStorage can be unavailable in private mode.
  }
  return 'naruto';
}

function readReducedMotion(): boolean {
  try {
    const stored = localStorage.getItem(MOTION_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch {
    // ignore
  }
  return typeof window !== 'undefined'
    ? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    : false;
}

function readMode(): DataMode {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === 'strict' || stored === 'au') return stored;
  } catch {
    // ignore
  }
  return 'strict';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(readTheme);
  const [reducedMotion, setReducedMotion] = useState<boolean>(readReducedMotion);
  const [mode, setMode] = useState<DataMode>(readMode);

  useEffect(() => {
    document.body.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    document.body.dataset.reducedMotion = String(reducedMotion);
    try {
      localStorage.setItem(MOTION_KEY, String(reducedMotion));
    } catch {
      // ignore
    }
  }, [reducedMotion]);

  useEffect(() => {
    document.body.dataset.mode = mode;
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  const changeTheme = useCallback((next: ThemeName) => setTheme(next), []);
  const changeMotion = useCallback((next: boolean) => setReducedMotion(next), []);
  const changeMode = useCallback((next: DataMode) => setMode(next), []);

  const value = useMemo(
    () => ({
      theme,
      setTheme: changeTheme,
      reducedMotion,
      setReducedMotion: changeMotion,
      mode,
      setMode: changeMode,
    }),
    [theme, changeTheme, reducedMotion, changeMotion, mode, changeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}

export const THEME_OPTIONS: { id: ThemeName; label: string }[] = [
  { id: 'naruto', label: 'Naruto — oranye senja' },
  { id: 'sasuke', label: 'Sasuke — biru chidori' },
  { id: 'sakura', label: 'Sakura — merah muda' },
  { id: 'smooth', label: 'Smooth Black' },
];
