import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Receipt, Droplets, HandHelping, Coffee, Bookmark, ShoppingBag } from 'lucide-react';
import { menuStore } from '@/lib/menuStore';

const defaultIcons = {
  'Need Bill': Receipt,
  'Need Water': Droplets,
  'Call Waiter': HandHelping,
  'Need Refill': Coffee,
};

export default function FloatingActionStack({ restaurant, favoritesCount, cartCount, onFavoritesClick, onCartClick }) {
  const [waiterOpen, setWaiterOpen] = useState(false);

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

    setWaiterOpen(false);
  };

  const btnClass = 'w-12 h-12 rounded-full glass flex items-center justify-center relative';
  const iconClass = 'w-5 h-5 text-primary';

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-center gap-3">
      {/* Waiter call options menu */}
      <AnimatePresence>
        {waiterOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="glass rounded-2xl p-3 space-y-2 min-w-[180px]"
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

      {/* Favorites button (top) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={onFavoritesClick}
        className={btnClass}
      >
        <Bookmark className={iconClass} />
        {favoritesCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
            {favoritesCount}
          </span>
        )}
      </motion.button>

      {/* Cart button (middle) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={onCartClick}
        className={btnClass}
      >
        <ShoppingBag className={iconClass} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </motion.button>

      {/* Waiter bell button (bottom) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setWaiterOpen(!waiterOpen)}
        className={btnClass}
      >
        {waiterOpen ? <X className={iconClass} /> : <Bell className={iconClass} />}
      </motion.button>
    </div>
  );
}