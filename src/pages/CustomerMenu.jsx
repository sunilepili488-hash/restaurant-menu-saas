import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { entities } from '@/api/entities';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, List, Type, Check, Clock, X, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import SplashScreen from '@/components/costomer/SplashScreen';
import MenuHeader from '@/components/costomer/MenuHeader';
import BannerCarousel from '@/components/costomer/BannerCarousel';
import CategoryNav from '@/components/costomer/CategoryNav';
import DishCardGrid from '@/components/costomer/DishCardGrid';
import DishListRow from '@/components/costomer/DishListRow';
import DishTextRow from '@/components/costomer/DishTextRow';
import TopDishesCarousel from '@/components/costomer/TopDishesCarousel';
import SearchOverlay from '@/components/costomer/SearchOverlay';
import FilterPanel from '@/components/costomer/FilterPanel';
import BottomActionBar from '@/components/costomer/BottomActionBar';
import ReviewSheet from '@/components/costomer/ReviewSheet';
import CartPage from '@/components/costomer/CartPage';
import PaymentSheet from '@/components/costomer/PaymentSheet';
import AdminLoginDialog from '@/components/costomer/AdminLoginDialog';
import { useMenuStore, menuStore } from '@/lib/menuStore';
import { applyThemeToCss } from '@/lib/applyTheme';
import { supabase } from '@/api/supabaseClient';
import ConnectSupabase from '@/components/ConnectSupabase';

export default function CustomerMenu() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [showUnlockAlert, setShowUnlockAlert] = useState(false);
  const [orderToast, setOrderToast] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [reviewDish, setReviewDish] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartTab, setCartTab] = useState('orders');
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [filters, setFilters] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [liveOrderData, setLiveOrderData] = useState({});
  const [showOpenPrompt, setShowOpenPrompt] = useState(false);
  const [openPwInput, setOpenPwInput] = useState('');
  const [openPwError, setOpenPwError] = useState(false);
  // Change: professional progressive loading.
  // - INITIAL_BATCH renders immediately on mount — enough to fill a
  //   normal phone screen — so dishes are NEVER blank/waiting for a
  //   scroll gesture before they show up.
  // - NEXT_BATCH is the small chunk that loads in as the user nears the
  //   bottom, so it feels instant rather than a big visible "loading" jump.
  // - Once a dish is rendered it stays mounted (we only ever grow
  //   visibleCount), so scrolling back up never re-triggers a reload.
  const INITIAL_BATCH = 10;
  const NEXT_BATCH = 6;
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const store = useMenuStore();
  const queryClient = useQueryClient();

  // Generate or retrieve customer_session_id
  useEffect(() => {
    let sid = localStorage.getItem('customer_session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('customer_session_id', sid);
    }
  }, []);

  // Detect table number from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get('table');
    if (table) menuStore.setTableNumber(table);
  }, []);

  // Data queries with polling for real-time sync
  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurant'],
    queryFn: () => entities.Restaurant.list(),
    refetchInterval: 7000,
    refetchIntervalInBackground: true,
  });
  const restaurant = restaurants[0];

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => entities.Category.filter({ is_active: true }, 'sort_order', 100),
    refetchInterval: 7000,
    refetchIntervalInBackground: true,
  });

  const { data: dishes = [] } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => entities.Dish.filter({ is_active: true }, 'sort_order', 500),
    refetchInterval: 7000,
    refetchIntervalInBackground: true,
  });

  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: () => entities.Banner.filter({ is_active: true }, 'sort_order', 20),
    refetchInterval: 7000,
    refetchIntervalInBackground: true,
  });

  // Customer Order History query
  const customerSessionId = localStorage.getItem('customer_session_id');
  const { data: orderHistory = [] } = useQuery({
    queryKey: ['order-history', customerSessionId],
    queryFn: () => entities.Order.filter({ customer_session_id: customerSessionId }, '-created_at', 50),
    enabled: !!customerSessionId && historyOpen,
    refetchInterval: 7000,
    refetchIntervalInBackground: true,
  });

  // Preload first 6 dish images
  useEffect(() => {
    if (dishes.length > 0) {
      dishes.slice(0, 6).forEach(dish => {
        if (dish.image_url) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = dish.image_url;
          document.head.appendChild(link);
        }
      });
    }
  }, [dishes]);

  // Supabase Realtime subscription for instant updates
  useEffect(() => {
    if (!supabase?.channel) return;
    try {
      const channel = supabase
        .channel('menu-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'dishes' }, () => {
          queryClient.invalidateQueries({ queryKey: ['dishes'] });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
          queryClient.invalidateQueries({ queryKey: ['reviews'] });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['order-history'] });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, () => {
          queryClient.invalidateQueries({ queryKey: ['restaurant'] });
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      // Realtime not available, fall back to polling
    }
  }, []);

  // Apply theme (CSS vars + dark/light mode)
  useEffect(() => {
    if (restaurant) applyThemeToCss(restaurant);
  }, [restaurant]);

  // Poll Supabase every 5s for live timer data on locked orders
  useEffect(() => {
    const lockedOrders = menuStore.getState().lockedOrders || [];
    if (!lockedOrders.length) return;

    const ids = lockedOrders.map(lo => lo.groupId).filter(Boolean);
    if (!ids.length) return;

    const fetchTimers = async () => {
      try {
        const results = await Promise.all(
          ids.map(id => entities.Order.get(id).catch(() => null))
        );
        const map = {};
        results.forEach(order => {
          if (order?.id) {
            map[order.id] = {
              timer_started_at: order.timer_started_at,
              prep_time_override: order.prep_time_override,
              delivery_time_minutes: order.delivery_time_minutes,
              status: order.status,
            };
          }
        });
        setLiveOrderData(map);
      } catch {}
    };

    fetchTimers();
    const interval = setInterval(fetchTimers, 5000);
    return () => clearInterval(interval);
  }, [store.lockedOrders?.length]);

  // Apply filters and sorting
  const filteredDishes = useMemo(() => {
    let result = [...dishes];

    if (activeCategory !== 'all') {
      result = result.filter(d => d.category_id === activeCategory);
    }

    if (filters) {
      if (filters.priceRange) {
        result = result.filter(d => {
          const price = d.sale_price || d.regular_price;
          return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        });
      }
      if (filters.dietTags?.length) {
        result = result.filter(d => {
          if (filters.dietTags.includes('Veg') && d.is_veg) return true;
          if (filters.dietTags.includes('Non-Veg') && !d.is_veg) return true;
          if (d.dietary_tags) {
            return filters.dietTags.some(t => d.dietary_tags.includes(t));
          }
          return false;
        });
      }
      if (filters.prepFilter) {
        const minutes = parseInt(filters.prepFilter.match(/\d+/)?.[0] || '999');
        result = result.filter(d => {
          if (!d.prep_time_value) return false;
          let inMinutes = d.prep_time_value;
          if (d.prep_time_unit === 'sec') inMinutes = d.prep_time_value / 60;
          if (d.prep_time_unit === 'hr') inMinutes = d.prep_time_value * 60;
          return inMinutes <= minutes;
        });
      }
      if (filters.sortBy === 'Most Liked') {
        result.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
      } else if (filters.sortBy === 'Price: Low to High') {
        result.sort((a, b) => (a.sale_price || a.regular_price) - (b.sale_price || b.regular_price));
      } else if (filters.sortBy === 'Price: High to Low') {
        result.sort((a, b) => (b.sale_price || b.regular_price) - (a.sale_price || a.regular_price));
      } else if (filters.sortBy === 'Newly Added') {
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    }

    // Change 10: default sort is by popularity — the most-ordered dish shows
    // first. Falls back to today's order count, then like count, if a dish
    // doesn't have a lifetime total yet.
    if (!filters?.sortBy) {
      result = [...result].sort((a, b) => {
        const aPop = a.total_ordered_count ?? a.ordered_today_count ?? 0;
        const bPop = b.total_ordered_count ?? b.ordered_today_count ?? 0;
        if (bPop !== aPop) return bPop - aPop;
        return (b.like_count || 0) - (a.like_count || 0);
      });
    }

    return result;
  }, [dishes, activeCategory, filters]);

  // Reset the visible batch whenever the customer changes category/filters/
  // view — so a fresh list starts from the top batch again.
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
  }, [activeCategory, filters, viewMode]);

  // Change: real window-scroll based pagination (rAF-throttled) instead of
  // an IntersectionObserver sentinel. The old sentinel approach depended on
  // the browser "seeing" an off-screen marker element intersect — which is
  // exactly why dishes only ever appeared AFTER the first manual scroll,
  // and why loading stalled after one batch. A plain scroll/resize listener
  // has no such dependency: it runs once immediately on mount (filling the
  // rest of the screen right away if needed) and again on every scroll, and
  // it naturally stops doing anything once every dish is already visible.
  useEffect(() => {
    let ticking = false;
    const checkAndLoadMore = () => {
      ticking = false;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const viewportH = window.innerHeight;
      const fullH = document.documentElement.scrollHeight;
      const distanceToBottom = fullH - (scrollY + viewportH);
      if (distanceToBottom < 800) {
        setVisibleCount(prev => (prev >= filteredDishes.length ? prev : Math.min(prev + NEXT_BATCH, filteredDishes.length)));
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(checkAndLoadMore);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    checkAndLoadMore();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [filteredDishes.length]);

  const visibleDishes = useMemo(
    () => filteredDishes.slice(0, visibleCount),
    [filteredDishes, visibleCount]
  );

  // Change 11 — REAL fix: previously this recomputed on EVERY dish poll
  // (every 7s), so the category order kept reshuffling while the customer
  // was browsing — that's what looked like a category "moving back to All".
  // Now the popularity order is computed ONCE and frozen in a ref; it only
  // changes if a genuinely new category shows up (which gets appended at
  // the end, never disturbing the existing order).
  const categoryOrderRef = React.useRef(null);
  const sortedCategories = useMemo(() => {
    if (!categoryOrderRef.current) {
      const popularity = {};
      dishes.forEach(d => {
        if (!d.category_id) return;
        const pop = d.total_ordered_count ?? d.ordered_today_count ?? 0;
        popularity[d.category_id] = (popularity[d.category_id] || 0) + pop;
      });
      categoryOrderRef.current = [...categories]
        .sort((a, b) => (popularity[b.id] || 0) - (popularity[a.id] || 0))
        .map(c => c.id);
    }
    const orderIndex = new Map(categoryOrderRef.current.map((id, i) => [id, i]));
    return [...categories].sort((a, b) => {
      const ai = orderIndex.has(a.id) ? orderIndex.get(a.id) : Infinity;
      const bi = orderIndex.has(b.id) ? orderIndex.get(b.id) : Infinity;
      return ai - bi;
    });
  }, [categories, dishes]);

  // Today's top dishes
  const topDishes = useMemo(() => {
    if (!restaurant?.top_dishes?.length) return [];
    return restaurant.top_dishes
      .map(id => dishes.find(d => d.id === id))
      .filter(Boolean);
  }, [restaurant?.top_dishes, dishes]);

  const handlePay = (amount) => {
    setPayAmount(amount);
    setPayOpen(true);
  };

  const handleUnlock = () => {
    setShowUnlockAlert(true);
    if (restaurant?.id) {
      queryClient.setQueryData(['restaurant'], (old) => {
        if (!old?.length) return old;
        return [{ ...old[0], hide_user_icon: false }];
      });
      entities.Restaurant.update(restaurant.id, { hide_user_icon: false });
    }
  };

  // Auto-dismiss unlock alert after 1 second
  useEffect(() => {
    if (showUnlockAlert) {
      const timer = setTimeout(() => setShowUnlockAlert(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showUnlockAlert]);

  const handleOrderPlaced = () => {
    setCartOpen(false);
    setOrderToast(true);
    // Change 12: stays visible for 4 seconds (was 3)
    setTimeout(() => setOrderToast(false), 4000);
  };

  // If Supabase is not configured, show the connect screen
  if (!supabase) {
    return <ConnectSupabase />;
  }

 if (showSplash) {
  if (!restaurant) {
    return <div className="fixed inset-0 z-[100] bg-background" />;
  }
  return <SplashScreen restaurant={restaurant} onComplete={() => setShowSplash(false)} />;
}

  // Change 8 + 9: Closed restaurant gate — show after splash, before menu
  if (restaurant && restaurant.is_open === false) {
    const handleSecretOpen = async () => {
      const correctPw = restaurant.open_password || '000';
      if (openPwInput === correctPw) {
        await entities.Restaurant.update(restaurant.id, { is_open: true });
        setShowOpenPrompt(false);
        setOpenPwInput('');
        setOpenPwError(false);
        queryClient.invalidateQueries({ queryKey: ['restaurant'] });
      } else {
        setOpenPwError(true);
        setTimeout(() => setOpenPwError(false), 2000);
      }
    };

    const circleClass = "w-4 h-4 rounded-full bg-border opacity-60";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background relative overflow-hidden">
        {/* ── CORNER CIRCLES ── */}
        <div className={`absolute top-5 left-5 ${circleClass}`} />
        <button
          className={`absolute top-5 right-5 ${circleClass} cursor-pointer hover:opacity-100 transition-opacity focus:outline-none`}
          onClick={() => setShowOpenPrompt(true)}
          aria-label="Admin open"
        />
        <div className={`absolute bottom-5 left-5 ${circleClass}`} />
        <div className={`absolute bottom-5 right-5 ${circleClass}`} />

        {/* ── MAIN CONTENT ── */}
        {restaurant.logo_url && (
          <img src={restaurant.logo_url} alt={restaurant.name} className="w-20 h-20 rounded-2xl mb-4 object-cover" />
        )}
        <h1 className="font-display text-2xl font-bold mb-2">{restaurant.name}</h1>
        <div className="glass rounded-2xl p-6 max-w-sm w-full mt-4">
          <p className="text-lg font-medium text-muted-foreground">
            {restaurant.closed_message || 'Restaurant is currently closed. Please visit us again soon!'}
          </p>
        </div>

        {/* ── PASSWORD PROMPT (appears on top-right circle click) ── */}
        {showOpenPrompt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={e => { if (e.target === e.currentTarget) { setShowOpenPrompt(false); setOpenPwInput(''); setOpenPwError(false); } }}
          >
            <div className="bg-background rounded-2xl p-6 w-full max-w-xs shadow-2xl">
              <h2 className="font-semibold text-base mb-4 text-center">Enter Password to Open</h2>
              <input
                type="password"
                value={openPwInput}
                onChange={e => setOpenPwInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSecretOpen()}
                placeholder="Password"
                autoFocus
                className={`w-full bg-secondary border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 mb-3 ${
                  openPwError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-primary'
                }`}
              />
              {openPwError && (
                <p className="text-red-500 text-xs mb-3 text-center">Wrong password. Try again.</p>
              )}
              <button
                onClick={handleSecretOpen}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Open Restaurant
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MenuHeader
        restaurant={restaurant}
        onSearchOpen={() => setSearchOpen(true)}
        onFilterOpen={() => setFilterOpen(true)}
        onUserClick={() => setAdminOpen(true)}
        onHistoryClick={() => setHistoryOpen(true)}
        hideUserIcon={restaurant?.hide_user_icon}
      />

      {/* Content below sticky header */}
      <div className="pt-[60px] md:pt-[64px]">
        <BannerCarousel banners={banners} liveOrderData={liveOrderData} />

        <CategoryNav
          categories={sortedCategories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* Today's Top Dishes — directly below category nav */}
        <TopDishesCarousel
          dishes={topDishes}
          restaurant={restaurant}
        />
        

        {/* Change: view toggle now spans the FULL width as 3 equal, thin,
            slightly-rounded segments (left / center / right) — dish count
            text removed for now, per request. */}
        <div className="px-4 max-w-7xl mx-auto z-30 sticky top-[124px] md:top-[132px] bg-background py-3">
          <div className="flex items-center gap-2">
            {[
              { mode: 'grid', Icon: LayoutGrid, label: 'Grid view' },
              { mode: 'list', Icon: List, label: 'List view' },
              { mode: 'text', Icon: Type, label: 'Text-only view' },
            ].map(({ mode, Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={label}
                aria-label={label}
                className={`flex-1 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  viewMode === mode ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Dishes */}
        <div className="px-4 max-w-7xl mx-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {visibleDishes.map((dish, index) => (
                <DishCardGrid
                  key={dish.id}
                  dish={dish}
                  restaurant={restaurant}
                  onReviewOpen={setReviewDish}
                  eager={index < 4}
                />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2">
              {visibleDishes.map((dish, index) => (
                <DishListRow key={dish.id} dish={dish} restaurant={restaurant} eager={index < 4} />
              ))}
            </div>
          ) : (
            // Change 9: text-only view — no images, just name/price/likes
            <div className="space-y-2">
              {visibleDishes.map(dish => (
                <DishTextRow key={dish.id} dish={dish} restaurant={restaurant} onReviewOpen={setReviewDish} />
              ))}
            </div>
          )}

          {filteredDishes.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-display text-lg">No dishes found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom action bar — horizontal, centered */}
      <BottomActionBar
        restaurant={restaurant}
        favoritesCount={store.favorites.length}
        cartCount={store.cart.length}
        onFavoritesClick={() => { setCartTab('favorites'); setCartOpen(true); }}
        onCartClick={() => { setCartTab('orders'); setCartOpen(true); }}
        onPaymentClick={() => setPayOpen(true)}
      />

      {/* Overlays */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        dishes={dishes}
        onUnlock={handleUnlock}
        onIconUnlock={() => window.location.reload()}
      />

      {/* Auto-dismissing unlock alert (1 second) */}
      {showUnlockAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] glass rounded-full px-5 py-2.5 shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <p className="text-sm font-medium text-foreground">Admin icon unlocked</p>
        </div>
      )}

      {/* Order confirmation toast — Change 12: centered rectangle card, 4s,
          Change 13: message text is editable by the owner from the admin
          panel's Waiter Call section (restaurant.place_order_message) */}
      <AnimatePresence>
        {orderToast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 550, damping: 34 }}
              className="bg-background rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center border border-border"
            >
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <Check className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {restaurant?.place_order_message || '🎉 Your order has been received! Your waiter will come to you shortly for confirmation.'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
        restaurant={restaurant}
      />
      <ReviewSheet
        dish={reviewDish}
        open={!!reviewDish}
        onClose={() => setReviewDish(null)}
      />
      <CartPage
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        dishes={dishes}
        restaurant={restaurant}
        onPay={handlePay}
        defaultTab={cartTab}
        onOrderPlaced={handleOrderPlaced}
      />
      <PaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        restaurant={restaurant}
        onPay={(amount) => {
          // UPI deep-link payment logic
          const uid = restaurant?.upi_id || '';
          const name = restaurant?.upi_payee_name || restaurant?.name || 'Restaurant';
          if (!uid) { alert('UPI not configured.'); return; }
          window.location.href = `upi://pay?pa=${uid}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
        }}
      />
      <AdminLoginDialog
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        restaurant={restaurant}
        onLogin={() => navigate('/admin')}
      />

      {/* Order History Panel */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[70] bg-background flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center gap-3 z-10">
              <button onClick={() => setHistoryOpen(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <h2 className="font-display text-lg font-semibold flex-1">Order History</h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-lg mx-auto w-full">
              {(() => {
                const THREE_HOURS = 3 * 60 * 60 * 1000;
                const recentHistory = orderHistory.filter(o =>
                  Date.now() - new Date(o.created_at).getTime() < THREE_HOURS
                );
                const timeAgo = (dateStr) => {
                  const diff = Date.now() - new Date(dateStr).getTime();
                  const mins = Math.floor(diff / 60000);
                  if (mins < 1) return 'Just now';
                  if (mins < 60) return `${mins}m ago`;
                  const hrs = Math.floor(mins / 60);
                  if (hrs < 24) return `${hrs}h ago`;
                  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
                };
                return recentHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No past orders yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Your order history will appear here</p>
                  </div>
                ) : (
                  recentHistory.map(order => (
                    order.is_home_delivery ? (
                      <div key={order.id} className="glass rounded-2xl p-4 space-y-2 border border-amber-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🚚</span>
                            <span className="text-sm font-semibold">Home Delivery</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{timeAgo(order.created_at)}</span>
                        </div>

                        {/* OTP */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">OTP:</span>
                          <span className="font-mono font-bold text-primary text-sm tracking-widest">{order.delivery_otp || '—'}</span>
                        </div>

                        {/* Items */}
                        <div className="space-y-0.5">
                          {(order.items || []).map((item, i) => (
                            <div key={i} className="flex justify-between text-xs text-muted-foreground">
                              <span>{item.name} × {item.qty}</span>
                              <span>₹{(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        {/* Delivery time */}
                        <div className="text-xs text-muted-foreground">
                          🕐 Estimated: <span className="font-semibold text-foreground">{order.delivery_time_minutes || 30} min</span>
                        </div>

                        {/* Delivery contact */}
                        {restaurant?.delivery_contact_phone && (
                          <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                            📞 For delivery updates, contact:{' '}
                            <a href={`tel:${restaurant.delivery_contact_phone}`} className="text-primary font-semibold underline">
                              {restaurant.delivery_contact_phone}
                            </a>
                          </div>
                        )}

                        {/* Delivery boy phone */}
                        {order.delivery_boy_phone && (
                          <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                            🛵 Delivery partner:{' '}
                            <a href={`tel:${order.delivery_boy_phone}`} className="text-primary font-semibold underline">
                              {order.delivery_boy_phone}
                            </a>
                          </div>
                        )}

                        {/* Status badge */}
                        <div className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                          order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                          order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500' :
                          order.status === 'ready' ? 'bg-green-500/10 text-green-500' :
                          order.status === 'completed' ? 'bg-muted text-muted-foreground' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {order.status === 'pending' ? '⏳ Pending' :
                           order.status === 'confirmed' ? '✅ Confirmed' :
                           order.status === 'ready' ? '🛵 Out for Delivery' :
                           order.status === 'completed' ? '✔ Delivered' : '✕ Cancelled'}
                        </div>
                      </div>
                    ) : (
                      <div key={order.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">#{String(order.id || '').slice(0, 5)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              order.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                              order.status === 'cancelled' ? 'bg-red-500/10 text-red-600' :
                              order.status === 'ready' ? 'bg-blue-500/10 text-blue-600' :
                              order.status === 'confirmed' ? 'bg-amber-500/10 text-amber-600' :
                              'bg-secondary text-muted-foreground'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {order.created_at ? new Date(order.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        {order.is_home_delivery && order.delivery_otp && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">OTP:</span>
                            <span className="text-sm font-mono font-bold text-primary">{order.delivery_otp}</span>
                          </div>
                        )}
                        <div className="space-y-1">
                          {(order.items || []).map((item, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span>{item.qty}× {item.name}</span>
                              <span className="text-muted-foreground">₹{(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        {order.total > 0 && (
                          <div className="flex justify-between text-xs font-semibold pt-1 border-t border-border">
                            <span>Total</span>
                            <span>₹{order.total.toLocaleString()}</span>
                          </div>
                        )}
                        {restaurant?.delivery_help_phone && (
                          <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                            📞 Help:{' '}
                            <a href={`tel:${restaurant.delivery_help_phone}`} className="text-primary font-semibold underline">
                              {restaurant.delivery_help_phone}
                            </a>
                          </div>
                        )}
                      </div>
                    )
                  ))
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
