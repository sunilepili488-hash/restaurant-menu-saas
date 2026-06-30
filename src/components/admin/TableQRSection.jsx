import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { entities } from '@/api/entities';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function TableQRSection({ restaurant, onRefresh }) {
  const [enabled, setEnabled] = useState(false);
  const [newTable, setNewTable] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: () => entities.TableMapping.list(),
  });

  useEffect(() => {
    if (restaurant) setEnabled(restaurant.table_qr_enabled || false);
  }, [restaurant]);

  const handleToggle = async (v) => {
    setEnabled(v);
    await entities.Restaurant.update(restaurant.id, { table_qr_enabled: v });
    onRefresh();
  };

  const addTable = async () => {
    if (!newTable.trim() || !newUrl.trim()) return;
    await entities.TableMapping.create({ table_number: newTable.trim(), qr_url: newUrl.trim() });
    setNewTable('');
    setNewUrl('');
    queryClient.invalidateQueries({ queryKey: ['tables'] });
  };

  const deleteTable = async (id) => {
    await entities.TableMapping.delete(id);
    queryClient.invalidateQueries({ queryKey: ['tables'] });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Table QR Mapping</h2>

      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
        <div>
          <p className="text-sm font-medium">Enable Table QR System</p>
          <p className="text-xs text-muted-foreground">Attach table numbers to orders</p>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} />
      </div>

      {enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-1">
              <Input value={newTable} onChange={e => setNewTable(e.target.value)} placeholder="Table #" className="bg-secondary" />
            </div>
            <div className="col-span-3">
              <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="QR URL" className="bg-secondary" />
            </div>
            <Button onClick={addTable} className="gap-1"><Plus className="w-4 h-4" /></Button>
          </div>

          <div className="space-y-2">
            {tables.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                <div>
                  <span className="text-sm font-medium">Table {t.table_number}</span>
                  <p className="text-xs text-muted-foreground truncate max-w-[250px]">{t.qr_url}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteTable(t.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}