# "Join Now" → Stripe Checkout Flow — Status

Tracks progress against the full flow specified for acendia.uk.

> **Reconciled to the Aug 2026 CRO audit's approved UK pricing** (£750/
> month, no setup fee, no lock-in contract — see
> `2026-08-26_Acendia_UK_US_Landing_Page_CRO_Audit_v1.md`). The flow below
> is now a single-step subscription checkout against a real Stripe Price
> (`price_1U9GM1RqmdbsKtD2gMiWkX9v`), replacing the old two-step
> £199-setup-fee-then-delayed-£499/mo model. `lib/billing.js` (the old
> post-go-live billing-delay estimator) is no longer used and has been
> removed.
>
> **Still unlinked from the live site.** Nothing on acendia.uk currently
> POSTs to `checkout.js` — the homepage "Join Now!" button was removed
> entirely in the CRO audit's B1 pass, since a self-serve checkout doesn't
> exist on the UK site by design. Re-adding a live button that submits
> here is a separate product decision, not made as part of this
> reconciliation — test against Stripe in **test mode** first if you do.

## Flow — full pipeline, single-step subscription

1. **`/api/get-started/checkout.js`** — entry point (currently unlinked
   from any button). Creates a Stripe Checkout Session (`mode:
   "subscription"`) with a single line item referencing the real Price
   `price_1U9GM1RqmdbsKtD2gMiWkX9v` (£750.00/month). No separate setup
   fee, no trial — the customer is charged the first month immediately at
   checkout. Disables Managed Payments, redirects (303) to Stripe's
   hosted checkout.
2. **`/get-started/thank-you/`** (`api/get-started/thank-you.js`, rewritten
   via `vercel.json`) — re-fetches the Checkout Session from Stripe's own
   API (expanding `subscription` and
   `subscription.latest_invoice.payment_intent`) and only proceeds if
   `payment_status === "paid"` — this still holds for a no-trial
   subscription session, since the first invoice is paid synchronously at
   checkout. On success, renders the full onboarding form (business name,
   contact, email — prefilled from Stripe, phone, website URL, address,
   industry, keywords, competitors, notes) as a real `<form
   method="POST">` with a hidden `sessionId` field.
3. **`/api/get-started/complete.js`** — the onboarding form POSTs here.
   Validates input with Zod (`lib/validation.js` — phone has no format
   check, per spec). **Re-verifies the Stripe session again** (a hidden
   form field is not proof of payment), pulling the subscription and its
   payment intent from the expanded session. Checks `payments` for an
   existing row matching this `stripe_checkout_session_id` first —
   **idempotent**: a duplicate submit (refresh/double-click) redirects
   straight to success without creating a second account. Then:
   - Creates the Supabase auth user (`admin.auth.admin.createUser`, random
     discarded password, `email_confirm: true`)
   - Generates a recovery link (`admin.auth.admin.generateLink`) and
     emails it via Resend (`lib/email.js`) as the password-set flow
   - Upserts `profiles`, inserts `organizations` +
     `organization_members` (role `owner`), `websites`, `activity_logs`
     (keywords/competitors/notes/plan as `metadata` jsonb), and `payments`
     (now includes `stripe_subscription_id` alongside the existing
     `stripe_payment_intent_id` / `stripe_checkout_session_id` columns)
   - **Attaches** `organization_id` to the subscription that
     `checkout.js` already created, via `stripe.subscriptions.update()` —
     no new subscription is created here (the old flow's "schedule the
     delayed subscription" step is gone entirely)
   - Sends the admin new-signup notification email
   - Redirects (303) to `/get-started/success/`
4. **`/get-started/success/`** (`api/get-started/success.js`) — simple
   confirmation page, copy updated to £750/month with no setup fee.

Each Supabase write in `complete.js` is wrapped in its own try/catch and
logged independently — a failure on one table (e.g. a schema mismatch,
see below) doesn't block or corrupt the others, and never blocks the
customer from reaching the success page after a real payment.

## ⚠️ Schema assumptions — verify before relying on this in production

**This session does not have access to acendia.us's actual codebase or
Supabase schema.** The table/column names used in `complete.js`
(`profiles.id/email/full_name`, `organizations.name`,
`organization_members.organization_id/user_id/role`,
`websites.organization_id/url/street_address/city/region/postcode/industry`,
`activity_logs.organization_id/type/metadata`,
`payments.organization_id/stripe_payment_intent_id/stripe_checkout_session_id/stripe_subscription_id/amount/currency/status`)
are this session's best-effort guess at reasonable conventions, not a port
of the real schema. The `stripe_subscription_id` column on `payments` is
new as of this reconciliation and has *not* been confirmed to exist.

**Before trusting a real customer's data to this**: open the Supabase
table editor and confirm these tables/columns actually exist with these
names. Mismatches will show up as errors in the Vercel function logs for
`complete.js` (each write logs its own failure independently) — check
those logs after your first real test run, don't just trust the "success"
redirect, since a failed write is deliberately non-fatal to the request.

## Environment variables this flow depends on

Confirmed set:
- `STRIPE_SECRET_KEY` — **verify whether this is a `sk_live_...` or
  `sk_test_...` key in Vercel before relying on any of this taking real
  payments.** This session cannot check that from here.

Assumed names — confirm these match what's actually in Vercel, or rename
in Vercel to match:
- `NEXT_PUBLIC_APP_URL` (optional, falls back to `https://acendia.uk`)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (optional, falls back to a
  hardcoded acendia.uk address), `ADMIN_NOTIFICATION_EMAIL` (optional —
  admin email is skipped with a log line if unset, not fatal)

## Testing this far

The reconciliation (checkout.js's price/mode change, complete.js's
subscription-attach rewrite, thank-you.js/success.js copy) has been
syntax-checked (`node --check`) but **not exercised end-to-end against
real Stripe or Supabase credentials** — this session has none. Please
test on the real deployment, in Stripe **test mode** first:

1. POST to `/api/get-started/checkout` (there is no live button yet —
   test by hand, e.g. a temporary form or `curl`) → Stripe test checkout
   for £750.00/month → card `4242 4242 4242 4242`
2. Lands on `/get-started/thank-you/` with the onboarding form, email
   prefilled, copy showing £750/month with no setup fee
3. Submit the form → should redirect to `/get-started/success/`
4. Check: a new row in `auth.users` for the email used; a "set your
   password" email arrives; the Vercel function logs for `complete.js`
   show no unexpected write failures (including the new
   `stripe_subscription_id` column write); the Subscription shows as
   `active` in the Stripe dashboard, billing immediately (no trial); the
   subscription's metadata shows the correct `organization_id`
5. Resubmit the same `sessionId` (refresh the onboarding form's POST) —
   should redirect straight to success without creating a second
   `organizations` row
