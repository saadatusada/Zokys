/**
 * Native chat lock disabled (user request) — removes any leftover overlay.
 */
(function () {
  "use strict";
  if (window.__zokysNativeLockOff__) return;
  window.__zokysNativeLockOff__ = true;
  function clear() {
    try {
      var el = document.getElementById("zokys-native-lock");
      if (el) el.remove();
    } catch (_) {}
  }
  clear();
  setInterval(clear, 2000);
})();
