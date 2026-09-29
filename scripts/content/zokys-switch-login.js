/**
 * Account switch: instant shield, 2-step login, invite handoff, never stick on Opening login.
 */
(function () {
  "use strict";
  if (window.__zokysSwitchLogin8__) return;
  window.__zokysSwitchLogin8__ = true;

  var interval = null;
  var step1At = 0;
  var step2At = 0;
  var step2Clicks = 0;
  var finished = false;

  function log(m) {
    try {
      console.log("[Zokys Switch]", m);
    } catch (_) {}
  }

  function ensureShield(text) {
    var sh = document.getElementById("zokys-switch-shield");
    if (!sh) {
      sh = document.createElement("div");
      sh.id = "zokys-switch-shield";
      sh.innerHTML =
        '<style>#zokys-switch-shield{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;background:rgba(5,3,12,.82);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);font-family:Inter,system-ui,sans-serif;color:#f5f3ff}' +
        '#zokys-switch-shield .zk-ring{position:relative;width:64px;height:64px}' +
        '#zokys-switch-shield .zk-ring i{position:absolute;inset:0;border-radius:50%;border:3px solid transparent;border-top-color:#a855f7;border-right-color:#ef4444;animation:zkSpin .9s linear infinite}' +
        '#zokys-switch-shield .zk-ring i:nth-child(2){inset:8px;border-top-color:#c084fc;border-right-color:transparent;animation-duration:1.2s;animation-direction:reverse}' +
        '@keyframes zkSpin{to{transform:rotate(360deg)}}' +
        '#zokys-switch-shield .zk-st{font-size:16px;font-weight:800;text-align:center;padding:0 28px;background:linear-gradient(90deg,#e9d5ff,#fff,#fecaca);-webkit-background-clip:text;-webkit-text-fill-color:transparent}' +
        '#zokys-switch-shield .zk-ss{font-size:12px;opacity:.55;text-align:center;max-width:300px;line-height:1.5}</style>' +
        '<div class="zk-ring"><i></i><i></i></div><div class="zk-st">Switching…</div><div class="zk-ss">Logout · pool login · project handoff</div>';
      document.documentElement.appendChild(sh);
    }
    var t = sh.querySelector(".zk-st");
    if (t && text) t.textContent = text;
  }

  function hideShield() {
    var sh = document.getElementById("zokys-switch-shield");
    if (sh) sh.remove();
  }

  function clearState(reason) {
    log("clear: " + reason);
    finished = true;
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    hideShield();
    try {
      chrome.storage.local.set({
        zokys_switch_pending: false,
        zokys_switch_shield: false,
        zokys_switch_step: "done",
        zokys_switch_password: ""
      });
    } catch (_) {}
  }

  function onLoginPath() {
    var p = location.pathname || "";
    return p.indexOf("/login") === 0 || p.indexOf("/_auth") === 0 || p.indexOf("/signin") === 0;
  }

  function looksLoggedIn() {
    if (onLoginPath()) return false;
    var p = location.pathname || "";
    if (/\/projects\//i.test(p)) return true;
    if (p === "/" || p === "") return true;
    // Sidebar / app chrome
    try {
      if (document.querySelector('a[href*="/projects"]')) return true;
      if (document.body && /My projects|All projects|Dashboard/i.test(document.body.innerText || "")) return true;
    } catch (_) {}
    return false;
  }

  function setReact(el, value) {
    if (!el) return;
    try {
      el.focus();
      el.select();
    } catch (_) {}
    try {
      document.execCommand("selectAll", false, null);
      document.execCommand("insertText", false, value);
    } catch (_) {}
    try {
      var desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      if (desc && desc.set) desc.set.call(el, value);
      else el.value = value;
    } catch (_) {
      try {
        el.value = value;
      } catch (__) {}
    }
    try {
      if (el._valueTracker) el._valueTracker.setValue("");
    } catch (_) {}
    try {
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (_) {}
  }

  function isOAuth(b) {
    var t = ((b && b.textContent) || "").toLowerCase();
    return /google|github|apple|sso/.test(t);
  }

  function emailInput() {
    return (
      document.querySelector('input[type="email"]') ||
      document.querySelector('input[name="email"]') ||
      document.querySelector('input[autocomplete="email"]') ||
      document.querySelector('input[placeholder*="mail" i]')
    );
  }

  function passInput() {
    return document.querySelector('input[type="password"]');
  }

  function btnContinue(em) {
    var t = document.querySelector('button[data-testid="auth-submit-button"]');
    if (t && !isOAuth(t)) return t;
    var scope = (em && em.closest("form")) || document;
    var bs = scope.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      if (isOAuth(bs[i])) continue;
      var x = (bs[i].textContent || "").trim().toLowerCase();
      if (x === "continue" || x.indexOf("continue") === 0 || bs[i].type === "submit") return bs[i];
    }
    return null;
  }

  function btnLogin() {
    var t = document.querySelector('button[data-testid="auth-submit-button"]');
    if (t && !isOAuth(t)) return t;
    var bs = document.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) {
      if (isOAuth(bs[i])) continue;
      var x = (bs[i].textContent || "").trim().toLowerCase();
      if (/log\s*in|sign\s*in/.test(x)) return bs[i];
    }
    return null;
  }

  function click(el) {
    if (!el) return;
    try {
      el.click();
    } catch (_) {
      try {
        el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      } catch (__) {}
    }
  }

  function validInvite(url) {
    if (!url || url.indexOf("http") !== 0) return false;
    try {
      var u = new URL(url);
      if (u.pathname.indexOf("/login") === 0) return false;
      return true;
    } catch (_) {
      return false;
    }
  }

  function goInvite(invite) {
    if (!validInvite(invite)) {
      clearState("no-valid-invite");
      return;
    }
    ensureShield("Opening project invite…");
    try {
      chrome.storage.local.set({
        zokys_switch_pending: false,
        zokys_switch_step: "invite",
        zokys_switch_password: "",
        zokys_invite_url: invite,
        zokys_switch_shield: true
      });
    } catch (_) {}
    try {
      localStorage.setItem("__zokys_pending_invite", invite);
    } catch (_) {}
    // 127hub style: short delay then replace
    setTimeout(function () {
      try {
        window.location.replace(invite);
      } catch (_) {
        location.href = invite;
      }
    }, 700);
    // Never stick forever on invite page
    setTimeout(function () {
      if (document.getElementById("zokys-switch-shield")) clearState("invite-max-wait");
    }, 22000);
  }

  function afterLoginSuccess(pending) {
    if (finished) return;
    finished = true;
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    log("login success");
    try {
      chrome.storage.local.set({ zokys_last_pool_email: pending.email || "" });
    } catch (_) {}

    var inv = pending.inviteUrl || "";
    try {
      if (!inv) inv = localStorage.getItem("__zokys_pending_invite") || "";
    } catch (_) {}

    if (validInvite(inv)) {
      goInvite(inv);
    } else {
      clearState("logged-in-no-invite");
    }
  }

  function startTick(pending) {
    if (interval) clearInterval(interval);
    finished = false;
    step2Clicks = 0;
    step1At = 0;
    step2At = 0;
    ensureShield("Signing into pool account…");
    log("automation " + pending.email);

    var tries = 0;
    interval = setInterval(function () {
      if (finished) return;
      tries++;
      if (tries > 160) {
        clearState("timeout");
        return;
      }

      if (!onLoginPath()) {
        if (step2Clicks > 0 || looksLoggedIn()) {
          afterLoginSuccess(pending);
        }
        return;
      }

      ensureShield(step2Clicks ? "Logging in…" : "Connecting pool account…");

      var all = document.querySelectorAll("button,a");
      for (var i = 0; i < all.length; i++) {
        var tt = (all[i].textContent || "").toLowerCase();
        if (tt.indexOf("continue with password") !== -1 || tt.indexOf("use password") !== -1) {
          click(all[i]);
          return;
        }
      }

      var em = emailInput();
      var pw = passInput();

      if (em && !pw) {
        setReact(em, pending.email);
        if (Date.now() - step1At > 1600) {
          var b = btnContinue(em);
          if (b && !b.disabled) {
            setReact(em, pending.email);
            click(b);
            step1At = Date.now();
          }
        }
        return;
      }

      if (pw) {
        setReact(pw, pending.password);
        if (em) setReact(em, pending.email);
        if (Date.now() - step2At > 1500) {
          var lb = btnLogin();
          if (lb && !lb.disabled) {
            setReact(pw, pending.password);
            click(lb);
            step2Clicks++;
            step2At = Date.now();
          } else {
            try {
              var form = pw.closest("form");
              if (form) {
                if (form.requestSubmit) form.requestSubmit();
                else form.submit();
                step2Clicks++;
                step2At = Date.now();
              }
            } catch (_) {}
          }
        }
      }
    }, 380);
  }

  function handleInvitePhase(s) {
    ensureShield("Loading project…");
    var inv = (s && s.zokys_invite_url) || "";
    try {
      if (!inv) inv = localStorage.getItem("__zokys_pending_invite") || "";
    } catch (_) {}

    // Click accept / join
    try {
      document.querySelectorAll("button,a").forEach(function (b) {
        var t = (b.textContent || "").trim().toLowerCase();
        if (/^accept$|accept invite|join project|open project|continue to project/.test(t)) {
          try {
            b.click();
          } catch (_) {}
        }
      });
    } catch (_) {}

    // Already on project workspace
    if (/\/projects\/[a-zA-Z0-9_-]+/i.test(location.pathname)) {
      setTimeout(function () {
        clearState("on-project");
      }, 1200);
      return;
    }

    // Logged in home — force invite once more
    if (validInvite(inv) && !/magic_link=/i.test(location.href)) {
      if (!sessionStorage.getItem("zokys_inv_final")) {
        sessionStorage.setItem("zokys_inv_final", "1");
        setTimeout(function () {
          try {
            location.replace(inv);
          } catch (_) {
            location.href = inv;
          }
        }, 500);
      }
    }

    // Absolute clear
    setTimeout(function () {
      if (document.getElementById("zokys-switch-shield")) clearState("invite-phase-timeout");
    }, 18000);
  }

  function boot() {
    try {
      chrome.storage.local.get(
        [
          "zokys_switch_pending",
          "zokys_switch_email",
          "zokys_switch_password",
          "zokys_invite_url",
          "zokys_switch_step",
          "zokys_switch_shield",
          "zokys_switch_at"
        ],
        function (s) {
          if (!s) return;

          // Always restore shield if flag set
          if (s.zokys_switch_shield) ensureShield("Switching account…");

          // Invite phase after login
          if (s.zokys_switch_step === "invite") {
            handleInvitePhase(s);
            return;
          }

          // Done / orphan shield
          if (!s.zokys_switch_pending) {
            if (s.zokys_switch_shield) {
              // User already in app — drop shield
              if (looksLoggedIn()) clearState("orphan-logged-in");
              else
                setTimeout(function () {
                  if (document.getElementById("zokys-switch-shield")) clearState("orphan-timeout");
                }, 8000);
            }
            return;
          }

          if (!s.zokys_switch_email || !s.zokys_switch_password) {
            clearState("missing-creds");
            return;
          }
          if (s.zokys_switch_at && Date.now() - s.zokys_switch_at > 6 * 60 * 1000) {
            clearState("expired");
            return;
          }

          var invite = s.zokys_invite_url || "";
          try {
            if (invite) localStorage.setItem("__zokys_pending_invite", invite);
          } catch (_) {}

          // KEY FIX: already logged in (new account) — do NOT stick on Opening login
          if (!onLoginPath()) {
            if (looksLoggedIn()) {
              log("already logged in — handoff");
              afterLoginSuccess({
                email: String(s.zokys_switch_email),
                password: String(s.zokys_switch_password),
                inviteUrl: invite
              });
              return;
            }
            // Navigate to login once
            ensureShield("Opening login…");
            if (!sessionStorage.getItem("zokys_to_login8")) {
              sessionStorage.setItem("zokys_to_login8", "1");
              try {
                location.replace("https://lovable.dev/login");
              } catch (_) {
                location.href = "https://lovable.dev/login";
              }
            } else {
              // Second time still not login / not logged in — clear
              setTimeout(function () {
                if (!onLoginPath() && document.getElementById("zokys-switch-shield")) {
                  if (looksLoggedIn()) {
                    afterLoginSuccess({
                      email: String(s.zokys_switch_email),
                      password: String(s.zokys_switch_password),
                      inviteUrl: invite
                    });
                  } else clearState("stuck-opening-login");
                }
              }, 5000);
            }
            return;
          }

          startTick({
            email: String(s.zokys_switch_email),
            password: String(s.zokys_switch_password),
            inviteUrl: invite
          });
        }
      );
    } catch (_) {}
  }

  boot();
  setTimeout(boot, 600);
  setTimeout(boot, 1600);
  setTimeout(boot, 3500);
  try {
    chrome.storage.onChanged.addListener(function (ch, area) {
      if (area !== "local") return;
      if (ch.zokys_switch_pending || ch.zokys_switch_step || ch.zokys_switch_shield) {
        setTimeout(boot, 250);
      }
    });
  } catch (_) {}
})();


/* Main account backup + return */
(function () {
  var MAIN_KEY = "zokys_main_account_v1";

  function saveMainSnapshot() {
    try {
      var email = "";
      var inputs = document.querySelectorAll('input[type="email"], input[name*="email" i]');
      for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].value) {
          email = inputs[i].value;
          break;
        }
      }
      // also try visible profile text
      chrome.storage.local.get([MAIN_KEY], function (s) {
        var prev = (s && s[MAIN_KEY]) || {};
        var next = {
          email: email || prev.email || "",
          savedAt: Date.now(),
          href: location.href
        };
        chrome.storage.local.set({ [MAIN_KEY]: next });
      });
    } catch (_) {}
  }

  // save before switch starts
  var _start = window.__zokysStartAccountSwitch;
  // hook via event
  window.__zokysSaveMainBeforeSwitch = function () {
    saveMainSnapshot();
  };

  window.__zokysBackToMainAccount = function () {
    try {
      chrome.storage.local.get([MAIN_KEY], function (s) {
        var main = (s && s[MAIN_KEY]) || {};
        // logout current then user may need to login - try open lovable login
        var sh = document.getElementById("zokys-switch-shield");
        if (sh) sh.remove();
        var modal = document.getElementById("zokys-switch-modal");
        if (modal) modal.remove();

        // clear session cookies roughly by going logout URL patterns
        var links = document.querySelectorAll("a, button");
        for (var i = 0; i < links.length; i++) {
          var t = ((links[i].textContent || "") + (links[i].getAttribute("href") || "")).toLowerCase();
          if (/log\s*out|sign\s*out/i.test(t)) {
            try {
              links[i].click();
            } catch (_) {}
            break;
          }
        }
        setTimeout(function () {
          // Navigate to login; prefill email if field appears
          var email = main.email || "";
          window.__zokysRestoreMainEmail = email;
          if (!/login|signin|auth/i.test(location.pathname)) {
            // try common paths
            location.href = "https://lovable.dev/login";
          }
          var tries = 0;
          var it = setInterval(function () {
            tries++;
            var inp = document.querySelector('input[type="email"], input[name*="email" i], input[placeholder*="email" i]');
            if (inp && email) {
              try {
                var desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
                if (desc && desc.set) desc.set.call(inp, email);
                else inp.value = email;
                inp.dispatchEvent(new Event("input", { bubbles: true }));
              } catch (_) {}
            }
            if (tries > 40) clearInterval(it);
          }, 350);
        }, 800);
      });
    } catch (_) {}
  };

  // auto-save snapshot periodically when logged in on lovable
  setInterval(function () {
    if (!/lovable\.dev/i.test(location.hostname || "")) return;
    if (/login|signin|auth/i.test(location.pathname || "")) return;
    saveMainSnapshot();
  }, 60000);
})();
