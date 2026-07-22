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

function updateAnalyticsConsent(granted) {
  if (typeof gtag === 'function') {
    gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
  }
}
function acceptAll() {
  localStorage.setItem('acendia_consent', JSON.stringify({ essential:true, analytics:true, marketing:true, ts: Date.now() }));
  updateAnalyticsConsent(true);
  hideCookie();
}
function rejectAll() {
  localStorage.setItem('acendia_consent', JSON.stringify({ essential:true, analytics:false, marketing:false, ts: Date.now() }));
  updateAnalyticsConsent(false);
  hideCookie();
}
function togglePanel() {
  document.getElementById('ck-panel').classList.toggle('open');
}
function savePrefs() {
  const a = document.getElementById('tgl-analytics').checked;
  const m = document.getElementById('tgl-marketing').checked;
  localStorage.setItem('acendia_consent', JSON.stringify({ essential:true, analytics:a, marketing:m, ts: Date.now() }));
  updateAnalyticsConsent(a);
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

// ── Contact tabs (Book a Call / Request an Audit) ────
const contactTabs = document.querySelectorAll('.contact-tab');
if (contactTabs.length) {
  const contactPanels = document.querySelectorAll('.contact-tab-panel');
  const activateContactTab = (name) => {
    contactTabs.forEach(t => {
      const isActive = t.dataset.tab === name;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive);
    });
    contactPanels.forEach(p => { p.hidden = p.dataset.panel !== name });
  };
  contactTabs.forEach(t => t.addEventListener('click', () => activateContactTab(t.dataset.tab)));
  const applyContactHash = () => activateContactTab(window.location.hash === '#audit' ? 'audit' : 'call');
  window.addEventListener('hashchange', applyContactHash);
  applyContactHash();
}

// ── Contact form (Web3Forms) ─────────────────────────
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const statusEl = document.getElementById('form-status');
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    statusEl.style.display = 'none';

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        contactForm.reset();
        statusEl.textContent = "Thanks — we've received your message and will follow up within one business day.";
        gtag('event', 'ads_conversion_SUBMIT_LEAD_FORM_1', {});
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      statusEl.textContent = 'Something went wrong sending your message. Please email us directly at support@acendia.agency.';
    } finally {
      statusEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
}

// ── Scroll fade-in ──────────────────────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') });
}, { threshold: 0.1 });
document.querySelectorAll('.fade').forEach(el => io.observe(el));

// ── Animated stat counters (rapid count-up on scroll) ─
function animateCount(el) {
  const raw = el.textContent.trim();
  const match = raw.match(/^([\d,]+)(.*)$/);
  if (!match) return;
  const target = parseInt(match[1].replace(/,/g, ''), 10);
  const suffix = match[2];
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.numbers-grid .num-big').forEach(el => countObserver.observe(el));

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
