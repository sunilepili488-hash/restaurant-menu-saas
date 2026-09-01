import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Receipt, Heart, Star, Sparkles, Lock, ArrowRight, X } from 'lucide-react';

const UPI_APPS = [
  {
    id: 'gpay', name: 'Google Pay',
    scheme: (uid, name, amt) => `tez://upi/pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`,
    color: '#4285F4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png',
    fallback: 'https://cdn.iconscout.com/icon/free/png-256/free-google-pay-2038779-1721670.png',
    letter: 'G', letterBg: '#4285F4',
  },
  {
    id: 'phonepe', name: 'PhonePe',
    scheme: (uid, name, amt) => `phonepe://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`,
    color: '#5F259F',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/512px-PhonePe_Logo.svg.png',
    fallback: 'https://cdn.iconscout.com/icon/free/png-256/free-phonepe-2709167-2249157.png',
    letter: 'Pe', letterBg: '#5F259F',
  },
  {
    id: 'paytm', name: 'Paytm',
    scheme: (uid, name, amt) => `paytmmp://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`,
    color: '#00BAF2',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paytm_logo.png/512px-Paytm_logo.png',
    fallback: 'https://cdn.iconscout.com/icon/free/png-256/free-paytm-226448.png',
    letter: '₹', letterBg: '#00BAF2',
  },
  {
    id: 'bhim', name: 'BHIM UPI',
    scheme: (uid, name, amt) => `upi://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`,
    color: '#FF6F00',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/512px-UPI-Logo-vector.svg.png',
    fallback: 'https://cdn.iconscout.com/icon/free/png-256/free-bhim-3-is-621.png',
    letter: 'B', letterBg: '#FF6F00',
  },
];

const TIP_OPTIONS = [20, 50, 100];

const RATING_MESSAGES = {
  1: "We're sorry to hear that",
  2: "Thanks, we'll do better",
  3: 'Good to know, thanks!',
  4: 'Glad you enjoyed it!',
  5: 'Awesome! Thanks for your feedback',
};

export default function PaymentSheet({ open, onClose, restaurant, onPay }) {
  const curr = restaurant?.currency_symbol || '₹';
  const [amount, setAmount] = useState('');
  const [selectedApp, setSelectedApp] = useState('gpay');
  const [selectedTip, setSelectedTip] = useState(null);
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
    if (baseAmount <= 0) { alert('Please enter an amount first.'); return; }
    const app = UPI_APPS.find(a => a.id === selectedApp) || UPI_APPS[0];
    const upiId = restaurant?.upi_id || '';
    const payeeName = restaurant?.upi_payee_name || restaurant?.name || 'Restaurant';
    if (!upiId) { alert('UPI payment not configured by restaurant'); return; }
    window.location.href = app.scheme(upiId, payeeName, totalAmount);
    setTimeout(() => { onPay?.(totalAmount); resetAndClose(); }, 800);
  };

  const handleImgError = (appId) => {
    if (!imgErrors[appId]) {
      // Try fallback first
      setImgErrors(prev => ({ ...prev, [appId]: 'fallback' }));
    }
  };

  const handleFallbackError = (appId) => {
    setImgErrors(prev => ({ ...prev, [appId]: 'letter' }));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[69] bg-black/50 backdrop-blur-sm"
            onClick={resetAndClose}
          />

          {/* Bottom Sheet — 75% height max */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-[70] max-h-[75vh] bg-background rounded-t-3xl flex flex-col shadow-2xl"
          >
            {/* Scrollable content — hidden scrollbar */}
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              <style>{`.pay-scroll::-webkit-scrollbar { display: none; }`}</style>
              <div className="pay-scroll">

                {/* Compact gradient header */}
                <div
                  className="relative pt-4 pb-10 px-4 overflow-hidden rounded-t-3xl"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%)' }}
                >
                  <motion.div className="absolute top-4 left-10 text-white/30" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                    <Sparkles className="w-3 h-3" />
                  </motion.div>
                  <motion.div className="absolute top-8 right-14 text-white/25" animate={{ y: [0, 4, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
                    <Sparkles className="w-2.5 h-2.5" />
                  </motion.div>

                  <div className="flex items-center justify-between relative z-10 mb-3">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={resetAndClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <ArrowLeft className="w-4 h-4 text-white" />
                    </motion.button>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="text-center relative z-10">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                      <Receipt className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-white">✦ Pay Bill ✦</h2>
                    <p className="text-white/75 text-xs mt-0.5">Enter amount to pay</p>
                  </div>
                </div>

                {/* Body */}
                <div className="px-3 -mt-6 relative z-10 pb-4 space-y-3">

                  {/* Amount input — ₹ stays with the number */}
                  <div
                    className="bg-card border border-border rounded-2xl p-4 shadow-sm cursor-text"
                    onClick={() => document.getElementById('pb-amount-input')?.focus()}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-2xl font-light text-muted-foreground">{curr}</span>
                      <input
                        id="pb-amount-input"
                        type="number"
                        inputMode="numeric"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0"
                        className="bg-transparent text-3xl font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/30 w-32 text-left"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Select UPI to Pay */}
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center">
                      — Select UPI to Pay —
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {UPI_APPS.map(app => {
                        const isSelected = selectedApp === app.id;
                        const errorState = imgErrors[app.id];
                        return (
                          <motion.button
                            key={app.id}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => setSelectedApp(app.id)}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                                : 'border-border/50 bg-card'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                              {errorState === 'letter' ? (
                                <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: app.letterBg }}>
                                  {app.letter}
                                </div>
                              ) : errorState === 'fallback' ? (
                                <img src={app.fallback} alt={app.name} className="w-7 h-7 object-contain" onError={() => handleFallbackError(app.id)} />
                              ) : (
                                <img src={app.logo} alt={app.name} className="w-7 h-7 object-contain" onError={() => handleImgError(app.id)} />
                              )}
                            </div>
                            <span className={`text-[9px] font-semibold leading-tight text-center ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                              {app.name}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tip — single row: No Tip, ₹20, ₹50, ₹100, Custom */}
                  <div className="glass rounded-xl p-3">
                    <div className="flex items-center justify-center gap-1.5 mb-2.5">
                      <p className="text-xs font-semibold text-foreground">Tip your service partner</p>
                      <Heart className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex gap-1.5">
                      {/* No Tip */}
                      <button
                        onClick={() => selectTip(null)}
                        className={`relative flex-1 py-2 rounded-full text-[11px] font-semibold transition-colors ${
                          selectedTip === null && !customTip ? 'text-primary-foreground' : 'text-muted-foreground border border-border'
                        }`}
                      >
                        {selectedTip === null && !customTip && (
                          <motion.div layoutId="tip-bg" className="absolute inset-0 bg-primary rounded-full -z-10" transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
                        )}
                        No Tip
                      </button>
                      {/* ₹20, ₹50, ₹100 */}
                      {TIP_OPTIONS.map(amt => (
                        <button
                          key={amt}
                          onClick={() => selectTip(amt)}
                          className={`relative flex-1 py-2 rounded-full text-[11px] font-semibold transition-colors ${
                            selectedTip === amt && !customTip ? 'text-primary-foreground' : 'text-muted-foreground border border-border'
                          }`}
                        >
                          {selectedTip === amt && !customTip && (
                            <motion.div layoutId="tip-bg" className="absolute inset-0 bg-primary rounded-full -z-10" transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
                          )}
                          {curr}{amt}
                        </button>
                      ))}
                      {/* Custom */}
                      <button
                        onClick={() => { setShowCustomTip(true); setSelectedTip(null); }}
                        className={`relative flex-1 py-2 rounded-full text-[11px] font-semibold transition-colors ${
                          showCustomTip ? 'text-primary-foreground' : 'text-muted-foreground border border-border'
                        }`}
                      >
                        {showCustomTip && (
                          <motion.div layoutId="tip-bg" className="absolute inset-0 bg-primary rounded-full -z-10" transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
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
                            className="w-full bg-secondary border border-border/50 rounded-lg p-2 text-xs mt-2 focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <p className="text-[9px] text-muted-foreground mt-2 flex items-center justify-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-primary" /> 100% of tips go to your service partner
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="glass rounded-xl p-3">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <p className="text-xs font-semibold text-foreground">Rate your experience</p>
                      <Heart className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex gap-1 justify-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <motion.button key={star} whileTap={{ scale: 0.8 }} onClick={() => setRating(star)} className="p-0.5">
                          <Star className={`w-6 h-6 transition-colors ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                        </motion.button>
                      ))}
                    </div>
                    <AnimatePresence mode="wait">
                      {rating > 0 && (
                        <motion.p key={rating} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[10px] text-center text-primary font-medium mt-1.5">
                          {RATING_MESSAGES[rating]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed bottom CTA */}
            <div className="flex-shrink-0 bg-background border-t border-border px-3 pt-3 pb-5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePaySecurely}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Lock className="w-3.5 h-3.5" />
                Pay Securely
                <span>{curr}{totalAmount > 0 ? totalAmount.toLocaleString() : '0'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
              <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mt-2">
                <ShieldCheck className="w-3 h-3" /> Safe & Secure Payments
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
