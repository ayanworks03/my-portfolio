export const THEMES = ['teal', 'violet', 'amber', 'rose'] as const;
export type Theme = (typeof THEMES)[number];

// Swatch hex must match the corresponding [data-theme] block in index.css —
// kept here too since the switcher needs to render all four at once.
export const THEME_META: Record<Theme, { label: string; swatch: string }> = {
  teal: { label: 'Teal', swatch: '#5fd4d6' },
  violet: { label: 'Violet', swatch: '#a78bfa' },
  amber: { label: 'Amber', swatch: '#ffb454' },
  rose: { label: 'Rose', swatch: '#ff6fa8' },
};

const STORAGE_KEY = 'theme';

export function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (THEMES as readonly string[]).includes(saved)) return saved as Theme;
  } catch {
    /* localStorage unavailable (private mode, etc.) — fall through to default */
  }
  return 'teal';
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* non-fatal */
  }
}
