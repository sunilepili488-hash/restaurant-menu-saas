import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';
import { Save, Loader2, Check, Zap } from 'lucide-react';

const EFFECTS = [
  {
    id: 'fade-rise',
    label: 'Fade & Rise',
    description: 'Cards fade in and slide up gently as you scroll — clean, timeless.',
    preview: { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } },
  },
  {
    id: 'slide-stagger',
    label: 'Slide-In Stagger',
    description: 'Cards slide in from the side with a cascading stagger — dynamic.',
    preview: { initial: { opacity: 0, x: -32 }, animate: { opacity: 1, x: 0 } },
  },
  {
    id: 'scale-pop',
    label: 'Scale Pop',
    description: 'Cards spring from 90 % to full size — satisfying and energetic.',
    preview: { initial: { opacity: 0, scale: 0.82 }, animate: { opacity: 1, scale: 1 } },
  },
  {
    id: 'tilt-reveal',
    label: '3D Tilt Reveal',
    description: 'Cards unfold with a subtle 3D perspective — premium feel.',
    preview: { initial: { opacity: 0, rotateX: 18, scale: 0.92 }, animate: { opacity: 1, rotateX: 0, scale: 1 } },
  },
];

export default function ScrollEffectSection({ restaurant, onRefresh }) {
  const [selected, setSelected] = useState('fade-rise');
  const { saving, saved, error, save } = useSafeSave();

  useEffect(() => {
    if (restaurant) {
      setSelected(restaurant.scroll_effect || 'fade-rise');
    }
  }, [restaurant]);

  const handleSave = () => {
    if (!restaurant?.id) return;
    save(entities.Restaurant.update(restaurant.id, { scroll_effect: selected }), onRefresh);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Dish Card Scroll Effects</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how dish cards animate into view as customers scroll through the menu.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EFFECTS.map((effect) => {
          const isActive = selected === effect.id;
          return (
            <button
              key={effect.id}
              onClick={() => setSelected(effect.id)}
              className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
                isActive
                  ? 'border-primary bg-primary/8'
                  : 'border-border bg-secondary hover:border-primary/40'
              }`}
            >
              {isActive && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </span>
              )}

              {/* Mini live preview */}
              <div
                className="w-full h-20 rounded-xl bg-card border border-border mb-3 flex items-center justify-center overflow-hidden"
                style={{ perspective: '600px' }}
              >
                <motion.div
                  key={`${effect.id}-${isActive}`}
                  initial={effect.preview.initial}
                  animate={effect.preview.animate}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatDelay: 1.6 }}
                  className="w-20 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center"
                >
                  <Zap className="w-4 h-4 text-primary" />
                </motion.div>
              </div>

              <p className="text-sm font-semibold text-foreground">{effect.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{effect.description}</p>
            </button>
          );
        })}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving || !restaurant?.id}
        className={`gap-2 ${saved ? 'bg-green-600 hover:bg-green-600 text-white' : 'bg-primary text-primary-foreground'}`}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Scroll Effect'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
