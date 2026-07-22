import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, ShoppingBag, Leaf, Drumstick } from 'lucide-react';
import { menuStore, useMenuStore } from '@/lib/menuStore';
import LazyImage from './LazyImage';
import DishDetailSheet from './DishDetailSheet';

// Returns framer-motion props for the current scroll effect (list view)
function getScrollProps(effect, index = 0) {
  const base = { viewport: { once: true, margin: '0px 0px -40px 0px' }, transition: { duration: 0.4, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] } };
  switch (effect) {
    case 'slide-stagger':
      return { ...base, initial: { opacity: 0, x: -28 }, whileInView: { opacity: 1, x: 0 } };
    case 'scale-pop':
      return { ...base, initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 } };
    case 'tilt-reveal':
      return { ...base, initial: { opacity: 0, rotateX: 12, scale: 0.94 }, whileInView: { opacity: 1, rotateX: 0, scale: 1 }, style: { perspective: 600 } };
    case 'fade-rise':
    default:
      return { ...base, initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 } };
  }
}

function DishListRow({ dish, restaurant, eager, index }) {
  const store = useMenuStore();
  const [detailOpen, setDetailOpen] = useState(false);
  const isFav = store.favorites.includes(dish.id);
  const curr = restaurant?.currency_symbol || '₹';
  const icons = restaurant?.icon_settings || {};
  const effect = restaurant?.scroll_effect || 'fade-rise';
  const isHidden = (key) => icons[key]?.hidden === true;

  const hasDiscount = dish.sale_price && dish.sale_price < dish.regular_price;
  const discountPct = hasDiscount
    ? Math.round(((dish.regular_price - dish.sale_price) / dish.regular_price) * 100)
    : 0;

  const scrollProps = getScrollProps(effect, index);

  return (
    <motion.div
      {...scrollProps}
      className="glass rounded-xl p-3 flex items-center gap-3"
    >
      {/* Thumbnail with discount badge at bottom edge */}
      <div
        className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-secondary cursor-pointer"
        onClick={() => setDetailOpen(true)}
      >
        <LazyImage
          src={dish.image_url}
          alt={dish.name}
          fallbackText="No img"
          eager={eager}
          className="w-full h-full object-cover"
        />
        {hasDiscount && (
          <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold text-center py-0.5 leading-none">
            {discountPct}% OFF
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-display text-sm font-semibold text-foreground truncate">{dish.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-primary font-bold text-xs">
            {curr}{(dish.sale_price || dish.regular_price).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-muted-foreground text-[10px] line-through">
              {curr}{dish.regular_price.toLocaleString()}
            </span>
          )}
          <span className={`w-4 h-4 rounded-full flex items-center justify-center ${dish.is_veg ? 'bg-green-600' : 'bg-red-600'}`}>
            {dish.is_veg ? <Leaf className="w-2.5 h-2.5 text-white" /> : <Drumstick className="w-2.5 h-2.5 text-white" />}
          </span>
        </div>
      </div>

      {/* Actions — only shown if at least one is visible */}
      {(!isHidden('favorite') || !isHidden('cart')) && (
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          {!isHidden('favorite') && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => menuStore.toggleFavorite(dish.id)}
              className="w-8 h-8 rounded-full glass flex items-center justify-center"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
            </motion.button>
          )}
          {!isHidden('cart') && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => menuStore.addToCart(dish)}
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      )}

      <DishDetailSheet
        dish={dish}
        restaurant={restaurant}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </motion.div>
  );
}

export default memo(DishListRow);
