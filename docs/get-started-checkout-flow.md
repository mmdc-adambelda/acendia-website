# "Join Now" → Stripe Checkout Flow — Status

Tracks progress against the full flow specified for acendia.uk (mirroring
the pay-first-then-onboard pattern already live on acendia.us).

> **⚠️ Out of date as of the Aug 2026 CRO audit.** The approved UK pricing
> is now £750/month, no setup fee (see `2026-08-26_Acendia_UK_US_Landing_Page_CRO_Audit_v1.md`).
> `checkout.js` has been updated to charge that directly as a subscription
> (Stripe Price `price_1U9GM1RqmdbsKtD2gMiWkX9v`), but **everything below
> this note still describes the old £199-setup-fee-then-£499/mo-later
> flow** — `thank-you.js`, `complete.js`, and `lib/billing.js` have NOT
> been updated to match. This whole flow remains unlinked from the live
> site (the homepage "Join Now!" button was removed in B1) and needs a
> full reconciliation pass before it's safe to re-link to a real button.

## Live now — full flow built end-to-end

1. **`/api/get-started/checkout.js`** — homepage "Join Now!" form POSTs
   here. Creates a Stripe Checkout Session (`mode: "payment"`,
   `currency: "gbp"`) for the **£199 setup fee only**. Saves the card
   (`setup_future_usage: "off_session"`) for later, disables Managed
   Payments, redirects (303) to Stripe's hosted checkout.
2. **`/get-started/thank-you/`** (`api/get-started/thank-you.js`, rewritten
   via `vercel.json`) — re-fetches the Checkout Session from Stripe's own
   API and only proceeds if `payment_status === "paid"`. On success,
   renders the full onboarding form (business name, contact, email —
   prefilled from Stripe, phone, website URL, address, industry, keywords,
   competitors, notes) as a real `<form method="POST">` with a hidden
   `sessionId` field.
3. **`/api/get-started/complete.js`** — the onboarding form POSTs here.
   Validates input with Zod (`lib/validation.js` — phone has no format
   check, per spec). **Re-verifies the Stripe session again** (a hidden
   form field is not proof of payment). Checks `payments` for an existing
   row matching this `stripe_payment_intent_id` first — **idempotent**: a
   duplicate submit (refresh/double-click) redirects straight to success
   without creating a second account. Then:
   - Creates the Supabase auth user (`admin.auth.admin.createUser`, random
     discarded password, `email_confirm: true`)
   - Generates a recovery link (`admin.auth.admin.generateLink`) and
     emails it via Resend (`lib/email.js`) as the password-set flow
   - Upserts `profiles`, inserts `organizations` +
     `organization_members` (role `owner`), `websites`, `activity_logs`
     (keywords/competitors/notes/plan as `metadata` jsonb), and `payments`
   - Schedules the delayed £499/mo subscription
     (`stripe.subscriptions.create` with inline `price_data`, no
     pre-created Stripe Price needed, `trial_end` from `lib/billing.js`),
     reusing the payment method saved from the setup-fee payment
   - Sends the admin new-signup notification email
   - Redirects (303) to `/get-started/success/`
4. **`/get-started/success/`** (`api/get-started/success.js`) — simple
   confirmation page.

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
`payments.organization_id/stripe_payment_intent_id/stripe_checkout_session_id/amount/currency/status`)
are this session's best-effort guess at reasonable conventions, not a port
of the real schema.

**Before trusting a real customer's data to this**: open the Supabase
table editor and confirm these tables/columns actually exist with these
names. Mismatches will show up as errors in the Vercel function logs for
`complete.js` (each write logs its own failure independently) — check
those logs after your first real test run, don't just trust the "success"
redirect, since a failed write is deliberately non-fatal to the request.

`lib/billing.js`'s `estimateDefaultBillingStart()` (14-day post-go-live
delay + a 5-day estimate-to-go-live, ~19 days total) is similarly a
re-implementation from the spec's own description, not a port of the real
`lib/billing.ts`. If/when that real file becomes available, it's a
mechanical swap — `complete.js` only depends on the one exported function.

## Environment variables this flow depends on

Confirmed set:
- `STRIPE_SECRET_KEY`

Assumed names — confirm these match what's actually in Vercel, or rename
in Vercel to match:
- `NEXT_PUBLIC_APP_URL` (optional, falls back to `https://acendia.uk`)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (optional, falls back to a
  hardcoded acendia.uk address), `ADMIN_NOTIFICATION_EMAIL` (optional —
  admin email is skipped with a log line if unset, not fatal)

## Testing this far

Verified locally (mocked Stripe/Supabase/Resend modules, see git history
for the exact test scripts): the happy path creates all six records with
correct field values, schedules a subscription with the correct £499.00
GBP monthly price and ~19-day `trial_end`, and redirects to success:
resubmitting the same `sessionId` short-circuits to success without
re-creating anything; missing required fields render a validation error
instead of proceeding. All three confirmed via direct handler invocation
with fake credentials that reached real Stripe servers where applicable.

**Not yet verified**: an actual real Stripe test-mode payment end-to-end
against your real Supabase project — this session has no live credentials
for either. Please test on the real deployment:

1. Click "Join Now!" → real Stripe checkout for £199.00 → card
   `4242 4242 4242 4242`
2. Lands on `/get-started/thank-you/` with the onboarding form, email
   prefilled
3. Submit the form → should redirect to `/get-started/success/`
4. Check: a new row in `auth.users` for the email used; a "set your
   password" email arrives; the Vercel function logs for `complete.js`
   show no unexpected write failures; the new Subscription shows as
   `trialing` in the Stripe dashboard (not `active`, not billing yet)
