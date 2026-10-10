'use strict';

/* ── REFS ─────────────────────────────────────────────────────── */
const html        = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const burger      = document.getElementById('burger');
const mobileNav   = document.getElementById('mobile-nav');
const navbar      = document.getElementById('navbar');
const backTop     = document.getElementById('back-top');
const yearEl      = document.getElementById('year');
const navLinks    = document.querySelectorAll('.nav-link');
const sections    = document.querySelectorAll('section[id], footer[id]');
const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('form-status');
const submitBtn   = document.getElementById('submit-btn');

/* ── YEAR ─────────────────────────────────────────────────────── */
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── THEME ────────────────────────────────────────────────────── */
function applyTheme(t) {
  html.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
    themeToggle.setAttribute('aria-label',
      t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = t === 'dark' ? '#0A0F1E' : '#F8FAFC';
}

// Resolve initial theme: saved → OS → default dark
const saved = localStorage.getItem('theme');
if (saved) {
  applyTheme(saved);
} else {
  applyTheme(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
}

/* ── SCROLL EVENTS ────────────────────────────────────────────── */
function onScroll() {
  const y = window.scrollY;
  // Nav shadow
  if (navbar) navbar.classList.toggle('scrolled', y > 16);
  // Back-to-top
  if (backTop) backTop.classList.toggle('visible', y > 480);
  // Active link
  updateActiveLink();
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

/* ── ACTIVE NAV ───────────────────────────────────────────────── */
function updateActiveLink() {
  let current = '';
  sections.forEach(sec => {
    if (sec.getBoundingClientRect().top <= 100) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

/* ── MOBILE MENU ──────────────────────────────────────────────── */
function closeMenu() {
  burger?.classList.remove('open');
  burger?.setAttribute('aria-expanded', 'false');
  mobileNav?.classList.remove('open');
  mobileNav?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function openMenu() {
  burger?.classList.add('open');
  burger?.setAttribute('aria-expanded', 'true');
  mobileNav?.classList.add('open');
  mobileNav?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

burger?.addEventListener('click', () =>
  burger.classList.contains('open') ? closeMenu() : openMenu()
);
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', closeMenu));
document.addEventListener('click', e => {
  if (mobileNav?.classList.contains('open') && !navbar?.contains(e.target)) closeMenu();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileNav?.classList.contains('open')) { closeMenu(); burger?.focus(); }
});
let _rt;
window.addEventListener('resize', () => {
  clearTimeout(_rt);
  _rt = setTimeout(() => { if (window.innerWidth > 768) closeMenu(); }, 150);
});

/* ── BACK TO TOP ──────────────────────────────────────────────── */
backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── SCROLL REVEAL ────────────────────────────────────────────── */
const revealSelectors = [
  // hero elements are handled by entrance animations — excluded here
  '.about-left',   '.about-right',
  '.service-card',
  '.skill-card',
  '.proj-row',
  '.tcard',
  '.cert-card',
  '.contact-left', '.contact-form',
];  '.about-stat-card',
  '.service-card',
  '.skill-card',
  '.project-card',
  '.tcard',
  '.contact-left', '.contact-form',
];

revealSelectors.forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    // skip elements already handled by entrance animations
    if (el.classList.contains('anim-ready')) return;
    el.classList.add('reveal');
    const isGrid = ['service-card','skill-card','project-card','tcard','about-stat-card']
      .some(c => el.classList.contains(c));
    if (isGrid) el.style.transitionDelay = `${(i % 3) * 0.09}s`;
  });
});
    if (isGrid) el.style.transitionDelay = `${(i % 3) * 0.09}s`;
  });
});

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── CONTACT FORM ─────────────────────────────────────────────── */
function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function setStatus(msg, type) {
  if (!formStatus) return;
  formStatus.textContent = msg;
  formStatus.className = `form-status ${type}`;
}

if (contactForm) {
  // Live validation on blur
  contactForm.querySelectorAll('.form-input, .form-textarea').forEach(field => {
    field.addEventListener('blur', () => {
      if (!field.required) return;
      const bad = !field.value.trim() || (field.type === 'email' && !isValidEmail(field.value));
      field.classList.toggle('error', bad);
    });
    field.addEventListener('input', () => {
      if (field.classList.contains('error') && field.value.trim()) {
        if (field.type !== 'email' || isValidEmail(field.value)) field.classList.remove('error');
      }
    });
  });

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    contactForm.querySelectorAll('[required]').forEach(field => {
      const bad = !field.value.trim() || (field.type === 'email' && !isValidEmail(field.value));
      field.classList.toggle('error', bad);
      if (bad) ok = false;
    });

    if (!ok) { setStatus('Please fill in all fields correctly.', 'error'); return; }

    const label = submitBtn?.querySelector('.btn-label');
    if (submitBtn) submitBtn.disabled = true;
    if (label) label.textContent = 'Sending…';
    setStatus('', '');

    // Swap this setTimeout for a real fetch() to your backend / email service
    setTimeout(() => {
      if (submitBtn) submitBtn.disabled = false;
      if (label) label.textContent = 'Send Message';
      setStatus("Message sent! I'll get back to you within 24 hours.", 'success');
      contactForm.reset();
      setTimeout(() => setStatus('', ''), 6000);
    }, 1600);
  });
}
