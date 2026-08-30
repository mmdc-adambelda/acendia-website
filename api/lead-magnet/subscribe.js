// POST /api/lead-magnet/subscribe
//
// Handles lead capture for the lead-magnet funnel (starting with
// /free-seo-ebook/, built to scale to future guides/checklists — see
// lib/leadMagnets.js). Called via fetch() from the landing page's form,
// not a native <form> POST, so the page can swap to a success/download
// state in place without navigating away.
//
// Flow: validate input (Zod) -> reject obvious spam (honeypot) -> look up
// the requested resource -> email the lead to support@acendia.agency
// (Resend, via lib/email.js) -> only on a successful send, issue a
// short-lived signed download token (lib/downloadToken.js) so the PDF is
// never reachable without having gone through this step.

const { leadMagnetSchema } = require('../../lib/validation');
const { getResource } = require('../../lib/leadMagnets');
const { issueToken } = require('../../lib/downloadToken');
const { sendLeadMagnetNotification } = require('../../lib/email');

// Extremely lightweight, best-effort rate limiting — same caveat as
// api/get-started/checkout.js: does not persist or share state across
// serverless instances, only slows down a single instance being hammered.
const recentRequests = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 6;

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
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({ success: false, message: 'Too many requests — please try again in a minute.' });
  }

  const parsed = leadMagnetSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Some required details were missing or invalid.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }
  const form = parsed.data;

  // Honeypot — a real visitor never fills this in (hidden via CSS on the
  // landing page). Return a fake success without emailing or minting a
  // token, so the bot has no signal it was blocked.
  if (form.company_website) {
    console.warn('lead-magnet/subscribe: honeypot triggered, silently dropping', { ip });
    return res.status(200).json({ success: true, downloadUrl: null });
  }

  const resource = getResource(form.resource);
  if (!resource) {
    return res.status(400).json({ success: false, message: 'Unknown resource requested.' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('lead-magnet/subscribe: RESEND_API_KEY is not set');
    return res.status(500).json({
      success: false,
      message: 'We could not process your request right now. Please email us directly at support@acendia.agency.',
    });
  }

  try {
    await sendLeadMagnetNotification({
      resourceLabel: resource.label,
      fullName: form.fullName,
      companyName: form.companyName,
      email: form.email,
      phone: form.phone,
      websiteUrl: form.websiteUrl,
      challenge: form.challenge,
      source: 'website-lead-magnet',
      landingPage: req.headers.referer || `/free-seo-ebook/ (resource: ${form.resource})`,
    });
  } catch (err) {
    console.error('lead-magnet/subscribe: failed to send lead notification email', err);
    // Deliberately does NOT issue a download token on email failure — the
    // lead must actually reach support@acendia.agency before the PDF is
    // handed over, since lead capture is the whole point of this funnel.
    return res.status(500).json({
      success: false,
      message: 'We could not process your request right now. Please email us directly at support@acendia.agency.',
    });
  }

  const { token, exp } = issueToken(form.resource);
  const downloadUrl = `/api/lead-magnet/download?resource=${encodeURIComponent(form.resource)}&token=${token}&exp=${exp}`;

  return res.status(200).json({ success: true, downloadUrl });
};
