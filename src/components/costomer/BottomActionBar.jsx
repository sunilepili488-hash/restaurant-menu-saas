import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HandPlatter as ShoppingBag, CreditCard, Bell, X,
  Receipt, Droplets, HandHelping, Coffee, Heart, Check,
} from 'lucide-react';
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

export default function BottomActionBar({
  restaurant, favoritesCount, cartCount,
  onFavoritesClick, onCartClick, onPaymentClick,
}) {
  const [waiterOpen, setWaiterOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const options = restaurant?.waiter_call_options?.length
    ? restaurant.waiter_call_options
    : [
        { label: 'Need Bill',   icon: 'receipt' },
        { label: 'Need Water',  icon: 'droplets' },
        { label: 'Call Waiter', icon: 'hand' },
        { label: 'Need Refill', icon: 'coffee' },
      ];

  const sendAlert = (label) => {
    const state = menuStore.getState();
    const tableNum = state.tableNumber;
    entities.Order.create({
      type: 'waiter_call',
      table_number: tableNum,
      waiter_call_label: label,
      status: 'pending',
    });
    const opt = options.find(o => o.label === label);
    const toastMsg = opt?.toast_message || defaultToastMessages[label] || `${label} request sent! ✨`;
    setToast(toastMsg);
    setTimeout(() => setToast(null), 4000);
    setWaiterOpen(false);
  };

  return (
    <>
      {/* ── Waiter Call Modal ── */}
      <AnimatePresence>
        {waiterOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={() => setWaiterOpen(false)}
          >
            <motion.div
              className="rounded-2xl p-5 w-full max-w-sm shadow-2xl border"
              style={{ background: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 550, damping: 34 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>
                  Call Waiter
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setWaiterOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--theme-soft-surface)', color: 'var(--theme-text)' }}
                >
                  <X className="w-4 h-4" />
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
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors"
                      style={{
                        background: 'var(--theme-soft-surface)',
                        color: 'var(--theme-text)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--theme-action-color)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'color-mix(in srgb, var(--theme-action-color) 12%, transparent)' }}>
                        <Icon className="w-4 h-4" style={{ color: 'var(--theme-action-color)' }} />
                      </div>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Navigation Dock ── */}
      <div className="menu-bottom-bar-wrap fixed bottom-0 left-0 right-0 z-50">
        <div className="menu-bottom-bar">

          {/* Cart button — primary action */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onCartClick}
              className="bottom-dock-button relative"
              aria-label="Open cart"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: 'var(--theme-accent)', color: '#1a1a1a' }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </motion.button>
            {cartCount > 0 && (
              <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--theme-action-color)' }}>
                {cartCount}
              </span>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-6 rounded-full" style={{ background: 'var(--theme-border)' }} />

          {/* Favorites */}
          <div className="flex items-center gap-2">
            {favoritesCount > 0 && (
              <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--theme-accent)' }}>
                {favoritesCount}
              </span>
            )}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onFavoritesClick}
              className="bottom-dock-button is-secondary relative"
              aria-label="Favorites"
              title="Favorites"
            >
              <Heart className="w-4 h-4 fill-current" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: 'var(--theme-accent)', color: '#1a1a1a' }}>
                  {favoritesCount > 9 ? '9+' : favoritesCount}
                </span>
              )}
            </motion.button>
          </div>

          {/* Separator */}
          <div className="w-px h-6 rounded-full" style={{ background: 'var(--theme-border)' }} />

          {/* Payment */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onPaymentClick}
            className="bottom-dock-button is-secondary"
            aria-label="Open payment"
            title="Payment"
          >
            <CreditCard className="w-4 h-4" />
          </motion.button>

          {/* Separator */}
          <div className="w-px h-6 rounded-full" style={{ background: 'var(--theme-border)' }} />

          {/* Waiter / Bell */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setWaiterOpen(true)}
            className="bottom-dock-button is-secondary"
            aria-label="Call waiter"
            title="Call waiter"
          >
            <Bell className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* ── Waiter Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <motion.div
              className="rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center border pointer-events-auto"
              style={{ background: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
              initial={{ scale: 0.85, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 550, damping: 34 }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'color-mix(in srgb, var(--theme-action-color) 12%, transparent)' }}>
                <Check className="w-7 h-7" style={{ color: 'var(--theme-action-color)' }} />
              </div>
              <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--theme-text)' }}>{toast}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
