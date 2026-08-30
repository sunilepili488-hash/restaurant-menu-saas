import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';
import { formatCount } from '@/lib/formatUtils';
import { getScrollVariants, SCROLL_VIEWPORT } from '@/lib/scrollAnimations';

// Change 9: third dish-view — pure text, no image. Shows name, short
// description, price, and total likes only, in a compact card.
function DishTextRow({ dish, restaurant }) {
  const curr = restaurant?.currency_symbol || '₹';
  const hasDiscount = dish.sale_price && dish.sale_price < dish.regular_price;
  const scrollVariants = getScrollVariants(restaurant?.scroll_animation_style);

  return (
    <motion.div
      initial={scrollVariants.initial}
      whileInView={scrollVariants.animate}
      viewport={SCROLL_VIEWPORT}
      transition={scrollVariants.transition}
      className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3"
    >
      <div className="min-w-0 flex-1">
        <h4 className="font-display text-sm font-semibold text-foreground truncate">{dish.name}</h4>
        {dish.short_description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{dish.short_description}</p>
        )}
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-1 text-muted-foreground">
          <ThumbsUp className="w-3.5 h-3.5" />
          <span className="text-xs">{formatCount(dish.like_count || 0)}</span>
        </div>

        <div className="text-right">
          <span className="text-primary font-bold text-sm block">
            {curr}{(dish.sale_price || dish.regular_price).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-muted-foreground text-[10px] line-through">
              {curr}{dish.regular_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(DishTextRow);
