/* Kitelish core: i18n engine, shared header/footer, floating chat buttons, helpers.
   Plain script (no modules) so the site works when opened from file://. */
(function () {
  "use strict";
  var cfg = window.SITE_CONFIG || {};
  var I18N = window.KITELISH_I18N || {};
  var langCfg = cfg.language || { default: "en", available: ["en", "vi"], labels: { en: "EN", vi: "VI" }, storageKey: "kitelish.lang" };
  var root = document.documentElement;
  var state = { lang: root.lang || langCfg.default || "en" };
  var listeners = [];
  var brandName = (cfg.brand && cfg.brand.name) || "Kitelish";

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function t(key, vars) {
    var d = I18N[state.lang] || {};
    var str = d[key];
    if (str == null) str = (I18N[langCfg.default] || {})[key];
    if (str == null) str = (I18N.en || {})[key];
    if (str == null) return key;
    var all = { brand: brandName, year: new Date().getFullYear() };
    if (vars) for (var k in vars) all[k] = vars[k];
    return String(str).replace(/\{(\w+)\}/g, function (m, name) { return all[name] != null ? all[name] : m; });
  }
  function L(obj) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[state.lang] || obj[langCfg.default] || obj.en || "";
  }
  function icon(name, cls) {
    var p = (window.KITELISH_ICONS || {})[name] || "";
    return '<svg class="' + (cls || "h-5 w-5") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + "</svg>";
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtTime(hhmm) { return hhmm; } // 24h everywhere – change here for am/pm
  function fmtMoney(amount, currency, digits) {
    var loc = state.lang === "vi" ? "vi-VN" : "en-US";
    try {
      return new Intl.NumberFormat(loc, { style: "currency", currency: currency, maximumFractionDigits: digits || 0 }).format(amount);
    } catch (e) { return Math.round(amount) + " " + currency; }
  }
  function currentCurrency() { return (cfg.currency && (cfg.currency[state.lang] || cfg.currency.en)) || "USD"; }
  function tel() { return (cfg.contact && cfg.contact.hotline) || ""; }
  function page(role) { return (cfg.pages && cfg.pages[role]) || ""; }
  function has(key) { return !!((I18N[state.lang] || {})[key] != null || (I18N.en || {})[key] != null); }
  function pageName() { return document.body.getAttribute("data-page") || ""; }

  /* ---------- i18n apply ---------- */
  function applyI18n(scope) {
    scope = scope || document;
    var i, els;
    els = scope.querySelectorAll("[data-i18n]");
    for (i = 0; i < els.length; i++) els[i].textContent = t(els[i].getAttribute("data-i18n"));
    els = scope.querySelectorAll("[data-i18n-html]");
    for (i = 0; i < els.length; i++) els[i].innerHTML = t(els[i].getAttribute("data-i18n-html"));
    els = scope.querySelectorAll("[data-i18n-attr]");
    for (i = 0; i < els.length; i++) {
      els[i].getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":");
        if (p[0] && p[1]) this.setAttribute(p[0].trim(), t(p[1].trim()));
      }, els[i]);
    }
    // plain text swaps for config-driven bits
    els = scope.querySelectorAll("[data-cfg]");
    for (i = 0; i < els.length; i++) {
      var v = cfgGet(els[i].getAttribute("data-cfg"));
      if (v != null) els[i].textContent = L(v);
    }
  }

  function setLang(lang, opts) {
    if (langCfg.available.indexOf(lang) < 0) return;
    state.lang = lang;
    root.lang = lang;
    if (!opts || !opts.silent) {
      try { window.localStorage.setItem(langCfg.storageKey || "kitelish.lang", lang); } catch (e) {}
    }
    applyI18n(document);
    renderFooter();
    renderChat();
    updateLangButtons();
    listeners.forEach(function (fn) { try { fn(lang); } catch (e) { if (window.console) console.error(e); } });
    root.classList.remove("i18n-pending");
  }

  function mount(fn) { listeners.push(fn); fn(state.lang); }

  /* ---------- header ---------- */
  var NAV = cfg.nav || [];
  var CTA = cfg.headerCta || null; // { page: "booking", key: "common.cta" } or null
  function ctaLink(cls) {
    var h = ctaHref();
    return h ? '<a href="' + esc(h) + '" class="' + cls + '" data-i18n="' + esc(CTA.key) + '"></a>' : "";
  }
  function ctaHref() { return CTA ? (page(CTA.page) || CTA.href || "") : ""; }

  function logoHtml() {
    var b = cfg.brand || {};
    var mark = b.logoMark ? '<img src="' + esc(b.logoMark) + '" alt="" width="44" height="44" class="h-11 w-11" />' : "";
    return mark + '<span class="font-display text-2xl font-extrabold leading-none text-ink">' + esc(b.logoText || b.name) + "</span>";
  }

  var STYLE = cfg.style || {};
  var PILL = STYLE.header === "pill", TABS = STYLE.header === "tabs", LIGHT_FOOT = STYLE.footer === "light", GRID_FOOT = STYLE.footer === "grid";

  function renderHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    var cur0 = pageName();
    var links = NAV.map(function (n) {
      var cur = n.id === cur0 ? ' aria-current="page"' : "";
      if (TABS) return '<li class="flex"><a href="' + n.href + '"' + cur + ' class="tab-link' + (n.id === cur0 ? " is-current" : "") + '" data-i18n="' + n.key + '"></a></li>';
      var act = n.id === cur0 ? "bg-brand-soft text-brand-dark" : "text-ink hover:bg-brand-soft";
      return '<li><a href="' + n.href + '"' + cur + ' class="inline-flex min-h-[44px] items-center rounded-btn px-4 py-2 text-[15px] font-bold transition ' + act + '" data-i18n="' + n.key + '"></a></li>';
    }).join("");
    var mlinks = NAV.map(function (n) {
      var cur = n.id === cur0 ? ' aria-current="page"' : "";
      var act = n.id === cur0 ? "bg-brand-soft text-brand-dark" : "text-ink";
      return '<li><a href="' + n.href + '"' + cur + ' class="flex min-h-[48px] items-center rounded-2xl px-4 py-3 text-lg font-bold ' + act + '" data-i18n="' + n.key + '"></a></li>';
    }).join("");
    var langBtns = langCfg.available.map(function (l) {
      return '<button type="button" class="lang-btn min-h-[40px] min-w-[44px] rounded-btn px-3 text-sm font-bold transition" data-lang="' + l + '" lang="' + l + '" title="' + esc((langCfg.names || {})[l] || l) + '">' + esc((langCfg.labels || {})[l] || l.toUpperCase()) + "</button>";
    }).join("");
    var inner =
      '<a href="' + esc(page("home") || "index.html") + '" class="flex items-center gap-2.5 rounded-xl" data-i18n-attr="aria-label:common.homeLink">' + logoHtml() + "</a>" +
      '<nav class="hidden lg:block' + (TABS ? " self-end" : "") + '" data-i18n-attr="aria-label:common.mainNav"><ul class="flex items-' + (TABS ? "end gap-1.5" : "center gap-1") + '">' + links + "</ul></nav>" +
      '<div class="flex items-center gap-2">' +
        '<div class="flex rounded-btn bg-white p-1 ring-2 ring-ink/10" role="group" data-i18n-attr="aria-label:common.language">' + langBtns + "</div>" +
        ctaLink("btn btn-primary hidden !min-h-[44px] !px-5 !py-2 text-[15px] lg:inline-flex") +
        '<button type="button" id="menu-toggle" class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white ring-2 ring-ink/10 lg:hidden" aria-expanded="false" aria-controls="mobile-menu" data-i18n-attr="aria-label:common.menu">' +
          '<span data-open>' + icon("menu", "h-6 w-6") + '</span><span data-close hidden>' + icon("x", "h-6 w-6") + "</span></button>" +
      "</div>";
    var menuInner = '<nav data-i18n-attr="aria-label:common.mainNav"><ul class="space-y-1">' + mlinks + "</ul></nav>" + ctaLink("btn btn-primary mt-4 w-full");
    host.innerHTML = PILL ?
      '<div class="container-x"><div class="header-pill flex h-16 items-center justify-between gap-2 rounded-full bg-white/90 pl-4 pr-2 shadow-soft ring-1 ring-brand/15 backdrop-blur sm:pl-5">' + inner + "</div></div>" +
      '<div id="mobile-menu" hidden class="container-x mt-2 lg:hidden"><div class="rounded-[2rem] bg-white p-4 shadow-soft ring-1 ring-brand/15">' + menuInner + "</div></div>" :
      TABS ? '<div class="container-x flex min-h-[76px] items-center justify-between gap-3 lg:items-stretch lg:pt-3">' + inner + "</div>" +
      '<div id="mobile-menu" hidden class="border-t-2 border-brand bg-white lg:hidden"><div class="container-x py-4">' + menuInner + "</div></div>" :
      '<div class="container-x flex h-[72px] items-center justify-between gap-3">' + inner + "</div>" +
      '<div id="mobile-menu" hidden class="border-t border-ink/10 bg-cream lg:hidden"><div class="container-x py-4">' + menuInner + "</div></div>";

    var btn = document.getElementById("menu-toggle"), menu = document.getElementById("mobile-menu");
    function toggle(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      menu.hidden = !open;
      btn.querySelector("[data-open]").hidden = open;
      btn.querySelector("[data-close]").hidden = !open;
    }
    btn.addEventListener("click", function () { toggle(btn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { toggle(false); btn.focus(); } });
    host.querySelectorAll(".lang-btn").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
    });
  }

  function updateLangButtons() {
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      var on = b.getAttribute("data-lang") === state.lang;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.className = "lang-btn min-h-[40px] min-w-[44px] rounded-btn px-3 text-sm font-bold transition " + (on ? "bg-brand text-white" : "text-ink hover:bg-brand-soft");
    });
  }

  /* ---------- footer ---------- */
  function hoursRows() {
    return (cfg.hours || []).map(function (h) {
      var val = h.open ? fmtTime(h.open) + " – " + fmtTime(h.close) : t("footer.closed");
      return { day: t("day." + h.day), val: val };
    });
  }
  function renderFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    var c = cfg.contact || {};
    var year = new Date().getFullYear();
    var K = GRID_FOOT ?
      { root: "foot-grid bg-brand-dark text-white/90", link: "text-white/90 hover:text-white", head: "text-white", icon: "text-accent", strong: "text-white", line: "border-white/25", sub: "text-white/80", chip: "bg-cream" } : LIGHT_FOOT ?
      { root: "bg-brand-soft text-ink/90", link: "text-ink/90 hover:text-ink", head: "text-ink", icon: "text-brand", strong: "text-ink", line: "border-ink/10", sub: "text-muted", chip: "bg-white" } :
      { root: "bg-ink text-white/85", link: "text-white/85 hover:text-white", head: "text-white", icon: "text-accent", strong: "text-white", line: "border-white/15", sub: "text-white/75", chip: "bg-cream" };
    var nav = NAV.map(function (n) { return '<li><a class="inline-block py-1 ' + K.link + ' underline-offset-4 hover:underline" href="' + n.href + '">' + esc(t(n.key)) + "</a></li>"; }).join("");
    var hasHours = (cfg.hours || []).length > 0;
    var cols = hasHours ? "lg:grid-cols-4" : "lg:grid-cols-3";
    var hrs = hoursRows().map(function (r) { return '<li class="flex justify-between gap-4"><span>' + esc(r.day) + '</span><span class="tabular-nums">' + esc(r.val) + "</span></li>"; }).join("");
    var lines = [];
    if (c.hotline) lines.push('<li class="flex gap-3"><span class="mt-0.5 ' + K.icon + '">' + icon("phone", "h-5 w-5") + '</span><span><span class="sr-only">' + esc(t("footer.hotline")) + ': </span><a class="font-bold ' + K.strong + ' hover:underline" href="tel:' + esc(c.hotline) + '">' + esc(c.hotlineDisplay || c.hotline) + "</a></span></li>");
    if (c.email) lines.push('<li class="flex gap-3"><span class="mt-0.5 ' + K.icon + '">' + icon("mail", "h-5 w-5") + '</span><a class="hover:underline" href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a></li>");
    if (c.address) lines.push('<li class="flex gap-3"><span class="mt-0.5 ' + K.icon + '">' + icon("map-pin", "h-5 w-5") + "</span><span>" + esc(L(c.address)) + "</span></li>");
    if (GRID_FOOT) {
      var cell = "bg-brand-dark p-6 sm:p-7";
      host.innerHTML =
        '<div class="mt-0 ' + K.root + '"><div class="container-x pb-6 pt-14"><div class="foot-sheet grid gap-px border border-white/25 bg-white/25 sm:grid-cols-2 ' + (hasHours ? "lg:grid-cols-4" : "lg:grid-cols-3") + '">' +
          '<div class="' + cell + '"><a href="' + esc(page("home") || "index.html") + '" class="inline-flex rounded-md"><span class="flex items-center gap-2.5 rounded-md ' + K.chip + ' px-3 py-2">' + logoHtml() + "</span></a>" +
            '<p class="mt-4 max-w-xs text-[15px] leading-relaxed">' + esc(t("footer.about")) + "</p></div>" +
          '<div class="' + cell + '"><h2 class="foot-label ' + K.head + '">' + esc(t("footer.explore")) + '</h2><ul class="mt-3 space-y-1 text-[15px]">' + nav + "</ul></div>" +
          '<div class="' + cell + '"><h2 class="foot-label ' + K.head + '">' + esc(t("footer.contact")) + '</h2><ul class="mt-3 space-y-3 text-[15px]">' + lines.join("") + "</ul></div>" +
          (hasHours ? '<div class="' + cell + '"><h2 class="foot-label ' + K.head + '">' + esc(t("footer.hours")) + '</h2><ul class="mt-3 space-y-1 text-[15px]">' + hrs + "</ul></div>" : "") +
        "</div>" +
        '<div class="flex flex-col gap-1 pb-20 pt-5 text-sm ' + K.sub + ' sm:flex-row sm:pb-3 sm:justify-between">' +
          "<p>" + esc(t("footer.rights", { year: year })) + "</p>" + (cfg.showDemoNote ? "<p>" + esc(t("footer.demo")) + "</p>" : "") +
        "</div></div></div>";
      return;
    }
    host.innerHTML =
      '<div class="wave-top mt-0 ' + K.root + '"><div class="container-x grid gap-10 pb-10 pt-16 sm:grid-cols-2 ' + cols + '">' +
        '<div><a href="' + esc(page("home") || "index.html") + '" class="inline-flex items-center gap-2.5 rounded-xl">' + '<span class="flex items-center gap-2.5 rounded-2xl ' + K.chip + ' px-3 py-2">' + logoHtml() + "</span></a>" +
          '<p class="mt-4 max-w-xs text-[15px] leading-relaxed">' + esc(t("footer.about")) + "</p></div>" +
        '<div><h2 class="font-display text-lg font-bold ' + K.head + '">' + esc(t("footer.explore")) + '</h2><ul class="mt-3 space-y-1 text-[15px]">' + nav + "</ul></div>" +
        '<div><h2 class="font-display text-lg font-bold ' + K.head + '">' + esc(t("footer.contact")) + '</h2><ul class="mt-3 space-y-3 text-[15px]">' + lines.join("") + "</ul></div>" +
        (hasHours ? '<div><h2 class="font-display text-lg font-bold ' + K.head + '">' + esc(t("footer.hours")) + '</h2><ul class="mt-3 space-y-1 text-[15px]">' + hrs + "</ul></div>" : "") +
      "</div>" +
      '<div class="border-t ' + K.line + '"><div class="container-x flex flex-col gap-1 pb-20 pt-5 text-sm ' + K.sub + ' sm:flex-row sm:pb-5 sm:justify-between">' +
        "<p>" + esc(t("footer.rights", { year: year })) + "</p>" + (cfg.showDemoNote ? "<p>" + esc(t("footer.demo")) + "</p>" : "") +
      "</div></div></div>";
  }

  /* ---------- floating chat buttons ---------- */
  function renderChat() {
    var host = document.getElementById("chat-buttons");
    if (!host) return;
    var c = cfg.contact || {}, cb = cfg.chatButtons || {};
    var pos = cb.position === "left" ? "left-4 items-start" : "right-4 items-end";
    var items = [];
    function item(href, label, bg, inner, ext) {
      return '<a href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + ' class="group flex items-center gap-2 ' + (cb.position === "left" ? "flex-row" : "flex-row-reverse") + '" aria-label="' + esc(label) + '">' +
        '<span class="pointer-events-none hidden rounded-btn bg-ink px-3 py-1.5 text-sm font-bold text-white opacity-0 shadow-soft transition group-hover:opacity-100 group-focus-visible:opacity-100 md:block">' + esc(label) + "</span>" +
        '<span class="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-soft ring-2 ring-white sm:h-14 sm:w-14 sm:ring-4 transition group-hover:scale-105 ' + bg + '">' + inner + "</span></a>";
    }
    if (cb.zalo && c.zalo) items.push(item("https://zalo.me/" + c.zalo, t("chat.zalo"), "bg-[#0068FF]", '<span class="font-display text-[15px] font-extrabold leading-none tracking-tight" aria-hidden="true">Zalo</span>', true));
    if (cb.messenger && c.messenger) items.push(item("https://m.me/" + c.messenger, t("chat.messenger"), "bg-[#0084FF]",
      '<svg viewBox="0 0 24 24" class="h-7 w-7" fill="currentColor" aria-hidden="true"><path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.15 7.16.16.14.26.35.27.57l.05 1.78a.8.8 0 0 0 1.12.71l1.99-.88c.17-.07.35-.09.52-.05.91.25 1.87.38 2.9.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm6 7.46-2.93 4.65a1.5 1.5 0 0 1-2.17.4l-2.33-1.75a.6.6 0 0 0-.72 0l-3.15 2.39c-.42.32-.97-.18-.69-.63L8.94 9.88a1.5 1.5 0 0 1 2.17-.4l2.33 1.75a.6.6 0 0 0 .72 0l3.15-2.39c.42-.32.97.18.69.62z"/></svg>', true));
    if (cb.whatsapp && c.whatsapp) items.push(item("https://wa.me/" + String(c.whatsapp).replace(/\D/g, ""), t("chat.whatsapp"), "bg-[#128C4B]",
      '<svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21l1.65-4.9A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z" fill="currentColor" stroke="none"/></svg>', true));
    if (cb.call && c.hotline) items.push(item("tel:" + c.hotline, t("chat.call"), "bg-mint !text-ink", icon("phone", "h-6 w-6"), false));
    host.className = "fixed bottom-3 z-50 flex flex-row gap-2 sm:bottom-4 sm:flex-col sm:gap-3 " + pos;
    host.setAttribute("role", "group");
    host.setAttribute("aria-label", t("chat.group"));
    host.innerHTML = items.join("");
  }

  /* ---------- structured data ---------- */
  function renderSchema() {
    if (pageName() !== "home") return;
    var c = cfg.contact || {};
    var data = { "@context": "https://schema.org", "@type": (cfg.brand && cfg.brand.schemaType) || "LocalBusiness", name: brandName, url: cfg.siteUrl || "", telephone: c.hotline || "", email: c.email || "", address: L(c.address) };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ---------- init ---------- */
  function cfgGet(path) {
    var v = cfg, parts = path.split(".");
    for (var j = 0; j < parts.length && v; j++) v = v[parts[j]];
    return v;
  }
  // [data-icon="phone" data-icon-class="h-5 w-5"] -> inline svg ;  [data-cfg-href="tel:|contact.hotline"] -> href from config
  function decorate() {
    document.querySelectorAll("[data-icon]").forEach(function (el) { el.innerHTML = icon(el.getAttribute("data-icon"), el.getAttribute("data-icon-class") || "h-5 w-5"); });
    document.querySelectorAll("[data-cfg-href]").forEach(function (el) {
      var parts = el.getAttribute("data-cfg-href").split("|"), v = cfgGet(parts[1]);
      if (v) el.setAttribute("href", parts[0] + v); else { el.hidden = true; var li = el.parentNode; if (li && li.tagName === "LI" && li.children.length === 1) li.hidden = true; }
    });
  }

  function init() {
    renderHeader();
    decorate();
    renderFooter();
    renderChat();
    applyI18n(document);
    updateLangButtons();
    root.classList.remove("i18n-pending");
    renderSchema();
    // Make sure #main can take focus after skip-link use
    var main = document.getElementById("main");
    if (main && !main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
  }

  // Item colour classes: full class names written out so the Tailwind scanner finds them.
  var LEVEL_TINT = { lvl1: "bg-lvl1/25", lvl2: "bg-lvl2/30", lvl3: "bg-lvl3/25", lvl4: "bg-lvl4/25", lvl5: "bg-lvl5/25" };
  var LEVEL_DOT = { lvl1: "bg-lvl1", lvl2: "bg-lvl2", lvl3: "bg-lvl3", lvl4: "bg-lvl4", lvl5: "bg-lvl5" };

  window.Kitelish = {
    levelTint: LEVEL_TINT, levelDot: LEVEL_DOT, page: page, has: has,
    cfg: cfg, t: t, L: L, esc: esc, icon: icon, mount: mount, setLang: setLang, applyI18n: applyI18n,
    lang: function () { return state.lang; }, fmtMoney: fmtMoney, currency: currentCurrency, fmtTime: fmtTime,
    pad: pad, tel: tel
  };
  Object.defineProperty(window.Kitelish, "data", { get: function () { return window.KITELISH_DATA || {}; } });

  // Scripts are deferred, so the DOM is ready here.
  init();
})();
