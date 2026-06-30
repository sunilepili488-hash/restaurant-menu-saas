import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { entities } from '@/api/entities';
import { Plus, Trash2, Pencil, Upload } from 'lucide-react';

export default function BannersSection({ banners = [], onRefresh }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', bg_color: '#C5A572', text_color: '#FFFFFF', sort_order: 0 });
  const [editId, setEditId] = useState(null);

  const openNew = () => { setForm({ title: '', subtitle: '', image_url: '', bg_color: '#C5A572', text_color: '#FFFFFF', sort_order: banners.length }); setEditId(null); setDialogOpen(true); };
  const openEdit = (b) => { setForm({ ...b }); setEditId(b.id); setDialogOpen(true); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (editId) { await entities.Banner.update(editId, form); }
    else { await entities.Banner.create({ ...form, is_active: true }); }
    setDialogOpen(false); onRefresh();
  };
  const handleDelete = async (id) => { await entities.Banner.delete(id); onRefresh(); };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const file_url = URL.createObjectURL(file);
    set('image_url', file_url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Banners</h2>
        <Button onClick={openNew} className="gap-2 bg-primary text-primary-foreground"><Plus className="w-4 h-4" /> Add</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {banners.map(b => (
          <div key={b.id} className="rounded-xl overflow-hidden border border-border relative h-28" style={{ background: b.image_url ? `url(${b.image_url}) center/cover` : b.bg_color }}>
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="font-display text-lg font-bold text-white">{b.title}</span>
            </div>
            <div className="absolute top-2 right-2 flex gap-1">
              <Button size="icon" variant="ghost" className="w-7 h-7 bg-black/40 text-white" onClick={() => openEdit(b)}><Pencil className="w-3 h-3" /></Button>
              <Button size="icon" variant="ghost" className="w-7 h-7 bg-black/40 text-white" onClick={() => handleDelete(b.id)}><Trash2 className="w-3 h-3" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm bg-background">
          <DialogHeader><DialogTitle className="font-display">{editId ? 'Edit' : 'Add'} Banner</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={e => set('title', e.target.value)} className="mt-1 bg-secondary" /></div>
            <div><Label>Subtitle</Label><Input value={form.subtitle} onChange={e => set('subtitle', e.target.value)} className="mt-1 bg-secondary" /></div>
            <div>
              <Label>Image</Label>
              <label className="mt-1 cursor-pointer block">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm"><Upload className="w-4 h-4" /> Upload</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Background Color</Label><Input type="color" value={form.bg_color} onChange={e => set('bg_color', e.target.value)} className="mt-1 h-10" /></div>
              <div><Label>Text Color</Label><Input type="color" value={form.text_color} onChange={e => set('text_color', e.target.value)} className="mt-1 h-10" /></div>
            </div>
            <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground">{editId ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}