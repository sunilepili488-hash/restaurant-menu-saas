import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, CreditCard } from 'lucide-react';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', scheme: (uid, name, amt) => `tez://upi/pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#4285F4', letter: 'G', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/1200px-Google_Pay_Logo_%282020%29.svg.png' },
  { id: 'phonepe', name: 'PhonePe', scheme: (uid, name, amt) => `phonepe://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#5F259F', letter: 'P', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.svg/1200px-PhonePe_Logo.svg.png' },
  { id: 'paytm', name: 'Paytm', scheme: (uid, name, amt) => `paytmmp://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#00BAF2', letter: '₹', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/1200px-Paytm_Logo_%28standalone%29.svg.png' },
  { id: 'bhim', name: 'BHIM Pay', scheme: (uid, name, amt) => `upi://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#FF6F00', letter: 'B', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/BHIM_logo.svg/1200px-BHIM_logo.svg.png' },
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

  // One-tap redirect — fires synchronously inside the UPI icon's onClick,
  // matching the proven working pattern in HomeDeliveryFlow.jsx.
  const handleUpiTap = (app) => {
    const upiId = restaurant?.upi_id || '';
    const payeeName = restaurant?.upi_payee_name || restaurant?.name || 'Restaurant';
    if (!upiId) {
      alert('UPI payment not configured by restaurant');
      return;
    }
    // Build the UPI deep-link using the app's function-based scheme —
    // identical pattern to the working HomeDeliveryFlow.jsx.
    // e.g. tez://upi/pay?pa=... (NOT tez://pay?... which is malformed)
    window.location.href = app.scheme(upiId, payeeName, totalAmount);

    // Close the sheet shortly after, for cleanup purposes only — the
    // redirect itself has already fired above.
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
            className="fixed bottom-0 left-0 right-0 z-[71] bg-background rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Pay</h2>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleClose}>
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Amount display */}
            <div className="glass rounded-2xl p-4 mb-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Amount</p>
              <p className="font-display text-3xl font-bold text-primary">
                {curr}{totalAmount.toLocaleString()}
              </p>
              {tipAmount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  incl. tip {curr}{tipAmount.toLocaleString()}
                </p>
              )}
            </div>

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

            {/* UPI App Selection — tapping an app now redirects immediately */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pay with</p>
              <div className="grid grid-cols-2 gap-3">
                {UPI_APPS.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleUpiTap(app)}
                    className="flex items-center gap-3 p-3 rounded-2xl transition-all glass hover:bg-primary/5 active:scale-95"
                  >
                    {imgErrors[app.id] ? (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: app.color }}
                      >
                        {app.letter}
                      </div>
                    ) : (
                      <img
                        src={app.logo}
                        alt={app.name}
                        className="w-10 h-10 object-contain flex-shrink-0"
                        onError={() => setImgErrors(prev => ({ ...prev, [app.id]: true }))}
                      />
                    )}
                    <span className="text-xs font-medium text-center leading-tight">{app.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Tap a UPI app above to pay {curr}{totalAmount.toLocaleString()} instantly
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
