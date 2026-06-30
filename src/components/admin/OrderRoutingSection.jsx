import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function OrderRoutingSection({ restaurant, onRefresh }) {
  const [mode, setMode] = useState('whatsapp');
  const [numbers, setNumbers] = useState([]);
  const [endpoint, setEndpoint] = useState('');
  const [newNum, setNewNum] = useState('');
  const { saving, saved, error, save } = useSafeSave();

  useEffect(() => {
    if (restaurant) {
      setMode(restaurant.order_routing_mode || 'whatsapp');
      setNumbers(restaurant.whatsapp_numbers || []);
      setEndpoint(restaurant.website_endpoint || '');
    }
  }, [restaurant]);

  const addNumber = () => {
    if (!newNum.trim()) return;
    setNumbers(prev => [...prev, newNum.trim()]);
    setNewNum('');
  };

  const handleSave = () => save(entities.Restaurant.update(restaurant.id, {
    order_routing_mode: mode,
    whatsapp_numbers: numbers,
    website_endpoint: endpoint,
  }), onRefresh);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Order Routing</h2>

      <RadioGroup value={mode} onValueChange={setMode} className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
          <RadioGroupItem value="whatsapp" id="wa" />
          <Label htmlFor="wa" className="cursor-pointer">Receive via WhatsApp</Label>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
          <RadioGroupItem value="website" id="web" />
          <Label htmlFor="web" className="cursor-pointer">Receive via Website URL</Label>
        </div>
      </RadioGroup>

      {mode === 'whatsapp' && (
        <div className="space-y-3">
          <Label>WhatsApp Numbers</Label>
          <div className="flex gap-2">
            <Input value={newNum} onChange={e => setNewNum(e.target.value)} placeholder="+91XXXXXXXXXX" className="bg-secondary" onKeyDown={e => e.key === 'Enter' && addNumber()} />
            <Button onClick={addNumber} size="sm" className="gap-1"><Plus className="w-3 h-3" /> Add</Button>
          </div>
          <div className="space-y-1">
            {numbers.map((num, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                <span className="text-sm">{num}</span>
                <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive" onClick={() => setNumbers(prev => prev.filter((_, j) => j !== i))}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'website' && (
        <div>
          <Label>Endpoint URL</Label>
          <Input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="https://your-backend.com/orders" className="mt-1 bg-secondary" />
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
        <Save className="w-4 h-4" /> {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}