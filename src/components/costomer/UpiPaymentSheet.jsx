import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Wallet } from 'lucide-react';

// Change 7: real official brand logos (Google Pay, PhonePe purple logo, Paytm)
const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', scheme: (uid, name, amt) => `tez://upi/pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#4285F4', bg: 'linear-gradient(135deg,#EAF1FE,#F6FAFF)', letter: 'G', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/240px-Google_Pay_Logo.svg.png' },
  { id: 'phonepe', name: 'PhonePe', scheme: (uid, name, amt) => `phonepe://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#5F259F', bg: 'linear-gradient(135deg,#F1EAFA,#F9F5FE)', letter: 'P', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/240px-PhonePe_Logo.svg.png' },
  { id: 'paytm', name: 'Paytm', scheme: (uid, name, amt) => `paytmmp://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#00BAF2', bg: 'linear-gradient(135deg,#E4F8FE,#F3FCFF)', letter: '₹', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paytm_logo.png/240px-Paytm_logo.png' },
  { id: 'bhim', name: 'BHIM Pay', scheme: (uid, name, amt) => `upi://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#FF6F00', bg: 'linear-gradient(135deg,#FFF1E2,#FFF8F0)', letter: 'B', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/240px-UPI-Logo-vector.svg.png' },
];

const TIP_OPTIONS = [10, 30, 50, 100];

export default function UpiPaymentSheet({ open, onClose, amount, restaurant, showTipAndRating = true, onPaymentDone }) {
  const curr = restaurant?.currency_symbol || '₹';
  const [selectedTip, setSelectedTip] = useState(null); // null = No Tip
  const [customTip, setCustomTip] = useState('');
  const [rating, setRating] = useState(0);
  const [imgErrors, setImgErrors] = useState({});

  const tipAmount = customTip ? parseFloat(customTip) || 0 : (selectedTip || 0);
  const totalAmount = amount + tipAmount;

  const handleUpiTap = (app) => {
    const upiId = restaurant?.upi_id || '';
    const payeeName = restaurant?.upi_payee_name || restaurant?.name || 'Restaurant';
    if (!upiId) {
      alert('UPI payment not configured by restaurant');
      return;
    }
    window.location.href = app.scheme(upiId, payeeName, totalAmount);
    setTimeout(() => {
      onPaymentDone?.();
      onClose?.();
    }, 800);
  };

  const handleClose = () => {
    setSelectedTip(null);
    setCustomTip('');
    setRating(0);
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
            className="fixed bottom-0 left-0 right-0 z-[71] bg-background rounded-t-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Gradient header with total amount */}
            <div
              className="px-6 pt-6 pb-7"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-display text-lg font-semibold text-white">Pay Bill</h2>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>

              <div className="bg-white/95 rounded-2xl p-4 text-center shadow-lg">
                <p className="text-[11px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">Amount</p>
                <p className="font-display text-3xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                  {curr}{totalAmount.toLocaleString()}
                </p>
                {tipAmount > 0 && (
                  <p className="text-xs text-neutral-500 mt-1">
                    incl. tip {curr}{tipAmount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 pt-5">
              {/* Tip section — only when showTipAndRating */}
              {showTipAndRating && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Add a tip</p>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <button
                      onClick={() => { setSelectedTip(null); setCustomTip(''); }}
                      className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                        selectedTip === null && !customTip
                          ? 'bg-primary text-primary-foreground'
                          : 'glass text-foreground hover:bg-primary/10 border border-border'
                      }`}
                    >
                      No Tip
                    </button>
                    {TIP_OPTIONS.map(amt => (
                      <button
                        key={amt}
                        onClick={() => { setSelectedTip(amt); setCustomTip(''); }}
                        className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                          selectedTip === amt && !customTip
                            ? 'bg-primary text-primary-foreground'
                            : 'glass text-foreground hover:bg-primary/10'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={customTip}
                    onChange={e => { setCustomTip(e.target.value); setSelectedTip(null); }}
                    placeholder={`Custom tip (${curr})`}
                    className="w-full bg-secondary border border-border/50 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              {/* Rating section — only when showTipAndRating */}
              {showTipAndRating && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rate your experience</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform active:scale-90"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* UPI App Selection */}
              <div className="mb-6">
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
                  Tap a UPI app above to pay {curr}{totalAmount.toLocaleString()} instantly
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
