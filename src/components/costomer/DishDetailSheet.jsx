import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Leaf, Drumstick, ShoppingBag, ThumbsUp, MessageCircle, Star, Send } from 'lucide-react';
import { menuStore, useMenuStore } from '@/lib/menuStore';
import { entities } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LazyImage from './LazyImage';
import { formatCount } from '@/lib/formatUtils';

export default function DishDetailSheet({ dish, restaurant, open, onClose }) {
  const store = useMenuStore();
  const [showReviews, setShowReviews] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [optimisticLike, setOptimisticLike] = useState(null);
  const queryClient = useQueryClient();

  if (!dish) return null;

  const curr = restaurant?.currency_symbol || '₹';
  const icons = restaurant?.icon_settings || {};
  const isHidden = (key) => icons[key]?.hidden === true;

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

  const allActionsHidden = isHidden('like') && isHidden('cart') && isHidden('review');

  const handleLike = async () => {
    const nowLiked = menuStore.toggleLike(dish.id);
    const baseCount = dish.like_count || 0;
    const newCount = nowLiked ? baseCount + 1 : Math.max(0, baseCount - 1);
    setOptimisticLike(newCount);
    entities.Dish.update(dish.id, { like_count: newCount });
  };

  // Reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', dish.id],
    queryFn: () => entities.Review.filter({ dish_id: dish.id }, '-created_at', 50),
    enabled: !!dish.id && showReviews && open,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', dish.id] });
      setReviewContent('');
      setReviewName('');
      setReviewRating(5);
    },
  });

  const handleSubmitReview = () => {
    if (!reviewContent.trim()) return;
    submitMutation.mutate({
      dish_id: dish.id,
      reviewer_name: reviewName || 'Guest',
      content: reviewContent,
      rating: reviewRating,
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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-lg bg-background rounded-t-3xl overflow-hidden max-h-[88vh] flex flex-col"
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

            <div className="overflow-y-auto flex-1">
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

                {/* Like count row */}
                {!isHidden('like') && (
                  <button
                    onClick={handleLike}
                    className="flex items-center gap-2 py-2"
                  >
                    <ThumbsUp className={`w-4 h-4 transition-colors ${isLiked ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm text-muted-foreground">{formatCount(likeCount)} likes</span>
                  </button>
                )}

                {(dish.long_description || dish.short_description) && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {dish.long_description || dish.short_description}
                  </p>
                )}

                {/* Review / comment section */}
                {!isHidden('review') && (
                  <div className="pt-2 border-t border-border space-y-3">
                    <button
                      onClick={() => setShowReviews(v => !v)}
                      className="flex items-center gap-2 text-sm font-medium text-primary"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {showReviews ? 'Hide Reviews' : 'Reviews & Comments'}
                    </button>

                    {showReviews && (
                      <div className="space-y-3">
                        {/* Submit review */}
                        <div className="space-y-2">
                          {/* Rating stars */}
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <button key={s} onClick={() => setReviewRating(s)}>
                                <Star className={`w-4 h-4 ${s <= reviewRating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                              </button>
                            ))}
                          </div>
                          <Input
                            value={reviewName}
                            onChange={e => setReviewName(e.target.value)}
                            placeholder="Your name (optional)"
                            className="bg-secondary text-sm"
                          />
                          <div className="flex gap-2">
                            <Textarea
                              value={reviewContent}
                              onChange={e => setReviewContent(e.target.value)}
                              placeholder="Share your experience…"
                              className="bg-secondary text-sm min-h-[72px] flex-1"
                            />
                            <button
                              onClick={handleSubmitReview}
                              disabled={!reviewContent.trim() || submitMutation.isPending}
                              className="w-10 h-10 self-end rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Existing reviews */}
                        {reviews.map(r => (
                          <div key={r.id} className="bg-secondary rounded-xl p-3 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-foreground">{r.reviewer_name || 'Guest'}</span>
                              <span className="flex gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={`w-3 h-3 ${s <= (r.rating||5) ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                                ))}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{r.content}</p>
                          </div>
                        ))}
                        {reviews.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-2">No reviews yet — be the first!</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky footer — only shown when cart is not hidden */}
            {!allActionsHidden && !isHidden('cart') && (
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
