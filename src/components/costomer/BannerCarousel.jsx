import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenuStore, menuStore } from '@/lib/menuStore';
import { Clock } from 'lucide-react';

function formatCountdown(seconds) {
  if (seconds <= 0) return 'Ready!';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getTimerMessage(remaining) {
  if (remaining <= 0) return 'Your order is ready! \ud83c\udf89';
  if (remaining <= 120) return 'Almost here, just a moment! \ud83c\udf7d\ufe0f';
  if (remaining <= 300) return 'Your order is on its way! \ud83d\ude80';
  return "We're preparing your delicious order \u2728";
}

function getSplitTimerMessage(remaining) {
  if (remaining <= 0) return 'Ready! \ud83c\udf89';
  if (remaining <= 120) return 'Almost here! \ud83c\udf7d\ufe0f';
  if (remaining <= 300) return 'On its way! \ud83d\ude80';
  return 'Preparing... \u2728';
}

function SingleTimerDisplay({ timer }) {
  // If no timer started yet (not home delivery), show waiting state
  if (!timer.timer_started_at && !timer.is_home_delivery) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1 text-white"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.8) 0%, rgba(37,99,235,0.9) 100%)' }}>
        <span className="text-sm font-semibold opacity-80">Order received ✓</span>
        <span className="text-xs opacity-60">Waiting for kitchen confirmation...</span>
      </div>
    );
  }

  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(timer.estimatedReady).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const secs = Math.max(0, Math.floor((new Date(timer.estimatedReady).getTime() - Date.now()) / 1000));
      setRemaining(secs);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer.estimatedReady]);

  const isDone = remaining <= 0;

  return (
    <div
      className="flex flex-col items-center justify-center p-4 text-center w-full h-full"
      style={{
        background: isDone
          ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
          : 'linear-gradient(135deg, rgba(59,130,246,0.8) 0%, rgba(37,99,235,0.9) 100%)',
      }}
    >
      <Clock className={`w-4 h-4 mb-0.5 ${isDone ? 'animate-pulse' : ''}`} style={{ color: '#fff' }} />
      <h3 className="font-display text-lg md:text-xl font-bold" style={{ color: '#fff' }}>
        {isDone ? 'Order Ready!' : formatCountdown(remaining)}
      </h3>
      <p className="text-xs mt-0.5 opacity-90" style={{ color: '#fff' }}>
        {timer.tableLabel || 'Estimated wait time'}
      </p>
      <p className="text-[10px] mt-1 opacity-70 font-medium" style={{ color: '#fff' }}>
        {getTimerMessage(remaining)}
      </p>
    </div>
  );
}

function SplitTimerDisplay({ timer, side }) {
  // If no timer started yet (not home delivery), show waiting state
  if (!timer.timer_started_at && !timer.is_home_delivery) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 text-center ${side === 'left' ? 'rounded-l-2xl' : 'rounded-r-2xl'}`}
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.8) 0%, rgba(37,99,235,0.9) 100%)',
          width: '50%',
        }}
      >
        <p className="text-[10px] opacity-80" style={{ color: '#fff' }}>
          {timer.tableLabel || `Table`}
        </p>
        <p className="text-xs font-semibold opacity-80" style={{ color: '#fff' }}>Waiting...</p>
      </div>
    );
  }

  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(timer.estimatedReady).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const secs = Math.max(0, Math.floor((new Date(timer.estimatedReady).getTime() - Date.now()) / 1000));
      setRemaining(secs);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer.estimatedReady]);

  const isDone = remaining <= 0;

  return (
    <div
      className={`flex flex-col items-center justify-center p-3 text-center ${side === 'left' ? 'rounded-l-2xl' : 'rounded-r-2xl'}`}
      style={{
        background: isDone
          ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
          : 'linear-gradient(135deg, rgba(59,130,246,0.8) 0%, rgba(37,99,235,0.9) 100%)',
        width: '50%',
      }}
    >
      <p className="text-[10px] opacity-80" style={{ color: '#fff' }}>
        {timer.tableLabel || `Table`}
      </p>
      <h3 className="font-display text-base md:text-lg font-bold" style={{ color: '#fff' }}>
        {isDone ? 'Ready!' : formatCountdown(remaining)}
      </h3>
      <p className="text-[9px] mt-0.5 opacity-70 font-medium" style={{ color: '#fff' }}>
        {getSplitTimerMessage(remaining)}
      </p>
    </div>
  );
}

function TimerBanner({ activeTimers }) {
  if (activeTimers.length === 0) return null;

  if (activeTimers.length === 1) {
    return <SingleTimerDisplay timer={activeTimers[0]} />;
  }

  const shown = [...activeTimers].sort((a, b) =>
    new Date(b.placedAt || b.createdAt || 0) - new Date(a.placedAt || a.createdAt || 0)
  ).slice(0, 2);

  if (shown.length === 1) return <SingleTimerDisplay timer={shown[0]} />;

  return (
    <div className="flex w-full h-full">
      <SplitTimerDisplay timer={shown[0]} side="left" />
      <div className="w-px bg-white/20" />
      <SplitTimerDisplay timer={shown[1]} side="right" />
    </div>
  );
}

export default function BannerCarousel({ banners = [], liveOrderData = {} }) {
  const [current, setCurrent] = useState(0);
  const store = useMenuStore();
  const active = banners.filter(b => b.is_active !== false);

  const lockedOrders = store.lockedOrders || [];
  const activeTimers = lockedOrders
    .filter(lo => {
      // Only show timer if order is still active (not completed/cancelled/ready)
      const live = liveOrderData[lo.groupId];
      if (live?.status === 'completed' || live?.status === 'cancelled') return false;
      // Change 6: Hide timer when order is marked ready
      if (live?.status === 'ready') return false;
      if (live?.is_ready) return false;
      return true;
    })
    .map(lo => {
      const live = liveOrderData[lo.groupId];

      let estimatedReady;
      if (live?.timer_started_at && live?.prep_time_override) {
        // Waiter has confirmed and set a real timer — use Supabase data
        estimatedReady = new Date(
          new Date(live.timer_started_at).getTime() + live.prep_time_override * 60 * 1000
        ).toISOString();
      } else if (lo.is_home_delivery && live?.delivery_time_minutes) {
        // Home delivery — use delivery time from Supabase
        estimatedReady = new Date(
          new Date(lo.placedAt || lo.createdAt).getTime() + live.delivery_time_minutes * 60 * 1000
        ).toISOString();
      } else {
        // Fallback: use client-side estimate until waiter confirms
        estimatedReady = lo.estimatedReady;
      }

      return {
        ...lo,
        estimatedReady,
        timer_started_at: live?.timer_started_at || lo.timer_started_at,
        tableLabel: lo.is_home_delivery ? '🚚 Delivery' : `Table ${lo.tableNumber || ''}`,
      };
    })
    .filter(lo => lo.estimatedReady && new Date(lo.estimatedReady) > new Date());

  const displayItems = useMemo(() => {
    const items = active.map((b, i) => ({ type: 'banner', data: b, key: `banner-${i}` }));

    // Only ONE timer banner slot in the carousel
    if (activeTimers.length > 0) {
      items.push({ type: 'timer', data: activeTimers, key: 'timer-slot' });
    }

    return items;
  }, [active, activeTimers]);

  const next = useCallback(() => {
    if (displayItems.length <= 1) return;
    setCurrent(prev => (prev + 1) % displayItems.length);
  }, [displayItems.length]);

  useEffect(() => {
    if (displayItems.length <= 1) return;
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [next, displayItems.length]);

  useEffect(() => {
    if (current >= displayItems.length) setCurrent(0);
  }, [displayItems.length, current]);

  if (displayItems.length === 0) return null;

  const item = displayItems[current];

  return (
    <div className="mx-4 mt-4 mb-2">
      <div className="relative h-32 md:h-40 rounded-2xl overflow-hidden" style={{ pointerEvents: 'none' }}>
        <AnimatePresence mode="wait">
          {item.type === 'timer' ? (
            <motion.div
              key={item.key}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ willChange: 'transform' }}
            >
              <TimerBanner activeTimers={item.data} />
            </motion.div>
          ) : (
            <motion.div
              key={item.key}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
              style={{
                background: item.data.image_url
                  ? `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%), url(${item.data.image_url}) center/cover`
                  : `linear-gradient(135deg, ${item.data.bg_color || 'hsl(38,45%,61%)'}, ${item.data.bg_color || 'hsl(38,45%,61%)'}88)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h3
                className="font-display text-xl md:text-2xl font-bold"
                style={{ color: item.data.text_color || '#fff' }}
              >
                {item.data.title}
              </h3>
              {item.data.subtitle && (
                <p
                  className="text-sm mt-1 opacity-90"
                  style={{ color: item.data.text_color || '#fff' }}
                >
                  {item.data.subtitle}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {displayItems.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {displayItems.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'bg-white w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
