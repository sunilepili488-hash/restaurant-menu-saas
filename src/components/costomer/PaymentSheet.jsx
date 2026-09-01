import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Receipt, Heart, Star, Sparkles, Lock, ArrowRight } from 'lucide-react';

// Local UPI logo assets — replace the /assets/upi/*.png paths below with
// wherever you keep these files in your project (e.g. src/assets/upi/...)
import gpayLogo from './assets/upi/gpay.png';
import phonepeLogo from './assets/upi/phonepe.png';
import paytmLogo from './assets/upi/paytm.png';
import bhimLogo from './assets/upi/bhim.png';

const UPI_APPS = [
  {
    id: 'gpay', name: 'Google Pay',
    scheme: (uid, name, amt) => `tez://upi/pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`,
    logo: gpayLogo,
    letter: 'G', letterBg: '#4285F4',
  },
  {
    id: 'phonepe', name: 'PhonePe',
    scheme: (uid, name, amt) => `phonepe://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`,
    logo: phonepeLogo,
    letter: 'Pe', letterBg: '#5F259F',
  },
  {
    id: 'paytm', name: 'Paytm',
    scheme: (uid, name, amt) => `paytmmp://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`,
    logo: paytmLogo,
    letter: '₹', letterBg: '#00BAF2',
  },
  {
    id: 'bhim', name: 'BHIM UPI',
    scheme: (uid, name, amt) => `upi://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`,
    logo: bhimLogo,
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
  // Single source of truth for the tip pill row: 'none' | 20 | 50 | 100 | 'custom'
  // (previously selectedTip + customTip could both be "active" at once, which
  // confused the shared layout highlight and made buttons render wrong/stuck)
  const [tipMode, setTipMode] = useState('none');
  const [customTip, setCustomTip] = useState('');
  const [rating, setRating] = useState(0);
  const [imgErrors, setImgErrors] = useState({});

  const showCustomTip = tipMode === 'custom';
  const baseAmount = parseFloat(amount) || 0;
  const tipAmount = tipMode === 'custom' ? (parseFloat(customTip) || 0) : (tipMode === 'none' ? 0 : tipMode);
  const totalAmount = baseAmount + tipAmount;

  const blurActive = () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };

  const resetAndClose = () => {
    blurActive();
    setAmount(''); setTipMode('none'); setCustomTip('');
    setRating(0); onClose?.();
  };

  const selectTip = (val) => {
    setTipMode(val); setCustomTip('');
  };

  const selectOther = () => {
    setTipMode('custom');
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

          {/* Bottom Sheet — rounded top ALWAYS stays */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-[70] max-h-[75vh] bg-background rounded-t-3xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Inner scroll — scrollbar hidden, rounded corners preserved by outer overflow-hidden */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`#pay-scroll-inner::-webkit-scrollbar { display: none; }`}</style>
              <div id="pay-scroll-inner">

                {/* Compact header — SMALLER */}
                <div
                  className="relative pt-3 pb-8 px-4 rounded-t-3xl"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%)' }}
                >
                  <motion.div className="absolute top-3 left-8 text-white/25" animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                    <Sparkles className="w-2.5 h-2.5" />
                  </motion.div>
                  <motion.div className="absolute top-6 right-12 text-white/20" animate={{ y: [0, 3, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}>
                    <Sparkles className="w-2 h-2" />
                  </motion.div>

                  <div className="flex items-center justify-between relative z-10 mb-2">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={resetAndClose} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <ArrowLeft className="w-3.5 h-3.5 text-white" />
                    </motion.button>
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  <div className="text-center relative z-10">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1.5">
                      <Receipt className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
                    </div>
                    <h2 className="font-display text-lg font-bold text-white">✦ Pay Bill ✦</h2>
                    <p className="text-white/70 text-[11px] mt-0.5">Enter amount to pay</p>
                  </div>
                </div>

                {/* Body */}
                <div className="px-3 -mt-5 relative z-10 pb-4 space-y-3">

                  {/* Amount input */}
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
                      />
                    </div>
                    {/* Show tip added on top of the bill amount */}
                    {tipAmount > 0 && (
                      <p className="text-center text-[11px] text-muted-foreground mt-1">
                        + tip {curr}{tipAmount.toLocaleString()} = <span className="font-semibold text-foreground">{curr}{totalAmount.toLocaleString()}</span>
                      </p>
                    )}
                  </div>

                  {/* Select UPI — BIGGER cards, BIGGER logos, BRIGHTER text */}
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center">
                      — Select UPI to Pay —
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {UPI_APPS.map(app => {
                        const isSelected = selectedApp === app.id;
                        const hasError = imgErrors[app.id];
                        return (
                          <motion.button
                            key={app.id}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => setSelectedApp(app.id)}
                            className={`flex flex-col items-center gap-2 py-3 px-1 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/8 shadow-[0_0_16px_hsl(var(--primary)/0.35)]'
                                : 'border-border/40 bg-card'
                            }`}
                          >
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-sm">
                              {hasError ? (
                                <div className="w-full h-full rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: app.letterBg }}>
                                  {app.letter}
                                </div>
                              ) : (
                                <img
                                  src={app.logo}
                                  alt={app.name}
                                  className="w-10 h-10 object-contain"
                                  onError={() => setImgErrors(prev => ({ ...prev, [app.id]: true }))}
                                />
                              )}
                            </div>
                            <span className={`text-[11px] font-bold leading-tight text-center ${
                              isSelected ? 'text-primary' : 'text-foreground'
                            }`}>
                              {app.name}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tip — single row, exactly one pill active at a time */}
                  <div className="glass rounded-xl p-3">
                    <div className="flex items-center justify-center gap-1.5 mb-2.5">
                      <p className="text-xs font-semibold text-foreground">Tip your service partner</p>
                      <Heart className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => selectTip('none')}
                        className={`flex-1 py-2 rounded-full text-[11px] font-bold transition-colors duration-150 ${
                          tipMode === 'none'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground bg-card border border-border'
                        }`}
                      >
                        No Tip
                      </button>
                      {TIP_OPTIONS.map(amt => (
                        <button
                          key={amt}
                          onClick={() => selectTip(amt)}
                          className={`flex-1 py-2 rounded-full text-[11px] font-bold transition-colors duration-150 ${
                            tipMode === amt
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground bg-card border border-border'
                          }`}
                        >
                          {curr}{amt}
                        </button>
                      ))}
                      <button
                        onClick={selectOther}
                        className={`flex-1 py-2 rounded-full text-[11px] font-bold transition-colors duration-150 ${
                          showCustomTip
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground bg-card border border-border'
                        }`}
                      >
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
                            className="w-full bg-card border border-border rounded-lg p-2.5 text-xs text-foreground mt-2 focus:outline-none focus:ring-1 focus:ring-primary"
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

            {/* Fixed CTA */}
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
