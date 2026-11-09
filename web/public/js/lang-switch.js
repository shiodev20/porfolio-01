/* ==========================================================================
   Language switcher dropdown (markup rendered by components/LangSwitch.astro).
   Each language is its own URL (/portfolio, /vi/portfolio), so choosing one
   remembers the choice and opens that URL.
   ========================================================================== */
(function () {
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  $$("[data-lang-switch]").forEach((root) => {
    const toggle = root.querySelector(".lang__toggle");
    const options = $$(".lang__option", root);
    const current = document.documentElement.lang;

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
    const choose = (opt) => {
      try { localStorage.setItem("lang", opt.dataset.lang); } catch (e) {}
      if (opt.dataset.lang === current) return close(true);
      location.href = opt.dataset.href + location.hash;
    };

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
  });
})();
