/**
 * Aggressive stop when "For the code present..." long dumps appear.
 */
(function () {
  if (window.__zokysForceStopV32__) return;
  window.__zokysForceStopV32__ = true;
  if (!/lovable\.dev/i.test(location.hostname || "")) return;

  var BUSY = false;
  var LAST = 0;
  var BAD = /for the code present|here is the (full )?code below|please think step-by-step in order to resolve/i;

  function skip(n) {
    return !n || (n.closest && n.closest("#trivis-vx-root"));
  }

  function findStops() {
    var out = [];
    document.querySelectorAll("button,[role='button'],[aria-label]").forEach(function (b) {
      if (skip(b)) return;
      var al = ((b.getAttribute("aria-label") || "") + " " + (b.getAttribute("title") || "") + " " + (b.textContent || "")).toLowerCase();
      if (/stop|cancel|abort|halt|stop generating/i.test(al)) {
        var r = b.getBoundingClientRect();
        if (r.width > 8 && r.height > 8) out.push(b);
      }
    });
    return out;
  }

  function forceStop() {
    var now = Date.now();
    if (now - LAST < 500) return;
    LAST = now;
    findStops().forEach(function (b) {
      try {
        b.click();
      } catch (_) {}
      try {
        b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      } catch (_) {}
    });
    try {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, bubbles: true }));
    } catch (_) {}
  }

  function scan() {
    if (BUSY) return;
    try {
      var nodes = document.querySelectorAll(
        '[data-message],[class*="message"],[class*="Message"],article,[role="log"] > div'
      );
      var bad = false;
      for (var i = Math.max(0, nodes.length - 10); i < nodes.length; i++) {
        if (skip(nodes[i])) continue;
        var t = (nodes[i].innerText || nodes[i].textContent || "").trim();
        if (BAD.test(t) || t.length > 3500) {
          bad = true;
          break;
        }
      }
      if (bad && findStops().length) {
        BUSY = true;
        forceStop();
        setTimeout(forceStop, 350);
        setTimeout(forceStop, 800);
        try { if (window.__zokysForceStopBurst) window.__zokysForceStopBurst(); } catch (_) {}
        setTimeout(function () {
          BUSY = false;
        }, 1800);
      }
    } catch (_) {}
  }

  setInterval(scan, 800);
  try {
    new MutationObserver(function () {
      scan();
    }).observe(document.body || document.documentElement, { childList: true, subtree: true });
  } catch (_) {}
})();
