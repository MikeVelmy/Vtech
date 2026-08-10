// Velmure Tech — shared site behavior (no framework, no build step)

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initActiveNavLink();
  initScrollReveal();
  initHeaderShadow();
  initFooterYear();
  initContactForm();
  initPortfolioFilter();
  initSpotlight();
  initCounters();
  initRankClimb();
  initSignalField();
  initSlotsCounter();
  initFoundingOffer();
});

/* ---- Mobile nav toggle --------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("mobile-menu");
  const iconMenu = document.getElementById("icon-menu");
  const iconClose = document.getElementById("icon-close");
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.add("hidden");
    toggle.setAttribute("aria-expanded", "false");
    iconMenu?.classList.remove("hidden");
    iconClose?.classList.add("hidden");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
    } else {
      menu.classList.remove("hidden");
      toggle.setAttribute("aria-expanded", "true");
      iconMenu?.classList.add("hidden");
      iconClose?.classList.remove("hidden");
    }
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
}

/* ---- Highlight current page in nav --------------------------------------- */
function initActiveNavLink() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll(`.nav-link[data-page="${page}"]`).forEach((link) => {
    link.classList.add("text-primary-dark", "font-semibold");
    link.classList.remove("text-slate-600");
    link.setAttribute("aria-current", "page");
  });
}

/* ---- Scroll reveal (handles .reveal AND [data-reveal], with stagger) ------ */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal, [data-reveal]");
  if (!items.length) return;

  if (REDUCED_MOTION || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---- Sticky header shadow -------------------------------------------------- */
function initHeaderShadow() {
  const header = document.getElementById("site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---- Footer year ----------------------------------------------------------- */
function initFooterYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---- Cursor spotlight on .spotlight cards --------------------------------- */
function initSpotlight() {
  if (REDUCED_MOTION) return;
  document.querySelectorAll(".spotlight").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });
}

/* ---- Count-up stats -------------------------------------------------------
   <span data-count="10" data-suffix="" data-prefix="">0</span>
--------------------------------------------------------------------------- */
function initCounters() {
  const els = document.querySelectorAll("[data-count]");
  if (!els.length) return;

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    if (REDUCED_MOTION) { el.textContent = prefix + target + suffix; return; }
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.6 });
  els.forEach((el) => obs.observe(el));
}

/* ---- Search-rank climb (hero signature moment) ---------------------------
   Rows carry data-start (initial slot, 0 = top). The .rank-row--you row
   climbs from the bottom to the top; each row it passes shifts down one slot.
   Loops, holding a beat on #1.
--------------------------------------------------------------------------- */
function initRankClimb() {
  const panel = document.querySelector(".rankpanel");
  if (!panel) return;
  const rows = Array.from(panel.querySelectorAll(".rank-row"));
  const you = panel.querySelector(".rank-row--you");
  if (!you || rows.length < 2) return;

  const posEl = you.querySelector(".rank-row__pos");
  const startSlot = parseInt(you.dataset.start, 10);
  const setSlots = () => rows.forEach((r) => r.style.setProperty("--slot", r.dataset.slot));

  const layout = () => {
    rows.forEach((r) => (r.dataset.slot = r.dataset.start));
    setSlots();
    if (posEl) posEl.textContent = "#" + (startSlot + 1);
    panel.classList.remove("is-top");
  };
  layout();

  if (REDUCED_MOTION) {
    rows.forEach((r) => {
      const s = parseInt(r.dataset.start, 10);
      r.dataset.slot = r === you ? 0 : s < startSlot ? s + 1 : s;
    });
    setSlots();
    if (posEl) posEl.textContent = "#1";
    panel.classList.add("is-top");
    return;
  }

  const step = () => {
    const cur = parseInt(you.dataset.slot, 10);
    if (cur <= 0) return;
    const above = rows.find((r) => parseInt(r.dataset.slot, 10) === cur - 1);
    if (above) above.dataset.slot = cur;
    you.dataset.slot = cur - 1;
    setSlots();
    if (posEl) posEl.textContent = "#" + cur;
    if (cur - 1 === 0) {
      panel.classList.add("is-top");
      if (posEl) posEl.textContent = "#1";
    }
  };

  let timer = null;
  const play = () => {
    layout();
    let ticks = 0;
    clearInterval(timer);
    timer = setInterval(() => {
      step();
      if (++ticks >= startSlot) {
        clearInterval(timer);
        setTimeout(play, 3600); // hold on #1, then replay
      }
    }, 900);
  };

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { setTimeout(play, 700); obs.disconnect(); }
      });
    }, { threshold: 0.4 });
    obs.observe(panel);
  } else {
    setTimeout(play, 700);
  }
}

/* ---- Homepage hero — Signal field -----------------------------------------
   A scatter of dim "unfound" location dots on canvas; one at a time lights up
   cyan with an expanding ring, then hands off to another — the core promise
   (getting found, not just built) as ambient motion. Pauses when the tab is
   hidden or the hero scrolls off-screen.
--------------------------------------------------------------------------- */
function initSignalField() {
  const canvas = document.getElementById("signalCanvas");
  const visual = document.querySelector(".vt-hero__visual");
  const hero = document.getElementById("hero");
  if (!canvas || !visual || !hero || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  const DOT_AREA = 4200; // px^2 of visual panel per dot
  const MIN_DOTS = 22;
  const MAX_DOTS = 110;
  const PULSE_MS = 2600; // lifetime of one "found" pulse
  const RING_MAX = 30; // max ring radius in px
  const HOVER_RADIUS = 110; // px cursor influence

  let dpr = 1, width = 0, height = 0;
  let dots = [];
  let activeIndex = -1, pulseStart = 0;
  const mouse = { x: -9999, y: -9999, active: false };
  let raf = null, running = false, visible = true;

  function buildDots() {
    const count = Math.max(MIN_DOTS, Math.min(MAX_DOTS, Math.round((width * height) / DOT_AREA)));
    dots = [];
    for (let i = 0; i < count; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.1 + Math.random() * 1.1,
        base: 0.14 + Math.random() * 0.18,
      });
    }
    activeIndex = dots.length ? Math.floor(Math.random() * dots.length) : -1;
    pulseStart = performance.now();
  }

  function resize() {
    const rect = visual.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildDots();
  }

  function drawFrame(now) {
    ctx.clearRect(0, 0, width, height);

    dots.forEach((d, i) => {
      let alpha = d.base;
      let radius = d.r;

      if (mouse.active) {
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < HOVER_RADIUS) alpha = Math.min(0.6, alpha + (1 - dist / HOVER_RADIUS) * 0.4);
      }

      if (i === activeIndex) {
        const t = Math.min(1, (now - pulseStart) / PULSE_MS);
        const bump = Math.sin(t * Math.PI); // eases 0 -> 1 -> 0 across the pulse
        alpha = 0.35 + bump * 0.65;
        radius = d.r + bump * 1.3;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(6,182,212,${0.55 * (1 - t)})`;
        ctx.lineWidth = 1.3;
        ctx.arc(d.x, d.y, t * RING_MAX, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(6,182,212,${alpha})`;
      } else {
        ctx.fillStyle = `rgba(226,232,240,${alpha})`;
      }

      ctx.beginPath();
      ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    if (activeIndex >= 0 && now - pulseStart > PULSE_MS && dots.length > 1) {
      let next = activeIndex;
      while (next === activeIndex) next = Math.floor(Math.random() * dots.length);
      activeIndex = next;
      pulseStart = now;
    }
  }

  function loop(now) {
    if (!running) return;
    drawFrame(now);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || REDUCED_MOTION || !visible) return;
    running = true;
    pulseStart = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      if (REDUCED_MOTION) drawFrame(performance.now());
    }, 120);
  });

  hero.addEventListener("pointermove", (e) => {
    const rect = visual.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  hero.addEventListener("pointerleave", () => {
    mouse.active = false;
  });

  document.addEventListener("visibilitychange", () => {
    visible = document.visibilityState === "visible";
    if (visible) start(); else stop();
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) start(); else stop();
    }, { threshold: 0.01 });
    io.observe(hero);
  } else {
    start();
  }

  resize();
  if (REDUCED_MOTION) {
    drawFrame(performance.now());
  } else if (!("IntersectionObserver" in window)) {
    start();
  }
}

/* ---- Contact form ---------------------------------------------------------
   Submits to FormSubmit (relays to velmuretechcorps@gmail.com). The plain
   action/method are the no-JS fallback; when JS runs we POST to the AJAX
   endpoint and show the inline success/error state without navigating away.
   NOTE: FormSubmit requires a one-time activation — the first submission
   triggers a confirmation email that must be clicked before delivery.
--------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const FORM_ENDPOINT = "https://formsubmit.co/ajax/velmuretechcorps@gmail.com";

  const successBox = document.getElementById("form-success");
  const errorBox = document.getElementById("form-error");
  const submitButton = form.querySelector('button[type="submit"]');
  const submitButtonDefaultText = submitButton?.textContent;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    errorBox?.classList.add("hidden");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!response.ok) throw new Error("Form submission failed");

      form.classList.add("hidden");
      successBox?.classList.remove("hidden");
      successBox?.setAttribute("tabindex", "-1");
      successBox?.focus();
    } catch (err) {
      errorBox?.classList.remove("hidden");
      errorBox?.setAttribute("tabindex", "-1");
      errorBox?.focus();
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitButtonDefaultText;
      }
    }
  });

  const waButton = document.getElementById("wa-prefill-btn");
  if (waButton) {
    waButton.addEventListener("click", () => {
      const business = document.getElementById("business-name")?.value.trim();
      const packageSelect = document.getElementById("package-interest");
      const packageLabel = packageSelect?.options[packageSelect.selectedIndex]?.text;

      let message = "Hi Velmure Tech, I'd like to talk about a new website.";
      if (business) message += ` Business name: ${business}.`;
      if (packageLabel && packageLabel !== "Not sure yet") {
        message += ` Package I'm interested in: ${packageLabel}.`;
      }

      const whatsappNumber = waButton.dataset.whatsapp;
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener");
    });
  }
}

/* ---- Portfolio filter ------------------------------------------------------ */
function initPortfolioFilter() {
  const buttons = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-category]");
  if (!buttons.length || !cards.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      buttons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      button.classList.add("is-active");
      button.setAttribute("aria-pressed", "true");

      cards.forEach((card) => {
        const matches = filter === "all" || card.dataset.category === filter;
        card.style.display = matches ? "" : "none";
      });
    });
  });
}

/* ---- Monthly build slots (scarcity) --------------------------------------- */
function initSlotsCounter() {
  const el = document.getElementById("slots-counter");
  if (!el) return;

  const total = parseInt(el.dataset.total, 10);
  const filled = parseInt(el.dataset.filled, 10);
  if (!Number.isFinite(total) || !Number.isFinite(filled)) return;

  const left = Math.max(total - filled, 0);
  const month = new Date().toLocaleDateString(undefined, { month: "long" });
  const filledText = filled === 0 ? "No build slots taken yet this month" : `${filled} of ${total} build slots filled this month`;
  el.textContent = left > 0 ? `${filledText} — only ${left} left.` : `${filledText} — next month's waitlist is open.`;
}

/* ---- Founding offer deadline (urgency) ------------------------------------- */
function initFoundingOffer() {
  document.querySelectorAll("[data-expires]").forEach((el) => {
    const date = new Date(el.dataset.expires + "T23:59:59");
    if (Number.isNaN(date.getTime())) return;

    const now = new Date();
    const daysLeft = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    if (daysLeft > 1) {
      el.textContent = `${label} (${daysLeft} days left)`;
    } else if (daysLeft === 1) {
      el.textContent = `${label} (1 day left)`;
    } else if (daysLeft === 0) {
      el.textContent = "today";
    } else {
      el.textContent = label;
    }
  });
}
