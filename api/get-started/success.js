// GET /get-started/success/  (rewritten from /api/get-started/success —
// see vercel.json). Simple confirmation shown after /api/get-started/complete
// finishes account creation.

const { renderPage } = require('../../lib/pageChrome');

module.exports = async function handler(req, res) {
  res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(
    renderPage({
      title: 'You’re All Set.',
      metaTitle: 'Setup Complete',
      body: `
        <p class="hero-sub">Thanks — we've got everything we need. Check your inbox for an email to set your password and access your client portal.</p>
        <p class="hero-sub">Your team will be in touch shortly to kick things off. Your £750/month plan is active now — no setup fee, no lock-in contract.</p>
        <a href="/" class="btn btn-white btn-lg" style="margin-top:12px">Back to Homepage</a>
      `,
    })
  );
};
