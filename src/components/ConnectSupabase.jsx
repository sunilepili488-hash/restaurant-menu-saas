import React, { useState } from 'react';

/**
 * Shown when Supabase credentials are missing.
 * Lets the user paste their project URL + anon key so the app
 * can connect without rebuilding or editing .env.local files.
 */
export default function ConnectSupabase() {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleConnect = (e) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) return;

    // Persist to localStorage so supabaseClient picks them up on reload
    localStorage.setItem('VITE_SUPABASE_URL', url.trim());
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', key.trim());
    setSaved(true);

    // Reload the page so the Supabase client re-initializes
    setTimeout(() => window.location.reload(), 800);
  };

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Connecting to Supabase…</p>
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
          Credentials are stored in your browser's localStorage only.
        </p>
      </div>
    </div>
  );
}
