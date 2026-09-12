import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Mobile check ──
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

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

// ── MOBILE VIDEO SPLASH ──
function VideoSplash({ onFinish, restaurant }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.addEventListener('ended', onFinish);
    return () => video.removeEventListener('ended', onFinish);
  }, [onFinish]);

  return (
    <div className="w-full h-full bg-black relative">

      {/* VIDEO */}
      <video
        ref={videoRef}
        src="/intro.mp4"
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/30" />

      {/* TOP LEFT */}
      <motion.div
        className="absolute top-6 left-5 text-white/60 text-[10px] tracking-widest leading-5 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Good Food<br />Brighter<br />Moments
      </motion.div>

      {/* TOP RIGHT */}
      <motion.div
        className="absolute top-6 right-5 text-white/60 text-[10px] tracking-widest leading-5 uppercase text-right"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Same<br />Table<br />New Stories
      </motion.div>

      {/* CENTRE — Restaurant Name + Tagline */}
      <motion.div
        className="absolute inset-x-0 top-[28%] flex flex-col items-center gap-2 px-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        {/* Leaf icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-400 mb-1">
          <path d="M12 2C12 2 6 8 6 13a6 6 0 0012 0c0-5-6-11-6-11z" fill="currentColor" opacity="0.8" />
          <path d="M12 13v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        {/* Welcome to */}
        <p className="text-white/80 text-sm italic" style={{ fontFamily: 'Georgia, serif' }}>
          Welcome to
        </p>

        {/* Restaurant Name */}
        <h1
          className="text-white text-3xl font-bold tracking-[0.15em] uppercase"
          style={{ fontFamily: 'Georgia, serif', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
        >
          {restaurant?.name || 'Aura Bistro'}
        </h1>

        {/* Gold line */}
        <div className="w-24 h-px bg-amber-400/70 my-1" />

        {/* Tagline */}
        <p className="text-white/60 text-[10px] tracking-[0.2em] uppercase">
          Good Food · Great Company · Brighter Days
        </p>
      </motion.div>

      {/* CENTRE BOTTOM — Welcome message */}
      <motion.div
        className="absolute inset-x-0 top-[52%] flex flex-col items-center gap-1 px-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        <p
          className="text-white/75 text-xl italic leading-tight"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {restaurant?.welcome_message || 'Food Brings\nPeople Closer'}
        </p>
        <span className="text-amber-400/80 text-base mt-1">♡</span>
      </motion.div>

      {/* BOTTOM — Browse Choose Enjoy */}
      <motion.div
        className="absolute bottom-14 inset-x-0 flex items-start justify-center gap-6 px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.6 }}
      >
        {/* Browse */}
        <div className="flex flex-col items-center gap-1">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" className="text-amber-400">
            <rect x="3" y="3" width="13" height="17" rx="1" />
            <path d="M14 8h4M14 12h4M14 16h4" />
            <circle cx="7.5" cy="9" r="1" />
            <circle cx="7.5" cy="13" r="1" />
          </svg>
          <p className="text-white text-[10px] font-bold tracking-widest uppercase">Browse</p>
          <p className="text-white/50 text-[8px] tracking-wider uppercase">Explore Our Menu</p>
        </div>

        <div className="w-px h-10 bg-white/20 mt-2" />

        {/* Choose */}
        <div className="flex flex-col items-center gap-1">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" className="text-amber-400">
            <path d="M12 3a7 7 0 010 14" />
            <path d="M5 10h14" />
            <ellipse cx="12" cy="17" rx="7" ry="2" />
            <path d="M12 17v4" />
          </svg>
          <p className="text-white text-[10px] font-bold tracking-widest uppercase">Choose</p>
          <p className="text-white/50 text-[8px] tracking-wider uppercase">Pick Favourites</p>
        </div>

        <div className="w-px h-10 bg-white/20 mt-2" />

        {/* Enjoy */}
        <div className="flex flex-col items-center gap-1">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" className="text-amber-400">
            <path d="M6 2v6M18 2v6M6 8c0 3.314 2.686 6 6 6s6-2.686 6-6" />
            <path d="M12 14v8M8 22h8" />
          </svg>
          <p className="text-white text-[10px] font-bold tracking-widest uppercase">Enjoy</p>
          <p className="text-white/50 text-[8px] tracking-wider uppercase">Great Food Awaits</p>
        </div>
      </motion.div>

      {/* VERY BOTTOM TAGLINE */}
      <motion.p
        className="absolute bottom-5 inset-x-0 text-center text-amber-400/60 text-[9px] tracking-[0.3em] uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Good Food · Brighter You
      </motion.p>

      {/* Skip button */}
      <motion.button
        onClick={onFinish}
        className="absolute top-6 right-16 text-white/60 text-xs border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Skip ›
      </motion.button>

    </div>
  );
}

export default function SplashScreen({ restaurant, onComplete }) {
  const [visible, setVisible] = useState(true);
  const [opening, setOpening] = useState(false);
  const isMobile = useIsMobile();
  const useBookAnimation = restaurant?.splash_book_animation === true;

  const handleFinish = () => {
    setVisible(false);
    setTimeout(onComplete, 500);
  };

  // Desktop/Tablet timing
  useEffect(() => {
    if (isMobile) return;
    const timer = setTimeout(() => {
      if (useBookAnimation) {
        setOpening(true);
        setTimeout(() => setVisible(false), 1000);
      } else {
        setVisible(false);
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [isMobile, useBookAnimation]);

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
          exit={{ opacity: useBookAnimation && !isMobile ? 1 : 0 }}
          transition={{ duration: useBookAnimation && !isMobile ? 0 : 0.5 }}
        >
          {/* MOBILE → VIDEO */}
          {isMobile && <VideoSplash onFinish={handleFinish} restaurant={restaurant} />}

          {/* DESKTOP/TABLET → Book ya Classic */}
          {!isMobile && (
            useBookAnimation
              ? <BookSplash restaurant={restaurant} opening={opening} />
              : <ClassicSplash restaurant={restaurant} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
