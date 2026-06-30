export function applyThemeToCss(restaurant) {
  if (!restaurant) return;
  const { theme_mode, theme_css_vars } = restaurant;
  if (theme_css_vars && typeof theme_css_vars === 'object' && Object.keys(theme_css_vars).length > 0) {
    const root = document.documentElement;
    Object.entries(theme_css_vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
  document.documentElement.classList.toggle('dark', theme_mode !== 'light');
}
