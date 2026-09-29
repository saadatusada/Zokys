/**
 * Light polish — purple ring + badge. No heavy observers.
 */
(function () {
  if (window.__zokysUiPolishLite__) return;
  window.__zokysUiPolishLite__ = true;
  if (!/lovable\.dev/i.test(location.hostname)) return;

  var STYLE_ID = "zokys-ui-lite-css";
  function css() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent =
      "[data-zokys-composer-wrap='1']{box-shadow:0 0 0 2px #a855f7,0 0 12px rgba(168,85,247,.25)!important;border-radius:16px!important;}" +
      ".zokys-pro-badge{position:absolute!important;top:-10px!important;right:12px!important;z-index:20!important;" +
      "font-size:10px!important;font-weight:800!important;padding:2px 8px!important;border-radius:999px!important;" +
      "background:linear-gradient(135deg,#7c3aed,#c084fc)!important;color:#fff!important;pointer-events:none!important;}";
    (document.head || document.documentElement).appendChild(st);
  }

  function mark() {
    try {
      var list = document.querySelectorAll("textarea");
      var best = null, sc = 0;
      for (var i = 0; i < list.length; i++) {
        var el = list[i];
        if (el.closest && el.closest("#trivis-vx-root")) continue;
        var r = el.getBoundingClientRect();
        if (r.width < 120) continue;
        var s = r.width + (r.bottom > innerHeight * 0.5 ? 300 : 0);
        if (s > sc) { sc = s; best = el; }
      }
      if (!best) return;
      var wrap = best.closest("form") || best.parentElement;
      if (!wrap) return;
      wrap.setAttribute("data-zokys-composer-wrap", "1");
      if (getComputedStyle(wrap).position === "static") wrap.style.position = "relative";
      if (!wrap.querySelector(".zokys-pro-badge")) {
        var b = document.createElement("div");
        b.className = "zokys-pro-badge";
        b.textContent = "Zokys";
        wrap.appendChild(b);
      }
    } catch (e) {}
  }

  css();
  setTimeout(mark, 2000);
  setInterval(mark, 5000);
})();
