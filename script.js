/* ============================================================
   EL SOMBRERO — Main Script
   Plain JavaScript · No dependencies
   ============================================================ */

/* ---- Copyright Year --------------------------------------- */
const yearEl = document.querySelector("[data-year]");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* ============================================================
   HAMBURGER NAVIGATION
   ============================================================ */
(function initNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav    = document.querySelector("[data-nav]");
  if (!toggle || !nav) return;

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  }

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") setOpen(false);
  });

  document.addEventListener("click", e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      setOpen(false);
    }
  });
}());

/* ============================================================
   HERO SLIDER
   ============================================================ */
(function initHeroSlider() {
  const slides = document.querySelectorAll("[data-hero-slide]");
  const dots   = document.querySelectorAll("[data-hero-dot]");
  const prev   = document.querySelector("[data-hero-prev]");
  const next   = document.querySelector("[data-hero-next]");

  if (slides.length < 2) return;

  let current = 0;
  let timer   = null;
  const INTERVAL = 4000;

  function goTo(index) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    dots[current].setAttribute("aria-selected", "false");

    current = (index + slides.length) % slides.length;

    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
    dots[current].setAttribute("aria-selected", "true");
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  function stopAuto() {
    clearInterval(timer);
  }

  prev && prev.addEventListener("click", () => { goTo(current - 1); startAuto(); });
  next && next.addEventListener("click", () => { goTo(current + 1); startAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => { goTo(i); startAuto(); });
  });

  if (window.matchMedia("(hover: hover)").matches) {
    const hero = document.querySelector("[data-hero]");
    hero && hero.addEventListener("mouseenter", stopAuto);
    hero && hero.addEventListener("mouseleave", startAuto);
  }

  document.addEventListener("visibilitychange", () => {
    document.hidden ? stopAuto() : startAuto();
  });

  startAuto();
}());

/* ============================================================
   MENU CATEGORY SLIDER
   Shows 3 cards at a time, slides horizontally on prev/next
   ============================================================ */
(function initMenuCatSlider() {
  const wrap  = document.querySelector("[data-menu-cat-slider]");
  if (!wrap) return;

  const track     = wrap.querySelector("[data-menu-cat-track]");
  const cards     = Array.from(track.querySelectorAll(".menu-cat-card"));
  const prevBtn   = wrap.querySelector("[data-menu-cat-prev]");
  const nextBtn   = wrap.querySelector("[data-menu-cat-next]");
  const dotsWrap  = document.querySelector("[data-menu-cat-dots]");

  const total = cards.length;
  let visibleCount = 3;
  let current = 0;

  function getVisible() {
    const w = window.innerWidth;
    if (w <= 600)  return 1;
    if (w <= 900)  return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, total - visibleCount);
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hero-dot" + (i === current ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", String(i === current));
      btn.setAttribute("aria-label", "Go to slide " + (i + 1));
      btn.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(btn);
    }
  }

  function updateDots() {
    if (!dotsWrap) return;
    Array.from(dotsWrap.children).forEach((btn, i) => {
      btn.classList.toggle("is-active", i === current);
      btn.setAttribute("aria-selected", String(i === current));
    });
  }

  function updateArrows() {
    prevBtn && (prevBtn.disabled = current <= 0);
    nextBtn && (nextBtn.disabled = current >= maxIndex());
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    const cardWidth = cards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    track.style.transform = "translateX(-" + (current * (cardWidth + gap)) + "px)";
    updateDots();
    updateArrows();
  }

  function init() {
    visibleCount = getVisible();
    if (current > maxIndex()) current = maxIndex();
    buildDots();
    goTo(current);
  }

  prevBtn && prevBtn.addEventListener("click", () => { goTo(current - 1); startAuto(); });
  nextBtn && nextBtn.addEventListener("click", () => { goTo(current + 1); startAuto(); });

  const CAT_INTERVAL = 3500;
  let catTimer = null;

  function startAuto() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    clearInterval(catTimer);
    catTimer = setInterval(() => {
      const next = current >= maxIndex() ? 0 : current + 1;
      goTo(next);
    }, CAT_INTERVAL);
  }

  function stopAuto() {
    clearInterval(catTimer);
  }

  if (window.matchMedia("(hover: hover)").matches) {
    wrap.addEventListener("mouseenter", stopAuto);
    wrap.addEventListener("mouseleave", startAuto);
  }

  document.addEventListener("visibilitychange", () => {
    document.hidden ? stopAuto() : startAuto();
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 120);
  });

  init();
  startAuto();
}());

/* ============================================================
   GALLERY LIGHTBOX
   ============================================================ */
(function initLightbox() {
  const gallery   = document.querySelector("[data-gallery]");
  const lightbox  = document.querySelector("[data-lightbox]");
  const lbImg     = document.querySelector("[data-lightbox-img]");
  const lbClose   = document.querySelector("[data-lightbox-close]");
  const lbPrev    = document.querySelector("[data-lightbox-prev]");
  const lbNext    = document.querySelector("[data-lightbox-next]");

  if (!gallery || !lightbox || !lbImg) return;

  const items = Array.from(gallery.querySelectorAll("[data-gallery-item]"));
  let current = 0;

  function openAt(index) {
    current = (index + items.length) % items.length;
    const img = items[current].querySelector("img");
    lbImg.src = img ? img.src : "";
    lbImg.alt = img ? img.alt : "";
    lightbox.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function close() {
    lightbox.setAttribute("hidden", "");
    document.body.style.overflow = "";
    items[current].focus();
  }

  items.forEach((item, i) => {
    item.addEventListener("click", () => openAt(i));
  });

  lbClose && lbClose.addEventListener("click", close);
  lbPrev  && lbPrev.addEventListener("click",  () => openAt(current - 1));
  lbNext  && lbNext.addEventListener("click",  () => openAt(current + 1));

  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", e => {
    if (lightbox.hasAttribute("hidden")) return;
    if (e.key === "Escape")      close();
    if (e.key === "ArrowLeft")   openAt(current - 1);
    if (e.key === "ArrowRight")  openAt(current + 1);
  });
}());

/* ============================================================
   CONTACT FORM
   ============================================================ */
(function initContactForm() {
  const form   = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const name    = form.querySelector("#cf-name");
    const email   = form.querySelector("#cf-email");
    const subject = form.querySelector("#cf-subject");
    const message = form.querySelector("#cf-message");

    if (!name.value.trim() || !email.value.trim() || !subject.value || !message.value.trim()) {
      if (status) {
        status.textContent = "Please fill in all required fields.";
        status.className = "form-note";
      }
      return;
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email.value.trim())) {
      if (status) {
        status.textContent = "Please enter a valid email address.";
        status.className = "form-note";
      }
      return;
    }

    if (status) {
      status.textContent = "Thank you! Your message has been sent. We\u2019ll be in touch soon.";
      status.className = "form-note success";
    }

    form.reset();
  });
}());

/* ============================================================
   SMOOTH SCROLL for anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   ============================================================ */
(function initScrollReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const SELECTOR = [
    ".menu-section",
    ".about",
    ".specials",
    ".banquet-section",
    ".footer-contact-band",
    ".special-card",
    ".menu-cat-card",
    ".about-copy",
    ".about-image-wrap",
    ".banquet-copy",
    ".banquet-image-wrap",
    ".footer-contact-col",
    ".footer-form-heading",
    ".contact-form"
  ].join(",");

  const els = document.querySelectorAll(SELECTOR);
  els.forEach(el => el.classList.add("reveal"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  els.forEach(el => observer.observe(el));
}());

/* ============================================================
   COOKIE CONSENT BANNER
   ============================================================ */
(function initCookieBanner() {
  const banner  = document.getElementById("cookie-banner");
  const accept  = document.getElementById("cookie-accept");
  const deny    = document.getElementById("cookie-deny");
  const info    = document.getElementById("cookie-settings");
  if (!banner) return;

  const STORAGE_KEY = "el-sombrero-cookie-consent";

  function dismiss() {
    banner.hidden = true;
  }

  if (!localStorage.getItem(STORAGE_KEY)) {
    banner.hidden = false;
  }

  accept && accept.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    dismiss();
  });

  deny && deny.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, "denied");
    dismiss();
  });

  info && info.addEventListener("click", () => {
    window.open("https://www.singularcreations.net", "_blank", "noopener");
  });
}());
