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
  // ─── THEME 1: SAFFRON STREET ─────────────────────────────────────────────
  // Bold Indian street food vibes. Saffron + black. Full-bleed image cards,
  // pill category tabs with icon dots, square-ish buttons with thick borders.
  createTheme({
    id: 'saffron-street',
    name: 'Saffron Street',
    emoji: '🪔',
    description: 'Bold street-food energy — saffron, black & crisp white',
    mode: 'light',
    primary: '#E8650A',
    action: '#E8650A',
    secondary: '#B84E08',
    accent: '#1A1A1A',
    background: '#FFFBF5',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    mutedText: '#6B5E52',
    softSurface: '#FFF0E0',
    border: '#F0D9C0',
    header: '#FFFFFF',
    cardRadius: '0.5rem',
    buttonRadius: '0.25rem',
    headingFont: '"Bebas Neue", "Impact", sans-serif',
    bodyFont: '"Outfit", sans-serif',
    icon: 'Flame',
    shadow: '4px 4px 0px #E8650A',
    buttonShadow: '3px 3px 0px #B84E08',
  }),

  // ─── THEME 2: NEON NIGHTS ────────────────────────────────────────────────
  // Dark club/lounge restaurant. Neon pink/cyan on near-black. Glowing borders,
  // horizontal scroll cards, neon-outlined buttons, uppercase tracking.
  createTheme({
    id: 'neon-nights',
    name: 'Neon Nights',
    emoji: '✦',
    description: 'Dark lounge aesthetic — neon glow on deep black',
    mode: 'dark',
    primary: '#0D0D0D',
    action: '#FF2D78',
    secondary: '#1A0A14',
    accent: '#00F5D4',
    accentForeground: '#0D0D0D',
    background: '#080808',
    surface: '#121212',
    text: '#F0F0F0',
    mutedText: '#888888',
    softSurface: '#1C1C1C',
    border: '#2A0A1A',
    header: '#0D0D0D',
    cardRadius: '0.75rem',
    buttonRadius: '0rem',
    headingFont: '"Space Grotesk", "DM Sans", sans-serif',
    bodyFont: '"Space Grotesk", sans-serif',
    icon: 'Zap',
    shadow: '0 0 20px rgba(255, 45, 120, 0.25), 0 4px 12px rgba(0,0,0,0.6)',
    buttonShadow: '0 0 14px rgba(255, 45, 120, 0.5)',
  }),

  // ─── THEME 3: ZEN GARDEN ─────────────────────────────────────────────────
  // Minimal Japanese-style. Off-white + forest green + stone. No shadows,
  // hairline borders, generous white space, text-heavy cards, small rounded buttons.
  createTheme({
    id: 'zen-garden',
    name: 'Zen Garden',
    emoji: '◦',
    description: 'Minimal Japanese calm — stone, white & deep forest',
    mode: 'light',
    primary: '#2D5016',
    action: '#2D5016',
    secondary: '#1A3009',
    accent: '#C4A35A',
    background: '#F7F5F0',
    surface: '#FDFCFA',
    text: '#1C1C1A',
    mutedText: '#7A7A6E',
    softSurface: '#EFEDE8',
    border: '#D8D5CE',
    header: '#FDFCFA',
    cardRadius: '0.25rem',
    buttonRadius: '0.125rem',
    headingFont: '"Noto Serif JP", "Lora", Georgia, serif',
    bodyFont: '"Noto Sans JP", "DM Sans", sans-serif',
    icon: 'Leaf',
    shadow: '0 1px 4px rgba(44, 80, 22, 0.08)',
    buttonShadow: 'none',
  }),

  // ─── THEME 4: TROPICAL BURST ─────────────────────────────────────────────
  // Playful, colourful beach shack / juice bar. Lime green + mango yellow + white.
  // Rounded pill everything, bouncy card borders, wavy section dividers feel.
  createTheme({
    id: 'tropical-burst',
    name: 'Tropical Burst',
    emoji: '🌴',
    description: 'Vibrant juice-bar energy — lime, mango & coral',
    mode: 'light',
    primary: '#00A86B',
    action: '#00A86B',
    secondary: '#007A4D',
    accent: '#FF6B35',
    background: '#F0FFF8',
    surface: '#FFFFFF',
    text: '#0A2E1A',
    mutedText: '#4A7A5C',
    softSurface: '#D4F5E2',
    border: '#A8E6C3',
    header: '#FFFFFF',
    cardRadius: '1.75rem',
    buttonRadius: '999px',
    headingFont: '"Nunito", "DM Sans", sans-serif',
    bodyFont: '"Nunito", sans-serif',
    icon: 'Sun',
    shadow: '0 8px 24px rgba(0, 168, 107, 0.15)',
    buttonShadow: '0 6px 16px rgba(0, 168, 107, 0.30)',
  }),

  // ─── THEME 5: VELVET DARBAR ──────────────────────────────────────────────
  // Royal Indian fine dining. Deep burgundy + ivory + 24k gold. 
  // Ornate card borders with gold top-line, serif headings, full-width image cards.
  createTheme({
    id: 'velvet-darbar',
    name: 'Velvet Darbar',
    emoji: '♛',
    description: 'Royal Indian fine dining — burgundy, ivory & 24k gold',
    mode: 'dark',
    primary: '#4A0A1E',
    action: '#C9A84C',
    secondary: '#2E0612',
    accent: '#C9A84C',
    accentForeground: '#1A0509',
    background: '#0F0408',
    surface: '#1C0910',
    text: '#F5EDD5',
    mutedText: '#B09A78',
    softSurface: '#2A0E16',
    border: '#4A1E2C',
    header: '#140608',
    cardRadius: '0rem',
    buttonRadius: '0rem',
    headingFont: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
    bodyFont: '"EB Garamond", Georgia, serif',
    icon: 'Crown',
    shadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201, 168, 76, 0.3)',
    buttonShadow: '0 4px 16px rgba(201, 168, 76, 0.25)',
  }),
];
