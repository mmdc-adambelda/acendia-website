// Shared config for the lead-magnet (ebook/guide/checklist) system.
//
// SCALABILITY: to add a new lead magnet (e.g. a future
// /free-local-seo-guide/), add one entry here pointing at its PDF under
// api/_assets/ebooks/ and its landing page folder — no changes needed to
// api/lead-magnet/subscribe.js, api/lead-magnet/download.js, or the token
// helpers. Only a new static landing page (copy free-seo-ebook/index.html
// as a starting point) and this one config entry are required.

const path = require('path');

const RESOURCES = {
  'onpage-seo-guide': {
    // Used in the lead-notification email subject line.
    label: 'On-Page SEO Guide',
    // Filename presented to the visitor on download (not the path on disk).
    downloadFilename: 'Acendia-Business-Owners-Guide-to-On-Page-SEO.pdf',
    // Path on disk, inside api/ so Vercel's static file server never
    // exposes it directly — only this project's own serverless functions
    // can read it.
    filePath: path.join(__dirname, '..', 'api', '_assets', 'ebooks', 'acendia-onpage-seo-guide.pdf'),
  },
};

function getResource(slug) {
  return RESOURCES[slug] || null;
}

module.exports = { RESOURCES, getResource };
