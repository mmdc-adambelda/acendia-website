// Supabase admin client — service-role, server-only.
//
// ASSUMPTION FLAG: env var names below (SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY) are the conventional Supabase names. If your
// Vercel project used different names when you set these up, either
// rename them in Vercel to match, or update the two env var reads below —
// nothing else in this file needs to change.

const { createClient } = require('@supabase/supabase-js');

let client = null;

function getSupabaseAdmin() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase admin client is not configured — SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are missing.'
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

module.exports = { getSupabaseAdmin };
