import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Leaf, Drumstick, ShoppingBag } from 'lucide-react';
import { menuStore } from '@/lib/menuStore';
import LazyImage from './LazyImage';

export default function DishDetailSheet({ dish, restaurant, open, onClose }) {
  if (!dish) return null;
  const curr = restaurant?.currency_symbol || '₹';
  const hasDiscount = dish.sale_price && dish.sale_price < dish.regular_price;
  const discountPct = hasDiscount
    ? Math.round(((dish.regular_price - dish.sale_price) / dish.regular_price) * 100)
    : 0;
  const prepTimeStr = dish.prep_time_value
    ? `${dish.prep_time_value} ${dish.prep_time_unit || 'min'}`
    : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-lg bg-background rounded-t-3xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="overflow-y-auto">
              {/* Image */}
              <div className="relative w-full aspect-[4/3]">
                <LazyImage
                  src={dish.image_url}
                  alt={dish.name}
                  fallbackText="No Image"
                  eager
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {hasDiscount && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {discountPct}% OFF
                    </span>
                  )}
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center ${dish.is_veg ? 'bg-green-600' : 'bg-red-600'}`}>
                    {dish.is_veg ? <Leaf className="w-3.5 h-3.5 text-white" /> : <Drumstick className="w-3.5 h-3.5 text-white" />}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 space-y-3">
                <h2 className="font-display text-xl font-bold text-foreground">{dish.name}</h2>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-primary font-bold text-lg">
                    {curr}{(dish.sale_price || dish.regular_price)?.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-muted-foreground text-sm line-through">
                      {curr}{dish.regular_price?.toLocaleString()}
                    </span>
                  )}
                  {prepTimeStr && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" /> {prepTimeStr}
                    </span>
                  )}
                </div>

                {dish.long_description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {dish.long_description}
                  </p>
                )}

                {!dish.long_description && dish.short_description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {dish.short_description}
                  </p>
                )}
              </div>
            </div>

            {/* Sticky Add to Cart footer */}
            <div className="flex-shrink-0 p-4 border-t border-border bg-background">
              <button
                onClick={() => { menuStore.addToCart(dish); onClose(); }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart — {curr}{(dish.sale_price || dish.regular_price)?.toLocaleString()}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
