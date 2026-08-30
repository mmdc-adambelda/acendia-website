// GET /api/lead-magnet/download?resource=...&token=...&exp=...
//
// Streams the requested lead-magnet PDF only if the signed, time-limited
// token (issued by /api/lead-magnet/subscribe on a successful lead
// submission) is valid — see lib/downloadToken.js. The PDF itself lives
// under api/_assets/ebooks/, outside any statically-served directory, so
// this handler is the only path to it.

const fs = require('fs');
const { getResource } = require('../../lib/leadMagnets');
const { verifyToken } = require('../../lib/downloadToken');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }

  // Never let this response (or an error page it produces) get indexed —
  // defense in depth alongside robots.txt.
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  const { resource: resourceSlug, token, exp } = req.query || {};

  const resource = typeof resourceSlug === 'string' ? getResource(resourceSlug) : null;
  if (!resource) {
    return sendErrorPage(res, 404, 'We couldn’t find that guide. Please request it again.');
  }

  let valid = false;
  try {
    valid = verifyToken(resourceSlug, exp, token);
  } catch (err) {
    console.error('lead-magnet/download: token verification failed', err);
    return sendErrorPage(res, 500, 'Something went wrong. Please request the guide again.');
  }

  if (!valid) {
    return sendErrorPage(
      res,
      403,
      'This download link is invalid or has expired. Please request the guide again to get a fresh link.'
    );
  }

  try {
    const fileBuffer = fs.readFileSync(resource.filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resource.downloadFilename}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(200).send(fileBuffer);
  } catch (err) {
    console.error('lead-magnet/download: failed to read PDF file', err);
    return sendErrorPage(res, 500, 'We could not retrieve your download right now. Please contact us directly.');
  }
};

function sendErrorPage(res, status, message) {
  res.status(status).setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html>
<html lang="en-GB"><head><meta charset="UTF-8"><meta name="robots" content="noindex,nofollow">
<title>Download unavailable — Acendia International</title>
<style>body{font-family:Arial,sans-serif;max-width:520px;margin:80px auto;padding:0 24px;color:#111;text-align:center}
a{color:#5B50FF;font-weight:700;text-decoration:none}</style></head>
<body><h1>Download unavailable</h1><p>${message}</p><p><a href="/free-seo-ebook/">Request the guide again</a></p></body></html>`);
}
