import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet } from 'lucide-react';

// Change 7: real official brand logos (Google Pay, PhonePe purple logo, Paytm)
const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', scheme: (uid, name, amt) => `tez://upi/pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#4285F4', bg: 'linear-gradient(135deg,#EAF1FE,#F6FAFF)', letter: 'G', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/240px-Google_Pay_Logo.svg.png' },
  { id: 'phonepe', name: 'PhonePe', scheme: (uid, name, amt) => `phonepe://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#5F259F', bg: 'linear-gradient(135deg,#F1EAFA,#F9F5FE)', letter: 'P', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/240px-PhonePe_Logo.svg.png' },
  { id: 'paytm', name: 'Paytm', scheme: (uid, name, amt) => `paytmmp://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#00BAF2', bg: 'linear-gradient(135deg,#E4F8FE,#F3FCFF)', letter: '₹', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paytm_logo.png/240px-Paytm_logo.png' },
  { id: 'bhim', name: 'BHIM Pay', scheme: (uid, name, amt) => `upi://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#FF6F00', bg: 'linear-gradient(135deg,#FFF1E2,#FFF8F0)', letter: 'B', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/240px-UPI-Logo-vector.svg.png' },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000];

export default function PaymentSheet({ open, onClose, restaurant, onPay }) {
  const [amount, setAmount] = useState('');
  const [imgErrors, setImgErrors] = useState({});
  const curr = restaurant?.currency_symbol || '₹';

  const handleUpiTap = (app) => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      alert('Please enter an amount first.');
      return;
    }
    const upiId = restaurant?.upi_id || '';
    const payeeName = restaurant?.upi_payee_name || restaurant?.name || 'Restaurant';
    if (!upiId) {
      alert('UPI payment not configured by restaurant');
      return;
    }
    window.location.href = app.scheme(upiId, payeeName, num);
    setTimeout(() => {
      onPay?.(num);
      setAmount('');
      onClose?.();
    }, 800);
  };

  const handleClose = () => {
    setAmount('');
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[71] bg-background rounded-t-3xl overflow-hidden max-h-[88vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Gradient header with amount card */}
            <div
              className="px-6 pt-6 pb-8"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-display text-lg font-semibold text-white">Pay Bill</h2>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              <div
                className="bg-white/95 rounded-2xl p-5 cursor-text shadow-lg"
                onClick={() => document.getElementById('pay-amount-input')?.focus()}
              >
                <p className="text-[11px] text-neutral-500 mb-1.5 uppercase tracking-wider font-semibold">Enter amount to pay</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl text-neutral-400 font-light">{curr}</span>
                  <input
                    id="pay-amount-input"
                    type="number"
                    inputMode="numeric"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-transparent text-4xl font-bold text-neutral-900 focus:outline-none placeholder:text-neutral-300 min-w-0 w-full"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-3 flex-wrap">
                {QUICK_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setAmount(String(amt))}
                    className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold hover:bg-white/30 transition-colors"
                  >
                    {curr}{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* UPI App Selection */}
            <div className="px-6 pt-5 pb-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pay with</p>
              <div className="grid grid-cols-2 gap-3">
                {UPI_APPS.map(app => (
                  <motion.button
                    key={app.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleUpiTap(app)}
                    className="flex items-center gap-3 p-4 rounded-2xl transition-all border border-border/60 hover:border-primary/40 hover:shadow-md"
                    style={{ background: app.bg }}
                  >
                    {imgErrors[app.id] ? (
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: app.color }}
                      >
                        {app.letter}
                      </div>
                    ) : (
                      <img
                        src={app.logo}
                        alt={app.name}
                        className="w-11 h-11 object-contain flex-shrink-0"
                        onError={() => setImgErrors(prev => ({ ...prev, [app.id]: true }))}
                      />
                    )}
                    <span className="text-sm font-semibold text-left leading-tight" style={{ color: app.color }}>{app.name}</span>
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Tap a UPI app above to pay {curr}{parseFloat(amount) > 0 ? parseFloat(amount).toLocaleString() : '0'} instantly
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
