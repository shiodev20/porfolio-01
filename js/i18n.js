/* ==========================================================================
   i18n — language switcher with dropdown (vanilla JS)

   Markup contract
   - English is the source and lives in the HTML.
   - data-i18n="key"                       -> element's innerHTML is swapped
   - data-i18n-attr="attr:key;attr2:key2"  -> attributes are swapped (placeholder, aria-label, alt, content)
   - <div class="lang" data-lang-switch>   -> the dropdown is rendered here (any number of them)

   Adding a language
   1. Create js/lang/<code>.js that sets window.I18N.<code> = { key: "text" }
      and window.I18N_META.<code> = { label: "Native name", short: "XX" }
   2. Load it in the pages before js/i18n.js.
   No other change is needed: the dropdown lists every registered language.
   A missing key falls back to the original English.
   ========================================================================== */
(function () {
  const STORAGE_KEY = "lang";
  const dicts = window.I18N || {};

  // Registry: English is built in, the rest register themselves via I18N_META.
  const LANGS = Object.assign({ en: { label: "English", short: "EN" } }, window.I18N_META || {});
  const CODES = Object.keys(LANGS).filter((c) => c === "en" || dicts[c]);
  let current = "en";

  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // Dictionary values may contain entities (&amp;); attributes need plain text.
  const decode = (html) => {
    const t = document.createElement("textarea");
    t.innerHTML = html;
    return t.value;
  };

  const detect = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (CODES.includes(saved)) return saved;
    } catch (e) {}
    const browser = (navigator.language || "").toLowerCase().split("-")[0];
    return CODES.includes(browser) ? browser : "en";
  };

  const lookup = (lang, key) => (lang === "en" ? undefined : (dicts[lang] || {})[key]);

  /* ---------- translate the document ---------- */
  function apply(lang) {
    current = lang;
    document.documentElement.lang = lang;

    $$("[data-i18n]").forEach((el) => {
      const isTitle = el.tagName === "TITLE";
      if (!("i18nEn" in el.dataset)) el.dataset.i18nEn = isTitle ? el.textContent : el.innerHTML;
      const v = lookup(lang, el.dataset.i18n);
      if (isTitle) el.textContent = v !== undefined ? decode(v) : el.dataset.i18nEn;
      else el.innerHTML = v !== undefined ? v : el.dataset.i18nEn;
    });

    $$("[data-i18n-attr]").forEach((el) => {
      if (!el.dataset.i18nAttrEn) el.dataset.i18nAttrEn = "{}";
      const originals = JSON.parse(el.dataset.i18nAttrEn);
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        if (!(attr in originals)) {
          originals[attr] = el.getAttribute(attr) || "";
          el.dataset.i18nAttrEn = JSON.stringify(originals);
        }
        const v = lookup(lang, key);
        el.setAttribute(attr, v !== undefined ? decode(v) : originals[attr]);
      });
    });

    syncSwitchers();
  }

  function set(lang) {
    if (!CODES.includes(lang)) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    apply(lang);
  }

  /* ---------- dropdown ---------- */
  const CHEVRON =
    '<svg class="lang__chevron" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';

  function render(root, index) {
    const id = `lang-menu-${index}`;
    root.innerHTML = `
      <button type="button" class="lang__toggle" aria-haspopup="listbox" aria-expanded="false"
              aria-controls="${id}" aria-label="Language" data-i18n-attr="aria-label:language">
        <span class="lang__current"></span>${CHEVRON}
      </button>
      <ul class="lang__menu" id="${id}" role="listbox" tabindex="-1" aria-label="Language" data-i18n-attr="aria-label:language">
        ${CODES.map((c) => `
        <li class="lang__option" role="option" tabindex="-1" data-lang="${c}" lang="${c}" aria-selected="false">
          <span class="lang__label">${LANGS[c].label}</span><span class="lang__code">${LANGS[c].short}</span>
        </li>`).join("")}
      </ul>`;

    const toggle = root.querySelector(".lang__toggle");
    const menu = root.querySelector(".lang__menu");
    const options = [...menu.querySelectorAll(".lang__option")];

    const isOpen = () => root.classList.contains("is-open");
    const open = () => {
      $$("[data-lang-switch].is-open").forEach((r) => r !== root && r.dispatchEvent(new Event("lang:close")));
      root.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      (options.find((o) => o.dataset.lang === current) || options[0]).focus();
    };
    const close = (returnFocus) => {
      root.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      if (returnFocus) toggle.focus();
    };
    const choose = (opt) => { set(opt.dataset.lang); close(true); };

    toggle.addEventListener("click", () => (isOpen() ? close() : open()));
    toggle.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); open(); }
    });
    root.addEventListener("lang:close", () => close());

    options.forEach((opt, i) => {
      opt.addEventListener("click", () => choose(opt));
      opt.addEventListener("keydown", (e) => {
        const move = (n) => { e.preventDefault(); options[(n + options.length) % options.length].focus(); };
        if (e.key === "ArrowDown") move(i + 1);
        else if (e.key === "ArrowUp") move(i - 1);
        else if (e.key === "Home") move(0);
        else if (e.key === "End") move(options.length - 1);
        else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(opt); }
        else if (e.key === "Escape") { e.preventDefault(); close(true); }
        else if (e.key === "Tab") close();
      });
    });

    document.addEventListener("click", (e) => { if (isOpen() && !root.contains(e.target)) close(); });
  }

  function syncSwitchers() {
    $$("[data-lang-switch]").forEach((root) => {
      const cur = root.querySelector(".lang__current");
      if (cur) cur.textContent = LANGS[current].short;
      $$(".lang__option", root).forEach((o) => o.setAttribute("aria-selected", o.dataset.lang === current));
    });
  }

  /* ---------- runtime helpers for strings produced by JS ---------- */
  const t = (key, fallback) => {
    const v = lookup(current, key);
    return v !== undefined ? decode(v) : fallback;
  };
  const page = (name) => t("_page." + name, name);

  window.i18n = {
    set, t, page,
    get lang() { return current; },
    get languages() { return CODES.map((c) => ({ code: c, ...LANGS[c] })); },
  };

  $$("[data-lang-switch]").forEach(render);
  apply(detect());
})();
