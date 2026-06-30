import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function WaiterCallSection({ restaurant, onRefresh }) {
  const [options, setOptions] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const { saving, saved, error, save } = useSafeSave();

  useEffect(() => {
    if (restaurant) {
      setOptions(restaurant.waiter_call_options || [
        { label: 'Need Bill', icon: 'receipt', toast_message: 'Your bill is on its way! You can also pay directly from the Order section. 😊' },
        { label: 'Need Water', icon: 'droplets', toast_message: 'Water is being brought to your table! 💧' },
        { label: 'Call Waiter', icon: 'hand', toast_message: 'Your waiter has been notified and will be with you shortly! 🙋' },
        { label: 'Need Refill', icon: 'coffee', toast_message: 'Your refill is on the way! 🥤' },
      ]);
    }
  }, [restaurant]);

  const addOption = () => {
    if (!newLabel.trim()) return;
    setOptions(prev => [...prev, { label: newLabel.trim(), icon: 'bell', toast_message: '' }]);
    setNewLabel('');
  };

  const handleSave = () => save(entities.Restaurant.update(restaurant.id, { waiter_call_options: options }), onRefresh);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Waiter Call Options</h2>
      <div className="flex gap-2">
        <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="New option label" className="bg-secondary" onKeyDown={e => e.key === 'Enter' && addOption()} />
        <Button onClick={addOption} className="gap-1"><Plus className="w-4 h-4" /> Add</Button>
      </div>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="p-3 rounded-xl bg-card border border-border space-y-2">
            <div className="flex items-center justify-between">
              <Input
                value={opt.label}
                onChange={e => setOptions(prev => prev.map((o, j) => j === i ? { ...o, label: e.target.value } : o))}
                className="bg-transparent border-0 p-0 h-auto font-medium text-sm"
              />
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setOptions(prev => prev.filter((_, j) => j !== i))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <Input
              value={opt.toast_message || ''}
              onChange={e => setOptions(prev => prev.map((o, j) => j === i ? { ...o, toast_message: e.target.value } : o))}
              placeholder="Customer toast message (shown when tapped)"
              className="bg-secondary text-xs h-8"
            />
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
        <Save className="w-4 h-4" /> {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}