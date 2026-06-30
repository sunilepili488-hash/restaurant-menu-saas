import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard } from 'lucide-react';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', scheme: (uid, name, amt) => `tez://upi/pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#4285F4', letter: 'G', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/1200px-Google_Pay_Logo_%282020%29.svg.png' },
  { id: 'phonepe', name: 'PhonePe', scheme: (uid, name, amt) => `phonepe://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#5F259F', letter: 'P', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.svg/1200px-PhonePe_Logo.svg.png' },
  { id: 'paytm', name: 'Paytm', scheme: (uid, name, amt) => `paytmmp://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#00BAF2', letter: '₹', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/1200px-Paytm_Logo_%28standalone%29.svg.png' },
  { id: 'bhim', name: 'BHIM Pay', scheme: (uid, name, amt) => `upi://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, color: '#FF6F00', letter: 'B', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/BHIM_logo.svg/1200px-BHIM_logo.svg.png' },
];

export default function PaymentSheet({ open, onClose, restaurant, onPay }) {
  const [amount, setAmount] = useState('');
  const [imgErrors, setImgErrors] = useState({});
  const curr = restaurant?.currency_symbol || '₹';

  // One-tap redirect — fires synchronously inside the UPI icon's onClick,
  // matching the proven working pattern in HomeDeliveryFlow.jsx.
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
    // Build the UPI deep-link using the app's function-based scheme —
    // identical pattern to the working HomeDeliveryFlow.jsx.
    // e.g. tez://upi/pay?pa=... (NOT tez://pay?... which is malformed)
    window.location.href = app.scheme(upiId, payeeName, num);

    // Close the sheet shortly after, for cleanup purposes only — the
    // redirect itself has already fired above.
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

            {/* Amount input */}
            <div
              className="glass rounded-2xl p-5 mb-4 cursor-text"
              onClick={() => document.getElementById('pay-amount-input')?.focus()}
            >
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Enter amount to pay</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl text-muted-foreground font-light">{curr}</span>
                <input
                  id="pay-amount-input"
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent text-4xl font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/30 min-w-0 w-full"
                  autoFocus
                />
              </div>
            </div>

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
                Tap a UPI app above to pay {curr}{parseFloat(amount) > 0 ? parseFloat(amount).toLocaleString() : '0'} instantly
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
