import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function ConnectSupabase() {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleConnect = (e) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) return;

    // Persist to localStorage so THIS device can use the app immediately.
    // NOTE: this only unlocks the app on this specific browser/device.
    // To make the app work for ALL visitors permanently, the owner must
    // also add these as Environment Variables in the Vercel project
    // settings (see instructions shown after connecting).
    localStorage.setItem('VITE_SUPABASE_URL', url.trim());
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', key.trim());
    setSaved(true);

    setTimeout(() => window.location.reload(), 2500);
  };

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-5 text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Connecting to Supabase on this device…</p>

          <div className="glass rounded-2xl p-4 text-left space-y-3 mt-6">
            <p className="text-xs font-semibold text-foreground">
              Important: To make this work for ALL your customers (not just this device), add these as Environment Variables in your Vercel project:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-secondary rounded-lg p-2">
                <code className="text-[10px] flex-1 truncate">VITE_SUPABASE_URL = {url}</code>
                <button onClick={() => copyToClipboard(url, setCopiedUrl)} className="flex-shrink-0">
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center gap-2 bg-secondary rounded-lg p-2">
                <code className="text-[10px] flex-1 truncate">VITE_SUPABASE_ANON_KEY = {key.slice(0, 20)}...</code>
                <button onClick={() => copyToClipboard(key, setCopiedKey)} className="flex-shrink-0">
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Vercel Dashboard → Your Project → Settings → Environment Variables → Add both → Redeploy. Once redeployed, every customer will see the menu directly, with no connect screen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-bold text-foreground">AuraMenu</h1>
          <p className="text-muted-foreground text-sm">
            Connect your Supabase project to get started.
            Your data stays safely in your own Supabase backend.
          </p>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Supabase Project URL</label>
            <input
              type="url"
              placeholder="https://xxxxx.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Supabase Anon Key</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Connect & Launch
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Find these in your Supabase dashboard → Project Settings → API.
          This connects only on this device — for a permanent fix that works for all customers, set these in Vercel's Environment Variables after connecting (instructions will be shown).
        </p>
      </div>
    </div>
  );
}
