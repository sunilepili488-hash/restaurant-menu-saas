import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminLoginDialog({ open, onClose, restaurant, onLogin }) {
  const [step, setStep] = useState('alert'); // 'alert' | 'login'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // If already authenticated via localStorage, skip dialog entirely
  useEffect(() => {
    if (open && localStorage.getItem('menu_admin') === 'true') {
      onLogin?.();
      handleClose();
    }
  }, [open]);

  const handleClose = () => {
    setStep('alert');
    setUsername('');
    setPassword('');
    setError('');
    onClose();
  };

  const handleLogin = () => {
    const adminUser = restaurant?.admin_username || 'admin';
    const adminPass = restaurant?.admin_password || 'admin123';
    if (username === adminUser && password === adminPass) {
      localStorage.setItem('menu_admin', 'true');
      onLogin();
      handleClose();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-background rounded-2xl border border-border p-5 sm:p-6 pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {step === 'alert' ? (
                <div className="space-y-5">
                  {/* Arrow icon at top */}
                  <div className="flex justify-end">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setStep('login')}
                      className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                      title="Owner Login"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Alert icon */}
                  <div className="flex justify-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShieldAlert className="w-7 h-7 text-primary" />
                    </div>
                  </div>

                  {/* Alert message */}
                  <div className="text-center space-y-2">
                    <h3 className="font-display text-lg font-semibold">Owner Access Only</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This section is for the restaurant owner only. If you are a customer, this area is not for you.
                    </p>
                  </div>

                  {/* Dismiss button at bottom */}
                  <Button onClick={handleClose} variant="outline" className="w-full">
                    Go Back to Menu
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-display text-lg font-semibold">Owner Login</h3>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={handleClose}>
                      <X className="w-5 h-5 text-muted-foreground" />
                    </motion.button>
                  </div>
                  <div className="w-12 h-12 mx-auto rounded-full glass flex items-center justify-center mb-2">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  {/* No <form> tag — prevents browser security warnings about unsecured login */}
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="bg-secondary"
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore="true"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-secondary"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    autoComplete="new-password"
                    data-1p-ignore
                    data-lpignore="true"
                  />
                  {error && <p className="text-xs text-destructive">{error}</p>}
                  <div onClick={handleLogin} className="w-full">
                    <Button className="w-full bg-primary text-primary-foreground pointer-events-none">
                      Login
                    </Button>
                  </div>
                  <button
                    onClick={() => setStep('alert')}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
