'use strict';

/* ── THEME (runs immediately — before DOM ready is fine) ─────── */
const html = document.documentElement;

function applyTheme(t) {
  html.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = t === 'dark' ? '#0A0F1E' : '#F8FAFC';
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

// Apply saved or OS preference immediately
const _saved = localStorage.getItem('theme');
applyTheme(_saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));

/* ── PRELOADER ─────────────────────────────────────────────────
   Runs the loading overlay, then reveals the page and fires the
   hero / marquee entrance animations. */
const PRELOAD_MS   = 5000;
const preloaderEl  = document.getElementById('preloader');
const preBarFill   = document.getElementById('pre-bar-fill');
const prePctEl     = document.getElementById('pre-pct');
const _reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function triggerEntranceAnimations() {
  document.querySelectorAll('.anim-ready').forEach(el => el.classList.add('anim-in'));
}

let _preDone = false;
function endPreload() {
  if (_preDone) return;
  _preDone = true;
  document.body.classList.remove('is-loading');
  if (preloaderEl) {
    preloaderEl.classList.add('pre-done');
    preloaderEl.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => preloaderEl.remove(), 900);
  }
  triggerEntranceAnimations();
}

if (!preloaderEl) {
  // No overlay in the markup — reveal immediately.
  endPreload();
} else if (_reduceMotion) {
  // Animations are disabled — don't make the user wait.
  endPreload();
} else {
  const _preStart = performance.now();
  function _preTick(now) {
    const p = Math.min((now - _preStart) / PRELOAD_MS, 1);
    if (preBarFill) preBarFill.style.width = (p * 100).toFixed(1) + '%';
    if (prePctEl) prePctEl.textContent = Math.round(p * 100) + '%';
    if (p < 1) requestAnimationFrame(_preTick);
    else endPreload();
  }
  requestAnimationFrame(_preTick);
  // Safety net — rAF pauses in background tabs, so guarantee completion.
  window.setTimeout(endPreload, PRELOAD_MS + 2000);
}

/* ── EVERYTHING ELSE — waits for DOM ────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {

  /* ── THEME TOGGLE ── */
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  /* ── YEAR ── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── ACTIVE NAV ── */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], footer[id]');
  function updateActiveLink() {
    let current = '';
    sections.forEach(sec => {
      if (sec.getBoundingClientRect().top <= 100) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  /* ── NAV SCROLL ── */
  const navbar = document.getElementById('navbar');
  function onScroll() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 16);
    const backTop = document.getElementById('back-top');
    if (backTop) backTop.classList.toggle('visible', window.scrollY > 480);
    updateActiveLink();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── MOBILE MENU ── */
  const burger    = document.getElementById('burger');
  const mobileNav = document.getElementById('mobile-nav');

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

  /* ── BACK TO TOP ── */
  const backTop = document.getElementById('back-top');
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── VIDEO MODAL ── */
  const vidModal    = document.getElementById('vid-modal');
  const vidIframe   = document.getElementById('vid-modal-iframe');
  const vidTitle    = document.getElementById('vid-modal-title');
  const vidClose    = document.getElementById('vid-modal-close');
  const vidBackdrop = document.getElementById('vid-modal-backdrop');

  function openModal(videoUrl, title) {
    vidIframe.src = videoUrl;
    vidTitle.textContent = title;
    vidModal.classList.add('open');
    vidModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    vidModal.classList.remove('open');
    vidModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // slight delay so fade-out plays before src is cleared
    setTimeout(() => { vidIframe.src = ''; }, 350);
  }

  document.querySelectorAll('.demo-btn[data-video]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openModal(btn.dataset.video, btn.dataset.title);
    });
  });

  vidClose?.addEventListener('click', closeModal);
  vidBackdrop?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && vidModal?.classList.contains('open')) closeModal();
  });

  /* ── CARD SPOTLIGHT GLOW — cursor tracking ── */
  const glowCards = document.querySelectorAll(
    '.service-card, .skill-card, .tcard, .cert-card'
  );

  glowCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--glow-x', `${x}%`);
      card.style.setProperty('--glow-y', `${y}%`);
    });
  });

  /* ── SCROLL REVEAL ── */
  const revealSelectors = [
    '.service-card', '.skill-card', '.proj-row',
    '.tcard', '.cert-card', '.contact-left', '.contact-form',
  ];

  revealSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (el.classList.contains('anim-ready')) return;
      el.classList.add('reveal');
      const isGrid = ['service-card','skill-card','tcard','cert-card']
        .some(c => el.classList.contains(c));
      if (isGrid) el.style.transitionDelay = `${(i % 3) * 0.09}s`;
    });
  });

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ── CONTACT FORM ── */
  const contactForm = document.getElementById('contact-form');
  const formStatus  = document.getElementById('form-status');
  const submitBtn   = document.getElementById('submit-btn');

  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function setStatus(msg, type) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    formStatus.className = `form-status ${type}`;
  }

  if (contactForm) {
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

      // Send to Formspree — forwards to estheruwasemugisha@gmail.com
      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      })
      .then(res => {
        if (submitBtn) submitBtn.disabled = false;
        if (label) label.textContent = 'Send Message';
        if (res.ok) {
          setStatus("Message sent! I'll get back to you within 24 hours. ✓", 'success');
          contactForm.reset();
          setTimeout(() => setStatus('', ''), 6000);
        } else {
          setStatus('Something went wrong. Please email me directly.', 'error');
        }
      })
      .catch(() => {
        if (submitBtn) submitBtn.disabled = false;
        if (label) label.textContent = 'Send Message';
        setStatus('Network error. Please email me directly.', 'error');
      });
    });
  }

}); // end DOMContentLoaded
