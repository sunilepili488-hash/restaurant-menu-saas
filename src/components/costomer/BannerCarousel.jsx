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

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Keep your existing import path for these:
import { useMenuStore } from '@/store/useMenuStore';
import TimerBanner from './TimerBanner';

/* =========================================================
   ANIMATION CONFIG
   ========================================================= */

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.96,
    rotateY: direction > 0 ? 2 : -2,
  }),

  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      x: {
        type: 'spring',
        stiffness: 280,
        damping: 30,
        mass: 0.8,
      },
      opacity: {
        duration: 0.3,
        ease: 'easeOut',
      },
      scale: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
      rotateY: {
        duration: 0.55,
        ease: 'easeOut',
      },
    },
  },

  exit: (direction) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 0.96,
    rotateY: direction > 0 ? -2 : 2,
    transition: {
      x: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
      opacity: {
        duration: 0.3,
        ease: 'easeIn',
      },
      scale: {
        duration: 0.45,
        ease: 'easeInOut',
      },
      rotateY: {
        duration: 0.45,
        ease: 'easeInOut',
      },
    },
  }),
};

/* =========================================================
   BANNER CONTENT ANIMATIONS
   ========================================================= */

const contentContainerVariants = {
  hidden: {
    opacity: 0,
    y: 14,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delayChildren: 0.18,
      staggerChildren: 0.08,
    },
  },
};

const titleVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const subtitleVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },

  visible: {
    opacity: 0.9,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function BannerCarousel({
  banners = [],
  liveOrderData = {},
}) {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  const store = useMenuStore();

  /* -------------------------------------------------------
     ACTIVE BANNERS
     ------------------------------------------------------- */

  const active = useMemo(() => {
    return Array.isArray(banners)
      ? banners.filter((b) => b?.is_active !== false)
      : [];
  }, [banners]);

  /* -------------------------------------------------------
     ACTIVE ORDER TIMERS
     ------------------------------------------------------- */

  const lockedOrders = store?.lockedOrders || [];

  const activeTimers = useMemo(() => {
    return lockedOrders
      .filter((lo) => {
        const live = liveOrderData?.[lo.groupId];

        // Completed / cancelled orders
        if (
          live?.status === 'completed' ||
          live?.status === 'cancelled'
        ) {
          return false;
        }

        // Ready orders
        if (live?.status === 'ready') {
          return false;
        }

        if (live?.is_ready) {
          return false;
        }

        return true;
      })
      .map((lo) => {
        const live = liveOrderData?.[lo.groupId];

        let estimatedReady;

        /*
         * TIMER PRIORITY
         *
         * 1. Live prep timer
         * 2. Home delivery timer
         * 3. Original estimatedReady
         */

        if (
          live?.timer_started_at &&
          live?.prep_time_override
        ) {
          estimatedReady = new Date(
            new Date(live.timer_started_at).getTime() +
              live.prep_time_override * 60 * 1000
          ).toISOString();
        } else if (
          lo.is_home_delivery &&
          live?.delivery_time_minutes
        ) {
          estimatedReady = new Date(
            new Date(
              lo.placedAt || lo.createdAt
            ).getTime() +
              live.delivery_time_minutes * 60 * 1000
          ).toISOString();
        } else {
          estimatedReady = lo.estimatedReady;
        }

        return {
          ...lo,
          estimatedReady,

          timer_started_at:
            live?.timer_started_at ||
            lo.timer_started_at,

          tableLabel: lo.is_home_delivery
            ? '🚚 Delivery'
            : `Table ${lo.tableNumber || ''}`,
        };
      })
      .filter((lo) => {
        if (!lo?.estimatedReady) return false;

        const readyTime = new Date(
          lo.estimatedReady
        ).getTime();

        return (
          Number.isFinite(readyTime) &&
          readyTime > Date.now()
        );
      });
  }, [lockedOrders, liveOrderData]);

  /* -------------------------------------------------------
     DISPLAY ITEMS
     
     IMPORTANT:
     Banner → Timer → Banner → Timer
     ------------------------------------------------------- */

  const displayItems = useMemo(() => {
    const items = [];

    active.forEach((banner, index) => {
      // Banner
      items.push({
        type: 'banner',
        data: banner,
        key: `banner-${banner?.id || index}`,
      });

      // Timer after every banner
      if (activeTimers.length > 0) {
        items.push({
          type: 'timer',
          data: activeTimers,
          key: `timer-${banner?.id || index}`,
        });
      }
    });

    /*
     * If there are no banners but timers exist,
     * show timer independently.
     */
    if (
      active.length === 0 &&
      activeTimers.length > 0
    ) {
      items.push({
        type: 'timer',
        data: activeTimers,
        key: 'timer-only',
      });
    }

    return items;
  }, [active, activeTimers]);

  /* -------------------------------------------------------
     NEXT SLIDE
     ------------------------------------------------------- */

  const next = useCallback(() => {
    if (displayItems.length <= 1) return;

    setDir(1);

    setCurrent((prev) => {
      return (prev + 1) % displayItems.length;
    });
  }, [displayItems.length]);

  /* -------------------------------------------------------
     AUTOPLAY
     
     Banner → Timer → Banner → Timer
     Every 3 seconds
     ------------------------------------------------------- */

  useEffect(() => {
    if (displayItems.length <= 1) return;

    const interval = window.setInterval(() => {
      next();
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [next, displayItems.length]);

  /* -------------------------------------------------------
     KEEP INDEX SAFE
     ------------------------------------------------------- */

  useEffect(() => {
    if (displayItems.length === 0) {
      setCurrent(0);
      return;
    }

    if (current >= displayItems.length) {
      setCurrent(0);
    }
  }, [displayItems.length, current]);

  /* -------------------------------------------------------
     NOTHING TO SHOW
     ------------------------------------------------------- */

  if (displayItems.length === 0) {
    return null;
  }

  const item =
    displayItems[current] || displayItems[0];

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="mx-2 mt-1 mb-1">
      <div
        className="
          relative
          h-32
          md:h-40
          rounded-2xl
          overflow-hidden
          isolate
          bg-black/5
        "
        style={{
          perspective: '1000px',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence
          initial={false}
          custom={dir}
          mode="popLayout"
        >
          {/* =================================================
              TIMER SLIDE
             ================================================= */}

          {item.type === 'timer' ? (
            <motion.div
              key={item.key}
              className="absolute inset-0"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Subtle timer glow layer */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{
                  opacity: 0,
                  scale: 1.08,
                }}
                animate={{
                  opacity: 0.12,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 1.04,
                }}
                transition={{
                  duration: 0.7,
                  ease: 'easeOut',
                }}
              />

              <TimerBanner
                activeTimers={item.data}
              />
            </motion.div>
          ) : (
            /* =================================================
               NORMAL BANNER
               ================================================= */

            <motion.div
              key={item.key}
              className="
                absolute
                inset-0
                flex
                flex-col
                items-center
                justify-center
                p-6
                text-center
                overflow-hidden
              "
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                background: item.data?.image_url
                  ? `
                    linear-gradient(
                      135deg,
                      rgba(0,0,0,0.48) 0%,
                      rgba(0,0,0,0.20) 55%,
                      rgba(0,0,0,0.42) 100%
                    ),
                    url(${item.data.image_url})
                    center/cover
                  `
                  : `
                    linear-gradient(
                      135deg,
                      ${item.data?.bg_color ||
                        'hsl(38,45%,61%)'},
                      ${item.data?.bg_color ||
                        'hsl(38,45%,61%)'}88
                    )
                  `,
              }}
            >
              {/* =============================================
                  BACKGROUND IMAGE ZOOM
                 ============================================= */}

              {item.data?.image_url && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{
                    scale: 1.12,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  exit={{
                    scale: 1.08,
                  }}
                  transition={{
                    duration: 3,
                    ease: 'easeOut',
                  }}
                  style={{
                    backgroundImage: `url(${item.data.image_url})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    zIndex: -2,
                  }}
                />
              )}

              {/* =============================================
                  DARK OVERLAY
                 ============================================= */}

              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.45,
                }}
                style={{
                  background:
                    'linear-gradient(135deg, rgba(0,0,0,0.42), rgba(0,0,0,0.16), rgba(0,0,0,0.38))',
                }}
              />

              {/* =============================================
                  CONTENT
                 ============================================= */}

              <motion.div
                className="
                  relative
                  z-10
                  flex
                  flex-col
                  items-center
                  justify-center
                  max-w-full
                "
                variants={contentContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* TITLE */}

                {item.data?.title && (
                  <motion.h3
                    className="
                      font-display
                      text-xl
                      md:text-2xl
                      font-bold
                      leading-tight
                      drop-shadow-lg
                    "
                    variants={titleVariants}
                    style={{
                      color:
                        item.data?.text_color ||
                        '#fff',
                    }}
                  >
                    {item.data.title}
                  </motion.h3>
                )}

                {/* SUBTITLE */}

                {item.data?.subtitle && (
                  <motion.p
                    className="
                      text-sm
                      md:text-base
                      mt-1
                      max-w-[90%]
                      leading-snug
                      drop-shadow-md
                    "
                    variants={subtitleVariants}
                    style={{
                      color:
                        item.data?.text_color ||
                        '#fff',
                    }}
                  >
                    {item.data.subtitle}
                  </motion.p>
                )}
              </motion.div>

              {/* =============================================
                  SUBTLE SHINE EFFECT
                 ============================================= */}

              <motion.div
                className="
                  absolute
                  inset-y-0
                  -left-[40%]
                  w-[25%]
                  pointer-events-none
                  skew-x-[-20deg]
                "
                initial={{
                  x: '-100%',
                  opacity: 0,
                }}
                animate={{
                  x: '500%',
                  opacity: [0, 0.18, 0],
                }}
                transition={{
                  duration: 2.2,
                  delay: 0.45,
                  ease: 'easeInOut',
                }}
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            PAGINATION DOTS
           ================================================= */}

        {displayItems.length > 1 && (
          <div
            className="
              absolute
              bottom-2.5
              left-1/2
              -translate-x-1/2
              z-30
              flex
              items-center
              gap-1.5
            "
          >
            {displayItems.map((displayItem, index) => {
              const isActive = index === current;

              return (
                <motion.div
                  key={displayItem.key}
                  className="h-1.5 rounded-full bg-white"
                  initial={false}
                  animate={{
                    width: isActive ? 18 : 6,
                    opacity: isActive ? 1 : 0.38,
                    scaleY: isActive ? 1.1 : 1,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              );
            })}
          </div>
        )}

        {/* =================================================
            EDGE SHADOW / PREMIUM DEPTH
           ================================================= */}

        <div
          className="
            absolute
            inset-0
            rounded-2xl
            pointer-events-none
            ring-1
            ring-black/5
          "
        />
      </div>
    </div>
  );
}
