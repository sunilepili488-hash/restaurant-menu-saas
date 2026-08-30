import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// Change 4: border removed from this bar (dish cards keep their own border).
// Change 6: chevron button next to "All" — tap to expand ALL categories into
// a wrapped grid (useful when there are 20-40 categories), tap again to
// collapse back to the normal horizontal-scroll strip.
export default function CategoryNav({ categories = [], activeCategory, onSelect }) {
  const scrollRef = useRef(null);
  const activeRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded) return;
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left, behavior: 'smooth' });
    }
  }, [activeCategory, expanded]);

  const allCategories = [{ id: 'all', name: 'All' }, ...categories];

  const Pill = ({ cat, refProp }) => {
    const isActive = activeCategory === cat.id;
    return (
      <button
        ref={refProp}
        onClick={() => { onSelect(cat.id); setExpanded(false); }}
        className="relative flex-shrink-0"
      >
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 block whitespace-nowrap ${
            isActive
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {cat.name}
        </span>
        {isActive && (
          <motion.div
            layoutId="category-pill"
            className="absolute inset-0 bg-primary rounded-full -z-10"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </button>
    );
  };

  return (
    <div className="sticky top-[60px] md:top-[64px] z-40 glass">
      <div className="flex items-center gap-2 px-4 py-3 max-w-7xl mx-auto">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setExpanded(prev => !prev)}
          className="flex-shrink-0 w-7 h-7 rounded-full glass flex items-center justify-center"
          title={expanded ? 'Collapse categories' : 'Show all categories'}
          aria-label="Toggle all categories"
        >
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-primary" />
          </motion.span>
        </motion.button>

        {!expanded && (
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto hide-scrollbar flex-1"
          >
            {allCategories.map(cat => (
              <Pill key={cat.id} cat={cat} refProp={activeCategory === cat.id ? activeRef : null} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 px-4 pb-4 max-w-7xl mx-auto">
              {allCategories.map(cat => (
                <Pill key={cat.id} cat={cat} refProp={null} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
