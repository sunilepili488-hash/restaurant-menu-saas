import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ restaurant, onComplete }) {
  const [phase, setPhase] = useState('show'); // 'show' | 'exit'
  const bookOpen = restaurant?.book_open_animation === true;

  useEffect(() => {
    const timer = setTimeout(() => setPhase('exit'), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'exit') {
      // Duration of exit animation before calling onComplete
      const exitDuration = bookOpen ? 900 : 500;
      const t = setTimeout(onComplete, exitDuration);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete, bookOpen]);

  const SplashContent = () => (
    <>
      {/* Background glow */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(38 45% 61%) 0%, transparent 70%)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0.15 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />

      {/* Gold line accents */}
      <motion.div
        className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
      />

      {/* Logo / Name */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {restaurant?.logo_url ? (
          <motion.img
            src={restaurant.logo_url}
            alt={restaurant.name}
            className="w-24 h-24 object-contain"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
        ) : null}

        <motion.h1
          className="font-display text-4xl md:text-5xl font-semibold text-primary tracking-wide text-center"
          initial={{ opacity: 0, letterSpacing: '0.3em' }}
          animate={{ opacity: 1, letterSpacing: '0.08em' }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {restaurant?.name || 'Welcome'}
        </motion.h1>

        {/* Shimmer line */}
        <motion.div
          className="w-32 h-px gold-shimmer"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 128 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />

        <motion.p
          className="text-muted-foreground text-sm font-body tracking-widest uppercase mt-2 text-center px-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          {restaurant?.welcome_message || 'A Culinary Experience Awaits'}
        </motion.p>
      </motion.div>

      {/* Bottom dots loading indicator */}
      <motion.div
        className="absolute bottom-16 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary/60"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </>
  );

  // ── BOOK OPEN ANIMATION ─────────────────────────────────────────────────────
  if (bookOpen) {
    return (
      <AnimatePresence>
        {phase === 'show' && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
            exit={{}}
          >
            <SplashContent />
          </motion.div>
        )}
        {phase === 'exit' && (
          // Two-panel "book cover opening" — left panel folds left, right panel folds right
          <div
            className="fixed inset-0 z-[100] overflow-hidden"
            style={{ perspective: '1200px' }}
          >
            {/* Left cover panel */}
            <motion.div
              className="absolute top-0 left-0 w-1/2 h-full bg-background origin-left"
              style={{ transformStyle: 'preserve-3d' }}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: -90 }}
              transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Shadow edge on the right side of the left panel */}
              <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-r from-transparent to-black/30" />
            </motion.div>

            {/* Right cover panel */}
            <motion.div
              className="absolute top-0 right-0 w-1/2 h-full bg-background origin-right"
              style={{ transformStyle: 'preserve-3d' }}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 90 }}
              transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Shadow edge on the left side of the right panel */}
              <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-l from-transparent to-black/30" />
            </motion.div>

            {/* Spine glow at center */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-primary/40"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.75 }}
            />
          </div>
        )}
      </AnimatePresence>
    );
  }

  // ── SIMPLE FADE EXIT (default) ──────────────────────────────────────────────
  return (
    <AnimatePresence>
      {phase === 'show' && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SplashContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
