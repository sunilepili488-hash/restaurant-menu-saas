import { createClient } from '@supabase/supabase-js';

// Read from localStorage (set by Edit/Reconnect) or fall back to env vars
const supabaseUrl = localStorage.getItem('VITE_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Gracefully handle missing credentials — export null instead of crashing
// so the app can render a fallback UI when Supabase is not configured yet.
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('[AuraMenu] Failed to create Supabase client:', err.message);
    supabase = null;
  }
} else {
  console.info(
    '[AuraMenu] Supabase credentials not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local, or store them in localStorage. The app will run in offline/demo mode until connected.'
  );
}

export { supabase };
