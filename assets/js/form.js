/* Multi-step booking / enquiry form. Fields, steps and rules come from the markup that the page generator
   builds from forms.json (data-field / data-rule attributes), so there is nothing niche-specific in this file.
   Submission provider: site.config.js -> form.provider ("none" | "formspree" | "netlify" | "custom").
   With provider "none" (default) NOTHING is sent anywhere: the form validates and shows a demo panel. */
(function () {
  "use strict";
  var B = window.Kitelish;
  var form = document.getElementById("booking-form");
  if (!form) return;
  var fcfg = B.cfg.form || {};
  var steps = Array.prototype.slice.call(form.querySelectorAll("[data-step]"));
  var total = steps.length, cur = 0;
  var els = {
    indicator: document.getElementById("step-indicator"), bar: document.getElementById("step-bar"),
    back: document.getElementById("btn-back"), next: document.getElementById("btn-next"), send: document.getElementById("btn-send"),
    status: document.getElementById("form-status"), demo: document.getElementById("form-demo"),
    ok: document.getElementById("form-success"), fail: document.getElementById("form-fail"), slot: document.getElementById("slot-note")
  };
  var params = new URLSearchParams(window.location.search);
  var slotParam = params.get("slot") || "";

  /* ----- optional live summary card (#live-summary) ----- */
  var liveBox = document.getElementById("live-summary");
  var touched = {}; /* radio/checkbox groups only count in the summary once the visitor has chosen (defaults are not shown as answers) */
  function renderSummary() {
    if (!liveBox) return;
    var rows = fields.filter(function (w) { return w.getAttribute("data-label-key") && w.getAttribute("data-rule") !== "consent"; }).map(function (w) {
      var name = w.getAttribute("data-field"), c = controls(name)[0];
      var v = c && (c.type === "radio" || c.type === "checkbox") && !touched[name] ? "" : display(name);
      return '<div class="flex justify-between gap-4 py-2"><dt class="text-muted">' + B.esc(B.t(w.getAttribute("data-label-key"))) + "</dt>" +
        (v ? '<dd class="text-right font-bold text-ink">' + B.esc(v) + "</dd>" : '<dd class="text-right italic text-muted">' + B.esc(B.t("form.summary.pending")) + "</dd>") + "</div>";
    }).join("");
    liveBox.innerHTML = rows || '<p class="py-2 text-muted">' + B.esc(B.t("form.summary.empty")) + "</p>";
  }
  /* ?age=<n> prefill (e.g. from the age finder) */
  var ageParam = params.get("age");
  var ageCtl = form.querySelector('[name="age"]');
  if (ageCtl && /^\d{1,2}$/.test(ageParam || "") && !ageCtl.value) ageCtl.value = ageParam;

  /* ?item=<id> pre-selects an item-cards radio (and counts as chosen in the summary) */
  var itemParam = params.get("item");
  if (itemParam) form.querySelectorAll('input[type="radio"][data-item-card]').forEach(function (r) { if (r.value === itemParam) { r.checked = true; touched[r.name] = true; } });

  var provider = fcfg.provider || "none";
  var needsEndpoint = provider === "formspree" || provider === "custom";
  var live = provider === "netlify" || (needsEndpoint && !!fcfg.endpoint);
  if (needsEndpoint && !fcfg.endpoint && window.console) console.warn("[Kitelish] form.provider is '" + provider + "' but form.endpoint is empty - running in demo mode (nothing is sent).");

  var fields = Array.prototype.slice.call(form.querySelectorAll("[data-field]"));
  function wrap(name) { return form.querySelector('[data-field="' + name + '"]'); }
  function controls(name) { return Array.prototype.slice.call(form.querySelectorAll('[name="' + name + '"]')); }
  function val(name) { var c = controls(name)[0]; return c && c.value ? String(c.value).trim() : ""; }
  function checked(name) { return controls(name).filter(function (c) { return c.checked; }); }
  function attr(name, a) { var w = wrap(name); return w ? w.getAttribute(a) : null; }

  /* ----- selects fed by the catalog (language aware) ----- */
  function populate() {
    form.querySelectorAll('select[data-source="items"]').forEach(function (sel) {
      var keep = sel.value || params.get("item") || "";
      var withFact = sel.hasAttribute("data-with-fact");
      sel.innerHTML = '<option value="">' + B.esc(B.t(sel.getAttribute("data-empty-key") || "form.choose")) + "</option>" + (B.data.items || []).map(function (l) {
        var f = (l.facts || [])[0], extra = withFact && f ? " (" + B.t(f.key, f.vars || {}) + ")" : "";
        return '<option value="' + B.esc(l.id) + '">' + B.esc(B.t("item." + l.id + ".name") + extra) + "</option>";
      }).join("");
      sel.value = keep;
      if (sel.value !== keep) sel.value = "";
    });
    if (els.slot) {
      var p = slotParam.split("|");
      if (p.length === 2 && /^[a-z]{3}$/.test(p[0])) { els.slot.hidden = false; els.slot.textContent = B.t("form.slot", { slot: B.t("day." + p[0]) + " " + p[1] }); }
    }
    updateStepUi();
    renderSummary();
  }

  /* ----- steps ----- */
  function stepName(i) { return B.t(steps[i].getAttribute("data-step-key")); }
  function updateStepUi() {
    if (!els.indicator) return;
    els.indicator.textContent = B.t("form.stepOf", { n: cur + 1, total: total, name: stepName(cur) });
    els.bar.style.width = ((cur + 1) / total * 100) + "%";
    els.bar.parentNode.setAttribute("aria-valuenow", cur + 1);
    form.querySelectorAll("[data-dot]").forEach(function (d, i) { d.classList.toggle("is-on", i === cur); d.classList.toggle("is-done", i < cur); });
    form.querySelectorAll("[data-line]").forEach(function (d, i) { d.classList.toggle("is-done", i < cur); });
  }
  function show(i, focus) {
    cur = i;
    steps.forEach(function (s, idx) { s.hidden = idx !== i; });
    els.back.hidden = i === 0;
    els.next.hidden = i === total - 1;
    els.send.hidden = i !== total - 1;
    updateStepUi();
    if (focus) { var h = steps[i].querySelector("legend"); if (h) { h.setAttribute("tabindex", "-1"); h.focus(); } }
  }
  function stepFields(i) { return Array.prototype.map.call(steps[i].querySelectorAll("[data-field]"), function (w) { return w.getAttribute("data-field"); }); }

  /* ----- validation ----- */
  function setError(name, msgKey, vars) {
    var errEl = document.getElementById("err-" + name);
    var inputs = controls(name);
    if (msgKey) {
      errEl.textContent = B.t(msgKey, vars); errEl.hidden = false; errEl.dataset.key = msgKey;
      errEl.dataset.vars = vars ? JSON.stringify(vars) : "";
      inputs.forEach(function (i) { i.setAttribute("aria-invalid", "true"); i.setAttribute("aria-describedby", "err-" + name); });
    } else {
      errEl.textContent = ""; errEl.hidden = true; delete errEl.dataset.key; delete errEl.dataset.vars;
      inputs.forEach(function (i) { i.removeAttribute("aria-invalid"); i.removeAttribute("aria-describedby"); });
    }
  }
  function requiredNow(name) {
    var cond = attr(name, "data-required-if");
    if (cond) { var p = cond.split("="); return checked(p[0]).some(function (c) { return c.value === p[1]; }) || val(p[0]) === p[1]; }
    return attr(name, "data-optional") !== "true";
  }
  var RULES = {
    required: function (n) { var c = controls(n)[0]; if (c && c.type === "radio") return checked(n).length ? null : ["form.v.required"]; return val(n) ? null : ["form.v.required"]; },
    group: function (n) { return checked(n).length ? null : ["form.v.group"]; },
    phone: function (n) {
      var v = val(n), digits = v.replace(/\D/g, "");
      if (!v) return requiredNow(n) ? ["form.v.phone"] : null;
      return /^\+?[0-9 .\-()]+$/.test(v) && digits.length >= 8 && digits.length <= 15 ? null : ["form.v.phone"];
    },
    email: function (n) {
      var v = val(n);
      if (!v) return attr(n, "data-required-if") ? (requiredNow(n) ? ["form.v.emailNeeded"] : null) : (requiredNow(n) ? ["form.v.email"] : null);
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : ["form.v.email"];
    },
    number: function (n) {
      var v = val(n), min = Number(attr(n, "data-min")), max = Number(attr(n, "data-max"));
      if (!v && !requiredNow(n)) return null;
      return /^\d+$/.test(v) && Number(v) >= min && Number(v) <= max ? null : ["form.v.number", { min: min, max: max }];
    },
    consent: function (n) { return controls(n)[0].checked ? null : ["form.v.consent"]; }
  };
  function check(name) { var r = attr(name, "data-rule"); return r && RULES[r] ? RULES[r](name) : null; }

  function validateFields(names) {
    var first = null, n = 0;
    names.forEach(function (name) {
      var res = check(name);
      setError(name, res && res[0], res && res[1]);
      if (res) { n++; if (!first) first = name; }
    });
    if (first) { controls(first)[0].focus(); els.status.textContent = B.t("form.error.summary", { n: n }); }
    else els.status.textContent = "";
    return !first;
  }
  function liveClear(e) {
    var name = e.target.name, w = name && wrap(name);
    var targets = [name];
    fields.forEach(function (f) { var c = f.getAttribute("data-required-if"); if (c && c.split("=")[0] === name) targets.push(f.getAttribute("data-field")); });
    targets.forEach(function (nm) {
      var er = document.getElementById("err-" + nm);
      if (er && !er.hidden && !check(nm)) setError(nm, "");
    });
    void w;
  }
  form.addEventListener("input", liveClear);
  form.addEventListener("change", liveClear);
  function markTouched(e) { var n = e.target && e.target.name; if (n) touched[n] = true; renderSummary(); }
  form.addEventListener("input", markTouched);
  form.addEventListener("change", markTouched);

  els.next.addEventListener("click", function () { if (validateFields(stepFields(cur))) show(cur + 1, true); });
  els.back.addEventListener("click", function () { show(cur - 1, true); });

  /* ----- payload ----- */
  function display(name) {
    var cs = controls(name), c = cs[0];
    if (!c) return "";
    if (c.type === "checkbox" && cs.length > 1) return checked(name).map(function (x) { return optLabel(x); }).join(", ");
    if (c.type === "radio") { var r = checked(name)[0]; return r ? optLabel(r) : ""; }
    if (c.tagName === "SELECT") return c.value ? c.options[c.selectedIndex].text : "";
    if (c.type === "checkbox") return c.checked ? B.t("form.yes") : "";
    return val(name);
  }
  function optLabel(inp) { var lk = inp.getAttribute("data-label-key"); if (lk) return B.t(lk); var l = inp.closest("label"); return l ? l.textContent.replace(/\s+/g, " ").trim() : inp.value; }
  function collect() {
    var d = {};
    fields.forEach(function (w) {
      var name = w.getAttribute("data-field"), cs = controls(name), c = cs[0];
      if (!c) return;
      if (c.type === "checkbox" && cs.length > 1) d[name] = checked(name).map(function (x) { return x.value; }).join(", ");
      else if (c.type === "radio") d[name] = (checked(name)[0] || {}).value || "";
      else if (c.type === "checkbox") d[name] = c.checked ? "yes" : "";
      else d[name] = val(name);
    });
    d.selectedSlot = slotParam; d.language = B.lang(); d.source = window.location.href;
    return d;
  }
  function summaryText() {
    var lines = [];
    fields.forEach(function (w) {
      var key = w.getAttribute("data-label-key"), name = w.getAttribute("data-field");
      if (!key || w.getAttribute("data-rule") === "consent") return;
      var v = display(name);
      if (v) lines.push(B.t(key) + ": " + v);
    });
    if (slotParam) lines.push(B.t("form.slotLabel") + ": " + slotParam);
    return lines.join("\n");
  }
  function subjectText() {
    var sw = form.querySelector("[data-subject]");
    return B.t("form.mail.subject", { name: sw ? val(sw.getAttribute("data-field")) : "" });
  }

  /* ----- submit ----- */
  function panel(which) {
    form.hidden = true;
    [els.demo, els.ok, els.fail].forEach(function (p) { p.hidden = p !== which; });
    which.setAttribute("tabindex", "-1");
    which.scrollIntoView({ behavior: "smooth", block: "start" });
    which.focus({ preventScroll: true });
  }
  function demoPanel() {
    var box = document.getElementById("demo-actions"), acts = [], c = B.cfg.contact || {};
    var text = summaryText();
    if (fcfg.fallbackEmail) acts.push('<a class="btn btn-secondary" href="mailto:' + B.esc(fcfg.fallbackEmail) + "?subject=" + encodeURIComponent(subjectText()) + "&body=" + encodeURIComponent(text) + '">' + B.icon("mail", "h-5 w-5") + B.esc(B.t("form.demo.email")) + "</a>");
    if (c.zalo) acts.push('<a class="btn btn-outline" target="_blank" rel="noopener noreferrer" href="https://zalo.me/' + B.esc(c.zalo) + '">' + B.icon("message", "h-5 w-5") + "Zalo</a>");
    box.innerHTML = acts.join("");
    document.getElementById("demo-summary").textContent = text;
    panel(els.demo);
  }
  function setBusy(b) { els.send.disabled = b; els.send.querySelector("span").textContent = B.t(b ? "common.sending" : "common.send"); }
  function postJson(url, d) {
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); });
  }
  function postNetlify(d) {
    var body = new URLSearchParams(Object.assign({ "form-name": fcfg.netlifyFormName || form.getAttribute("name") || "booking" }, d)).toString();
    return fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.elements.website && form.elements.website.value) return; // honeypot: bots only
    for (var i = 0; i < total; i++) {
      var names = stepFields(i);
      if (names.some(function (n) { return check(n); })) { show(i, false); validateFields(names); return; }
    }
    fields.forEach(function (w) { setError(w.getAttribute("data-field"), ""); });
    var d = collect();
    if (!live) { demoPanel(); return; }
    setBusy(true);
    var req = provider === "netlify" ? postNetlify(d) : postJson(fcfg.endpoint, d);
    req.then(function () {
      if (fcfg.redirectAfterSuccess) { window.location.href = fcfg.redirectAfterSuccess; return; }
      panel(els.ok);
    }).catch(function (err) {
      if (window.console) console.error("[Kitelish] form submit failed:", err);
      setBusy(false);
      panel(els.fail);
    });
  });

  document.querySelectorAll("[data-form-reset]").forEach(function (b) {
    b.addEventListener("click", function () {
      [els.demo, els.ok, els.fail].forEach(function (p) { p.hidden = true; });
      form.hidden = false; setBusy(false); show(0, true);
    });
  });

  var cal = document.getElementById("calendly-box");
  if (cal) { if (fcfg.calendlyUrl) { cal.hidden = false; cal.querySelector("a").href = fcfg.calendlyUrl; } else cal.hidden = true; }
  var failLinks = document.getElementById("fail-links");
  if (failLinks) {
    var c = B.cfg.contact || {};
    failLinks.innerHTML = (c.hotline ? '<a class="btn btn-secondary" href="tel:' + B.esc(c.hotline) + '">' + B.icon("phone", "h-5 w-5") + B.esc(c.hotlineDisplay || c.hotline) + "</a>" : "") +
      (c.zalo ? '<a class="btn btn-outline" target="_blank" rel="noopener noreferrer" href="https://zalo.me/' + B.esc(c.zalo) + '">Zalo</a>' : "");
  }

  // re-translate visible errors on language switch
  B.mount(function () {
    populate();
    form.querySelectorAll(".error-text:not([hidden])").forEach(function (er) {
      if (er.dataset.key) er.textContent = B.t(er.dataset.key, er.dataset.vars ? JSON.parse(er.dataset.vars) : undefined);
    });
  });
  show(0, false);
  setBusy(false);
})();
