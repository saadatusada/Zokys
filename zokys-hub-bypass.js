/**
 * 127HUB client gate soft-bypass for Zokys dual-method mode.
 * - Suppress alert/confirm license prompts
 * - Auto-dismiss modals containing 127HUB license copy
 * - Set common licensed flags
 */
(function () {
  if (window.__ZOKYS_HUB_BYPASS_V2__) return;
  window.__ZOKYS_HUB_BYPASS_V2__ = true;

  function isLicMsg(s) {
    s = String(s || "");
    return /127\s*HUB|License Key required|activate 127HUB|activate your 127HUB|license key to continue/i.test(s);
  }

  try {
    window.__127HUB_LICENSED__ = true;
    window.__HUB_LICENSED__ = true;
    window.__LICENSE_OK__ = true;
    window.__ZOKYS_LICENSED__ = true;
    window.__QL_LICENSED__ = true;
  } catch (e) {}

  try {
    ["127hub_licensed", "127hub_lic_ok", "hub_licensed", "ql_licensed", "ql_lic_ok", "licensed"].forEach(function (k) {
      try {
        localStorage.setItem(k, "1");
        sessionStorage.setItem(k, "1");
      } catch (e2) {}
    });
  } catch (e3) {}

  try {
    var na = window.alert;
    window.alert = function (msg) {
      if (isLicMsg(msg)) return;
      return na.apply(window, arguments);
    };
  } catch (e4) {}
  try {
    var nc = window.confirm;
    window.confirm = function (msg) {
      if (isLicMsg(msg)) return true;
      return nc.apply(window, arguments);
    };
  } catch (e5) {}

  function dismissLicenseModals() {
    try {
      var nodes = document.querySelectorAll("div,section,dialog,[role='dialog'],[role='alertdialog']");
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var t = (el.innerText || el.textContent || "").trim();
        if (!t || t.length > 500) continue;
        if (!isLicMsg(t)) continue;
        // click Dismiss / OK / close if present
        var btns = el.querySelectorAll("button,a,[role='button']");
        for (var j = 0; j < btns.length; j++) {
          var lab = ((btns[j].textContent || "") + " " + (btns[j].getAttribute("aria-label") || "")).toLowerCase();
          if (/dismiss|ok|close|cancel|got it|×|x/i.test(lab)) {
            try {
              btns[j].click();
            } catch (e6) {}
          }
        }
        try {
          el.style.display = "none";
          el.remove();
        } catch (e7) {}
      }
    } catch (e8) {}
  }

  setInterval(dismissLicenseModals, 600);
  try {
    new MutationObserver(function () {
      dismissLicenseModals();
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e9) {}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", dismissLicenseModals);
  } else {
    dismissLicenseModals();
  }
})();
