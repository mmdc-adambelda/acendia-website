// GET /get-started/thank-you/?session_id=cs_test_...  (rewritten from
// /api/get-started/thank-you — see vercel.json)
//
// Re-fetches the Checkout Session from Stripe's own API and only renders
// the onboarding form if payment_status === "paid". The URL's session_id
// is never trusted on its own — anyone could type a fake one. The
// onboarding form below is a real <form method="POST">, not fetch() — see
// docs/get-started-checkout-flow.md for why that matters.

const Stripe = require('stripe');
const { renderPage, escapeHtml } = require('../../lib/pageChrome');

module.exports = async function handler(req, res) {
  const sessionId = req.query?.session_id;

  if (!sessionId || typeof sessionId !== 'string') {
    res.status(400).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(
      renderPage({
        title: 'We couldn’t find your payment',
        body: `<p class="hero-sub">No session was provided. If you just paid, check the confirmation email from Stripe, or <a href="/contact.html">contact us</a> and we'll sort it out.</p>`,
      })
    );
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('thank-you: STRIPE_SECRET_KEY is not set');
    res.status(500).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(
      renderPage({
        title: 'Something went wrong',
        body: `<p class="hero-sub">We couldn't verify your payment right now. Please <a href="/contact.html">contact us</a> — don't worry, if Stripe charged you, we'll see it.</p>`,
      })
    );
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    if (session.payment_status !== 'paid') {
      res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(
        renderPage({
          title: 'Payment not confirmed yet',
          body: `<p class="hero-sub">We don't see a completed payment for this session. If you were charged, give it a minute and refresh, or <a href="/contact.html">contact us</a> directly.</p>`,
        })
      );
      return;
    }

    const email = session.customer_details?.email || '';

    res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderOnboardingPage({ sessionId, email }));
  } catch (err) {
    console.error('thank-you: failed to verify Stripe session', err);
    res.status(500).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(
      renderPage({
        title: 'Something went wrong',
        body: `<p class="hero-sub">We couldn't verify your payment right now. Please <a href="/contact.html">contact us</a> — don't worry, if Stripe charged you, we'll see it.</p>`,
      })
    );
  }
};

function renderOnboardingPage({ sessionId, email }) {
  const field = (name, label, opts = {}) => `
    <div class="form-field">
      <label for="${name}">${label}${opts.required === false ? ' <span style="font-weight:400;color:var(--gray-4)">(optional)</span>' : ''}</label>
      ${opts.textarea
        ? `<textarea id="${name}" name="${name}" ${opts.required !== false ? 'required' : ''}>${escapeHtml(opts.value || '')}</textarea>`
        : `<input type="${opts.type || 'text'}" id="${name}" name="${name}" value="${escapeHtml(opts.value || '')}" ${opts.required !== false ? 'required' : ''}>`
      }
    </div>
  `;

  const body = `
    <p class="hero-sub">Your £199 setup fee is paid — your £499/month plan won't start billing until 14 days after your site goes live, not before. Tell us about your business so we can get started.</p>

    <form method="POST" action="/api/get-started/complete" style="margin-top:32px">
      <input type="hidden" name="sessionId" value="${escapeHtml(sessionId)}">

      ${field('businessName', 'Business Name')}
      ${field('contactName', 'Primary Contact Name')}
      ${field('email', 'Email Address', { type: 'email', value: email })}
      ${field('phone', 'Phone Number', { type: 'tel' })}
      ${field('websiteUrl', 'Website URL', { required: false })}
      ${field('streetAddress', 'Street Address')}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        ${field('city', 'City')}
        ${field('region', 'State / Region')}
      </div>
      ${field('postcode', 'Postcode')}
      ${field('industry', 'Primary Service / Industry')}
      ${field('keywords', 'Keywords You Want to Rank For', { textarea: true, required: false })}
      ${field('competitors', 'Competitors You Want to Outrank', { textarea: true, required: false })}
      ${field('notes', 'Notes / Special Requirements', { textarea: true, required: false })}

      <button type="submit" class="btn btn-white btn-lg" style="width:100%;margin-top:8px">Complete Setup →</button>
    </form>
  `;

  return renderPage({
    title: 'You’re In — Payment Received.',
    metaTitle: 'Complete Your Setup',
    body,
  });
}
