/**
 * Premium send loader — ~5% backdrop blur, purple orbit rings
 */
(function () {
  if (window.__zokysSendAnimV2__) return;
  window.__zokysSendAnimV2__ = true;
  if (!/lovable\.dev/i.test(location.hostname || "")) return;

  function css() {
    if (document.getElementById("zokys-send-anim-css")) return;
    var st = document.createElement("style");
    st.id = "zokys-send-anim-css";
    st.textContent = [
      "#zokys-send-anim{position:fixed;inset:0;z-index:2147483645;display:flex;align-items:center;justify-content:center;",
      "background:rgba(8,4,18,.28);backdrop-filter:blur(1.2px);-webkit-backdrop-filter:blur(1.2px);",
      "opacity:0;pointer-events:none;transition:opacity .35s ease}",
      "#zokys-send-anim.on{opacity:1;pointer-events:auto}",
      "#zokys-send-anim .sa-wrap{position:relative;width:120px;height:120px}",
      "#zokys-send-anim .sa-ring{position:absolute;inset:0;border-radius:50%;",
      "border:2px solid transparent;border-top-color:#e879f9;border-right-color:rgba(192,38,255,.35);",
      "animation:zokysOrbit 1.1s linear infinite}",
      "#zokys-send-anim .sa-ring.r2{inset:12px;border-top-color:#c026ff;animation-duration:.85s;animation-direction:reverse}",
      "#zokys-send-anim .sa-ring.r3{inset:26px;border-top-color:#a855f7;animation-duration:1.4s}",
      "#zokys-send-anim .sa-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);",
      "width:42px;height:42px;border-radius:50%;",
      "background:radial-gradient(circle at 30% 30%,#e879f9,#7c3aed 70%);",
      "box-shadow:0 0 28px rgba(192,38,255,.55);animation:zokysPulse 1.2s ease-in-out infinite}",
      "#zokys-send-anim .sa-card{margin-top:18px;text-align:center;min-width:180px}",
      "#zokys-send-anim .sa-box{display:flex;flex-direction:column;align-items:center;",
      "padding:28px 26px 22px;border-radius:24px;",
      "background:linear-gradient(160deg,rgba(28,12,52,.88),rgba(10,4,22,.92));",
      "border:1px solid rgba(192,38,255,.35);box-shadow:0 20px 50px rgba(0,0,0,.4),0 0 40px rgba(124,58,237,.2)}",
      "#zokys-send-anim .sa-t{font:800 13px Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;",
      "background:linear-gradient(120deg,#fff,#e879f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent}",
      "#zokys-send-anim .sa-s{margin-top:8px;font:500 11px Inter,system-ui;color:rgba(233,213,255,.65)}",
      "#zokys-send-anim .sa-dots::after{content:'';animation:zokysDots 1.2s steps(4,end) infinite}",
      "@keyframes zokysOrbit{to{transform:rotate(360deg)}}",
      "@keyframes zokysPulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:1}50%{transform:translate(-50%,-50%) scale(1.08);opacity:.85}}",
      "@keyframes zokysDots{0%{content:''}25%{content:'.'}50%{content:'..'}75%{content:'...'}}"
    ].join("");
    (document.head || document.documentElement).appendChild(st);
  }

  window.__zokysSendAnimShow = function (title, sub) {
    css();
    var el = document.getElementById("zokys-send-anim");
    if (!el) {
      el = document.createElement("div");
      el.id = "zokys-send-anim";
      el.innerHTML =
        '<div class="sa-box">' +
        '<div class="sa-wrap"><div class="sa-ring"></div><div class="sa-ring r2"></div><div class="sa-ring r3"></div><div class="sa-core"></div></div>' +
        '<div class="sa-card"><div class="sa-t"></div><div class="sa-s"></div></div></div>';
      document.documentElement.appendChild(el);
    }
    el.querySelector(".sa-t").innerHTML = (title || "Sending") + '<span class="sa-dots"></span>';
    el.querySelector(".sa-s").textContent = sub || "License check · packing task";
    requestAnimationFrame(function () {
      el.classList.add("on");
    });
  };

  window.__zokysSendAnimHide = function () {
    var el = document.getElementById("zokys-send-anim");
    if (!el) return;
    el.classList.remove("on");
    setTimeout(function () {
      try {
        el.remove();
      } catch (_) {}
    }, 360);
  };
})();
