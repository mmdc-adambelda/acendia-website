// GET /api/cron/keep-alive
//
// Runs a trivial, real Supabase API call on a schedule (see the "crons"
// entry in vercel.json) purely to generate activity against the project —
// Supabase's free tier auto-pauses a project after 7 days with no API
// activity, and this get-started/onboarding flow doesn't get touched
// reliably enough yet on its own to avoid that.
//
// Uses supabase.auth.admin.listUsers() rather than querying any custom
// table (profiles/organizations/etc.) — those table names are still
// unverified against the real schema (see docs/get-started-checkout-flow.md),
// but the built-in auth admin API always exists on any Supabase project,
// so this stays correct regardless of that.
//
// Protected by CRON_SECRET so this can't be triggered by an arbitrary
// public request — Vercel's own Cron Jobs send this header automatically
// when CRON_SECRET is set as an environment variable; see
// https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs

const { getSupabaseAdmin } = require('../../lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, message: 'Method not allowed.' });
  }

  if (process.env.CRON_SECRET) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ ok: false, message: 'Unauthorized.' });
    }
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('cron/keep-alive: Supabase env vars not set — nothing to ping');
    return res.status(200).json({ ok: false, message: 'Supabase not configured; skipped.' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) throw error;
    console.log('cron/keep-alive: Supabase ping succeeded', new Date().toISOString());
    return res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('cron/keep-alive: Supabase ping failed', err);
    return res.status(500).json({ ok: false, message: 'Supabase ping failed.' });
  }
};
