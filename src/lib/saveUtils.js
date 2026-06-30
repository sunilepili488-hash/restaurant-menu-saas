import { useState } from 'react';

export function useSafeSave() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const save = (promise, onSuccess) => {
    if (!promise || typeof promise.then !== 'function') {
      setError('Save error: no response from database. Check your Supabase connection.');
      return;
    }

    setSaving(true);
    setError('');
    setSaved(false);

    promise
      .then(() => {
        setSaved(true);
        setSaving(false);
        setTimeout(() => setSaved(false), 2000);
        onSuccess?.();
      })
      .catch((err) => {
        setSaving(false);
        setSaved(false);
        const msg = err?.message || 'Unknown error';
        setError(`Save failed: ${msg}`);
        setTimeout(() => setError(''), 5000);
        console.error('[AuraMenu] Save error:', err);
      });
  };

  return { saving, saved, error, save };
}

export async function safeSave(promise, timeoutMs = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out after 15 seconds')), timeoutMs)
    ),
  ]);
}
