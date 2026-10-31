import React, { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ThumbsUp, HandPlatter as ShoppingBag, Leaf, Drumstick, Heart, ChevronDown, MessageCircle, X, Flame, Star } from 'lucide-react';
import { menuStore, useMenuStore } from '@/lib/menuStore';
import { entities } from '@/api/entities';
import { formatCount, getOrderedToday } from '@/lib/formatUtils';
import { User } from 'lucide-react';
import LazyImage from './LazyImage';

// ─── helper: pick card layout variant based on dish index ────
// Alternates through 5 card styles to create editorial variety
function getCardVariant(index) {
  const variants = ['premium', 'premium', 'featured', 'premium', 'editorial'];
  return variants[index % variants.length];
}

// ─── Veg / NonVeg indicator ──────────────────────────────────
function DietBadge({ isVeg, size = 'sm' }) {
  const s = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const i = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  return (
    <span className={`${s} rounded-sm flex items-center justify-center flex-shrink-0 ${isVeg ? 'bg-green-600' : 'bg-red-500'}`}>
      {isVeg
        ? <Leaf className={`${i} text-white`} />
        : <Drumstick className={`${i} text-white`} />}
    </span>
  );
}

// ─── Premium Image Card (default) ────────────────────────────
function PremiumCard({ dish, restaurant, isFav, isLiked, likeCount, orderedToday, hasDiscount, discountPct, curr, prepTimeStr, icons, onImageClick, onReviewOpen, onLike, onExpand, expanded }) {
  const isHidden = (key) => icons[key]?.hidden === true;
  const themeVars = restaurant?.theme_css_vars || {};
  const cardRadius = themeVars['--theme-card-radius'] || '1.15rem';
  const cardShadow = themeVars['--theme-card-shadow'] || '0 12px 30px rgba(20,35,30,0.08)';

  return (
    <motion.div
      className="dish-card glass overflow-hidden group flex flex-col"
      layout={false}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ willChange: 'transform, opacity', borderRadius: cardRadius, boxShadow: cardShadow }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Image area */}
      <div className="dish-card-image relative overflow-hidden cursor-pointer flex-shrink-0" onClick={() => onImageClick?.(dish)}>
        <LazyImage
          src={dish.image_url}
          alt={dish.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay for better badge readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
          {hasDiscount && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              {discountPct}% OFF
            </span>
          )}
          <DietBadge isVeg={dish.is_veg} />
        </div>

        {/* Wishlist / Favorite */}
        {!isHidden('favorite') && (
          <motion.button
            whileTap={{ scale: 0.75 }}
            onClick={(e) => { e.stopPropagation(); menuStore.toggleFavorite(dish.id); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/45 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-md"
            title="Favorite"
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${isFav ? 'text-rose-400 fill-rose-400' : 'text-white/90'}`} />
          </motion.button>
        )}

        {/* Prep time chip */}
        {prepTimeStr && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/55 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
            <Clock className="w-2.5 h-2.5" />
            {prepTimeStr}
          </span>
        )}

        {/* Ordered today — floating right bottom */}
        {orderedToday > 0 && !isHidden('ordered_count') && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/55 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
            <Flame className="w-2.5 h-2.5 text-orange-400" />
            {formatCount(orderedToday)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="dish-card-copy flex flex-col flex-1">
        <h3 className="dish-card-title font-display font-semibold leading-tight line-clamp-1">
          {dish.name}
        </h3>
        {dish.short_description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-snug">{dish.short_description}</p>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span className="dish-price">
            {curr}{(dish.sale_price || dish.regular_price).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-muted-foreground text-xs line-through">
              {curr}{dish.regular_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Like count row */}
        {!isHidden('like') && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={onLike}
              className="flex items-center gap-1.5"
            >
              <ThumbsUp className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground">{formatCount(likeCount)}</span>
            </motion.button>
            <span className="text-[10px] text-muted-foreground/60 font-medium">
              {dish.is_veg ? 'Veg' : 'Non-Veg'}
            </span>
          </div>
        )}

        {/* 3-button action row */}
        <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-border/50">
          {!isHidden('cart') && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={(e) => { e.stopPropagation(); menuStore.addToCart(dish); }}
              className="dish-card-icon-button flex items-center justify-center mx-auto"
              title="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </motion.button>
          )}
          {!isHidden('review') && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={(e) => { e.stopPropagation(); onReviewOpen?.(dish); }}
              className="dish-card-icon-button flex items-center justify-center mx-auto"
              title="Review"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </motion.button>
          )}
          {!isHidden('view_more') && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={(e) => { e.stopPropagation(); onExpand(); }}
              className="dish-card-icon-button flex items-center justify-center mx-auto"
              title="More"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {expanded && dish.long_description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="overflow-hidden"
            >
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{dish.long_description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Featured Dish Card (larger, stronger visual emphasis) ────
function FeaturedCard({ dish, restaurant, isFav, isLiked, likeCount, hasDiscount, discountPct, curr, prepTimeStr, icons, onImageClick, onReviewOpen, onLike, onExpand, expanded }) {
  const isHidden = (key) => icons[key]?.hidden === true;
  const themeVars = restaurant?.theme_css_vars || {};
  const cardRadius = themeVars['--theme-card-radius'] || '1.15rem';
  const cardShadow = themeVars['--theme-card-shadow'] || '0 12px 30px rgba(20,35,30,0.08)';

  return (
    <motion.div
      className="dish-card glass overflow-hidden group col-span-1"
      layout={false}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ willChange: 'transform, opacity', borderRadius: cardRadius, boxShadow: cardShadow }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Taller image for featured */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ aspectRatio: '3/2' }}
        onClick={() => onImageClick?.(dish)}
      >
        <LazyImage
          src={dish.image_url}
          alt={dish.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Stronger gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

        {/* Featured star badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
            <Star className="w-2.5 h-2.5 fill-current" />
            Featured
          </span>
          {hasDiscount && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              {discountPct}% OFF
            </span>
          )}
        </div>

        {!isHidden('favorite') && (
          <motion.button
            whileTap={{ scale: 0.75 }}
            onClick={(e) => { e.stopPropagation(); menuStore.toggleFavorite(dish.id); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/45 backdrop-blur-sm border border-white/20 flex items-center justify-center"
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-rose-400 fill-rose-400' : 'text-white/90'}`} />
          </motion.button>
        )}

        {/* Name + price overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0 mr-2">
              <h3 className="font-display font-bold text-white text-sm leading-tight line-clamp-1 drop-shadow">
                {dish.name}
              </h3>
              {prepTimeStr && (
                <span className="flex items-center gap-1 text-white/80 text-[10px] mt-0.5">
                  <Clock className="w-2.5 h-2.5" /> {prepTimeStr}
                </span>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <span className="block text-white font-bold text-sm drop-shadow">
                {curr}{(dish.sale_price || dish.regular_price).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-white/60 text-[10px] line-through">
                  {curr}{dish.regular_price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compact action row */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <DietBadge isVeg={dish.is_veg} />
          {dish.short_description && (
            <p className="text-xs text-muted-foreground line-clamp-1 flex-1">{dish.short_description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isHidden('like') && (
            <motion.button whileTap={{ scale: 0.8 }} onClick={onLike} className="flex items-center gap-1">
              <ThumbsUp className={`w-3 h-3 ${isLiked ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
              <span className="text-[10px] text-muted-foreground">{formatCount(likeCount)}</span>
            </motion.button>
          )}
          {!isHidden('cart') && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={(e) => { e.stopPropagation(); menuStore.addToCart(dish); }}
              className="ml-1 dish-card-icon-button flex items-center justify-center"
              title="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Editorial Card (asymmetric / accent strip) ───────────────
function EditorialCard({ dish, restaurant, isFav, isLiked, likeCount, hasDiscount, discountPct, curr, prepTimeStr, icons, onImageClick, onReviewOpen, onLike }) {
  const isHidden = (key) => icons[key]?.hidden === true;
  const themeVars = restaurant?.theme_css_vars || {};
  const cardRadius = themeVars['--theme-card-radius'] || '1.15rem';
  const cardShadow = themeVars['--theme-card-shadow'] || '0 12px 30px rgba(20,35,30,0.08)';

  return (
    <motion.div
      className="dish-card glass overflow-hidden group"
      layout={false}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ willChange: 'transform, opacity', borderRadius: cardRadius, boxShadow: cardShadow }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Image — square ratio */}
      <div className="relative overflow-hidden cursor-pointer" style={{ aspectRatio: '1/1' }} onClick={() => onImageClick?.(dish)}>
        <LazyImage
          src={dish.image_url}
          alt={dish.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {hasDiscount && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discountPct}% OFF
            </span>
          )}
          <DietBadge isVeg={dish.is_veg} />
        </div>
        {!isHidden('favorite') && (
          <motion.button
            whileTap={{ scale: 0.75 }}
            onClick={(e) => { e.stopPropagation(); menuStore.toggleFavorite(dish.id); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/45 backdrop-blur-sm border border-white/20 flex items-center justify-center"
          >
            <Heart className={`w-3 h-3 ${isFav ? 'text-rose-400 fill-rose-400' : 'text-white/90'}`} />
          </motion.button>
        )}
        {prepTimeStr && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/55 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            <Clock className="w-2.5 h-2.5" /> {prepTimeStr}
          </span>
        )}
      </div>

      {/* Accent strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-accent)] to-[var(--theme-secondary)]" />

      <div className="p-3">
        <h3 className="dish-card-title font-display font-semibold line-clamp-1 text-sm">{dish.name}</h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="dish-price text-sm">
            {curr}{(dish.sale_price || dish.regular_price).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-muted-foreground text-[11px] line-through">
              {curr}{dish.regular_price.toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          {!isHidden('like') && (
            <motion.button whileTap={{ scale: 0.8 }} onClick={onLike} className="flex items-center gap-1">
              <ThumbsUp className={`w-3 h-3 ${isLiked ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
              <span className="text-[10px] text-muted-foreground">{formatCount(likeCount)}</span>
            </motion.button>
          )}
          <div className="flex items-center gap-1">
            {!isHidden('review') && (
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={(e) => { e.stopPropagation(); onReviewOpen?.(dish); }}
                className="dish-card-icon-button w-7 h-7 flex items-center justify-center"
              >
                <MessageCircle className="w-3 h-3" />
              </motion.button>
            )}
            {!isHidden('cart') && (
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={(e) => { e.stopPropagation(); menuStore.addToCart(dish); }}
                className="dish-card-icon-button w-7 h-7 flex items-center justify-center"
              >
                <ShoppingBag className="w-3 h-3" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main DishCardGrid — routes to correct variant ───────────
function DishCardGrid({ dish, restaurant, onReviewOpen, eager, onImageClick, cardIndex = 0 }) {
  const store = useMenuStore();
  const [expanded, setExpanded] = useState(false);
  const [optimisticLike, setOptimisticLike] = useState(null);

  const likeCount = optimisticLike !== null && optimisticLike !== (dish.like_count || 0)
    ? optimisticLike
    : (dish.like_count || 0);

  useEffect(() => {
    if (optimisticLike !== null && (dish.like_count || 0) >= optimisticLike) setOptimisticLike(null);
  }, [dish.like_count]);

  const likeLockRef = useRef(false);

  const orderedToday = getOrderedToday(dish);
  const isFav = store.favorites.includes(dish.id);
  const isLiked = store.likedDishes[dish.id] || false;
  const icons = restaurant?.icon_settings || {};

  const hasDiscount = !!(dish.sale_price && dish.sale_price < dish.regular_price);
  const discountPct = hasDiscount
    ? Math.round(((dish.regular_price - dish.sale_price) / dish.regular_price) * 100)
    : 0;
  const curr = restaurant?.currency_symbol || '₹';

  const prepTimeStr = dish.prep_time_value
    ? `${dish.prep_time_value} ${dish.prep_time_unit || 'min'}`
    : null;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (likeLockRef.current) return;
    likeLockRef.current = true;
    const wasLiked = isLiked;
    const nowLiked = menuStore.toggleLike(dish.id);
    const baseCount = optimisticLike !== null ? optimisticLike : (dish.like_count || 0);
    const newCount = wasLiked ? Math.max(0, baseCount - 1) : baseCount + 1;
    setOptimisticLike(newCount);
    try {
      await entities.Dish.update(dish.id, { like_count: newCount });
    } catch (err) {
      console.error('Failed to update like count:', err);
    } finally {
      setTimeout(() => { likeLockRef.current = false; }, 500);
    }
  };

  const sharedProps = {
    dish, restaurant, isFav, isLiked, likeCount, orderedToday,
    hasDiscount, discountPct, curr, prepTimeStr, icons,
    onImageClick, onReviewOpen, onLike: handleLike,
    onExpand: () => setExpanded(p => !p), expanded,
  };

  const variant = getCardVariant(cardIndex);

  if (variant === 'featured' && dish.image_url) {
    return <FeaturedCard {...sharedProps} />;
  }
  if (variant === 'editorial' && dish.image_url) {
    return <EditorialCard {...sharedProps} />;
  }
  return <PremiumCard {...sharedProps} />;
}

export default memo(DishCardGrid);
