/* Flip cards: <button class="flip" aria-pressed="false"> toggles between a front and a back face.
   Only the visible face is rendered (CSS), so assistive tech reads one face at a time. Enter / Space work natively. */
(function () {
  "use strict";
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("button.flip");
    if (!b) return;
    b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
  });
})();
