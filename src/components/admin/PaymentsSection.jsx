import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';
import { Save } from 'lucide-react';

export default function PaymentsSection({ restaurant, onRefresh }) {
  const [enabled, setEnabled] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const { saving, saved, error, save } = useSafeSave();

  useEffect(() => {
    if (restaurant) {
      setEnabled(restaurant.payment_enabled || false);
      setUpiId(restaurant.upi_id || '');
      setPayeeName(restaurant.upi_payee_name || '');
    }
  }, [restaurant]);

  const handleSave = () => save(entities.Restaurant.update(restaurant.id, {
    payment_enabled: enabled,
    upi_id: upiId,
    upi_payee_name: payeeName,
  }), onRefresh);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">UPI Payments</h2>

      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
        <div>
          <p className="text-sm font-medium">Enable In-App Payments</p>
          <p className="text-xs text-muted-foreground">Show Pay button on cart</p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {enabled && (
        <div className="space-y-4">
          <div>
            <Label>UPI ID</Label>
            <Input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" className="mt-1 bg-secondary" />
          </div>
          <div>
            <Label>Payee Name</Label>
            <Input value={payeeName} onChange={e => setPayeeName(e.target.value)} placeholder="Restaurant Name" className="mt-1 bg-secondary" />
          </div>
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
        <Save className="w-4 h-4" />
        <span>{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}</span>
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}