import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';
import { Save, Lock, Unlock, Heart, ShoppingBag, MessageCircle, ThumbsUp, User, ChevronDown } from 'lucide-react';

const ICONS = [
  { key: 'favorite', label: 'Heart (Favorite)', icon: Heart },
  { key: 'cart', label: 'Add to Cart (Bag)', icon: ShoppingBag },
  { key: 'review', label: 'Comment Icon', icon: MessageCircle },
  { key: 'like', label: 'Like (Thumb)', icon: ThumbsUp },
  { key: 'ordered_count', label: 'User / Ordered-Count Icon', icon: User },
  { key: 'view_more', label: 'View More (Chevron)', icon: ChevronDown },
];

export default function IconSettingsSection({ restaurant, onRefresh }) {
  const [icons, setIcons] = useState({});
  const [masterPassword, setMasterPassword] = useState('con#5');
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const { saving, saved, error, save } = useSafeSave();

  useEffect(() => {
    if (restaurant) {
      setIcons(restaurant.icon_settings || {});
      setMasterPassword(restaurant.icon_lock_password || 'con#5');
    }
  }, [restaurant]);

  const isHidden = (key) => icons[key]?.hidden === true;

  const toggleIcon = (key) => {
    setIcons(prev => ({
      ...prev,
      [key]: { ...prev[key], hidden: !isHidden(key) },
    }));
  };

  const handleUnlock = () => {
    const pw = restaurant?.icon_lock_password || masterPassword || 'con#5';
    if (pwInput === pw) {
      setUnlocked(true);
      setPwError(false);
      setPwInput('');
    } else {
      setPwError(true);
    }
  };

  const handleSave = () => save(
    entities.Restaurant.update(restaurant.id, {
      icon_settings: icons,
      icon_lock_password: masterPassword,
    }),
    onRefresh
  );

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Icon Settings</h2>
      <p className="text-sm text-muted-foreground">
        Show or hide dish-card icons across the entire menu (grid, list, top dishes, and dish details).
        Every icon is locked by default — enter the password below to unlock the toggles.
      </p>

      {!unlocked ? (
        <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium">Enter password to unlock icon toggles</p>
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwError(false); }}
              placeholder="Password"
              className="bg-secondary"
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            />
            <Button onClick={handleUnlock}>Unlock</Button>
          </div>
          {pwError && <p className="text-xs text-destructive">Wrong password. Try again.</p>}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {ICONS.map(({ key, label, icon: Icon }) => {
              const hidden = isHidden(key);
              return (
                <div key={key} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{hidden ? 'Hidden' : 'Visible'}</span>
                    <Switch checked={!hidden} onCheckedChange={() => toggleIcon(key)} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-secondary space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5" /> Master Unlock Password
            </Label>
            <Input
              value={masterPassword}
              onChange={e => setMasterPassword(e.target.value)}
              className="bg-background text-sm"
              type="password"
            />
            <p className="text-[11px] text-muted-foreground">
              Change this if you want a different password next time (default: con#5).
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}</span>
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      )}
    </div>
  );
}
