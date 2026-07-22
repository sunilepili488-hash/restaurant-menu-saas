import React from 'react';
import { motion } from 'framer-motion';
import {
  Store, LayoutGrid, UtensilsCrossed, Image, SlidersHorizontal,
  Bell, Palette, QrCode, CreditCard, Globe, Lock, LogOut, ChevronLeft, Server, Star, Database, Radio, Truck, KeyRound, ToggleLeft, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { id: 'branding', label: 'Branding', icon: Store },
  { id: 'categories', label: 'Categories', icon: LayoutGrid },
  { id: 'dishes', label: 'Dishes', icon: UtensilsCrossed },
  { id: 'top-dishes', label: 'Top Dishes', icon: Star },
  { id: 'banners', label: 'Banners', icon: Image },
  { id: 'filters', label: 'Filters', icon: SlidersHorizontal },
  { id: 'waiter', label: 'Waiter Call', icon: Bell },
  { id: 'orders', label: 'Order Routing', icon: Globe },
  { id: 'order-receiver', label: 'Order Receiver', icon: Radio },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'icon-controls', label: 'Icon Controls', icon: ToggleLeft },
  { id: 'scroll-effects', label: 'Scroll Effects', icon: Sparkles },
  { id: 'tables', label: 'Table QR', icon: QrCode },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'hosting', label: 'Hosting & Domain', icon: Server },
  { id: 'supabase', label: 'Supabase', icon: Database },
  { id: 'locks', label: 'Feature Locks', icon: Lock },
  { id: 'home-delivery', label: 'Home Delivery', icon: Truck },
  { id: 'pass', label: 'Pass', icon: KeyRound },
];

export default function AdminSidebar({ activeSection, onSelect, onLogout, collapsed, onToggle }) {
  const navigate = useNavigate();

  return (
    <aside className={`h-screen bg-card border-r border-border flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <h2 className="font-display text-lg font-semibold text-primary">Admin</h2>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggle}
          className="w-8 h-8 rounded-lg glass flex items-center justify-center"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-1 px-2">
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border space-y-1">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          <Globe className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">View Menu</span>}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </motion.button>
      </div>
    </aside>
  );
}
