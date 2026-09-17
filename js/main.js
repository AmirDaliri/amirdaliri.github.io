/* Cached geometry and transform-only motion; native document scrolling. */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = matchMedia("(hover: hover) and (pointer: fine)");
  const motion = $("[data-motion-toggle]");
  const hero = $(".hero");
  const scene = $(".orbital-scene");
  const chapterDock = $(".chapter-dock");
  const chapters = $$(".chapter-dock a[href^='#']").map((link) => ({
    link,
    section: $(link.getAttribute("href")),
    top: 0,
  }));
  const launch = $(".hero-app__rock");
  const landing = $(".scene-product--rock");
  const cards = $$(".product-scene").map((el) => ({
    el,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
  }));
  let paused = preference.matches,
    frame = 0,
    previousTime = 0,
    measurePending = true;
  let geometry = null,
    lastChapter = null,
    inFlight = false;
  let heroX = 0,
    heroY = 0,
    targetX = 0,
    targetY = 0;
  const flight = document.createElement("img");
  flight.src = launch.src;
  flight.alt = "";
  flight.className = "flight-screen";
  flight.setAttribute("aria-hidden", "true");
  flight.hidden = true;
  document.body.append(flight);
  // Paint the dust once, then let the compositor drift the resulting layer.
  const canvas = document.createElement("canvas");
  canvas.className = "star-canvas";
  scene.prepend(canvas);
  const ctx = canvas.getContext("2d");
  const stars = Array.from({ length: 60 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.4 + Math.random(),
    a: 0.15 + Math.random() * 0.4,
  }));
  function paintStars(width, height) {
    if (!ctx || (canvas.width === width && canvas.height === height)) return;
    canvas.width = width;
    canvas.height = height;
    stars.forEach((star) => {
      ctx.fillStyle = `rgba(235,211,174,${star.a})`;
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  function schedule(measure = false) {
    measurePending ||= measure;
    if (!frame && !document.hidden) frame = requestAnimationFrame(render);
  }
  function measure() {
    const y = scrollY;
    const h = hero.getBoundingClientRect();
    const a = launch.getBoundingClientRect();
    const b = landing.getBoundingClientRect();
    // Both assets are square, although the destination's object-fit box is not.
    const size = Math.min(b.width, b.height);
    geometry = {
      height: h.height,
      width: h.width,
      startX: a.left,
      startY: a.top + y,
      startSize: a.width,
      endX: b.left + (b.width - size) / 2,
      endY: b.top + y + (b.height - size) / 2,
      endSize: size,
      endScroll: Math.max(1, b.top + y - innerHeight * 0.13),
    };
    cards.forEach((card) => {
      const r = card.el.getBoundingClientRect();
      Object.assign(card, {
        top: r.top + y,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    });
    chapters.forEach((chapter) => {
      chapter.top = chapter.section.getBoundingClientRect().top + y;
    });
    paintStars(Math.round(h.width), Math.round(h.height));
    measurePending = false;
  }
  function render(now) {
    frame = 0;
    if (measurePending || !geometry) measure();
    const y = scrollY;
    const dt = previousTime ? Math.min(now - previousTime, 50) : 16.7;
    previousTime = now;
    const follow = 1 - Math.exp(-dt / 95);
    heroX += (targetX - heroX) * follow;
    heroY += (targetY - heroY) * follow;
    const progress = Math.min(1, Math.max(0, y / geometry.height));
    hero.style.setProperty("--hero-progress", progress);
    scene.style.setProperty("--depth-x", `${paused ? 0 : heroX}px`);
    scene.style.setProperty("--depth-y", `${paused ? 0 : heroY}px`);
    scene.style.setProperty("--hero-travel", `${paused ? 0 : progress * 70}px`);
    const t = Math.min(1, Math.max(0, y / geometry.endScroll));
    const flying =
      !paused &&
      innerWidth > 760 &&
      launch.complete &&
      launch.naturalWidth > 0 &&
      t < 1;
    if (flying !== inFlight) {
      inFlight = flying;
      flight.hidden = !flying;
      launch.classList.toggle("screen-in-flight", flying);
      landing.classList.toggle("screen-in-flight", flying);
    }
    if (flying) {
      const e = t * t * (3 - 2 * t),
        mix = (a, b) => a + (b - a) * e;
      const x = mix(geometry.startX, geometry.endX);
      const top = mix(geometry.startY, geometry.endY - y);
      const scale = mix(geometry.startSize, geometry.endSize) / 960;
      flight.style.transform = `translate3d(${x}px,${top}px,0) scale(${scale})`;
    }
    const dockHidden = y < geometry.height * 0.75;
    if (chapterDock.hidden !== dockHidden) chapterDock.hidden = dockHidden;
    let current = chapters[0];
    chapters.forEach((chapter) => {
      if (chapter.top <= y + innerHeight * 0.45) current = chapter;
    });
    if (current !== lastChapter) {
      chapters.forEach((chapter) => {
        if (chapter === current)
          chapter.link.setAttribute("aria-current", "location");
        else chapter.link.removeAttribute("aria-current");
      });
      lastChapter = current;
    }
    let settling = Math.abs(targetX - heroX) + Math.abs(targetY - heroY) > 0.03;
    cards.forEach((card) => {
      card.x += (card.tx - card.x) * follow;
      card.y += (card.ty - card.y) * follow;
      settling ||=
        Math.abs(card.tx - card.x) + Math.abs(card.ty - card.y) > 0.03;
      const top = card.top - y;
      if (top > innerHeight || top + card.height < 0) return;
      const shift = paused
        ? 0
        : Math.max(
            -25,
            Math.min(25, (innerHeight / 2 - top - card.height / 2) * 0.04),
          );
      card.el.style.setProperty("--scene-shift", `${shift}px`);
      card.el.style.setProperty("--art-x", `${paused ? 0 : card.x * 18}px`);
      card.el.style.setProperty("--art-y", `${paused ? 0 : card.y * 12}px`);
      card.el.style.setProperty("--art-tilt", `${paused ? 0 : card.x * -9}deg`);
      card.el.style.setProperty(
        "--light-x",
        `${(card.x + 0.5) * card.width - 325}px`,
      );
      card.el.style.setProperty(
        "--light-y",
        `${(card.y + 0.5) * card.height - 325}px`,
      );
    });
    if (settling && !paused) schedule();
    else previousTime = 0;
  }
  function updateMotion() {
    root.dataset.motion = paused ? "off" : "on";
    motion.setAttribute("aria-pressed", String(paused));
    motion.setAttribute(
      "aria-label",
      paused ? "Enable ambient motion" : "Pause ambient motion",
    );
    motion.innerHTML = `<span aria-hidden="true">${paused ? "▷" : "Ⅱ"}</span> Motion`;
    if (paused) {
      $$(".reveal").forEach((el) => el.classList.add("is-in"));
      targetX = targetY = heroX = heroY = 0;
      cards.forEach((card) => {
        card.x = card.y = card.tx = card.ty = 0;
        card.el.classList.remove("is-inspected");
      });
    }
    schedule();
  }
  window.addEventListener("scroll", () => schedule(), { passive: true });
  window.addEventListener("resize", () => schedule(true), { passive: true });
  new ResizeObserver(() => schedule(true)).observe($("main"));
  launch.addEventListener("load", () => schedule(true));
  landing.addEventListener("load", () => schedule(true));
  document.fonts.ready.then(() => schedule(true));
  document.addEventListener("visibilitychange", () => {
    root.classList.toggle("page-hidden", document.hidden);
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    } else schedule(true);
  });
  const visibility = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) =>
        entry.target.classList.toggle(
          "motion-offscreen",
          !entry.isIntersecting,
        ),
      ),
    { rootMargin: "100px" },
  );
  visibility.observe(hero);
  cards.forEach((card) => visibility.observe(card.el));
  hero.addEventListener(
    "pointermove",
    (event) => {
      if (paused || !pointer.matches || !geometry) return;
      targetX = (event.clientX / geometry.width - 0.5) * -22;
      targetY = ((event.clientY + scrollY) / geometry.height - 0.5) * -16;
      schedule();
    },
    { passive: true },
  );
  hero.addEventListener("pointerleave", () => {
    targetX = targetY = 0;
    schedule();
  });
  cards.forEach((card) => {
    card.el.addEventListener(
      "pointermove",
      (event) => {
        if (paused || !pointer.matches || !card.width) return;
        card.tx = (event.clientX - card.left) / card.width - 0.5;
        card.ty = (event.clientY + scrollY - card.top) / card.height - 0.5;
        card.el.classList.add("is-inspected");
        schedule();
      },
      { passive: true },
    );
    card.el.addEventListener("pointerleave", () => {
      card.tx = card.ty = 0;
      card.el.classList.remove("is-inspected");
      schedule();
    });
  });
  motion.addEventListener("click", () => {
    paused = !paused;
    updateMotion();
  });
  preference.addEventListener("change", (event) => {
    paused = event.matches;
    updateMotion();
  });
  updateMotion();
  const toggle = $("[data-nav-toggle]");
  const nav = $(".primary-nav");
  function closeNav() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  $$(".primary-nav a").forEach((a) => a.addEventListener("click", closeNav));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      closeNav();
      toggle.focus();
    }
  });
  const workCards = $$(".work-card");
  const moreWork = document.createElement("button");
  moreWork.className = "work-more";
  moreWork.type = "button";
  moreWork.setAttribute("aria-expanded", "false");
  $("[data-grid]").after(moreWork);
  let activeFilter = "all",
    expanded = false;
  function renderWork() {
    const matching = workCards.filter(
      (card) => activeFilter === "all" || card.dataset.cat === activeFilter,
    );
    workCards.forEach((card) => {
      const index = matching.indexOf(card);
      card.hidden = index === -1 || (!expanded && index >= 6);
      card.classList.add("is-in");
    });
    moreWork.hidden = matching.length <= 6;
    moreWork.textContent = expanded
      ? "SHOW SELECTED WORK −"
      : `EXPLORE ALL ${matching.length} PROJECTS ↗`;
    moreWork.setAttribute("aria-expanded", String(expanded));
  }
  moreWork.addEventListener("click", () => {
    expanded = !expanded;
    renderWork();
    if (!expanded)
      $("#work").scrollIntoView({ behavior: paused ? "instant" : "smooth" });
  });
  $$(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter;
      expanded = false;
      $$(".chip").forEach((c) => {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
      renderWork();
    }),
  );
  renderWork();
  if ("IntersectionObserver" in window && !paused) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.06 },
    );
    $$(
      ".section__header, .manifesto, .stack-card, .timeline__item, .contact",
    ).forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }
  $("[data-year]").textContent = new Date().getFullYear();
})();
