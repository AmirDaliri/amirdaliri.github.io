/* Amir Daliri portfolio — vanilla JS, dark-first redesign */

(() => {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ── Theme toggle ──────────────────────────────────────── */
  const stored = localStorage.getItem('theme');
  if (stored) root.setAttribute('data-theme', stored);

  $('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
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
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
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
  if ('IntersectionObserver' in window && !reducedMotion) {
    const targets = $$(
      '.section__header, .studio-card, .work-card, .stack-card, .timeline__item, .education-card, .contact'
    );
    targets.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    targets.forEach(el => io.observe(el));
  }

  /* ── iPhone hero cycler ────────────────────────────────── */
  const cycler = $('[data-iphone-cycle]');
  if (cycler && !reducedMotion) {
    const slides = $$('[data-slide]', cycler);
    let i = 0;
    setInterval(() => {
      slides[i].classList.remove('is-on');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-on');
    }, 2400);
  }

  /* ── Custom cursor + magnetic effect ───────────────────── */
  if (!isTouch && !reducedMotion) {
    const dot  = $('.cursor-dot');
    const ring = $('.cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2;
    let dx = mx, dy = my;       // dot pos
    let rx = mx, ry = my;       // ring pos

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
    }, { passive: true });

    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      dx = lerp(dx, mx, 0.55);
      dy = lerp(dy, my, 0.55);
      rx = lerp(rx, mx, 0.18);
      ry = lerp(ry, my, 0.18);
      dot.style.transform  = `translate3d(${dx - 3}px, ${dy - 3}px, 0)`;
      ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // hover state on interactive elements
    const hoverables = 'a, button, [data-magnet], .chip';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) {
        ring.classList.add('is-hover');
        dot.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) {
        ring.classList.remove('is-hover');
        dot.classList.remove('is-hover');
      }
    });

    // magnetic pull on [data-magnet]
    $$('[data-magnet]').forEach(el => {
      let raf;
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const tx = (e.clientX - cx) * 0.25;
        const ty = (e.clientY - cy) * 0.25;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${tx}px, ${ty}px)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        el.style.transform = '';
      });
    });
  }

  /* ── Year stamp ────────────────────────────────────────── */
  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
