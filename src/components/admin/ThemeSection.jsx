import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';
import { THEMES } from '@/lib/themes';
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
  const [primary, setPrimary] = useState('#C5A572');
  const [bg, setBg] = useState('#1A1A1A');
  const [currency, setCurrency] = useState('₹');
  const { saving, saved, error, save } = useSafeSave();
  const [themeMode, setThemeMode] = useState('dark');
  const [previewTheme, setPreviewTheme] = useState(null);

  useEffect(() => {
    if (restaurant) {
      setPrimary(restaurant.theme_primary_color || '#C5A572');
      setBg(restaurant.theme_bg_color || '#1A1A1A');
      setCurrency(restaurant.currency_symbol || '₹');
      setThemeMode(restaurant.theme_mode || 'dark');
    }
  }, [restaurant]);

  const handlePreviewTheme = (theme) => {
    applyThemeToCss({ theme_mode: theme.mode, theme_css_vars: theme.cssVars });
    setPreviewTheme(theme);
  };

  const handleCancelPreview = () => {
    if (restaurant?.theme_css_vars && Object.keys(restaurant.theme_css_vars).length > 0) {
      applyThemeToCss({ theme_mode: restaurant.theme_mode, theme_css_vars: restaurant.theme_css_vars });
    } else {
      applyThemeToCss({ theme_mode: restaurant?.theme_mode || 'dark', theme_css_vars: {} });
    }
    setPreviewTheme(null);
  };

  const handleApplyTheme = () => {
    if (!previewTheme || !restaurant?.id) return;
    save(
      entities.Restaurant.update(restaurant.id, {
        theme_primary_color: previewTheme.primary,
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
  const activeThemeId = THEMES.find(t =>
    restaurant?.theme_css_vars && Object.keys(restaurant.theme_css_vars).length > 0 &&
    JSON.stringify(t.cssVars) === JSON.stringify(restaurant.theme_css_vars)
  )?.id;

  return (
    <div className="space-y-8">
      {/* Section A — Theme Marketplace */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Theme</h2>
        <p className="text-sm text-muted-foreground">Pick a curated theme — one click applies instantly.</p>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
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
              variants={{
                hidden: { y: 12, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePreviewTheme(theme)}
              className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-colors ${
                previewTheme?.id === theme.id ? 'border-primary ring-2 ring-primary/30' :
                activeThemeId === theme.id ? 'border-primary/50' : 'border-border'
              }`}
            >
              {/* Mini preview */}
              <div className="h-20 relative" style={{ backgroundColor: theme.bg }}>
                <div className="absolute inset-x-0 top-0 h-[65%]" style={{ backgroundColor: theme.bg }} />
                <div className="absolute inset-x-0 bottom-0 h-[35%]" style={{ backgroundColor: theme.bg, filter: 'brightness(1.3)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {theme.name}
                  </span>
                </div>
              </div>
              {/* Theme name */}
              <div className="p-2 text-center bg-card">
                <p className="text-xs font-medium">{theme.emoji} {theme.name}</p>
              </div>
              {/* Badges */}
              {previewTheme?.id === theme.id && (
                <span className="absolute top-1 right-1 text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full animate-pulse">
                  Previewing
                </span>
              )}
              {activeThemeId === theme.id && previewTheme?.id !== theme.id && (
                <span className="absolute top-1 right-1 text-[9px] bg-green-600 text-white px-1.5 py-0.5 rounded-full">
                  Active
                </span>
              )}
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
    </div>
  );
}
