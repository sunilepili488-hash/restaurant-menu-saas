import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ThumbsUp, ShoppingBag, Leaf, Drumstick, Heart, ChevronDown, MessageCircle, X } from 'lucide-react';
import { menuStore, useMenuStore } from '@/lib/menuStore';
import { entities } from '@/api/entities';
import { formatCount, getOrderedToday } from '@/lib/formatUtils';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LazyImage from './LazyImage';

function DishCardGrid({ dish, restaurant, onReviewOpen, eager }) {
  const store = useMenuStore();
  const [expanded, setExpanded] = useState(false);
  // Optimistic local override for like count — used only briefly after the
  // user taps Like, so the UI updates instantly without waiting for the
  // next 7s poll. Once the next poll brings a dish.like_count >= our
  // optimistic value, we drop the override and trust the live prop again.
  const [optimisticLike, setOptimisticLike] = useState(null);
  const likeCount = optimisticLike !== null && optimisticLike > (dish.like_count || 0)
    ? optimisticLike
    : (dish.like_count || 0);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(dish.sale_price || dish.regular_price || 0);
  const orderedToday = getOrderedToday(dish);
  const isFav = store.favorites.includes(dish.id);
  const isLiked = store.likedDishes[dish.id] || false;
  const icons = restaurant?.icon_settings || {};

  const hasDiscount = dish.sale_price && dish.sale_price < dish.regular_price;
  const discountPct = hasDiscount
    ? Math.round(((dish.regular_price - dish.sale_price) / dish.regular_price) * 100)
    : 0;
  const curr = restaurant?.currency_symbol || '₹';

  const prepTimeStr = dish.prep_time_value
    ? `${dish.prep_time_value} ${dish.prep_time_unit || 'min'}`
    : null;

  const isHidden = (key) => icons[key]?.hidden === true;

  const handleLike = async (e) => {
    e.stopPropagation();
    const nowLiked = menuStore.toggleLike(dish.id);
    const baseCount = dish.like_count || 0;
    const newCount = nowLiked ? baseCount + 1 : Math.max(0, baseCount - 1);
    setOptimisticLike(newCount);
    entities.Dish.update(dish.id, { like_count: newCount });
  };

  return (
    <div className="glass rounded-2xl overflow-hidden group" layout={false}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <LazyImage
          src={dish.image_url}
          alt={dish.name}
          fallbackText="No Image"
          eager={eager}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {hasDiscount && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discountPct}% OFF
            </span>
          )}
          <span className={`w-5 h-5 rounded-full flex items-center justify-center ${dish.is_veg ? 'bg-green-600' : 'bg-red-600'}`}>
            {dish.is_veg ? <Leaf className="w-3 h-3 text-white" /> : <Drumstick className="w-3 h-3 text-white" />}
          </span>
        </div>

        {/* Heart icon (Favorite) — top right corner overlay */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); menuStore.toggleFavorite(dish.id); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full glass flex items-center justify-center"
          title="Favorite"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFav ? 'text-rose-500 fill-rose-500' : 'text-white/80'}`} />
        </motion.button>

        {prepTimeStr && (
          <span className="absolute bottom-2 left-2 glass text-[10px] text-foreground/80 px-2 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> {prepTimeStr}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-display text-base font-semibold text-foreground leading-tight line-clamp-1">
          {dish.name}
        </h3>
        {dish.short_description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{dish.short_description}</p>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span className="text-primary font-bold text-sm">
            {curr}{(dish.sale_price || dish.regular_price).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-muted-foreground text-xs line-through">
              {curr}{dish.regular_price.toLocaleString()}
            </span>
          )}
        </div>

        {!isHidden('like') && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className="flex items-center gap-1.5"
            >
              <ThumbsUp className={`w-4 h-4 transition-colors ${isLiked ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground">{formatCount(likeCount)}</span>
            </motion.button>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground/70" />
              <span className="text-xs text-muted-foreground">{formatCount(orderedToday)}</span>
            </div>
          </div>
        )}

        {/* 3-button action row */}
        <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-border/50">
          {/* 1. Bag — Add to cart */}
          {!isHidden('cart') && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); menuStore.addToCart(dish); }}
              className="w-9 h-9 rounded-full glass flex items-center justify-center mx-auto"
              title="Add to cart"
            >
              <ShoppingBag className="w-4 h-4 text-foreground/70" />
            </motion.button>
          )}

          {/* 2. Comment icon */}
          {!isHidden('review') && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onReviewOpen?.(dish); }}
              className="w-9 h-9 rounded-full glass flex items-center justify-center mx-auto"
              title="Review"
            >
              <MessageCircle className="w-4 h-4 text-foreground/70" />
            </motion.button>
          )}

          {/* 3. ChevronDown — More options */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="w-9 h-9 rounded-full glass flex items-center justify-center mx-auto"
            title="More"
          >
            <ChevronDown className={`w-4 h-4 text-foreground/70 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>

        <AnimatePresence>
          {expanded && dish.long_description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {dish.long_description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Modal — Modern Redesign */}
      <AnimatePresence>
        {payModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-0"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setPayModalOpen(false)} />

            {/* Modal Card — slides up */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative z-10 w-full max-w-md bg-background rounded-t-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <h3 className="font-display text-xl font-semibold">Pay via UPI</h3>
                <button
                  onClick={() => setPayModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>

              <div className="px-6 pb-8 space-y-5">
                {/* Amount Input */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Enter Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">₹</span>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-4 bg-secondary rounded-2xl text-2xl font-bold text-foreground text-center border-2 border-transparent focus:border-primary outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* UPI Options — 2x2 Grid */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Choose Payment App</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        id: 'gpay',
                        name: 'Google Pay',
                        scheme: (upiId, name, amount) => `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`,
                        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/120px-Google_Pay_Logo.svg.png',
                        bg: '#E8F0FE',
                        color: '#4285F4',
                      },
                      {
                        id: 'phonepe',
                        name: 'PhonePe',
                        scheme: (upiId, name, amount) => `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`,
                        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/120px-PhonePe_Logo.svg.png',
                        bg: '#EDE7F6',
                        color: '#5F259F',
                      },
                      {
                        id: 'paytm',
                        name: 'Paytm',
                        scheme: (upiId, name, amount) => `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`,
                        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paytm_logo.png/120px-Paytm_logo.png',
                        bg: '#E3F2FD',
                        color: '#00BAF2',
                      },
                      {
                        id: 'bhim',
                        name: 'BHIM Pay',
                        scheme: (upiId, name, amount) => `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`,
                        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/120px-UPI-Logo-vector.svg.png',
                        bg: '#FFF3E0',
                        color: '#FF6600',
                      },
                    ].map(app => (
                      <button
                        key={app.id}
                        onClick={() => {
                          const upiId = restaurant?.upi_id || '';
                          const payeeName = restaurant?.upi_payee_name || restaurant?.name || 'Restaurant';
                          if (!upiId) { alert('UPI ID not configured by restaurant.'); return; }
                          const url = app.scheme(upiId, payeeName, payAmount);
                          window.location.href = url;
                          setTimeout(() => {
                            alert('If the app did not open, please open your UPI app manually.');
                          }, 2000);
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-border hover:border-primary transition-all active:scale-95"
                        style={{ background: app.bg }}
                      >
                        <img src={app.logo} alt={app.name} className="h-8 w-auto object-contain" onError={e => { e.target.style.display='none'; }} />
                        <span className="text-xs font-semibold" style={{ color: app.color }}>{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fallback message */}
                <p className="text-xs text-center text-muted-foreground">
                  On desktop: if app does not open, please open your UPI app manually and pay to <strong>{restaurant?.upi_id || 'restaurant UPI ID'}</strong>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(DishCardGrid);
