import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const UNLOCK_PHRASE = 'hide user';
const ORDER_RECEIVER_PHRASE = '098';
const ICON_UNLOCK_PHRASE = 'cr';

export default function SearchOverlay({ open, onClose, dishes = [], onSelect, onUnlock, onIconUnlock }) {
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

  const filtered = (query.length > 0 && !isUnlockQuery && !isOrderReceiverQuery && !isIconUnlockQuery)
    ? dishes.filter(d =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        (d.short_description || '').toLowerCase().includes(query.toLowerCase())
      )
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
                  placeholder="Search dishes..."
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
              {filtered.map(dish => (
                <motion.button
                  key={dish.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => { onSelect?.(dish); onClose(); }}
                  className="w-full glass rounded-xl p-3 flex items-center gap-3 text-left hover:bg-secondary/50 transition-colors"
                >
                  {dish.image_url && (
                    <img src={dish.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
                  )}
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold truncate">{dish.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{dish.short_description}</p>
                  </div>
                </motion.button>
              ))}
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
