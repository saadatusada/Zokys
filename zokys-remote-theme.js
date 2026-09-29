/** Apply remote theme from zokys server storage */
(function () {
  if (window.__zokysRemoteTheme__) return;
  window.__zokysRemoteTheme__ = true;
  function apply(theme) {
    if (!theme || !theme.accent) return;
    try {
      document.documentElement.style.setProperty("--zk-accent", theme.accent);
      document.documentElement.style.setProperty("--ql-accent", theme.accent);
      var root = document.getElementById("trivis-vx-root");
      if (root) {
        root.style.setProperty("--zk-accent", theme.accent);
      }
    } catch (_) {}
  }
  function load() {
    try {
      chrome.storage.local.get(["zokys_remote_theme", "zokys_extension_locked", "zokys_lock_message"], function (s) {
        if (s && s.zokys_remote_theme) apply(s.zokys_remote_theme);
      });
    } catch (_) {}
  }
  load();
  try {
    chrome.storage.onChanged.addListener(function (chg, area) {
      if (area === "local" && chg.zokys_remote_theme) apply(chg.zokys_remote_theme.newValue);
    });
  } catch (_) {}
})();
