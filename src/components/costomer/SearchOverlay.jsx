import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, KeyRound, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { menuStore, useMenuStore } from '@/lib/menuStore';

const UNLOCK_PHRASE = 'hide user';
const ORDER_RECEIVER_PHRASE = '098';
const ICON_UNLOCK_PHRASE = 'cr';

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Chhoti spelling galti pakadne ke liye (jaise "chiken" -> "chicken")
function withinTypo(a, b) {
  const max = a.length >= 7 ? 2 : a.length >= 4 ? 1 : 0;
  if (!max || Math.abs(a.length - b.length) > max) return false;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length] <= max;
}

function searchDishes(dishes, categories, rawQuery) {
  let q = norm(rawQuery);
  if (!q) return [];

  // veg / non veg samajhna
  let diet = null;
  if (/\bnon ?veg(etarian)?\b/.test(q)) {
    diet = 'nonveg';
    q = q.replace(/\bnon ?veg(etarian)?\b/g, ' ');
  } else if (/\bveg(etarian)?\b/.test(q)) {
    diet = 'veg';
    q = q.replace(/\bveg(etarian)?\b/g, ' ');
  }
  const tokens = q.split(' ').filter(Boolean);

  const catName = {};
  categories.forEach(c => { catName[c.id] = norm(c.name); });

  const results = [];
  dishes.forEach(d => {
    if (diet === 'veg' && !d.is_veg) return;
    if (diet === 'nonveg' && d.is_veg) return;

    // sirf "veg" / "non veg" likha ho to us diet ki saari dishes dikhao
    if (tokens.length === 0) {
      results.push({ d, score: 1 });
      return;
    }

    const name = norm(d.name);
    const nameWords = name.split(' ');
    const cat = catName[d.category_id] || '';
    const tags = norm(Array.isArray(d.dietary_tags) ? d.dietary_tags.join(' ') : d.dietary_tags);
    const desc = norm(`${d.short_description || ''} ${d.long_description || ''}`);

    let score = 0;
    for (const t of tokens) {
      let s = 0;
      if (nameWords.some(w => w.startsWith(t))) s = 100;
      else if (name.includes(t)) s = 80;
      else if (cat.includes(t)) s = 60;
      else if (tags.includes(t)) s = 50;
      else if (desc.includes(t)) s = 30;
      else if (
        nameWords.some(w => withinTypo(t, w)) ||
        cat.split(' ').some(w => withinTypo(t, w))
      ) s = 20;
      if (!s) return; // har word kisi na kisi jagah milna chahiye
      score += s;
    }
    results.push({ d, score });
  });

  return results.sort((a, b) => b.score - a.score).map(r => r.d);
}

export default function SearchOverlay({
  open,
  onClose,
  dishes = [],
  categories = [],
  onSelect,
  onUnlock,
  onIconUnlock,
}) {
  const store = useMenuStore();
  const [query, setQuery] = useState('');
  const [iconDialogOpen, setIconDialogOpen] = useState(false);
  const [iconPassword, setIconPassword] = useState('');
  const [iconError, setIconError] = useState('');
  const inputRef = useRef(null);
  const iconPwdRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setIconDialogOpen(false);
      setIconPassword('');
      setIconError('');
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    if (iconDialogOpen && iconPwdRef.current) {
      setTimeout(() => iconPwdRef.current?.focus(), 150);
    }
  }, [iconDialogOpen]);

  const isUnlockQuery = query.trim().toLowerCase() === UNLOCK_PHRASE;
  const isOrderReceiverQuery = query.trim() === ORDER_RECEIVER_PHRASE;
  const isIconUnlockQuery = query.trim().toLowerCase() === ICON_UNLOCK_PHRASE;

  const filtered =
    query.length > 0 && !isUnlockQuery && !isOrderReceiverQuery && !isIconUnlockQuery
      ? searchDishes(dishes, categories, query)
      : [];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (isUnlockQuery) {
        onUnlock?.();
        setQuery('');
        onClose();
      } else if (isOrderReceiverQuery) {
        navigate('/order-receiver');
        setQuery('');
        onClose();
      } else if (isIconUnlockQuery) {
        setIconDialogOpen(true);
        setQuery('');
      }
    }
  };

  const handleIconUnlock = () => {
    if (iconPassword === 'smya') {
      // Check max users limit
      const maxUsers = parseInt(localStorage.getItem('icon_max_users') || '3', 10);
      const currentCount = parseInt(localStorage.getItem('icon_usage_count') || '0', 10);

      if (currentCount >= maxUsers) {
        setIconError('Max user limit reached. Contact admin to revoke.');
        return;
      }

      localStorage.setItem('icon_unlocked', 'true');
      localStorage.setItem('icon_unlocked_at', new Date().toISOString());
      localStorage.setItem('icon_usage_count', String(currentCount + 1));

      onIconUnlock?.();
      setIconDialogOpen(false);
      setIconPassword('');
      setIconError('');
      onClose();
    } else {
      setIconError('Incorrect password');
    }
  };

  const handleIconKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleIconUnlock();
    } else if (e.key === 'Escape') {
      setIconDialogOpen(false);
      setIconPassword('');
      setIconError('');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] bg-background/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="max-w-lg mx-auto px-4 pt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search dishes, veg, non veg, category..."
                  className="pl-10 bg-secondary border-border/50 font-body"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full glass flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {filtered.map(dish => {
                const isFav = store.favorites.includes(dish.id);
                return (
                  <motion.div
                    key={dish.id}
                    role="button"
                    tabIndex={0}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => { onSelect?.(dish); onClose(); }}
                    className="w-full glass rounded-xl p-3 flex items-center gap-3 text-left hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    {dish.image_url && (
                      <img
                        src={dish.image_url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-semibold truncate">{dish.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{dish.short_description}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => { e.stopPropagation(); menuStore.toggleFavorite(dish.id); }}
                      className="w-9 h-9 rounded-xl glass border border-black dark:border-white/60 flex items-center justify-center flex-shrink-0"
                      aria-label="Add to favorites"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isFav ? 'text-rose-500 fill-rose-500' : 'text-muted-foreground'
                        }`}
                      />
                    </motion.button>
                  </motion.div>
                );
              })}
              {query && !isUnlockQuery && !isIconUnlockQuery && filtered.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No dishes found</p>
              )}
            </div>
          </div>

          {/* Icon Unlock Dialog */}
          <AnimatePresence>
            {iconDialogOpen && (
              <motion.div
                className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-card border border-border rounded-2xl p-6 w-80 shadow-2xl space-y-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <KeyRound className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-semibold">Icon Access</h3>
                      <p className="text-xs text-muted-foreground">Enter password to unlock</p>
                    </div>
                  </div>
                  <Input
                    ref={iconPwdRef}
                    type="password"
                    value={iconPassword}
                    onChange={e => { setIconPassword(e.target.value); setIconError(''); }}
                    onKeyDown={handleIconKeyDown}
                    placeholder="Password"
                    className="bg-secondary"
                  />
                  {iconError && (
                    <p className="text-xs text-destructive">{iconError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setIconDialogOpen(false);
                        setIconPassword('');
                        setIconError('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-primary text-primary-foreground"
                      onClick={handleIconUnlock}
                    >
                      Unlock
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
