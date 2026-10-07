/* ==========================================================================
   DEV MODE ONLY — live colour tester for the 4 brand colours.

   - Injects a "Theme" swatch panel into the header navigation and into the
     side menu. Nothing in the HTML references it except the <script> tag.
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
    { v: "--ivory", name: "Ivory",     use: "Page background · text on dark", fallback: "#FEFEF2" },
    { v: "--blush", name: "Blush",     use: "Accent · hero · CTA · hover",    fallback: "#FFD2CF" },
    { v: "--khaki", name: "Khaki",     use: "Secondary · small details",      fallback: "#C1B094" },
  ];

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
  .dt:not(.dt--inline) .dt__panel { position: absolute; top: calc(100% + 0.4rem); right: 0; z-index: 40;
    opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(-6px); transition: opacity .2s, transform .25s, visibility 0s .25s; }
  .dt.is-open .dt__panel { opacity: 1; visibility: visible; pointer-events: auto; transform: none; transition-delay: 0s; }
  .dt--inline { margin: 0; }
  .dt--inline .dt__panel { width: 100%; }
  .dt__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: .8rem; font-weight: 600; }
  .dt__row { display: grid; grid-template-columns: 2.6rem 1fr 5.6rem; gap: .7rem; align-items: center; padding: .45rem 0; }
  .dt__swatch { position: relative; width: 2.6rem; height: 2.6rem; border-radius: 50%; border: 1px solid rgba(0,0,0,.2); overflow: hidden; cursor: pointer; }
  .dt__swatch input { position: absolute; inset: -0.5rem; width: calc(100% + 1rem); height: calc(100% + 1rem); border: 0; padding: 0; opacity: 0; cursor: pointer; }
  .dt__name { font-weight: 600; }
  .dt__use { display: block; font-size: .72rem; color: #6b6b6b; }
  .dt__hex { width: 100%; padding: .4rem .5rem; border: 1px solid #d5d5d5; border-radius: .5rem; font: 500 .8rem ui-monospace, monospace; text-transform: uppercase; color: #1a1a1a; background: #fff; }
  .dt__hex.is-bad { border-color: #ff4d4f; }
  .dt__contrast { margin: .8rem 0; padding-top: .7rem; border-top: 1px solid #eee; display: grid; gap: .25rem; font-size: .76rem; }
  .dt__contrast div { display: flex; justify-content: space-between; gap: .5rem; }
  .dt__ok { color: #1a8a3c; } .dt__mid { color: #b7791f; } .dt__bad { color: #d4380d; }
  .dt__actions { display: flex; gap: .5rem; }
  .dt__btn { flex: 1; padding: .6rem .8rem; border: 1px solid #d5d5d5; border-radius: 999px; font: 600 .8rem system-ui, sans-serif; color: #1a1a1a; background: #fff; cursor: pointer; text-align: center; }
  .dt__btn:hover { background: #f3f3f3; } .dt__btn:disabled { opacity: .4; cursor: default; }
  .dt__btn--primary { background: #1a1a1a; color: #fff; border-color: #1a1a1a; } .dt__btn--primary:hover { background: #333; }
  .dt__note { margin-top: .7rem; font-size: .7rem; color: #8a8a8a; }
  .dt-menu-block { overflow: visible; }
  .side-menu { overflow-y: auto; }
  `;

  const panels = [];

  function buildPanel() {
    const el = document.createElement("div");
    el.className = "dt__panel";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Colour tester (dev only)");
    el.innerHTML = `
      <div class="dt__head"><span>Colour tester</span><span class="dt__tag">DEV</span></div>
      ${ROLES.map((r) => `
      <div class="dt__row" data-var="${r.v}">
        <label class="dt__swatch" title="Pick ${r.name}"><input type="color" aria-label="${r.name}"></label>
        <div><span class="dt__name">${r.name}</span><span class="dt__use">${r.use}</span></div>
        <input class="dt__hex" type="text" maxlength="7" spellcheck="false" aria-label="${r.name} hex">
      </div>`).join("")}
      <div class="dt__contrast" aria-label="Contrast checks"></div>
      <div class="dt__actions">
        <button type="button" class="dt__btn" data-act="reset">Reset</button>
        <button type="button" class="dt__btn dt__btn--primary" data-act="copy">Copy CSS</button>
      </div>
      <p class="dt__note">Dev-only. Saved in this browser. Paste the copied block over :root in css/style.css.</p>`;

    el.addEventListener("input", (e) => {
      const row = e.target.closest(".dt__row");
      if (!row) return;
      if (e.target.type === "color") { state[row.dataset.var] = e.target.value.toUpperCase(); applyTheme(); }
    });
    el.addEventListener("change", (e) => {
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
      if (act === "reset") { state = { ...defaults }; applyTheme(); }
      if (act === "copy") copyCss(e.target);
    });
    panels.push(el);
    return el;
  }

  function cssBlock() {
    return `:root {\n${ROLES.map((r) => `  ${r.v}: ${state[r.v]};  /* ${r.name} */`).join("\n")}\n}`;
  }

  function copyCss(btn) {
    const text = cssBlock();
    const done = () => { const old = btn.textContent; btn.textContent = "Copied ✓"; setTimeout(() => (btn.textContent = old), 1400); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (err) { prompt("Copy this CSS:", text); }
      ta.remove();
    }
  }

  const grade = (r) => (r >= 4.5 ? ["dt__ok", "AA ✓"] : r >= 3 ? ["dt__mid", "large only"] : ["dt__bad", "low ✗"]);

  function refreshUi() {
    const [cafe, ivory, blush, khaki] = ROLES.map((r) => state[r.v]);
    panels.forEach((p) => {
      ROLES.forEach((r) => {
        const row = p.querySelector(`[data-var="${r.v}"]`);
        row.querySelector(".dt__swatch").style.background = state[r.v];
        const color = row.querySelector('input[type="color"]'); if (color.value.toUpperCase() !== state[r.v]) color.value = state[r.v];
        const hex = row.querySelector(".dt__hex"); if (document.activeElement !== hex) { hex.value = state[r.v]; hex.classList.remove("is-bad"); }
      });
      const checks = [["Ink on Ivory (body text)", cafe, ivory], ["Ivory on Ink (footer, journey)", ivory, cafe], ["Ink on Blush (hero, CTA)", cafe, blush], ["Ink on Khaki", cafe, khaki]];
      p.querySelector(".dt__contrast").innerHTML = checks.map(([label, a, b]) => {
        const r = ratio(a, b); const [cls, txt] = grade(r);
        return `<div><span>${label}</span><span class="${cls}">${r.toFixed(1)}:1 ${txt}</span></div>`;
      }).join("");
      p.querySelector('[data-act="reset"]').disabled = isDefault();
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

    // 2) side menu (mobile + after-scroll menu): the same panel, always open
    const side = document.querySelector(".side-menu");
    if (side) {
      const block = document.createElement("div");
      block.className = "dt-menu-block";
      block.innerHTML = `<p class="side-menu__label">Theme · dev</p><div class="dt dt--inline"></div>`;
      block.querySelector(".dt").appendChild(buildPanel());
      side.insertBefore(block, side.lastElementChild);
    }
    refreshUi();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
