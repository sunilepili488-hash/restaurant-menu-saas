const THEME_PRESENTATION_VARS = [
  '--theme-id',
  '--theme-primary',
  '--theme-action-color',
  '--theme-secondary',
  '--theme-accent',
  '--theme-background',
  '--theme-surface',
  '--theme-text',
  '--theme-muted-text',
  '--theme-soft-surface',
  '--theme-border',
  '--theme-header-bg',
  '--theme-header-border',
  '--theme-card-radius',
  '--theme-button-radius',
  '--theme-pill-radius',
  '--theme-card-shadow',
  '--theme-button-shadow',
  '--theme-heading-font',
  '--theme-body-font',
];

function hexToHsl(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyThemeToCss(restaurant) {
  if (!restaurant) return;

  const root = document.documentElement;
  const { theme_mode, theme_css_vars: themeCssVars } = restaurant;

  // Remove presentation-only values from the previous preview/theme first.
  // This also ensures legacy themes continue to use the application's defaults.
  THEME_PRESENTATION_VARS.forEach((key) => root.style.removeProperty(key));

  if (themeCssVars && typeof themeCssVars === 'object') {
    Object.entries(themeCssVars).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        root.style.setProperty(key, String(value));
      }
    });
  }

  const themeId = themeCssVars?.['--theme-id'];

  // Keep the existing database-backed custom color controls working on reload.
  if (!themeCssVars || Object.keys(themeCssVars).length === 0) {
    const primary = hexToHsl(restaurant.theme_primary_color);
    const background = hexToHsl(restaurant.theme_bg_color);
    if (primary) {
      root.style.setProperty('--primary', primary);
      root.style.setProperty('--ring', primary);
      root.style.setProperty('--theme-primary', restaurant.theme_primary_color);
    }
    if (background) {
      root.style.setProperty('--background', background);
      root.style.setProperty('--theme-background', restaurant.theme_bg_color);
    }
  }

  root.classList.toggle('dark', theme_mode !== 'light');

  // Older saved themes and custom palettes predate the expanded presentation
  // tokens. Derive their missing values from the active Shadcn variables.
  if (!themeId) {
    const isDark = theme_mode !== 'light';
    const fallbacks = {
      '--theme-id': isDark ? 'custom-dark' : 'custom',
      '--theme-primary': 'hsl(var(--primary))',
      '--theme-action-color': 'hsl(var(--primary))',
      '--theme-secondary': 'hsl(var(--secondary))',
      '--theme-accent': 'hsl(var(--accent))',
      '--theme-background': 'hsl(var(--background))',
      '--theme-surface': 'hsl(var(--card))',
      '--theme-text': 'hsl(var(--foreground))',
      '--theme-muted-text': 'hsl(var(--muted-foreground))',
      '--theme-soft-surface': 'hsl(var(--secondary))',
      '--theme-border': 'hsl(var(--border))',
      '--theme-header-bg': 'hsl(var(--card))',
      '--theme-header-border': 'hsl(var(--border))',
      '--theme-card-radius': 'var(--radius)',
      '--theme-button-radius': 'var(--radius)',
      '--theme-pill-radius': '999px',
      '--theme-card-shadow': 'var(--card-shadow, 0 10px 24px rgba(0, 0, 0, 0.08))',
      '--theme-button-shadow': 'var(--card-shadow, 0 5px 14px rgba(0, 0, 0, 0.12))',
      '--theme-heading-font': 'var(--font-heading)',
      '--theme-body-font': 'var(--font-body)',
    };
    Object.entries(fallbacks).forEach(([key, value]) => {
      if (!themeCssVars?.[key]) root.style.setProperty(key, value);
    });
    root.dataset.theme = isDark ? 'custom-dark' : 'custom';
  } else {
    root.dataset.theme = themeId;
  }
}
