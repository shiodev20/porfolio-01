/* ==========================================================================
   DEV MODE ONLY — live colour tester for the 4 brand colours.

   - Injects a "Theme" swatch panel into the header navigation. Nothing in the HTML references it except the <script> tag.
   - Edits the 4 palette variables (--cafe, --ivory, --blush, --khaki) on <html>,
     so every semantic role in css/style.css follows. Saved in localStorage.
   - "Copy CSS" gives the final :root block to paste into css/style.css.

   TO SHIP: delete this file and the <script src="js/dev-theme.js"> tag in each
   page (or set DEV_MODE = false). Also clear localStorage key "dev-theme".
   ========================================================================== */
(function () {
  const DEV_MODE = true;
  if (!DEV_MODE) return;

  const STORAGE_KEY = "dev-theme";
  const ROLES = [
    { v: "--cafe",  name: "Cafe noir", use: "Ink · dark sections · buttons", fallback: "#4B3623" },
    { v: "--ivory", name: "Ivory",     use: "Page &amp; hero background · text on dark", fallback: "#FEFEF2" },
    { v: "--blush", name: "Blush",     use: "Accent · CTA · hover · highlights",    fallback: "#FFD2CF" },
    { v: "--khaki", name: "Khaki",     use: "Secondary · small details",      fallback: "#C1B094" },
  ];

  /* ---------- fonts (dev only) ----------
     Google Fonts families with a Vietnamese subset, plus Poppins, which the client asked
     about but which does NOT cover Vietnamese (flagged). "Fraunces"/"Inter" are the defaults. */
  const FONT_KEY = "dev-fonts";
  const FONTS = [
    // serif
    { name: "Fraunces", kind: "Serif", w: "300;400;500;600" },
    { name: "Lora", kind: "Serif", w: "400;500;600" },
    { name: "Playfair Display", kind: "Serif", w: "400;500;600" },
    { name: "Merriweather", kind: "Serif", w: "300;400;700" },
    { name: "Noto Serif", kind: "Serif", w: "400;500;600" },
    { name: "Literata", kind: "Serif", w: "400;500;600" },
    { name: "Cormorant Garamond", kind: "Serif", w: "400;500;600" },
    { name: "EB Garamond", kind: "Serif", w: "400;500;600" },
    { name: "Prata", kind: "Serif", w: "400" },
    { name: "Gelasio", kind: "Serif", w: "400;500;600" },   // open-source stand-in for Georgia (same proportions), covers Vietnamese
    // sans
    { name: "Inter", kind: "Sans", w: "400;500;600" },
    { name: "Be Vietnam Pro", kind: "Sans", w: "400;500;600" },
    { name: "Raleway", kind: "Sans", w: "400;500;600", lining: true },
    { name: "Montserrat", kind: "Sans", w: "400;500;600" },
    { name: "Roboto", kind: "Sans", w: "400;500;700" },
    { name: "Open Sans", kind: "Sans", w: "400;500;600" },
    { name: "Noto Sans", kind: "Sans", w: "400;500;600" },
    { name: "Nunito", kind: "Sans", w: "400;500;600" },
    { name: "Source Sans 3", kind: "Sans", w: "400;500;600" },
    { name: "Lexend", kind: "Sans", w: "400;500;600" },
    { name: "Manrope", kind: "Sans", w: "400;500;600" },
    { name: "Plus Jakarta Sans", kind: "Sans", w: "400;500;600" },
    { name: "Work Sans", kind: "Sans", w: "400;500;600" },
    { name: "Josefin Sans", kind: "Sans", w: "400;500;600" },
    { name: "Poppins", kind: "Sans", w: "400;500;600", noVn: true },
  ];
  const FONT_ROLES = [
    { v: "--font-display", name: "Heading", def: "Fraunces", fallback: "\"Times New Roman\", serif" },
    { v: "--font-body", name: "Body", def: "Inter", fallback: "system-ui, sans-serif" },
  ];
  const fontDefaults = Object.fromEntries(FONT_ROLES.map((r) => [r.v, r.def]));
  let fonts = { ...fontDefaults };
  try {
    const saved = JSON.parse(localStorage.getItem(FONT_KEY) || "null");
    if (saved) FONT_ROLES.forEach((r) => { if (FONTS.some((f) => f.name === saved[r.v])) fonts[r.v] = saved[r.v]; });
  } catch (e) {}

  const loaded = new Set(["Fraunces", "Inter"]);   // already linked by the pages
  function loadFont(name) {
    const f = FONTS.find((x) => x.name === name);
    if (!f || f.system || loaded.has(name)) return;
    loaded.add(name);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:wght@${f.w}&display=swap`;
    document.head.appendChild(link);
  }
  const fontsDefault = () => FONT_ROLES.every((r) => fonts[r.v] === fontDefaults[r.v]);
  function applyFonts() {
    FONT_ROLES.forEach((r) => {
      if (fonts[r.v] === fontDefaults[r.v]) root.style.removeProperty(r.v);
      else { loadFont(fonts[r.v]); root.style.setProperty(r.v, `"${fonts[r.v]}", ${r.fallback}`); }
    });
    // Raleway's default figures are old-style: switch to lining so years line up
    const lining = FONT_ROLES.some((r) => FONTS.find((f) => f.name === fonts[r.v])?.lining);
    root.style.fontVariantNumeric = lining ? "lining-nums" : "";
    try { fontsDefault() ? localStorage.removeItem(FONT_KEY) : localStorage.setItem(FONT_KEY, JSON.stringify(fonts)); } catch (e) {}
  }

  const root = document.documentElement;
  const norm = (h) => {
    let s = String(h).trim().replace(/^#/, "");
    if (/^[0-9a-f]{3}$/i.test(s)) s = s.split("").map((c) => c + c).join("");
    return /^[0-9a-f]{6}$/i.test(s) ? "#" + s.toUpperCase() : null;
  };
  const readCss = (v, fb) => norm(getComputedStyle(root).getPropertyValue(v)) || fb;

  // defaults come from the stylesheet (this script is loaded after it)
  const defaults = Object.fromEntries(ROLES.map((r) => [r.v, readCss(r.v, r.fallback)]));
  let state = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved) ROLES.forEach((r) => { const n = norm(saved[r.v]); if (n) state[r.v] = n; });
  } catch (e) {}

  /* ---------- colour maths ---------- */
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

  // text placed on the accent fill: whichever of ink / ivory reads better
  const accentInk = () =>
    ratio(state["--cafe"], state["--blush"]) >= ratio(state["--ivory"], state["--blush"]) ? "var(--cafe)" : "var(--ivory)";

  /* ---------- apply ---------- */
  function applyTheme() {
    if (isDefault()) {
      // Back to the stylesheet: drop inline overrides and the saved copy, so a
      // palette later pasted into css/style.css is never shadowed by stale values.
      ROLES.forEach((r) => root.style.removeProperty(r.v));
      root.style.removeProperty("--accent-ink");
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    } else {
      ROLES.forEach((r) => root.style.setProperty(r.v, state[r.v]));
      root.style.setProperty("--accent-ink", accentInk());
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }
    refreshUi();
  }
  const isDefault = () => ROLES.every((r) => state[r.v] === defaults[r.v]);
  // paint saved colours immediately (script runs in <head>, before first paint)
  ROLES.forEach((r) => root.style.setProperty(r.v, state[r.v]));
  if (!isDefault()) root.style.setProperty("--accent-ink", accentInk());
  applyFonts();

  /* ---------- UI ---------- */
  const CSS = `
  .dt, .dt * { box-sizing: border-box; }
  .dt { position: relative; margin-left: 0.5rem; font-size: 0.9rem; text-align: left; }
  .dt__toggle { display: inline-flex; align-items: center; gap: 0.55rem; padding: 0.6rem 0.5rem; }
  .dt__dots { display: inline-flex; }
  .dt__dots i { width: 0.95rem; height: 0.95rem; border-radius: 50%; border: 1px solid rgba(128,128,128,.55); margin-left: -0.3rem; }
  .dt__dots i:first-child { margin-left: 0; }
  .dt__tag { font-size: 0.6rem; letter-spacing: 0.08em; padding: 0.15rem 0.4rem; border-radius: 999px; background: #ff4d4f; color: #fff; }
  .dt__panel { color: #1a1a1a; background: #fff; border-radius: 1rem; padding: 1.1rem; width: 21rem; max-width: calc(100vw - 2rem);
    box-shadow: 0 18px 50px rgba(0,0,0,.22); font: 400 0.85rem/1.35 system-ui, sans-serif; }
  .dt .dt__panel { position: absolute; top: calc(100% + 0.4rem); right: 0; z-index: 40;
    opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(-6px); transition: opacity .2s, transform .25s, visibility 0s .25s; }
  .dt.is-open .dt__panel { opacity: 1; visibility: visible; pointer-events: auto; transform: none; transition-delay: 0s; }
  .dt__row { display: grid; grid-template-columns: 2.6rem 1fr 5.6rem; gap: .7rem; align-items: center; padding: .45rem 0; }
  .dt__swatch { position: relative; width: 2.6rem; height: 2.6rem; border-radius: 50%; border: 1px solid rgba(0,0,0,.2); overflow: hidden; cursor: pointer; }
  .dt__swatch input { position: absolute; inset: -0.5rem; width: calc(100% + 1rem); height: calc(100% + 1rem); border: 0; padding: 0; opacity: 0; cursor: pointer; }
  .dt__name { font-weight: 600; }
  .dt__hex { width: 100%; padding: .4rem .5rem; border: 1px solid #d5d5d5; border-radius: .5rem; font: 500 .8rem ui-monospace, monospace; text-transform: uppercase; color: #1a1a1a; background: #fff; }
  .dt__hex.is-bad { border-color: #ff4d4f; }
  .dt__actions { display: flex; margin-top: .8rem; }
  .dt__btn { flex: 1; padding: .6rem .8rem; border: 1px solid #d5d5d5; border-radius: 999px; font: 600 .8rem system-ui, sans-serif; color: #1a1a1a; background: #fff; cursor: pointer; text-align: center; }
  .dt__btn:hover { background: #f3f3f3; } .dt__btn:disabled { opacity: .4; cursor: default; }
  .dt__fonts { display: grid; gap: 1.1rem; margin-top: 1rem; padding-top: 1.1rem; border-top: 1px solid #eee; }
  .dt__font { display: grid; gap: .5rem; }
  .dt__font .dt__name { font-size: .78rem; text-transform: uppercase; letter-spacing: .06em; color: #666; }
  .dt__font select { width: 100%; padding: .6rem .7rem; border: 1px solid #d5d5d5; border-radius: .6rem; font: 500 .85rem system-ui, sans-serif; color: #1a1a1a; background: #fff; cursor: pointer; }
  .dt__sample { padding: .6rem .75rem; border-radius: .6rem; background: #f6f5f2; font-size: 1.1rem; line-height: 1.35; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dt__warn { font-size: .74rem; color: #d4380d; }
  `;

  const panels = [];

  function buildPanel() {
    const el = document.createElement("div");
    el.className = "dt__panel";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Colour tester (dev only)");
    el.innerHTML = `
      ${ROLES.map((r) => `
      <div class="dt__row" data-var="${r.v}">
        <label class="dt__swatch" title="Pick ${r.name}"><input type="color" aria-label="${r.name}"></label>
        <span class="dt__name">${r.name}</span>
        <input class="dt__hex" type="text" maxlength="7" spellcheck="false" aria-label="${r.name} hex">
      </div>`).join("")}
      <div class="dt__fonts">
        ${FONT_ROLES.map((r) => `
        <label class="dt__font" data-font="${r.v}">
          <span class="dt__name">${r.name}</span>
          <select aria-label="${r.name} font">
            ${["Serif", "Sans"].map((k) => `<optgroup label="${k}">${FONTS.filter((f) => f.kind === k).map((f) =>
              `<option value="${f.name}">${f.name}${f.noVn ? " ⚠ thiếu tiếng Việt" : ""}</option>`).join("")}</optgroup>`).join("")}
          </select>
          <span class="dt__sample">Lorem ipsum dolor sit amet</span>
          <span class="dt__warn" hidden>Font này thiếu dấu tiếng Việt (ơ, ư, ạ, ệ…)</span>
        </label>`).join("")}
      </div>
      <div class="dt__actions">
        <button type="button" class="dt__btn" data-act="reset">Reset</button>
      </div>`;

    el.addEventListener("input", (e) => {
      const row = e.target.closest(".dt__row");
      if (!row) return;
      if (e.target.type === "color") { state[row.dataset.var] = e.target.value.toUpperCase(); applyTheme(); }
    });
    el.addEventListener("change", (e) => {
      const fontRow = e.target.closest(".dt__font");
      if (fontRow) { fonts[fontRow.dataset.font] = e.target.value; applyFonts(); refreshUi(); return; }
      const row = e.target.closest(".dt__row");
      if (!row || !e.target.classList.contains("dt__hex")) return;
      const n = norm(e.target.value);
      if (n) { state[row.dataset.var] = n; applyTheme(); return; }
      const input = e.target;               // invalid hex: flash red, then snap back
      input.classList.add("is-bad");
      setTimeout(() => { input.value = state[row.dataset.var]; input.classList.remove("is-bad"); }, 700);
    });
    el.addEventListener("click", (e) => {
      const act = e.target.dataset && e.target.dataset.act;
      if (act === "reset") { state = { ...defaults }; fonts = { ...fontDefaults }; applyFonts(); applyTheme(); }
    });
    panels.push(el);
    return el;
  }

  function refreshUi() {
    panels.forEach((p) => {
      ROLES.forEach((r) => {
        const row = p.querySelector(`[data-var="${r.v}"]`);
        row.querySelector(".dt__swatch").style.background = state[r.v];
        const color = row.querySelector('input[type="color"]'); if (color.value.toUpperCase() !== state[r.v]) color.value = state[r.v];
        const hex = row.querySelector(".dt__hex"); if (document.activeElement !== hex) { hex.value = state[r.v]; hex.classList.remove("is-bad"); }
      });
      FONT_ROLES.forEach((r) => {
        const row = p.querySelector(`[data-font="${r.v}"]`);
        const f = FONTS.find((x) => x.name === fonts[r.v]);
        row.querySelector("select").value = fonts[r.v];
        loadFont(fonts[r.v]);
        row.querySelector(".dt__sample").style.fontFamily = `"${fonts[r.v]}", ${r.fallback}`;
        row.querySelector(".dt__warn").hidden = !f?.noVn;
      });
      p.querySelector('[data-act="reset"]').disabled = isDefault() && fontsDefault();
    });
    document.querySelectorAll(".dt__dots").forEach((d) => {
      d.innerHTML = ROLES.map((r) => `<i style="background:${state[r.v]}"></i>`).join("");
    });
  }

  function mount() {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    // 1) header navigation: toggle + popover
    const nav = document.querySelector(".nav");
    if (nav) {
      const wrap = document.createElement("div");
      wrap.className = "dt";
      wrap.innerHTML = `<button type="button" class="dt__toggle" aria-haspopup="dialog" aria-expanded="false" aria-label="Open colour tester (dev only)"><span class="dt__dots"></span><span class="dt__tag">DEV</span></button>`;
      wrap.appendChild(buildPanel());
      const toggle = wrap.querySelector(".dt__toggle");
      const setOpen = (open) => { wrap.classList.toggle("is-open", open); toggle.setAttribute("aria-expanded", open); };
      toggle.addEventListener("click", () => setOpen(!wrap.classList.contains("is-open")));
      document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) setOpen(false); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
      nav.appendChild(wrap);
    }

    refreshUi();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
