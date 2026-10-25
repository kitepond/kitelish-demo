/* Contact page: opening hours, address, map (placeholder or Google Maps embed), social links. */
(function () {
  "use strict";
  var B = window.Kitelish, c = B.cfg.contact || {};
  var mapEl = document.getElementById("contact-map");
  if (!mapEl) return;
  var hoursEl = document.getElementById("contact-hours");
  var addrEl = document.getElementById("contact-address");
  var socialEl = document.getElementById("contact-social");

  B.mount(function () {
    if (hoursEl) hoursEl.innerHTML = (B.cfg.hours || []).map(function (h) {
      var v = h.open ? B.fmtTime(h.open) + " – " + B.fmtTime(h.close) : B.t("footer.closed");
      return '<li class="flex justify-between gap-4 border-b border-ink/10 py-2.5 last:border-0"><span class="font-bold">' + B.esc(B.t("day." + h.day)) + '</span><span class="tabular-nums text-muted">' + B.esc(v) + "</span></li>";
    }).join("");
    if (addrEl) addrEl.textContent = B.L(c.address);
    if (c.mapEmbedUrl) {
      mapEl.innerHTML = '<iframe class="h-full min-h-[320px] w-full rounded-3xl border-0" src="' + B.esc(c.mapEmbedUrl) + '" title="' + B.esc(B.t("contact.map.title")) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
    } else {
      mapEl.innerHTML = '<div class="relative overflow-hidden rounded-3xl ring-1 ring-ink/10"><img src="assets/img/map-placeholder.svg" width="800" height="500" alt="' + B.esc(B.t("contact.map.alt")) + '" class="h-full w-full object-cover" loading="lazy" />' +
        '<p class="absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 p-3 text-sm font-bold text-ink shadow-soft">' + B.esc(B.t("contact.map.placeholder")) + "</p></div>";
    }
    var link = document.getElementById("contact-map-link");
    if (link) { if (c.mapLink) { link.href = c.mapLink; link.hidden = false; } else link.hidden = true; }
    if (socialEl) {
      var s = c.social || {}, names = { facebook: "Facebook", instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", zalo: "Zalo OA", linkedin: "LinkedIn" };
      socialEl.innerHTML = Object.keys(names).filter(function (k) { return s[k]; }).map(function (k) {
        return '<li><a class="btn btn-outline !min-h-[44px] !px-4 !py-2 text-sm" target="_blank" rel="noopener noreferrer" href="' + B.esc(s[k]) + '">' + names[k] + "</a></li>";
      }).join("");
    }
  });
})();
