# "Join Now" → Stripe Checkout Flow — Status

Tracks progress against the full flow specified for acendia.uk (mirroring
the pay-first-then-onboard pattern already live on acendia.us).

## Live now

- **`/api/get-started/checkout.js`** — Vercel Node.js serverless function.
  Handles the homepage "Join Now!" form's `POST`. Creates a Stripe Checkout
  Session (`mode: "payment"`, `currency: "gbp"`) for the **£199 setup fee
  only** — no account/org exists yet. Sets `payment_intent_data.setup_future_usage:
  "off_session"` so the card can be charged again later for the £499/mo
  plan without re-asking the customer. Explicitly disables Stripe Managed
  Payments (`managed_payments: { enabled: false }`), which is incompatible
  with `setup_future_usage` on newer accounts. Redirects (303) straight to
  the real Stripe-hosted checkout URL.
- **`/api/get-started/thank-you.js`** (served at the clean path
  `/get-started/thank-you/` via `vercel.json` rewrite) — re-fetches the
  Checkout Session from Stripe's own API and only shows a confirmed state
  if `payment_status === "paid"`. Never trusts the `session_id` in the URL
  on its own.
- Homepage "Join Now!" button (`index.html`) is a real
  `<form method="POST" action="/api/get-started/checkout">`, not a
  `fetch()` call — matches the spec's explicit requirement (a `fetch()`
  submission silently dropped the session cookie for at least one real
  user's browser on acendia.us; a genuine browser-level form POST doesn't
  have that failure mode).
- Basic (best-effort, single-instance, non-distributed) rate limiting on
  the checkout endpoint. **Known gap**: this does not persist or share
  state across serverless instances/regions. Swap for a real distributed
  limiter (e.g. Upstash Redis) before this sees meaningful traffic.

## Not yet built — blocked on inputs, not effort

The thank-you page currently only confirms payment. It does **not** yet:

1. Show the onboarding form (business name, contact, address, keywords,
   competitors, notes, etc.)
2. Create the Supabase auth user via
   `admin.auth.admin.createUser(...)` + send a "set your password" email
   via Resend
3. Create `profiles` / `organizations` / `organization_members` /
   `websites` rows, log keywords/notes to `activity_logs`
4. Insert the `payments` row with idempotency keyed on
   `stripe_payment_intent_id`
5. Schedule the delayed £499/mo subscription (`stripe.subscriptions.create`
   with `trial_end` set via the go-live-plus-delay logic — mirrors
   acendia.us's `lib/billing.ts` `POST_GOLIVE_BILLING_DELAY_DAYS` /
   `estimateDefaultBillingStart()`, not yet ported here)
6. Send the admin new-signup notification email

**Why these are paused rather than guessed at**: the spec is explicit that
this should reuse acendia.us's existing Supabase schema and billing helper
logic rather than being rebuilt from scratch. That requires either read
access to the acendia.us repository, or the relevant file contents
(`lib/payments/stripe.ts`, `lib/billing.ts`, table definitions for
`profiles`/`organizations`/`organization_members`/`websites`/`payments`/
`activity_logs`) — not yet available in this session. Building steps 2–6
without that reference risks inventing table/column names and billing math
that don't match the real system, which would need to be redone anyway.

## Environment variables this flow depends on

- `STRIPE_SECRET_KEY` — set in Vercel (confirmed present).
- `NEXT_PUBLIC_APP_URL` — optional; falls back to `https://acendia.uk` if
  unset. Used to build the Checkout Session's `success_url`/`cancel_url`.
- Needed for the next phase, not yet used: `SUPABASE_URL` /
  `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`.

## Testing this far

With Vercel's real deployment (test-mode Stripe key), clicking "Join Now!"
should land on Stripe's own hosted checkout page for **£199.00**. Card
`4242 4242 4242 4242`, any future expiry, any CVC completes the test
payment and redirects to `/get-started/thank-you/?session_id=...`, which
should show the "Payment Received" confirmation. This cannot be verified
from this session — it has no Vercel/Stripe test-mode credentials — please
test on the live deployment and report back what you see.
