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

const slideVariants = {
  enter: (d) => ({ x: d > 0 ? '-100%' : '100%' }),
  center: { x: 0 },
  exit: (d) => ({ x: d > 0 ? '100%' : '-100%' }),
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function BannerCarousel({ banners = [], liveOrderData = {} }) {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  const store = useMenuStore();

  const active = banners.filter(b => b.is_active !== false);

  const lockedOrders = store.lockedOrders || [];

  const activeTimers = lockedOrders
    .filter(lo => {
      const live = liveOrderData[lo.groupId];

      if (live?.status === 'completed' || live?.status === 'cancelled') {
        return false;
      }

      if (live?.status === 'ready') return false;
      if (live?.is_ready) return false;

      return true;
    })
    .map(lo => {
      const live = liveOrderData[lo.groupId];

      let estimatedReady;

      if (live?.timer_started_at && live?.prep_time_override) {
        estimatedReady = new Date(
          new Date(live.timer_started_at).getTime() +
            live.prep_time_override * 60 * 1000
        ).toISOString();
      } else if (lo.is_home_delivery && live?.delivery_time_minutes) {
        estimatedReady = new Date(
          new Date(lo.placedAt || lo.createdAt).getTime() +
            live.delivery_time_minutes * 60 * 1000
        ).toISOString();
      } else {
        estimatedReady = lo.estimatedReady;
      }

      return {
        ...lo,
        estimatedReady,
        timer_started_at: live?.timer_started_at || lo.timer_started_at,
        tableLabel: lo.is_home_delivery
          ? '🚚 Delivery'
          : `Table ${lo.tableNumber || ''}`,
      };
    })
    .filter(
      lo =>
        lo.estimatedReady &&
        new Date(lo.estimatedReady) > new Date()
    );

  // --------------------------------------------------
  // BANNER + TIMER SEQUENCE
  // Banner → Timer → Banner → Timer...
  // --------------------------------------------------

  const displayItems = useMemo(() => {
    const items = [];

    active.forEach((b, i) => {
      items.push({
        type: 'banner',
        data: b,
        key: `banner-${i}`,
      });

      if (activeTimers.length > 0) {
        items.push({
          type: 'timer',
          data: activeTimers,
          key: `timer-${i}`,
        });
      }
    });

    if (active.length === 0 && activeTimers.length > 0) {
      items.push({
        type: 'timer',
        data: activeTimers,
        key: 'timer-0',
      });
    }

    return items;
  }, [active, activeTimers]);

  // --------------------------------------------------
  // NEXT SLIDE
  // Direction alternates:
  // 1  = left -> right
  // -1 = right -> left
  // --------------------------------------------------

  const next = useCallback(() => {
    if (displayItems.length <= 1) return;

    setDir(prev => -prev);

    setCurrent(prev => (prev + 1) % displayItems.length);
  }, [displayItems.length]);

  // --------------------------------------------------
  // AUTO PLAY
  // --------------------------------------------------

  useEffect(() => {
    if (displayItems.length <= 1) return;

    const interval = setInterval(() => {
      next();
    }, 3000);

    return () => clearInterval(interval);
  }, [next, displayItems.length]);

  // --------------------------------------------------
  // KEEP CURRENT INDEX VALID
  // --------------------------------------------------

  useEffect(() => {
    if (current >= displayItems.length) {
      setCurrent(0);
    }
  }, [displayItems.length, current]);

  if (displayItems.length === 0) return null;

  const item = displayItems[current] || displayItems[0];

  // --------------------------------------------------
  // PROFESSIONAL SLIDE ANIMATION
  // --------------------------------------------------

  const slideVariants = {
    enter: direction => ({
      x: direction > 0 ? '-100%' : '100%',
      scale: 1.035,
      opacity: 0.92,
      filter: 'brightness(0.82)',
    }),

    center: {
      x: '0%',
      scale: 1,
      opacity: 1,
      filter: 'brightness(1)',
    },

    exit: direction => ({
      x: direction > 0 ? '100%' : '-100%',
      scale: 0.985,
      opacity: 0.94,
      filter: 'brightness(0.72)',
    }),
  };

  const slideTransition = {
    x: {
      type: 'tween',
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },

    scale: {
      type: 'tween',
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },

    opacity: {
      duration: 0.45,
      ease: 'easeOut',
    },

    filter: {
      duration: 0.6,
      ease: 'easeOut',
    },
  };

  // --------------------------------------------------
  // RENDER BANNER
  // --------------------------------------------------

  const renderItem = item => {
    if (item.type === 'timer') {
      return (
        <div className="absolute inset-0 w-full h-full">
          <TimerBanner activeTimers={item.data} />
        </div>
      );
    }

    return (
      <div
        className="
          absolute inset-0
          w-full
          h-full
          flex
          flex-col
          items-center
          justify-center
          p-6
          text-center
        "
        style={{
          background: item.data.image_url
            ? `
              linear-gradient(
                135deg,
                rgba(0,0,0,0.42) 0%,
                rgba(0,0,0,0.18) 55%,
                rgba(0,0,0,0.35) 100%
              ),
              url(${item.data.image_url}) center/cover no-repeat
            `
            : `
              linear-gradient(
                135deg,
                ${item.data.bg_color || 'hsl(38,45%,61%)'},
                ${item.data.bg_color || 'hsl(38,45%,61%)'}88
              )
            `,
        }}
      >
        {/* Soft cinematic light */}
        <motion.div
          className="
            absolute
            inset-0
            pointer-events-none
          "
          initial={{
            x: '-120%',
            opacity: 0,
          }}
          animate={{
            x: '120%',
            opacity: [0, 0.12, 0],
          }}
          transition={{
            duration: 1.1,
            ease: 'easeInOut',
          }}
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
            transform: 'skewX(-18deg)',
          }}
        />

        {/* Content */}
        <motion.div
          className="relative z-10"
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.12,
            ease: 'easeOut',
          }}
        >
          <h3
            className="font-display text-xl md:text-2xl font-bold"
            style={{
              color: item.data.text_color || '#fff',
              textShadow: '0 2px 12px rgba(0,0,0,0.22)',
            }}
          >
            {item.data.title}
          </h3>

          {item.data.subtitle && (
            <p
              className="text-sm mt-1 opacity-90"
              style={{
                color: item.data.text_color || '#fff',
                textShadow: '0 1px 8px rgba(0,0,0,0.18)',
              }}
            >
              {item.data.subtitle}
            </p>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="mx-2 mt-1 mb-1">
      {/* 
        IMPORTANT:
        overflow-hidden + relative viewport means
        incoming/outgoing slides stay inside the banner.
        Both slides occupy 100% width, so there is NO GAP.
      */}

      <div
        className="
          relative
          h-32
          md:h-40
          rounded-[0.75rem]
          overflow-hidden
          isolate
          bg-black
        "
        style={{
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence
          initial={false}
          custom={dir}
          mode="sync"
        >
          <motion.div
            key={item.key}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="
              absolute
              inset-0
              w-full
              h-full
              will-change-transform
            "
          >
            {renderItem(item)}
          </motion.div>
        </AnimatePresence>

        {/* --------------------------------------------------
            SUBTLE EDGE LIGHT DURING SLIDE
        -------------------------------------------------- */}

        <motion.div
          key={`light-${current}`}
          className="
            absolute
            inset-y-0
            w-24
            pointer-events-none
            z-20
          "
          initial={{
            x: dir > 0 ? '-120%' : '120%',
            opacity: 0,
          }}
          animate={{
            x: dir > 0 ? '520%' : '-520%',
            opacity: [0, 0.22, 0],
          }}
          transition={{
            duration: 0.7,
            ease: 'easeInOut',
          }}
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',
            filter: 'blur(8px)',
          }}
        />

        {/* --------------------------------------------------
            BOTTOM INDICATORS
        -------------------------------------------------- */}

        {displayItems.length > 1 && (
          <div
            className="
              absolute
              bottom-2.5
              left-1/2
              -translate-x-1/2
              flex
              items-center
              gap-1.5
              z-30
            "
          >
            {displayItems.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === current ? 18 : 6,
                  opacity: i === current ? 1 : 0.4,
                }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                }}
                className="
                  h-1.5
                  rounded-full
                  bg-white
                "
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
