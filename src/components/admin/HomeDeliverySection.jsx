import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Save, Loader2, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';

const UNLOCK_PASSWORD = 'hod';

export default function HomeDeliverySection({ restaurant, onRefresh }) {
  // Lock resets on every render/navigation (session-only, NOT persisted)
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [form, setForm] = useState({
    home_delivery_enabled: false,
    delivery_time_minutes: 30,
    minimum_order_amount: 0,
    delivery_charge: 0,
  });
  const { saving, saved, error, save } = useSafeSave();

  useEffect(() => {
    if (restaurant) {
      setForm({
        home_delivery_enabled: restaurant.home_delivery_enabled || false,
        delivery_time_minutes: restaurant.delivery_time_minutes || 30,
        minimum_order_amount: restaurant.minimum_order_amount || 0,
        delivery_charge: restaurant.delivery_charge || 0,
      });
    }
  }, [restaurant]);

  const handleUnlock = () => {
    if (passwordInput === UNLOCK_PASSWORD) {
      setUnlocked(true);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleSave = () => {
    if (!restaurant?.id) return;
    save(entities.Restaurant.update(restaurant.id, form), () => {
      onRefresh();
    });
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Home Delivery</h2>

      <AnimatePresence mode="wait">
        {!unlocked ? (
          /* LOCKED STATE */
          <motion.div
            key="locked"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-16 space-y-5"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-display text-lg font-semibold">Feature Locked</h3>
              <p className="text-sm text-muted-foreground mt-1">Enter the password to unlock Home Delivery settings.</p>
            </div>
            <div className="w-full max-w-xs space-y-3">
              <Input
                type="password"
                placeholder="Enter password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                className="bg-secondary text-center"
              />
              {passwordError && <p className="text-xs text-destructive text-center">{passwordError}</p>}
              <Button onClick={handleUnlock} className="w-full bg-primary text-primary-foreground">
                <Unlock className="w-4 h-4 mr-2" /> Unlock
              </Button>
            </div>
          </motion.div>
        ) : (
          /* UNLOCKED STATE */
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Re-lock button */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setUnlocked(false)} className="gap-2">
                <Lock className="w-3.5 h-3.5" /> Lock
              </Button>
            </div>

            {/* Important Alert */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-500">Important Notice</p>
                <p className="text-xs text-muted-foreground mt-1">
                  To use the Home Delivery feature properly, please connect your website to a custom domain name. This ensures customers can easily find and access your restaurant online, and all delivery orders work seamlessly.
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Apni website ko domain name se connect karein taaki Home Delivery feature sahi se kaam kare aur customers aasaani se aapka restaurant dhundh sakein.
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary">
                <div>
                  <p className="text-sm font-semibold">Enable Home Delivery</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Show delivery option to customers</p>
                </div>
                <Switch
                  checked={form.home_delivery_enabled}
                  onCheckedChange={v => set('home_delivery_enabled', v)}
                />
              </div>

              {/* Estimated Delivery Time */}
              <div>
                <Label>Estimated Delivery Time (minutes)</Label>
                <Input
                  type="number"
                  value={form.delivery_time_minutes}
                  onChange={e => set('delivery_time_minutes', Number(e.target.value))}
                  placeholder="e.g. 30"
                  className="mt-1 bg-secondary"
                />
                <p className="text-xs text-muted-foreground mt-1">Customers will see this as their delivery ETA (e.g. 30 minutes)</p>
              </div>

              {/* Minimum Order Amount */}
              <div>
                <Label>Minimum Order Amount (₹)</Label>
                <Input
                  type="number"
                  value={form.minimum_order_amount}
                  onChange={e => set('minimum_order_amount', Number(e.target.value))}
                  placeholder="e.g. 200"
                  className="mt-1 bg-secondary"
                />
                <p className="text-xs text-muted-foreground mt-1">Minimum cart value required to place a delivery order (0 = no minimum)</p>
              </div>

              {/* Delivery Charge */}
              <div>
                <Label>Delivery Charge (₹)</Label>
                <Input
                  type="number"
                  value={form.delivery_charge}
                  onChange={e => set('delivery_charge', Number(e.target.value))}
                  placeholder="e.g. 40"
                  className="mt-1 bg-secondary"
                />
                <p className="text-xs text-muted-foreground mt-1">Extra delivery fee added to customer's total (0 = free delivery)</p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || !restaurant?.id}
              className={saved ? 'bg-green-600 hover:bg-green-600 text-white gap-2' : 'gap-2 bg-primary text-primary-foreground'}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Settings'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
