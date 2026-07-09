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
  initArchitecturalGrid();
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

/* ---- Homepage hero — Dynamic Architectural Grid ---------------------------
   Fine drafting grid on canvas; intersections near the cursor magnetically
   pull toward it (spring-eased) and pick up a soft cyan glow. Pauses when
   the tab is hidden or the hero scrolls off-screen.
--------------------------------------------------------------------------- */
function initArchitecturalGrid() {
  const canvas = document.getElementById("gridCanvas");
  const hero = document.getElementById("hero");
  if (!canvas || !hero || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  const CELL = 60; // grid spacing in CSS px
  const MAJOR_EVERY = 5; // heavier "ruled" line every Nth cell
  const INFLUENCE = 190; // px radius the cursor affects
  const MAX_PULL = 16; // max node displacement in px
  const EASE = 0.14; // spring factor toward target displacement

  let dpr = 1, width = 0, height = 0, cols = 0, rows = 0;
  let nodes = [];
  const mouse = { x: -9999, y: -9999, active: false };
  let raf = null, running = false, visible = true;

  function buildGrid() {
    cols = Math.ceil(width / CELL) + 2;
    rows = Math.ceil(height / CELL) + 2;
    nodes = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push({ x: c * CELL, y: r * CELL, dx: 0, dy: 0, tdx: 0, tdy: 0 });
      }
      nodes.push(row);
    }
  }

  function resize() {
    const rect = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGrid();
  }

  function updateNodes() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const n = nodes[r][c];
        n.tdx = 0;
        n.tdy = 0;
        if (mouse.active) {
          const ddx = n.x - mouse.x;
          const ddy = n.y - mouse.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < INFLUENCE && dist > 0.001) {
            let falloff = 1 - dist / INFLUENCE;
            falloff *= falloff; // smoother, more "magnetic" taper
            const pull = falloff * MAX_PULL;
            n.tdx = (-ddx / dist) * pull;
            n.tdy = (-ddy / dist) * pull;
          }
        }
        n.dx += (n.tdx - n.dx) * EASE;
        n.dy += (n.tdy - n.dy) * EASE;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let r = 0; r < rows; r++) {
      const isMajorRow = r % MAJOR_EVERY === 0;
      ctx.beginPath();
      ctx.strokeStyle = isMajorRow ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)";
      ctx.lineWidth = isMajorRow ? 1.1 : 0.75;
      for (let c = 0; c < cols; c++) {
        const n = nodes[r][c];
        const px = n.x + n.dx, py = n.y + n.dy;
        if (c === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    for (let c = 0; c < cols; c++) {
      const isMajorCol = c % MAJOR_EVERY === 0;
      ctx.beginPath();
      ctx.strokeStyle = isMajorCol ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)";
      ctx.lineWidth = isMajorCol ? 1.1 : 0.75;
      for (let r = 0; r < rows; r++) {
        const n = nodes[r][c];
        const px = n.x + n.dx, py = n.y + n.dy;
        if (r === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    if (mouse.active) {
      ctx.fillStyle = "rgba(6,182,212,0.55)";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const n = nodes[r][c];
          const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
          const d = Math.sqrt(mdx * mdx + mdy * mdy);
          if (d < INFLUENCE * 0.55) {
            const a = 1 - d / (INFLUENCE * 0.55);
            ctx.globalAlpha = a * 0.8;
            ctx.beginPath();
            ctx.arc(n.x + n.dx, n.y + n.dy, 2.1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  function loop() {
    if (!running) return;
    updateNodes();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || REDUCED_MOTION || !visible) return;
    running = true;
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
      if (REDUCED_MOTION) draw();
    }, 120);
  });

  hero.addEventListener("pointermove", (e) => {
    const rect = hero.getBoundingClientRect();
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
    draw();
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
