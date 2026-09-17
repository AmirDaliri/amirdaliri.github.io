/* Native interactions, with no animation library or scroll hijacking. */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const motion = $("[data-motion-toggle]");
  let paused = preference.matches;
  function updateMotion() {
    root.dataset.motion = paused ? "off" : "on";
    motion.setAttribute("aria-pressed", String(paused));
    motion.setAttribute(
      "aria-label",
      paused ? "Enable ambient motion" : "Pause ambient motion",
    );
    motion.innerHTML = `<span aria-hidden="true">${paused ? "▷" : "Ⅱ"}</span> Motion`;
    if (paused) $$(".reveal").forEach((el) => el.classList.add("is-in"));
  }
  // Render the star field only while the opening is visible and motion is enabled.
  const hero = $(".hero");
  const scene = $(".orbital-scene");
  const canvas = document.createElement("canvas");
  canvas.className = "star-canvas";
  scene.prepend(canvas);
  const ctx = canvas.getContext("2d");
  let width = 0,
    height = 0,
    frame = 0,
    last = 0,
    elapsed = 0;
  let inView = true;
  const stars = Array.from({ length: 75 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: 0.4 + Math.random() * 1.2,
    speed: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
  }));
  function resizeScene() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (paused) drawStars(0);
  }
  function drawStars(delta) {
    if (!ctx) return;
    elapsed += delta;
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      star.x = (star.x + delta * star.speed * 0.006) % 1;
      const alpha =
        0.2 + 0.45 * (0.5 + 0.5 * Math.sin(elapsed * 0.7 + star.phase));
      ctx.fillStyle = `rgba(235,211,174,${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    // A brief distant meteor, every nine seconds; kept behind the copy.
    const travel = elapsed % 9;
    if (!paused && travel < 1.4) {
      const x = width * (0.48 + travel * 0.27),
        y = height * (0.12 + travel * 0.19);
      const trail = ctx.createLinearGradient(x - 90, y - 45, x, y);
      trail.addColorStop(0, "rgba(235,211,174,0)");
      trail.addColorStop(1, "rgba(235,211,174,.65)");
      ctx.strokeStyle = trail;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 90, y - 45);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
  function tick(now) {
    drawStars(last ? Math.min((now - last) / 1000, 0.05) : 0);
    last = now;
    frame = requestAnimationFrame(tick);
  }
  function syncScene() {
    cancelAnimationFrame(frame);
    last = 0;
    if (!paused && inView && !document.hidden && ctx)
      frame = requestAnimationFrame(tick);
    else drawStars(0);
    scene.style.animationPlayState = paused ? "paused" : "running";
  }
  resizeScene();
  new ResizeObserver(resizeScene).observe(hero);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncScene();
  }).observe(hero);
  document.addEventListener("visibilitychange", syncScene);
  // One scroll update per animation frame; the document keeps native scrolling.
  let scrollFrame = 0;
  const productScenes = $$(".product-scene");
  function updateDepth() {
    scrollFrame = 0;
    const progress = Math.min(
      1,
      Math.max(0, -hero.getBoundingClientRect().top / hero.offsetHeight),
    );
    hero.style.setProperty("--hero-progress", String(progress));
    scene.style.setProperty(
      "--hero-travel",
      paused ? "0px" : `${progress * 130}px`,
    );
    productScenes.forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) {
        const shift = paused
          ? 0
          : Math.max(
              -35,
              Math.min(
                35,
                (innerHeight / 2 - rect.top - rect.height / 2) * 0.06,
              ),
            );
        card.style.setProperty("--scene-shift", `${shift}px`);
      }
    });
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateDepth);
    },
    { passive: true },
  );
  updateDepth();
  const pointer = matchMedia("(hover: hover) and (pointer: fine)");
  hero.addEventListener(
    "pointermove",
    (e) => {
      if (paused || !pointer.matches) return;
      const bounds = hero.getBoundingClientRect();
      scene.style.setProperty(
        "--depth-x",
        `${(e.clientX / bounds.width - 0.5) * -32}px`,
      );
      scene.style.setProperty(
        "--depth-y",
        `${((e.clientY - bounds.top) / bounds.height - 0.5) * -22}px`,
      );
    },
    { passive: true },
  );
  hero.addEventListener("pointerleave", () => {
    scene.style.setProperty("--depth-x", "0px");
    scene.style.setProperty("--depth-y", "0px");
  });
  updateMotion();
  syncScene();
  motion.addEventListener("click", () => {
    paused = !paused;
    updateMotion();
    syncScene();
  });
  preference.addEventListener("change", (e) => {
    paused = e.matches;
    updateMotion();
    syncScene();
  });
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
