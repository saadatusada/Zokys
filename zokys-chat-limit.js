/**
 * 1 successful send → cooldown window (6 min).
 * 2nd send blocked via dismissible popup + live timer (no page/chat overlay).
 */
(function () {
  "use strict";
  if (window.__zokysPromptTimerV34__) return;
  window.__zokysPromptTimerV34__ = true;
  if (!/lovable\.dev/i.test(location.hostname || "")) return;

  var KEY = "zokys_prompt_timer_v34";
  var LOCK_MS = 6 * 60 * 1000;
  var state = { lockUntil: 0, tickT: null };

  function css() {
    if (document.getElementById("zokys-cd-css")) return;
    var st = document.createElement("style");
    st.id = "zokys-cd-css";
    st.textContent = [
      "#zokys-cd-pop{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;",
      "background:rgba(0,0,0,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);padding:16px}",
      "#zokys-cd-pop .cd-card{position:relative;width:min(340px,94vw);padding:22px 20px 18px;border-radius:20px;",
      "background:linear-gradient(165deg,rgba(32,14,58,.98),rgba(10,4,22,.98));",
      "border:1px solid rgba(192,38,255,.4);box-shadow:0 24px 60px rgba(0,0,0,.55),0 0 40px rgba(124,58,237,.25);color:#f5f3ff;",
      "font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif}",
      "#zokys-cd-pop .cd-x{position:absolute;top:10px;right:10px;width:32px;height:32px;border-radius:10px;border:0;cursor:pointer;",
      "background:rgba(255,255,255,.08);color:#e9d5ff;font-size:18px;line-height:1;font-weight:700}",
      "#zokys-cd-pop .cd-x:hover{background:rgba(255,255,255,.14)}",
      "#zokys-cd-pop .cd-badge{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;",
      "color:#e879f9;margin-bottom:8px}",
      "#zokys-cd-pop .cd-title{font-size:16px;font-weight:800;margin:0 0 8px;",
      "background:linear-gradient(120deg,#fff,#e879f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent}",
      "#zokys-cd-pop .cd-body{font-size:12px;line-height:1.5;color:rgba(233,213,255,.75);margin:0 0 14px}",
      "#zokys-cd-pop .cd-time{font:800 26px ui-monospace,monospace;color:#e879f9;text-align:center;",
      "text-shadow:0 0 20px rgba(232,121,249,.45);margin:4px 0 6px}",
      "#zokys-cd-pop .cd-hint{font-size:10px;text-align:center;color:rgba(196,181,253,.5)}"
    ].join("");
    (document.head || document.documentElement).appendChild(st);
  }

  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  function clearUi() {
    var el = document.getElementById("zokys-cd-pop");
    if (el) el.remove();
    if (state.tickT) {
      clearInterval(state.tickT);
      state.tickT = null;
    }
  }

  function unlockIfDue() {
    if (state.lockUntil && Date.now() >= state.lockUntil) {
      state.lockUntil = 0;
      try {
        chrome.storage.local.remove([KEY]);
      } catch (_) {}
      clearUi();
      return true;
    }
    return !state.lockUntil || Date.now() >= state.lockUntil;
  }

  function showPopup() {
    css();
    clearUi();
    if (unlockIfDue()) return;
    var pop = document.createElement("div");
    pop.id = "zokys-cd-pop";
    pop.innerHTML =
      '<div class="cd-card" role="dialog" aria-modal="true">' +
      '<button type="button" class="cd-x" aria-label="Close">×</button>' +
      '<div class="cd-badge">Zokys · cooldown</div>' +
      '<div class="cd-title">Prompt limit reached</div>' +
      '<p class="cd-body">You have used your 1-prompt window. Please wait for the cooldown to finish before sending another prompt. Remaining time is shown below.</p>' +
      '<div class="cd-time" id="zokys-cd-time">0:00</div>' +
      '<div class="cd-hint">You can close this popup — the timer keeps running until unlock.</div>' +
      "</div>";
    document.documentElement.appendChild(pop);
    pop.querySelector(".cd-x").onclick = function () {
      clearUi();
    };
    pop.addEventListener("click", function (e) {
      if (e.target === pop) clearUi();
    });
    function tick() {
      if (unlockIfDue()) {
        clearUi();
        return;
      }
      var left = state.lockUntil - Date.now();
      var node = document.getElementById("zokys-cd-time");
      if (node) node.textContent = fmt(left);
    }
    tick();
    state.tickT = setInterval(tick, 250);
  }

  function armCooldown() {
    state.lockUntil = Date.now() + LOCK_MS;
    try {
      chrome.storage.local.set({ [KEY]: { lockUntil: state.lockUntil } });
    } catch (_) {}
  }

  function restore() {
    try {
      chrome.storage.local.get([KEY], function (s) {
        var d = s && s[KEY];
        if (d && d.lockUntil && d.lockUntil > Date.now()) {
          state.lockUntil = d.lockUntil;
        } else {
          state.lockUntil = 0;
        }
      });
    } catch (_) {}
  }

  window.__zokysChatLimitBlocked = function (cb) {
    if (unlockIfDue()) {
      cb(false);
      return;
    }
    if (state.lockUntil && Date.now() < state.lockUntil) {
      showPopup();
      cb(true);
      return;
    }
    cb(false);
  };

  window.__zokysChatLimitRecordSend = function (cb) {
    armCooldown();
    if (cb) cb({ ok: true, lockUntil: state.lockUntil });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", restore);
  else restore();
})();
