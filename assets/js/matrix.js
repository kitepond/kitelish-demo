/* Package matrix: 2-4 packages (e.g. sessions per week) as columns, feature rows, plan toggle, live prices.
   Data: assets/data/pricing.js  ->  { plans, defaultPlan, rounding, packages: [{ id, sessionsPerMonth, monthly: { USD, VND }, featured }] }
   Copy: pkg.<id>.name | .tag | .badge | .v<i>   +   <prefix>.row<i> (row labels, set by data-rows / data-prefix on #pricing-table) */
(function () {
  "use strict";
  var B = window.Kitelish;
  var toggle = document.getElementById("pricing-toggle");
  var tableHost = document.getElementById("pricing-table");
  if (!toggle || !tableHost || !tableHost.hasAttribute("data-matrix")) return;
  var desc = document.getElementById("pricing-plan-desc");
  var D = function () { return B.data.pricing; };
  var prefix = tableHost.getAttribute("data-prefix"), rows = parseInt(tableHost.getAttribute("data-rows"), 10) || 0;
  var plan = D().defaultPlan || D().plans[0].id;

  function round(v, cur) { var r = (D().rounding || {})[cur] || 1; return Math.round(v / r) * r; }
  function current() { return D().plans.filter(function (p) { return p.id === plan; })[0] || D().plans[0]; }
  function calc(pkg, p) {
    var cur = B.currency(), m = pkg.monthly;
    if (m[cur] == null) cur = Object.keys(m)[0];
    var sessions = pkg.sessionsPerMonth * p.months;
    var total = round(m[cur] * p.months * (1 - p.discount), cur);
    var unit = cur === "VND" ? 1000 : 0.01;
    return { total: total, cur: cur, sessions: sessions, perMonth: round(total / p.months, cur), per: Math.round(total / sessions / unit) * unit, perDigits: cur === "VND" ? 0 : 2 };
  }

  function renderToggle() {
    toggle.innerHTML = D().plans.map(function (p) {
      return '<button type="button" role="radio" class="chip" data-plan="' + p.id + '" aria-checked="' + (p.id === plan ? "true" : "false") + '" tabindex="' + (p.id === plan ? "0" : "-1") + '">' +
        B.esc(B.t("pricing.plan." + p.id)) + (p.discount ? ' <span class="rounded-btn bg-accent px-2 py-0.5 text-xs font-extrabold text-ink">−' + Math.round(p.discount * 100) + "%</span>" : "") + "</button>";
    }).join("");
  }

  function renderTable() {
    var p = current(), pk = D().packages;
    if (desc) desc.textContent = B.t("pricing.plan." + p.id + ".desc", { n: p.months, pct: Math.round(p.discount * 100) });
    var book = B.page("booking");
    var res = pk.map(function (x) { return calc(x, p); });
    function name(x) { return B.esc(B.t("pkg." + x.id + ".name")); }
    function cta(x, cls) {
      return book ? '<a class="btn ' + cls + ' mt-4 w-full" href="' + B.esc(book) + '">' + B.esc(B.t("pkg.cta")) + '<span class="sr-only"> – ' + name(x) + "</span></a>" : "";
    }
    function price(r, big) {
      return '<p class="' + (big ? "text-3xl" : "text-2xl") + ' font-display font-extrabold text-ink">' + B.esc(B.fmtMoney(r.perMonth, r.cur)) + '<span class="text-sm font-bold text-muted"> ' + B.esc(B.t("pkg.perMonth")) + "</span></p>" +
        '<p class="text-sm text-muted">' + B.esc(B.t("pricing.perSession", { price: B.fmtMoney(r.per, r.cur, r.perDigits) })) + "</p>" +
        (p.months > 1 ? '<p class="text-sm text-muted">' + B.esc(B.t("pkg.termTotal", { total: B.fmtMoney(r.total, r.cur), n: p.months })) + "</p>" : "");
    }
    var thead = '<tr><td class="pm-corner"><span class="sr-only">' + B.esc(B.t("pkg.corner")) + "</span></td>" + pk.map(function (x, i) {
      return '<th scope="col" class="pm-head' + (x.featured ? " is-featured" : "") + '">' +
        (x.featured ? '<span class="pm-badge">' + B.esc(B.t("pkg." + x.id + ".badge")) + "</span>" : "") +
        '<span class="block font-display text-xl font-extrabold text-ink">' + name(x) + "</span>" +
        '<span class="mt-1 block text-sm font-medium text-muted">' + B.esc(B.t("pkg." + x.id + ".tag")) + "</span>" +
        '<span class="mt-3 block text-left font-normal">' + price(res[i], false) + "</span>" + cta(x, x.featured ? "btn-primary" : "btn-outline") + "</th>";
    }).join("") + "</tr>";
    var body = "", i, j;
    for (i = 1; i <= rows; i++) {
      body += '<tr><th scope="row" class="pm-row">' + B.esc(B.t(prefix + ".row" + i)) + "</th>" + pk.map(function (x) {
        return '<td class="pm-cell' + (x.featured ? " is-featured" : "") + '">' + B.esc(B.t("pkg." + x.id + ".v" + i)) + "</td>";
      }).join("") + "</tr>";
    }
    var cards = pk.map(function (x, k) {
      var lis = "";
      for (j = 1; j <= rows; j++) lis += '<li class="flex justify-between gap-4 py-2"><span class="text-muted">' + B.esc(B.t(prefix + ".row" + j)) + '</span><span class="text-right font-bold text-ink">' + B.esc(B.t("pkg." + x.id + ".v" + j)) + "</span></li>";
      return '<li class="pm-card' + (x.featured ? " is-featured" : "") + '">' +
        (x.featured ? '<span class="pm-badge">' + B.esc(B.t("pkg." + x.id + ".badge")) + "</span>" : "") +
        '<h3 class="font-display text-xl font-extrabold">' + name(x) + '</h3><p class="text-sm text-muted">' + B.esc(B.t("pkg." + x.id + ".tag")) + "</p>" +
        '<div class="mt-3">' + price(res[k], true) + '</div><ul class="mt-3 divide-y divide-brand/20 text-[15px]">' + lis + "</ul>" + cta(x, x.featured ? "btn-primary" : "btn-outline") + "</li>";
    }).join("");
    tableHost.innerHTML = '<div class="hidden lg:block"><table class="pm-table"><caption class="sr-only">' + B.esc(B.t("pkg.caption")) + "</caption><thead>" + thead + "</thead><tbody>" + body + "</tbody></table></div>" +
      '<ul class="grid gap-4 md:grid-cols-3 lg:hidden">' + cards + "</ul>";
  }

  toggle.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-plan]");
    if (!btn) return;
    plan = btn.getAttribute("data-plan");
    renderToggle(); renderTable();
    var nb = toggle.querySelector('[data-plan="' + plan + '"]'); if (nb) nb.focus();
  });
  toggle.addEventListener("keydown", function (e) {
    var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!keys[e.key]) return;
    e.preventDefault();
    var ids = D().plans.map(function (p) { return p.id; });
    plan = ids[(ids.indexOf(plan) + keys[e.key] + ids.length) % ids.length];
    renderToggle(); renderTable();
    toggle.querySelector('[data-plan="' + plan + '"]').focus();
  });
  B.mount(function () { renderToggle(); renderTable(); });
})();
