import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CreditCard, Bell, X, Receipt, Droplets, HandHelping, Coffee, Heart } from 'lucide-react';
import { menuStore } from '@/lib/menuStore';
import { entities } from '@/api/entities';

const defaultIcons = {
  'Need Bill': Receipt,
  'Need Water': Droplets,
  'Call Waiter': HandHelping,
  'Need Refill': Coffee,
};

const defaultToastMessages = {
  'Need Bill': 'Your bill is on its way! You can also pay directly from the Order section. 😊',
  'Need Water': 'Water is being brought to your table! 💧',
  'Call Waiter': 'Your waiter has been notified and will be with you shortly! 🙋',
  'Need Refill': 'Your refill is on the way! 🥤',
};

export default function BottomActionBar({ restaurant, favoritesCount, cartCount, onFavoritesClick, onCartClick, onPaymentClick }) {
  const [waiterOpen, setWaiterOpen] = useState(false);
  const [toast, setToast] = useState(null);

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

    entities.Order.create({
      type: 'waiter_call',
      table_number: tableNum,
      waiter_call_label: label,
      status: 'pending',
    });

    const opt = options.find(o => o.label === label);
    const toastMsg = opt?.toast_message || defaultToastMessages[label] || `${label} request sent! ✨`;
    setToast(toastMsg);
    setTimeout(() => setToast(null), 3000);

    setWaiterOpen(false);
  };

  return (
    <>
      {/* Waiter call bottom sheet — slides up from bottom, does NOT move the bar */}
      <AnimatePresence>
        {waiterOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWaiterOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[61] bg-background rounded-t-3xl p-5 pb-8"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold">Call Waiter</h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setWaiterOpen(false)}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-foreground" />
                </motion.button>
              </div>
              <div className="space-y-2">
                {options.map((opt, i) => {
                  const Icon = defaultIcons[opt.label] || Bell;
                  return (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => sendAlert(opt.label)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl glass hover:bg-secondary/50 transition-colors text-left"
                    >
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full-width bottom bar — fixed at very bottom edge */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-1.5">
        <div className="glass rounded-2xl flex items-center justify-between px-5 py-2.5 shadow-lg">
          {/* 1st: Bag icon + cart count */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onCartClick}
className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"
              
              <ShoppingBag className="w-4 h-4" />
            </motion.button>
            {cartCount > 0 && (
              <span className="text-sm font-bold text-primary tabular-nums min-w-[16px] text-center">
                {cartCount}
              </span>
            )}
          </div>

          {/* 2nd: Favorite Heart icon + count */}
          <div className="flex items-center gap-2">
            {favoritesCount > 0 && (
              <span className="text-sm font-bold text-rose-500 tabular-nums min-w-[16px] text-center">
                {favoritesCount}
              </span>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onFavoritesClick}
              className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0"
            >
              <Heart className="w-4 h-4 fill-white" />
            </motion.button>
          </div>

          {/* 3rd: Payment (CreditCard) icon — NEW */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onPaymentClick}
            className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0"
          >
            <CreditCard className="w-4 h-4" />
          </motion.button>

          {/* 4th: Bell icon (waiter call) — keep existing */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setWaiterOpen(true)}
            className="w-9 h-9 rounded-full bg-yellow-400 text-white flex items-center justify-center flex-shrink-0"
          >
            <Bell className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Auto-dismissing waiter call toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] bg-accent text-accent-foreground rounded-full px-5 py-3 shadow-lg flex items-center gap-2 max-w-[90%]">
          <span className="text-sm font-medium text-center">{toast}</span>
        </div>
      )}
    </>
  );
}
