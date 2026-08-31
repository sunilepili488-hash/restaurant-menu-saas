import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, MessageCircle, Leaf, Drumstick } from 'lucide-react';
import { menuStore } from '@/lib/menuStore';
import LazyImage from './LazyImage';

// Change: small CENTERED quick-view card — used from the text-only (3rd)
// view when a row is tapped. Deliberately lightweight: small image, name,
// price, add-to-cart icon, comment icon — NOT the full bottom sheet with
// long description + reviews list (that stays as-is for grid/list views
// via DishDetailSheet). Opens/closes as a scale+fade card in the center of
// the screen instead of sliding up from the bottom.
export default function DishQuickViewModal({ dish, restaurant, open, onClose, onCommentClick }) {
  if (!dish) return null;
  const curr = restaurant?.currency_symbol || '₹';
  const hasDiscount = dish.sale_price && dish.sale_price < dish.regular_price;
  const discountPct = hasDiscount
    ? Math.round(((dish.regular_price - dish.sale_price) / dish.regular_price) * 100)
    : 0;
  const icons = restaurant?.icon_settings || {};
  const isHidden = (key) => icons[key]?.hidden === true;

  return (
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

            {/* Small image */}
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
              </div>
            </div>

            {/* Name + price */}
            <div className="p-3 text-center">
              <h3 className="font-display text-sm font-semibold text-foreground leading-tight line-clamp-1">
                {dish.name}
              </h3>
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

              {/* Add to cart + comment icons */}
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
    </AnimatePresence>
  );
}
