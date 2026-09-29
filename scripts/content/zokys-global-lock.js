/**
 * Global Extension Lock — UI lock, shake, crazy send notice.
 */
(function () {
  "use strict";
  if (window.__zokysGlobalLock1__) return;
  window.__zokysGlobalLock1__ = true;
  if (!/lovable\.dev/i.test(location.hostname || "")) return;

  var locked = false;
  var lockMessage = "Extension is locked. Please contact the administrator.";

  function load() {
    try {
      chrome.storage.local.get(["zokys_extension_locked", "zokys_lock_message"], function (s) {
        locked = !!(s && s.zokys_extension_locked === true);
        if (s && s.zokys_lock_message) lockMessage = s.zokys_lock_message;
        paintLocks();
      });
    } catch (_) {}
  }

  function paintLocks() {
    try {
      var root = document.getElementById("trivis-vx-root");
      if (!root) return;
      if (locked) root.setAttribute("data-zokys-locked", "1");
      else root.removeAttribute("data-zokys-locked");

      // Overlay badges on section panels / icon buttons
      var icons = root.querySelectorAll("[data-action], .vx-icon, button, [role='button']");
      for (var i = 0; i < icons.length; i++) {
        var el = icons[i];
        if (el.getAttribute("data-zokys-lock-badge") === "1") {
          if (!locked) {
            el.removeAttribute("data-zokys-lock-badge");
            var b = el.querySelector(".zokys-lock-badge");
            if (b) b.remove();
          }
          continue;
        }
        if (!locked) continue;
        el.setAttribute("data-zokys-lock-badge", "1");
        if (!el.querySelector(".zokys-lock-badge")) {
          var badge = document.createElement("span");
          badge.className = "zokys-lock-badge";
          badge.textContent = "🔒";
          badge.style.cssText =
            "position:absolute;top:2px;right:2px;font-size:10px;pointer-events:none;filter:drop-shadow(0 0 4px rgba(0,0,0,.6));z-index:5;";
          if (getComputedStyle(el).position === "static") el.style.position = "relative";
          el.appendChild(badge);
        }
      }
    } catch (_) {}
  }

  function shake(el) {
    if (!el) return;
    el.classList.remove("zokys-shake");
    void el.offsetWidth;
    el.classList.add("zokys-shake");
    setTimeout(function () {
      el.classList.remove("zokys-shake");
    }, 500);
  }

  function ensureCss() {
    if (document.getElementById("zokys-lock-css")) return;
    var st = document.createElement("style");
    st.id = "zokys-lock-css";
    st.textContent =
      "@keyframes zokysShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px) rotate(-1deg)}40%{transform:translateX(6px) rotate(1deg)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}" +
      ".zokys-shake{animation:zokysShake .45s cubic-bezier(.36,.07,.19,.97) both!important}" +
      "#trivis-vx-root[data-zokys-locked='1']{opacity:.95}" +
      "#zokys-lock-notice{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;" +
      "padding:24px;background:rgba(4,2,12,.72);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);" +
      "font-family:Inter,system-ui,sans-serif}" +
      "#zokys-lock-notice .zk-n-card{position:relative;width:min(400px,100%);border-radius:24px;padding:28px 22px;" +
      "background:linear-gradient(160deg,rgba(40,10,20,.95),rgba(20,8,36,.98));" +
      "border:1px solid rgba(248,113,113,.45);box-shadow:0 28px 80px rgba(127,29,29,.4),0 0 60px rgba(168,85,247,.15);" +
      "text-align:center;overflow:hidden;animation:zkLockIn .5s cubic-bezier(.22,1,.36,1) both}" +
      "@keyframes zkLockIn{from{opacity:0;transform:scale(.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}" +
      "#zokys-lock-notice .zk-n-orb{position:absolute;width:160px;height:160px;border-radius:50%;filter:blur(40px);opacity:.5;pointer-events:none}" +
      "#zokys-lock-notice .zk-n-orb.a{top:-50px;right:-40px;background:rgba(239,68,68,.45)}" +
      "#zokys-lock-notice .zk-n-orb.b{bottom:-50px;left:-40px;background:rgba(147,51,234,.35)}" +
      "#zokys-lock-notice .zk-n-icon{position:relative;font-size:42px;margin-bottom:10px;filter:drop-shadow(0 0 12px rgba(248,113,113,.6));animation:zkPulse 1.6s ease-in-out infinite}" +
      "@keyframes zkPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}" +
      "#zokys-lock-notice .zk-n-title{position:relative;font-size:20px;font-weight:900;letter-spacing:.04em;" +
      "background:linear-gradient(100deg,#fecaca,#fff,#e9d5ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}" +
      "#zokys-lock-notice .zk-n-msg{position:relative;font-size:14px;line-height:1.55;color:rgba(254,226,226,.9);margin:0 0 16px;font-weight:600}" +
      "#zokys-lock-notice .zk-n-sub{position:relative;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:rgba(252,165,165,.65);margin-bottom:18px}" +
      "#zokys-lock-notice .zk-n-btn{position:relative;border:none;cursor:pointer;padding:12px 22px;border-radius:14px;font-weight:800;font-size:13px;" +
      "color:#fff;background:linear-gradient(135deg,#7f1d1d,#a855f7);box-shadow:0 10px 28px rgba(127,29,29,.35)}" +
      "#zokys-lock-banner{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483645;" +
      "padding:10px 18px;border-radius:999px;font-family:Inter,system-ui,sans-serif;font-size:12px;font-weight:800;" +
      "letter-spacing:.04em;color:#fff;background:linear-gradient(90deg,#7f1d1d,#6b21a8);border:1px solid rgba(252,165,165,.35);" +
      "box-shadow:0 12px 32px rgba(0,0,0,.35);pointer-events:none}";
    (document.head || document.documentElement).appendChild(st);
  }

  function showCrazyNotice(msg) {
    ensureCss();
    var old = document.getElementById("zokys-lock-notice");
    if (old) old.remove();
    var ov = document.createElement("div");
    ov.id = "zokys-lock-notice";
    ov.innerHTML =
      '<div class="zk-n-card">' +
      '<div class="zk-n-orb a"></div><div class="zk-n-orb b"></div>' +
      '<div class="zk-n-icon">🔒</div>' +
      '<div class="zk-n-title">EXTENSION LOCKED</div>' +
      '<div class="zk-n-sub">Zokys · Global Lock</div>' +
      '<div class="zk-n-msg"></div>' +
      '<button type="button" class="zk-n-btn" id="zokys-lock-ok">Got it</button>' +
      "</div>";
    ov.querySelector(".zk-n-msg").textContent = msg || lockMessage || "Extension is locked";
    document.documentElement.appendChild(ov);
    ov.querySelector("#zokys-lock-ok").onclick = function () {
      ov.remove();
    };
    ov.onclick = function (e) {
      if (e.target === ov) ov.remove();
    };
  }

  function showBanner() {
    ensureCss();
    var b = document.getElementById("zokys-lock-banner");
    if (!locked) {
      if (b) b.remove();
      return;
    }
    if (!b) {
      b = document.createElement("div");
      b.id = "zokys-lock-banner";
      document.documentElement.appendChild(b);
    }
    b.textContent = "🔒 " + (lockMessage || "Extension is locked");
  }

  // Block extension UI clicks when locked
  document.addEventListener(
    "click",
    function (e) {
      if (!locked) return;
      var t = e.target;
      if (!t || !t.closest) return;
      var root = t.closest("#trivis-vx-root");
      if (!root) return;
      // allow nothing except maybe viewing
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      var hit = t.closest("button, [data-action], .vx-icon, a, [role='button']") || root;
      shake(hit);
      showCrazyNotice(lockMessage);
    },
    true
  );

  // Block chat send when locked
  document.addEventListener(
    "click",
    function (e) {
      if (!locked) return;
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest("#trivis-vx-root") || t.closest("#zokys-lock-notice")) return;
      var btn = t.closest("button");
      if (!btn) return;
      var al = ((btn.getAttribute("aria-label") || "") + " " + (btn.textContent || "")).toLowerCase();
      var looksSend =
        /send/i.test(al) ||
        (btn.querySelector("svg") && btn.getBoundingClientRect().bottom > window.innerHeight * 0.45);
      if (!looksSend) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      showCrazyNotice(lockMessage || "Extension is locked");
    },
    true
  );

  document.addEventListener(
    "keydown",
    function (e) {
      if (!locked) return;
      if (e.key !== "Enter" || e.shiftKey) return;
      var ae = document.activeElement;
      if (!ae) return;
      if (ae.tagName !== "TEXTAREA" && ae.getAttribute("contenteditable") !== "true") return;
      if (ae.closest && ae.closest("#trivis-vx-root")) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      showCrazyNotice(lockMessage || "Extension is locked");
    },
    true
  );

  try {
    chrome.runtime.onMessage.addListener(function (msg) {
      if (!msg || msg.type !== "ZOKYS_LOCK_STATE") return;
      locked = !!msg.locked;
      if (msg.message) lockMessage = msg.message;
      ensureCss();
      showBanner();
      paintLocks();
      if (locked) {
        // soft pulse notice once per lock
        if (!sessionStorage.getItem("zokys_lock_seen")) {
          sessionStorage.setItem("zokys_lock_seen", "1");
          showCrazyNotice(lockMessage);
        }
      } else {
        sessionStorage.removeItem("zokys_lock_seen");
        var n = document.getElementById("zokys-lock-notice");
        if (n) n.remove();
        showBanner();
      }
    });
  } catch (_) {}

  try {
    chrome.storage.onChanged.addListener(function (ch, area) {
      if (area !== "local") return;
      if (ch.zokys_extension_locked || ch.zokys_lock_message) {
        load();
        ensureCss();
        showBanner();
      }
    });
  } catch (_) {}

  ensureCss();
  load();
  showBanner();
  setInterval(paintLocks, 2000);
  // Refresh lock from server occasionally
  try {
    chrome.runtime.sendMessage({ type: "TRIVIS_LOCK_STATUS" }, function () {
      void chrome.runtime.lastError;
      load();
      showBanner();
    });
  } catch (_) {}
})();
