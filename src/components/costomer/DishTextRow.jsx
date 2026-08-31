import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';
import { formatCount } from '@/lib/formatUtils';
import { getScrollVariants, SCROLL_VIEWPORT } from '@/lib/scrollAnimations';

// Change 9: third dish-view — pure text only. Just name, price, and total
// likes. No image, no description, nothing else.
function DishTextRow({ dish, restaurant }) {
  const curr = restaurant?.currency_symbol || '₹';
  const scrollVariants = getScrollVariants(restaurant?.scroll_animation_style);

  return (
    <motion.div
      initial={scrollVariants.initial}
      whileInView={scrollVariants.animate}
      viewport={SCROLL_VIEWPORT}
      transition={scrollVariants.transition}
      className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3"
    >
      <h4 className="font-display text-sm font-semibold text-foreground truncate min-w-0 flex-1">
        {dish.name}
      </h4>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-1 text-muted-foreground">
          <ThumbsUp className="w-3.5 h-3.5" />
          <span className="text-xs">{formatCount(dish.like_count || 0)}</span>
        </div>

        <span className="text-primary font-bold text-sm">
          {curr}{(dish.sale_price || dish.regular_price).toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}

export default memo(DishTextRow);
