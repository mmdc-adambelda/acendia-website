// POST /api/get-started/checkout
//
// UPDATED per the Aug 2026 CRO audit's approved UK pricing: £750/month,
// no setup fee, no lock-in contract. This now creates a direct Stripe
// Checkout Session in subscription mode against the real Stripe Price
// (price_1U9GM1RqmdbsKtD2gMiWkX9v) — no more separate one-time setup-fee
// charge, no more delayed second subscription created later.
//
// ⚠️ SCOPE OF THIS FIX — READ BEFORE RELYING ON THE REST OF THIS FLOW:
// Only this file was updated. It is currently UNLINKED — nothing on the
// live site points a button/form at this endpoint (the homepage "Join
// Now!" button that used to POST here was removed entirely in the CRO
// audit's B1 pass, since a self-serve checkout doesn't exist on the UK
// site by design). The rest of the pipeline this file's success_url
// still redirects into — /get-started/thank-you/ (thank-you.js),
// /api/get-started/complete (complete.js), /get-started/success/
// (success.js), and lib/billing.js's delayed-subscription math — was
// ALL built around the OLD two-step model (pay a £199 setup fee here,
// then complete.js schedules a separate delayed £499/mo subscription
// after onboarding). That downstream flow has NOT been updated to match
// this file's new direct-subscription checkout, and will need its own
// pass before this can safely be re-linked to a live button:
//   - complete.js will still try to schedule an EXTRA delayed £499/mo
//     subscription on top of the one this file now creates directly —
//     that's a double-subscription bug if left as-is.
//   - thank-you.js's post-checkout onboarding form and copy still assume
//     "you've paid a setup fee, your subscription starts later."
// Do not re-link this endpoint to a live button until that downstream
// flow is reconciled with the new pricing model.
//
// This is invoked by a real HTML <form method="POST">, not fetch() — see
// the flow doc for why. Vercel's Node.js runtime parses
// application/x-www-form-urlencoded bodies into req.body automatically, so
// no manual body-parsing is needed here.

const Stripe = require('stripe');

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://acendia.uk';
const SEO_MONTHLY_PRICE_ID = 'price_1U9GM1RqmdbsKtD2gMiWkX9v'; // £750.00/month, UK SEO package

// Extremely lightweight, best-effort rate limiting. Serverless instances
// are ephemeral and this Map does NOT persist or share state across
// concurrent instances/regions, so this only helps against a single
// instance being hammered in a tight loop — it is not a substitute for a
// real distributed rate limiter (e.g. Upstash Redis) in front of this
// route. Flagged as a known gap, not a complete solution.
const recentRequests = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = recentRequests.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    recentRequests.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).send('Method Not Allowed');
    return;
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (isRateLimited(ip)) {
    res.status(429).send('Too many requests — please try again in a minute.');
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('checkout: STRIPE_SECRET_KEY is not set');
    res.status(500).send(
      'Checkout is temporarily unavailable. Please try again shortly or contact us directly.'
    );
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });

  try {
    const sessionParams = {
      mode: 'subscription',
      line_items: [
        {
          price: SEO_MONTHLY_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/get-started/thank-you/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/`,
      allow_promotion_codes: true,
    };

    // Disable Stripe's "Managed Payments" — not yet in every installed
    // SDK's TS types, hence the plain property assignment rather than a
    // typed field.
    sessionParams.managed_payments = { enabled: false };

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new Error('Stripe did not return a Checkout Session URL');
    }

    res.writeHead(303, { Location: session.url });
    res.end();
  } catch (err) {
    console.error('checkout: failed to create Stripe session', err);
    res.status(500).send(
      'We could not start checkout. Please try again, or contact us directly if this keeps happening.'
    );
  }
};
