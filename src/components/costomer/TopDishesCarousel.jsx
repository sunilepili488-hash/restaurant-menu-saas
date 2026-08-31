import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Drumstick, Star } from 'lucide-react';
import LazyImage from './LazyImage';
import DishDetailSheet from './DishDetailSheet';

const DEFAULT_MESSAGES = [
  '⭐ Today\'s Top Dishes',
  '🔥 Recommended For You',
  '👨‍🍳 Chef\'s Special Picks',
];

export default React.memo(function TopDishesCarousel({ dishes, restaurant }) {
  const [detailDish, setDetailDish] = useState(null);
  const [msgIndex, setMsgIndex] = useState(0);

  // Get messages: from admin panel or defaults
  const messages = (restaurant?.top_dishes_messages || []).filter(Boolean).length > 0
    ? restaurant.top_dishes_messages.filter(Boolean)
    : DEFAULT_MESSAGES;

  // Rotate text every 4 seconds
  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  if (!dishes || dishes.length === 0) return null;
  const curr = restaurant?.currency_symbol || '₹';
  const cardRadius = restaurant?.theme_css_vars?.['--radius'] || '0.75rem';

  return (
    <div className="px-4 max-w-7xl mx-auto mb-4">
      {/* Animated centered title */}
      <div className="flex items-center justify-center gap-2 mb-3 h-7 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.h2
            key={msgIndex}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="font-display text-base font-semibold text-foreground absolute"
          >
            {messages[msgIndex]}
          </motion.h2>
        </AnimatePresence>
      </div>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {dishes.map(dish => {
          const hasDiscount = dish.sale_price && dish.sale_price < dish.regular_price;
          return (
            <motion.button
              key={dish.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDetailDish(dish)}
              className="flex-shrink-0 w-36 glass overflow-hidden text-left"
              style={{ borderRadius: cardRadius }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <LazyImage
                  src={dish.image_url}
                  alt={dish.name}
                  fallbackText="No Image"
                  eager
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center ${dish.is_veg ? 'bg-green-600' : 'bg-red-600'}`}>
                  {dish.is_veg ? <Leaf className="w-2.5 h-2.5 text-white" /> : <Drumstick className="w-2.5 h-2.5 text-white" />}
                </span>
              </div>
              <div className="p-2">
                <h3 className="font-display text-sm font-semibold text-foreground leading-tight line-clamp-1">{dish.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-primary font-bold text-xs">
                    {curr}{(dish.sale_price || dish.regular_price).toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-muted-foreground text-[10px] line-through">
                      {curr}{dish.regular_price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <DishDetailSheet
        dish={detailDish}
        restaurant={restaurant}
        open={!!detailDish}
        onClose={() => setDetailDish(null)}
      />
    </div>
  );
});
