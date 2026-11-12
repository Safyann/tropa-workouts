export const themeOptions = ['system', 'light', 'dark'] as const;
export type ThemePreference = (typeof themeOptions)[number];

export const themeStorageKey = 'tropa-theme';
export const systemThemeQuery = '(prefers-color-scheme: dark)';

export function readThemePreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(themeStorageKey);
    return themeOptions.find((theme) => theme === saved) ?? 'system';
  } catch {
    return 'system';
  }
}

export function applyTheme(preference: ThemePreference, systemDark: boolean) {
  const systemTheme = systemDark ? 'dark' : 'light';
  const root = document.documentElement;
  root.dataset.theme = preference === 'system' ? systemTheme : preference;
  const paper = getComputedStyle(root).getPropertyValue('--paper').trim();
  if (paper) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', paper);
}
