import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';

// Change 4: border removed (dish cards keep their own border).
// Change 6 (v2): chevron next to "All" now opens a CENTER modal card
// listing every category in a clean grid — instead of expanding inline.
export default function CategoryNav({ categories = [], activeCategory, onSelect }) {
  const scrollRef = useRef(null);
  const activeRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    <div className="sticky top-[60px] md:top-[64px] z-40 glass">
      <div className="flex items-center gap-2 px-4 py-3 max-w-7xl mx-auto">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setModalOpen(true)}
          className="flex-shrink-0 w-7 h-7 rounded-full glass flex items-center justify-center"
          title="Show all categories"
          aria-label="Show all categories"
        >
          <ChevronDown className="w-4 h-4 text-primary" />
        </motion.button>

        <div ref={scrollRef} className="flex gap-2 overflow-x-auto hide-scrollbar flex-1">
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
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="category-pill"
                    className="absolute inset-0 bg-primary rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Change 3 (waiter/toast speed applies here too): fast, snappy modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="bg-background rounded-2xl p-5 w-full max-w-sm max-h-[70vh] overflow-y-auto shadow-2xl border border-border"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold">All Categories</h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-foreground" />
                </motion.button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {allCategories.map(cat => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { onSelect(cat.id); setModalOpen(false); }}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium text-center transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'glass text-foreground hover:bg-secondary/60'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
