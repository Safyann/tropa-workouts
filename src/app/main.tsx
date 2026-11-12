import { createRoot } from 'react-dom/client';
import { applyTheme, readThemePreference, systemThemeQuery } from '../shared/lib/theme';
import { App } from './App';

applyTheme(readThemePreference(), window.matchMedia(systemThemeQuery).matches);
createRoot(document.querySelector('#root')!).render(<App />);
