import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, User, Home, Check, Loader2, Lock, Eye } from 'lucide-react';
import { entities } from '@/api/entities';
import { menuStore } from '@/lib/menuStore';
import { supabase } from '@/api/supabaseClient';

// Generate 4-digit OTP
function generateOTP() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// UPI apps config (same as Issue 6)
const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', scheme: (uid, name, amt) => `tez://upi/pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, bg: '#E8F0FE', color: '#4285F4', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/120px-Google_Pay_Logo.svg.png' },
  { id: 'phonepe', name: 'PhonePe', scheme: (uid, name, amt) => `phonepe://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, bg: '#EDE7F6', color: '#5F259F', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/120px-PhonePe_Logo.svg.png' },
  { id: 'paytm', name: 'Paytm', scheme: (uid, name, amt) => `paytmmp://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, bg: '#E3F2FD', color: '#00BAF2', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paytm_logo.png/120px-Paytm_logo.png' },
  { id: 'bhim', name: 'BHIM Pay', scheme: (uid, name, amt) => `upi://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`, bg: '#FFF3E0', color: '#FF6600', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/120px-UPI-Logo-vector.svg.png' },
];

// Confirmation sound (short chime)
const CHIME_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

function playChime() {
  try {
    const audio = new Audio(CHIME_URL);
    audio.play().catch(() => {});
  } catch {}
}

export default function HomeDeliveryFlow({ open, onClose, cartItems, total, restaurant }) {
  const [step, setStep] = useState('form'); // 'form' | 'confirm'
  const [address, setAddress] = useState({ name: '', phone: '', flat: '', street: '', city: '', pincode: '' });
  const [payMethod, setPayMethod] = useState(''); // 'cod' | 'upi'
  const [selectedUpi, setSelectedUpi] = useState(null);
  const [upiPaid, setUpiPaid] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [errors, setErrors] = useState({});
  const [liveDeliveryTime, setLiveDeliveryTime] = useState(null);

  const deliveryTime = restaurant?.delivery_time_minutes || 30;
  const deliveryCharge = restaurant?.delivery_charge || 0;
  const grandTotal = total + deliveryCharge;

  // Supabase Realtime: listen for delivery_time_minutes updates on this order
  useEffect(() => {
    if (!placedOrder?.id || !supabase) return;
    try {
      const channel = supabase
        .channel(`delivery-order-${placedOrder.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'order',
          filter: `id=eq.${placedOrder.id}`,
        }, (payload) => {
          if (payload.new?.delivery_time_minutes) {
            setLiveDeliveryTime(payload.new.delivery_time_minutes);
          }
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      // Realtime not available, fall back to default
    }
  }, [placedOrder?.id]);

  const displayDeliveryTime = liveDeliveryTime || placedOrder?.deliveryTime || deliveryTime;

  const validate = () => {
    const e = {};
    if (!address.name.trim()) e.name = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(address.phone)) e.phone = 'Enter valid 10-digit mobile number';
    if (!address.flat.trim()) e.flat = 'House/Flat is required';
    if (!address.street.trim()) e.street = 'Street is required';
    if (!address.city.trim()) e.city = 'City is required';
    if (!/^\d{6}$/.test(address.pincode)) e.pincode = 'Enter valid 6-digit pincode';
    if (!payMethod) e.payMethod = 'Select a payment method';
    if (payMethod === 'upi' && !upiPaid) e.upiPaid = 'Please complete UPI payment first';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    const otp = generateOTP();
    const now = new Date();
    const estimatedBy = new Date(now.getTime() + deliveryTime * 60000);
    const estimatedByStr = estimatedBy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const customerSessionId = localStorage.getItem('customer_session_id') || '';

    const orderData = {
      type: 'order',
      is_home_delivery: true,
      items: cartItems,
      total: grandTotal,
      status: 'pending',
      delivery_otp: otp,
      delivery_name: address.name,
      delivery_phone: address.phone,
      delivery_address: address,
      payment_method: payMethod,
      table_number: 'DELIVERY',
      customer_session_id: customerSessionId,
      delivery_time_minutes: deliveryTime,
    };

    try {
      const created = await entities.Order.create(orderData);
      setPlacedOrder({ ...created, otp, estimatedByStr, deliveryTime });
      playChime();
      setShowAnimation(true);
      setPlacing(false);
      // Clear cart
      menuStore.clearCart?.();
    } catch (err) {
      setPlacing(false);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleUpiRedirect = (app) => {
    const uid = restaurant?.upi_id || '';
    const name = restaurant?.upi_payee_name || restaurant?.name || 'Restaurant';
    if (!uid) { alert('UPI not configured.'); return; }
    setSelectedUpi(app.id);
    window.location.href = app.scheme(uid, name, grandTotal);
  };

  const set = (k, v) => setAddress(a => ({ ...a, [k]: v }));

  if (!open) return null;

  // STEP: Success confirmation screen
  if (showAnimation && placedOrder) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[80] bg-background flex flex-col items-center justify-center p-6 text-center"
      >
        {/* Checkmark animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4"
        >
          <Check className="w-12 h-12 text-primary" />
        </motion.div>

        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Order Placed!</h2>
        <p className="text-muted-foreground mb-6">Your order has been placed successfully!</p>

        {/* OTP Card — shown immediately */}
        <div className="w-full max-w-sm bg-primary/5 border-2 border-primary rounded-2xl p-5 mb-4">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Your Delivery OTP</p>
          <p className="font-display text-5xl font-black text-primary tracking-widest">{placedOrder.otp}</p>
          <p className="text-xs text-muted-foreground mt-2">Share this OTP with your delivery person to receive your order.</p>
        </div>

        {/* Estimated delivery time */}
        <div className="w-full max-w-sm bg-secondary rounded-2xl p-4 mb-4 text-left">
          <p className="text-sm font-semibold">🕐 Estimated Delivery</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your order will be delivered in approximately <strong>{displayDeliveryTime} minutes</strong>.
          </p>
          <p className="text-sm text-primary font-semibold mt-1">
            Estimated delivery by: {placedOrder.estimatedByStr}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ℹ️ This is a default estimate. The restaurant will confirm and may update the delivery time.
          </p>
        </div>

        {/* Payment method badge */}
        {payMethod === 'cod' && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 rounded-full mb-4">
            <span className="text-xs font-semibold text-yellow-600">💵 Cash on Delivery</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-2 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          Back to Menu
        </button>
      </motion.div>
    );
  }

  // STEP: Address form + payment selection
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-background overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center gap-3 z-10">
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-display text-lg font-semibold flex-1">Home Delivery</h2>
          </div>

          <div className="px-4 py-4 space-y-5 max-w-lg mx-auto pb-32">
            {/* Order Summary */}
            <div className="bg-secondary rounded-2xl p-4">
              <h3 className="font-semibold text-sm mb-3">Order Summary</h3>
              {cartItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>{item.qty}× {item.name}</span>
                  <span className="text-muted-foreground">₹{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-border mt-2 pt-2 space-y-1">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span>Delivery Charge</span><span>₹{deliveryCharge}</span></div>
                <div className="flex justify-between text-sm font-bold text-primary"><span>Grand Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Delivery Address</h3>
              {[
                { key: 'name', label: 'Full Name', icon: User, placeholder: 'Your full name' },
                { key: 'phone', label: 'Phone Number', icon: Phone, placeholder: '10-digit mobile number', type: 'tel' },
                { key: 'flat', label: 'House/Flat No. & Building', icon: Home, placeholder: 'e.g. Flat 4B, Sunshine Apartments' },
                { key: 'street', label: 'Street / Area / Locality', icon: MapPin, placeholder: 'e.g. MG Road, Andheri West' },
                { key: 'city', label: 'City', icon: MapPin, placeholder: 'e.g. Mumbai' },
                { key: 'pincode', label: 'Pincode', icon: MapPin, placeholder: '6-digit pincode', type: 'tel', maxLength: 6 },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                  <div className="relative">
                    <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={f.type || 'text'}
                      maxLength={f.maxLength}
                      placeholder={f.placeholder}
                      value={address[f.key]}
                      onChange={e => set(f.key, e.target.value)}
                      className={`w-full pl-9 pr-3 py-3 bg-secondary rounded-xl text-sm outline-none border-2 transition-colors ${errors[f.key] ? 'border-destructive' : 'border-transparent focus:border-primary'}`}
                    />
                  </div>
                  {errors[f.key] && <p className="text-xs text-destructive mt-1">{errors[f.key]}</p>}
                </div>
              ))}
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Payment Method</h3>
              {errors.payMethod && <p className="text-xs text-destructive">{errors.payMethod}</p>}

              {/* COD Option */}
              <button
                onClick={() => setPayMethod('cod')}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${payMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'}`}
              >
                <span className="text-xl">💵</span>
                <div className="text-left">
                  <p className="text-sm font-semibold">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                </div>
                {payMethod === 'cod' && <Check className="w-4 h-4 text-primary ml-auto" />}
              </button>

              {/* UPI Option */}
              <div className={`rounded-2xl border-2 transition-all overflow-hidden ${payMethod === 'upi' ? 'border-primary' : 'border-border'}`}>
                <button
                  onClick={() => setPayMethod('upi')}
                  className="w-full flex items-center gap-3 p-4"
                >
                  <span className="text-xl">📱</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Online Payment (UPI)</p>
                    <p className="text-xs text-muted-foreground">Google Pay, PhonePe, Paytm, BHIM</p>
                  </div>
                  {payMethod === 'upi' && <Check className="w-4 h-4 text-primary ml-auto" />}
                </button>

                {/* UPI 2x2 Grid */}
                {payMethod === 'upi' && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {UPI_APPS.map(app => (
                        <button
                          key={app.id}
                          onClick={() => handleUpiRedirect(app)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${selectedUpi === app.id ? 'border-primary' : 'border-border'}`}
                          style={{ background: app.bg }}
                        >
                          <img src={app.logo} alt={app.name} className="h-7 w-auto object-contain" onError={e => { e.target.style.display='none'; }} />
                          <span className="text-xs font-semibold" style={{ color: app.color }}>{app.name}</span>
                        </button>
                      ))}
                    </div>
                    {selectedUpi && !upiPaid && (
                      <button
                        onClick={() => setUpiPaid(true)}
                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                      >
                        ✓ I have paid
                      </button>
                    )}
                    {upiPaid && (
                      <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                        <Check className="w-4 h-4" /> Payment confirmed
                      </div>
                    )}
                    {errors.upiPaid && <p className="text-xs text-destructive">{errors.upiPaid}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Place Order Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {placing ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</> : `Place Order — ₹${grandTotal.toLocaleString()}`}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
