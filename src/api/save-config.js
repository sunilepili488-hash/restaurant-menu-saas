// /api/save-config.js
// Called once by the owner from ConnectSupabase.jsx (first-time setup screen)
// or from the Admin Dashboard -> Supabase section (Edit/Reconnect).
//
// What it does:
//  1. Saves VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY as permanent
//     Environment Variables on the Vercel project (via Vercel REST API).
//  2. Triggers a redeploy (via a Vercel Deploy Hook URL) so the new
//     build is generated WITH those env vars baked in.
//
// Once that redeploy finishes (~1-2 min), supabaseClient.js picks the
// credentials up from import.meta.env on every device, for every
// visitor — the "Connect Supabase" screen will never be shown again
// to anyone, on any device, because the app no longer needs
// localStorage to know it's connected.
//
// ONE-TIME SETUP REQUIRED (done once by the AuraMenu deployer, not by
// every restaurant owner) — add these in Vercel Project Settings ->
// Environment Variables:
//   VERCEL_TOKEN     -> Vercel Account Settings -> Tokens -> Create
//   VERCEL_PROJECT_ID-> Project Settings -> General -> Project ID
//   VERCEL_TEAM_ID    -> (only if the project lives inside a Team) Team Settings -> Team ID
//   DEPLOY_HOOK_URL   -> Project Settings -> Git -> Deploy Hooks -> Create Hook -> copy URL
//
// If these are not configured yet, this endpoint still saves the
// credentials to localStorage on the client (handled in
// ConnectSupabase.jsx), so the app works immediately on the owner's
// own device — it just won't yet be global for all customers until
// this one-time setup is done.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { url, key } = req.body || {};

    if (!url || !key || !url.trim() || !key.trim()) {
      res.status(400).json({ error: 'Missing Supabase URL or Anon Key' });
      return;
    }

    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // optional
    const DEPLOY_HOOK_URL = process.env.DEPLOY_HOOK_URL;

    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID || !DEPLOY_HOOK_URL) {
      // Not configured yet — tell the client so it can fall back
      // gracefully to "works on this device only" mode.
      res.status(200).json({
        globalSync: false,
        message:
          'Server-side auto-sync is not configured yet (VERCEL_TOKEN / VERCEL_PROJECT_ID / DEPLOY_HOOK_URL missing). Credentials were only applied on this device.',
      });
      return;
    }

    const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : '';
    const envVars = [
      { key: 'VITE_SUPABASE_URL', value: url.trim() },
      { key: 'VITE_SUPABASE_ANON_KEY', value: key.trim() },
    ];

    for (const envVar of envVars) {
      await upsertVercelEnvVar({
        projectId: VERCEL_PROJECT_ID,
        token: VERCEL_TOKEN,
        teamQuery,
        envVar,
      });
    }

    // Trigger a redeploy so the build picks up the new env vars.
    await fetch(DEPLOY_HOOK_URL, { method: 'POST' });

    res.status(200).json({
      globalSync: true,
      message: 'Saved. Redeploy triggered — will be live for all customers in ~1-2 minutes.',
    });
  } catch (err) {
    console.error('[save-config] error:', err);
    res.status(200).json({
      globalSync: false,
      message: 'Auto-sync failed, but it still works on this device. ' + (err.message || ''),
    });
  }
}

async function upsertVercelEnvVar({ projectId, token, teamQuery, envVar }) {
  const baseUrl = `https://api.vercel.com/v10/projects/${projectId}/env${teamQuery}`;

  // Try to create the env var first.
  const createResp = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: envVar.key,
      value: envVar.value,
      type: 'plain',
      target: ['production', 'preview', 'development'],
    }),
  });

  if (createResp.ok) return;

  // If it already exists, Vercel returns 400/409 — find it and PATCH instead.
  const listResp = await fetch(baseUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listResp.json();
  const existing = (listData.envs || []).find((e) => e.key === envVar.key);

  if (existing) {
    const patchUrl = `https://api.vercel.com/v9/projects/${projectId}/env/${existing.id}${teamQuery}`;
    await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: envVar.value }),
    });
  }
}
