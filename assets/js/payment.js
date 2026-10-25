/* "How to pay" block: bank details with copy buttons + QR. Reads payment{} from site.config.js. Hidden unless payment.show. */
(function () {
  "use strict";
  var B = window.Kitelish;
  var payHost = document.getElementById("payment-block");
  if (!payHost) return;

  function renderPayment() {
    var pay = B.cfg.payment;
    if (!payHost) return;
    if (!pay || !pay.show) { payHost.hidden = true; return; }
    payHost.hidden = false;
    function row(labelKey, value) {
      return '<div class="flex items-center justify-between gap-3 border-b border-ink/10 py-3 last:border-0"><div class="min-w-0"><div class="text-sm text-muted">' + B.esc(B.t(labelKey)) + '</div><div class="break-words font-bold text-ink">' + B.esc(value) + "</div></div>" +
        '<button type="button" class="btn btn-ghost !min-h-[44px] !px-3 !py-2 text-sm" data-copy="' + B.esc(value) + '">' + B.icon("copy", "h-4 w-4") + "<span>" + B.esc(B.t("common.copy")) + "</span></button></div>";
    }
    payHost.innerHTML =
      '<div class="grid items-center gap-8 md:grid-cols-[1fr_240px]"><div>' +
      '<h2 class="text-2xl sm:text-3xl">' + B.esc(B.t("pricing.pay.title")) + "</h2>" +
      '<p class="mt-3 text-muted">' + B.esc(B.t("pricing.pay.text")) + "</p>" +
      (pay.isPlaceholder ? '<p class="mt-4 flex gap-2 rounded-2xl bg-accent/30 p-3 text-sm font-bold text-ink" role="note">' + B.icon("alert", "mt-0.5 h-5 w-5 shrink-0") + "<span>" + B.esc(B.t("pricing.pay.placeholder")) + "</span></p>" : "") +
      '<div class="mt-4">' + row("pricing.pay.bank", pay.bankName) + row("pricing.pay.name", pay.accountName) + row("pricing.pay.number", pay.accountNumber) + row("pricing.pay.note", pay.transferNote) + "</div>" +
      '<p class="mt-3 text-sm text-muted">' + B.esc(B.t("pricing.pay.intl")) + '</p><p class="sr-only" role="status" id="copy-status"></p></div>' +
      '<figure class="mx-auto text-center"><img src="' + B.esc(pay.qrImage) + '" alt="' + B.esc(B.t("pricing.pay.qrAlt")) + '" width="240" height="240" class="h-60 w-60 rounded-3xl bg-white p-3 ring-2 ring-ink/10" />' +
      '<figcaption class="mt-2 text-sm text-muted">' + B.esc(B.t("pricing.pay.qrCaption")) + "</figcaption></figure></div>";
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn) return;
    var val = btn.getAttribute("data-copy");
    var done = function () {
      var span = btn.querySelector("span"), old = B.t("common.copy");
      span.textContent = B.t("common.copied");
      var st = document.getElementById("copy-status"); if (st) st.textContent = B.t("common.copied");
      setTimeout(function () { span.textContent = old; if (st) st.textContent = ""; }, 1800);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(val).then(done, function () {});
    else {
      var ta = document.createElement("textarea"); ta.value = val; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (err) {} document.body.removeChild(ta);
    }
  });

  B.mount(renderPayment);
})();
