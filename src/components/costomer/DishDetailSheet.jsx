import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Leaf, Drumstick, ShoppingBag, ThumbsUp, Send, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuStore, useMenuStore } from '@/lib/menuStore';
import { entities } from '@/api/entities';
import { formatCount } from '@/lib/formatUtils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import LazyImage from './LazyImage';

export default function DishDetailSheet({ dish, restaurant, open, onClose }) {
  const store = useMenuStore();
  const [optimisticLike, setOptimisticLike] = useState(null);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const icons = restaurant?.icon_settings || {};
  const isHidden = (key) => icons[key]?.hidden === true;
  const showLike = !isHidden('like');
  const showCart = !isHidden('cart');
  const showComments = !isHidden('review');
  const minimalView = !showLike && !showCart && !showComments;

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', dish?.id],
    queryFn: () => entities.Review.filter({ dish_id: dish?.id }, '-created_at', 50),
    enabled: !!dish?.id && open && showComments,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', dish?.id] });
      setContent('');
      setName('');
    },
  });

  if (!dish) return null;
  const curr = restaurant?.currency_symbol || '₹';
  const hasDiscount = dish.sale_price && dish.sale_price < dish.regular_price;
  const discountPct = hasDiscount
    ? Math.round(((dish.regular_price - dish.sale_price) / dish.regular_price) * 100)
    : 0;
  const prepTimeStr = dish.prep_time_value
    ? `${dish.prep_time_value} ${dish.prep_time_unit || 'min'}`
    : null;

  const isLiked = store.likedDishes[dish.id] || false;
  const likeCount = optimisticLike !== null && optimisticLike > (dish.like_count || 0)
    ? optimisticLike
    : (dish.like_count || 0);

  const handleLike = () => {
    const nowLiked = menuStore.toggleLike(dish.id);
    const baseCount = dish.like_count || 0;
    const newCount = nowLiked ? baseCount + 1 : Math.max(0, baseCount - 1);
    setOptimisticLike(newCount);
    entities.Dish.update(dish.id, { like_count: newCount });
  };

  const handleSubmitComment = () => {
    if (!content.trim()) return;
    submitMutation.mutate({
      dish_id: dish.id,
      reviewer_name: name || 'Guest',
      content,
      rating: 5,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end justify-center"
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-lg bg-background rounded-t-3xl overflow-hidden max-h-[85vh] flex flex-col"
          >
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

                {showLike && (
                  <button
                    onClick={handleLike}
                    className="flex items-center gap-2 pt-1"
                  >
                    <ThumbsUp className={`w-4 h-4 transition-colors ${isLiked ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm text-muted-foreground">{formatCount(likeCount)} likes</span>
                  </button>
                )}
              </div>

              {showComments && (
                <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
                  <h3 className="font-display text-sm font-semibold">Comments</h3>
                  <div className="space-y-2 max-h-[22vh] overflow-y-auto">
                    {reviews.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>
                    )}
                    {reviews.map(r => (
                      <div key={r.id} className="glass rounded-xl p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{r.reviewer_name}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-2.5 h-2.5 ${s <= r.rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{r.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 items-end pt-1">
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Name (optional)"
                      className="bg-secondary border-border/50 w-28 flex-shrink-0"
                    />
                    <Textarea
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-secondary border-border/50 min-h-[40px]"
                    />
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!content.trim() || submitMutation.isPending}
                      className="bg-primary text-primary-foreground"
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {showCart && (
              <div className="flex-shrink-0 p-4 border-t border-border bg-background">
                <button
                  onClick={() => { menuStore.addToCart(dish); onClose(); }}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart — {curr}{(dish.sale_price || dish.regular_price)?.toLocaleString()}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
