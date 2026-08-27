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

// ── Web3Forms submission handler (reusable) ──────────
function initWeb3Form(formId, statusId, successMessage, onSuccess) {
  const form = document.getElementById(formId);
  if (!form) return;
  const statusEl = document.getElementById(statusId);
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    statusEl.style.display = 'none';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        form.reset();
        statusEl.textContent = successMessage;
        if (onSuccess) onSuccess();
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

// ── Contact form: inline validation + visible success state ──
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const statusEl = document.getElementById('form-status');
  const successEl = document.getElementById('form-success');
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  let startedTracked = false;

  const validators = {
    name: (el) => el.value.trim().length > 0,
    business_name: (el) => el.value.trim().length > 0,
    email: (el) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()),
    phone: (el) => el.value.trim().length > 0,
    consent: (el) => el.checked
  };

  function setFieldError(el, hasError) {
    const wrap = el.closest('[data-field]');
    if (wrap) wrap.classList.toggle('field-error', hasError);
  }

  function validateField(el) {
    const check = validators[el.name];
    if (!check) return true;
    const ok = check(el);
    setFieldError(el, !ok);
    return ok;
  }

  Object.keys(validators).forEach((name) => {
    const el = form.elements[name];
    if (!el) return;
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => {
      if (el.closest('[data-field]')?.classList.contains('field-error')) validateField(el);
    });
    el.addEventListener('focus', () => {
      if (!startedTracked) {
        startedTracked = true;
        if (typeof gtag === 'function') gtag('event', 'form_start', { form_id: 'contact-form' });
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;
    Object.keys(validators).forEach((name) => {
      const el = form.elements[name];
      if (el && !validateField(el)) valid = false;
    });
    if (!valid) {
      const firstError = form.querySelector('.field-error input, .field-error textarea, .field-error select');
      if (firstError) firstError.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    statusEl.style.display = 'none';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        form.classList.add('hide-on-success');
        successEl.classList.add('show');
        if (typeof gtag === 'function') {
          gtag('event', 'ads_conversion_SUBMIT_LEAD_FORM_1', {});
          gtag('event', 'form_submit_success', { form_id: 'contact-form' });
        }
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      statusEl.textContent = 'Something went wrong sending your message. Please email us directly at support@acendia.agency.';
      statusEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
})();

initWeb3Form(
  'careers-form',
  'careers-form-status',
  "Thanks — your application has been received. We'll review it and follow up if you're a good fit."
);

// ── Lead magnet: "The Local SEO Scorecard" (blog articles) ──
// NOTE / CONTENT DEPENDENCY: the scorecard itself doesn't exist yet
// as a deliverable (no automated PDF/tool/email sequence is wired
// up). The success copy below is deliberately honest about that —
// a person follows up manually rather than an instant automated send.
initWeb3Form(
  'leadmagnet-mid',
  'leadmagnet-mid-status',
  "Thanks — we'll email your Local SEO Scorecard within one business day.",
  () => { if (typeof gtag === 'function') gtag('event', 'lead_magnet_submit', { placement: 'mid-article' }); }
);
initWeb3Form(
  'leadmagnet-end',
  'leadmagnet-end-status',
  "Thanks — we'll email your Local SEO Scorecard within one business day.",
  () => { if (typeof gtag === 'function') gtag('event', 'lead_magnet_submit', { placement: 'end-article' }); }
);

// ── GA4: primary CTA click (delegated — covers every
//    "Get My Free SEO Audit" link/button site-wide) ──
document.addEventListener('click', (e) => {
  const el = e.target.closest('a[href*="contact.html#audit"], a[href="#audit"]');
  if (!el || typeof gtag !== 'function') return;
  gtag('event', 'primary_cta_click', {
    link_text: el.textContent.trim(),
    link_location: window.location.pathname
  });
});

// ── GA4: calendar booking click (contact.html) ───────
const calendarLink = document.getElementById('calendar-link');
if (calendarLink) {
  calendarLink.addEventListener('click', () => {
    if (typeof gtag === 'function') gtag('event', 'calendar_booking_click', {});
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
