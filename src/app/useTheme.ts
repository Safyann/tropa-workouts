import { useEffect, useState } from 'react';
import {
  applyTheme,
  readThemePreference,
  systemThemeQuery,
  themeStorageKey,
  type ThemePreference,
} from '../shared/lib/theme';

export function useTheme() {
  const [theme, setTheme] = useState(readThemePreference);

  useEffect(() => {
    const system = window.matchMedia(systemThemeQuery);
    const apply = () => applyTheme(theme, system.matches);
    apply();
    if (theme !== 'system') return;
    system.addEventListener('change', apply);
    return () => system.removeEventListener('change', apply);
  }, [theme]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === null || event.key === themeStorageKey) setTheme(readThemePreference());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function changeTheme(next: ThemePreference) {
    setTheme(next);
    try {
      localStorage.setItem(themeStorageKey, next);
    } catch {
      // При недоступном хранилище выбор действует до перезагрузки.
    }
  }

  return { theme, changeTheme };
}
