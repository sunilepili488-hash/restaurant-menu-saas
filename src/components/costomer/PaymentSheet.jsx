import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Receipt, Heart, Star, Sparkles, Lock, ArrowRight } from 'lucide-react';

// Change 7: real official brand logos (Google Pay, PhonePe purple logo, Paytm)
const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', scheme: (uid, name, amt) => `tez://upi/pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#4285F4', letter: 'G', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/240px-Google_Pay_Logo.svg.png' },
  { id: 'phonepe', name: 'PhonePe', scheme: (uid, name, amt) => `phonepe://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#5F259F', letter: 'P', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/240px-PhonePe_Logo.svg.png' },
  { id: 'paytm', name: 'Paytm', scheme: (uid, name, amt) => `paytmmp://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#00BAF2', letter: '₹', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paytm_logo.png/240px-Paytm_logo.png' },
  { id: 'bhim', name: 'BHIM Pay', scheme: (uid, name, amt) => `upi://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#FF6F00', letter: 'B', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/240px-UPI-Logo-vector.svg.png' },
];

const TIP_OPTIONS = [10, 30, 50, 100];

const RATING_MESSAGES = {
  1: "We're sorry to hear that",
  2: "Thanks, we'll do better",
  3: 'Good to know, thanks!',
  4: 'Glad you enjoyed it!',
  5: 'Awesome! Thanks for your feedback',
};

// Change: full redesign to match the reference layout — centered "Pay Bill"
// title under a curved gradient header (uses the restaurant's OWN theme
// color via hsl(var(--primary)), not a hardcoded purple), the flat quick-
// amount chips removed, and a tip + star-rating section added above a
// fixed "Pay Securely" CTA. Small spring/fade animations throughout.
export default function PaymentSheet({ open, onClose, restaurant, onPay }) {
  const curr = restaurant?.currency_symbol || '₹';
  const [amount, setAmount] = useState('');
  const [selectedApp, setSelectedApp] = useState(UPI_APPS[0].id);
  const [selectedTip, setSelectedTip] = useState(null); // null = No Tip
  const [customTip, setCustomTip] = useState('');
  const [showCustomTip, setShowCustomTip] = useState(false);
  const [rating, setRating] = useState(0);
  const [imgErrors, setImgErrors] = useState({});

  const baseAmount = parseFloat(amount) || 0;
  const tipAmount = customTip ? (parseFloat(customTip) || 0) : (selectedTip || 0);
  const totalAmount = baseAmount + tipAmount;

  const resetAndClose = () => {
    setAmount('');
    setSelectedTip(null);
    setCustomTip('');
    setShowCustomTip(false);
    setRating(0);
    onClose?.();
  };

  const selectTip = (val) => {
    setSelectedTip(val);
    setCustomTip('');
    setShowCustomTip(false);
  };

  const handlePaySecurely = () => {
    if (baseAmount <= 0) {
      alert('Please enter an amount first.');
      return;
    }
    const app = UPI_APPS.find(a => a.id === selectedApp) || UPI_APPS[0];
    const upiId = restaurant?.upi_id || '';
    const payeeName = restaurant?.upi_payee_name || restaurant?.name || 'Restaurant';
    if (!upiId) {
      alert('UPI payment not configured by restaurant');
      return;
    }
    window.location.href = app.scheme(upiId, payeeName, totalAmount);
    setTimeout(() => {
      onPay?.(totalAmount);
      resetAndClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="fixed inset-0 z-[70] bg-background flex flex-col"
        >
          <div className="flex-1 overflow-y-auto">
            {/* Curved gradient header — uses the restaurant's theme color */}
            <div
              className="relative pt-6 pb-14 px-6 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.72) 100%)' }}
            >
              {/* decorative floating sparkles */}
              <motion.div
                className="absolute top-9 left-12 text-white/40"
                animate={{ y: [0, -6, 0], rotate: [0, 12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <motion.div
                className="absolute top-16 right-16 text-white/30"
                animate={{ y: [0, 6, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              >
                <Sparkles className="w-3 h-3" />
              </motion.div>
              <motion.div
                className="absolute bottom-6 left-24 text-white/25"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              >
                <Sparkles className="w-3 h-3" />
              </motion.div>

              <div className="flex items-center justify-between relative z-10">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={resetAndClose}
                  className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                  aria-label="Close"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </motion.button>
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mt-3 relative z-10"
              >
                <Receipt className="w-7 h-7 text-white" />
              </motion.div>

              <h2 className="font-display text-2xl font-bold text-white text-center mt-3 relative z-10">
                ✦ Pay Bill ✦
              </h2>
              <p className="text-white/80 text-sm text-center mt-1 relative z-10">Enter amount to pay</p>
            </div>

            {/* Body — pulled up over the header's curved bottom edge */}
            <div className="px-6 -mt-8 relative z-10 pb-6 space-y-4">
              {/* Amount card */}
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.12 }}
                className="bg-white rounded-2xl p-5 shadow-lg cursor-text"
                onClick={() => document.getElementById('pb-amount-input')?.focus()}
              >
                <p className="text-[11px] text-neutral-500 text-center mb-1.5 uppercase tracking-wider font-semibold">
                  Enter amount to pay
                </p>
                <div className="flex items-baseline gap-1 justify-center">
                  <span className="text-2xl text-neutral-400 font-light">{curr}</span>
                  <input
                    id="pb-amount-input"
                    type="number"
                    inputMode="numeric"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    className="bg-transparent text-4xl font-bold text-neutral-900 text-center focus:outline-none placeholder:text-neutral-300 w-40"
                    autoFocus
                  />
                </div>
              </motion.div>

              {/* Pay with — tap to select the app, actual pay happens via the CTA below */}
              <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.16 }}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center">Pay with</p>
                <div className="grid grid-cols-4 gap-2">
                  {UPI_APPS.map(app => (
                    <motion.button
                      key={app.id}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setSelectedApp(app.id)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl glass border-2 transition-colors ${
                        selectedApp === app.id ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      {imgErrors[app.id] ? (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                          style={{ backgroundColor: app.color }}
                        >
                          {app.letter}
                        </div>
                      ) : (
                        <img
                          src={app.logo}
                          alt={app.name}
                          className="w-9 h-9 object-contain"
                          onError={() => setImgErrors(prev => ({ ...prev, [app.id]: true }))}
                        />
                      )}
                      <span className="text-[10px] font-medium text-foreground text-center leading-tight">{app.name}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Tip section */}
              <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <p className="text-sm font-semibold text-foreground">Tip your service partner</p>
                  <Heart className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => selectTip(null)}
                    className={`relative px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      selectedTip === null && !customTip ? 'text-primary-foreground' : 'text-muted-foreground border border-border'
                    }`}
                  >
                    {selectedTip === null && !customTip && (
                      <motion.div layoutId="tip-pill" className="absolute inset-0 bg-primary rounded-full -z-10" transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
                    )}
                    No Tip
                  </button>
                  {TIP_OPTIONS.map(amt => (
                    <button
                      key={amt}
                      onClick={() => selectTip(amt)}
                      className={`relative px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        selectedTip === amt && !customTip ? 'text-primary-foreground' : 'text-muted-foreground border border-border'
                      }`}
                    >
                      {selectedTip === amt && !customTip && (
                        <motion.div layoutId="tip-pill" className="absolute inset-0 bg-primary rounded-full -z-10" transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
                      )}
                      {curr}{amt}
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowCustomTip(true); setSelectedTip(null); }}
                    className={`relative px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      showCustomTip ? 'text-primary-foreground' : 'text-muted-foreground border border-border'
                    }`}
                  >
                    {showCustomTip && (
                      <motion.div layoutId="tip-pill" className="absolute inset-0 bg-primary rounded-full -z-10" transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
                    )}
                    Other
                  </button>
                </div>
                <AnimatePresence>
                  {showCustomTip && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={customTip}
                        onChange={e => setCustomTip(e.target.value)}
                        placeholder={`Custom tip (${curr})`}
                        className="w-full bg-secondary border border-border/50 rounded-xl p-2.5 text-sm mt-3 focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="text-[10px] text-muted-foreground mt-2.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary flex-shrink-0" /> 100% of tips go to your service partner
                </p>
              </motion.div>

              {/* Rating section */}
              <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.24 }} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <p className="text-sm font-semibold text-foreground">Rate your experience</p>
                  <Heart className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex gap-1.5 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <motion.button key={star} whileTap={{ scale: 0.8 }} onClick={() => setRating(star)} className="p-0.5">
                      <Star className={`w-7 h-7 transition-colors ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  {rating > 0 && (
                    <motion.p
                      key={rating}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-center text-primary font-medium mt-2"
                    >
                      {RATING_MESSAGES[rating]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* Fixed bottom CTA */}
          <div className="flex-shrink-0 bg-background border-t border-border px-6 pt-4 pb-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handlePaySecurely}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <Lock className="w-4 h-4" />
              Pay Securely
              <span className="mx-1">{curr}{totalAmount > 0 ? totalAmount.toLocaleString() : '0'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Safe &amp; Secure Payments
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
