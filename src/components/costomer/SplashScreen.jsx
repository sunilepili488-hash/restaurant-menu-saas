import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function CoverContent({ restaurant }) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center">
      {restaurant?.logo_url ? (
        <img src={restaurant.logo_url} alt={restaurant.name} className="w-24 h-24 object-contain" />
      ) : null}
      <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary tracking-wide">
        {restaurant?.name || 'Welcome'}
      </h1>
      <div className="w-32 h-px gold-shimmer" />
      <p className="text-muted-foreground text-sm font-body tracking-widest uppercase mt-2">
        {restaurant?.welcome_message || 'A Culinary Experience Awaits'}
      </p>
    </div>
  );
}

function ClassicSplash({ restaurant }) {
  return (
    <>
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(38 45% 61%) 0%, transparent 70%)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0.15 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
      />
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
}

function BookSplash({ restaurant, opening }) {
  return (
    <div className="absolute inset-0" style={{ perspective: '1800px' }}>
      <motion.div
        className="absolute inset-y-0 left-1/2 w-10 -ml-5 bg-black/40 blur-md z-20"
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 bg-background border-r border-primary/20 overflow-hidden flex items-center justify-end"
        style={{ transformOrigin: 'left center' }}
        animate={{ rotateY: opening ? -110 : 0 }}
        transition={{ duration: 0.9, delay: opening ? 0.1 : 0, ease: [0.7, 0, 0.3, 1] }}
      >
        <div className="w-[200%] flex items-center justify-center">
          <CoverContent restaurant={restaurant} />
        </div>
      </motion.div>
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 bg-background border-l border-primary/20 overflow-hidden flex items-center justify-start"
        style={{ transformOrigin: 'right center' }}
        animate={{ rotateY: opening ? 110 : 0 }}
        transition={{ duration: 0.9, delay: opening ? 0.1 : 0, ease: [0.7, 0, 0.3, 1] }}
      >
        <div className="w-[200%] -ml-[100%] flex items-center justify-center">
          <CoverContent restaurant={restaurant} />
        </div>
      </motion.div>
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-20"
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 0.3 }}
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
    </div>
  );
}

export default function SplashScreen({ restaurant, onComplete }) {
  const [visible, setVisible] = useState(true);
  const [opening, setOpening] = useState(false);
  const useBookAnimation = restaurant?.splash_book_animation === true;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (useBookAnimation) {
        setOpening(true);
        setTimeout(() => setVisible(false), 1000);
      } else {
        setVisible(false);
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [useBookAnimation]);

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(onComplete, useBookAnimation ? 100 : 500);
      return () => clearTimeout(t);
    }
  }, [visible, onComplete, useBookAnimation]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
          exit={{ opacity: useBookAnimation ? 1 : 0 }}
          transition={{ duration: useBookAnimation ? 0 : 0.5 }}
        >
          {useBookAnimation
            ? <BookSplash restaurant={restaurant} opening={opening} />
            : <ClassicSplash restaurant={restaurant} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
