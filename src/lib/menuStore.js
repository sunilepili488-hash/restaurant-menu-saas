import { useState, useEffect } from 'react';

// Local state store for cart, favorites, likes, session, and locked orders
const STORAGE_KEY = 'luxe_menu_store';

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    return {
      cart: parsed.cart || [],
      favorites: parsed.favorites || [],
      likedDishes: parsed.likedDishes || {},
      tableNumber: parsed.tableNumber || null,
      lockedOrders: parsed.lockedOrders || [],
    };
  }
  return { cart: [], favorites: [], likedDishes: {}, tableNumber: null, lockedOrders: [] };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    cart: state.cart,
    favorites: state.favorites,
    likedDishes: state.likedDishes,
    tableNumber: state.tableNumber,
    lockedOrders: state.lockedOrders,
  }));
}

// We'll use a simple object-based store since zustand isn't installed
let listeners = [];
let state = loadState();

function notify() {
  saveState(state);
  listeners.forEach(fn => fn(state));
}

// Change 14 fix: per-dish lock timestamps. Root cause of the "dislike
// subtracts 2 instead of 1" bug was toggleLike firing twice in quick
// succession for the same dish (e.g. a duplicate click/touch event, or the
// same dish being rendered in two lists at once). This lock lives in the
// store itself — the single source of truth — so it protects every caller,
// not just one component.
const likeLocks = {};
const LIKE_LOCK_MS = 500;

export const menuStore = {
  getState: () => state,
  subscribe: (fn) => {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  },

  // Cart
  addToCart: (dish) => {
    const existing = state.cart.find(c => c.dish_id === dish.id);
    if (existing) {
      state = { ...state, cart: state.cart.map(c => c.dish_id === dish.id ? { ...c, quantity: c.quantity + 1 } : c) };
    } else {
      state = { ...state, cart: [...state.cart, { dish_id: dish.id, dish, quantity: 1 }] };
    }
    notify();
  },
  removeFromCart: (dishId) => {
    state = { ...state, cart: state.cart.filter(c => c.dish_id !== dishId) };
    notify();
  },
  updateQuantity: (dishId, qty) => {
    if (qty <= 0) {
      state = { ...state, cart: state.cart.filter(c => c.dish_id !== dishId) };
    } else {
      state = { ...state, cart: state.cart.map(c => c.dish_id === dishId ? { ...c, quantity: qty } : c) };
    }
    notify();
  },
  clearCart: () => {
    state = { ...state, cart: [] };
    notify();
  },

  // Favorites
  toggleFavorite: (dishId) => {
    const isFav = state.favorites.includes(dishId);
    state = { ...state, favorites: isFav ? state.favorites.filter(f => f !== dishId) : [...state.favorites, dishId] };
    notify();
  },
  isFavorite: (dishId) => state.favorites.includes(dishId),

  // Likes — Change 14: locked so a dish can only be toggled once per
  // LIKE_LOCK_MS window, no matter how many times/places it's called from.
  toggleLike: (dishId) => {
    const now = Date.now();
    const lastToggle = likeLocks[dishId] || 0;

    if (now - lastToggle < LIKE_LOCK_MS) {
      // A toggle for this dish was already processed a moment ago —
      // ignore this duplicate call and just report the current state
      // instead of toggling again.
      return !!state.likedDishes[dishId];
    }
    likeLocks[dishId] = now;

    const isLiked = !!state.likedDishes[dishId];
    state = { ...state, likedDishes: { ...state.likedDishes, [dishId]: !isLiked } };
    notify();
    return !isLiked;
  },
  isLiked: (dishId) => !!state.likedDishes[dishId],

  // Table
  setTableNumber: (num) => {
    state = { ...state, tableNumber: num };
    notify();
  },

  // Move favorite to cart
  moveToCart: (dish) => {
    const isFav = state.favorites.includes(dish.id);
    if (isFav) {
      state = { ...state, favorites: state.favorites.filter(f => f !== dish.id) };
    }
    menuStore.addToCart(dish);
  },

  // Locked Orders — items locked after placing order, unlocked when waiter marks Ready
  addLockedOrder: (orderGroup) => {
    state = { ...state, lockedOrders: [...state.lockedOrders, orderGroup] };
    notify();
  },
  updateLockedOrderStatus: (groupId, newStatus) => {
    state = {
      ...state,
      lockedOrders: state.lockedOrders.map(lo =>
        lo.groupId === groupId ? { ...lo, status: newStatus } : lo
      ),
    };
    notify();
  },
  removeLockedOrder: (groupId) => {
    state = { ...state, lockedOrders: state.lockedOrders.filter(lo => lo.groupId !== groupId) };
    notify();
  },
  setLockedOrderPayment: (groupId, paymentMethod) => {
    state = {
      ...state,
      lockedOrders: state.lockedOrders.map(lo =>
        lo.groupId === groupId ? { ...lo, paymentMethod } : lo
      ),
    };
    notify();
  },
};

// React hook
export function useMenuStore() {
  const [s, setS] = useState(menuStore.getState());
  useEffect(() => menuStore.subscribe(setS), []);
  return s;
}
