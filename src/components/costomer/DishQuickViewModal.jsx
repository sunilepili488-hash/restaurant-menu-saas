import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, MessageCircle, Leaf, Drumstick, Heart, ThumbsUp } from 'lucide-react';
import { menuStore, useMenuStore } from '@/lib/menuStore';
import { entities } from '@/api/entities';
import { formatCount } from '@/lib/formatUtils';
import LazyImage from './LazyImage';

export default function DishQuickViewModal({ dish, restaurant, open, onClose, onCommentClick, detailed = false }) {
  const store = useMenuStore();
  const [optimisticLike, setOptimisticLike] = useState(null);

  if (!dish) return null;
  const curr = restaurant?.currency_symbol || '₹';
  const hasDiscount = dish.sale_price && dish.sale_price < dish.regular_price;
  const discountPct = hasDiscount
    ? Math.round(((dish.regular_price - dish.sale_price) / dish.regular_price) * 100)
    : 0;
  const icons = restaurant?.icon_settings || {};
  const isHidden = (key) => icons[key]?.hidden === true;
  const isFav = store.favorites.includes(dish.id);
  const isLiked = store.likedDishes[dish.id] || false;
  const likeCount = optimisticLike !== null && optimisticLike !== (dish.like_count || 0)
    ? optimisticLike
    : (dish.like_count || 0);

  const handleLike = (e) => {
    e.stopPropagation();
    const wasLiked = isLiked;
    menuStore.toggleLike(dish.id);
    const baseCount = optimisticLike !== null ? optimisticLike : (dish.like_count || 0);
    const newCount = wasLiked ? Math.max(0, baseCount - 1) : baseCount + 1;
    setOptimisticLike(newCount);
    entities.Dish.update(dish.id, { like_count: newCount }).catch(() => {});
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="relative w-full max-w-[280px] bg-background rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-7 h-7 rounded-full glass flex items-center justify-center z-10"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Image */}
            <div className="relative w-full aspect-[4/3]">
              <LazyImage
                src={dish.image_url}
                alt={dish.name}
                fallbackText="No Image"
                eager
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                {hasDiscount && (
                  <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {discountPct}% OFF
                  </span>
                )}
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${dish.is_veg ? 'bg-green-600' : 'bg-red-600'}`}>
                  {dish.is_veg ? <Leaf className="w-2.5 h-2.5 text-white" /> : <Drumstick className="w-2.5 h-2.5 text-white" />}
                </span>
                {detailed && !isHidden('favorite') && (
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => { e.stopPropagation(); menuStore.toggleFavorite(dish.id); }}
                    className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm border-2 border-black flex items-center justify-center"
                    title="Favorite"
                  >
                    <Heart className={`w-3 h-3 transition-colors ${isFav ? 'text-rose-500 fill-rose-500' : 'text-white/90'}`} />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-3 text-center">
              <h3 className="font-display text-sm font-semibold text-foreground leading-tight line-clamp-1">
                {dish.name}
              </h3>

              {detailed && dish.short_description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{dish.short_description}</p>
              )}

              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-primary font-bold text-sm">
                  {curr}{(dish.sale_price || dish.regular_price)?.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-muted-foreground text-xs line-through">
                    {curr}{dish.regular_price?.toLocaleString()}
                  </span>
                )}
              </div>

              {detailed && !isHidden('like') && (
                <button onClick={handleLike} className="flex items-center justify-center gap-1.5 mt-2">
                  <ThumbsUp className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                  <span className="text-xs text-muted-foreground">{formatCount(likeCount)} likes</span>
                </button>
              )}

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-border/50">
                {!isHidden('cart') && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { menuStore.addToCart(dish); onClose(); }}
                    className="w-10 h-10 rounded-full glass flex items-center justify-center"
                    title="Add to cart"
                  >
                    <ShoppingBag className="w-4 h-4 text-foreground/70" />
                  </motion.button>
                )}
                {!isHidden('review') && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { onCommentClick?.(dish); onClose(); }}
                    className="w-10 h-10 rounded-full glass flex items-center justify-center"
                    title="Comments"
                  >
                    <MessageCircle className="w-4 h-4 text-foreground/70" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
