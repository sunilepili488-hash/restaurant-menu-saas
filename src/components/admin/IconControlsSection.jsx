import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';
import {
  Heart, ShoppingBag, MessageCircle, ThumbsUp, User, ChevronDown,
  Lock, Unlock, Save, Loader2, Check, Eye, EyeOff,
} from 'lucide-react';

const ICON_DEFS = [
  {
    key: 'favorite',
    label: 'Heart / Favourite',
    description: 'Heart icon customers use to save favourite dishes',
    icon: Heart,
  },
  {
    key: 'cart',
    label: 'Add-to-Cart Bag',
    description: 'Shopping bag button that adds a dish to the cart',
    icon: ShoppingBag,
  },
  {
    key: 'review',
    label: 'Comment / Review',
    description: 'Comment bubble that opens the review sheet',
    icon: MessageCircle,
  },
  {
    key: 'like',
    label: 'Like / Thumbs-up',
    description: 'Thumbs-up with like count shown on dish cards',
    icon: ThumbsUp,
  },
  {
    key: 'user_count',
    label: 'Ordered-today Count',
    description: 'Person icon showing how many ordered today',
    icon: User,
  },
  {
    key: 'view_more',
    label: '"View More" Chevron',
    description: 'Down-arrow that expands the long description',
    icon: ChevronDown,
  },
];

const ICON_PASSWORD = 'con#5';

export default function IconControlsSection({ restaurant, onRefresh }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [settings, setSettings] = useState({});
  const { saving, saved, error, save } = useSafeSave();

  useEffect(() => {
    if (restaurant) {
      setSettings(restaurant.icon_settings || {});
    }
  }, [restaurant]);

  const handleUnlock = () => {
    if (pwInput === ICON_PASSWORD) {
      setUnlocked(true);
      setPwError(false);
      setPwInput('');
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 1500);
    }
  };

  const toggleIcon = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], hidden: !(prev[key]?.hidden) },
    }));
  };

  const handleSave = () => {
    if (!restaurant?.id) return;
    save(entities.Restaurant.update(restaurant.id, { icon_settings: settings }), onRefresh);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Icon Controls</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Show or hide individual icons across the entire customer-facing menu.
        </p>
      </div>

      {/* Lock gate */}
      <AnimatePresence mode="wait">
        {!unlocked ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-2xl border-2 border-border bg-secondary space-y-4"
          >
            <div className="flex items-center gap-3 text-muted-foreground">
              <Lock className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Icon controls are locked</p>
                <p className="text-xs text-muted-foreground">Enter the icon password to access toggles.</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={pwInput}
                  onChange={e => setPwInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                  placeholder="Enter password"
                  className={`bg-background pr-10 ${pwError ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button onClick={handleUnlock} className="gap-2">
                <Unlock className="w-4 h-4" /> Unlock
              </Button>
            </div>
            {pwError && (
              <p className="text-xs text-destructive font-medium">Incorrect password.</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium mb-4">
              <Unlock className="w-4 h-4" /> Unlocked — changes apply to all customers immediately after save.
            </div>

            {ICON_DEFS.map(({ key, label, description, icon: Icon }) => {
              const isHidden = settings[key]?.hidden === true;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 rounded-2xl bg-secondary border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isHidden ? 'bg-muted opacity-40' : 'bg-primary/15'}`}>
                      <Icon className={`w-4 h-4 ${isHidden ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${isHidden ? 'text-muted-foreground' : 'text-green-500'}`}>
                      {isHidden ? 'Hidden' : 'Visible'}
                    </span>
                    <Switch
                      checked={!isHidden}
                      onCheckedChange={() => toggleIcon(key)}
                    />
                  </div>
                </div>
              );
            })}

            <Button
              onClick={handleSave}
              disabled={saving || !restaurant?.id}
              className={`mt-4 gap-2 ${saved ? 'bg-green-600 hover:bg-green-600 text-white' : 'bg-primary text-primary-foreground'}`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Icon Settings'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
