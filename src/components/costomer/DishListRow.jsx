import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, ShoppingBag, Leaf, Drumstick } from 'lucide-react';
import { menuStore, useMenuStore } from '@/lib/menuStore';
import LazyImage from './LazyImage';
import DishDetailSheet from './DishDetailSheet';
import { getScrollVariants } from '@/lib/scrollAnimations';

function DishListRow({ dish, restaurant, eager }) {
  const store = useMenuStore();
  const [detailOpen, setDetailOpen] = useState(false);
  const isFav = store.favorites.includes(dish.id);
  const curr = restaurant?.currency_symbol || '₹';
  const hasDiscount = dish.sale_price && dish.sale_price < dish.regular_price;
  const discountPct = hasDiscount
    ? Math.round(((dish.regular_price - dish.sale_price) / dish.regular_price) * 100)
    : 0;
  const icons = restaurant?.icon_settings || {};
  const isHidden = (key) => icons[key]?.hidden === true;
  const scrollVariants = getScrollVariants(restaurant?.scroll_animation_style);

  return (
    <motion.div
      initial={scrollVariants.initial}
      whileInView={scrollVariants.animate}
      viewport={{ once: true, amount: 0.2 }}
      transition={scrollVariants.transition}
      className="glass rounded-xl p-3 flex items-center gap-3"
    >
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
