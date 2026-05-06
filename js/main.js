/* Amir Daliri portfolio — vanilla JS, no jQuery */

(() => {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ── Theme toggle (light <-> dark) ─────────────────────── */
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored) root.setAttribute('data-theme', stored);

  $('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  /* ── Mobile nav ────────────────────────────────────────── */
  const navToggle = $('[data-nav-toggle]');
  const nav = $('.primary-nav');
  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.primary-nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Header shadow on scroll ───────────────────────────── */
  const header = $('[data-header]');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Scroll spy ────────────────────────────────────────── */
  const navLinks = $$('.primary-nav a[href^="#"]');
  const sectionIds = navLinks
    .map(a => a.getAttribute('href'))
    .filter(href => href && href.length > 1);
  const sections = sectionIds
    .map(id => document.querySelector(id))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const setActive = (id) => {
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
    };
    const spy = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
    sections.forEach(s => spy.observe(s));
  }

  /* ── Portfolio filter ──────────────────────────────────── */
  const grid = $('[data-grid]');
  if (grid) {
    const cards = $$('.work-card', grid);
    $$('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        $$('.chip').forEach(c => {
          c.classList.remove('is-active');
          c.setAttribute('aria-selected', 'false');
        });
        chip.classList.add('is-active');
        chip.setAttribute('aria-selected', 'true');

        const filter = chip.dataset.filter;
        cards.forEach(card => {
          const match = filter === 'all' || card.dataset.cat === filter;
          card.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

  /* ── Reveal on scroll ──────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const targets = $$(
      '.section__header, .about__lead, .about__pillars li, .app-card, .work-card, .stack-card, .timeline__item, .education-card, .contact'
    );
    targets.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(el => io.observe(el));
  }

  /* ── Year stamp ────────────────────────────────────────── */
  $('[data-year]').textContent = new Date().getFullYear();
})();
