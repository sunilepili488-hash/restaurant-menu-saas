import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenuStore } from '@/lib/menuStore';
import { Clock } from 'lucide-react';

const SLIDE_INTERVAL = 3500; // ms: banner kitni der rukega
const SLIDE_DURATION = 0.6;  // sec: slide animation ki speed

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

const BLUE_BG = 'linear-gradient(135deg, rgba(59,130,246,0.8) 0%, rgba(37,99,235,0.9) 100%)';
const GREEN_BG = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';

function useCountdown(estimatedReady) {
  const calc = () =>
    Math.max(0, Math.floor((new Date(estimatedReady).getTime() - Date.now()) / 1000));
  const [remaining, setRemaining] = useState(calc);

  useEffect(() => {
    const interval = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedReady]);

  return remaining;
}

function SingleTimerDisplay({ timer }) {
  const remaining = useCountdown(timer.estimatedReady);
  const waiting = !timer.timer_started_at && !timer.is_home_delivery;

  if (waiting) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full gap-1 text-white"
        style={{ background: BLUE_BG }}
      >
        <span className="text-xl font-bold">Order received ✓</span>
        <span className="text-sm opacity-80">Waiting for kitchen confirmation...</span>
      </div>
    );
  }

  const isDone = remaining <= 0;

  return (
    <div
      className="flex flex-col items-center justify-center p-3 text-center w-full h-full"
      style={{ background: isDone ? GREEN_BG : BLUE_BG }}
    >
      <Clock className={`w-5 h-5 mb-1 ${isDone ? 'animate-pulse' : ''}`} style={{ color: '#fff' }} />
      <h3 className="font-display text-3xl md:text-4xl font-bold leading-none" style={{ color: '#fff' }}>
        {isDone ? 'Order Ready!' : formatCountdown(remaining)}
      </h3>
      <p className="text-base md:text-lg mt-1.5 font-semibold" style={{ color: '#fff' }}>
        {timer.tableLabel || 'Estimated wait time'}
      </p>
      <p className="text-sm md:text-base mt-1 opacity-90 font-medium" style={{ color: '#fff' }}>
        {getTimerMessage(remaining)}
      </p>
    </div>
  );
}

function SplitTimerDisplay({ timer, side }) {
  const remaining = useCountdown(timer.estimatedReady);
  const waiting = !timer.timer_started_at && !timer.is_home_delivery;
  const radius = side === 'left' ? 'rounded-l-lg' : 'rounded-r-lg';

  if (waiting) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 text-center ${radius}`}
        style={{ background: BLUE_BG, width: '50%' }}
      >
        <p className="text-sm font-semibold" style={{ color: '#fff' }}>
          {timer.tableLabel || 'Table'}
        </p>
        <p className="text-base font-bold mt-1" style={{ color: '#fff' }}>Waiting...</p>
      </div>
    );
  }

  const isDone = remaining <= 0;

  return (
    <div
      className={`flex flex-col items-center justify-center p-3 text-center ${radius}`}
      style={{ background: isDone ? GREEN_BG : BLUE_BG, width: '50%' }}
    >
      <p className="text-sm font-semibold" style={{ color: '#fff' }}>
        {timer.tableLabel || 'Table'}
      </p>
      <h3 className="font-display text-2xl md:text-3xl font-bold leading-none mt-1" style={{ color: '#fff' }}>
        {isDone ? 'Ready!' : formatCountdown(remaining)}
      </h3>
      <p className="text-xs md:text-sm mt-1.5 opacity-90 font-medium" style={{ color: '#fff' }}>
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

  const shown = [...activeTimers]
    .sort(
      (a, b) =>
        new Date(b.placedAt || b.createdAt || 0) - new Date(a.placedAt || a.createdAt || 0)
    )
    .slice(0, 2);

  if (shown.length === 1) return <SingleTimerDisplay timer={shown[0]} />;

  return (
    <div className="flex w-full h-full">
      <SplitTimerDisplay timer={shown[0]} side="left" />
      <div className="w-px bg-white/20" />
      <SplitTimerDisplay timer={shown[1]} side="right" />
    </div>
  );
}

function BannerSlide({ item }) {
  if (item.type === 'timer') {
    return <TimerBanner activeTimers={item.data} />;
  }
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
      style={{
        background: item.data.image_url
          ? `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%), url(${item.data.image_url}) center/cover`
          : `linear-gradient(135deg, ${item.data.bg_color || 'hsl(38,45%,61%)'}, ${item.data.bg_color || 'hsl(38,45%,61%)'}88)`,
      }}
    >
      <h3
        className="font-display text-xl md:text-2xl font-bold"
        style={{ color: item.data.text_color || '#fff' }}
      >
        {item.data.title}
      </h3>
      {item.data.subtitle && (
        <p className="text-sm mt-1 opacity-90" style={{ color: item.data.text_color || '#fff' }}>
          {item.data.subtitle}
        </p>
      )}
    </div>
  );
}

export default function BannerCarousel({ banners = [], liveOrderData = {} }) {
  // pos hamesha badhta rehta hai (0,1,2,3...), isliye slide hamesha ek hi direction me jaati hai
  const [pos, setPos] = useState(0);
  const store = useMenuStore();
  const active = banners.filter(b => b.is_active !== false);

  const lockedOrders = store.lockedOrders || [];
  const activeTimers = lockedOrders
    .filter(lo => {
      const live = liveOrderData[lo.groupId];
      if (live?.status === 'completed' || live?.status === 'cancelled') return false;
      if (live?.status === 'ready') return false;
      if (live?.is_ready) return false;
      return true;
    })
    .map(lo => {
      const live = liveOrderData[lo.groupId];

      let estimatedReady;
      if (live?.timer_started_at && live?.prep_time_override) {
        estimatedReady = new Date(
          new Date(live.timer_started_at).getTime() + live.prep_time_override * 60 * 1000
        ).toISOString();
      } else if (lo.is_home_delivery && live?.delivery_time_minutes) {
        estimatedReady = new Date(
          new Date(lo.placedAt || lo.createdAt).getTime() + live.delivery_time_minutes * 60 * 1000
        ).toISOString();
      } else {
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

  // Order: Banner, Timer, Banner, Timer...
  const displayItems = useMemo(() => {
    const items = [];
    active.forEach((b, i) => {
      items.push({ type: 'banner', data: b, key: `banner-${i}` });
      if (activeTimers.length > 0) {
        items.push({ type: 'timer', data: activeTimers, key: `timer-${i}` });
      }
    });
    if (active.length === 0 && activeTimers.length > 0) {
      items.push({ type: 'timer', data: activeTimers, key: 'timer-0' });
    }
    return items;
  }, [active, activeTimers]);

  const count = displayItems.length;

  const next = useCallback(() => {
    if (count <= 1) return;
    setPos(p => p + 1);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const interval = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [next, count]);

  if (count === 0) return null;

  const currentIndex = pos % count;
  // Sirf pichla aur current slide render hota hai
  const visible = count > 1 ? [pos - 1, pos].filter(p => p >= 0) : [0];

  return (
    <div className="mx-2 mt-1 mb-1">
      <div
        className="relative h-32 md:h-40 rounded-lg overflow-hidden"
        style={{ pointerEvents: 'none' }}
      >
        {/* Ek hi track: dono slides saath move karti hain, isliye beech me gap nahi aata */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ x: `-${(count > 1 ? pos : 0) * 100}%` }}
          transition={{ duration: SLIDE_DURATION, ease: 'easeInOut' }}
          style={{ willChange: 'transform' }}
        >
          {visible.map(p => {
            const it = displayItems[p % count];
            return (
              <div
                key={p}
                className="absolute top-0 h-full w-full"
                style={{ left: `${p * 100}%` }}
              >
                <BannerSlide item={it} />
              </div>
            );
          })}
        </motion.div>

        {count > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {displayItems.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'bg-white w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
