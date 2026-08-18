// Delayed-billing helpers for the £499/mo SEO Package subscription.
//
// ASSUMPTION FLAG: acendia.us reportedly already has this exact logic in
// lib/billing.ts (POST_GOLIVE_BILLING_DELAY_DAYS / estimateDefaultBillingStart()).
// This is a best-effort re-implementation from the spec's own description,
// not a port of the real file (not available in this session). If the real
// file surfaces later, replace this file's contents with a straight port —
// the calling code in api/get-started/complete.js only depends on the two
// exports below, so the swap is mechanical.

// Matches the copy already live on the pricing card: "starting 14 days
// after your site goes live — not before."
const POST_GOLIVE_BILLING_DELAY_DAYS = 14;

// A brand-new signup's site isn't live yet, so there's no real go-live
// date to add 14 days to. Per the spec's own guidance ("an initial
// estimate of ~19 days out"), this estimates a typical build timeline
// (~5 days to go-live) plus the 14-day post-go-live delay, giving Stripe
// a concrete trial_end today. The estimate should be tightened up (or
// replaced with a real go-live-triggered subscription update via
// stripe.subscriptions.update({ trial_end })) once there's a mechanism
// for marking a site as actually live.
const ESTIMATED_DAYS_TO_GO_LIVE = 5;

/**
 * Returns a Unix timestamp (seconds) for the estimated first-billing date,
 * suitable for Stripe's `trial_end` on a subscription.
 * @param {Date} [from] — defaults to now.
 */
function estimateDefaultBillingStart(from = new Date()) {
  const days = ESTIMATED_DAYS_TO_GO_LIVE + POST_GOLIVE_BILLING_DELAY_DAYS;
  const ms = from.getTime() + days * 24 * 60 * 60 * 1000;
  return Math.floor(ms / 1000);
}

module.exports = {
  POST_GOLIVE_BILLING_DELAY_DAYS,
  ESTIMATED_DAYS_TO_GO_LIVE,
  estimateDefaultBillingStart,
};
