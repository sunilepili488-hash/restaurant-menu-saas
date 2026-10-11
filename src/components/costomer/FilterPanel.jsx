import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, RotateCcw, Wallet, Salad, Timer, ArrowUpDown, Leaf, Drumstick, Sprout,
  Flower2, Wheat, Zap, Clock, ThumbsUp, ArrowUpNarrowWide, ArrowDownWideNarrow,
  Sparkles, Check, SlidersHorizontal, Tag,
} from 'lucide-react';

const THUMB = 26; // slider thumb size (px)

// Admin panel se option na mile to ye default use honge
const DEFAULT_DIET = ['Veg', 'Non-Veg', 'Vegan', 'Jain', 'Gluten-Free'];
const DEFAULT_PREP = ['Under 5 min', 'Under 10 min', 'Under 15 min', 'Under 30 min'];

const DIET_ICONS = {
  'veg': Leaf,
  'non-veg': Drumstick,
  'non veg': Drumstick,
  'vegan': Sprout,
  'jain': Flower2,
  'gluten-free': Wheat,
  'gluten free': Wheat,
};
const dietIcon = (label) => DIET_ICONS[String(label).toLowerCase()] || Tag;
const prepIcon = (label) => {
  const m = parseInt(String(label).match(/\d+/)?.[0] || '999', 10);
  return m <= 5 ? Zap : Clock;
};

const SORT_OPTIONS = [
  { label: 'Most Liked', hint: 'Customer favourites', icon: ThumbsUp },
  { label: 'Price: Low to High', hint: 'Budget friendly', icon: ArrowUpNarrowWide },
  { label: 'Price: High to Low', hint: 'Premium first', icon: ArrowDownWideNarrow },
  { label: 'Newly Added', hint: 'Fresh on the menu', icon: Sparkles },
];

const QUICK_PRICES = [
  { lo: 0, hi: 200, label: 'Under {c}200' },
  { lo: 200, hi: 500, label: '{c}200 – {c}500' },
  { lo: 500, hi: 1000, label: '{c}500 – {c}1000' },
  { lo: 1000, hi: null, label: '{c}1000+' },
];

const tap = () => { try { navigator.vibrate?.(8); } catch {} };

function Chip({ active, onClick, icon: Icon, children }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.93 }}
      onClick={() => { tap(); onClick(); }}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold border transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-[0_4px_14px_hsl(var(--primary)/0.35)]'
          : 'bg-card text-foreground border-black/70 dark:border-white/50 hover:bg-secondary'
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
      <AnimatePresence initial={false}>
        {active && (
          <motion.span
            initial={{ scale: 0, width: 0 }}
            animate={{ scale: 1, width: 14 }}
            exit={{ scale: 0, width: 0 }}
            className="overflow-hidden flex"
          >
            <Check className="w-3.5 h-3.5" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function Section({ index, icon: Icon, title, right, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 + index * 0.07, duration: 0.3, ease: 'easeOut' }}
      className="rounded-2xl border border-black/70 dark:border-white/50 bg-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </span>
          <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
        </div>
        {right}
      </div>
      {children}
    </motion.section>
  );
}

export default function FilterPanel({
  open,
  onClose,
  onApply,
  restaurant,
  dishes = [],
  maxPrice = 1500,
}) {
  const curr = restaurant?.currency_symbol || '₹';

  const [range, setRange] = useState([null, null]); // null = poori range
  const [diet, setDiet] = useState([]);
  const [prep, setPrep] = useState(null);
  const [sort, setSort] = useState(null);
  const [spin, setSpin] = useState(0);

  const dietaryTags = restaurant?.dietary_tags?.length ? restaurant.dietary_tags : DEFAULT_DIET;
  const prepFilters = restaurant?.prep_time_filters?.length ? restaurant.prep_time_filters : DEFAULT_PREP;

  // Slider limits: admin ki setting pehle, nahi to dishes ke hisaab se
  const absMin = Number(restaurant?.price_slider_min) || 0;
  const absMax = useMemo(() => {
    const fromAdmin = Number(restaurant?.price_slider_max);
    if (fromAdmin > absMin) return fromAdmin;
    if (dishes?.length) {
      const m = Math.max(0, ...dishes.map(d => d.sale_price || d.regular_price || 0));
      if (m > 0) return Math.max(absMin + 100, Math.ceil(m / 50) * 50);
    }
    return Math.max(absMin + 100, maxPrice);
  }, [restaurant?.price_slider_max, absMin, dishes, maxPrice]);

  const step = absMax - absMin >= 500 ? 10 : 5;
  const maxVal = range[1] == null ? absMax : Math.min(range[1], absMax);
  const minVal = Math.min(range[0] == null ? absMin : Math.max(range[0], absMin), maxVal - step);
  const priceChanged = minVal > absMin || maxVal < absMax;

  const activeCount = (priceChanged ? 1 : 0) + diet.length + (prep ? 1 : 0) + (sort ? 1 : 0);

  // Escape se band
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const setMin = (v) => {
    const n = Math.min(Number(v), maxVal - step);
    setRange([n <= absMin ? null : n, range[1]]);
  };
  const setMax = (v) => {
    const n = Math.max(Number(v), minVal + step);
    setRange([range[0], n >= absMax ? null : n]);
  };

  const toggleDiet = (label) =>
    setDiet(prev => (prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]));

  // Live count: kitni dishes match karengi
  const matchCount = useMemo(() => {
    if (!dishes?.length) return null;
    const mins = prep ? parseInt(prep.match(/\d+/)?.[0] || '999', 10) : null;
    return dishes.filter(d => {
      const price = d.sale_price || d.regular_price || 0;
      if (priceChanged && (price < minVal || price > maxVal)) return false;
      if (diet.length) {
        const ok =
          (diet.includes('Veg') && d.is_veg) ||
          (diet.includes('Non-Veg') && !d.is_veg) ||
          (d.dietary_tags && diet.some(t => d.dietary_tags.includes(t)));
        if (!ok) return false;
      }
      if (mins != null) {
        if (!d.prep_time_value) return false;
        let inMin = d.prep_time_value;
        if (d.prep_time_unit === 'sec') inMin = d.prep_time_value / 60;
        if (d.prep_time_unit === 'hr') inMin = d.prep_time_value * 60;
        if (inMin > mins) return false;
      }
      return true;
    }).length;
  }, [dishes, priceChanged, minVal, maxVal, diet, prep]);

  const handleApply = () => {
    const f = {};
    if (priceChanged) f.priceRange = [minVal, range[1] == null ? 1e9 : maxVal];
    if (diet.length) f.dietTags = diet;
    if (prep) f.prepFilter = prep;
    if (sort) f.sortBy = sort;
    onApply?.(Object.keys(f).length ? f : null);
    onClose?.();
  };

  const handleReset = () => {
    setRange([null, null]);
    setDiet([]);
    setPrep(null);
    setSort(null);
    setSpin(s => s + 1);
    onApply?.(null);
  };

  const span = absMax - absMin;
  const pctMin = ((minVal - absMin) / span) * 100;
  const pctMax = ((maxVal - absMin) / span) * 100;
  const center = (p) => `calc(${p}% + ${(0.5 - p / 100) * THUMB}px)`;

  // Active filters ki chhoti list (hata sakte hain)
  const activeChips = [
    priceChanged && {
      key: 'price',
      label: `${curr}${minVal} – ${curr}${maxVal}${range[1] == null ? '+' : ''}`,
      clear: () => setRange([null, null]),
    },
    ...diet.map(d => ({ key: `d-${d}`, label: d, clear: () => toggleDiet(d) })),
    prep && { key: 'prep', label: prep, clear: () => setPrep(null) },
    sort && { key: 'sort', label: sort, clear: () => setSort(null) },
  ].filter(Boolean);

  return (
    <AnimatePresence>
      {open && (
        <>
          <style>{`
            .pf-range{position:absolute;left:0;top:0;width:100%;height:${THUMB}px;margin:0;background:transparent;pointer-events:none;-webkit-appearance:none;appearance:none;outline:none}
            .pf-range::-webkit-slider-runnable-track{background:transparent;height:${THUMB}px}
            .pf-range::-moz-range-track{background:transparent;height:${THUMB}px}
            .pf-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;pointer-events:auto;width:${THUMB}px;height:${THUMB}px;border-radius:9999px;background:hsl(var(--background));border:3px solid hsl(var(--primary));box-shadow:0 3px 10px hsl(var(--primary)/0.45);cursor:grab;transition:transform .15s}
            .pf-range::-moz-range-thumb{pointer-events:auto;width:${THUMB - 6}px;height:${THUMB - 6}px;border-radius:9999px;background:hsl(var(--background));border:3px solid hsl(var(--primary));box-shadow:0 3px 10px hsl(var(--primary)/0.45);cursor:grab}
            .pf-range:active::-webkit-slider-thumb{transform:scale(1.18);cursor:grabbing}
            .pf-range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 5px hsl(var(--primary)/0.25)}
            .pf-scroll::-webkit-scrollbar{display:none}
          `}</style>

          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[75] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed inset-y-0 right-0 z-[76] w-full max-w-sm bg-background flex flex-col rounded-l-3xl border-l border-black/70 dark:border-white/50 shadow-2xl overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
          >
            {/* Header */}
            <div
              className="relative px-4 pt-5 pb-4 border-b border-black/70 dark:border-white/50"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.14), transparent 70%)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-[0_6px_16px_hsl(var(--primary)/0.4)]">
                    <SlidersHorizontal className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-semibold leading-none text-foreground">Filters</h2>
                    <p className="text-[11px] text-muted-foreground mt-1">Apni pasand ki dish dhundo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { tap(); handleReset(); }}
                    aria-label="Reset filters"
                    className="w-10 h-10 rounded-xl glass border border-black dark:border-white/60 flex items-center justify-center"
                  >
                    <motion.span animate={{ rotate: -360 * spin }} transition={{ duration: 0.5 }} className="flex">
                      <RotateCcw className="w-4 h-4 text-foreground/80" />
                    </motion.span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    aria-label="Close filters"
                    className="w-10 h-10 rounded-xl glass border border-black dark:border-white/60 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-foreground/80" />
                  </motion.button>
                </div>
              </div>

              {/* Active filters */}
              <AnimatePresence initial={false}>
                {activeChips.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-1.5 pt-3">
                      <AnimatePresence initial={false}>
                        {activeChips.map(c => (
                          <motion.button
                            key={c.key}
                            type="button"
                            layout
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            onClick={c.clear}
                            className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-primary/12 text-primary text-[11px] font-semibold border border-primary/30"
                            style={{ background: 'hsl(var(--primary) / 0.12)' }}
                          >
                            {c.label}
                            <X className="w-3 h-3" />
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Body */}
            <div className="pf-scroll flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'none' }}>
              {/* Price */}
              <Section
                index={0}
                icon={Wallet}
                title="Price Range"
                right={
                  priceChanged ? (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setRange([null, null])}
                      className="text-[11px] font-semibold text-primary underline underline-offset-2"
                    >
                      Clear
                    </motion.button>
                  ) : null
                }
              >
                <div className="relative h-[26px] mt-10 mb-1 select-none">
                  {/* track */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2.5 rounded-full bg-secondary border border-black/25 dark:border-white/25" />
                  {/* fill */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-2.5 rounded-full"
                    style={{
                      left: center(pctMin),
                      width: `calc(${pctMax - pctMin}% - ${((pctMax - pctMin) / 100) * THUMB}px)`,
                      background: 'linear-gradient(90deg, hsl(var(--primary) / 0.55), hsl(var(--primary)))',
                    }}
                  />
                  {/* bubbles */}
                  {[
                    { v: minVal, p: pctMin },
                    { v: maxVal, p: pctMax, plus: range[1] == null },
                  ].map((b, i) => (
                    <div
                      key={i}
                      className="absolute pointer-events-none"
                      style={{ left: center(b.p), top: -34, transform: 'translateX(-50%)' }}
                    >
                      <div className="relative px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold whitespace-nowrap shadow-md tabular-nums">
                        {curr}{b.v.toLocaleString()}{b.plus ? '+' : ''}
                        <span className="absolute left-1/2 -bottom-1 w-2 h-2 -translate-x-1/2 rotate-45 bg-primary" />
                      </div>
                    </div>
                  ))}
                  <input
                    type="range"
                    className="pf-range"
                    min={absMin}
                    max={absMax}
                    step={step}
                    value={minVal}
                    onChange={e => setMin(e.target.value)}
                    style={{ zIndex: minVal >= absMax - step * 3 ? 5 : 3 }}
                    aria-label="Minimum price"
                  />
                  <input
                    type="range"
                    className="pf-range"
                    min={absMin}
                    max={absMax}
                    step={step}
                    value={maxVal}
                    onChange={e => setMax(e.target.value)}
                    style={{ zIndex: 4 }}
                    aria-label="Maximum price"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground mt-2 tabular-nums">
                  <span>{curr}{absMin.toLocaleString()}</span>
                  <span>{curr}{absMax.toLocaleString()}</span>
                </div>

                {/* quick prices */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {QUICK_PRICES.filter(q => q.lo < absMax && (q.hi == null || q.hi > absMin)).map(q => {
                    const lo = Math.max(q.lo, absMin);
                    const hi = q.hi == null || q.hi >= absMax ? absMax : q.hi;
                    const active = minVal === lo && maxVal === hi;
                    return (
                      <Chip
                        key={q.label}
                        active={active}
                        onClick={() => setRange([lo <= absMin ? null : lo, hi >= absMax ? null : hi])}
                      >
                        {q.label.replace(/\{c\}/g, curr)}
                      </Chip>
                    );
                  })}
                </div>
              </Section>

              {/* Dietary */}
              <Section index={1} icon={Salad} title="Dietary">
                <div className="flex flex-wrap gap-2">
                  {dietaryTags.map(label => (
                    <Chip key={label} icon={dietIcon(label)} active={diet.includes(label)} onClick={() => toggleDiet(label)}>
                      {label}
                    </Chip>
                  ))}
                </div>
              </Section>

              {/* Prep time */}
              <Section index={2} icon={Timer} title="Prep Time">
                <div className="flex flex-wrap gap-2">
                  {prepFilters.map(label => (
                    <Chip
                      key={label}
                      icon={prepIcon(label)}
                      active={prep === label}
                      onClick={() => setPrep(prep === label ? null : label)}
                    >
                      {label}
                    </Chip>
                  ))}
                </div>
              </Section>

              {/* Sort */}
              <Section index={3} icon={ArrowUpDown} title="Sort By">
                <div className="grid grid-cols-2 gap-2">
                  {SORT_OPTIONS.map(o => {
                    const active = sort === o.label;
                    const Icon = o.icon;
                    return (
                      <motion.button
                        key={o.label}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { tap(); setSort(active ? null : o.label); }}
                        className={`relative text-left rounded-xl p-3 border transition-colors ${
                          active
                            ? 'border-primary bg-primary/10 shadow-[0_4px_14px_hsl(var(--primary)/0.25)]'
                            : 'border-black/70 dark:border-white/50 bg-card hover:bg-secondary'
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                            active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground/70'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <p className="text-[13px] font-semibold text-foreground leading-tight">{o.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{o.hint}</p>
                        <AnimatePresence>
                          {active && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                            >
                              <Check className="w-3 h-3" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              </Section>

              <div className="h-1" />
            </div>

            {/* Footer */}
            <div className="px-4 pt-3 pb-5 border-t border-black/70 dark:border-white/50 bg-background">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => { tap(); handleApply(); }}
                className="w-full py-3.5 rounded-xl text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_8px_22px_hsl(var(--primary)/0.4)]"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.78))' }}
              >
                {activeCount > 0 && (
                  <motion.span
                    key={activeCount}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-white/25 text-[11px] font-bold flex items-center justify-center"
                  >
                    {activeCount}
                  </motion.span>
                )}
                {matchCount == null ? (
                  'Apply Filters'
                ) : matchCount === 0 ? (
                  'No dishes match'
                ) : (
                  <span>
                    Show{' '}
                    <motion.span key={matchCount} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block tabular-nums">
                      {matchCount}
                    </motion.span>{' '}
                    {matchCount === 1 ? 'dish' : 'dishes'}
                  </span>
                )}
              </motion.button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
