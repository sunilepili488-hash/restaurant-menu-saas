import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { entities } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ReviewSheet({ dish, open, onClose }) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', dish?.id],
    queryFn: () => entities.Review.filter({ dish_id: dish?.id }, '-created_at', 50),
    enabled: !!dish?.id && open,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', dish?.id] });
      setContent('');
      setName('');
      setRating(5);
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    submitMutation.mutate({
      dish_id: dish.id,
      reviewer_name: name || 'Guest',
      content,
      rating,
    });
  };

  return (
    <AnimatePresence>
      {open && dish && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[61] bg-background rounded-t-3xl max-h-[80vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold">Reviews</h3>
                  <p className="text-xs text-muted-foreground">{dish.name}</p>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Review list */}
              <div className="space-y-3 mb-6 max-h-[35vh] overflow-y-auto">
                {reviews.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>
                )}
                {reviews.map(r => (
                  <div key={r.id} className="glass rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{r.reviewer_name}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.content}</p>
                  </div>
                ))}
              </div>

              {/* Submit form */}
              <div className="space-y-3 border-t border-border pt-4">
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="bg-secondary border-border/50"
                />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setRating(s)}>
                      <Star className={`w-5 h-5 transition-colors ${s <= rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write your review..."
                    className="flex-1 bg-secondary border-border/50 min-h-[60px]"
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || submitMutation.isPending}
                    className="bg-primary text-primary-foreground self-end"
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
