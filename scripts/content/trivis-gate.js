/**
 * Zokys license gate — liquid glass (storage keys unchanged; page-ws untouched)
 */
(function () {
  if (window.__TRIVIS_V8_GATE__) return;
  window.__TRIVIS_V8_GATE__ = true;

  function status(cb) {
    try {
      chrome.runtime.sendMessage({ type: "TRIVIS_STATUS" }, function (r) {
        if (chrome.runtime.lastError) {
          chrome.storage.local.get(["trivis_lic_ok", "trivis_license_key", "trivis_lic_expires"], function (s) {
            var ok = !!(s && (s.trivis_lic_ok === true || s.trivis_lic_ok === "1") && s.trivis_license_key);
            if (ok && s.trivis_lic_expires) {
              var t = Date.parse(s.trivis_lic_expires);
              if (t && Date.now() > t) ok = false;
            }
            cb(ok);
          });
          return;
        }
        cb(!!(r && r.ok));
      });
    } catch (_) {
      cb(false);
    }
  }

  function removeGate() {
    var g = document.getElementById("trivis-pro-gate");
    if (!g) return;
    g.classList.add("vx-gate-out");
    setTimeout(function () {
      if (g && g.parentNode) g.remove();
    }, 380);
  }

  function showGate() {
    if (document.getElementById("trivis-pro-gate")) return;
    var root = document.createElement("div");
    root.id = "trivis-pro-gate";
    root.innerHTML =
      "<style>" +
      "#trivis-pro-gate{position:fixed!important;inset:0!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;-webkit-tap-highlight-color:transparent!important;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important;background:#030303!important;color:#f5f5f5!important;isolation:isolate!important;animation:vxGateIn .45s cubic-bezier(.22,1,.36,1) both!important;}" +
      "#trivis-pro-gate:before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 52%,rgba(255,255,255,.014),transparent 38%),radial-gradient(ellipse at 27% 58%,rgba(0,145,255,.022),transparent 32%),radial-gradient(ellipse at 73% 58%,rgba(255,20,70,.018),transparent 32%);}" +
      "#trivis-pro-gate.vx-gate-out{animation:vxGateOut .34s ease forwards!important;}" +
      "@keyframes vxGateIn{from{opacity:0}to{opacity:1}}@keyframes vxGateOut{to{opacity:0}}" +
      "@keyframes vxContentIn{from{opacity:0;transform:translateY(12px);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}" +
      "@keyframes vxLogo{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}@keyframes vxSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}" +
      "@keyframes vxReflection{0%,70%{transform:translateX(-140%);opacity:0}78%{opacity:.55}92%,100%{transform:translateX(260%);opacity:0}}" +
      "@keyframes vxShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}" +
      "#trivis-pro-gate *{box-sizing:border-box!important;outline:none!important;}" +
      "@keyframes zkGateBreath{0%,100%{box-shadow:0 0 40px rgba(147,51,234,.35),0 0 80px rgba(76,29,149,.2)}50%{box-shadow:0 0 40px rgba(185,28,28,.38),0 0 80px rgba(127,29,29,.22)}}#trivis-pro-gate .wrap{animation:zkGateBreath 40s ease-in-out infinite!important;}#trivis-pro-gate .wrap{position:relative!important;z-index:2!important;width:76vw!important;max-width:920px!important;min-width:290px!important;padding:18px 0 28px!important;margin:0!important;text-align:center!important;animation:vxContentIn .62s cubic-bezier(.22,1,.36,1) .04s both!important;}" +
      "#trivis-pro-gate .logo{width:112px!important;height:112px!important;margin:0 auto 42px!important;border-radius:28px!important;overflow:hidden!important;border:1px solid rgba(255,255,255,.08)!important;background:rgba(255,255,255,.025)!important;box-shadow:0 0 0 1px rgba(255,255,255,.025) inset,0 10px 34px rgba(255,20,40,.14),0 0 42px rgba(255,30,20,.08)!important;animation:vxLogo 4s ease-in-out infinite!important;}" +
      "#trivis-pro-gate .logo img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;}" +
      "#trivis-pro-gate h2.zk-gate-title{display:flex!important;align-items:baseline!important;justify-content:center!important;gap:10px!important;flex-wrap:wrap!important;margin:0!important;padding:0 8px!important;font-family:'Orbitron',system-ui,-apple-system,sans-serif!important;font-weight:800!important;letter-spacing:.12em!important;line-height:1.05!important;text-transform:uppercase!important;}#trivis-pro-gate .zk-g-z{font-size:clamp(28px,7vw,48px)!important;background:linear-gradient(135deg,#e9d5ff 0%,#a855f7 40%,#c084fc 100%)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important;filter:drop-shadow(0 0 18px rgba(168,85,247,.55))!important;}#trivis-pro-gate .zk-g-x{font-size:clamp(18px,4vw,28px)!important;color:rgba(255,255,255,.35)!important;font-weight:600!important;-webkit-text-fill-color:rgba(255,255,255,.35)!important;}#trivis-pro-gate .zk-g-t{font-size:clamp(28px,7vw,48px)!important;background:linear-gradient(135deg,#fecaca 0%,#ef2335 45%,#f87171 100%)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important;filter:drop-shadow(0 0 18px rgba(239,35,53,.5))!important;}#trivis-pro-gate h2{margin:0!important;padding:0!important;color:#f5f5f5!important;font-size:clamp(42px,5.1vw,66px)!important;line-height:1!important;font-weight:400!important;letter-spacing:.20em!important;text-transform:uppercase!important;text-shadow:0 0 26px rgba(255,255,255,.045)!important;}" +
      "#trivis-pro-gate h2 .vx{color:#ef2335!important;font-weight:400!important;letter-spacing:.12em!important;}" +
      "#trivis-pro-gate .sub{margin:28px 0 46px!important;padding:0!important;color:rgba(255,255,255,.38)!important;font-size:clamp(10px,1.05vw,13px)!important;line-height:1!important;letter-spacing:.40em!important;font-weight:600!important;text-transform:uppercase!important;}" +
      "#trivis-pro-gate .field{position:relative!important;display:flex!important;align-items:center!important;width:100%!important;height:76px!important;padding:0 24px 0 28px!important;margin:0!important;border-radius:30px!important;background:rgba(7,8,10,.42)!important;border:1px solid rgba(255,255,255,.075)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035),inset 0 -14px 28px rgba(0,0,0,.16),0 16px 42px rgba(0,0,0,.20)!important;backdrop-filter:blur(22px)!important;-webkit-backdrop-filter:blur(22px)!important;}" +
      "#trivis-pro-gate .field:focus-within{border-color:rgba(255,255,255,.15)!important;background:rgba(13,14,17,.5)!important;}" +
      "#trivis-pro-gate input{flex:1!important;min-width:0!important;width:auto!important;height:100%!important;margin:0!important;padding:0!important;border:0!important;outline:0!important;background:transparent!important;color:#f3f3f3!important;font-size:clamp(15px,1.45vw,19px)!important;font-weight:500!important;letter-spacing:.065em!important;font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important;text-align:left!important;box-shadow:none!important;}" +
      "#trivis-pro-gate input::placeholder{color:rgba(255,255,255,.34)!important;opacity:1!important;}" +
      "#trivis-pro-gate .paste{all:unset!important;flex:0 0 48px!important;display:grid!important;place-items:center!important;width:48px!important;height:48px!important;border-radius:50%!important;color:rgba(255,255,255,.62)!important;cursor:pointer!important;}" +
      "#trivis-pro-gate .paste svg{width:21px!important;height:21px!important;stroke:currentColor!important;fill:none!important;stroke-width:1.7!important;stroke-linecap:round!important;stroke-linejoin:round!important;}" +
      "#trivis-pro-gate .btn{position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important;flex:0 0 auto!important;width:100%!important;min-width:0!important;height:62px!important;min-height:62px!important;max-height:62px!important;margin:34px 0 0!important;padding:0 68px 0 30px!important;border:1px solid transparent!important;border-radius:20px!important;overflow:hidden!important;cursor:pointer!important;color:#f5f5f5!important;background:linear-gradient(180deg,rgba(8,9,11,.97),rgba(3,4,6,.98)) padding-box,linear-gradient(105deg,#009fe8 0%,#1471d8 18%,#6b48bd 50%,#a947a0 74%,#f0445e 100%) border-box!important;background-size:100% 100%,220% 100%!important;background-position:0 0,0% 50%!important;animation:vxBorderFlow 4.67s linear infinite!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055),inset 0 -12px 25px rgba(0,0,0,.42),0 0 5px rgba(0,170,235,.22),0 0 9px rgba(240,55,90,.18),0 9px 28px rgba(0,0,0,.34)!important;backdrop-filter:blur(22px)!important;-webkit-backdrop-filter:blur(22px)!important;isolation:isolate!important;transform:none!important;appearance:none!important;-webkit-appearance:none!important;}" +
      "#trivis-pro-gate .btn:before{content:''!important;position:absolute!important;inset:1px!important;border-radius:25px!important;pointer-events:none!important;background:linear-gradient(180deg,rgba(16,17,20,.72),rgba(4,5,7,.88))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055),inset 0 -12px 22px rgba(0,0,0,.30)!important;z-index:0!important;}" +
      "#trivis-pro-gate .btn:after{content:''!important;position:absolute!important;left:8%!important;top:1px!important;width:24%!important;height:1px!important;border-radius:999px!important;pointer-events:none!important;background:linear-gradient(90deg,transparent,rgba(255,255,255,.82),transparent)!important;filter:blur(.45px)!important;opacity:.62!important;animation:vxButtonSheen 4.67s cubic-bezier(.4,0,.2,1) infinite!important;z-index:2!important;}@keyframes vxBorderFlow{0%{background-position:0 0,0% 50%}50%{background-position:0 0,100% 50%}100%{background-position:0 0,0% 50%}}@keyframes vxButtonSheen{0%{transform:translateX(0);opacity:0}12%{opacity:.72}38%{opacity:.38}58%{transform:translateX(230%);opacity:0}100%{transform:translateX(230%);opacity:0}}" +
      "#trivis-pro-gate .btn .lbl{position:relative!important;z-index:2!important;display:block!important;opacity:1!important;font-size:clamp(12px,1.15vw,15px)!important;line-height:1!important;font-weight:600!important;letter-spacing:.13em!important;text-transform:uppercase!important;white-space:nowrap!important;text-shadow:0 1px 10px rgba(255,255,255,.08)!important;}" +
      "#trivis-pro-gate .arrow{position:absolute!important;z-index:3!important;right:27px!important;top:50%!important;margin:0!important;padding:0!important;transform:translateY(-52%)!important;font-size:24px!important;font-weight:300!important;line-height:1!important;color:rgba(255,255,255,.94)!important;white-space:nowrap!important;text-shadow:0 0 10px rgba(255,255,255,.12)!important;}" +
      "#trivis-pro-gate .spin{position:absolute!important;z-index:4!important;left:50%!important;top:50%!important;width:19px!important;height:19px!important;margin:0!important;margin-left:-9.5px!important;margin-top:-9.5px!important;border:1.5px solid rgba(255,255,255,.18)!important;border-top-color:rgba(255,255,255,.95)!important;border-right-color:rgba(0,169,255,.75)!important;border-radius:50%!important;animation:vxSpin .7s linear infinite!important;display:none!important;will-change:transform!important;}" +
      "#trivis-pro-gate .btn.loading{transform:none!important;filter:none!important;}#trivis-pro-gate .btn.loading .spin{display:block!important;animation:vxSpin .7s linear infinite!important;will-change:transform!important;}@media(prefers-reduced-motion:reduce){#trivis-pro-gate .btn{animation:none!important}#trivis-pro-gate .btn:after{animation:none!important}}#trivis-pro-gate .btn.loading .lbl,#trivis-pro-gate .btn.loading .arrow{opacity:0!important;}" +
      "#trivis-pro-gate .btn:disabled{opacity:1!important;}" +
      "#trivis-pro-gate .msg{position:relative!important;left:auto!important;right:auto!important;top:auto!important;width:100%!important;min-height:0!important;height:auto!important;margin:9px 0 0!important;text-align:center!important;font-size:10px!important;font-weight:600!important;letter-spacing:.1em!important;color:rgba(255,255,255,.34)!important;text-transform:uppercase!important;pointer-events:none!important;}" +
      "#trivis-pro-gate .msg.err{color:#ff5368!important}#trivis-pro-gate .msg.ok{color:#5de0ad!important}" +
      "#trivis-pro-gate .secure{margin:70px 0 0!important;padding:0!important;color:rgba(255,255,255,.30)!important;font-size:10px!important;line-height:1!important;letter-spacing:.34em!important;font-weight:600!important;text-transform:uppercase!important;}" +
      "#trivis-pro-gate .secure-icon{display:block!important;width:24px!important;height:24px!important;margin:0 auto 20px!important;color:rgba(255,255,255,.74)!important;}" +
      "#trivis-pro-gate .secure-icon svg{width:100%!important;height:100%!important;stroke:currentColor!important;fill:none!important;stroke-width:1.6!important;stroke-linecap:round!important;stroke-linejoin:round!important;}" +
      "#trivis-pro-gate .wrap.shake{animation:vxShake .3s ease!important}" +
      "@media(max-width:430px){#trivis-pro-gate .wrap{width:76vw!important;min-width:290px!important;max-width:360px!important;padding:12px 0 22px!important}#trivis-pro-gate .logo{width:76px!important;height:76px!important;border-radius:21px!important;margin-bottom:26px!important}#trivis-pro-gate h2{font-size:34px!important;letter-spacing:.16em!important}#trivis-pro-gate h2 .vx{letter-spacing:.10em!important}#trivis-pro-gate .sub{margin:19px 0 34px!important;font-size:9px!important;letter-spacing:.32em!important}#trivis-pro-gate .field{height:60px!important;padding-left:18px!important;padding-right:10px!important;border-radius:22px!important}#trivis-pro-gate input{font-size:12px!important;letter-spacing:.055em!important}#trivis-pro-gate .paste{flex-basis:38px!important;width:38px!important;height:38px!important}#trivis-pro-gate .paste svg{width:18px!important;height:18px!important}#trivis-pro-gate .btn{height:52px!important;min-height:52px!important;max-height:52px!important;margin-top:24px!important;padding:0 48px 0 20px!important;border-radius:16px!important}#trivis-pro-gate .btn .lbl{font-size:10px!important;letter-spacing:.10em!important}#trivis-pro-gate .arrow{right:18px!important;font-size:19px!important}#trivis-pro-gate .spin{width:15px!important;height:15px!important}#trivis-pro-gate .secure{margin-top:54px!important;font-size:7px!important;letter-spacing:.23em!important}#trivis-pro-gate .secure-icon{width:19px!important;height:19px!important;margin-bottom:15px!important}}" +
      "@media(min-width:431px){#trivis-pro-gate .btn,#trivis-pro-gate .field{width:100%!important;margin-left:0!important;margin-right:0!important}}" +
      "#trivis-pro-gate .field{transition:border-color .2s cubic-bezier(.22,1,.36,1),box-shadow .2s cubic-bezier(.22,1,.36,1)!important}#trivis-pro-gate .paste{transition:transform .18s cubic-bezier(.22,1,.36,1),color .18s ease,background .18s ease,border-color .18s ease!important}#trivis-pro-gate .paste:hover{transform:translateY(-1px) scale(1.05)!important}#trivis-pro-gate .paste:active{transform:scale(.96)!important}#trivis-pro-gate .btn{transition:transform .18s cubic-bezier(.22,1,.36,1),filter .18s ease,box-shadow .22s cubic-bezier(.22,1,.36,1)!important}#trivis-pro-gate .btn:hover{transform:translateY(-1.5px)!important;filter:brightness(1.06)!important}#trivis-pro-gate .btn:active{transform:scale(.98)!important}#trivis-pro-gate .logo-wrap,#trivis-pro-gate .logo{transition:transform .3s cubic-bezier(.22,1,.36,1)!important}@media (prefers-reduced-motion:reduce){#trivis-pro-gate, #trivis-pro-gate *{animation-duration:.01ms!important;transition-duration:.01ms!important}}</style>" +
      '<div class="wrap">' +
      '<div class="logo"><img alt="Zokys" src="' +
      (function () {
        try { return chrome.runtime.getURL("assets/icon128.png"); } catch (_) { return ""; }
      })() +
      '" onerror="this.style.display=\'none\'"/></div>' +
      '<h2 class="zk-gate-title"><span class="zk-g-z">ZOKYS</span></h2>' +
      '<p class="sub">ENTER LICENSE KEY</p>' +
      '<div class="field"><input id="trivis-gate-key" placeholder="ZOKYS-XXXX-XXXX" autocomplete="off" spellcheck="false"/>' +
      '<button type="button" class="paste" id="trivis-gate-paste" aria-label="Paste license key">' +
      '<svg viewBox="0 0 24 24"><rect x="8" y="7" width="11" height="13" rx="2"></rect><path d="M16 7V5.8A1.8 1.8 0 0 0 14.2 4H6.8A1.8 1.8 0 0 0 5 5.8v10.4A1.8 1.8 0 0 0 6.8 18H8"></path></svg>' +
      '</button></div>' +
      '<button type="button" class="btn" id="trivis-gate-go"><span class="spin"></span><span class="lbl">ACTIVATE LICENSE</span><span class="arrow">→</span></button>' +
      '<div class="msg" id="trivis-gate-msg"></div>' +
      '<div class="secure"><span class="secure-icon"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V2a4 4 0 0 1 8 0v3"></path><path d="M12 14v2"></path></svg></span>SECURED • ENCRYPTED • VX</div>' +
      '</div>';

    document.documentElement.appendChild(root);

    var input = root.querySelector("#trivis-gate-key");
    var btn = root.querySelector("#trivis-gate-go");
    var msg = root.querySelector("#trivis-gate-msg");
    var wrap = root.querySelector(".wrap");
    var paste = root.querySelector("#trivis-gate-paste");

    paste.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function (t) {
          if (t) input.value = t.trim();
        }).catch(function () {});
      }
    });

    function setLoading(on) {
      btn.disabled = !!on;
      btn.classList.toggle("loading", !!on);
      btn.querySelector(".lbl").textContent = "ACTIVATE LICENSE";
    }

    function activate() {
      var key = (input.value || "").trim();
      if (!key) {
        msg.className = "msg err";
        msg.textContent = "ENTER A LICENSE KEY";
        wrap.classList.remove("shake");
        void wrap.offsetWidth;
        wrap.classList.add("shake");
        return;
      }
      setLoading(true);
      msg.className = "msg";
      msg.textContent = "VERIFYING…";
      try {
        chrome.runtime.sendMessage({ type: "TRIVIS_VALIDATE", key: key }, function (r) {
          setLoading(false);
          if (chrome.runtime.lastError) {
            msg.className = "msg err";
            msg.textContent = chrome.runtime.lastError.message || "NETWORK ERROR";
            wrap.classList.remove("shake");
            void wrap.offsetWidth;
            wrap.classList.add("shake");
            return;
          }
          if (r && r.ok) {
            msg.className = "msg ok";
            msg.textContent = "ACTIVATED";
            setTimeout(removeGate, 420);
          } else {
            msg.className = "msg err";
            msg.textContent = (r && (r.error || r.message)) || "INVALID KEY";
            wrap.classList.remove("shake");
            void wrap.offsetWidth;
            wrap.classList.add("shake");
          }
        });
      } catch (e) {
        setLoading(false);
        msg.className = "msg err";
        msg.textContent = "EXTENSION ERROR";
      }
    }

    btn.addEventListener("click", activate);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") activate();
    });
  }

  function boot() {
    status(function (ok) {
      if (ok) removeGate();
      else showGate();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  try {
    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area !== "local") return;
      if (changes.trivis_lic_ok || changes.trivis_license_key || changes.trivis_lic_expires) {
        status(function (ok) {
          if (ok) removeGate();
          else showGate();
        });
      }
    });
  } catch (_) {}
})();
