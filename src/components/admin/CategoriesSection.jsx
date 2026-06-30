import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { entities } from '@/api/entities';
import { Plus, Trash2, GripVertical, Save, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CategoriesSection({ categories = [], onRefresh }) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [localError, setLocalError] = useState('');

  const clearError = () => setTimeout(() => setLocalError(''), 5000);

  const addCategory = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await entities.Category.create({
        name: newName.trim(),
        sort_order: categories.length,
        is_active: true,
      });
      setNewName('');
      onRefresh();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      setLocalError(err.message || 'Failed to add category');
      clearError();
    }
    setLoading(false);
  };

  const deleteCategory = async (id) => {
    try {
      await entities.Category.delete(id);
      onRefresh();
    } catch (err) {
      setLocalError(err.message || 'Failed to delete');
      clearError();
    }
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      await entities.Category.update(id, { name: editName.trim() });
      setEditingId(null);
      onRefresh();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      setLocalError(err.message || 'Failed to update');
      clearError();
    }
  };

  const moveCategory = async (index, direction) => {
    const sorted = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const updates = sorted.map((cat, i) => {
      if (i === index) return { id: cat.id, sort_order: target };
      if (i === target) return { id: cat.id, sort_order: index };
      return null;
    }).filter(Boolean);
    try {
      for (const u of updates) {
        await entities.Category.update(u.id, { sort_order: u.sort_order });
      }
      onRefresh();
    } catch (err) {
      setLocalError(err.message || 'Failed to reorder');
      clearError();
    }
  };

  const sorted = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Categories</h2>

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New category name"
          className="bg-secondary"
          onKeyDown={e => e.key === 'Enter' && addCategory()}
        />
        <Button
          onClick={addCategory}
          disabled={loading}
          className={justSaved ? 'bg-green-600 hover:bg-green-600 text-white gap-2' : 'gap-2 bg-primary text-primary-foreground'}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : justSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {justSaved ? 'Added' : 'Add'}
        </Button>
      </div>
      {localError && <p className="text-destructive text-xs mt-1">{localError}</p>}

      {/* List */}
      <div className="space-y-2">
        {sorted.map((cat, i) => (
          <motion.div
            key={cat.id}
            layout
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
          >
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveCategory(i, -1)} className="text-muted-foreground hover:text-foreground text-xs">▲</button>
              <button onClick={() => moveCategory(i, 1)} className="text-muted-foreground hover:text-foreground text-xs">▼</button>
            </div>
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            {editingId === cat.id ? (
              <div className="flex-1 flex gap-2">
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="bg-secondary flex-1"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && saveEdit(cat.id)}
                />
                <Button size="sm" onClick={() => saveEdit(cat.id)}>
                  <Save className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <span
                className="flex-1 text-sm font-medium cursor-pointer"
                onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
              >
                {cat.name}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteCategory(cat.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>
        )}
      </div>
    </div>
  );
}
