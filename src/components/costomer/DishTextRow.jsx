import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';
import { formatCount } from '@/lib/formatUtils';
import { getScrollVariants, SCROLL_VIEWPORT } from '@/lib/scrollAnimations';
import DishDetailSheet from './DishDetailSheet';

// Change 9: third dish-view — pure text only (name, price, total likes).
// Change (alignment fix): likes and price now sit in FIXED-width columns
// so they line up in a straight column across every row, regardless of
// how long the dish name or the numbers are.
// Change (click-to-detail): tapping a row now opens the same detail card
// used elsewhere — image, name, discount, heart, add-to-cart, comment.
function DishTextRow({ dish, restaurant }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const curr = restaurant?.currency_symbol || '₹';
  const scrollVariants = getScrollVariants(restaurant?.scroll_animation_style);

  return (
    <>
      <motion.div
        initial={scrollVariants.initial}
        whileInView={scrollVariants.animate}
        viewport={SCROLL_VIEWPORT}
        transition={scrollVariants.transition}
        onClick={() => setDetailOpen(true)}
        className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3 cursor-pointer"
      >
        <h4 className="font-display text-sm font-semibold text-foreground truncate min-w-0 flex-1">
          {dish.name}
        </h4>

        <div className="flex items-center flex-shrink-0">
          <div className="flex items-center justify-end gap-1 text-muted-foreground w-14">
            <ThumbsUp className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs tabular-nums">{formatCount(dish.like_count || 0)}</span>
          </div>

          <span className="text-primary font-bold text-sm w-16 text-right tabular-nums">
            {curr}{(dish.sale_price || dish.regular_price).toLocaleString()}
          </span>
        </div>
      </motion.div>

      <DishDetailSheet
        dish={dish}
        restaurant={restaurant}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}

export default memo(DishTextRow);
