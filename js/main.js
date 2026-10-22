/* ==========================================================================
   Thao Portfolio — interactions (vanilla JS, no dependencies)
   ========================================================================== */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const isTouch = matchMedia("(hover: none)").matches;

/* --------------------------------------------------------------------------
   Smooth scrolling (Lenis). Falls back to native scrolling if the library is missing,
   on reduced-motion, and on touch screens (native momentum is already smooth there).
   -------------------------------------------------------------------------- */
let lenis = null;

function initSmoothScroll() {
  if (!window.Lenis || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  lenis = new Lenis({
    duration: 1.2,                                            // seconds a wheel "flick" glides for
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out: fast start, long soft landing
    smoothWheel: true,
    wheelMultiplier: 0.9,
  });
  window.lenis = lenis;
  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  // Overlays that scroll or trap focus must not scroll the page behind them
  $$(".side-menu, .lightbox").forEach((el) => el.setAttribute("data-lenis-prevent", ""));
  new MutationObserver(() => (document.body.classList.contains("is-locked") ? lenis.stop() : lenis.start()))
    .observe(document.body, { attributes: true, attributeFilter: ["class"] });
  if (document.body.classList.contains("is-locked")) lenis.stop();

  // In-page anchors (#section) glide instead of jumping, honouring each target's scroll-margin
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const id = a.getAttribute("href");
    const target = id.length > 1 ? document.querySelector(id) : null;
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -(parseFloat(getComputedStyle(target).scrollMarginTop) || 0), duration: 1.4 });
    history.replaceState(null, "", id);
  });
}

/** Scroll the page so `el` is centred (or at the top if taller than the screen). */
function scrollToElement(el, smooth) {
  const r = el.getBoundingClientRect();
  const tall = r.height > innerHeight - 160;
  const y = Math.max(0, r.top + scrollY - (tall ? 100 : (innerHeight - r.height) / 2));
  if (lenis) lenis.scrollTo(y, { immediate: !smooth, duration: 1.4 });
  else scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
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
    overlay.classList.add("is-covering");                       // hand over from the <head> cover…
    document.documentElement.classList.remove("is-arriving");   // …without a frame in between
    requestAnimationFrame(() => {
      setTimeout(() => {
        overlay.classList.remove("is-covering");
        overlay.classList.add("is-leaving");
        setTimeout(() => overlay.classList.remove("is-leaving"), 950);
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
      const name = (a.dataset.page || a.textContent).replace(/\s+/g, " ").trim(); // one line, same text before/after load
      label.textContent = window.i18n ? i18n.page(name) : name;
      try { sessionStorage.setItem("transition-label", label.textContent); } catch (err) {}
      overlay.classList.add("is-entering");
      setTimeout(() => { location.href = url.href; }, 750);    // after the sheet has covered the page
    });
  });

  // Back/forward cache: reset overlay
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      overlay.className = "transition";
      document.documentElement.classList.remove("is-arriving");
    }
  });
}

/* --------------------------------------------------------------------------
   Magnetic buttons
   -------------------------------------------------------------------------- */
function initMagnetic() {
  if (isTouch) return;
  $$("[data-magnetic]").forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.4;
    const inner = $(".btn__text, .logo__names", el);   // the label that trails the pointer (menu items, brand)
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
   ticker(step): runs step() on animation frames only while it returns true.
   kick() wakes it up (e.g. on scroll); it then sleeps again once settled.
   Keeps the page idle when nothing moves instead of looping every frame.
   -------------------------------------------------------------------------- */
function ticker(step) {
  let running = false;
  const frame = () => { running = step() === true; if (running) requestAnimationFrame(frame); };
  return () => { if (!running) { running = true; requestAnimationFrame(frame); } };
}

/* --------------------------------------------------------------------------
   Scroll: menu pill visibility + the hero name marquee (right → left, faster while scrolling)
   -------------------------------------------------------------------------- */
function initScroll() {
  const menuBtn = $(".menu-btn");
  const band = $(".home-marquee");
  const track = $(".home-marquee__track");
  const footerWrap = $(".footer-wrap");
  const curve = $(".footer-curve");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // menu pill (desktop): shown once the header has scrolled away; always shown on small screens
  const menu = () => { if (menuBtn && !isTouch && innerWidth > 900) menuBtn.classList.toggle("is-visible", scrollY > 150); };

  // hero name band: runs right → left, faster while scrolling; paused while off screen
  let x = 0, boost = 0, lastY = scrollY, bandVisible = true;
  const speed = 0.035;
  const marquee = ticker(() => {
    const delta = Math.abs(scrollY - lastY);
    lastY = scrollY;
    boost = lerp(boost, Math.min(delta * 0.02, 0.6), 0.08);
    x -= speed + boost;
    if (x <= -50) x += 50;
    track.style.transform = `translate3d(${x}%,0,0)`;
    return bandVisible;
  });
  if (track && !still) {
    new IntersectionObserver(([e]) => { bandVisible = e.isIntersecting; if (bandVisible) marquee(); }).observe(band);
    marquee();
  }

  // footer curve: deep Ivory arc when the footer enters, flat once it fills the screen
  let curveP = null;
  const footer = ticker(() => {
    const r = footerWrap.getBoundingClientRect();
    if (r.top > innerHeight) { if (curveP !== 0) { curveP = 0; curve.style.height = `${innerHeight * 0.18}px`; } return false; }
    const p = Math.min(Math.max((innerHeight - r.top) / (innerHeight * 0.8), 0), 1);
    curveP = curveP === null ? p : lerp(curveP, p, 0.12);
    if (Math.abs(curveP - p) < 0.002) curveP = p;
    curve.style.height = `${(1 - curveP) * innerHeight * 0.18}px`;
    return curveP !== p;                                    // keep easing until it catches up
  });

  const onScroll = () => { menu(); if (footerWrap && curve) footer(); };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
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
  // Rows: home cards, Portfolio project rows ([data-preview-item]) and certificate rows ([data-preview-src]).
  const rows = $$(".work__row, [data-preview-item], [data-preview-src]");
  const preview = $(".preview");                     // floating image (Portfolio page only)
  const cursor = $(".preview-cursor");
  const label = $(".preview-label");
  if (!rows.length || !cursor || isTouch) return;

  const previewImg = preview ? $(".preview__slide img", preview) : null;
  const els = [
    preview && { el: preview, x: 0, y: 0, ease: 0.12 },
    { el: cursor, x: 0, y: 0, ease: 0.2 },
    label && { el: label, x: 0, y: 0, ease: 0.25 },
  ].filter(Boolean);
  const circle = els.filter((o) => o.el !== preview); // the "View" circle on its own
  let mx = innerWidth / 2, my = innerHeight / 2, active = false;

  // follow the pointer only while something is shown (or still easing back)
  const follow = ticker(() => {
    let moving = false;
    els.forEach((o) => {
      o.x = lerp(o.x, mx, o.ease);
      o.y = lerp(o.y, my, o.ease);
      if (Math.abs(o.x - mx) > 0.5 || Math.abs(o.y - my) > 0.5) moving = true;
      o.el.style.transform = `translate3d(${o.x}px, ${o.y}px, 0) translate(-50%, -50%) scale(var(--s, 0))`;
    });
    return active || moving;
  });
  addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; if (active) follow(); }, { passive: true });

  const show = (list) => { active = true; list.forEach((o) => o.el.classList.add("is-active")); follow(); };
  const hide = () => { active = false; els.forEach((o) => o.el.classList.remove("is-active")); follow(); };

  rows.forEach((row) => {
    row.addEventListener("mouseenter", () => {
      if (row.closest(".pf-item.is-open")) return;        // opened project: no hover effect
      if (row.classList.contains("work__row") || !previewImg) return show(circle);   // home cards: View circle only
      // per-row image: certificates use data-preview-src, projects use their first gallery photo
      const src = row.dataset.previewSrc || row.closest(".pf-item")?.querySelector(".pf-shot img")?.getAttribute("src");
      if (src && previewImg.getAttribute("src") !== src) previewImg.src = src;
      show(els);
    });
    row.addEventListener("mouseleave", hide);
    row.addEventListener("click", hide);
  });
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
   Greeting intro: "Xin chào" … "Hello" in several languages, then the screen
   slides up. Home page, on every direct visit; the <head> script skips it
   (html.is-greeted) only when arriving from another page of the site.
   -------------------------------------------------------------------------- */
function initGreeting() {
  const el = $(".greeting");
  if (!el || document.documentElement.classList.contains("is-greeted")) { if (el) el.remove(); return Promise.resolve(); }
  const words = ["Xin chào", "Bonjour", "Hola", "Ciao", "Olá", "Hallo", "こんにちは", "안녕하세요", "你好", "Hello"];
  const word = $(".greeting__word", el);
  document.body.classList.add("is-locked");

  return new Promise((resolve) => {
    let i = 0;
    const next = () => {
      word.textContent = words[i];
      i++;
      if (i < words.length) setTimeout(next, i === 1 ? 900 : 160);   // first word lingers, the rest flick by
      else setTimeout(() => {
        el.classList.add("is-done");
        document.body.classList.remove("is-locked");
        setTimeout(() => el.remove(), 1000);
        resolve();
      }, 700);
    };
    next();
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

  // Timing: the date picker can't go back in time; "Today" fills in today's date if none is set
  const date = $("#f-timing-date", form);
  const toISO = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  if (date) date.min = toISO(new Date());
  $$('input[name="timing_preset"]', form).forEach((r) => r.addEventListener("change", () => {
    if (r.value === "today" && date && !date.value) date.value = toISO(new Date());
  }));
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
      `Reaching out as: ${d.get("as") || "-"}`,
      `Would like to work with me as: ${d.get("role") || "-"}`,
      `Format: ${d.getAll("format").join(", ") || "-"}`,
      `Timing: ${[d.get("timing_preset"), d.get("timing_date"), d.get("timing_time")].filter(Boolean).join(" · ") || "-"}`,
      "",
      d.get("message"),
    ].join("\n");
    const to = form.dataset.mailto;
    location.href = `mailto:${to}?subject=${encodeURIComponent("Work with me — new enquiry")}&body=${encodeURIComponent(body)}`;
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
  const items = $$(".stage", timeline);

  let shown = 0;                                   // eased value actually drawn
  const update = ticker(() => {
    const r = timeline.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) return false;   // off screen: nothing to draw
    const mid = innerHeight * 0.6;
    const p = Math.min(Math.max((mid - r.top) / r.height, 0), 1);
    shown = Math.abs(p - shown) < 0.0005 ? p : lerp(shown, p, 0.12);
    progress.style.transform = `scaleY(${shown})`;
    items.forEach((it) => it.classList.toggle("is-in", it.getBoundingClientRect().top + 50 < mid));
    return shown !== p;
  });
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();
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
    setTimeout(() => scrollToElement(item, smooth), 80);
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
  // block dragging images out of the page (Firefox ignores the CSS -webkit-user-drag)
  document.addEventListener("dragstart", (e) => { if (e.target instanceof HTMLImageElement) e.preventDefault(); });
  document.querySelectorAll("img").forEach((img) => img.setAttribute("draggable", "false"));
  initSmoothScroll();
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
  initGreeting().then(() => {
    initReveal();
    // Hero entrance plays once the greeting (or the page-transition cover) is out of the way
    const html = document.documentElement;
    const wait = html.classList.contains("is-greeted") ? 450 : 150;
    setTimeout(() => html.classList.replace("hero-pending", "hero-in"), wait);
  });
});
