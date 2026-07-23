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

// ── Hero audit widget (URL capture → simulated audit → Roam booking) ─
const auditForm = document.getElementById('audit-form');
if (auditForm) {
  const auditStates = {
    form: document.getElementById('audit-state-form'),
    loading: document.getElementById('audit-state-loading'),
    booking: document.getElementById('audit-state-booking'),
    confirmed: document.getElementById('audit-state-confirmed')
  };
  const showAuditState = (name) => {
    Object.keys(auditStates).forEach(key => { auditStates[key].hidden = key !== name });
  };

  const auditLoadingMessages = [
    'Connecting to your website…',
    'Checking search visibility…',
    'Reviewing on-page SEO signals…',
    'Analyzing local search presence…',
    'Compiling your report…'
  ];

  let roamInitialized = false;
  function initRoamLobby() {
    if (roamInitialized || typeof Roam === 'undefined') return;
    roamInitialized = true;
    const parentElement = document.getElementById('roam-lobby');
    Roam.initLobbyEmbed({
      url: 'https://ro.am/acendia-agency/',
      parentElement,
      lobbyConfiguration: 'default',
      accentColor: '#8d8d96',
      theme: 'dark',
      onSizeChange: (width, height) => {
        parentElement.style.height = `${height}px`;
      },
      onEventScheduled: (booking) => {
        const confirmedMsg = document.getElementById('audit-confirmed-message');
        let formatted = null;
        try {
          const raw = booking && (booking.dateTime || booking.startTime || booking.start || booking.date || booking.scheduledAt);
          if (raw) {
            const dt = new Date(raw);
            if (!isNaN(dt.getTime())) {
              formatted = dt.toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
            }
          }
        } catch (err) {}
        confirmedMsg.textContent = formatted
          ? `Thanks — you're booked for ${formatted}. We'll see you then! Come ready to claim your free SEO audit file.`
          : "Thanks — we've got your booking. We'll see you at your scheduled call! Come ready to claim your free SEO audit file.";
        showAuditState('confirmed');
      }
    });
  }

  auditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = document.getElementById('audit-url').value.trim();
    if (!url) return;

    try {
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: '93e0569b-3b4f-43be-9be0-889205d8743f',
          subject: 'New Free Audit Request — Homepage Widget',
          from_name: 'Acendia Website — Homepage Audit Widget',
          website: url
        })
      }).catch(() => {});
    } catch (err) {}

    showAuditState('loading');
    document.getElementById('audit-loading-domain').textContent = url;
    const statusEl = document.getElementById('audit-loading-status');
    const barEl = document.getElementById('audit-progress-bar');
    statusEl.textContent = auditLoadingMessages[0];
    barEl.style.width = '0%';

    const durationMs = 24000 + Math.random() * 6000;
    const startTime = Date.now();
    let msgIndex = 0;

    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % auditLoadingMessages.length;
      statusEl.textContent = auditLoadingMessages[msgIndex];
    }, durationMs / auditLoadingMessages.length);

    const progressInterval = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - startTime) / durationMs) * 100);
      barEl.style.width = pct + '%';
      if (pct >= 100) {
        clearInterval(progressInterval);
        clearInterval(msgInterval);
        showAuditState('booking');
        initRoamLobby();
      }
    }, 200);
  });
}

// ── Init ────────────────────────────────────────────
showCookie();
