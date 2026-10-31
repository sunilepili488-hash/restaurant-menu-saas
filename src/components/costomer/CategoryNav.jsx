import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';

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
    <div
      id="category-nav"
      className="menu-category-nav sticky z-40 border-y"
      style={{
        top: 'calc(var(--header-h, 64px) + 1px)',
        boxShadow: '0 -1px 0 hsl(var(--background))',
      }}
    >
      <div className="flex items-center gap-2 px-2 py-2.5 max-w-7xl mx-auto">
        {/* Overflow / all-categories button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setModalOpen(true)}
          className="category-overflow-button flex-shrink-0 self-center rounded-full flex items-center justify-center"
          title="Show all categories"
          aria-label="Show all categories"
        >
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--theme-action-color)' }} />
        </motion.button>

        {/* Scrollable pill row */}
        <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto hide-scrollbar flex-1">
          {allCategories.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                ref={isActive ? activeRef : null}
                onClick={() => onSelect(cat.id)}
                className="relative flex-shrink-0"
              >
                <span className={`category-pill block ${isActive ? 'is-active' : ''}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* All-categories center modal */}
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
              className="rounded-2xl p-5 w-full max-w-sm max-h-[70vh] overflow-y-auto shadow-2xl border"
              style={{
                background: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>
                  All Categories
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--theme-soft-surface)', color: 'var(--theme-text)' }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {allCategories.map(cat => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => { onSelect(cat.id); setModalOpen(false); }}
                      className="px-3 py-2.5 rounded-xl text-sm font-medium text-center transition-all"
                      style={isActive ? {
                        background: 'var(--theme-action-color)',
                        color: '#FFFFFF',
                        boxShadow: 'var(--theme-button-shadow)',
                      } : {
                        background: 'var(--theme-soft-surface)',
                        color: 'var(--theme-text)',
                      }}
                    >
                      {cat.name}
                    </motion.button>
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
