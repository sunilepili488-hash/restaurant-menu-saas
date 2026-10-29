const clamp = (value) => Math.min(1, Math.max(0, value));

function hexToHsl(hex) {
  const input = hex.replace('#', '');
  const r = parseInt(input.slice(0, 2), 16) / 255;
  const g = parseInt(input.slice(2, 4), 16) / 255;
  const b = parseInt(input.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    switch (max) {
      case r:
        hue = ((g - b) / delta) % 6;
        break;
      case g:
        hue = (b - r) / delta + 2;
        break;
      default:
        hue = (r - g) / delta + 4;
    }
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

function createTheme({
  id,
  name,
  emoji,
  description,
  mode,
  primary,
  action = primary,
  secondary,
  accent,
  accentForeground,
  background,
  surface,
  text,
  mutedText,
  softSurface,
  border,
  header,
  cardRadius,
  buttonRadius,
  headingFont,
  bodyFont = '"DM Sans", sans-serif',
  icon,
  shadow,
  buttonShadow,
}) {
  const primaryForeground = mode === 'dark' ? '#191C23' : '#FFFFFF';
  const hsl = (color) => hexToHsl(color);
  const effectiveAccentForeground = accentForeground || text;

  return {
    id,
    name,
    emoji,
    description,
    mode,
    primary,
    action,
    secondary,
    accent,
    bg: background,
    surface,
    cssVars: {
      '--background': hsl(background),
      '--foreground': hsl(text),
      '--card': hsl(surface),
      '--card-foreground': hsl(text),
      '--popover': hsl(surface),
      '--popover-foreground': hsl(text),
      '--primary': hsl(action),
      '--primary-foreground': hsl(primaryForeground),
      '--secondary': hsl(softSurface),
      '--secondary-foreground': hsl(text),
      '--muted': hsl(softSurface),
      '--muted-foreground': hsl(mutedText),
      '--accent': hsl(accent),
      '--accent-foreground': hsl(effectiveAccentForeground),
      '--destructive': '0 72% 51%',
      '--destructive-foreground': '0 0% 98%',
      '--border': hsl(border),
      '--input': hsl(border),
      '--ring': hsl(accent),
      '--chart-1': hsl(accent),
      '--chart-2': hsl(primary),
      '--chart-3': hsl(secondary),
      '--chart-4': hsl('#48C9C1'),
      '--chart-5': hsl('#D27B56'),
      '--radius': cardRadius,
      '--font-heading': headingFont,
      '--font-body': bodyFont,
      '--font-display': headingFont,
      '--font-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      '--sidebar-background': hsl(surface),
      '--sidebar-foreground': hsl(text),
      '--sidebar-primary': hsl(action),
      '--sidebar-primary-foreground': hsl(primaryForeground),
      '--sidebar-accent': hsl(softSurface),
      '--sidebar-accent-foreground': hsl(text),
      '--sidebar-border': hsl(border),
      '--sidebar-ring': hsl(accent),
      '--card-shadow': shadow,
      '--card-icon': icon,
      '--theme-id': id,
      '--theme-primary': primary,
      '--theme-action-color': action,
      '--theme-secondary': secondary,
      '--theme-accent': accent,
      '--theme-background': background,
      '--theme-surface': surface,
      '--theme-text': text,
      '--theme-muted-text': mutedText,
      '--theme-soft-surface': softSurface,
      '--theme-border': border,
      '--theme-header-bg': header,
      '--theme-header-border': border,
      '--theme-card-radius': cardRadius,
      '--theme-button-radius': buttonRadius,
      '--theme-pill-radius': '999px',
      '--theme-card-shadow': shadow,
      '--theme-button-shadow': buttonShadow,
      '--theme-heading-font': headingFont,
      '--theme-body-font': bodyFont,
    },
  };
}

export const THEMES = [
  createTheme({
    id: 'emerald-luxe',
    name: 'Emerald Luxe',
    emoji: '✦',
    description: 'Botanical calm with champagne details',
    mode: 'light',
    primary: '#0B6B50',
    secondary: '#164A3C',
    accent: '#D8B779',
    background: '#F0F4ED',
    surface: '#FFFFFF',
    text: '#17372E',
    mutedText: '#64796F',
    softSurface: '#E6EEE7',
    border: '#D7E2D8',
    header: '#FFFFFF',
    cardRadius: '1.25rem',
    buttonRadius: '0.85rem',
    headingFont: '"Cormorant Garamond", Georgia, serif',
    icon: 'Leaf',
    shadow: '0 12px 32px rgba(11, 107, 80, 0.10)',
    buttonShadow: '0 5px 14px rgba(11, 107, 80, 0.18)',
  }),
  createTheme({
    id: 'terracotta-artisan',
    name: 'Terracotta Artisan',
    emoji: '◈',
    description: 'Warm Mediterranean color and editorial type',
    mode: 'light',
    primary: '#C45D43',
    secondary: '#8D3E2D',
    accent: '#E6B65C',
    background: '#FAF1E5',
    surface: '#FFF9F1',
    text: '#392820',
    mutedText: '#80695A',
    softSurface: '#F2E5D4',
    border: '#E8D8C5',
    header: '#FFF9F1',
    cardRadius: '1rem',
    buttonRadius: '0.65rem',
    headingFont: '"Lora", Georgia, serif',
    icon: 'Flame',
    shadow: '0 12px 28px rgba(98, 55, 39, 0.12)',
    buttonShadow: '0 5px 14px rgba(141, 62, 45, 0.18)',
  }),
  createTheme({
    id: 'midnight-noir',
    name: 'Midnight Noir',
    emoji: '✧',
    description: 'Cinematic graphite with antique gold',
    mode: 'dark',
    primary: '#191C23',
    action: '#E0B86B',
    secondary: '#292E38',
    accent: '#E0B86B',
    accentForeground: '#191C23',
    background: '#111318',
    surface: '#222630',
    text: '#F6F1E7',
    mutedText: '#B9BDC7',
    softSurface: '#292E38',
    border: '#3A404D',
    header: '#191C23',
    cardRadius: '0.8rem',
    buttonRadius: '0.55rem',
    headingFont: '"Cormorant Garamond", Georgia, serif',
    icon: 'MoonStar',
    shadow: '0 18px 38px rgba(0, 0, 0, 0.28)',
    buttonShadow: '0 5px 16px rgba(224, 184, 107, 0.20)',
  }),
  createTheme({
    id: 'ocean-sapphire',
    name: 'Ocean Sapphire',
    emoji: '⌁',
    description: 'Fresh coastal blue with clear aqua accents',
    mode: 'light',
    primary: '#1769AA',
    secondary: '#163B61',
    accent: '#48C9C1',
    background: '#EFF7FC',
    surface: '#FFFFFF',
    text: '#19344E',
    mutedText: '#5E778D',
    softSurface: '#E3F0F8',
    border: '#D5E6F1',
    header: '#FFFFFF',
    cardRadius: '1.35rem',
    buttonRadius: '0.95rem',
    headingFont: '"DM Sans", Arial, sans-serif',
    icon: 'Waves',
    shadow: '0 12px 30px rgba(23, 105, 170, 0.11)',
    buttonShadow: '0 5px 14px rgba(23, 105, 170, 0.18)',
  }),
  createTheme({
    id: 'ruby-royale',
    name: 'Ruby Royale',
    emoji: '✺',
    description: 'Contemporary Indian luxury in ruby and gold',
    mode: 'light',
    primary: '#A51F43',
    secondary: '#651B32',
    accent: '#E7BD75',
    background: '#FBF5F0',
    surface: '#FFFFFF',
    text: '#38202A',
    mutedText: '#80646D',
    softSurface: '#F4E8E8',
    border: '#E9D9DD',
    header: '#FFFFFF',
    cardRadius: '1.05rem',
    buttonRadius: '0.75rem',
    headingFont: '"Lora", Georgia, serif',
    icon: 'Crown',
    shadow: '0 12px 30px rgba(101, 27, 50, 0.11)',
    buttonShadow: '0 5px 14px rgba(165, 31, 67, 0.18)',
  }),
];
