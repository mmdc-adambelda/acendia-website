// Resend email helpers.
//
// ASSUMPTION FLAG: env var names (RESEND_API_KEY, RESEND_FROM_EMAIL,
// ADMIN_NOTIFICATION_EMAIL) are best-guess conventional names — confirm/
// rename in Vercel if acendia.us used something different.

const { Resend } = require('resend');

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set.');
  }
  return new Resend(apiKey);
}

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL || 'Acendia International <hello@acendia.uk>';
}

/**
 * Sends the "set your password" welcome email after a new signup's
 * Supabase account has been created.
 */
async function sendWelcomeSetPasswordEmail({ to, name, setPasswordUrl }) {
  const resend = getResend();
  const firstName = (name || '').split(' ')[0] || 'there';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">
      <h1 style="font-size:22px;margin-bottom:16px">Welcome to Acendia, ${escapeHtml(firstName)}!</h1>
      <p style="line-height:1.6">Thanks for getting started — your £199 setup fee is confirmed and our team is already reviewing your details.</p>
      <p style="line-height:1.6">Set your password to access your client portal:</p>
      <p style="margin:28px 0">
        <a href="${setPasswordUrl}" style="background:#5B50FF;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">Set Your Password</a>
      </p>
      <p style="line-height:1.6;color:#555;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  return resend.emails.send({
    from: getFromAddress(),
    to,
    subject: 'Welcome to Acendia — set your password',
    html,
  });
}

/**
 * Notifies the internal admin inbox of a new paid signup.
 */
async function sendAdminNewSignupNotification({ businessName, contactName, email, phone, websiteUrl }) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.warn('ADMIN_NOTIFICATION_EMAIL is not set — skipping admin notification email.');
    return null;
  }

  const resend = getResend();
  const html = `
    <div style="font-family:Arial,sans-serif">
      <h2>New SEO Package signup</h2>
      <ul>
        <li><strong>Business:</strong> ${escapeHtml(businessName)}</li>
        <li><strong>Contact:</strong> ${escapeHtml(contactName)}</li>
        <li><strong>Email:</strong> ${escapeHtml(email)}</li>
        <li><strong>Phone:</strong> ${escapeHtml(phone || '—')}</li>
        <li><strong>Website:</strong> ${escapeHtml(websiteUrl || '—')}</li>
      </ul>
    </div>
  `;

  return resend.emails.send({
    from: getFromAddress(),
    to: adminEmail,
    subject: `New signup: ${businessName}`,
    html,
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

module.exports = { sendWelcomeSetPasswordEmail, sendAdminNewSignupNotification };
