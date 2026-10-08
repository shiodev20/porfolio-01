/* ==========================================================================
   Thao Portfolio — interactions (vanilla JS, no dependencies)
   ========================================================================== */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const isTouch = matchMedia("(hover: none)").matches;

/* --------------------------------------------------------------------------
   Preloader (home only, once per session)
   -------------------------------------------------------------------------- */
function initPreloader() {
  const el = $(".preloader");
  if (!el) return Promise.resolve();

  let seen = false;
  try { seen = sessionStorage.getItem("preloaded") === "1"; } catch (e) {}
  if (seen) { el.remove(); return Promise.resolve(); }

  const words = ["Hello", "Xin chào", "Bonjour", "Ciao", "Hola", "こんにちは", "Hallo", "안녕하세요", "Hello"];
  const label = $(".preloader__word", el);
  document.body.classList.add("is-locked");

  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      label.textContent = words[i];
      i++;
      if (i < words.length) {
        setTimeout(tick, i === 1 ? 900 : 150);
      } else {
        setTimeout(() => {
          el.classList.add("is-done");
          document.body.classList.remove("is-locked");
          try { sessionStorage.setItem("preloaded", "1"); } catch (e) {}
          setTimeout(() => el.remove(), 1000);
          resolve();
        }, 600);
      }
    };
    tick();
  });
}

/* --------------------------------------------------------------------------
   Page transitions
   -------------------------------------------------------------------------- */
function initTransitions() {
  const overlay = $(".transition");
  if (!overlay) return;
  const label = $(".transition__label", overlay);

  // Reveal on arrival if we came from an internal link
  let arriving = null;
  try { arriving = sessionStorage.getItem("transition-label"); sessionStorage.removeItem("transition-label"); } catch (e) {}
  if (arriving) {
    label.textContent = window.i18n ? i18n.page(arriving) : arriving;
    overlay.classList.add("is-covering");
    requestAnimationFrame(() => {
      setTimeout(() => {
        overlay.classList.remove("is-covering");
        overlay.classList.add("is-leaving");
        setTimeout(() => overlay.classList.remove("is-leaving"), 900);
      }, 250);
    });
  }

  $$("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") ||
        a.target === "_blank" || /^https?:/.test(href)) return;

    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname) {
        if (url.hash) return; // same-page anchor
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const name = a.dataset.page || a.textContent.trim();
      label.textContent = window.i18n ? i18n.page(name) : name;
      try { sessionStorage.setItem("transition-label", name); } catch (err) {}
      overlay.classList.add("is-entering");
      setTimeout(() => { location.href = url.href; }, 750);
    });
  });

  // Back/forward cache: reset overlay
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) overlay.className = "transition";
  });
}

/* --------------------------------------------------------------------------
   Magnetic buttons
   -------------------------------------------------------------------------- */
function initMagnetic() {
  if (isTouch) return;
  $$("[data-magnetic]").forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.4;
    const inner = $(".btn__text", el);
    const base = getComputedStyle(el).transform;
    const baseT = base && base !== "none" ? base + " " : "";

    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transition = "transform 0.3s cubic-bezier(0.16,1,0.3,1)";
      el.style.transform = `${baseT}translate(${x * strength}px, ${y * strength}px)`;
      if (inner) inner.style.transform = `translate(${x * strength * 0.5}px, ${y * strength * 0.5}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transition = "transform 0.9s cubic-bezier(0.34,1.56,0.64,1)";
      el.style.transform = baseT || "";
      if (inner) {
        inner.style.transition = "transform 0.9s cubic-bezier(0.34,1.56,0.64,1)";
        inner.style.transform = "";
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Scroll: menu button, hero marquee, sliding rows
   -------------------------------------------------------------------------- */
function initScroll() {
  const menuBtn = $(".menu-btn");
  const track = $(".marquee__track");
  const rows = $$(".slides__row");
  const slidesWrap = $(".slides");
  const footerWrap = $(".footer-wrap");
  const curve = $(".footer-curve");

  let lastY = scrollY;
  let direction = -1;
  let x = 0;
  let speed = 0.04; // % per frame

  const loop = () => {
    const y = scrollY;
    if (y !== lastY) direction = y > lastY ? -1 : 1;
    const delta = Math.abs(y - lastY);
    lastY = y;

    if (menuBtn && !isTouch && innerWidth > 900) {
      menuBtn.classList.toggle("is-visible", y > 150);
    }

    if (track) {
      const boost = Math.min(delta * 0.02, 0.6);
      x += direction * (speed + boost);
      // track contains two identical halves; wrap at -50%
      if (x <= -50) x += 50;
      if (x > 0) x -= 50;
      track.style.transform = `translate3d(${x}%,0,0)`;
    }

    if (slidesWrap && rows.length) {
      const r = slidesWrap.getBoundingClientRect();
      const progress = (innerHeight - r.top) / (innerHeight + r.height); // 0 → 1
      if (progress > -0.2 && progress < 1.2) {
        rows[0].style.transform = `translate3d(${progress * 10}vw,0,0)`;
        if (rows[1]) rows[1].style.transform = `translate3d(${-progress * 10}vw,0,0)`;
      }
    }

    // Footer curve: full oval when the footer enters, flat once it fills the screen
    if (footerWrap && curve) {
      const r = footerWrap.getBoundingClientRect();
      const distance = Math.min(r.height, innerHeight) * 0.75;
      const p = Math.min(Math.max((innerHeight - r.top) / distance, 0), 1);
      curve.style.height = `${(1 - p) * innerHeight * 0.3}px`;
    }

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* --------------------------------------------------------------------------
   Side menu
   -------------------------------------------------------------------------- */
function initMenu() {
  const btn = $(".menu-btn");
  if (!btn) return;
  const close = () => document.body.classList.remove("menu-open");
  btn.addEventListener("click", () => document.body.classList.toggle("menu-open"));
  $(".side-menu-overlay")?.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  $$(".side-menu a").forEach((a) => a.addEventListener("click", close));
}

/* --------------------------------------------------------------------------
   Work list floating preview
   -------------------------------------------------------------------------- */
function initWorkPreview() {
  // Rows: home work list, or any [data-preview-item] (portfolio). A row may set
  // data-preview-index to pick its slide, so filtering doesn't break the mapping.
  const rows = $$(".work__row, [data-preview-item], [data-preview-src]");
  const preview = $(".preview");
  if (!rows.length || !preview || isTouch) return;

  const slider = $(".preview__slider", preview);
  const cursor = $(".preview-cursor");
  const label = $(".preview-label");
  const els = [
    { el: preview, x: 0, y: 0, ease: 0.12 },
    { el: cursor, x: 0, y: 0, ease: 0.2 },
    { el: label, x: 0, y: 0, ease: 0.25 },
  ];
  let mx = innerWidth / 2, my = innerHeight / 2;

  window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });

  const slides = $$(".preview__slide", slider);
  const dynamic = $(".preview__slide--dynamic", slider);

  rows.forEach((row, i) => {
    const index = row.dataset.previewIndex !== undefined ? +row.dataset.previewIndex : i;
    row.addEventListener("mouseenter", () => {
      if (row.closest(".pf-item.is-open")) return;        // opened project: no hover effect
      let target = index;
      if (row.dataset.previewSrc && dynamic) {            // per-row image (e.g. certificates)
        dynamic.querySelector("img").src = row.dataset.previewSrc;
        target = slides.indexOf(dynamic);
      }
      slider.style.transform = `translateY(${-target * 100}%)`;
      els.forEach((o) => o.el.classList.add("is-active"));
    });
    row.addEventListener("mouseleave", () => els.forEach((o) => o.el.classList.remove("is-active")));
    row.addEventListener("click", () => els.forEach((o) => o.el.classList.remove("is-active")));
  });

  const loop = () => {
    els.forEach((o) => {
      o.x = lerp(o.x, mx, o.ease);
      o.y = lerp(o.y, my, o.ease);
      o.el.style.left = `${o.x}px`;
      o.el.style.top = `${o.y}px`;
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* --------------------------------------------------------------------------
   Home portfolio: List / Grid view (phones always show the grid via CSS)
   -------------------------------------------------------------------------- */
function initWorkView() {
  const section = $(".work[data-view]");
  if (!section) return;
  const buttons = $$("[data-work-view]", section);
  const set = (view) => {
    section.dataset.view = view;
    buttons.forEach((b) => b.setAttribute("aria-pressed", b.dataset.workView === view));
    try { localStorage.setItem("work-view", view); } catch (e) {}
  };
  buttons.forEach((b) => b.addEventListener("click", () => set(b.dataset.workView)));
  let saved = null;
  try { saved = localStorage.getItem("work-view"); } catch (e) {}
  if (saved === "list" || saved === "grid") set(saved);
}

/* --------------------------------------------------------------------------
   Image viewer (lightbox): Education rows + project gallery images.
   X / Esc / backdrop click close it; focus returns to the trigger.
   -------------------------------------------------------------------------- */
function initLightbox() {
  const box = $(".lightbox");
  if (!box) return;
  const img = $(".lightbox__img", box);
  const caption = $(".lightbox__caption", box);
  const closeBtn = $(".lightbox__close", box);
  let lastFocus = null;
  const isOpen = () => box.classList.contains("is-open");

  const show = (src, title, meta, trigger) => {
    img.src = src;
    img.alt = title || "";
    const t = document.createElement("strong");
    t.textContent = title || "";
    const m = document.createElement("span");
    m.textContent = meta || "";
    caption.replaceChildren(t, m);
    lastFocus = trigger || document.activeElement;   // not every browser focuses a clicked button
    box.classList.add("is-open");
    box.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    closeBtn.focus();
  };
  const close = () => {
    if (!isOpen()) return;
    box.classList.remove("is-open");
    box.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    if (lastFocus) lastFocus.focus();
  };

  // Education: the row's degree / organization / year become the caption
  $$(".edu-row[data-preview-src] .edu-row__open").forEach((b) =>
    b.addEventListener("click", () => {
      const row = b.closest(".edu-row");
      const text = (sel) => (($(sel, row) || {}).textContent || "").replace(/\s+/g, " ").trim();
      show(row.dataset.previewSrc, text(".edu-row__degree"),
        [text(".edu-row__org"), text(".edu-row__year")].filter(Boolean).join(" · "), b);
    }));
  // Project galleries
  $$("[data-lightbox]").forEach((b) =>
    b.addEventListener("click", () => show(b.dataset.src, b.dataset.title, b.dataset.meta, b)));

  closeBtn.addEventListener("click", close);
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") { e.preventDefault(); closeBtn.focus(); }   // keep focus inside the dialog
  });
}

/* --------------------------------------------------------------------------
   Reveal on scroll
   -------------------------------------------------------------------------- */
function initReveal() {
  const items = $$("[data-reveal]");
  if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
}

/* --------------------------------------------------------------------------
   Local time in footer
   -------------------------------------------------------------------------- */
function initClock() {
  const el = $("[data-clock]");
  if (!el) return;
  const tz = el.dataset.clock || "Asia/Ho_Chi_Minh";
  const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz });
  const update = () => { el.textContent = `${fmt.format(new Date())} GMT+7`; };
  update();
  setInterval(update, 10000);
}

/* --------------------------------------------------------------------------
   Contact form (no backend → opens mail client)
   Replace with Formspree / your own endpoint if needed.
   -------------------------------------------------------------------------- */
function initForm() {
  const form = $(".form");
  if (!form) return;
  const status = $(".form__status");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    if (!d.get("name") || !d.get("email") || !d.get("message")) {
      status.textContent = window.i18n ? i18n.t("_msg.fill", "Please fill in your name, email and message.") : "Please fill in your name, email and message.";
      return;
    }
    const body = [
      `Name: ${d.get("name")}`,
      `Email: ${d.get("email")}`,
      `Organization: ${d.get("organization") || "-"}`,
      `Services: ${d.get("services") || "-"}`,
      "",
      d.get("message"),
    ].join("\n");
    const to = form.dataset.mailto;
    location.href = `mailto:${to}?subject=${encodeURIComponent("New project enquiry")}&body=${encodeURIComponent(body)}`;
    status.textContent = window.i18n ? i18n.t("_msg.opening", "Opening your mail app…") : "Opening your mail app…";
  });
}

/* --------------------------------------------------------------------------
   About: tabs (Education)
   -------------------------------------------------------------------------- */
function initTabs() {
  $$("[data-tabs]").forEach((wrap) => {
    const tabs = $$('[role="tab"]', wrap);
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", on);
        t.tabIndex = on ? 0 : -1;
        $("#" + t.getAttribute("aria-controls")).hidden = !on;
      });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => {
        select(tab);
        tab.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); // chips row on small screens
      });
      tab.addEventListener("keydown", (e) => {
        const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!dir) return;
        const next = tabs[(i + dir + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });
  });
}

/* --------------------------------------------------------------------------
   About: journey timeline progress + staggered flow
   -------------------------------------------------------------------------- */
function initTimeline() {
  const timeline = $(".timeline");
  if (!timeline) return;
  const progress = $(".timeline__progress", timeline);
  const items = $$(".timeline__item, .stage", timeline);

  const update = () => {
    const r = timeline.getBoundingClientRect();
    const mid = innerHeight * 0.6;
    const p = Math.min(Math.max((mid - r.top) / r.height, 0), 1);
    progress.style.transform = `scaleY(${p})`;
    items.forEach((it) => {
      const dot = it.getBoundingClientRect().top + 50;
      it.classList.toggle("is-in", dot < mid);
    });
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function initFlow() {
  const flow = $(".flow");
  if (!flow) return;
  if (!("IntersectionObserver" in window)) { flow.classList.add("is-in"); return; }
  const io = new IntersectionObserver(([en]) => {
    if (en.isIntersecting) { flow.classList.add("is-in"); io.disconnect(); }
  }, { threshold: 0.4 });
  io.observe(flow);
}

/* --------------------------------------------------------------------------
   Portfolio: expandable career rows (one open at a time) + deep links (#id)
   -------------------------------------------------------------------------- */
function initPortfolio() {
  const root = $("[data-portfolio]");
  if (!root) return;
  const items = $$(".pf-item", root);

  const setOpen = (item, open) => {
    item.classList.toggle("is-open", open);
    $(".pf-row", item).setAttribute("aria-expanded", open);
  };

  items.forEach((item) => {
    $(".pf-row", item).addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      items.forEach((it) => setOpen(it, false));
      setOpen(item, willOpen);
      if (willOpen) history.replaceState(null, "", "#" + item.id);
    });
  });

  const openFromHash = (smooth) => {
    const id = decodeURIComponent(location.hash.slice(1));
    const item = id && items.find((it) => it.id === id);
    if (!item) return;
    items.forEach((it) => setOpen(it, it === item));
    setTimeout(() => item.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" }), 80);
  };
  openFromHash(false);
  window.addEventListener("hashchange", () => openFromHash(true));
}

/* --------------------------------------------------------------------------
   Sticky in-page nav: highlight the section currently in view
   -------------------------------------------------------------------------- */
function initSubnav() {
  const links = $$(".subnav__link");
  if (!links.length || !("IntersectionObserver" in window)) return;
  const map = new Map();
  links.forEach((a) => {
    const target = $(a.getAttribute("href"));
    if (target) map.set(target, a);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => l.classList.toggle("is-active", l === map.get(en.target)));
      // keep the active pill visible in the horizontally scrollable bar
      map.get(en.target)?.scrollIntoView({ block: "nearest", inline: "center" });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((_, section) => io.observe(section));
}

/* --------------------------------------------------------------------------
   Boot
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons(); // <i data-lucide> -> inline <svg>
  initTransitions();
  initMenu();
  initMagnetic();
  initScroll();
  initWorkPreview();
  initWorkView();
  initLightbox();
  initClock();
  initForm();
  initTabs();
  initTimeline();
  initFlow();
  initPortfolio();
  initSubnav();
  initPreloader().then(initReveal);
});
