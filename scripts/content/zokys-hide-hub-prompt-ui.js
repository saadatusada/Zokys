/**
 * When 127HUB method mode is on, hide Lovable-side hub "prompt.txt" inject UI;
 * users send only via Zokys extension chatbox.
 */
(function () {
  if (window.__zokysHideHubPromptUI__) return;
  window.__zokysHideHubPromptUI__ = true;
  if (!/lovable\.dev/i.test(location.hostname || "")) return;

  function isHubMode(cb) {
    try {
      chrome.storage.local.get(["zokys_method_mode"], function (s) {
        cb(s && s.zokys_method_mode === "hub");
      });
    } catch (e) {
      cb(false);
    }
  }

  function scrub() {
    isHubMode(function (hub) {
      if (!hub) return;
      try {
        document.querySelectorAll("button,a,label,div,span").forEach(function (el) {
          var t = ((el.textContent || "") + " " + (el.getAttribute("aria-label") || "")).trim();
          if (!t || t.length > 40) return;
          if (/^prompt\.txt$/i.test(t) || /^prompt\.intxt$/i.test(t) || /hub_prompt/i.test(t)) {
            var wrap = el.closest("button,div,label") || el;
            try {
              wrap.style.display = "none";
              wrap.setAttribute("data-zokys-hub-ui-hide", "1");
            } catch (e2) {}
          }
        });
      } catch (e3) {}
    });
  }

  setInterval(scrub, 1000);
  setTimeout(scrub, 500);
})();
