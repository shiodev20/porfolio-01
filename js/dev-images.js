/* ==========================================================================
   DEV ONLY — try your own photos on the page.

   - Every image gets a small icon (top-right corner); Education rows get one at
     the end of the row. Clicking it opens a drop zone: drag a photo in (or pick
     a file) and it replaces that image straight away.
   - Everything stays in this browser: the photo is never uploaded anywhere.
     It is kept in IndexedDB, so it survives reloads and page changes, until
     "Restore original" / "Reset all" (or clearing the browser's site data).

   TO SHIP: remove the <script> tag marked "DEV ONLY: image picker" in each page
   (or set DEV_MODE = false) and delete this file.
   ========================================================================== */
(function () {
  const DEV_MODE = true;
  if (!DEV_MODE) return;

  const PAGE = (location.pathname.split("/").pop() || "index.html");

  // Portrait slots (hero, Portfolio intro, Contact avatar) also offer the photos in
  // assets/images/portrait: web/ = what the page shows, thumbs/ = small modal previews.
  const PORTRAITS = ["01", "02", "03", "04", "05", "06", "07"].map((n) => ({
    name: n + ".png", src: `assets/images/portrait/web/${n}.png`, thumb: `assets/images/portrait/thumbs/${n}.jpg`,
  }));

  /* ---------- storage: IndexedDB keeps the actual image files ---------- */
  const DB_NAME = "dev-images", STORE = "photos";
  let dbPromise = null;
  function db() {
    if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }
  const tx = (mode, fn) => db().then((d) => new Promise((resolve, reject) => {
    const t = d.transaction(STORE, mode), s = t.objectStore(STORE), out = fn(s);
    t.oncomplete = () => resolve(out && out.result);
    t.onerror = () => reject(t.error);
  }));
  // a dropped File is stored as { blob, name }; a portrait chosen from the folder as { src, name }
  const save = (key, v) => tx("readwrite", (s) => s.put(v instanceof Blob ? { blob: v, name: v.name } : v, key));
  const drop = (key) => tx("readwrite", (s) => s.delete(key));
  const clearAll = () => tx("readwrite", (s) => s.clear());
  const load = (key) => tx("readonly", (s) => s.get(key));

  /* ---------- targets ---------- */
  const targets = [];
  const textOf = (el) => (el ? el.textContent.replace(/\s+/g, " ").trim().slice(0, 60) : "");
  function label(el) {
    const card = el.closest(".work__row, .pf-item, .edu-row, .pf-shot, .home-hero, .about-body, .contact-intro");
    if (!card) return el.getAttribute("alt") || "Image";
    if (card.matches(".work__row")) return "Home card · " + textOf(card.querySelector(".work__title"));
    if (card.matches(".home-hero")) return "Home hero portrait";
    if (card.matches(".about-body")) return "Portfolio intro portrait";
    if (card.matches(".contact-intro")) return "Contact avatar";
    if (card.matches(".edu-row")) return "Certificate · " + textOf(card.querySelector(".edu-row__degree"));
    if (card.matches(".pf-shot")) return "Project photo · " + (card.dataset.title || "") + " (" + (card.dataset.meta || "") + ")";
    return textOf(card.querySelector(".pf-row__org")) || "Image";
  }
  function collect() {
    let i = 0;
    document.querySelectorAll("main img, footer img").forEach((img) => {
      if (img.closest(".preview, .lightbox")) return;          // floating preview + viewer follow their source
      const original = img.getAttribute("src");
      targets.push({ key: `${PAGE}#img${i++}`, kind: "img", el: img, original, label: label(img), portrait: original.includes("/portrait/") });
    });
    document.querySelectorAll(".edu-row[data-preview-src]").forEach((row, n) => {
      targets.push({ key: `${PAGE}#edu${n}`, kind: "edu", el: row, original: row.dataset.previewSrc, label: label(row) });
    });
  }

  const urls = new Map();                                       // target -> object URL in use
  function setSrc(t, src) {
    if (t.kind === "edu") { t.el.dataset.previewSrc = src; return; }
    t.el.removeAttribute("srcset");
    t.el.setAttribute("src", src);
    t.el.loading = "eager";
    const shot = t.el.closest(".pf-shot");                      // project photos also open in the viewer
    if (shot) shot.dataset.src = src;
  }
  function show(t, file) {                                      // put a dropped file on the page
    if (urls.has(t)) URL.revokeObjectURL(urls.get(t));
    const url = URL.createObjectURL(file);
    urls.set(t, url);
    t.custom = file.name || "image";
    setSrc(t, url);
    refreshButtons();
  }
  function pick(t, src, name) {                               // a portrait from the folder
    if (urls.has(t)) { URL.revokeObjectURL(urls.get(t)); urls.delete(t); }
    t.custom = src === t.original ? null : name;
    setSrc(t, src);
    refreshButtons();
  }
  function restore(t) {
    if (urls.has(t)) { URL.revokeObjectURL(urls.get(t)); urls.delete(t); }
    t.custom = null;
    setSrc(t, t.original);
    refreshButtons();
  }

  /* ---------- icons ---------- */
  const ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>';
  let layer;
  const buttons = new Map();
  function makeButtons() {
    layer = document.createElement("div");
    layer.className = "dip-layer";
    document.body.appendChild(layer);
    targets.forEach((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dip-btn";
      b.innerHTML = ICON;
      b.title = "Change image — " + t.label;
      b.setAttribute("aria-label", b.title);
      b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); openModal(t); });
      if (t.kind === "edu") { b.classList.add("dip-btn--inline"); t.el.appendChild(b); } else layer.appendChild(b);
      buttons.set(t, b);
    });
  }
  function refreshButtons() { buttons.forEach((b, t) => b.classList.toggle("is-changed", !!t.custom)); }

  // keep the floating icons on the visible part of each image (closed projects clip their photos)
  function clipsOf(el) {
    const list = [];
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      if (getComputedStyle(a).overflow !== "visible") list.push(a);
    }
    return list;
  }
  function place() {
    buttons.forEach((b, t) => {
      if (t.kind === "edu") return;
      if (!t.clips) t.clips = clipsOf(t.el);
      const r = t.el.getBoundingClientRect();
      let top = Math.max(r.top, 0), right = Math.min(r.right, innerWidth), bottom = Math.min(r.bottom, innerHeight), left = Math.max(r.left, 0);
      t.clips.forEach((c) => {
        const k = c.getBoundingClientRect();
        top = Math.max(top, k.top); right = Math.min(right, k.right); bottom = Math.min(bottom, k.bottom); left = Math.max(left, k.left);
      });
      const visible = right - left > 40 && bottom - top > 40;
      b.style.display = visible ? "" : "none";
      if (visible) b.style.transform = `translate(${Math.round(right - 42)}px, ${Math.round(top + 10)}px)`;
    });
  }
  let until = 0, scheduled = false;
  function frame() { place(); if (performance.now() < until) requestAnimationFrame(frame); else scheduled = false; }
  function track(ms = 0) {
    until = Math.max(until, performance.now() + ms);
    if (!scheduled) { scheduled = true; requestAnimationFrame(frame); }
  }

  /* ---------- modal with a drop zone ---------- */
  let modal, zone, input, titleEl, current;
  function buildModal() {
    modal = document.createElement("div");
    modal.className = "dip-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.hidden = true;
    modal.innerHTML = `
      <div class="dip-modal__box">
        <div class="dip-modal__head">
          <div><p class="dip-modal__kicker">Try another image <span class="dip-tag">DEV</span></p><p class="dip-modal__title"></p></div>
          <button type="button" class="dip-close" aria-label="Close">×</button>
        </div>
        <div class="dip-gallery" hidden>
          <p class="dip-gallery__title">Portraits <span>· assets/images/portrait</span></p>
          <div class="dip-gallery__grid"></div>
          <p class="dip-gallery__or">or use your own photo</p>
        </div>
        <label class="dip-zone">
          <input type="file" accept="image/*" hidden>
          <img class="dip-zone__preview" alt="">
          <span class="dip-zone__text"><strong>Drag a photo here</strong><br>or click to choose a file</span>
        </label>
        <p class="dip-hint">The photo stays in this browser only — it is never uploaded.</p>
        <div class="dip-modal__foot">
          <button type="button" class="dip-btn2" data-act="restore">Restore original</button>
          <button type="button" class="dip-btn2" data-act="reset-all">Reset all</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    zone = modal.querySelector(".dip-zone");
    input = modal.querySelector("input[type=file]");
    titleEl = modal.querySelector(".dip-modal__title");

    const take = (file) => {
      if (!file || !/^image\//.test(file.type)) { zone.classList.add("is-bad"); setTimeout(() => zone.classList.remove("is-bad"), 900); return; }
      show(current, file);
      save(current.key, file).catch(() => {});                  // keep it for reloads (best effort)
      paintPreview();
      closeModal();
    };
    input.addEventListener("change", () => { take(input.files[0]); input.value = ""; });
    ["dragenter", "dragover"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add("is-over"); }));
    ["dragleave", "drop"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove("is-over"); }));
    zone.addEventListener("drop", (e) => take(e.dataTransfer.files[0]));
    // a photo dropped anywhere on the open modal still counts
    modal.addEventListener("dragover", (e) => e.preventDefault());
    modal.addEventListener("drop", (e) => { e.preventDefault(); if (!zone.contains(e.target)) take(e.dataTransfer.files[0]); });

    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest(".dip-close")) return closeModal();
      const tile = e.target.closest(".dip-tile");
      if (tile) {
        pick(current, tile.dataset.src, tile.dataset.name);
        (tile.dataset.src === current.original ? drop(current.key) : save(current.key, { src: tile.dataset.src, name: tile.dataset.name })).catch(() => {});
        paintPreview();
        return closeModal();
      }
      const act = e.target.dataset && e.target.dataset.act;
      if (act === "restore") { restore(current); drop(current.key).catch(() => {}); paintPreview(); }
      if (act === "reset-all") resetAll();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  }
  function paintPreview() {
    const src = current.kind === "edu" ? current.el.dataset.previewSrc : current.el.getAttribute("src");
    modal.querySelector(".dip-zone__preview").src = src;
    modal.querySelector('[data-act="restore"]').disabled = !current.custom;
    const now = src;
    modal.querySelectorAll(".dip-tile").forEach((x) => x.classList.toggle("is-current", x.dataset.src === now));
  }
  function openModal(t) {
    current = t;
    titleEl.textContent = t.label + (t.custom ? " · now: " + t.custom : "");
    const gal = modal.querySelector(".dip-gallery");
    gal.hidden = !t.portrait;
    if (t.portrait) gal.querySelector(".dip-gallery__grid").innerHTML = PORTRAITS.map((p) =>
      `<button type="button" class="dip-tile" data-src="${p.src}" data-name="${p.name}"><img src="${p.thumb}" alt=""><span>${p.name}</span></button>`).join("");
    paintPreview();
    modal.hidden = false;
    document.body.classList.add("is-locked");
    modal.querySelector(".dip-close").focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("is-locked");
    const b = buttons.get(current); if (b) b.focus();
  }
  function resetAll() {
    if (!confirm("Remove every photo you added, on every page, and go back to the originals?")) return;
    clearAll().catch(() => {});
    targets.forEach((t) => { if (t.custom) restore(t); });
    paintPreview();
  }

  /* ---------- styles ---------- */
  const CSS = `
  .dip-layer { position: fixed; inset: 0; z-index: 90; pointer-events: none; }
  .dip-btn { position: absolute; top: 0; left: 0; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
    border: 0; cursor: pointer; pointer-events: auto; background: rgba(255,255,255,.92); color: #1a1a1a;
    box-shadow: 0 2px 10px rgba(0,0,0,.25); transition: background .2s; }
  .dip-btn:hover { background: #fff; }
  .dip-btn.is-changed { background: #ff4d4f; color: #fff; }
  .dip-btn--inline { position: absolute; top: 50%; right: -44px; left: auto; transform: translateY(-50%); z-index: 3; }
  .dip-modal { position: fixed; inset: 0; z-index: 400; display: grid; place-items: center; padding: 1rem; background: rgba(0,0,0,.55); font: 400 14px/1.4 system-ui, sans-serif; color: #1a1a1a; }
  .dip-modal[hidden] { display: none; }
  .dip-modal__box { width: min(560px, 100%); background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,.35); }
  .dip-modal__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding: 1.1rem 1.25rem; border-bottom: 1px solid #eee; }
  .dip-modal__kicker { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #777; display: flex; align-items: center; gap: .5rem; }
  .dip-modal__title { margin: .25rem 0 0; font-size: 16px; font-weight: 600; }
  .dip-tag { font-size: 10px; padding: 2px 6px; border-radius: 999px; background: #ff4d4f; color: #fff; }
  .dip-close { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #ddd; background: #fff; font-size: 22px; line-height: 1; cursor: pointer; }
  .dip-zone { margin: 1.25rem 1.25rem 0; display: grid; place-items: center; gap: .9rem; min-height: 240px; padding: 1.25rem;
    border: 2px dashed #cfcac2; border-radius: 14px; background: #f8f7f4; text-align: center; color: #555; cursor: pointer; transition: background .2s, border-color .2s; }
  .dip-zone:hover, .dip-zone.is-over { border-color: #1a1a1a; background: #f1efea; }
  .dip-zone.is-bad { border-color: #ff4d4f; }
  .dip-zone__preview { max-width: 100%; max-height: 180px; border-radius: 8px; object-fit: contain; box-shadow: 0 4px 14px rgba(0,0,0,.12); }
  .dip-zone__preview:not([src]), .dip-zone__preview[src=""] { display: none; }
  .dip-zone__text strong { color: #1a1a1a; }
  .dip-hint { margin: .6rem 1.25rem 0; font-size: 12px; color: #888; }
  .dip-modal__foot { display: flex; flex-wrap: wrap; gap: .5rem; padding: 1rem 1.25rem; }
  .dip-btn2 { padding: .55rem 1rem; border-radius: 999px; border: 1px solid #d5d5d5; background: #fff; font: 600 13px system-ui, sans-serif; color: #1a1a1a; cursor: pointer; }
  .dip-btn2:hover { background: #f3f3f3; } .dip-btn2:disabled { opacity: .4; cursor: default; }
  .dip-gallery { padding: 1.1rem 1.25rem 0; }
  .dip-gallery[hidden] { display: none; }
  .dip-gallery__title { margin: 0 0 .6rem; font-weight: 600; } .dip-gallery__title span { font-weight: 400; color: #888; font-size: 12px; }
  .dip-gallery__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: .5rem; }
  .dip-tile { display: grid; gap: .3rem; padding: .3rem; border: 2px solid transparent; border-radius: 10px; background: #f6f5f2; cursor: pointer; font: 500 11px system-ui, sans-serif; color: #444; }
  .dip-tile:hover { border-color: #ccc; } .dip-tile.is-current { border-color: #1a1a1a; }
  .dip-tile img { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; object-position: top; border-radius: 6px; background: #fff; }
  .dip-gallery__or { margin: .9rem 0 0; font-size: 12px; color: #888; text-align: center; }
  .dip-modal__box { max-height: calc(100vh - 2rem); overflow-y: auto; }
  @media (max-width: 900px) { .dip-btn--inline { right: 0; } }
  `;

  /* ---------- boot ---------- */
  function init() {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    collect();
    makeButtons();
    buildModal();
    refreshButtons();
    // bring back photos added earlier (survives reloads)
    targets.forEach((t) => load(t.key).then((rec) => {
      if (rec && rec.blob) show(t, new File([rec.blob], rec.name || "image", { type: rec.blob.type }));
      else if (rec && rec.src) pick(t, rec.src, rec.name);
    }).catch(() => {}));
    track(1500);
    addEventListener("scroll", () => track(), { passive: true });
    addEventListener("resize", () => track());
    addEventListener("click", () => track(900));              // accordions + tabs animate for ~0.7s
    addEventListener("load", () => track(500));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
