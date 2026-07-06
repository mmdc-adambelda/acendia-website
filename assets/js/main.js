// ═══════════════════════════════════════════════════════
// ACENDIA INTERNATIONAL — SHARED SITE BEHAVIOUR
// ═══════════════════════════════════════════════════════

// ── Cookie consent ──────────────────────────────────
const ck = document.getElementById('cookie');

function showCookie() {
  if (ck && !localStorage.getItem('acendia_consent')) {
    setTimeout(() => ck.classList.add('show'), 2000);
  }
}
function hideCookie() { if (ck) ck.classList.remove('show') }

function acceptAll() {
  localStorage.setItem('acendia_consent', JSON.stringify({ essential:true, analytics:true, marketing:true, ts: Date.now() }));
  hideCookie();
}
function rejectAll() {
  localStorage.setItem('acendia_consent', JSON.stringify({ essential:true, analytics:false, marketing:false, ts: Date.now() }));
  hideCookie();
}
function togglePanel() {
  document.getElementById('ck-panel').classList.toggle('open');
}
function savePrefs() {
  const a = document.getElementById('tgl-analytics').checked;
  const m = document.getElementById('tgl-marketing').checked;
  localStorage.setItem('acendia_consent', JSON.stringify({ essential:true, analytics:a, marketing:m, ts: Date.now() }));
  hideCookie();
}
function openCookieSettings() {
  if (ck) ck.classList.add('show');
  return false;
}

// ── Sticky nav ──────────────────────────────────────
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// ── Mobile menu drawer ──────────────────────────────
const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('mobile-drawer');
if (hamburger && drawer) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    drawer.classList.toggle('open');
  });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
  }));
}

// ── Scroll fade-in ──────────────────────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') });
}, { threshold: 0.1 });
document.querySelectorAll('.fade').forEach(el => io.observe(el));

// ── FAQ accordion ────────────────────────────────────
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    item.parentElement.querySelectorAll('.faq-item.open').forEach(o => { if (o !== item) o.classList.remove('open') });
    item.classList.toggle('open', !wasOpen);
  });
});

// ── Init ────────────────────────────────────────────
showCookie();
