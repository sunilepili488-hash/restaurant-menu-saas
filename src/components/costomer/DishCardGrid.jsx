import React, { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ThumbsUp, ShoppingBag, Leaf, Drumstick, Heart, ChevronDown, MessageCircle, X } from 'lucide-react';
import { menuStore, useMenuStore } from '@/lib/menuStore';
import { entities } from '@/api/entities';
import { formatCount, getOrderedToday } from '@/lib/formatUtils';
import { User } from 'lucide-react';
import LazyImage from './LazyImage';

function DishCardGrid({ dish, restaurant, onReviewOpen, eager, onImageClick }) {
  const store = useMenuStore();
  const [expanded, setExpanded] = useState(false);

  const [optimisticLike, setOptimisticLike] = useState(null);
  const likeCount = optimisticLike !== null && optimisticLike !== (dish.like_count || 0)
    ? optimisticLike
    : (dish.like_count || 0);

  useEffect(() => {
    if (optimisticLike !== null && (dish.like_count || 0) >= optimisticLike) {
      setOptimisticLike(null);
    }
  }, [dish.like_count]);

  const likeLockRef = useRef(false);

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
  const themeVars = restaurant?.theme_css_vars || {};
  const cardRadius = themeVars['--radius'] || '0.75rem';
  const cardShadow = themeVars['--card-shadow'] || 'none';

  const handleLike = async (e) => {
    e.stopPropagation();
    if (likeLockRef.current) return;
    likeLockRef.current = true;

    const wasLiked = isLiked;
    const nowLiked = menuStore.toggleLike(dish.id);
    const baseCount = optimisticLike !== null ? optimisticLike : (dish.like_count || 0);
    const newCount = wasLiked
      ? Math.max(0, baseCount - 1)
      : baseCount + 1;

    setOptimisticLike(newCount);

    try {
      await entities.Dish.update(dish.id, { like_count: newCount });
    } catch (err) {
      console.error('Failed to update like count:', err);
    } finally {
      setTimeout(() => { likeLockRef.current = false; }, 500);
    }
  };

  return (
    <motion.div
      className="glass overflow-hidden group"
      layout={false}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ willChange: 'transform, opacity', borderRadius: cardRadius, boxShadow: cardShadow }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => onImageClick?.(dish)}>
        <LazyImage
          src={dish.image_url}
          alt={dish.name}
          eager={eager}
          className="absolute inset-0 w-full h-full object-cover"
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

        {/* Heart icon — darker border */}
        {!isHidden('favorite') && (
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); menuStore.toggleFavorite(dish.id); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border-2 border-black flex items-center justify-center shadow-md"
            title="Favorite"
          >
            <Heart className={`w-4 h-4 transition-colors ${isFav ? 'text-rose-500 fill-rose-500' : 'text-white/90'}`} />
          </motion.button>
        )}

        {prepTimeStr && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
            <Clock className="w-3 h-3" />
            {prepTimeStr}
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

        {(!isHidden('like') || !isHidden('ordered_count')) && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            {!isHidden('like') && (
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={handleLike}
                className="flex items-center gap-1.5"
              >
                <ThumbsUp className={`w-4 h-4 transition-colors ${isLiked ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs text-muted-foreground">{formatCount(likeCount)}</span>
              </motion.button>
            )}
            {!isHidden('ordered_count') && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground/70" />
                <span className="text-xs text-muted-foreground">{formatCount(orderedToday)}</span>
              </div>
            )}
          </div>
        )}

        {/* 3-button action row */}
        <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-border/50">
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
          {!isHidden('view_more') && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="w-9 h-9 rounded-full glass flex items-center justify-center mx-auto"
              title="More"
            >
              <ChevronDown className={`w-4 h-4 text-foreground/70 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </motion.button>
          )}
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

      {/* Payment Modal */}
      <AnimatePresence>
        {payModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-0"
          >
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setPayModalOpen(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative z-10 w-full max-w-md bg-background rounded-t-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <h3 className="font-display text-xl font-semibold">Pay via UPI</h3>
                <button onClick={() => setPayModalOpen(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
              <div className="px-6 pb-8 space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Enter Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">₹</span>
                    <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full pl-10 pr-4 py-4 bg-secondary rounded-2xl text-2xl font-bold text-foreground text-center border-2 border-transparent focus:border-primary outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Choose Payment App</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id:'gpay', name:'Google Pay', scheme:(u,n,a)=>`tez://upi/pay?pa=${u}&pn=${encodeURIComponent(n)}&am=${a}&cu=INR`, logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/120px-Google_Pay_Logo.svg.png', bg:'#E8F0FE', color:'#4285F4' },
                      { id:'phonepe', name:'PhonePe', scheme:(u,n,a)=>`phonepe://pay?pa=${u}&pn=${encodeURIComponent(n)}&am=${a}&cu=INR`, logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/120px-PhonePe_Logo.svg.png', bg:'#EDE7F6', color:'#5F259F' },
                      { id:'paytm', name:'Paytm', scheme:(u,n,a)=>`paytmmp://pay?pa=${u}&pn=${encodeURIComponent(n)}&am=${a}&cu=INR`, logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paytm_logo.png/120px-Paytm_logo.png', bg:'#E3F2FD', color:'#00BAF2' },
                      { id:'bhim', name:'BHIM Pay', scheme:(u,n,a)=>`upi://pay?pa=${u}&pn=${encodeURIComponent(n)}&am=${a}&cu=INR`, logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/120px-UPI-Logo-vector.svg.png', bg:'#FFF3E0', color:'#FF6600' },
                    ].map(app => (
                      <button key={app.id} onClick={() => { const uid=restaurant?.upi_id||''; const pn=restaurant?.upi_payee_name||restaurant?.name||'Restaurant'; if(!uid){alert('UPI ID not configured.');return;} window.location.href=app.scheme(uid,pn,payAmount); setTimeout(()=>{alert('If the app did not open, please open your UPI app manually.');},2000); }} className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-border hover:border-primary transition-all active:scale-95" style={{background:app.bg}}>
                        <img src={app.logo} alt={app.name} className="h-8 w-auto object-contain" onError={e=>{e.target.style.display='none';}} />
                        <span className="text-xs font-semibold" style={{color:app.color}}>{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  On desktop: if app does not open, please open your UPI app manually and pay to <strong>{restaurant?.upi_id || 'restaurant UPI ID'}</strong>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(DishCardGrid);
