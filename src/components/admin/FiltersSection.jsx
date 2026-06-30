import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { entities } from '@/api/entities';
import { useSafeSave } from '@/lib/saveUtils';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function FiltersSection({ restaurant, onRefresh }) {
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1500);
  const [dietTags, setDietTags] = useState([]);
  const [prepFilters, setPrepFilters] = useState([]);
  const [newDiet, setNewDiet] = useState('');
  const [newPrep, setNewPrep] = useState('');
  const { saving, saved, error, save } = useSafeSave();

  useEffect(() => {
    if (restaurant) {
      setPriceMin(restaurant.price_slider_min || 0);
      setPriceMax(restaurant.price_slider_max || 1500);
      setDietTags(restaurant.dietary_tags || ['Veg', 'Non-Veg', 'Vegan', 'Jain', 'Gluten-Free']);
      setPrepFilters(restaurant.prep_time_filters || ['Under 5 min', 'Under 10 min', 'Under 15 min', 'Under 30 min']);
    }
  }, [restaurant]);

  const handleSave = () => save(entities.Restaurant.update(restaurant.id, {
    price_slider_min: Number(priceMin),
    price_slider_max: Number(priceMax),
    dietary_tags: dietTags,
    prep_time_filters: prepFilters,
  }), onRefresh);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Filter Settings</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price Slider Min</Label>
          <Input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="mt-1 bg-secondary" />
        </div>
        <div>
          <Label>Price Slider Max</Label>
          <Input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="mt-1 bg-secondary" />
        </div>
      </div>

      <div>
        <Label>Dietary Tags</Label>
        <div className="flex gap-2 mt-1">
          <Input value={newDiet} onChange={e => setNewDiet(e.target.value)} placeholder="Add tag" className="bg-secondary" onKeyDown={e => { if (e.key === 'Enter' && newDiet.trim()) { setDietTags(p => [...p, newDiet.trim()]); setNewDiet(''); } }} />
          <Button onClick={() => { if (newDiet.trim()) { setDietTags(p => [...p, newDiet.trim()]); setNewDiet(''); } }} size="sm"><Plus className="w-3 h-3" /></Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {dietTags.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-xs">
              {t}
              <button onClick={() => setDietTags(p => p.filter((_, j) => j !== i))} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <Label>Prep Time Filters</Label>
        <div className="flex gap-2 mt-1">
          <Input value={newPrep} onChange={e => setNewPrep(e.target.value)} placeholder="e.g. Under 20 min" className="bg-secondary" onKeyDown={e => { if (e.key === 'Enter' && newPrep.trim()) { setPrepFilters(p => [...p, newPrep.trim()]); setNewPrep(''); } }} />
          <Button onClick={() => { if (newPrep.trim()) { setPrepFilters(p => [...p, newPrep.trim()]); setNewPrep(''); } }} size="sm"><Plus className="w-3 h-3" /></Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {prepFilters.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-xs">
              {t}
              <button onClick={() => setPrepFilters(p => p.filter((_, j) => j !== i))} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-foreground">
        <Save className="w-4 h-4" />
        <span>{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}</span>
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}