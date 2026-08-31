import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';
import { formatCount } from '@/lib/formatUtils';
import DishQuickViewModal from './DishQuickViewModal';

// Change 9: third dish-view — pure text only (name, price, total likes).
// Change (alignment fix): likes and price now sit in FIXED-width columns
// so they line up in a straight column across every row, regardless of
// how long the dish name or the numbers are.
// Change (click-to-detail): tapping a row now opens a small CENTERED
// quick-view card (image, name, price, add-to-cart, comment) instead of
// the old bottom sheet — that's the dedicated component for this view.
// Change (loading fix): removed the scroll-triggered "whileInView" reveal
// that was causing rows to stay invisible until the user manually
// scrolled — rows now animate in immediately on mount.
// Change (comment icon): tapping the comment icon in the quick-view now
// opens the real review sheet (via onReviewOpen from CustomerMenu), same
// as the grid view — not just a UI icon.
function DishTextRow({ dish, restaurant, onReviewOpen }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const curr = restaurant?.currency_symbol || '₹';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
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

      <DishQuickViewModal
        dish={dish}
        restaurant={restaurant}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onCommentClick={(d) => onReviewOpen?.(d)}
      />
    </>
  );
}

export default memo(DishTextRow);
