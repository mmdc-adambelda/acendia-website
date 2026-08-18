// GET /get-started/thank-you/?session_id=cs_test_...  (rewritten from
// /api/get-started/thank-you — see vercel.json)
//
// Re-fetches the Checkout Session from Stripe's own API and only shows a
// confirmed state if payment_status === "paid". The URL's session_id is
// never trusted on its own — anyone could type a fake one.
//
// NOTE — scope of what's built so far: this page currently only confirms
// payment. It does NOT yet collect business details, create the Supabase
// account/org, or schedule the delayed £499/mo subscription — that needs
// the acendia.us reference schema/helpers before it can be built to match
// existing conventions rather than guessing at them. Until then this page
// tells the customer we'll follow up by email, which is true (Stripe's
// own receipt goes out automatically; a manual admin follow-up is still
// needed for now).

const Stripe = require('stripe');

const SITE_CHROME_HEAD = `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Payment Received | Acendia International</title>
<link rel="icon" type="image/png" href="/images/acendia-favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Yeseva+One&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.min.css?v=min17">
`;

function renderPage({ title, body }) {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
${SITE_CHROME_HEAD}
</head>
<body>
<section class="hero page-hero">
  <div class="hero-dots"></div>
  <div class="hero-glow1"></div>
  <div class="container" style="position:relative;z-index:2;max-width:640px">
    <h1 class="display" style="margin-bottom:20px">${title}</h1>
    ${body}
  </div>
</section>
</body>
</html>`;
}

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
    res.end(
      renderPage({
        title: 'You’re In — Payment Received.',
        body: `
          <p class="hero-sub">Thanks${email ? `, we've got your payment confirmation for <strong>${email}</strong>` : ''} — your £199 setup fee is paid.</p>
          <p class="hero-sub">Your £499/month plan won't start billing until 14 days after your site goes live — not before.</p>
          <p class="hero-sub">Our team will be in touch by email shortly to collect your business details and get started. If you don't hear from us within one business day, <a href="/contact.html">reach out</a>.</p>
        `,
      })
    );
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
