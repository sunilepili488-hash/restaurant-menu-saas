import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderReceiverSection() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Order Receiver Dashboard</h2>
      <p className="text-sm text-muted-foreground">
        Monitor incoming orders and waiter calls in real-time. The dashboard auto-refreshes every 7 seconds and plays a sound notification for new orders.
      </p>

      <div className="glass rounded-2xl p-5 flex items-center gap-4 border-primary/20">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/20">
          <Radio className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Live Order Receiver</p>
          <p className="text-xs text-muted-foreground">
            Open the full-screen dashboard to manage orders and waiter calls
          </p>
        </div>
        <Button
          onClick={() => window.open('/order-receiver', '_blank')}
          className="bg-primary text-primary-foreground gap-2"
        >
          <ExternalLink className="w-4 h-4" /> Open Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-lg font-semibold mb-2">New Orders</h3>
          <p className="text-sm text-muted-foreground">
            Orders appear as cards grouped by table number. Use Confirm, Ready, or Cancel actions to update order status. The order is removed from the active list once marked Ready or Cancelled.
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-lg font-semibold mb-2">Waiter Calls</h3>
          <p className="text-sm text-muted-foreground">
            Waiter call requests appear as slim cards. Calls older than 5 minutes turn red for urgency. Click Resolve to dismiss a call once the waiter has attended to it.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-display text-lg font-semibold mb-2">Quick Access Shortcut</h3>
        <p className="text-sm text-muted-foreground">
          Customers can open the Order Receiver Dashboard by typing <code className="bg-secondary px-2 py-0.5 rounded text-xs font-mono">098</code> in the search bar on the main menu. This opens the Order Receiver in a new tab.
        </p>
      </div>
    </div>
  );
}
