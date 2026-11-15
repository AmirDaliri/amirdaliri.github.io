/* Amir Daliri — portfolio interactions. No dependencies. */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ─── Studio apps (what the phone opens) ─────────────────────── */
  const APPS = {
    authkit: {
      name: "Auth Kit",
      sub: "2FA codes & password manager",
      icon: "img/asapps/authkit.png",
      url: "https://apps.apple.com/tr/app/auth-kit/id6757927352",
      plat: "iOS · iPadOS · macOS",
      desc: "Two-factor codes and a password manager in one app, on iPhone, iPad and Mac.",
    },
    rockid: {
      name: "AS Rock ID",
      sub: "AI rock & mineral identification",
      icon: "img/asapps/asrockid.png",
      url: "https://apps.apple.com/us/app/as-rock-id-stone-scanner/id6760897608",
      plat: "iOS · iPadOS",
      desc: "Point the camera at a stone and get its identity, its mineral composition and a place in your collection.",
      shot: "img/asapps/screens/asrockid-banner.png",
    },
    remote: {
      name: "AS Remote",
      sub: "Universal TV remote",
      icon: "img/asapps/asremote.png",
      url: "https://apps.apple.com/us/app/as-remote-universal-tv-remote/id6758200639",
      plat: "iOS",
      desc: "A universal remote for Tizen and WebOS smart TVs, right from your iPhone.",
    },
    cleaner: {
      name: "AS Cleaner",
      sub: "Storage optimizer & photo cleaner",
      icon: "img/asapps/ascleaner.png",
      url: "https://apps.apple.com/us/app/as-cleaner/id6757202297",
      plat: "iOS · iPadOS",
      desc: "Finds duplicate photos, similar shots, blurry images and large files, so you can reclaim storage in a few taps.",
    },
    croncraft: {
      name: "CronCraft",
      sub: "Cron builder for developers",
      icon: "img/asapps/croncraft.png",
      url: "https://apps.apple.com/us/app/croncraft-cron-builder/id6760654834",
      plat: "iOS",
      desc: "Build and decode cron expressions visually, with templates, history and a preview of the next runs.",
      shot: "img/asapps/screens/croncraft-hero.webp",
    },
    asvpn: {
      name: "ASvpn",
      sub: "Fast, secure VPN",
      icon: "img/asapps/asvpn.png",
      url: "https://asvpn.app",
      plat: "iOS · web",
      desc: "A fast, secure VPN for complete privacy, one tap to connect.",
      shot: "img/asapps/screens/asvpn-cover.png",
    },
    receipt: {
      name: "Receipt Rescue",
      sub: "AI receipt tracker",
      icon: "img/asapps/receiptrescue.png",
      url: "https://asapps.studio/ReceiptRescue/",
      plat: "iOS · iPadOS",
      desc: "Snap a receipt and it is captured and organised, ready for tax time or your bookkeeper.",
      shot: "img/asapps/screens/receipt-snap.jpg",
      tall: true,
    },
    familybrief: {
      name: "FamilyBrief",
      sub: "More life, less logistics",
      icon: "img/asapps/familybrief.png",
      url: "https://asapps.studio/FamilyBrief/",
      plat: "iOS",
      desc: "Turns messages, screenshots and voice notes into one calm plan for the whole family, with on-device intelligence.",
      shot: "img/cinematic/familybrief-scene.png",
    },
    pocketpos: {
      name: "PocketPOS",
      sub: "Offline point of sale",
      icon: "img/asapps/pocketpos.png",
      url: "https://asapps.studio/PocketPOS/",
      plat: "iOS · iPadOS",
      desc: "Scan a barcode, make a sale, hand over a receipt. A full register on iPhone and iPad, even without a signal.",
      shot: "img/cinematic/pocketpos-screen.png",
      tall: true,
    },
    sleep: {
      name: "Sleep & Health",
      sub: "Wellness tracking",
      icon: "img/asapps/sleephealth.png",
      plat: "iOS · watchOS",
      status: "Coming soon",
      desc: "Wellness tracking with privacy-first sync. In the making.",
    },
  };

  /* ─── Clock: Amir's local time (Istanbul) ────────────────────── */
  const clockEls = $$("[data-clock]");
  const dateEl = $("[data-date]");
  const tick = () => {
    const now = new Date();
    let time, date;
    try {
      time = new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Istanbul",
      }).format(now);
      date = new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "Europe/Istanbul",
      }).format(now);
    } catch {
      time = now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
    }
    clockEls.forEach((el) => (el.textContent = time));
    if (dateEl && date) dateEl.textContent = date;
  };
  tick();
  setInterval(tick, 15000);

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ─── Dynamic Island nav ─────────────────────────────────────── */
  const island = $("[data-island]");
  const islandToggle = $("[data-island-toggle]");
  const islandLabel = $("[data-island-label]");
  const islandAvatar = $("[data-island-avatar]");
  const islandRing = $("[data-island-ring]");
  let chapterLabel = "Amir Daliri";
  let appLabel = null;

  const setIslandOpen = (open) => {
    island.classList.toggle("is-open", open);
    islandToggle.setAttribute("aria-expanded", String(open));
  };
  const paintIsland = () => {
    const text = appLabel ? appLabel.name : chapterLabel;
    if (islandLabel.textContent !== text) {
      islandLabel.textContent = text;
      islandLabel.classList.remove("swap");
      void islandLabel.offsetWidth;
      islandLabel.classList.add("swap");
    }
    islandAvatar.classList.toggle("is-app", !!appLabel);
    islandAvatar.style.backgroundImage = appLabel ? `url(${appLabel.icon})` : "";
  };

  if (island) {
    islandToggle.addEventListener("click", () =>
      setIslandOpen(!island.classList.contains("is-open")),
    );
    if (finePointer) {
      island.addEventListener("mouseenter", () => setIslandOpen(true));
      island.addEventListener("mouseleave", () => setIslandOpen(false));
    }
    island.addEventListener("focusin", () => setIslandOpen(true));
    island.addEventListener("focusout", (e) => {
      if (!island.contains(e.relatedTarget)) setIslandOpen(false);
    });
    $$("a", island).forEach((a) =>
      a.addEventListener("click", () => {
        setIslandOpen(false);
        a.blur();
      }),
    );
    document.addEventListener("click", (e) => {
      if (!island.contains(e.target)) setIslandOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setIslandOpen(false);
    });
  }

  /* ─── Scroll-driven bits (one rAF) ───────────────────────────── */
  const chapters = $$("[data-chapter]");
  const islandLinks = $$(".island__links a");
  const statement = $("[data-statement]");
  let words = [];
  if (statement && !reduced) {
    const parts = statement.textContent.trim().split(/\s+/);
    statement.textContent = "";
    parts.forEach((p, i) => {
      const s = document.createElement("span");
      s.className = "w";
      s.textContent = p;
      statement.append(s, i < parts.length - 1 ? " " : "");
    });
    words = $$(".w", statement);
  }

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;

    if (islandRing) {
      islandRing.style.strokeDashoffset = String(100 - Math.min(1, y / max) * 100);
    }

    let current = chapters[0];
    for (const c of chapters) {
      if (c.getBoundingClientRect().top <= vh * 0.42) current = c;
    }
    if (current && current.dataset.chapter !== chapterLabel) {
      chapterLabel = current.dataset.chapter;
      islandLinks.forEach((a) =>
        a.classList.toggle("is-current", a.getAttribute("href") === "#" + current.id),
      );
      paintIsland();
    }

    if (words.length) {
      const r = statement.getBoundingClientRect();
      const p = (vh * 0.88 - r.top) / (r.height + vh * 0.42);
      const lit = Math.round(Math.max(0, Math.min(1, p)) * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < lit));
    }
  };
  const requestScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  };
  addEventListener("scroll", requestScroll, { passive: true });
  addEventListener("resize", requestScroll);
  onScroll();

  /* ─── Reveal + count-up ──────────────────────────────────────── */
  const countUp = (el) => {
    const target = +el.dataset.count;
    const pad = +el.dataset.pad || 0;
    const fmt = (n) => String(n).padStart(pad, "0");
    if (reduced) return (el.textContent = fmt(target));
    const t0 = performance.now();
    const dur = 1300;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          $$("[data-count]", e.target).forEach(countUp);
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    $$("[data-reveal]").forEach((el) => io.observe(el));
  } else {
    $$("[data-reveal]").forEach((el) => el.classList.add("in"));
  }

  /* ─── The phone ──────────────────────────────────────────────── */
  const phone = $("[data-phone]");
  if (phone) {
    const screen = $(".phone__screen", phone);
    const sheet = $("[data-sheet]", phone);
    const lock = $("[data-lock]", phone);
    const homebar = $("[data-homebar]", phone);
    const closeBtn = $("[data-sheet-close]", phone);
    const icons = $$(".ios-app", phone);
    let lastIcon = null;

    // lock → unlock
    phone.classList.add("is-locked");
    const unlock = () => {
      if (!phone.classList.contains("is-locked")) return;
      phone.classList.remove("is-locked");
      icons.forEach((b, i) => {
        if (reduced) return;
        const col = (i % 4) - 1.5;
        const row = Math.floor(i / 4) - 1;
        b.animate(
          [
            { transform: `translate(${col * 60}%, ${row * 60}%) scale(1.5)`, opacity: 0 },
            { transform: "none", opacity: 1 },
          ],
          {
            duration: 760,
            delay: 60 + Math.hypot(col, row) * 55,
            easing: "cubic-bezier(.2,.9,.25,1)",
            fill: "backwards",
          },
        );
      });
    };
    lock.addEventListener("click", unlock);
    setTimeout(unlock, reduced ? 0 : 1500);

    const openApp = (btn) => {
      const app = APPS[btn.dataset.app];
      if (!app) return;
      lastIcon = btn;
      const s = screen.getBoundingClientRect();
      const r = $("img", btn).getBoundingClientRect();
      sheet.style.setProperty("--ox", ((r.left + r.width / 2 - s.left) / s.width) * 100 + "%");
      sheet.style.setProperty("--oy", ((r.top + r.height / 2 - s.top) / s.height) * 100 + "%");

      $("[data-sheet-icon]", sheet).src = app.icon;
      $("[data-sheet-name]", sheet).textContent = app.name;
      $("[data-sheet-sub]", sheet).textContent = app.sub;
      $("[data-sheet-status]", sheet).textContent = app.status || "Live";
      $("[data-sheet-plat]", sheet).textContent = app.plat;
      $("[data-sheet-desc]", sheet).textContent = app.desc;
      const get = $("[data-sheet-get]", sheet);
      if (app.url) {
        get.href = app.url;
        get.textContent = "View ↗";
        get.classList.remove("is-off");
        get.removeAttribute("aria-disabled");
        get.tabIndex = 0;
      } else {
        get.removeAttribute("href");
        get.textContent = "Soon";
        get.classList.add("is-off");
        get.setAttribute("aria-disabled", "true");
        get.tabIndex = -1;
      }
      const shot = $("[data-sheet-shot]", sheet);
      shot.textContent = "";
      if (app.shot) {
        const img = new Image();
        img.alt = app.name + " preview";
        img.src = app.shot;
        if (app.tall) img.className = "is-tall";
        shot.append(img);
      }
      $(".ios-sheet__scroll", sheet).scrollTop = 0;

      // force the "from" state, then open
      void sheet.offsetWidth;
      sheet.hidden = false;
      phone.classList.add("is-app", "has-opened");
      homebar.tabIndex = 0;
      appLabel = app;
      paintIsland();
      closeBtn.focus({ preventScroll: true });
    };

    const closeApp = () => {
      if (sheet.hidden) return;
      sheet.hidden = true;
      phone.classList.remove("is-app");
      homebar.tabIndex = -1;
      appLabel = null;
      paintIsland();
      if (lastIcon) lastIcon.focus({ preventScroll: true });
    };

    icons.forEach((b) => b.addEventListener("click", () => openApp(b)));
    closeBtn.addEventListener("click", closeApp);
    homebar.addEventListener("click", closeApp);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeApp();
    });

    // tilt toward the pointer
    if (finePointer && !reduced) {
      const hero = $(".hero");
      const base = { rx: 5, ry: -16 };
      hero.addEventListener("pointermove", (e) => {
        const b = hero.getBoundingClientRect();
        const nx = (e.clientX - b.left) / b.width - 0.5;
        const ny = (e.clientY - b.top) / b.height - 0.5;
        const over = phone.contains(e.target);
        const ry = over ? -4 + nx * 6 : base.ry + nx * 18;
        const rx = over ? 1 - ny * 5 : base.rx - ny * 10;
        phone.style.setProperty("--ry", ry.toFixed(2) + "deg");
        phone.style.setProperty("--rx", rx.toFixed(2) + "deg");
        phone.style.setProperty("--gx", (nx * 40).toFixed(1) + "%");
        phone.style.transitionDuration = "0.25s";
      });
      hero.addEventListener("pointerleave", () => {
        phone.style.transitionDuration = "";
        phone.style.removeProperty("--ry");
        phone.style.removeProperty("--rx");
        phone.style.removeProperty("--gx");
      });
    }
  }

  /* ─── Work: filters + cursor preview ─────────────────────────── */
  const jobs = $$(".job");
  const chips = $$("[data-filter]");
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      jobs.forEach((j) => {
        j.hidden = !(f === "all" || j.dataset.cat === f);
      });
      requestScroll();
    }),
  );

  const peek = $("[data-peek]");
  if (peek && finePointer && !reduced) {
    const img = $("img", peek);
    let tx = 0,
      ty = 0,
      x = 0,
      y = 0,
      raf = 0,
      on = false;
    const loop = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      peek.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      raf = on || Math.abs(tx - x) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    const place = (e) => {
      const w = peek.offsetWidth;
      const h = peek.offsetHeight;
      tx = Math.min(e.clientX + 28, innerWidth - w - 16);
      ty = Math.max(16, Math.min(e.clientY - h / 2, innerHeight - h - 16));
    };
    jobs.forEach((job) => {
      const link = $(".job__link", job);
      link.addEventListener("pointerenter", (e) => {
        img.src = job.dataset.preview;
        peek.classList.toggle("is-tall", job.hasAttribute("data-tall"));
        place(e);
        if (!on) {
          x = tx;
          y = ty;
        }
        on = true;
        peek.classList.add("is-on");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      link.addEventListener("pointermove", place);
      link.addEventListener("pointerleave", () => {
        on = false;
        peek.classList.remove("is-on");
      });
    });
    addEventListener("scroll", () => {
      on = false;
      peek.classList.remove("is-on");
    }, { passive: true });
  }

  /* ─── Copy email ─────────────────────────────────────────────── */
  $$("[data-copy]").forEach((btn) => {
    const label = $("[data-copy-label]", btn);
    const initial = label.textContent;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        label.textContent = "Copied ✓";
      } catch {
        label.textContent = btn.dataset.copy;
      }
      setTimeout(() => (label.textContent = initial), 2000);
    });
  });
})();
