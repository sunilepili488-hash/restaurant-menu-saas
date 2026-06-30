import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Receipt, Droplets, HandHelping, Coffee } from 'lucide-react';
import { menuStore } from '@/lib/menuStore';

const defaultIcons = {
  'Need Bill': Receipt,
  'Need Water': Droplets,
  'Call Waiter': HandHelping,
  'Need Refill': Coffee,
};

export default function WaiterCall({ restaurant }) {
  const [open, setOpen] = useState(false);

  const options = restaurant?.waiter_call_options?.length
    ? restaurant.waiter_call_options
    : [
        { label: 'Need Bill', icon: 'receipt' },
        { label: 'Need Water', icon: 'droplets' },
        { label: 'Call Waiter', icon: 'hand' },
        { label: 'Need Refill', icon: 'coffee' },
      ];

  const sendAlert = (label) => {
    const state = menuStore.getState();
    const tableNum = state.tableNumber;
    const msg = `🔔 ${label}${tableNum ? ` — Table ${tableNum}` : ''}`;

    if (restaurant?.order_routing_mode === 'website' && restaurant?.website_endpoint) {
      fetch(restaurant.website_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'waiter_call', action: label, table: tableNum }),
      }).catch(() => {});
    } else if (restaurant?.whatsapp_numbers?.length) {
      const encoded = encodeURIComponent(msg);
      restaurant.whatsapp_numbers.forEach(num => {
        window.open(`https://wa.me/${num.replace(/\D/g, '')}?text=${encoded}`, '_blank');
      });
    }

    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="glass rounded-2xl p-3 mb-3 space-y-2 min-w-[180px]"
          >
            {options.map((opt, i) => {
              const Icon = defaultIcons[opt.label] || Bell;
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendAlert(opt.label)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center"
      >
        {open ? <X className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
      </motion.button>
    </div>
  );
}