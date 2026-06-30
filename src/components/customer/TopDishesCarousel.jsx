import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Drumstick, Star } from 'lucide-react';
import LazyImage from './LazyImage';

export default React.memo(function TopDishesCarousel({ dishes, restaurant, onReviewOpen }) {
  if (!dishes || dishes.length === 0) return null;
  const curr = restaurant?.currency_symbol || '₹';

  return (
    <div className="px-4 max-w-7xl mx-auto mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Star className="w-4 h-4 text-accent fill-accent" />
        <h2 className="font-display text-lg font-semibold">Today's Top Dishes</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {dishes.map(dish => {
          const hasDiscount = dish.sale_price && dish.sale_price < dish.regular_price;
          return (
            <motion.button
              key={dish.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onReviewOpen?.(dish)}
              className="flex-shrink-0 w-36 glass rounded-2xl overflow-hidden text-left"
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
    </div>
  );
});