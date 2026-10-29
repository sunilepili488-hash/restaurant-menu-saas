import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';
import { THEMES } from '@/lib/themes';
import { SCROLL_ANIMATION_STYLES } from '@/lib/scrollAnimations';
import { applyThemeToCss } from '@/lib/applyTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, Loader2 } from 'lucide-react';

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1,3),16)/255;
  let g = parseInt(hex.slice(3,5),16)/255;
  let b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch(max) {
      case r: h = ((g-b)/d + (g<b?6:0))/6; break;
      case g: h = ((b-r)/d + 2)/6; break;
      case b: h = ((r-g)/d + 4)/6; break;
    }
  }
  return `${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
}

export default function ThemeSection({ restaurant, onRefresh }) {
  const [primary, setPrimary] = useState('#0B6B50');
  const [bg, setBg] = useState('#F0F4ED');
  const [currency, setCurrency] = useState('₹');
  const { saving, saved, error, save } = useSafeSave();
  const [themeMode, setThemeMode] = useState('light');
  const [previewTheme, setPreviewTheme] = useState(null);
  const [scrollStyle, setScrollStyle] = useState('fade-up');
  const { saving: scrollSaving, saved: scrollSaved, error: scrollError, save: scrollSave } = useSafeSave();

  useEffect(() => {
    if (restaurant) {
      setPrimary(restaurant.theme_primary_color || '#0B6B50');
      setBg(restaurant.theme_bg_color || '#F0F4ED');
      setCurrency(restaurant.currency_symbol || '₹');
      setThemeMode(restaurant.theme_mode || 'light');
      setScrollStyle(restaurant.scroll_animation_style || 'fade-up');
    }
  }, [restaurant]);

  const handleSaveScrollStyle = (styleId) => {
    setScrollStyle(styleId);
    if (!restaurant?.id) return;
    scrollSave(entities.Restaurant.update(restaurant.id, { scroll_animation_style: styleId }), onRefresh);
  };

  const handlePreviewTheme = (theme) => {
    applyThemeToCss({ theme_mode: theme.mode, theme_css_vars: theme.cssVars });
    setPreviewTheme(theme);
  };

  const handleCancelPreview = () => {
    if (restaurant?.theme_css_vars && Object.keys(restaurant.theme_css_vars).length > 0) {
      applyThemeToCss({ theme_mode: restaurant.theme_mode, theme_css_vars: restaurant.theme_css_vars });
    } else {
      applyThemeToCss({
        ...restaurant,
        theme_mode: restaurant?.theme_mode || 'light',
        theme_css_vars: {},
      });
    }
    setPreviewTheme(null);
  };

  const handleApplyTheme = () => {
    if (!previewTheme || !restaurant?.id) return;
    save(
      entities.Restaurant.update(restaurant.id, {
        theme_primary_color: previewTheme.action || previewTheme.primary,
        theme_bg_color: previewTheme.bg,
        theme_mode: previewTheme.mode,
        theme_css_vars: previewTheme.cssVars,
      }),
      () => {
        onRefresh();
        setPreviewTheme(null);
      }
    );
  };

  const handleCustomSave = () => {
    const primaryHsl = hexToHsl(primary);
    document.documentElement.style.setProperty('--primary', primaryHsl);
    save(
      entities.Restaurant.update(restaurant.id, {
        theme_primary_color: primary,
        theme_bg_color: bg,
        currency_symbol: currency,
        theme_mode: themeMode,
        theme_css_vars: {},
      }),
      () => {
        onRefresh();
        setPreviewTheme(null);
      }
    );
  };

  // Determine which theme is currently active (saved in DB)
  const activeThemeId = restaurant?.theme_css_vars?.['--theme-id'];

  return (
    <div className="space-y-8">
      {/* Section A — Theme Marketplace */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Theme</h2>
        <p className="text-sm text-muted-foreground">Choose a complete visual identity for the customer menu.</p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
          }}
        >
          {THEMES.map(theme => (
            <motion.div
              key={theme.id}
              role="button"
              tabIndex={0}
              aria-pressed={previewTheme?.id === theme.id || activeThemeId === theme.id}
              variants={{
                hidden: { y: 12, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handlePreviewTheme(theme)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handlePreviewTheme(theme);
                }
              }}
              className={`theme-choice ${
                previewTheme?.id === theme.id ? 'is-previewing' :
                activeThemeId === theme.id ? 'is-active' : ''
              }`}
              style={{
                '--preview-primary': theme.primary,
                '--preview-action': theme.action || theme.primary,
                '--preview-action-foreground': theme.cssVars['--primary-foreground'],
                '--preview-secondary': theme.secondary,
                '--preview-accent': theme.accent,
                '--preview-background': theme.bg,
                '--preview-surface': theme.surface,
                '--preview-text': theme.cssVars['--theme-text'],
              }}
            >
              <div className="theme-choice-preview">
                <div className="theme-preview-header">
                  <span className="theme-preview-mark">{theme.emoji}</span>
                  <span className="theme-preview-lines"><i /><i /></span>
                  <span className="theme-preview-search" />
                </div>
                <div className="theme-preview-food">
                  <span className="theme-preview-image" />
                  <span className="theme-preview-food-copy">
                    <i />
                    <i />
                    <b>{theme.name}</b>
                  </span>
                </div>
                <span className="theme-preview-button">Explore menu</span>
              </div>
              <div className="theme-choice-details">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="theme-choice-name">{theme.emoji} {theme.name}</p>
                    <p className="theme-choice-description">{theme.description}</p>
                  </div>
                  {(previewTheme?.id === theme.id || activeThemeId === theme.id) && (
                    <span className="theme-choice-check"><Check className="w-3.5 h-3.5" /></span>
                  )}
                </div>
                <div className="theme-choice-swatches" aria-label="Theme color palette">
                  <span title={`Primary ${theme.primary}`} style={{ backgroundColor: theme.primary }} />
                  <span title={`Secondary ${theme.secondary}`} style={{ backgroundColor: theme.secondary }} />
                  <span title={`Accent ${theme.accent}`} style={{ backgroundColor: theme.accent }} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating Apply bar */}
        <AnimatePresence>
          {previewTheme && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass flex items-center justify-between gap-4 p-4 rounded-2xl mt-4"
            >
              <span className="text-sm">Apply "{previewTheme.name}"?</span>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleCancelPreview}>Cancel</Button>
                <Button
                  onClick={handleApplyTheme}
                  disabled={saving || !previewTheme || !restaurant?.id}
                  className={saved ? 'bg-green-600 hover:bg-green-600 text-white' : 'bg-primary text-primary-foreground'}
                >
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Applying...</> :
                   saved ? <><Check className="w-4 h-4 mr-1" /> Applied</> :
                   `Apply ${previewTheme.emoji}`}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section B — Custom Colors */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="font-display text-lg font-semibold">Custom Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Primary / Accent Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input type="color" value={primary} onChange={e => setPrimary(e.target.value)} className="w-12 h-10 p-1" />
              <Input value={primary} onChange={e => setPrimary(e.target.value)} className="bg-secondary" />
            </div>
          </div>
          <div>
            <Label>Background Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-12 h-10 p-1" />
              <Input value={bg} onChange={e => setBg(e.target.value)} className="bg-secondary" />
            </div>
          </div>
          <div>
            <Label>Currency Symbol</Label>
            <Input value={currency} onChange={e => setCurrency(e.target.value)} className="mt-1 bg-secondary" />
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <Label>Theme Mode</Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Choose the active theme for your customer-facing menu.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setThemeMode('dark')}
              className={`flex-1 py-3 rounded-xl border-2 transition-all ${themeMode === 'dark' ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              <span className="text-sm font-medium">🌙 Dark Mode</span>
            </button>
            <button
              onClick={() => setThemeMode('light')}
              className={`flex-1 py-3 rounded-xl border-2 transition-all ${themeMode === 'light' ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              <span className="text-sm font-medium">☀️ Light Mode</span>
            </button>
          </div>
        </div>
        <Button
          onClick={handleCustomSave}
          disabled={saving}
          className={saved ? 'bg-green-600 hover:bg-green-600 text-white gap-2' : 'gap-2 bg-primary text-primary-foreground'}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}</span>
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Section C — Dish Card Scroll Animation */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="font-display text-lg font-semibold">Dish Card Scroll Animation</h3>
        <p className="text-sm text-muted-foreground">Choose how dish cards animate into view as the customer scrolls.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SCROLL_ANIMATION_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => handleSaveScrollStyle(style.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                scrollStyle === style.id ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <p className="text-sm font-medium">{style.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{style.description}</p>
            </button>
          ))}
        </div>
        {scrollSaving && <p className="text-xs text-muted-foreground">Saving...</p>}
        {scrollSaved && <p className="text-xs text-green-500">Saved ✓</p>}
        {scrollError && <p className="text-sm text-destructive">{scrollError}</p>}
      </div>
    </div>
  );
}
    
  
