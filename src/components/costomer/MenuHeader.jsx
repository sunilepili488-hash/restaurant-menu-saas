import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, User, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MenuHeader({ restaurant, onSearchOpen, onFilterOpen, onUserClick, onHistoryClick, hideUserIcon }) {
  const [showLogo, setShowLogo] = useState(true);
  const [isOwnerMode, setIsOwnerMode] = useState(false);

  useEffect(() => {
    // Check if owner mode is unlocked (icon_unlocked in localStorage)
    const unlocked = localStorage.getItem('icon_unlocked') === 'true';
    setIsOwnerMode(unlocked);
  }, []);

  // Listen for icon unlock changes
  useEffect(() => {
    const check = () => {
      const unlocked = localStorage.getItem('icon_unlocked') === 'true';
      setIsOwnerMode(unlocked);
    };
    // Check on storage events and periodically
    window.addEventListener('storage', check);
    const interval = setInterval(check, 2000);
    return () => {
      window.removeEventListener('storage', check);
      clearInterval(interval);
    };
  }, []);

  // Animated header toggle: cycles between logo and hours every 3s
  useEffect(() => {
    if (!restaurant?.animated_header) return;
    const interval = setInterval(() => {
      setShowLogo(prev => !prev);
    }, 2500);
    return () => clearInterval(interval);
  }, [restaurant?.animated_header]);

  const IconBtn = ({ children, onClick, label }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={label}
      className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary/80 hover:text-primary transition-colors"
    >
      {children}
    </motion.button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo + Name + Hours (animated or static) */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {restaurant?.animated_header ? (
            <div className="relative overflow-hidden flex-1 min-w-0 w-full" style={{ minHeight: '40px', height: '40px' }}>
              <AnimatePresence mode="popLayout">
                {showLogo ? (
                  <motion.div
                    key="logo"
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="absolute inset-0 flex items-center gap-3"
                  >
                    {restaurant?.logo_url && (
                      <img
                        src={restaurant.logo_url}
                        alt=""
                        className="h-9 w-auto object-contain rounded-lg flex-shrink-0"
                      />
                    )}
                    <span className="font-display text-lg md:text-xl font-bold text-foreground truncate whitespace-nowrap">
                      {restaurant?.name || 'Restaurant'}
                    </span>
                    <span className="ml-1 w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="hours"
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="absolute inset-0 flex items-center"
                  >
                    <span className="font-display text-base md:text-lg font-bold text-primary whitespace-nowrap truncate">
                      {restaurant?.operating_hours || 'Hours not set'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              {restaurant?.logo_url && (
                <img
                  src={restaurant.logo_url}
                  alt=""
                  className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-lg flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <h1 className="font-display text-lg md:text-xl font-semibold text-foreground truncate leading-tight">
                  {restaurant?.name || 'Restaurant'}
                  <span className="ml-1 inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse align-middle" />
                </h1>
                {restaurant?.operating_hours && (
                  <p className="text-[10px] md:text-xs text-muted-foreground leading-tight truncate">
                    {restaurant.operating_hours}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <IconBtn onClick={onSearchOpen} label="Search">
            <Search className="w-4 h-4" />
          </IconBtn>
          <IconBtn onClick={onFilterOpen} label="Filter">
            <SlidersHorizontal className="w-4 h-4" />
          </IconBtn>
          {!hideUserIcon && (
            isOwnerMode ? (
              <IconBtn onClick={onUserClick} label="Admin">
                <User className="w-4 h-4" />
              </IconBtn>
            ) : (
              <IconBtn onClick={onHistoryClick} label="Order History">
                <History className="w-4 h-4" />
              </IconBtn>
            )
          )}
        </div>
      </div>
    </header>
  );
}
