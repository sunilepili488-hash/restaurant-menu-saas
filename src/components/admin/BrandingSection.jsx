import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';
import { supabase } from '@/api/supabaseClient';
import { Save, Upload, Loader2, Check, Lock, Unlock } from 'lucide-react';

export default function BrandingSection({ restaurant, onRefresh }) {
  const [form, setForm] = useState({
    name: '', logo_url: '', welcome_message: '', operating_hours: '',
    admin_username: '', admin_password: '', hide_user_icon: false, splash_custom_code: '',
    animated_header: false, book_open_animation: false, delivery_help_phone: '',
    is_open: true, closed_message: 'Restaurant is currently closed. Please visit us again soon!',
    open_password: '000', splash_book_animation: false,
  
  });
  const { saving, saved, error, save } = useSafeSave();
  const [uploading, setUploading] = useState(false);
  const [nameLocked, setNameLocked] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pwInput, setPwInput] = useState('');

  useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name || '',
        logo_url: restaurant.logo_url || '',
        welcome_message: restaurant.welcome_message || '',
        operating_hours: restaurant.operating_hours || '',
        admin_username: restaurant.admin_username || 'admin',
        admin_password: restaurant.admin_password || 'admin123',
        hide_user_icon: restaurant.hide_user_icon || false,
        splash_custom_code: restaurant.splash_custom_code || '',
        animated_header: restaurant.animated_header || false,
        book_open_animation: restaurant.book_open_animation || false,
        delivery_help_phone: restaurant.delivery_help_phone || '',
        is_open: restaurant.is_open !== undefined ? restaurant.is_open : true,
        closed_message: restaurant.closed_message || 'Restaurant is currently closed. Please visit us again soon!',
        open_password: restaurant.open_password || '000',
        splash_book_animation: restaurant.splash_book_animation || false,
      
      });
    }
  }, [restaurant]);

  const handleSave = () => {
    if (!restaurant?.id) {
      // Reuse error from useSafeSave pattern — set it manually
      return;
    }
    save(entities.Restaurant.update(restaurant.id, form), () => {
      setNameLocked(true);
      onRefresh();
    });
  };

  const handleSaveStatus = async (isOpen) => {
    if (!restaurant?.id) return;
    await entities.Restaurant.update(restaurant.id, { is_open: isOpen, closed_message: form.closed_message });
    onRefresh?.();
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) { console.warn('[AuraMenu] Cannot upload — Supabase not connected'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('restaurant-assets')
        .upload(fileName, file, { upsert: true, contentType: file.type });
      if (error) { console.error(error); setUploading(false); return; }
      const { data } = supabase.storage.from('restaurant-assets').getPublicUrl(fileName);
      setForm(f => ({ ...f, logo_url: data.publicUrl }));
    } catch (err) {
      console.error('Logo upload failed:', err);
    }
    setUploading(false);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Branding and Settings</h2>

      {/* Change 8: Open/Closed Toggle */}
      <div className="p-4 rounded-2xl border-2 border-border mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">Restaurant Status</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {form.is_open ? 'Open — customers can view the menu' : 'Closed — menu is hidden'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={form.is_open ? 'default' : 'outline'}
            size="sm"
            onClick={() => { set('is_open', true); handleSaveStatus(true); }}
            className={form.is_open ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
          >
            Open
          </Button>
          <Button
            variant={!form.is_open ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => { set('is_open', false); handleSaveStatus(false); }}
          >
            Closed
          </Button>
        </div>
      </div>

      {/* Closed message editor — only show when closed */}
      {!form.is_open && (
        <div className="mb-4 space-y-3">
          <div>
            <Label>Closed Message (shown to customers)</Label>
            <Textarea
              value={form.closed_message}
              onChange={e => set('closed_message', e.target.value)}
              className="mt-1 bg-secondary"
              rows={3}
              placeholder="Restaurant is currently closed..."
            />
          </div>
          <div>
            <Label>Secret Open Password</Label>
            <p className="text-xs text-muted-foreground mb-1">
              This password unlocks the restaurant from the closed screen (default: 000)
            </p>
            <Input
              type="text"
              value={form.open_password}
              onChange={e => set('open_password', e.target.value)}
              className="mt-1 bg-secondary font-mono tracking-widest"
              placeholder="000"
              maxLength={20}
            />
          </div>
        </div>
      )}

      {/* Change 5: Password dialog for name unlock */}
      {showPasswordDialog && (
        <Dialog open onOpenChange={() => setShowPasswordDialog(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Password to Edit Name</DialogTitle>
            </DialogHeader>
            <Input
              type="password"
              value={pwInput}
              onChange={e => setPwInput(e.target.value)}
              placeholder="Password"
              className="mt-2"
              autoFocus
            />
            <Button
              onClick={() => {
                if (pwInput === '#9#s') {
                  setNameLocked(false);
                  setShowPasswordDialog(false);
                  setPwInput('');
                } else {
                  alert('Wrong password');
                }
              }}
              className="mt-2"
            >
              Unlock
            </Button>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Restaurant Name</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className="bg-secondary flex-1"
                disabled={nameLocked}
              />
              <button
                onClick={() => nameLocked ? setShowPasswordDialog(true) : setNameLocked(true)}
                className="p-2 rounded-lg bg-secondary hover:bg-accent"
                title={nameLocked ? "Click to unlock" : "Click to lock"}
              >
                {nameLocked ? <Lock className="w-4 h-4 text-muted-foreground" /> : <Unlock className="w-4 h-4 text-green-500" />}
              </button>
            </div>
          </div>
          <div>
            <Label>Logo</Label>
            <div className="mt-1 flex items-center gap-3">
              {form.logo_url && (
                <img src={form.logo_url} alt="" className="w-12 h-12 rounded-lg object-contain bg-secondary" />
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm hover:bg-secondary/80 transition-colors">
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload</>}
                </span>
              </label>
            </div>
          </div>
          <div>
            <Label>Welcome Message</Label>
            <Input value={form.welcome_message} onChange={e => set('welcome_message', e.target.value)} className="mt-1 bg-secondary" />
          </div>
          <div>
            <Label>Operating Hours</Label>
            <Input value={form.operating_hours} onChange={e => set('operating_hours', e.target.value)} placeholder="Mon-Sun 11 AM - 11 PM" className="mt-1 bg-secondary" />
          </div>
          <div>
            <Label>Delivery Help Phone</Label>
            <Input value={form.delivery_help_phone} onChange={e => set('delivery_help_phone', e.target.value)} placeholder="+91 98765 43210" className="mt-1 bg-secondary" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Admin Username</Label>
            <Input value={form.admin_username} onChange={e => set('admin_username', e.target.value)} className="mt-1 bg-secondary" />
          </div>
          <div>
            <Label>Admin Password</Label>
            <Input type="password" value={form.admin_password} onChange={e => set('admin_password', e.target.value)} className="mt-1 bg-secondary" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
            <div>
              <p className="text-sm font-medium">Hide User Icon</p>
              <p className="text-xs text-muted-foreground">Hides admin access from customers</p>
            </div>
            <Switch checked={form.hide_user_icon} onCheckedChange={v => set('hide_user_icon', v)} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
            <div>
              <Label>Animated Header (Logo ↔ Hours)</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cycles between logo and operating hours display
              </p>
            </div>
            <Switch
              checked={form.animated_header || false}
              onCheckedChange={v => set('animated_header', v)}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
            <div>
              <Label>Book Opening Splash Transition</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Splash screen "opens like a book" to reveal the menu (OFF = simple fade)
              </p>
            </div>
            <Switch
              checked={form.book_open_animation || false}
              onCheckedChange={v => set('book_open_animation', v)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
        <div>
          <p className="text-sm font-medium">Book-Style Splash Animation</p>
          <p className="text-xs text-muted-foreground">After the splash timer ends, the screen opens like a book cover to reveal the menu, instead of a plain fade</p>
        </div>
        <Switch checked={form.splash_book_animation} onCheckedChange={v => set('splash_book_animation', v)} />
      </div>

      <div>
        <Label>Splash Screen Custom Code</Label>
        <Textarea
          value={form.splash_custom_code}
          onChange={e => set('splash_custom_code', e.target.value)}
          className="mt-1 bg-secondary font-mono text-xs min-h-[150px]"
          placeholder="Custom HTML/CSS/JS for splash animation"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={saving || !restaurant?.id}
        className={saved ? 'bg-green-600 hover:bg-green-600 text-white gap-2' : 'gap-2 bg-primary text-primary-foreground'}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        <span>{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}</span>
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
