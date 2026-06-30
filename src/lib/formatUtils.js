// Formats numbers >= 1000 into short form: 1000 → 1k, 1500 → 1.5k, 10000 → 10k
export function formatCount(n) {
  if (n >= 1000) {
    const k = n / 1000;
    if (k >= 10) return `${Math.round(k)}k`;
    return `${k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(n);
}

// Returns today's date as YYYY-MM-DD
export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

// Returns the effective ordered-today count (0 if date doesn't match today)
export function getOrderedToday(dish) {
  if (!dish) return 0;
  if (dish.ordered_today_date !== getTodayStr()) return 0;
  return dish.ordered_today_count || 0;
}