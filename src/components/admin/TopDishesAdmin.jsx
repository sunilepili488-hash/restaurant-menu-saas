import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';
import { Search, Star, Save, X, Loader2 } from 'lucide-react';

export default function TopDishesAdmin({ restaurant, dishes, onRefresh }) {
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');
  const { saving, saved, error, save } = useSafeSave();

  useEffect(() => {
    setSelected(restaurant?.top_dishes || []);
  }, [restaurant]);

  const filtered = query
    ? dishes.filter(d => d.name.toLowerCase().includes(query.toLowerCase()))
    : dishes;

  const toggleDish = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => save(entities.Restaurant.update(restaurant.id, { top_dishes: selected }), onRefresh);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Today's Top Dishes</h2>
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <p className="text-sm text-muted-foreground">
        Select dishes to highlight as today's top picks. They'll appear in a dedicated section on the menu home page.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search dishes..."
          className="pl-10 bg-secondary"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {selected.length > 0 && (
          <>
            <p className="w-full text-xs text-muted-foreground mb-1">Selected ({selected.length}):</p>
            {selected.map(id => {
              const dish = dishes.find(d => d.id === id);
              if (!dish) return null;
              return (
                <button
                  key={id}
                  onClick={() => toggleDish(id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                >
                  <Star className="w-3 h-3 fill-primary" />
                  {dish.name}
                  <X className="w-3 h-3" />
                </button>
              );
            })}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto">
        {filtered.map(dish => {
          const isSelected = selected.includes(dish.id);
          return (
            <button
              key={dish.id}
              onClick={() => toggleDish(dish.id)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                isSelected ? 'bg-primary/10 border border-primary/30' : 'glass hover:bg-secondary/50'
              }`}
            >
              {dish.image_url && (
                <img src={dish.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{dish.name}</p>
                <p className="text-xs text-muted-foreground">{restaurant?.currency_symbol || '₹'}{(dish.sale_price || dish.regular_price).toLocaleString()}</p>
              </div>
              {isSelected && <Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}