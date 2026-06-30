import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CategoryNav({ categories = [], activeCategory, onSelect }) {
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left, behavior: 'smooth' });
    }
  }, [activeCategory]);

  const allCategories = [{ id: 'all', name: 'All' }, ...categories];

  return (
    <div className="sticky top-[60px] md:top-[64px] z-40 glass border-b border-primary/10">
      <div
        ref={scrollRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar max-w-7xl mx-auto"
      >
        {allCategories.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              ref={isActive ? activeRef : null}
              onClick={() => onSelect(cat.id)}
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
        })}
      </div>
    </div>
  );
}