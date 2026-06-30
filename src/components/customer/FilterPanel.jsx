import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

export default function FilterPanel({ open, onClose, onApply, restaurant }) {
  const [priceRange, setPriceRange] = useState([
    restaurant?.price_slider_min || 0,
    restaurant?.price_slider_max || 1500,
  ]);
  const [dietTags, setDietTags] = useState([]);
  const [prepFilter, setPrepFilter] = useState(null);
  const [sortBy, setSortBy] = useState(null);

  const dietaryTags = restaurant?.dietary_tags || ['Veg', 'Non-Veg', 'Vegan', 'Jain', 'Gluten-Free'];
  const prepFilters = restaurant?.prep_time_filters || ['Under 5 min', 'Under 10 min', 'Under 15 min', 'Under 30 min'];
  const sortOptions = ['Most Liked', 'Price: Low to High', 'Price: High to Low', 'Newly Added'];
  const curr = restaurant?.currency_symbol || '₹';

  const toggleDiet = (tag) => {
    setDietTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const reset = () => {
    setPriceRange([restaurant?.price_slider_min || 0, restaurant?.price_slider_max || 1500]);
    setDietTags([]);
    setPrepFilter(null);
    setSortBy(null);
  };

  const apply = () => {
    onApply({ priceRange, dietTags, prepFilter, sortBy });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-[56] w-full max-w-sm bg-background border-l border-border overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Filters</h2>
                <div className="flex items-center gap-2">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={reset} className="text-muted-foreground hover:text-foreground">
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Price Range</h3>
                <Slider
                  min={restaurant?.price_slider_min || 0}
                  max={restaurant?.price_slider_max || 1500}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{curr}{priceRange[0]}</span>
                  <span>{curr}{priceRange[1]}</span>
                </div>
              </div>

              {/* Dietary */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Dietary</h3>
                <div className="flex flex-wrap gap-2">
                  {dietaryTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={dietTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer transition-all"
                      onClick={() => toggleDiet(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Prep Time */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Prep Time</h3>
                <div className="flex flex-wrap gap-2">
                  {prepFilters.map(f => (
                    <Badge
                      key={f}
                      variant={prepFilter === f ? 'default' : 'outline'}
                      className="cursor-pointer transition-all"
                      onClick={() => setPrepFilter(prepFilter === f ? null : f)}
                    >
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Sort By</h3>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map(s => (
                    <Badge
                      key={s}
                      variant={sortBy === s ? 'default' : 'outline'}
                      className="cursor-pointer transition-all"
                      onClick={() => setSortBy(sortBy === s ? null : s)}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Apply */}
              <Button onClick={apply} className="w-full bg-primary text-primary-foreground font-medium">
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}