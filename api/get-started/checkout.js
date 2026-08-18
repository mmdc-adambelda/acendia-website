// POST /api/get-started/checkout
//
// Public, unauthenticated entry point for the homepage "Join Now!" button.
// Creates a Stripe Checkout Session for the £199 one-time setup fee ONLY —
// no account/org exists yet, so nothing is attached to a user here. The
// £499/mo subscription is scheduled separately, later, once the customer
// has paid and completed onboarding (see /api/get-started/complete, not
// yet built — see docs/get-started-checkout-flow.md).
//
// This is invoked by a real HTML <form method="POST">, not fetch() — see
// the flow doc for why. Vercel's Node.js runtime parses
// application/x-www-form-urlencoded bodies into req.body automatically, so
// no manual body-parsing is needed here.

const Stripe = require('stripe');

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://acendia.uk';
const SETUP_FEE_PENCE = 19900; // £199.00

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
      mode: 'payment',
      currency: 'gbp',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: SETUP_FEE_PENCE,
            product_data: {
              name: 'Acendia SEO Package — Setup Fee',
              description:
                'One-time setup and onboarding. Recurring £499/month billing begins 14 days after your site goes live.',
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        // Saves the card so the delayed £499/mo subscription can be
        // charged later without asking the customer to pay again.
        setup_future_usage: 'off_session',
      },
      success_url: `${APP_URL}/get-started/thank-you/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/`,
      allow_promotion_codes: true,
    };

    // Disable Stripe's "Managed Payments" — incompatible with
    // setup_future_usage on newer Stripe accounts, and not yet in every
    // installed SDK's TS types, hence the plain property assignment
    // rather than a typed field.
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
