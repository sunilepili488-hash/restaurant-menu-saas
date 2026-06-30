import React, { useState } from 'react';
import { Database, Check, Pencil, Loader2, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SupabaseSection({ restaurant, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '');
  const [anonKey, setAnonKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null); // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('');
  const [backingUp, setBackingUp] = useState(false);
  const [backupDone, setBackupDone] = useState(false);

  const currentUrl = import.meta.env.VITE_SUPABASE_URL;
  const currentKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isConnected = !!currentUrl && !!currentKey;

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    setErrorMsg('');
    try {
      // Test connection by querying the restaurant table
      const resp = await fetch(`${url}/rest/v1/restaurant?select=id&limit=1`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      });
      if (resp.ok) {
        // Also check that key tables exist
        const tables = ['restaurant', 'category', 'dish', 'banner', 'order'];
        let allGood = true;
        for (const table of tables) {
          const tResp = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${anonKey}`,
            },
          });
          if (!tResp.ok) {
            allGood = false;
            setErrorMsg(`Table "${table}" not found or inaccessible`);
            break;
          }
        }
        if (allGood) {
          setVerifyResult('success');
        } else {
          setVerifyResult('error');
        }
      } else {
        const data = await resp.json().catch(() => ({}));
        setErrorMsg(data.message || data.msg || `HTTP ${resp.status}: Connection failed`);
        setVerifyResult('error');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error');
      setVerifyResult('error');
    } finally {
      setVerifying(false);
    }
  };

  const handleConnect = async () => {
    if (verifyResult !== 'success') return;
    // Update the runtime supabase client
    // Since env vars are read-only at runtime, we update localStorage
    // and the supabaseClient module reads from localStorage or env
    localStorage.setItem('VITE_SUPABASE_URL', url);
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', anonKey);

    // Also try to sync globally (Vercel env vars + redeploy) so every
    // customer device picks this up, not just this browser.
    try {
      await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, key: anonKey }),
      });
    } catch (err) {
      console.warn('[SupabaseSection] global sync failed:', err.message);
    }

    // Force reload to apply new credentials
    window.location.reload();
  };

  const handleAutoBackup = async () => {
    setBackingUp(true);
    setBackupDone(false);
    try {
      const backup = {};
      const tables = ['restaurant', 'category', 'dish', 'banner', 'order', 'review', 'table_mapping'];
      const apiUrl = currentUrl || url;
      const apiKey = currentKey || anonKey;

      for (const table of tables) {
        const resp = await fetch(`${apiUrl}/rest/v1/${table}?select=*&limit=1000`, {
          headers: {
            apikey: apiKey,
            Authorization: `Bearer ${apiKey}`,
          },
        });
        if (resp.ok) {
          backup[table] = await resp.json();
        }
      }

      // Download as JSON file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `auramenu-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      setBackupDone(true);
    } catch (err) {
      console.error('Backup failed:', err);
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Supabase Backend</h2>

      {!editing ? (
        <>
          {/* Connected status */}
          <div className="glass rounded-2xl p-5 flex items-center gap-4 border-green-500/30">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500/20">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Connected to Supabase</p>
              <p className="text-xs text-muted-foreground">
                Live database sync is active. Project: {currentUrl}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit / Reconnect
            </Button>
          </div>

          {/* Reminder about Vercel env vars for global access */}
          <div className="glass rounded-2xl p-4 bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Note:</strong> This connection auto-syncs to Vercel and redeploys so ALL your customers see the menu directly (no connect screen). If auto-sync isn't configured on the server yet, manually confirm <code className="text-[10px] bg-secondary px-1 rounded">VITE_SUPABASE_URL</code> and <code className="text-[10px] bg-secondary px-1 rounded">VITE_SUPABASE_ANON_KEY</code> are set in Vercel project's Environment Variables, then redeploy.
            </p>
          </div>

          {/* Auto-backup */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Auto-Backup Data</p>
                <p className="text-xs text-muted-foreground">Download all tables as a JSON file before reconnecting</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoBackup}
                disabled={backingUp}
                className="gap-1.5"
              >
                {backingUp ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Backing up...</>
                ) : backupDone ? (
                  <><Check className="w-3.5 h-3.5 text-green-500" /> Downloaded</>
                ) : (
                  <><Download className="w-3.5 h-3.5" /> Backup</>
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* Edit / Reconnect form */
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Edit Supabase Connection</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Before reconnecting, it's recommended to backup your data first.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                Project URL
              </label>
              <Input
                value={url}
                onChange={e => { setUrl(e.target.value); setVerifyResult(null); setErrorMsg(''); }}
                placeholder="https://xxxx.supabase.co"
                className="bg-secondary"
                autoComplete="off"
                data-1p-ignore
                data-lpignore="true"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                Anon Key
              </label>
              <Input
                type="password"
                value={anonKey}
                onChange={e => { setAnonKey(e.target.value); setVerifyResult(null); setErrorMsg(''); }}
                placeholder="eyJhbGciOi..."
                className="bg-secondary"
                autoComplete="new-password"
                data-1p-ignore
                data-lpignore="true"
              />
            </div>
          </div>

          {/* Verify result */}
          {verifyResult === 'success' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 text-sm">
              <Check className="w-4 h-4" /> Connection verified — all required tables found
            </div>
          )}
          {verifyResult === 'error' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {errorMsg || 'Verification failed'}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleVerify}
              disabled={verifying || !url || !anonKey}
              variant="outline"
              className="gap-1.5"
            >
              {verifying ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...</>
              ) : (
                <><RefreshCw className="w-3.5 h-3.5" /> Verify & Connect</>
              )}
            </Button>
            <Button
              onClick={handleConnect}
              disabled={verifyResult !== 'success'}
              className="bg-primary text-primary-foreground gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Apply & Reload
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setEditing(false); setVerifyResult(null); setErrorMsg(''); }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoBackup}
              disabled={backingUp}
              className="gap-1.5 ml-auto"
            >
              {backingUp ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Backing up...</>
              ) : (
                <><Download className="w-3.5 h-3.5" /> Backup First</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
