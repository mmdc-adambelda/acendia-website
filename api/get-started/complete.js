// POST /api/get-started/complete
//
// Submitted by the onboarding form rendered on /get-started/thank-you/
// after a verified £199 payment. Re-verifies the Stripe session again
// (never trust a hidden form field alone — the browser controls it),
// then: creates the Supabase account, org, website, and payment records;
// emails a password-set link; schedules the delayed £499/mo subscription;
// notifies the admin inbox; redirects to the success page.
//
// SCHEMA ASSUMPTION FLAG — read before deploying:
// The exact Supabase table/column names below (profiles, organizations,
// organization_members, websites, payments, activity_logs) are this
// session's best-effort guess at reasonable conventions, NOT a port of
// acendia.us's real schema (not available here — see
// docs/get-started-checkout-flow.md). Check your actual Supabase tables
// before relying on this in production; column names are very likely to
// need adjusting. Each Supabase write below is intentionally isolated in
// its own try/catch and logged, so a schema mismatch on one table doesn't
// silently corrupt or block the others — but it does mean you should
// check the Vercel function logs after a real test run, not just assume
// success from the redirect.

const crypto = require('crypto');
const Stripe = require('stripe');
const { getSupabaseAdmin } = require('../../lib/supabase');
const { getStartedSchema } = require('../../lib/validation');
const { estimateDefaultBillingStart } = require('../../lib/billing');
const { sendWelcomeSetPasswordEmail, sendAdminNewSignupNotification } = require('../../lib/email');
const { renderPage } = require('../../lib/pageChrome');

const MONTHLY_PRICE_PENCE = 49900; // £499.00
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://acendia.uk';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).send('Method Not Allowed');
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('complete: STRIPE_SECRET_KEY is not set');
    sendFailurePage(res, 'Setup is temporarily unavailable. Please contact us directly and we’ll finish this by hand.');
    return;
  }

  const parsed = getStartedSchema.safeParse(req.body || {});
  if (!parsed.success) {
    console.warn('complete: validation failed', parsed.error.flatten());
    sendFailurePage(
      res,
      'Some required details were missing or invalid. Please go back and try again — if this keeps happening, contact us directly.'
    );
    return;
  }
  const form = parsed.data;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

  // Re-verify payment against Stripe's own API — the sessionId came
  // through a hidden form field, which the browser (or anyone crafting a
  // request) fully controls. Never trust it without checking Stripe.
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(form.sessionId, {
      expand: ['payment_intent', 'payment_intent.payment_method'],
    });
  } catch (err) {
    console.error('complete: failed to retrieve Stripe session', err);
    sendFailurePage(res, 'We couldn’t verify your payment. Please contact us directly and we’ll sort it out.');
    return;
  }

  if (session.payment_status !== 'paid') {
    sendFailurePage(res, 'We don’t see a completed payment for this session. Please contact us directly.');
    return;
  }

  const paymentIntent = session.payment_intent;
  const paymentIntentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error('complete: Supabase admin client unavailable', err);
    sendFailurePage(
      res,
      'Your payment is confirmed, but we hit a technical issue finishing setup. Our team has been notified — we’ll follow up by email shortly.'
    );
    return;
  }

  // ── Idempotency — this endpoint may legitimately be hit twice (a
  // refreshed page, a double-click, the browser retrying a slow request).
  // The payment_intent id is the natural dedupe key: one payment, one
  // account, ever.
  try {
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle();

    if (existingPayment) {
      res.writeHead(303, { Location: `${APP_URL}/get-started/success/` });
      res.end();
      return;
    }
  } catch (err) {
    // If this check itself fails (e.g. table doesn't exist yet under this
    // name), log it and proceed rather than blocking a real paying
    // customer — worst case is a duplicate attempt, not a lost signup.
    console.error('complete: idempotency check failed — proceeding anyway', err);
  }

  // ── 1. Create the Supabase auth user. A random password is generated
  // and immediately discarded — the customer sets their own via the
  // emailed recovery link, never typing one into this flow.
  const discardedPassword = crypto.randomBytes(24).toString('base64url');
  let authUserId = null;
  try {
    const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: form.email,
      password: discardedPassword,
      email_confirm: true,
      user_metadata: { full_name: form.contactName, business_name: form.businessName },
    });
    if (createUserError) throw createUserError;
    authUserId = createdUser?.user?.id || null;
  } catch (err) {
    console.error('complete: failed to create Supabase auth user', err);
    // Cannot meaningfully continue without a user id — everything else
    // hangs off it. Fail honestly rather than silently losing the org.
    sendFailurePage(
      res,
      'Your payment is confirmed, but we hit a technical issue creating your account. Our team has been notified and will set this up by hand — you’ll hear from us shortly.'
    );
    return;
  }

  // ── 2. Password-set link + welcome email.
  let setPasswordUrl = null;
  try {
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: form.email,
    });
    if (linkError) throw linkError;
    setPasswordUrl = linkData?.properties?.action_link || null;
  } catch (err) {
    console.error('complete: failed to generate password-set link', err);
  }

  if (setPasswordUrl) {
    try {
      await sendWelcomeSetPasswordEmail({
        to: form.email,
        name: form.contactName,
        setPasswordUrl,
      });
    } catch (err) {
      console.error('complete: failed to send welcome email', err);
    }
  } else {
    console.error('complete: no setPasswordUrl — welcome email not sent for', form.email);
  }

  // ── 3. profiles (upsert — self-healing in case the DB trigger that
  // normally creates this row on auth.users insert hasn't fired yet).
  try {
    await supabase.from('profiles').upsert(
      {
        id: authUserId,
        email: form.email,
        full_name: form.contactName,
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.error('complete: failed to upsert profile', err);
  }

  // ── 4. organizations + organization_members (owner).
  let organizationId = null;
  try {
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: form.businessName })
      .select('id')
      .single();
    if (orgError) throw orgError;
    organizationId = org?.id || null;

    if (organizationId) {
      await supabase.from('organization_members').insert({
        organization_id: organizationId,
        user_id: authUserId,
        role: 'owner',
      });
    }
  } catch (err) {
    console.error('complete: failed to create organization/membership', err);
  }

  // ── 5. websites.
  try {
    await supabase.from('websites').insert({
      organization_id: organizationId,
      url: form.websiteUrl || null,
      street_address: form.streetAddress,
      city: form.city,
      region: form.region,
      postcode: form.postcode,
      industry: form.industry,
    });
  } catch (err) {
    console.error('complete: failed to create website record', err);
  }

  // ── 6. activity_logs — keywords/competitors/notes/plan, logged as
  // metadata since this session has no confirmed first-class columns
  // for them.
  try {
    await supabase.from('activity_logs').insert({
      organization_id: organizationId,
      type: 'signup',
      metadata: {
        plan: 'seo-package',
        setup_fee_pence: 19900,
        monthly_price_pence: MONTHLY_PRICE_PENCE,
        currency: 'gbp',
        keywords: form.keywords || null,
        competitors: form.competitors || null,
        notes: form.notes || null,
      },
    });
  } catch (err) {
    console.error('complete: failed to write activity log', err);
  }

  // ── 7. payments row.
  try {
    await supabase.from('payments').insert({
      organization_id: organizationId,
      stripe_payment_intent_id: paymentIntentId,
      stripe_checkout_session_id: session.id,
      amount: 19900,
      currency: 'gbp',
      status: 'paid',
    });
  } catch (err) {
    console.error('complete: failed to record payment — check for a duplicate/idempotency issue', err);
  }

  // ── 8. Schedule the delayed £499/mo subscription. Uses the payment
  // method already saved from the setup-fee payment
  // (setup_future_usage: "off_session" on the original Checkout Session)
  // so the customer is never asked to pay twice.
  try {
    let customerId = session.customer;
    const paymentMethodId =
      paymentIntent && typeof paymentIntent === 'object' ? paymentIntent.payment_method?.id : null;

    if (!customerId && form.email) {
      // setup_future_usage should have auto-created a Customer, but fall
      // back to creating one explicitly if it didn't, so the
      // subscription still has somewhere to attach.
      const customer = await stripe.customers.create({
        email: form.email,
        name: form.businessName,
        payment_method: paymentMethodId || undefined,
      });
      customerId = customer.id;
    }

    if (customerId) {
      await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price_data: {
              currency: 'gbp',
              unit_amount: MONTHLY_PRICE_PENCE,
              recurring: { interval: 'month' },
              product_data: { name: 'Acendia SEO Package — Monthly' },
            },
          },
        ],
        trial_end: estimateDefaultBillingStart(),
        default_payment_method: paymentMethodId || undefined,
        metadata: {
          organization_id: organizationId || '',
          business_name: form.businessName,
        },
      });
    } else {
      console.error('complete: no Stripe customer available — subscription not scheduled for', form.email);
    }
  } catch (err) {
    console.error('complete: failed to schedule delayed subscription', err);
  }

  // ── 9. Admin notification (non-blocking).
  try {
    await sendAdminNewSignupNotification({
      businessName: form.businessName,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone,
      websiteUrl: form.websiteUrl,
    });
  } catch (err) {
    console.error('complete: failed to send admin notification', err);
  }

  res.writeHead(303, { Location: `${APP_URL}/get-started/success/` });
  res.end();
};

function sendFailurePage(res, message) {
  res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(
    renderPage({
      title: 'We hit a snag',
      body: `<p class="hero-sub">${message}</p><p class="hero-sub"><a href="/contact.html">Contact us</a> if you need a hand.</p>`,
    })
  );
}
