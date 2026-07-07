// Velmure Tech — shared site behavior (no framework, no build step)

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initActiveNavLink();
  initScrollReveal();
  initHeaderShadow();
  initFooterYear();
  initContactForm();
  initPortfolioFilter();
  initHeroSlideshow();
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

/* ---- Fade-up reveal on scroll --------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
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
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
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

/* ---- Footer year ------------------------------------------------------------ */
function initFooterYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---- Contact form -------------------------------------------------------
   Submits to FormSubmit (https://formsubmit.co/ajax/velmuretechcorps@gmail.com),
   which relays the message to velmuretechcorps@gmail.com — no server of our
   own required. The form's plain action/method attributes are a no-JS
   fallback; when JS runs we intercept submit and post to the AJAX endpoint
   instead so we can show the inline success/error state without navigating
   away.

   NOTE: FormSubmit requires a one-time activation — the first submission
   ever sent to that address triggers a confirmation email that must be
   clicked before further submissions are actually delivered.
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

/* ---- Hero image slideshow -----------------------------------------------
   Cycles the four hero background photos in order (1 → 2 → 3 → 4 → loop)
   with a crossfade + slow zoom. Dots reflect and control the active slide.
--------------------------------------------------------------------------- */
function initHeroSlideshow() {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  if (slides.length < 2) return;

  const INTERVAL_MS = 4800;
  let index = 0;
  let timer = null;

  const goTo = (nextIndex) => {
    slides[index].classList.remove("is-active");
    dots[index]?.classList.remove("is-active");
    dots[index]?.setAttribute("aria-selected", "false");
    index = nextIndex;
    slides[index].classList.add("is-active");
    dots[index]?.classList.add("is-active");
    dots[index]?.setAttribute("aria-selected", "true");
  };

  slides[0].classList.add("is-active");
  dots[0]?.classList.add("is-active");
  dots[0]?.setAttribute("aria-selected", "true");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const start = () => {
    timer = setInterval(() => goTo((index + 1) % slides.length), INTERVAL_MS);
  };
  start();

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      if (i === index) return;
      clearInterval(timer);
      goTo(i);
      start();
    });
  });
}

/* ---- Portfolio filter --------------------------------------------------------- */
function initPortfolioFilter() {
  const buttons = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-category]");
  if (!buttons.length || !cards.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      buttons.forEach((b) => {
        b.classList.remove("bg-primary-dark", "text-white");
        b.classList.add("bg-white", "text-slate-600");
        b.setAttribute("aria-pressed", "false");
      });
      button.classList.add("bg-primary-dark", "text-white");
      button.classList.remove("bg-white", "text-slate-600");
      button.setAttribute("aria-pressed", "true");

      cards.forEach((card) => {
        const matches = filter === "all" || card.dataset.category === filter;
        card.style.display = matches ? "" : "none";
      });
    });
  });
}
