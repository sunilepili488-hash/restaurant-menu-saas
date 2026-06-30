import React, { useState, useEffect, useRef } from 'react';
import { entities } from '@/api/entities';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, LogOut, Search, Volume2, VolumeX, Loader2, Bell, Clock, CheckCircle2, XCircle, CheckCheck, Trash2, Eye, ChevronDown, Truck, Phone, MapPin, Pencil, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

function shortId(id) {
  return String(id || '').slice(0, 5);
}

function OrderCard({ order, onUpdate, onSetPrepTime, tabType }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelMode, setCancelMode] = useState(false);
  const [reason, setReason] = useState('');
  const currency = '\u20b9';
  const items = order.items || [];
  const isReady = order.status === 'ready';
  const isPending = order.status === 'pending';
  const isConfirmed = order.status === 'confirmed';

  // Inline editable prep time
  const avgPrepMin = items.length > 0
    ? Math.ceil(items.reduce((sum, item) => sum + (item.prep_time || 15), 0) / items.length)
    : 15;
  const existingPrep = order.prep_time_override || avgPrepMin;
  const [prepTime, setPrepTime] = useState(String(existingPrep));

  // Sync prepTime if order changes from outside
  useEffect(() => {
    setPrepTime(String(order.prep_time_override || avgPrepMin));
  }, [order.prep_time_override, avgPrepMin]);

  const handlePrepBlur = () => {
    const mins = parseInt(prepTime) || avgPrepMin;
    if (mins !== (order.prep_time_override || avgPrepMin)) {
      onSetPrepTime(order, mins);
    }
  };

  const handleCancel = () => {
    if (cancelMode) {
      onUpdate(order.id, 'cancelled', reason);
      setCancelMode(false);
      setReason('');
    } else {
      setCancelMode(true);
    }
  };

  return (
    <div className="glass rounded-xl p-4 border border-border space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">Table {order.table_number || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">#{shortId(order.id)}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {timeAgo(order.created_at)}
          </span>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Eye className="w-3 h-3" /> See Order
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-1"
          >
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span>{item.qty}\u00d7 {item.name}</span>
                <span className="text-muted-foreground">{currency}{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
            {order.total > 0 && (
              <div className="flex justify-between text-xs font-semibold pt-1 border-t border-border">
                <span>Subtotal</span>
                <span>{currency}{order.total.toLocaleString()}</span>
              </div>
            )}
            {order.special_instructions && (
              <p className="text-xs text-muted-foreground italic pt-1 break-words">\ud83d\udcdd {order.special_instructions}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline editable time box */}
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        <input
          type="text"
          inputMode="numeric"
          value={prepTime}
          onChange={e => {
            const val = e.target.value;
            if (val === '' || /^\d+$/.test(val)) setPrepTime(val);
          }}
          onBlur={handlePrepBlur}
          onKeyDown={e => { if (e.key === 'Enter') handlePrepBlur(); }}
          className="w-14 text-center text-sm font-bold bg-secondary rounded-lg px-2 py-1 border border-border focus:border-primary outline-none transition-colors"
        />
        <span className="text-xs text-muted-foreground">min</span>
      </div>

      {cancelMode && (
        <div className="flex gap-2">
          <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Cancel reason (optional)" className="bg-secondary text-sm h-8 break-words" />
          <Button size="sm" variant="destructive" onClick={handleCancel}>Confirm</Button>
          <Button size="sm" variant="outline" onClick={() => setCancelMode(false)}>Back</Button>
        </div>
      )}

      {!cancelMode && (
        <div className="flex items-center justify-end gap-2 pt-1">
          {isPending && (
            <>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const mins = parseInt(prepTime) || avgPrepMin;
                  onUpdate(order.id, 'confirmed', undefined, mins);
                }}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-green-500 hover:bg-green-500/10 transition-colors"
                title="Confirm"
              >
                <CheckCircle2 className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCancel}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
                title="Cancel"
              >
                <XCircle className="w-5 h-5" />
              </motion.button>
            </>
          )}
          {isConfirmed && (
            <>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onUpdate(order.id, 'ready')}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-green-500 hover:bg-green-500/10 transition-colors"
                title="Ready"
              >
                <CheckCheck className="w-5 h-5" />
              </motion.button>
            </>
          )}
          {isReady && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => entities.Order.delete(order.id).then(() => {})}
              className="w-9 h-9 rounded-full glass flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}

function DeliveryOrderCard({ order, onUpdate, onSetDeliveryTime, onSetDeliveryBoyPhone, restaurant }) {
  const [expanded, setExpanded] = useState(false);
  const currency = '\u20b9';
  const items = order.items || [];
  const isPending = order.status === 'pending';
  const isConfirmed = order.status === 'confirmed';
  const isReady = order.status === 'ready';
  const paymentMethod = order.payment_method || 'cod';
  const deliveryAddress = order.delivery_address || {};
  const deliveryOtp = order.delivery_otp || '\u2014';

  // Inline editable delivery time
  const defaultDeliveryMin = restaurant?.delivery_time_minutes || 30;
  const [deliveryTime, setDeliveryTime] = useState(String(order.delivery_time_minutes || defaultDeliveryMin));

  // Inline editable delivery boy phone
  const defaultDeliveryBoyPhone = restaurant?.delivery_help_phone || '';
  const [deliveryBoyPhone, setDeliveryBoyPhone] = useState(String(order.delivery_boy_phone ?? defaultDeliveryBoyPhone));

  useEffect(() => {
    setDeliveryTime(String(order.delivery_time_minutes || defaultDeliveryMin));
  }, [order.delivery_time_minutes, defaultDeliveryMin]);

  useEffect(() => {
    setDeliveryBoyPhone(String(order.delivery_boy_phone ?? defaultDeliveryBoyPhone));
  }, [order.delivery_boy_phone, defaultDeliveryBoyPhone]);

  const handleDeliveryBlur = () => {
    const mins = parseInt(deliveryTime) || defaultDeliveryMin;
    if (mins !== (order.delivery_time_minutes || defaultDeliveryMin)) {
      onSetDeliveryTime(order, mins);
    }
  };

  const handleDeliveryBoyPhoneBlur = () => {
    const phone = deliveryBoyPhone.trim();
    if (phone !== (order.delivery_boy_phone ?? defaultDeliveryBoyPhone)) {
      onSetDeliveryBoyPhone(order, phone);
    }
  };

  return (
    <div className="glass rounded-xl p-4 border border-amber-500/30 space-y-3">
      {/* Header with OTP badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold">Home Delivery</span>
          <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold">
            OTP: {deliveryOtp}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">#{shortId(order.id)}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {timeAgo(order.created_at)}
          </span>
        </div>
      </div>

      {/* Customer info */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold">{order.delivery_name || 'N/A'}</span>
          {order.delivery_phone && (
            <a href={`tel:${order.delivery_phone}`} className="flex items-center gap-1 text-blue-500 hover:underline">
              <Phone className="w-3 h-3" /> {order.delivery_phone}
            </a>
          )}
        </div>
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span className="break-words">
            {deliveryAddress.flat && `${deliveryAddress.flat}, `}
            {deliveryAddress.street && `${deliveryAddress.street}, `}
            {deliveryAddress.city && `${deliveryAddress.city}, `}
            {deliveryAddress.pincode && deliveryAddress.pincode}
          </span>
        </div>
      </div>

      {/* Payment method badge */}
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentMethod === 'upi' ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
          {paymentMethod === 'upi' ? 'UPI Paid' : 'COD'}
        </span>
        {order.total > 0 && (
          <span className="text-xs font-semibold">{currency}{order.total.toLocaleString()}</span>
        )}
      </div>

      {/* Inline editable delivery time box */}
      <div className="flex items-center gap-2">
        <Truck className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs text-muted-foreground">Delivery:</span>
        <input
          type="text"
          inputMode="numeric"
          value={deliveryTime}
          onChange={e => {
            const val = e.target.value;
            if (val === '' || /^\d+$/.test(val)) setDeliveryTime(val);
          }}
          onBlur={handleDeliveryBlur}
          onKeyDown={e => { if (e.key === 'Enter') handleDeliveryBlur(); }}
          className="w-14 text-center text-sm font-bold bg-secondary rounded-lg px-2 py-1 border border-border focus:border-amber-500 outline-none transition-colors"
        />
        <span className="text-xs text-muted-foreground">min</span>
      </div>

      {/* Inline editable delivery boy phone */}
      <div className="flex items-center gap-2">
        <Phone className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-xs text-muted-foreground">Delivery Boy:</span>
        <input
          type="tel"
          value={deliveryBoyPhone}
          onChange={e => setDeliveryBoyPhone(e.target.value)}
          onBlur={handleDeliveryBoyPhoneBlur}
          onKeyDown={e => { if (e.key === 'Enter') handleDeliveryBoyPhoneBlur(); }}
          className="flex-1 text-sm font-semibold bg-secondary rounded-lg px-2 py-1 border border-border focus:border-blue-500 outline-none transition-colors"
          placeholder="Phone no."
        />
      </div>

      {/* Expandable items */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Eye className="w-3 h-3" /> See Items
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-1"
          >
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span>{item.qty}\u00d7 {item.name}</span>
                <span className="text-muted-foreground">{currency}{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
            {order.special_instructions && (
              <p className="text-xs text-muted-foreground italic pt-1 break-words">\ud83d\udcdd {order.special_instructions}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {isPending && (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdate(order.id, 'confirmed')}
              className="w-9 h-9 rounded-full glass flex items-center justify-center text-green-500 hover:bg-green-500/10 transition-colors"
              title="Confirm"
            >
              <CheckCircle2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdate(order.id, 'cancelled')}
              className="w-9 h-9 rounded-full glass flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
              title="Cancel"
            >
              <XCircle className="w-5 h-5" />
            </motion.button>
          </>
        )}
        {isConfirmed && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdate(order.id, 'ready')}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-green-500 hover:bg-green-500/10 transition-colors"
            title="Mark Ready"
          >
            <CheckCheck className="w-5 h-5" />
          </motion.button>
        )}
        {isReady && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdate(order.id, 'completed')}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-blue-500 hover:bg-blue-500/10 transition-colors"
            title="Mark Delivered"
          >
            <Truck className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}

function WaiterCallCard({ order, onResolve }) {
  const mins = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
  const isOld = mins >= 5;

  return (
    <div className={`rounded-xl border-2 p-3 flex items-center gap-3 ${isOld ? 'border-red-500/60 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isOld ? 'bg-red-500/20' : 'bg-accent/20'}`}>
        <Bell className="w-4 h-4 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate break-words">{order.waiter_call_label}</p>
        <p className="text-xs text-muted-foreground">
          {order.table_number ? `Table ${order.table_number}` : 'No table'} \u00b7 {timeAgo(order.created_at)}
        </p>
      </div>
      <Button size="sm" className="gap-1 bg-green-600 text-white flex-shrink-0" onClick={() => onResolve(order.id)}>
        <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
      </Button>
    </div>
  );
}

export default function OrderReceiver() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('confirmation');
  const [search, setSearch] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const prevOrderCount = useRef(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem('order_receiver_auth') === 'true') setAuthed(true);
  }, []);

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurant'],
    queryFn: () => entities.Restaurant.list(),
    enabled: !authed,
  });

  const handleLogin = () => {
    const r = restaurants[0];
    if (username === (r?.admin_username || 'admin') && password === (r?.admin_password || 'admin123')) {
      localStorage.setItem('order_receiver_auth', 'true');
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('order_receiver_auth');
    setAuthed(false);
    setUsername('');
    setPassword('');
  };

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => entities.Order.list('-created_at', 200),
    refetchInterval: 7000,
    enabled: authed,
  });

  useEffect(() => {
    if (!authed || !soundOn) return;
    if (orders.length > prevOrderCount.current && prevOrderCount.current > 0) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch {}
    }
    prevOrderCount.current = orders.length;
  }, [orders, authed, soundOn]);

  // Updated to accept 4th param: prepMins — sets timer_started_at + prep_time_override on confirm
  const updateOrderStatus = async (id, status, cancelReason, prepMins) => {
    try {
      const data = { status };
      if (cancelReason) data.cancel_reason = cancelReason;
      if (status === 'confirmed') {
        data.confirmed_at = new Date().toISOString();
        // Start timer when confirming — use prepMins if provided
        data.timer_started_at = new Date().toISOString();
        if (prepMins !== undefined && prepMins !== null) {
          data.prep_time_override = prepMins;
        }
      }
      if (status === 'completed' && cancelReason === undefined) {
        data.delivered_at = new Date().toISOString();
      }
      await entities.Order.update(id, data);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err) {
      console.error('Order update failed:', err);
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleSetPrepTime = async (order, minutes) => {
    try {
      const updateData = { prep_time_override: minutes };
      if (order.status === 'confirmed') {
        updateData.timer_started_at = new Date().toISOString();
      }
      await entities.Order.update(order.id, updateData);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err) {
      console.error('Prep time update failed:', err);
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleSetDeliveryTime = async (order, minutes) => {
    try {
      await entities.Order.update(order.id, { delivery_time_minutes: minutes });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err) {
      console.error('Delivery time update failed:', err);
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleSetDeliveryBoyPhone = async (order, phone) => {
    try {
      await entities.Order.update(order.id, { delivery_boy_phone: phone });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err) {
      console.error('Delivery boy phone update failed:', err);
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    }
  };

  const resolveWaiterCall = async (id) => {
    await entities.Order.update(id, { status: 'completed' });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  // CHANGE 1: Filter out home delivery orders from confirmation/processing tabs
  const pendingOrders = orders.filter(o => o.type === 'order' && o.status === 'pending' && !o.is_home_delivery);
  const confirmedOrders = orders.filter(o => o.type === 'order' && o.status === 'confirmed' && !o.is_home_delivery);
  const readyOrders = orders.filter(o => o.type === 'order' && o.status === 'ready' && !o.is_home_delivery);
  const waiterCalls = orders.filter(o => o.type === 'waiter_call' && o.status === 'pending');
  const homeDeliveryOrders = orders.filter(o => o.is_home_delivery && o.type === 'order' && !['completed', 'cancelled'].includes(o.status));

  const filterOrders = (list) => {
    return list.filter(o => {
      if (search) {
        const hasDish = (o.items || []).some(item =>
          item.name?.toLowerCase().includes(search.toLowerCase())
        );
        if (!hasDish && !String(o.table_number || '').includes(search)) return false;
      }
      return true;
    });
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-semibold">AuraMenu Order Receiver</h1>
            <p className="text-sm text-muted-foreground mt-1">Staff login</p>
          </div>
          {restaurants.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                className="bg-secondary"
                autoComplete="off"
                data-1p-ignore
                data-lpignore="true"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="bg-secondary"
                autoComplete="new-password"
                data-1p-ignore
                data-lpignore="true"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
              <div onClick={handleLogin} className="w-full">
                <Button className="w-full bg-primary text-primary-foreground pointer-events-none">Login</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-3 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShoppingBag className="w-4 h-4 text-primary flex-shrink-0" />
            <h1 className="font-display text-sm sm:text-lg font-semibold truncate">AuraMenu Order Receiver</h1>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          </div>
          <button onClick={handleLogout} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0" aria-label="Logout" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="max-w-5xl mx-auto flex items-center gap-2 mt-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-10 bg-secondary h-9 text-sm" />
          </div>
          <button onClick={() => setSoundOn(!soundOn)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0" aria-label="Toggle sound">
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <Link to="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors flex-shrink-0" title="View Menu" aria-label="View Menu">
            <UtensilsCrossed className="w-4 h-4 text-primary" />
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
          <div className="rounded-lg bg-card border border-border py-2 px-2 text-center min-w-0">
            <p className="text-lg font-bold text-amber-500 leading-tight truncate">{pendingOrders.length}</p>
            <p className="text-[10px] text-muted-foreground leading-tight truncate">Pending</p>
          </div>
          <div className="rounded-lg bg-card border border-border py-2 px-2 text-center min-w-0">
            <p className="text-lg font-bold text-blue-500 leading-tight truncate">{confirmedOrders.length}</p>
            <p className="text-[10px] text-muted-foreground leading-tight truncate">Confirmed</p>
          </div>
          <div className="rounded-lg bg-card border border-border py-2 px-2 text-center min-w-0">
            <p className="text-lg font-bold text-green-500 leading-tight truncate">{readyOrders.length}</p>
            <p className="text-[10px] text-muted-foreground leading-tight truncate">Ready</p>
          </div>
          <div className="rounded-lg bg-card border border-border py-2 px-2 text-center min-w-0">
            <p className="text-lg font-bold text-amber-600 leading-tight truncate">{homeDeliveryOrders.length}</p>
            <p className="text-[10px] text-muted-foreground leading-tight truncate">Delivery</p>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-lg bg-card border border-border py-2 px-2 text-center min-w-0">
            <p className="text-lg font-bold text-red-500 leading-tight truncate">{waiterCalls.length}</p>
            <p className="text-[10px] text-muted-foreground leading-tight truncate">Calls</p>
          </div>
        </div>

        {/* Tab Bar */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-secondary mb-4 grid grid-cols-2 sm:flex sm:flex-row gap-1 p-1 h-auto">
            <TabsTrigger value="confirmation" className="gap-1 text-xs sm:text-sm py-2">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">Confirmation ({pendingOrders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="processing" className="gap-1 text-xs sm:text-sm py-2">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">Processing ({confirmedOrders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="delivery" className="gap-1 text-xs sm:text-sm py-2">
              <Truck className="w-3 h-3 flex-shrink-0" /> <span className="truncate">Home Delivery ({homeDeliveryOrders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="waiter" className="gap-1 text-xs sm:text-sm py-2">
              <Bell className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">Waiter Calls ({waiterCalls.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="confirmation">
            <div className="space-y-3">
              {filterOrders(pendingOrders).length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No pending orders \u2014 waiting...</p>
                </div>
              ) : (
                filterOrders(pendingOrders).map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdate={updateOrderStatus}
                    onSetPrepTime={handleSetPrepTime}
                    tabType="confirmation"
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="processing">
            <div className="space-y-3">
              {filterOrders(confirmedOrders).length === 0 && filterOrders(readyOrders).length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No orders being processed</p>
                </div>
              ) : (
                <>
                  {filterOrders(confirmedOrders).map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onUpdate={updateOrderStatus}
                      onSetPrepTime={handleSetPrepTime}
                      tabType="processing"
                    />
                  ))}
                  {filterOrders(readyOrders).map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onUpdate={updateOrderStatus}
                      onSetPrepTime={handleSetPrepTime}
                      tabType="processing"
                    />
                  ))}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="delivery">
            <div className="space-y-3">
              {homeDeliveryOrders.length === 0 ? (
                <div className="text-center py-16">
                  <Truck className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No home delivery orders</p>
                </div>
              ) : (
                homeDeliveryOrders.map(order => (
                  <DeliveryOrderCard
                    key={order.id}
                    order={order}
                    onUpdate={updateOrderStatus}
                    onSetDeliveryTime={handleSetDeliveryTime}
                    onSetDeliveryBoyPhone={handleSetDeliveryBoyPhone}
                    restaurant={restaurants[0]}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="waiter">
            <div className="space-y-2">
              {waiterCalls.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No active waiter calls</p>
                </div>
              ) : (
                waiterCalls.map(order => (
                  <WaiterCallCard key={order.id} order={order} onResolve={resolveWaiterCall} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
