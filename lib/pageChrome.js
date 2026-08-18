// Minimal shared HTML wrapper for the server-rendered /get-started/* pages,
// matching the static site's existing dark hero look (assets/css/style.css).

function renderPage({ title, metaTitle, body, maxWidth = 640 }) {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(metaTitle || title)} | Acendia International</title>
<link rel="icon" type="image/png" href="/images/acendia-favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Yeseva+One&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.min.css?v=min17">
</head>
<body>
<section class="hero page-hero">
  <div class="hero-dots"></div>
  <div class="hero-glow1"></div>
  <div class="container" style="position:relative;z-index:2;max-width:${maxWidth}px">
    <h1 class="display" style="margin-bottom:20px">${title}</h1>
    ${body}
  </div>
</section>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

module.exports = { renderPage, escapeHtml };
