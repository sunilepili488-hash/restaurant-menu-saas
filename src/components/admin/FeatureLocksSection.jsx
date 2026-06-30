import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';
import { Save, Lock, Unlock, Eye } from 'lucide-react';

const FEATURES = [
  { key: 'table_qr', label: 'Table QR System' },
  { key: 'payments', label: 'In-App Payments' },
  { key: 'banners', label: 'Promo Banners' },
  { key: 'reviews', label: 'Reviews/Comments' },
  { key: 'waiter_call', label: 'Waiter Call' },
  { key: 'order_routing', label: 'Order Routing' },
  { key: 'theme', label: 'Theme Customization' },
];

export default function FeatureLocksSection({ restaurant, onRefresh }) {
  const [locks, setLocks] = useState({});
  const [devPassword, setDevPassword] = useState('');
  const [unlockInput, setUnlockInput] = useState('');
  const [unlockTarget, setUnlockTarget] = useState(null);
  const { saving, saved, error, save } = useSafeSave();
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setLocks(restaurant.feature_locks || {});
      setDevPassword(restaurant.developer_password || 'saas');
    }
  }, [restaurant]);

  const handleSave = () => save(entities.Restaurant.update(restaurant.id, {
    feature_locks: locks,
    developer_password: devPassword,
  }), onRefresh);

  const toggleLock = (key) => {
    setLocks(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        locked: !(prev[key]?.locked),
        password: prev[key]?.password || 'saas',
      }
    }));
  };

  const setFeaturePassword = (key, pwd) => {
    setLocks(prev => ({
      ...prev,
      [key]: { ...prev[key], password: pwd }
    }));
  };

  const tryUnlock = (key) => {
    const pw = locks[key]?.password || devPassword || 'saas';
    if (unlockInput === pw) {
      setLocks(prev => ({ ...prev, [key]: { ...prev[key], locked: false } }));
      setUnlockTarget(null);
      setUnlockInput('');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Feature Locks</h2>

      {/* Developer banner */}
      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-3">
        <p className="text-sm">To see or unlock features of this menu, please enter a password.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-3.5 h-3.5" /> {showPreview ? 'Hide' : 'See'} Features
          </Button>
        </div>
        <div>
          <Label className="text-xs">Master Developer Password</Label>
          <Input value={devPassword} onChange={e => setDevPassword(e.target.value)} className="mt-1 bg-secondary text-sm" type="password" />
        </div>
      </div>

      <div className="space-y-3">
        {FEATURES.map(f => {
          const lock = locks[f.key] || {};
          const isLocked = lock.locked === true;
          return (
            <div key={f.key} className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isLocked ? <Lock className="w-4 h-4 text-destructive" /> : <Unlock className="w-4 h-4 text-green-500" />}
                  <span className="text-sm font-medium">{f.label}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => toggleLock(f.key)}>
                  {isLocked ? 'Unlock' : 'Lock'}
                </Button>
              </div>
              {(showPreview || !isLocked) && (
                <div>
                  <Label className="text-xs">Feature Password</Label>
                  <Input
                    value={lock.password || 'saas'}
                    onChange={e => setFeaturePassword(f.key, e.target.value)}
                    className="mt-1 bg-secondary text-sm"
                    type="password"
                  />
                </div>
              )}
              {unlockTarget === f.key && (
                <div className="flex gap-2">
                  <Input value={unlockInput} onChange={e => setUnlockInput(e.target.value)} placeholder="Enter password" className="bg-secondary text-sm" />
                  <Button size="sm" onClick={() => tryUnlock(f.key)}>Unlock</Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
        <Save className="w-4 h-4" />
        <span>{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}</span>
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}