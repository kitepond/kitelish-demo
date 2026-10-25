/* Kitelish boot: runs in <head> before first paint.
   Picks the language, sets <html lang>, applies theme overrides from site.config.js. */
(function () {
  var cfg = window.SITE_CONFIG || {};
  var L = cfg.language || {};
  var avail = L.available || ["en", "vi"];
  var lang = L.default || "en";
  var root = document.documentElement;
  try {
    var saved = window.localStorage.getItem(L.storageKey || "kitelish.lang");
    if (saved && avail.indexOf(saved) > -1) lang = saved;
  } catch (e) { /* storage blocked: ignore */ }
  var m = /[?&]lang=([a-z-]+)/i.exec(window.location.search);
  if (m && avail.indexOf(m[1].toLowerCase()) > -1) lang = m[1].toLowerCase();
  root.lang = lang;
  root.classList.add("js");
  // The static HTML fallback is English. Hide until translated only when another language is active.
  if (lang !== "en") {
    root.classList.add("i18n-pending");
    window.setTimeout(function () { root.classList.remove("i18n-pending"); }, 2000);
  }

  function rgb(hex) {
    var h = String(hex || "").replace("#", "");
    if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
    if (!/^[0-9a-f]{6}$/i.test(h)) return null;
    return parseInt(h.slice(0, 2), 16) + " " + parseInt(h.slice(2, 4), 16) + " " + parseInt(h.slice(4, 6), 16);
  }
  var map = { brand: "brand", brandDark: "brand-dark", brandSoft: "brand-soft", accent: "accent", coral: "coral",
    mint: "mint", sky: "sky", violet: "violet", ink: "ink", muted: "muted", cream: "cream", surface: "surface",
    lvl1: "lvl1", lvl2: "lvl2", lvl3: "lvl3", lvl4: "lvl4", lvl5: "lvl5" };
  var t = cfg.theme || {};
  var colors = t.colors || {};
  Object.keys(map).forEach(function (k) {
    var v = rgb(colors[k]);
    if (v) root.style.setProperty("--c-" + map[k], v);
  });
  if (t.radius) {
    if (t.radius.card) root.style.setProperty("--radius-card", t.radius.card);
    if (t.radius.button) root.style.setProperty("--radius-btn", t.radius.button);
  }
  if (t.fonts) {
    if (t.fonts.display) root.style.setProperty("--font-display", t.fonts.display);
    if (t.fonts.body) root.style.setProperty("--font-body", t.fonts.body);
  }
})();
