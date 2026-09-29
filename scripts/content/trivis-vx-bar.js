/**
 * Zokys — polished liquid glass dock (UI only; page-ws untouched)
 */
(function () {
  "use strict";
  if (window.__TRIVIS_VX_BAR_V9__) return;
  window.__TRIVIS_VX_BAR_V9__ = true;

  const LINKS = {
    youtube: "https://youtube.com/@zokysx?si=WuTqIko-aT58w3od",
    instagram: "https://www.instagram.com/xy.alfaiiz?stkn=Nmh0OGwxcjBneWhx",
    telegram: "https://t.me/Zokysvx"
  };
  const PLANS = [
    { price: "$5", label: "10 days", id: "10d", devices: "3 devices", tag: "POPULAR", feats: ["Fix path active", "3 max devices", "Priority support"], hot: true },
    { price: "$9", label: "25 days", id: "25d", devices: "5 devices", tag: "PRO", feats: ["Fix path active", "5 max devices", "Fast support"] },
    { price: "$14", label: "40 days", id: "40d", devices: "Custom devices", tag: "MAX", feats: ["Fix path active", "Custom max devices", "VIP support"] },
    { price: "$25", label: "3 months", id: "pres", devices: "Pro Reseller", tag: "PRO RESELLER", feats: ["VIP admin panel", "Unlimited license keys", "Full source + setup", "Commission 0%"] }
  ];
  const LANGS = [
    { id: "en", label: "English" },
    { id: "hi", label: "हिन्दी" },
    { id: "es", label: "Español" },
    { id: "ar", label: "العربية" }
  ];

  let lang = "en", light = false, expanded = false; /* theme locked purple */
  let root, panel, bodyEl, pos = null, dragState = null;

  const I18N = {
    en: {
      license: "LICENSE", time: "TIME REMAINING", status: "STATUS", sync: "PROJECT SYNC",
      syncOk: "Project successfully synced", syncNo: "Project not synced",
      shop: "Shop", support: "Support", valid: "Valid", expired: "Expired", none: "No license",
      logout: "Logout", copy: "Copy", connected: "Connected", appTitle: "Zokys",
      appDesc: "License hub, points & extension tools. Android app coming soon.",
      download: "Download App", demo: "Demo — app not released yet", buy: "Buy now",
      follow: "Follow", join: "Join server", subscribe: "Subscribe", joinTg: "Join now"
    },
    hi: {
      license: "लाइसेंस", time: "बाकी समय", status: "स्थिति", sync: "प्रोजेक्ट सिंक",
      syncOk: "Project successfully synced", syncNo: "Project not synced",
      shop: "शॉप", support: "सपोर्ट", valid: "सक्रिय", expired: "समाप्त", none: "कोई लाइसेंस नहीं",
      logout: "लॉगआउट", copy: "कॉपी", connected: "कनेक्टेड", appTitle: "ट्रिव्हिस ऐप",
      appDesc: "लाइसेंस और एक्सटेंशन। ऐप जल्द।", download: "ऐप डाउनलोड", demo: "डेमो — ऐप नहीं",
      buy: "खरीदें", follow: "फॉलो", join: "जॉइन", subscribe: "सब्सक्राइब", joinTg: "जॉइन"
    }
  };
  function t(k) { return (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k; }

  function cssText() {
    return `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
#trivis-vx-root{all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483646}
#trivis-vx-root *{box-sizing:border-box;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;-webkit-font-smoothing:antialiased;
  -webkit-tap-highlight-color:transparent!important;tap-highlight-color:transparent!important;outline:none!important}
#trivis-vx-root button,#trivis-vx-root a{outline:none!important;-webkit-tap-highlight-color:transparent!important}

#trivis-vx-panel{
  --vx-sky:#38bdf8;--vx-sky2:#0ea5e9;--vx-sky-soft:rgba(168,85,247,.12);
  pointer-events:auto;position:fixed;left:16px;bottom:18px;width:min(348px,calc(100vw - 24px));max-height:86vh;
  color:#f4f4f5;border-radius:22px;overflow:hidden;display:flex;flex-direction:column;
  background:rgba(14,16,22,.44);
  backdrop-filter:blur(40px) saturate(200%);
  -webkit-backdrop-filter:blur(40px) saturate(200%);
  border:1px solid rgba(255,255,255,.18);
  box-shadow:
    0 20px 50px rgba(0,0,0,.35),
    0 0 0 0.5px rgba(255,255,255,.12) inset,
    0 1px 0 rgba(255,255,255,.2) inset;
  transition:width .4s cubic-bezier(.32,.72,0,1),border-radius .35s cubic-bezier(.32,.72,0,1),box-shadow .3s ease,transform .25s cubic-bezier(.32,.72,0,1);
  will-change:transform,left,top;
}
#trivis-vx-root.light #trivis-vx-panel{
  color:#0f172a;
  background:rgba(255,255,255,.58);
  border-color:rgba(255,255,255,.55);
  box-shadow:0 16px 40px rgba(0,0,0,.12),0 0 0 0.5px rgba(255,255,255,.8) inset;
}
#trivis-vx-panel.minimized{width:auto!important;max-width:calc(100vw - 20px);border-radius:18px}
#trivis-vx-body{display:block;pointer-events:auto;}
#trivis-vx-panel.minimized #trivis-vx-body{display:none!important}
#trivis-vx-panel.minimized #trivis-vx-header{position:relative;z-index:5;border-bottom:0;padding:7px 9px;border-radius:18px;background:transparent}
#trivis-vx-panel.dragging{transition:none!important;transform:scale(1.03);box-shadow:0 28px 70px rgba(0,0,0,.4),0 0 36px rgba(168,85,247,.2)}

#trivis-vx-header{
  display:flex;align-items:center;gap:2px;padding:10px 11px;
  background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02));
  border-bottom:1px solid rgba(255,255,255,.1);
  user-select:none;cursor:grab;touch-action:none
}
#trivis-vx-root.light #trivis-vx-header{
  background:linear-gradient(180deg,rgba(255,255,255,.5),rgba(255,255,255,.2));
  border-bottom-color:rgba(15,23,42,.08)
}
#trivis-vx-header:active{cursor:grabbing}
.vx-brand-icon{padding:0 6px 0 4px!important;border-right:1px solid rgba(168,85,247,.25)!important;display:inline-flex!important;align-items:center!important}
.vx-brand-icon img{width:22px!important;height:22px!important;object-fit:cover!important}

/* zk-force-purple */
#trivis-vx-root { --zk-accent:#c026ff !important; --zk-accent2:#e879f9 !important; }
#trivis-vx-root.light { /* disabled light */ }

#trivis-vx-root, #trivis-vx-root * { --zk-accent:#a855f7; --zk-accent2:#c084fc; }
#trivis-vx-root.light { /* force dark purple glass */ }
#trivis-vx-root {
  --vx-cyan:#a855f7 !important;
  --vx-sky:#c084fc !important;
}
#trivis-vx-root .vx-btn:not(.ghost) {
  background: linear-gradient(135deg,#9333ea,#a855f7) !important;
  color:#fff !important;
}
#trivis-vx-root .vx-dot { background:#a855f7 !important; box-shadow:0 0 8px #a855f7 !important; }
#trivis-vx-root .vx-fbtn.on {
  border-color:rgba(168,85,247,.55) !important;
  box-shadow:0 0 20px rgba(168,85,247,.25) !important;
}
#trivis-vx-root #trivis-vx-header, #trivis-vx-root .vx-panel {
  border-color:rgba(168,85,247,.25) !important;
}



.zk-brand-duo {
  font-size: 9px; font-weight: 900; letter-spacing: .04em;
  padding: 0 4px; white-space: nowrap; flex-shrink:1; max-width:88px; overflow:hidden;
  pointer-events:none;
}
.zk-brand-duo .z { color: #c084fc; }
.zk-brand-duo .x { color: #94a3b8; margin: 0 3px; }
.zk-brand-duo .t { color: #f87171; }
.zk-dev-box {
  text-align: center; padding: 14px 12px; margin-bottom: 12px; border-radius: 16px;
  background: linear-gradient(135deg, rgba(168,85,247,.2), rgba(239,35,53,.12));
  border: 1px solid rgba(168,85,247,.3);
}
.zk-dev-title {
  font-size: 16px; font-weight: 900; letter-spacing: .14em;
  background: linear-gradient(90deg, #c084fc, #fff, #f87171);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.zk-dev-sub { font-size: 10px; opacity: .55; margin-top: 4px; }
.vx-fbtn.zk-3d {
  background: linear-gradient(145deg, rgba(40,24,64,.9), rgba(20,12,36,.95)) !important;
  border: 1px solid rgba(168,85,247,.35) !important;
  box-shadow: 0 6px 16px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.06) !important;
  margin-bottom: 8px;
}
.zk-social-card {
  display: flex; align-items: center; gap: 12px; padding: 14px; margin-bottom: 10px;
  border-radius: 16px; text-decoration: none; color: #f5f3ff;
  background: linear-gradient(135deg, rgba(40,24,64,.9), rgba(24,12,32,.95));
  border: 1px solid rgba(168,85,247,.3);
  box-shadow: 0 8px 22px rgba(88,28,135,.2);
  transition: transform .15s;
}
.zk-social-card:hover { transform: translateY(-2px); }
.zk-social-card.sc-discord { border-color: rgba(129,140,248,.45); }
.zk-social-card.sc-tg { border-color: rgba(56,189,248,.4); }
.zk-sc-icon { font-size: 22px; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
  border-radius: 12px; background: rgba(168,85,247,.18); }
.zk-sc-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.zk-sc-body b { font-size: 13px; font-weight: 800; }
.zk-sc-body span { font-size: 11px; opacity: .55; }
.zk-sc-go { opacity: .5; }




.zk-chat-shell{position:relative;padding:12px 10px 10px;border-radius:18px;overflow:hidden;
background:linear-gradient(165deg,rgba(40,20,80,.55),rgba(18,10,40,.72));
border:1px solid rgba(196,181,253,.28);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.zk-chat-orb{position:absolute;width:120px;height:120px;border-radius:50%;filter:blur(36px);opacity:.45;pointer-events:none}
.zk-chat-orb.a{top:-40px;right:-30px;background:rgba(168,85,247,.5)}
.zk-chat-orb.b{bottom:-40px;left:-30px;background:rgba(99,102,241,.35)}
.zk-chat-top{position:relative;display:flex;align-items:center;gap:8px;margin-bottom:8px}
.zk-chat-logo{width:28px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;
font-weight:900;font-size:13px;color:#fff;background:linear-gradient(135deg,#7c3aed,#a855f7);box-shadow:0 0 16px rgba(168,85,247,.45)}
.zk-chat-brand{flex:1;min-width:0}.zk-chat-brand b{display:block;font-size:12px;letter-spacing:.08em;color:#e9d5ff}
.zk-chat-brand span{font-size:10px;opacity:.65}
.zk-chat-online{font-size:10px;font-weight:700;color:#86efac}
.zk-chat-hero{position:relative;text-align:center;padding:8px 4px 10px}
.zk-chat-crown{font-size:18px;filter:drop-shadow(0 0 8px rgba(216,180,254,.6))}
.zk-chat-title{font-size:22px;font-weight:900;letter-spacing:.04em;
background:linear-gradient(100deg,#e9d5ff,#fff,#c4b5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.zk-chat-sub{font-size:11px;opacity:.7;margin-top:2px}
.zk-chat-history{position:relative;max-height:110px;overflow:auto;margin:0 0 8px;display:flex;flex-direction:column;gap:6px}
.zk-chat-hitem{font-size:10px;padding:6px 8px;border-radius:10px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06)}
.zk-chat-hitem.ok{border-color:rgba(52,211,153,.25)}.zk-chat-hitem.fail{border-color:rgba(248,113,113,.35);color:#fecaca}
.zk-chat-hitem .p{margin-top:3px;opacity:.8;word-break:break-word}
.zk-chat-input-row{position:relative;display:flex;gap:8px;align-items:flex-end}
.zk-chat-input-row textarea{flex:1;resize:none;border-radius:14px;border:1px solid rgba(196,181,253,.3);
background:rgba(15,10,30,.55);color:#f5f3ff;padding:10px 12px;font-size:12px;outline:none;min-height:44px}
.zk-chat-send{width:42px;height:42px;border:none;border-radius:14px;cursor:pointer;font-size:16px;color:#fff;
background:linear-gradient(135deg,#7c3aed,#a855f7);box-shadow:0 8px 20px rgba(124,58,237,.4)}
.zk-chat-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;justify-content:center}
.zk-chat-chips span{font-size:9px;font-weight:700;padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);color:#c4b5fd}

.zk-chat-v3{padding:14px 12px 12px;border-radius:22px;
background:linear-gradient(160deg,rgba(55,25,110,.62),rgba(12,8,28,.82));
border:1px solid rgba(196,181,253,.35);box-shadow:0 20px 50px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.06)}
.zk-chat-aurora{position:absolute;inset:-20%;background:
radial-gradient(circle at 20% 20%,rgba(168,85,247,.35),transparent 40%),
radial-gradient(circle at 80% 80%,rgba(59,130,246,.25),transparent 42%);
pointer-events:none;animation:zkAurora 8s ease-in-out infinite alternate}
@keyframes zkAurora{from{transform:translateY(0)}to{transform:translateY(-12px)}}
.zk-mode-row{position:relative;display:flex;gap:8px;margin:0 0 10px}
.zk-mode-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 8px;border-radius:14px;
border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.25);color:#e9d5ff;font-size:11px;font-weight:800;
cursor:pointer;transition:transform .2s,box-shadow .25s,border-color .25s,background .25s}
.zk-mode-btn i{width:8px;height:8px;border-radius:50%;background:#64748b;box-shadow:0 0 0 0 rgba(0,0,0,0);transition:background .25s,box-shadow .25s}
.zk-mode-btn.on{border-color:rgba(52,211,153,.45);background:linear-gradient(135deg,rgba(6,78,59,.45),rgba(30,20,60,.5));
box-shadow:0 8px 22px rgba(16,185,129,.2);transform:translateY(-1px)}
.zk-mode-btn.on i{background:#4ade80;box-shadow:0 0 10px rgba(74,222,128,.85)}
.zk-mode-btn.build.on{border-color:rgba(248,113,113,.5);background:linear-gradient(135deg,rgba(127,29,29,.4),rgba(30,20,60,.5));
box-shadow:0 8px 22px rgba(239,68,68,.2)}
.zk-mode-btn.build.on i{background:#f87171;box-shadow:0 0 10px rgba(248,113,113,.85)}
.zk-chat-plus,.zk-chat-stop{width:40px;height:40px;border-radius:13px;border:1px solid rgba(255,255,255,.12);
background:rgba(255,255,255,.06);color:#e9d5ff;font-size:18px;font-weight:800;cursor:pointer}
.zk-chat-stop{font-size:12px;color:#fecaca}
.zk-chat-hitem{border-radius:12px;padding:8px 10px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.07)}
.zk-chat-hitem .meta{display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px}
.zk-chat-hitem.ok .meta b{color:#86efac}.zk-chat-hitem.fail .meta b{color:#fca5a5}




.zk-glass-panel,.zk-lb-box.zk-glass-panel{
  background:rgba(255,255,255,.08)!important;
  border:1px solid rgba(255,255,255,.18)!important;
  backdrop-filter:blur(22px) saturate(180%)!important;
  -webkit-backdrop-filter:blur(22px) saturate(180%)!important;
  box-shadow:0 8px 32px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.2)!important;
}
.zk-glass-circle{
  background:rgba(255,255,255,.12)!important;
  border:1px solid rgba(255,255,255,.22)!important;
  backdrop-filter:blur(14px)!important;
  -webkit-backdrop-filter:blur(14px)!important;
  box-shadow:0 4px 16px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.25)!important;
}
.zk-glass-cap .zk-lb-cap-btn{
  background:rgba(255,255,255,.1)!important;
  border:1px solid rgba(255,255,255,.2)!important;
  backdrop-filter:blur(14px)!important;
  -webkit-backdrop-filter:blur(14px)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.22)!important;
}
.zk-lb-title{
  font-family:"Segoe UI",system-ui,-apple-system,sans-serif!important;
  font-size:22px!important;font-weight:800!important;letter-spacing:-.02em!important;
  background:linear-gradient(120deg,#fff 0%,#e9d5ff 40%,#c4b5fd 70%,#fbcfe8 100%)!important;
  -webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important;
  filter:drop-shadow(0 2px 12px rgba(168,85,247,.35));
}
.zk-lb-title .heart{background:linear-gradient(120deg,#fb7185,#f472b6);-webkit-background-clip:text;font-weight:900}
.zk-lb-desc{
  font-family:ui-rounded,"SF Pro Text",system-ui,sans-serif!important;
  font-size:11.5px!important;line-height:1.55!important;color:rgba(255,255,255,.55)!important;
  font-weight:500!important;
}
.zk-soc{padding:8px 4px;display:flex;flex-direction:column;gap:10px}
.zk-soc-title{font-size:15px;font-weight:800;color:#f5f3ff;letter-spacing:.02em}
.zk-soc-sub{font-size:11px;color:rgba(255,255,255,.45);margin:-4px 0 4px}
.zk-glass-btn{
  display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;border-radius:16px;cursor:pointer;
  border:1px solid rgba(255,255,255,.2);
  background:linear-gradient(135deg,rgba(255,255,255,.14),rgba(255,255,255,.05));
  backdrop-filter:blur(20px) saturate(160%);-webkit-backdrop-filter:blur(20px) saturate(160%);
  box-shadow:0 10px 28px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.25);
  color:#f5f3ff;text-align:left;transition:transform .2s,box-shadow .2s;
}
.zk-glass-btn:active{transform:scale(.98)}
.zk-glass-btn .zk-g-ico{
  width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.15);font-size:14px;
}
.zk-glass-btn .zk-g-txt{display:flex;flex-direction:column;gap:2px}
.zk-glass-btn .zk-g-txt b{font-size:13px;font-weight:800}
.zk-glass-btn .zk-g-txt i{font-style:normal;font-size:10px;opacity:.55}


/* Header icon cascade on expand — brand fixed left, icons fan across width */
#trivis-vx-header{display:flex!important;align-items:center!important;width:100%!important;box-sizing:border-box!important}
#trivis-vx-header .vx-brand,#trivis-vx-header .vx-brand-icon{flex:0 0 auto!important;margin-right:4px!important}
#trivis-vx-panel.minimized #trivis-vx-header{justify-content:flex-start!important;gap:2px!important}
#trivis-vx-panel.minimized #trivis-vx-header .vx-ibtn{
  flex:0 0 auto!important;transform:none!important;opacity:1!important;
  transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .35s ease,margin .5s cubic-bezier(.16,1,.3,1)!important;
}
#trivis-vx-panel:not(.minimized) #trivis-vx-header{justify-content:flex-start!important;gap:0!important}
#trivis-vx-panel:not(.minimized) #trivis-vx-header .vx-ibtn{
  flex:1 1 0!important;max-width:48px!important;min-width:28px!important;
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  transition:transform .65s cubic-bezier(.16,1,.3,1),opacity .4s ease,flex .65s cubic-bezier(.16,1,.3,1)!important;
}
#trivis-vx-panel.is-expanding:not(.minimized) #trivis-vx-header .vx-ibtn{
  animation:zkFanIn .7s cubic-bezier(.16,1,.3,1) both;
}
#trivis-vx-panel.is-expanding:not(.minimized) #trivis-vx-header .vx-ibtn:nth-of-type(1){animation-delay:0s}
#trivis-vx-panel.is-expanding:not(.minimized) #trivis-vx-header .vx-ibtn:nth-of-type(2){animation-delay:.05s}
#trivis-vx-panel.is-expanding:not(.minimized) #trivis-vx-header .vx-ibtn:nth-of-type(3){animation-delay:.1s}
#trivis-vx-panel.is-expanding:not(.minimized) #trivis-vx-header .vx-ibtn:nth-of-type(4){animation-delay:.15s}
#trivis-vx-panel.is-expanding:not(.minimized) #trivis-vx-header .vx-ibtn:nth-of-type(5){animation-delay:.2s}
#trivis-vx-panel.is-expanding:not(.minimized) #trivis-vx-header .vx-ibtn:nth-of-type(6){animation-delay:.25s}
#trivis-vx-panel.is-expanding:not(.minimized) #trivis-vx-header .vx-ibtn:nth-of-type(7){animation-delay:.3s}
#trivis-vx-panel.is-expanding:not(.minimized) #trivis-vx-header .vx-ibtn:nth-of-type(8){animation-delay:.35s}
@keyframes zkFanIn{
  0%{opacity:.35;transform:translate3d(-14px,0,0) scale(.88)}
  60%{opacity:1;transform:translate3d(3px,0,0) scale(1.04)}
  100%{opacity:1;transform:translate3d(0,0,0) scale(1)}
}
#trivis-vx-panel.is-collapsing #trivis-vx-header .vx-ibtn{
  animation:zkFanOut .45s cubic-bezier(.4,0,.2,1) both;
}
#trivis-vx-panel.is-collapsing #trivis-vx-header .vx-ibtn:nth-of-type(1){animation-delay:.2s}
#trivis-vx-panel.is-collapsing #trivis-vx-header .vx-ibtn:nth-of-type(2){animation-delay:.16s}
#trivis-vx-panel.is-collapsing #trivis-vx-header .vx-ibtn:nth-of-type(3){animation-delay:.12s}
#trivis-vx-panel.is-collapsing #trivis-vx-header .vx-ibtn:nth-of-type(4){animation-delay:.08s}
#trivis-vx-panel.is-collapsing #trivis-vx-header .vx-ibtn:nth-of-type(5){animation-delay:.04s}
#trivis-vx-panel.is-collapsing #trivis-vx-header .vx-ibtn:nth-of-type(6){animation-delay:0s}
@keyframes zkFanOut{
  0%{opacity:1;transform:translate3d(0,0,0) scale(1)}
  100%{opacity:.5;transform:translate3d(-10px,0,0) scale(.92)}
}

.zk-lb{padding:10px 8px 8px}
.zk-lb-title{font-size:16px;font-weight:800;color:#f5f3ff;margin:0 0 4px;letter-spacing:.01em}
.zk-lb-desc{font-size:11px;line-height:1.45;color:rgba(255,255,255,.5);margin:0 0 12px}
.zk-lb-box{border-radius:18px;background:rgba(32,32,36,.95);border:1px solid rgba(255,255,255,.08);
padding:10px 10px 8px;box-shadow:0 8px 28px rgba(0,0,0,.25)}
.zk-lb-input{width:100%;border:none;outline:none;resize:none;background:transparent;color:#f4f4f5;
font-size:13px;line-height:1.45;min-height:56px;padding:4px 2px;font-family:inherit}
.zk-lb-input::placeholder{color:rgba(255,255,255,.35)}
.zk-lb-bar{display:flex;align-items:center;gap:6px;margin-top:6px}
.zk-lb-plus{width:32px;height:32px;border-radius:50%;border:none;background:rgba(255,255,255,.08);
color:#e4e4e7;font-size:18px;font-weight:600;cursor:pointer;line-height:1}
.zk-lb-capsule{position:relative}
.zk-lb-cap-btn{display:flex;align-items:center;gap:4px;height:32px;padding:0 12px;border-radius:999px;
border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#e4e4e7;
font-size:12px;font-weight:600;cursor:pointer}
.zk-lb-cap-btn .caret{font-size:9px;opacity:.7}
.zk-lb-menu{position:absolute;left:0;bottom:36px;min-width:100px;border-radius:12px;padding:4px;
background:#1c1c1f;border:1px solid rgba(255,255,255,.1);box-shadow:0 12px 30px rgba(0,0,0,.4);z-index:5}
.zk-lb-menu button{display:block;width:100%;text-align:left;border:none;background:transparent;
color:#e4e4e7;padding:8px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer}
.zk-lb-menu button:hover{background:rgba(255,255,255,.08)}
.zk-lb-spacer{flex:1}
.zk-lb-mic{width:32px;height:32px;border-radius:50%;border:none;background:transparent;
font-size:14px;opacity:.45;cursor:default}
.zk-lb-send,.zk-lb-stop{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;
font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center}
.zk-lb-send{background:#3f3f46;color:#fafafa}
.zk-lb-send:hover{background:#52525b}
.zk-lb-stop{background:#ef4444;color:#fff}
.zk-lb-hist{margin-top:8px;max-height:72px;overflow:auto}
.zk-lb-h{font-size:10px;padding:4px 0;color:rgba(255,255,255,.45)}
.zk-lb-h.ok{color:rgba(134,239,172,.75)}.zk-lb-h.bad{color:rgba(252,165,165,.75)}

.zk-c{padding:12px;border-radius:16px;background:rgba(18,16,28,.92);border:1px solid rgba(255,255,255,.08)}
.zk-c-head{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.zk-c-mark{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;
font-weight:900;font-size:14px;color:#fff;background:#7c3aed}
.zk-c-titles{flex:1;min-width:0}.zk-c-titles strong{display:block;font-size:13px;color:#f5f3ff}
.zk-c-titles span{font-size:10px;color:rgba(255,255,255,.45)}
.zk-c-live{font-size:10px;font-weight:700;color:#4ade80}
.zk-c-modes{display:flex;gap:8px;margin-bottom:10px}
.zk-c-mode{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px;border-radius:12px;
border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:rgba(255,255,255,.7);
font-size:11px;font-weight:700;cursor:pointer}
.zk-c-mode .dot{width:7px;height:7px;border-radius:50%;background:#64748b}
.zk-c-mode.on{border-color:rgba(74,222,128,.4);color:#bbf7d0;background:rgba(6,78,59,.25)}
.zk-c-mode.on .dot{background:#4ade80;box-shadow:0 0 8px rgba(74,222,128,.7)}
.zk-c-mode.build.on{border-color:rgba(248,113,113,.4);color:#fecaca;background:rgba(127,29,29,.25)}
.zk-c-mode.build.on .dot{background:#f87171;box-shadow:0 0 8px rgba(248,113,113,.7)}
.zk-c-hist{max-height:100px;overflow:auto;margin-bottom:10px;display:flex;flex-direction:column;gap:6px}
.zk-c-row{padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.06);font-size:11px}
.zk-c-row .r1{display:flex;justify-content:space-between;margin-bottom:3px;opacity:.8}
.zk-c-row.ok .r1 b{color:#86efac}.zk-c-row.bad .r1 b{color:#fca5a5}
.zk-c-row .r2{color:rgba(255,255,255,.75);word-break:break-word;line-height:1.35}
.zk-c-compose{display:flex;gap:6px;align-items:flex-end}
.zk-c-compose textarea{flex:1;resize:none;min-height:42px;border-radius:12px;border:1px solid rgba(255,255,255,.1);
background:rgba(0,0,0,.35);color:#f5f3ff;padding:10px;font-size:12px;outline:none}
.zk-c-icon{width:38px;height:38px;border-radius:11px;border:1px solid rgba(255,255,255,.1);
background:rgba(255,255,255,.05);color:#e9d5ff;font-size:16px;font-weight:700;cursor:pointer}
.zk-c-icon.stop{font-size:11px;color:#fca5a5}
.zk-c-go{height:38px;padding:0 14px;border:none;border-radius:11px;font-size:12px;font-weight:800;
color:#fff;background:#7c3aed;cursor:pointer}
.zk-c-hint{margin:8px 0 0;font-size:9px;text-align:center;color:rgba(255,255,255,.35);letter-spacing:.02em}

.zk-chat-foot{text-align:center;font-size:9px;letter-spacing:.12em;text-transform:uppercase;opacity:.45;margin-top:8px}

.zk-welcome{position:relative;padding:8px 4px 6px;overflow:hidden;min-height:280px}
.zk-welcome-orb{position:absolute;border-radius:50%;pointer-events:none;filter:blur(28px)}
.zk-welcome-orb-a{width:140px;height:140px;top:-40px;left:-20px;background:rgba(147,51,234,.35);animation:zkGlowOrb 40s ease-in-out infinite}
.zk-welcome-orb-b{width:120px;height:120px;bottom:10px;right:-30px;background:rgba(185,28,28,.28);animation:zkGlowOrb 40s ease-in-out infinite reverse}
.zk-welcome-inner{position:relative;z-index:2;text-align:center;padding:12px 8px}
.zk-welcome-badge{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:900;letter-spacing:.16em;
  padding:6px 14px;border-radius:999px;margin-bottom:14px;
  background:linear-gradient(135deg,rgba(76,29,149,.4),rgba(127,29,29,.25));
  border:1px solid rgba(167,139,250,.35);box-shadow:0 0 20px rgba(147,51,234,.15)}
.zk-welcome-badge .z{color:#c4b5fd}
.zk-welcome-badge .x{color:rgba(255,255,255,.35)}
.zk-welcome-badge .t{color:#fca5a5}
.zk-welcome-title{font-size:22px;font-weight:900;letter-spacing:.03em;margin-bottom:10px;
  background:linear-gradient(100deg,#f5f3ff 0%,#ddd6fe 40%,#fecaca 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent}
.zk-welcome-line{width:56px;height:3px;margin:0 auto 14px;border-radius:999px;
  background:linear-gradient(90deg,#7c3aed,#b91c1c);opacity:.85}
.zk-welcome-text{font-size:12px;line-height:1.6;opacity:.72;margin-bottom:16px;padding:0 6px;color:#e2e8f0}
.zk-welcome-hints{display:flex;flex-direction:column;gap:8px;text-align:left;margin-bottom:4px}
.zk-wh{padding:11px 12px;border-radius:14px;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08);display:flex;align-items:flex-start;gap:10px;
  transition:border-color .2s ease,background .2s ease}
.zk-wh:hover{border-color:rgba(167,139,250,.35);background:rgba(147,51,234,.08)}
.zk-wh-ico{font-size:16px;line-height:1.2}
.zk-wh b{display:block;font-size:12px;color:#e9d5ff;margin-bottom:2px}
.zk-wh span{font-size:10px;opacity:.5;color:#cbd5e1}
.zk-welcome-cta{width:100%!important;margin-top:14px!important;font-weight:800!important;
  background:linear-gradient(135deg,#6d28d9,#9f1239)!important;border:none!important;
  box-shadow:0 8px 22px rgba(109,40,217,.3)!important}




/* ===== Smooth dual theme: 40s total · purple ↔ deep crimson (not pink) ===== */
@keyframes zkThemeBreath {
  0% {
    border-color: rgba(147, 51, 234, 0.5);
    box-shadow:
      0 0 0 1px rgba(147, 51, 234, 0.2),
      0 14px 44px rgba(76, 29, 149, 0.42),
      0 0 32px rgba(126, 34, 206, 0.18);
  }
  20% {
    border-color: rgba(147, 51, 234, 0.48);
    box-shadow:
      0 0 0 1px rgba(147, 51, 234, 0.18),
      0 14px 44px rgba(76, 29, 149, 0.4),
      0 0 30px rgba(126, 34, 206, 0.16);
  }
  35% {
    border-color: rgba(160, 40, 120, 0.45);
    box-shadow:
      0 0 0 1px rgba(140, 30, 80, 0.2),
      0 14px 44px rgba(90, 20, 60, 0.4),
      0 0 28px rgba(140, 30, 80, 0.16);
  }
  50% {
    border-color: rgba(185, 28, 28, 0.55);
    box-shadow:
      0 0 0 1px rgba(153, 27, 27, 0.28),
      0 14px 48px rgba(127, 29, 29, 0.48),
      0 0 34px rgba(185, 28, 28, 0.22);
  }
  65% {
    border-color: rgba(160, 40, 120, 0.45);
    box-shadow:
      0 0 0 1px rgba(140, 30, 80, 0.2),
      0 14px 44px rgba(90, 20, 60, 0.4),
      0 0 28px rgba(140, 30, 80, 0.16);
  }
  80% {
    border-color: rgba(147, 51, 234, 0.48);
    box-shadow:
      0 0 0 1px rgba(147, 51, 234, 0.18),
      0 14px 44px rgba(76, 29, 149, 0.4),
      0 0 30px rgba(126, 34, 206, 0.16);
  }
  100% {
    border-color: rgba(147, 51, 234, 0.5);
    box-shadow:
      0 0 0 1px rgba(147, 51, 234, 0.2),
      0 14px 44px rgba(76, 29, 149, 0.42),
      0 0 32px rgba(126, 34, 206, 0.18);
  }
}
@keyframes zkHdrWash {
  0%, 100% {
    background: linear-gradient(110deg, rgba(76,29,149,.42), rgba(126,34,206,.16), rgba(12,8,20,.55));
  }
  35% {
    background: linear-gradient(110deg, rgba(100,25,70,.38), rgba(140,30,80,.14), rgba(12,8,20,.55));
  }
  50% {
    background: linear-gradient(110deg, rgba(127,29,29,.48), rgba(185,28,28,.18), rgba(12,8,20,.55));
  }
  65% {
    background: linear-gradient(110deg, rgba(100,25,70,.38), rgba(140,30,80,.14), rgba(12,8,20,.55));
  }
}
@keyframes zkGlowOrb {
  0%, 100% {
    opacity: 0.5;
    background: radial-gradient(circle, rgba(147,51,234,.5), transparent 72%);
  }
  50% {
    opacity: 0.5;
    background: radial-gradient(circle, rgba(185,28,28,.48), transparent 72%);
  }
}
@keyframes zkSoftPulse {
  0%, 100% { filter: drop-shadow(0 0 7px rgba(147,51,234,.4)); }
  50% { filter: drop-shadow(0 0 9px rgba(185,28,28,.42)); }
}
@keyframes zkFadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes zkExpandIn {
  from { opacity: 0.65; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

#trivis-vx-panel {
  animation: zkThemeBreath 40s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite !important;
  border-width: 1px !important;
  border-style: solid !important;
  overflow: hidden !important;
}
#trivis-vx-panel::before {
  content: "";
  position: absolute;
  top: -36%;
  left: 18%;
  width: 64%;
  height: 90px;
  pointer-events: none;
  z-index: 0;
  animation: zkGlowOrb 40s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  filter: blur(22px);
}
#trivis-vx-header {
  position: relative;
  z-index: 2;
  animation: zkHdrWash 40s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite !important;
  border-bottom: 1px solid rgba(255,255,255,.07) !important;
}
#trivis-vx-body {
  position: relative;
  z-index: 2;
}
#trivis-vx-panel.is-expanding {
  animation: zkExpandIn .3s cubic-bezier(.32,.72,0,1) both, zkThemeBreath 40s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite !important;
}
.vx-brand-icon img {
  animation: zkSoftPulse 40s ease-in-out infinite;
}


.vx-ibtn {
  transition: transform .18s ease, background .2s ease, box-shadow .2s ease !important;
}
.vx-ibtn:hover {
  transform: translateY(-1px) scale(1.06);
  box-shadow: 0 0 12px rgba(168,85,247,.35);
}
.vx-ibtn:active { transform: scale(0.94); }
.vx-brand-icon img {
  animation: zkSoftPulse 30s ease-in-out infinite;
}
.zk-brand-duo .z {
  transition: color .3s;
  animation: zkSoftPulse 30s ease-in-out infinite;
}
.zk-brand-duo .t {
  color: #f87171 !important;
}

/* Body content polish */
.vx-card, .vx-feat-card, .zk-card, .zk-wh, .zk-dev-box, .zk-welcome {
  animation: zkFadeUp .4s ease both;
}
.vx-fbtn, .zk-buy, .vx-btn {
  transition: transform .15s ease, box-shadow .2s ease, border-color .2s ease !important;
}
.vx-fbtn:hover, .zk-buy:hover, .vx-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,.25), 0 0 16px rgba(168,85,247,.2);
}
.vx-toggle {
  transition: background .25s ease !important;
}
.vx-toggle .knob {
  transition: transform .25s cubic-bezier(.32,.72,0,1) !important;
}


.vx-brand{
  font-size:11px;font-weight:800;letter-spacing:.08em;padding:0 8px 0 6px;
  border-right:1px solid rgba(255,255,255,.12);margin-right:4px;color:inherit;opacity:.9
}
#trivis-vx-root.light .vx-brand{border-right-color:rgba(15,23,42,.1)}

.vx-ibtn{position:relative;z-index:6;pointer-events:auto!important;
  all:unset;cursor:pointer;width:32px;height:32px;border-radius:11px;
  display:inline-flex;align-items:center;justify-content:center;
  color:rgba(255,255,255,.55);
  transition:transform .28s cubic-bezier(.32,.72,0,1),background .25s ease,color .25s ease,box-shadow .25s ease;
  -webkit-tap-highlight-color:transparent!important;outline:none!important;background:transparent
}
#trivis-vx-root.light .vx-ibtn{color:rgba(15,23,42,.45)}
.vx-ibtn:hover,.vx-ibtn:focus{color:#fff;background:rgba(255,255,255,.12);transform:translateY(-1px) scale(1.06);outline:none!important;box-shadow:none}
#trivis-vx-root.light .vx-ibtn:hover,#trivis-vx-root.light .vx-ibtn:focus{color:#0f172a;background:rgba(15,23,42,.06)}
.vx-ibtn:active{transform:scale(.88)!important;background:rgba(255,255,255,.08)!important}
.vx-ibtn.active-sky{color:#38bdf8;background:var(--vx-sky-soft)}
.vx-ibtn svg{width:17px;height:17px;pointer-events:none;transition:transform .4s cubic-bezier(.32,.72,0,1)}

#trivis-vx-body{padding:12px 12px 14px;overflow:auto;max-height:min(70vh,540px)}
.vx-sheet{animation:vxSheet .55s cubic-bezier(.32,.72,0,1) both}
@keyframes vxSheet{
  from{opacity:0;transform:translateY(28px) scale(.92);filter:blur(8px)}
  to{opacity:1;transform:none;filter:none}
}
@keyframes vxRow{
  from{opacity:0;transform:translateY(10px) scale(.98)}
  to{opacity:1;transform:none}
}
@keyframes vxPulse{
  0%,100%{transform:scale(1);opacity:1}
  50%{transform:scale(1.15);opacity:.7}
}

.vx-card{
  display:flex;align-items:center;gap:12px;padding:13px 12px;margin-bottom:8px;border-radius:16px;
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.1);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  animation:vxRow .42s cubic-bezier(.32,.72,0,1) both;
  transition:transform .25s ease,border-color .25s,background .25s
}
#trivis-vx-root.light .vx-card{
  background:rgba(255,255,255,.72);
  border-color:rgba(15,23,42,.08);
  color:#0f172a;
  box-shadow:0 2px 10px rgba(15,23,42,.04)
}
.vx-card:nth-child(2){animation-delay:.04s}
.vx-card:nth-child(3){animation-delay:.08s}
.vx-card:nth-child(4){animation-delay:.12s}
.vx-card:nth-child(5){animation-delay:.16s}
.vx-card .ic{
  width:38px;height:38px;border-radius:12px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  background:rgba(168,85,247,.14);color:#38bdf8;
  border:1px solid rgba(168,85,247,.2)
}
#trivis-vx-root.light .vx-card .ic{background:rgba(147,51,234,.12);color:#0284c7;border-color:rgba(147,51,234,.2)}
.vx-card .lab{font-size:9px;font-weight:800;letter-spacing:.1em;color:rgba(255,255,255,.42);text-transform:uppercase}
#trivis-vx-root.light .vx-card .lab{color:rgba(15,23,42,.45)}
.vx-card .val{font-size:13px;font-weight:700;margin-top:3px;word-break:break-all;color:inherit;letter-spacing:.01em}
.vx-card .meta{flex:1;min-width:0}

.vx-copy{
  all:unset;cursor:pointer;flex-shrink:0;padding:8px 12px;border-radius:10px;font-size:11px;font-weight:700;
  color:#0c4a6e;background:rgba(168,85,247,.9);
  border:1px solid rgba(255,255,255,.25);
  box-shadow:0 4px 14px rgba(147,51,234,.25);
  transition:transform .22s cubic-bezier(.32,.72,0,1),filter .2s;
  -webkit-tap-highlight-color:transparent
}
.vx-copy:hover{filter:brightness(1.06);transform:scale(1.04)}
.vx-copy:active{transform:scale(.94)}

.vx-actions{display:flex;gap:8px;margin-top:6px;animation:vxRow .45s .14s both}
.vx-btn{
  all:unset;cursor:pointer;flex:1;text-align:center;padding:12px 12px;border-radius:14px;
  font-size:12px;font-weight:700;color:#0c4a6e;
  background:linear-gradient(135deg,rgba(168,85,247,.92),rgba(147,51,234,.88));
  border:1px solid rgba(255,255,255,.22);
  box-shadow:0 8px 22px rgba(147,51,234,.22),0 1px 0 rgba(255,255,255,.25) inset;
  backdrop-filter:blur(8px);
  transition:transform .25s cubic-bezier(.32,.72,0,1),filter .2s,box-shadow .25s;
  -webkit-tap-highlight-color:transparent
}
.vx-btn:hover{filter:brightness(1.05);transform:translateY(-1px);box-shadow:0 12px 28px rgba(147,51,234,.3)}
.vx-btn:active{transform:scale(.96)}

.vx-free{
  position:relative;overflow:hidden;
  display:flex;flex-direction:column;gap:10px;
  padding:14px 14px 12px;border-radius:16px;
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.12);
  backdrop-filter:blur(18px) saturate(160%);
  -webkit-backdrop-filter:blur(18px) saturate(160%);
  box-shadow:0 8px 24px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.1);
}
#trivis-vx-root.light .vx-free{
  background:rgba(255,255,255,.55);
  border-color:rgba(15,23,42,.1);
  box-shadow:0 8px 20px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.7);
}
.vx-free .fr-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.vx-free .fr-lab{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.55}
.vx-free .fr-count{font-size:20px;font-weight:700;letter-spacing:.02em;line-height:1}
.vx-free .fr-count .dim{opacity:.4;font-weight:600;font-size:14px}
.vx-free .fr-track{
  height:6px;border-radius:999px;overflow:hidden;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.06);
}
#trivis-vx-root.light .vx-free .fr-track{background:rgba(15,23,42,.08)}
.vx-free .fr-fill{
  height:100%;border-radius:999px;
  background:linear-gradient(90deg,#38bdf8,#c084fc,#34d399);
  box-shadow:0 0 12px rgba(168,85,247,.35);
  transition:width .45s cubic-bezier(.22,1,.36,1);
}
.vx-free .fr-fill.low{background:linear-gradient(90deg,#fbbf24,#f97316)}
.vx-free .fr-fill.empty{background:linear-gradient(90deg,#f87171,#ef4444);box-shadow:0 0 12px rgba(248,113,113,.3)}
.vx-free .fr-hint{font-size:11px;line-height:1.35;opacity:.55;font-weight:500}
.vx-free .fr-hint.warn{color:#fbbf24;opacity:.9}
.vx-free .fr-hint.ok{color:#34d399;opacity:.9}

.vx-feat-card{
  padding:14px;border-radius:16px;margin-bottom:8px;
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
}
#trivis-vx-root.light .vx-feat-card{
  background:rgba(255,255,255,.5);border-color:rgba(15,23,42,.1);
}
.vx-aa-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
.vx-aa-meta .t{font-size:13px;font-weight:700;letter-spacing:.02em}
.vx-aa-meta .s{font-size:10px;opacity:.5;margin-top:3px;font-weight:500}
.vx-toggle{
  --on:#34d399;position:relative;width:52px;height:30px;border-radius:999px;cursor:pointer;
  border:1px solid rgba(255,255,255,.14);
  background:linear-gradient(180deg,rgba(255,255,255,.1),rgba(0,0,0,.2));
  box-shadow:inset 0 2px 6px rgba(0,0,0,.35),0 1px 0 rgba(255,255,255,.08);
  transition:background .35s cubic-bezier(.22,1,.36,1),border-color .3s,box-shadow .3s;
  flex-shrink:0;
}
.vx-toggle .knob{
  position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;
  background:linear-gradient(145deg,#fff,#d4d4d8);
  box-shadow:0 2px 6px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.9);
  transition:transform .35s cubic-bezier(.22,1,.36,1),background .3s;
}
.vx-toggle.on{
  background:linear-gradient(135deg,rgba(52,211,153,.35),rgba(168,85,247,.25));
  border-color:rgba(52,211,153,.45);
  box-shadow:inset 0 0 12px rgba(52,211,153,.2),0 0 16px rgba(52,211,153,.15);
}
.vx-toggle.on .knob{
  transform:translateX(22px);
  background:linear-gradient(145deg,#ecfdf5,#34d399);
  box-shadow:0 2px 8px rgba(52,211,153,.45),inset 0 1px 0 rgba(255,255,255,.7);
}
.vx-aa-status{margin-top:10px;font-size:11px;font-weight:600;letter-spacing:.06em;
  color:rgba(255,255,255,.4);transition:color .3s}
.vx-aa-status.on{color:#34d399}
.vx-fbtn{
  all:unset;cursor:pointer;display:flex;align-items:center;gap:10px;width:100%;
  margin-top:8px;padding:13px 14px;border-radius:14px;box-sizing:border-box;
  font-size:12px;font-weight:700;letter-spacing:.03em;color:#f4f4f5;
  background:linear-gradient(165deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.04) 40%,rgba(0,0,0,.18) 100%);
  border:1px solid rgba(255,255,255,.14);
  box-shadow:
    0 4px 0 rgba(0,0,0,.35),
    0 8px 20px rgba(0,0,0,.25),
    inset 0 1px 0 rgba(255,255,255,.18),
    inset 0 -1px 0 rgba(0,0,0,.2);
  transform:translateY(0);
  transition:transform .15s ease,box-shadow .15s ease,filter .15s ease;
}
.vx-fbtn:hover{filter:brightness(1.08);transform:translateY(-1px);
  box-shadow:0 5px 0 rgba(0,0,0,.35),0 12px 24px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.22)}
.vx-fbtn.on{border-color:rgba(168,85,247,.45);box-shadow:0 4px 0 rgba(147,51,234,.35),0 8px 20px rgba(168,85,247,.2),inset 0 1px 0 rgba(255,255,255,.2);background:linear-gradient(165deg,rgba(168,85,247,.2),rgba(0,0,0,.2))}
.vx-fbtn:active{transform:translateY(3px);
  box-shadow:0 1px 0 rgba(0,0,0,.35),0 2px 8px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.1)}
.vx-fbtn .fi{
  width:28px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);flex-shrink:0;
}
.vx-fbtn .fi svg{width:15px;height:15px}
.vx-fbtn .fl{display:flex;flex-direction:column;gap:2px;text-align:left}
.vx-fbtn .fl b{font-size:12px;font-weight:700}
.vx-fbtn .fl span{font-size:10px;font-weight:500;opacity:.45}
#trivis-vx-root.light .vx-fbtn{
  color:#0f172a;
  background:linear-gradient(165deg,#fff 0%,#f1f5f9 50%,#e2e8f0 100%);
  border-color:rgba(15,23,42,.1);
  box-shadow:0 4px 0 rgba(15,23,42,.12),0 8px 16px rgba(15,23,42,.08),inset 0 1px 0 #fff;
}
.vx-btn{
  all:unset;cursor:pointer;flex:1;text-align:center;padding:13px 14px;border-radius:14px;box-sizing:border-box;
  font-size:12px;font-weight:700;letter-spacing:.03em;color:#f4f4f5;
  background:linear-gradient(165deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.05) 40%,rgba(0,0,0,.2) 100%);
  border:1px solid rgba(255,255,255,.14);
  box-shadow:
    0 4px 0 rgba(0,0,0,.35),
    0 8px 20px rgba(0,0,0,.25),
    inset 0 1px 0 rgba(255,255,255,.18),
    inset 0 -1px 0 rgba(0,0,0,.2);
  transform:translateY(0);
  transition:transform .15s ease,box-shadow .15s ease,filter .15s ease;
  -webkit-tap-highlight-color:transparent
}
.vx-btn:hover{filter:brightness(1.08);transform:translateY(-1px);
  box-shadow:0 5px 0 rgba(0,0,0,.35),0 12px 24px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.22)}
.vx-btn:active{transform:translateY(3px);
  box-shadow:0 1px 0 rgba(0,0,0,.35),0 2px 8px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.1)}
.vx-btn.ghost{
  color:rgba(255,255,255,.85);
  background:linear-gradient(165deg,rgba(255,255,255,.1) 0%,rgba(255,255,255,.03) 50%,rgba(0,0,0,.15) 100%);
  border:1px solid rgba(255,255,255,.12);
  box-shadow:0 3px 0 rgba(0,0,0,.28),0 6px 14px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.12)
}
#trivis-vx-root.light .vx-btn{
  color:#0f172a;
  background:linear-gradient(165deg,#fff 0%,#f1f5f9 50%,#e2e8f0 100%);
  border-color:rgba(15,23,42,.1);
  box-shadow:0 4px 0 rgba(15,23,42,.12),0 8px 16px rgba(15,23,42,.08),inset 0 1px 0 #fff
}
#trivis-vx-root.light .vx-btn.ghost{
  color:#0f172a;
  background:linear-gradient(165deg,rgba(255,255,255,.9),rgba(241,245,249,.85));
  border-color:rgba(15,23,42,.1)
}
.vx-copy{
  all:unset;cursor:pointer;padding:8px 12px;border-radius:10px;font-size:11px;font-weight:700;
  color:#f4f4f5;
  background:linear-gradient(165deg,rgba(255,255,255,.12),rgba(0,0,0,.15));
  border:1px solid rgba(255,255,255,.14);
  box-shadow:0 3px 0 rgba(0,0,0,.3),0 4px 10px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.15);
  transition:transform .15s,box-shadow .15s
}
.vx-copy:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.3)}
.vx-copy.is-copied{color:#34d399}



.vx-btn.ghost{
  color:inherit;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.12);
  box-shadow:none
}
#trivis-vx-root.light .vx-btn.ghost{
  background:rgba(15,23,42,.04);
  border-color:rgba(15,23,42,.1);
  color:#0f172a
}

.vx-foot{display:flex;align-items:center;margin-top:12px;font-size:11px;color:rgba(255,255,255,.4);animation:vxRow .4s .2s both}
#trivis-vx-root.light .vx-foot{color:rgba(15,23,42,.4)}
.vx-dot{width:7px;height:7px;border-radius:50%;background:#34d399;display:inline-block;margin-right:6px;box-shadow:0 0 10px #34d399;animation:vxPulse 2s ease infinite}

.vx-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.vx-scard{
  border-radius:18px;min-height:112px;padding:14px;display:flex;flex-direction:column;justify-content:flex-end;
  border:1px solid rgba(255,255,255,.12);
  backdrop-filter:blur(16px);
  animation:vxSheet .5s cubic-bezier(.32,.72,0,1) both;
  transition:transform .3s cubic-bezier(.32,.72,0,1),box-shadow .3s
}
.vx-scard:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 14px 32px rgba(0,0,0,.28)}
.vx-scard:nth-child(1){background:linear-gradient(160deg,rgba(244,63,94,.22),rgba(20,12,18,.55));animation-delay:.02s}
.vx-scard:nth-child(2){background:linear-gradient(160deg,rgba(99,102,241,.25),rgba(14,16,32,.55));animation-delay:.06s}
.vx-scard:nth-child(3){background:linear-gradient(160deg,rgba(239,68,68,.22),rgba(24,10,10,.55));animation-delay:.1s}
.vx-scard:nth-child(4){background:linear-gradient(160deg,rgba(168,85,247,.22),rgba(10,18,28,.55));animation-delay:.14s}
#trivis-vx-root.light .vx-scard{border-color:rgba(15,23,42,.08)}
.vx-scard .name{font-size:13px;font-weight:800;color:#fff}
.vx-scard .sub{font-size:10px;color:rgba(255,255,255,.7);margin:2px 0 8px}
.vx-scard a.cta{
  all:unset;cursor:pointer;align-self:flex-start;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:700;
  background:rgba(255,255,255,.92);color:#0f172a;transition:transform .22s;-webkit-tap-highlight-color:transparent
}
.vx-scard a.cta:hover{transform:scale(1.05)}


/* Zokys shop cards */

.zk-chat-wrap{padding:4px 2px 8px}
.zk-chat-head{text-align:center;margin-bottom:12px}
.zk-chat-title{font-size:15px;font-weight:800;background:linear-gradient(135deg,#e9d5ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.zk-chat-sub{font-size:10px;opacity:.55;margin-top:4px;line-height:1.35}
.zk-chat-input{
  width:100%;box-sizing:border-box;min-height:96px;resize:vertical;padding:12px 12px;border-radius:14px;
  border:1px solid rgba(168,85,247,.35);background:rgba(12,8,24,.85);color:#f5f3ff;font-size:13px;
  font-family:Inter,-apple-system,sans-serif;outline:none;margin-bottom:10px
}
.zk-chat-input:focus{border-color:rgba(192,132,252,.7);box-shadow:0 0 0 3px rgba(168,85,247,.15)}
.zk-chat-send{
  all:unset;box-sizing:border-box;display:block;width:100%;text-align:center;cursor:pointer;
  padding:12px 14px;border-radius:12px;font-size:13px;font-weight:800;color:#fff;
  background:linear-gradient(135deg,#9333ea,#a855f7 50%,#c084fc);
  box-shadow:0 8px 22px rgba(147,51,234,.35);margin-bottom:8px
}
.zk-chat-send:disabled{opacity:.55;cursor:wait}
.zk-chat-status{font-size:11px;text-align:center;min-height:16px;margin-bottom:10px;opacity:.8}
.zk-chat-status.zk-busy{color:#c4b5fd}
.zk-chat-status.zk-ok{color:#86efac}
.zk-chat-status.zk-fail{color:#f87171}
.zk-chat-hist-label{font-size:10px;font-weight:700;letter-spacing:.08em;opacity:.45;margin:4px 0 8px;text-transform:uppercase}
.zk-chat-hist{max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:8px}
.zk-hist-item{padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04)}
.zk-hist-ok{border-color:rgba(52,211,153,.25)}
.zk-hist-fail{border-color:rgba(248,113,113,.4);background:rgba(127,29,29,.2)}
.zk-hist-text{font-size:12px;line-height:1.4;color:#e9d5ff;word-break:break-word}
.zk-hist-fail .zk-hist-text{color:#fecaca}
.zk-hist-meta{font-size:10px;margin-top:6px;opacity:.65}
.zk-hist-fail .zk-hist-meta{color:#f87171;opacity:1;font-weight:700}
.zk-hist-empty{font-size:11px;opacity:.45;text-align:center;padding:12px}

.zk-shop-head{padding:4px 4px 12px;text-align:center}
.zk-shop-title{font-size:15px;font-weight:800;letter-spacing:.04em;background:linear-gradient(135deg,#e9d5ff,#c084fc 40%,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.zk-shop-sub{font-size:11px;opacity:.55;margin-top:4px}

.zk-card-glass-v3{}
.zk-card{
  position:relative;border-radius:20px!important;padding:16px 14px 14px!important;margin:0 0 12px!important;
  background:linear-gradient(145deg,rgba(255,255,255,.14),rgba(255,255,255,.04))!important;
  border:1px solid rgba(255,255,255,.22)!important;
  backdrop-filter:blur(20px) saturate(180%)!important;-webkit-backdrop-filter:blur(20px) saturate(180%)!important;
  box-shadow:0 16px 40px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.25),0 0 0 1px rgba(124,58,237,.08)!important;
  transform:perspective(800px) rotateX(2deg);transition:transform .25s ease,box-shadow .25s ease;
}
.zk-card.featured{
  border-color:rgba(196,181,253,.45)!important;
  box-shadow:0 20px 50px rgba(124,58,237,.35),inset 0 1px 0 rgba(255,255,255,.3),0 0 24px rgba(168,85,247,.2)!important;
}
.zk-card:active{transform:perspective(800px) rotateX(0deg) scale(.98)}
.zk-price{
  font-size:28px!important;font-weight:900!important;letter-spacing:-.03em!important;
  background:linear-gradient(120deg,#fff,#e9d5ff 40%,#a5b4fc 80%)!important;
  -webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important;
  filter:drop-shadow(0 4px 12px rgba(168,85,247,.35));
}
.zk-dur{font-size:11px!important;font-weight:700!important;color:rgba(255,255,255,.55)!important;margin:2px 0 10px!important}
.zk-tag{
  font-size:9px!important;font-weight:900!important;letter-spacing:.14em!important;
  padding:4px 8px!important;border-radius:999px!important;
  background:rgba(255,255,255,.1)!important;border:1px solid rgba(255,255,255,.15)!important;color:#e9d5ff!important;
}
.zk-hot{background:linear-gradient(90deg,#f472b6,#a78bfa)!important;color:#fff!important;border:none!important}
.zk-feats{list-style:none!important;padding:0!important;margin:0 0 12px!important}
.zk-feats li{font-size:11px!important;color:rgba(255,255,255,.7)!important;margin:0 0 6px!important;display:flex;gap:6px;align-items:flex-start}
.zk-card button,.zk-card .zk-buy{
  width:100%!important;height:42px!important;border:none!important;border-radius:14px!important;
  font-weight:900!important;font-size:12px!important;letter-spacing:.04em!important;color:#fff!important;cursor:pointer!important;
  background:linear-gradient(135deg,#7c3aed,#a855f7 50%,#6366f1)!important;
  box-shadow:0 10px 24px rgba(124,58,237,.4),inset 0 1px 0 rgba(255,255,255,.35)!important;
  transform:translateY(0);transition:transform .15s,box-shadow .15s;
}
.zk-card button:active,.zk-card .zk-buy:active{transform:translateY(2px);box-shadow:0 4px 12px rgba(124,58,237,.3)!important}

.zk-card{
  position:relative;padding:16px 14px 14px;border-radius:18px;margin-bottom:12px;
  background:linear-gradient(145deg,rgba(40,20,70,.75),rgba(18,12,32,.9));
  border:1px solid rgba(168,85,247,.28);
  box-shadow:0 0 0 1px rgba(255,255,255,.04) inset,0 12px 32px rgba(88,28,135,.25),0 0 24px var(--glow,rgba(168,85,247,.2));
  animation:vxRow .45s cubic-bezier(.32,.72,0,1) both;animation-delay:calc(var(--i,0)*.06s);
  overflow:hidden
}
.zk-card::before{
  content:"";position:absolute;inset:-40% -20% auto auto;width:120px;height:120px;border-radius:50%;
  background:radial-gradient(circle,var(--glow,rgba(168,85,247,.35)),transparent 70%);pointer-events:none
}
.zk-card.featured{
  border-color:rgba(192,132,252,.55);
  transform:scale(1.02);
  box-shadow:0 0 0 1px rgba(192,132,252,.2) inset,0 16px 40px rgba(126,34,206,.4),0 0 40px rgba(168,85,247,.3)
}
.zk-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;position:relative;z-index:1}
.zk-tag{
  font-size:9px;font-weight:800;letter-spacing:.12em;padding:4px 8px;border-radius:999px;
  background:rgba(168,85,247,.2);color:#e9d5ff;border:1px solid rgba(168,85,247,.35)
}
.zk-hot{
  font-size:9px;font-weight:800;padding:3px 7px;border-radius:999px;
  background:linear-gradient(135deg,#f472b6,#a855f7);color:#fff
}
.zk-price{font-size:26px;font-weight:900;letter-spacing:-.03em;color:#faf5ff;position:relative;z-index:1;line-height:1.1}
.zk-dur{font-size:11px;opacity:.55;margin:2px 0 10px;position:relative;z-index:1}
.zk-feats{list-style:none;margin:0 0 12px;padding:0;position:relative;z-index:1}
.zk-feats li{font-size:11px;opacity:.8;padding:3px 0;display:flex;align-items:center;gap:6px}
.zk-check{color:#c084fc;font-weight:800}
.zk-buy{
  all:unset;box-sizing:border-box;display:block;width:100%;text-align:center;cursor:pointer;
  padding:12px 14px;border-radius:12px;font-size:12px;font-weight:800;color:#fff;
  background:linear-gradient(135deg,#9333ea,#a855f7 50%,#c084fc);
  box-shadow:0 8px 20px rgba(147,51,234,.35);transition:transform .15s ease,box-shadow .15s
}
.zk-buy:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(147,51,234,.45)}
.vx-plan{
  display:flex;align-items:center;justify-content:space-between;padding:13px 12px;border-radius:16px;margin-bottom:8px;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
  animation:vxRow .4s cubic-bezier(.32,.72,0,1) both
}
#trivis-vx-root.light .vx-plan{background:rgba(255,255,255,.75);border-color:rgba(15,23,42,.08);color:#0f172a}
.vx-plan:nth-child(2){animation-delay:.05s}.vx-plan:nth-child(3){animation-delay:.1s}.vx-plan:nth-child(4){animation-delay:.15s}
.vx-plan .p{font-weight:800;font-size:15px}.vx-plan .l{font-size:11px;opacity:.55;margin-top:2px}
.vx-plan button{
  all:unset;cursor:pointer;padding:9px 14px;border-radius:11px;font-size:11px;font-weight:700;color:#1e1b4b;
  background:linear-gradient(135deg,rgba(192,132,252,.95),rgba(147,51,234,.9))
;
  border:1px solid rgba(255,255,255,.25);transition:transform .22s;-webkit-tap-highlight-color:transparent
}
.vx-plan button:hover{transform:scale(1.05)}

.vx-lang button{
  all:unset;cursor:pointer;display:block;width:100%;padding:12px 14px;margin-bottom:6px;border-radius:14px;
  font-size:13px;font-weight:600;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);
  color:inherit;animation:vxRow .35s both;transition:transform .25s cubic-bezier(.32,.72,0,1),background .2s,border-color .2s;
  -webkit-tap-highlight-color:transparent
}
#trivis-vx-root.light .vx-lang button{background:rgba(255,255,255,.7);border-color:rgba(15,23,42,.08);color:#0f172a}
.vx-lang button:nth-child(n){animation-delay:calc(var(--i,0)*.04s)}
.vx-lang button:hover{transform:translateX(5px);background:rgba(168,85,247,.12);border-color:rgba(168,85,247,.3)}
.vx-lang button.active{border-color:rgba(168,85,247,.5);background:rgba(168,85,247,.15);color:#7dd3fc}
#trivis-vx-root.light .vx-lang button.active{color:#0369a1;background:rgba(147,51,234,.12)}

.vx-toast{
  pointer-events:none;position:fixed;left:50%;bottom:100px;transform:translateX(-50%) translateY(12px) scale(.96);
  padding:11px 16px;border-radius:16px;font-size:12px;font-weight:650;color:#f8fafc;
  background:rgba(15,23,42,.72);border:1px solid rgba(255,255,255,.14);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  opacity:0;transition:opacity .35s,transform .4s cubic-bezier(.32,.72,0,1);z-index:2147483647
}
.vx-toast.show{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}

#ql-floating,#trivis-fab,#trivis-fab-root,[data-trivis-fab],.sp-extension-fab,div[id*="ql-float"],
#last-zone-floating-btn,#last-zone-floating-window,[id*="last-zone-floating"],
[class*="last-zone-floating"],[id*="floating-btn"],[class*="floating-btn"]{
  display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;
  left:-9999px!important;width:0!important;height:0!important;overflow:hidden!important
}



#trivis-vx-root.light #trivis-vx-panel,
#trivis-vx-root[data-theme="light"] #trivis-vx-panel{
  color:#0f172a !important;
  background:rgba(255,255,255,.72) !important;
  border-color:rgba(15,23,42,.12) !important;
  box-shadow:0 16px 40px rgba(0,0,0,.14),0 0 0 0.5px rgba(255,255,255,.8) inset !important;
}
#trivis-vx-root.light .vx-ibtn,
#trivis-vx-root[data-theme="light"] .vx-ibtn{color:rgba(15,23,42,.5) !important}
#trivis-vx-root.light .vx-brand,
#trivis-vx-root[data-theme="light"] .vx-brand{color:#0f172a !important;border-right-color:rgba(15,23,42,.12) !important}
#trivis-vx-root.light #trivis-vx-header,
#trivis-vx-root[data-theme="light"] #trivis-vx-header{
  background:linear-gradient(180deg,rgba(255,255,255,.65),rgba(255,255,255,.35)) !important;
  border-bottom-color:rgba(15,23,42,.08) !important;
}
#trivis-vx-panel.vx-light{
  color:#0f172a !important;
  background:rgba(255,255,255,.72) !important;
}

/* === HIGH-END PC MOTION (design unchanged) === */
#trivis-vx-root *,#trivis-vx-root *::before,#trivis-vx-root *::after{
  -webkit-tap-highlight-color:transparent!important;
}
#trivis-vx-panel{
  transition:
    width .38s cubic-bezier(.16,1,.3,1),
    border-radius .34s cubic-bezier(.16,1,.3,1),
    box-shadow .34s cubic-bezier(.16,1,.3,1),
    transform .34s cubic-bezier(.16,1,.3,1)!important;
}
#trivis-vx-panel.dragging{
  transition:none!important;
}
#trivis-vx-body{
  transition:opacity .32s cubic-bezier(.16,1,.3,1),transform .32s cubic-bezier(.16,1,.3,1);
}
#trivis-vx-panel.is-collapsing #trivis-vx-body{
  opacity:0!important;
  transform:translateY(8px) scale(.98)!important;
  pointer-events:none!important;
}
#trivis-vx-panel.is-expanding #trivis-vx-body{
  animation:vxSheetIn .36s cubic-bezier(.16,1,.3,1) both!important;
}
@keyframes vxSheetIn{
  from{opacity:0;transform:translateY(14px) scale(.97);filter:blur(4px)}
  to{opacity:1;transform:none;filter:none}
}
@keyframes vxSheet{
  from{opacity:0;transform:translateY(12px) scale(.98)}
  to{opacity:1;transform:none}
}
@keyframes vxRow{
  from{opacity:0;transform:translateY(8px)}
  to{opacity:1;transform:none}
}
@keyframes vxIconPop{
  0%{transform:scale(.92)}
  60%{transform:scale(1.06)}
  100%{transform:scale(1)}
}
@keyframes vxShimmer{
  0%{background-position:0% 50%}
  100%{background-position:100% 50%}
}
.vx-sheet{animation:vxSheetIn .36s cubic-bezier(.16,1,.3,1) both!important}
.vx-ibtn{
  transition:
    transform .2s cubic-bezier(.16,1,.3,1),
    background .2s cubic-bezier(.16,1,.3,1),
    color .2s cubic-bezier(.16,1,.3,1),
    box-shadow .22s cubic-bezier(.16,1,.3,1),
    filter .2s cubic-bezier(.16,1,.3,1)!important;
  will-change:transform,filter;
}
.vx-ibtn:hover,.vx-ibtn:focus{
  transform:translateY(-2px) scale(1.1)!important;
  filter:brightness(1.15) drop-shadow(0 4px 10px rgba(255,255,255,.12))!important;
}
.vx-ibtn:active{
  transform:translateY(0) scale(.94)!important;
  filter:brightness(1)!important;
  transition-duration:.09s!important;
}
.vx-ibtn svg{
  transition:transform .28s cubic-bezier(.16,1,.3,1)!important;
}
.vx-ibtn:hover svg{
  transform:scale(1.06)!important;
}
.vx-btn{
  transition:
    transform .2s cubic-bezier(.16,1,.3,1),
    filter .2s cubic-bezier(.16,1,.3,1),
    box-shadow .28s cubic-bezier(.16,1,.3,1)!important;
  will-change:transform,filter;
}
.vx-btn:hover{
  transform:translateY(-2px) scale(1.02)!important;
  filter:brightness(1.08)!important;
  box-shadow:0 12px 28px rgba(0,0,0,.28)!important;
}
.vx-btn:active{
  transform:translateY(0) scale(.975)!important;
  transition-duration:.09s!important;
}
.vx-copy{
  transition:
    transform .2s cubic-bezier(.16,1,.3,1),
    filter .2s cubic-bezier(.16,1,.3,1),
    opacity .2s ease!important;
  will-change:transform;
}
.vx-copy:hover{
  transform:translateY(-1.5px) scale(1.04)!important;
  filter:brightness(1.08)!important;
}
.vx-copy:active{
  transform:scale(.96)!important;
  transition-duration:.09s!important;
}
.vx-copy.is-copied{
  animation:vxIconPop .5s cubic-bezier(.16,1,.3,1)!important;
}
.vx-card{
  transition:
    transform .26s cubic-bezier(.16,1,.3,1),
    border-color .26s ease,
    background .26s ease,
    box-shadow .26s cubic-bezier(.16,1,.3,1)!important;
}
.vx-card:hover{
  transform:translateY(-2px)!important;
  box-shadow:0 10px 24px rgba(0,0,0,.18)!important;
}
.vx-scard{
  transition:
    transform .28s cubic-bezier(.16,1,.3,1),
    box-shadow .28s cubic-bezier(.16,1,.3,1),
    filter .22s ease!important;
  will-change:transform;
}
.vx-scard:hover{
  transform:translateY(-3px) scale(1.025)!important;
  filter:brightness(1.06)!important;
  box-shadow:0 16px 36px rgba(0,0,0,.3)!important;
}
.vx-scard a.cta{
  transition:transform .2s cubic-bezier(.16,1,.3,1),filter .2s ease!important;
}
.vx-scard a.cta:hover{transform:scale(1.05)!important}
.vx-scard a.cta:active{transform:scale(.96)!important}
.vx-plan{
  transition:transform .26s cubic-bezier(.16,1,.3,1),box-shadow .26s ease,border-color .2s ease!important;
}
.vx-plan:hover{
  transform:translateY(-2px)!important;
  box-shadow:0 10px 22px rgba(0,0,0,.16)!important;
}
.vx-plan button{
  transition:transform .2s cubic-bezier(.16,1,.3,1),filter .2s ease!important;
}
.vx-plan button:hover{
  transform:translateY(-1.5px) scale(1.04)!important;
  filter:brightness(1.06)!important;
}
.vx-plan button:active{transform:scale(.96)!important}
.vx-lang button{
  transition:transform .22s cubic-bezier(.16,1,.3,1),background .2s ease,border-color .2s ease!important;
}
.vx-lang button:hover{transform:translateX(5px)!important}
.vx-lang button:active{transform:translateX(2px) scale(.99)!important}
.vx-toast{
  transition:opacity .24s cubic-bezier(.16,1,.3,1),transform .28s cubic-bezier(.16,1,.3,1)!important;
}
.vx-toast.show{
  opacity:1!important;
  transform:translateX(-50%) translateY(0) scale(1)!important;
}
/* staggered card entrance refinement */
.vx-card:nth-child(1){animation-delay:0s}
.vx-card:nth-child(2){animation-delay:.04s}
.vx-card:nth-child(3){animation-delay:.08s}
.vx-card:nth-child(4){animation-delay:.12s}
.vx-card:nth-child(5){animation-delay:.16s}
@media (prefers-reduced-motion:reduce){
  #trivis-vx-root *,#trivis-vx-root *::before,#trivis-vx-root *::after{
    animation-duration:.01ms!important;
    animation-iteration-count:1!important;
    transition-duration:.01ms!important;
  }
}
`;
  }

  function svg(n) {
    const m = {
      chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
      lang: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg>',
      social: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
      download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
      theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>',
      chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>',
      features: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
      key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="15" r="4"/><path d="M12 15h9v-3h-3v-3h-3v3"/></svg>',
      keyCard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="15" r="4"/><path d="M12 15h9v-3h-3v-3h-3v3"/></svg>',
      clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
      pulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
      sync: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c-2 0-4-4-4-9s2-9 4-9m0 18c2 0 4-4 4-9s-2-9-4-9"/></svg>'
    };
    return m[n] || "";
  }

  function toast(msg) {
    let el = document.getElementById("trivis-vx-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "trivis-vx-toast";
      el.className = "vx-toast";
      document.documentElement.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function formatLeft(ms) {
    if (!ms || ms <= 0) return "0:00";
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (d > 0) return d + "d " + h + "h";
    if (h > 0) return h + ":" + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
    return m + ":" + String(sec).padStart(2, "0");
  }

  function detectProjectSync() {
    try {
      const href = location.href || "";
      const m = href.match(/\/projects\/([0-9a-fA-F-]{8,})/i);
      if (m && m[1]) return { synced: true };
      const el = document.querySelector("[data-project-id],[data-projectid]");
      if (el) return { synced: true };
      return { synced: false };
    } catch (_) {
      return { synced: false };
    }
  }

  function getLicense(cb) {
    try {
      chrome.runtime.sendMessage({ type: "TRIVIS_STATUS" }, function (r) {
        if (chrome.runtime.lastError || !r) {
          chrome.storage.local.get(["trivis_lic_ok", "trivis_license_key", "trivis_lic_expires"], function (s) {
            const ok = !!(s && (s.trivis_lic_ok === true || s.trivis_lic_ok === "1") && s.trivis_license_key);
            let status = t("none"), left = "—";
            if (ok) {
              status = t("valid");
              if (s.trivis_lic_expires) {
                const exp = Date.parse(s.trivis_lic_expires);
                if (exp && Date.now() > exp) status = t("expired");
                else if (exp) left = formatLeft(exp - Date.now());
              }
            }
            cb({ ok, key: s && s.trivis_license_key, status, left });
          });
          return;
        }
        let status = r.ok ? t("valid") : t("none"), left = "—";
        if (r.ok && r.expires_at) {
          const exp = Date.parse(r.expires_at);
          if (exp && Date.now() > exp) status = t("expired");
          else if (exp) left = formatLeft(exp - Date.now());
        }
        cb({ ok: !!r.ok, key: r.key, status, left });
      });
    } catch (_) {
      cb({ ok: false, key: null, status: t("none"), left: "—" });
    }
  }

  function setBody(html) {
    bodyEl.innerHTML = '<div class="vx-sheet">' + html + "</div>";
  }

  function expand(on) {
    const chev = panel.querySelector('[data-act="chev"]');
    const want = !!on;
    const isMin = panel.classList.contains("minimized");
    // Sync flag with real class (fixes stuck expand)
    if (isMin) expanded = false;
    else if (!panel.classList.contains("is-collapsing")) expanded = true;

    if (want && !isMin && expanded && !panel.classList.contains("is-collapsing")) {
      if (chev) chev.style.transform = "rotate(0deg)";
      try {
        bodyEl.style.display = "";
      } catch (_) {}
      return;
    }
    if (!want && isMin) {
      if (chev) chev.style.transform = "rotate(180deg)";
      return;
    }

    if (want) {
      panel.classList.remove("is-collapsing");
      try {
        panel.classList.remove("light");
        root.classList.remove("light");
      } catch (_e) {}
      panel.classList.add("is-expanding");
      /* ZOKYS_FAN_EXPAND */
      setTimeout(function () { try { panel.classList.remove("is-expanding"); } catch (_) {} }, 750);
      panel.classList.remove("minimized");
      expanded = true;
      try {
        bodyEl.style.display = "";
        bodyEl.style.visibility = "visible";
        bodyEl.style.opacity = "1";
        bodyEl.style.pointerEvents = "auto";
      } catch (_) {}
      if (chev) chev.style.transform = "rotate(0deg)";
      clearTimeout(panel._expandT);
      panel._expandT = setTimeout(function () {
        panel.classList.remove("is-expanding");
      }, 800);
    } else {
      panel.classList.remove("is-expanding");
      panel.classList.add("is-collapsing");
      /* ZOKYS_FAN_COLLAPSE */
      if (chev) chev.style.transform = "rotate(180deg)";
      clearTimeout(panel._expandT);
      panel._expandT = setTimeout(function () {
        panel.classList.add("minimized");
        panel.classList.remove("is-collapsing");
        expanded = false;
      }, 240);
    }
  }


  let autoApprove = false;
  let autoApproveObs = null;

  function sendToLovableChat(promptText) {
    try {
      window.postMessage({ type: "TRIVIS_SEND_CHAT", text: String(promptText || "") }, "*");
    } catch (e) {
      console.warn("[Zokys] send chat", e);
    }
    toast("Prompt sent → Lovable");
  }

    function startAutoApprove() {
    stopAutoApprove();
    function isOurUi(el) {
      return !!(el.closest && (el.closest("#trivis-vx-root") || el.closest("#trivis-pro-gate") || el.closest("#trivis-limit-overlay")));
    }
    function labelOf(b) {
      return ((b.getAttribute("aria-label") || "") + " " + (b.textContent || "") + " " + (b.getAttribute("title") || "")).replace(/\s+/g, " ").trim();
    }
    function tryAutoApprove() {
      if (!autoApprove) return;
      try {
        // 1) Prefer selecting first radio / option in approval cards
        const radios = document.querySelectorAll('input[type="radio"]');
        let radioGroupDone = {};
        radios.forEach(function (r) {
          if (isOurUi(r) || r.disabled) return;
          const name = r.name || r.id || "x";
          if (radioGroupDone[name]) return;
          if (!r.checked) {
            try {
              r.click();
              r.checked = true;
              r.dispatchEvent(new Event("change", { bubbles: true }));
              r.dispatchEvent(new Event("input", { bubbles: true }));
            } catch (_) {}
          }
          radioGroupDone[name] = true;
        });

        // 2) Click primary action buttons
        const buttons = document.querySelectorAll("button, [role='button'], a");
        let clicked = false;
        buttons.forEach(function (b) {
          if (clicked || b.dataset.trivisAa === "1" || b.disabled) return;
          if (isOurUi(b)) return;
          const t = labelOf(b);
          if (!t || t.length > 64) return;
          // Skip "Skip" / cancel / dismiss
          if (/^(skip|cancel|dismiss|close|no|reject)$/i.test(t)) return;
          if (/\b(skip|cancel|dismiss)\b/i.test(t) && !/\bsubmit\b/i.test(t)) return;
          const isPrimary =
            /^(submit|approve|allow|accept|confirm|continue|yes|run|execute|apply|ok|done)$/i.test(t) ||
            /\b(approve|allow changes|accept|confirm|run tool|submit)\b/i.test(t);
          if (!isPrimary) return;
          b.dataset.trivisAa = "1";
          clicked = true;
          setTimeout(function () {
            try { b.click(); } catch (_) {}
          }, 350);
        });
      } catch (_) {}
    }
    autoApproveObs = new MutationObserver(function () {
      tryAutoApprove();
    });
    try {
      autoApproveObs.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    } catch (_) {}
    // also poll — Lovable sometimes updates without useful mutations
    try {
      autoApproveObs._poll = setInterval(tryAutoApprove, 700);
    } catch (_) {}
    tryAutoApprove();
  }
  function stopAutoApprove() {
    if (autoApproveObs) {
      try { if (autoApproveObs._poll) clearInterval(autoApproveObs._poll); } catch (_) {}
      try { autoApproveObs.disconnect(); } catch (_) {}
      autoApproveObs = null;
    }
  }

  function downloadProjectSource() {
    toast("Scanning project…");
    try {
      window.postMessage({ type: "TRIVIS_TRY_DOWNLOAD_SOURCE" }, "*");
    } catch (_) {}
    setTimeout(function () {
      sendToLovableChat(
        "Please export and provide a complete downloadable ZIP of this project's full source code, " +
        "including all files and folders exactly as in the project (frontend, backend, config, assets). " +
        "If a Download ZIP button exists, point me to it; otherwise generate the full file tree and contents for archive."
      );
    }, 1200);
  }

  const PROMPT_WATERMARK =
    "Remove every Lovable watermark, badge, 'Edit with Lovable' link, lovable.dev branding, and any " +
    "Lovable attribution from this project — UI, HTML, footer, meta tags, and published site. " +
    "Search the whole codebase for lovable / 'edit with lovable' / badge components and delete them. " +
    "Ensure the live preview and production build show zero Lovable branding. Keep all other design intact.";

  const PROMPT_CLOUD =
    "Enable Supabase cloud for this project properly end-to-end: create/connect Supabase project, " +
    "configure env keys securely (never expose service role on client), set up auth if needed, " +
    "wire database tables the app requires, and verify cloud connection works in preview. " +
    "Document any required dashboard steps briefly in a comment only if unavoidable.";

  const PROMPT_SECURITY =
    "Perform a full security audit and harden this project completely.\\n\\n" +
    "1) Scan every file for weak points: XSS, CSRF, open redirects, insecure storage, " +
    "missing auth checks, overly permissive CORS, prototype pollution, dependency risks.\\n" +
    "2) Move any API keys, tokens, endpoint secrets, and private URLs off the frontend into " +
    "backend/edge functions / Supabase secrets / env — never ship secrets in client bundles.\\n" +
    "3) Fix each issue with production-safe code; do not leave TODOs.\\n" +
    "4) Tighten input validation, auth guards, RLS policies if Supabase is used, and error handling " +
    "so crashes and data leaks cannot happen.\\n" +
    "5) After fixes, summarize what was vulnerable and what you changed. Goal: no easy hacks, no secret leaks, stable app.";

  function showFeatures() {
    expand(true);
    try {
      chrome.storage.local.get(["trivis_auto_approve"], function (s) {
        autoApprove = !!s.trivis_auto_approve;
        renderFeatures();
      });
    } catch (_) {
      renderFeatures();
    }
  }

  let selectedMethod = "1";

  
  
  function syncZokysCredits(lic) {
    try {
      var n = 0;
      if (lic && typeof lic.credits === "number") n = lic.credits;
      else if (lic && lic.license && typeof lic.license.credits === "number") n = lic.license.credits;
      else {
        try {
          n = parseInt(localStorage.getItem("zokys_ext_credits") || "20", 10); if (isNaN(n)) n = 20; if (n > 20 && !lic) n = 20;
        } catch (_) { n = 100; }
      }
      localStorage.setItem("zokys_ext_credits", String(n));
      localStorage.setItem("trivis_ext_credits", String(n));
      try { chrome.storage.local.set({ zokys_ext_credits: n }); } catch (_) {}
      return n;
    } catch (_) { return 0; }
  }


  function showAccountSwitchModal() {
    var existing = document.getElementById("zokys-switch-modal");
    if (existing) existing.remove();
    var ov = document.createElement("div");
    ov.id = "zokys-switch-modal";
    ov.innerHTML = [
      '<style>',
      '.zk-sw-back{width:100%;margin:10px 0 0;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#e9d5ff;font-weight:800;font-size:12px;cursor:pointer;backdrop-filter:blur(12px);}#zokys-switch-modal{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;',
      'padding:20px;font-family:Inter,system-ui,-apple-system,sans-serif;',
      'background:rgba(4,2,12,.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}',
      '#zokys-switch-modal .zk-sw-card{position:relative;width:min(420px,100%);overflow:hidden;border-radius:24px;',
      'background:linear-gradient(160deg,rgba(28,16,48,.97),rgba(18,10,32,.98));',
      'border:1px solid rgba(168,85,247,.4);box-shadow:0 28px 80px rgba(76,29,149,.45),0 0 0 1px rgba(255,255,255,.04) inset;',
      'padding:26px 22px 22px;color:#f5f3ff;}',
      '#zokys-switch-modal .zk-sw-orb{position:absolute;border-radius:50%;filter:blur(40px);pointer-events:none;}',
      '#zokys-switch-modal .zk-sw-orb.a{width:160px;height:160px;top:-50px;right:-40px;background:rgba(147,51,234,.4);}',
      '#zokys-switch-modal .zk-sw-orb.b{width:120px;height:120px;bottom:-30px;left:-30px;background:rgba(185,28,28,.28);}',
      '#zokys-switch-modal .zk-sw-badge{position:relative;display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:900;',
      'letter-spacing:.14em;padding:5px 12px;border-radius:999px;margin-bottom:12px;',
      'background:linear-gradient(135deg,rgba(147,51,234,.3),rgba(185,28,28,.15));border:1px solid rgba(196,181,253,.35);}',
      '#zokys-switch-modal .zk-sw-badge .z{color:#c4b5fd}#zokys-switch-modal .zk-sw-badge .x{color:rgba(255,255,255,.35)}',
      '#zokys-switch-modal .zk-sw-badge .t{color:#fca5a5}',
      '#zokys-switch-modal h3{position:relative;margin:0 0 6px;font-size:20px;font-weight:900;letter-spacing:.02em;',
      'background:linear-gradient(100deg,#fff,#ddd6fe,#fecaca);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}',
      '#zokys-switch-modal .zk-sw-sub{position:relative;font-size:12px;line-height:1.55;color:rgba(226,232,240,.7);margin-bottom:16px;}',
      '#zokys-switch-modal label{position:relative;display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;',
      'color:#a78bfa;margin-bottom:6px;}',
      '#zokys-switch-modal .zk-sw-opt{font-weight:600;color:rgba(167,139,250,.7);text-transform:none;letter-spacing:0;}',
      '#zokys-switch-modal input{position:relative;width:100%;box-sizing:border-box;padding:13px 14px;border-radius:14px;',
      'border:1px solid rgba(168,85,247,.35);background:rgba(10,6,20,.85);color:#fff;font-size:13px;outline:none;',
      'margin-bottom:8px;transition:border-color .2s,box-shadow .2s;}',
      '#zokys-switch-modal input:focus{border-color:rgba(192,132,252,.7);box-shadow:0 0 0 3px rgba(147,51,234,.2);}',
      '#zokys-switch-modal .zk-sw-hint{position:relative;font-size:11px;color:rgba(148,163,184,.75);margin-bottom:12px;line-height:1.4;}',
      '#zokys-switch-modal .zk-sw-stats{position:relative;display:flex;gap:8px;margin-bottom:14px;}',
      '#zokys-switch-modal .zk-sw-pill{flex:1;padding:10px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);text-align:center;}',
      '#zokys-switch-modal .zk-sw-pill b{display:block;font-size:14px;color:#e9d5ff;margin-bottom:2px;}',
      '#zokys-switch-modal .zk-sw-pill span{font-size:10px;opacity:.55;}',
      '#zokys-switch-modal #zokys-switch-status{position:relative;font-size:11px;min-height:18px;margin-bottom:12px;color:#c4b5fd;}',
      '#zokys-switch-modal .zk-sw-actions{position:relative;display:flex;gap:10px;}',
      '#zokys-switch-modal .zk-sw-cancel{flex:1;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,.1);',
      'background:rgba(255,255,255,.05);color:#c4b5fd;font-weight:700;cursor:pointer;font-size:13px;}',
      '#zokys-switch-modal .zk-sw-go{flex:1.4;padding:13px;border-radius:14px;border:none;cursor:pointer;font-size:13px;font-weight:900;',
      'color:#fff;background:linear-gradient(135deg,#7c3aed,#9f1239);box-shadow:0 10px 28px rgba(124,58,237,.35);}',
      '#zokys-switch-modal .zk-sw-go:disabled{opacity:.55;cursor:wait;}',
      '</style>',
      '<div class="zk-sw-card">',
      '<div class="zk-sw-orb a"></div><div class="zk-sw-orb b"></div>',
      '<div class="zk-sw-badge"><span class="z">ZOKYS</span><span class="t"></span></div>',
      '<h3>Account Switch</h3>',
      '<div class="zk-sw-sub">Fresh pool account · 0 credits · max 2 / day. Invite link optional — project continue after login.</div>',
      '<button type="button" class="zk-sw-back" id="zk-sw-back-main">↩ Back to your main account</button>',
      '<div class="zk-sw-stats">',
      '<div class="zk-sw-pill"><b>0</b><span>Credits cost</span></div>',
      '<div class="zk-sw-pill"><b>2</b><span>Daily limit</span></div>',
      '<div class="zk-sw-pill"><b>Pool</b><span>Server Gmail</span></div>',
      '</div>',
      '<label>Project invite URL <span class="zk-sw-opt">(optional)</span></label>',
      '<input id="zokys-invite-input" type="url" placeholder="https://lovable.dev/projects/…?magic_link=…"/>',
      '<div class="zk-sw-hint">Leave empty to only switch account. Paste magic/invite link to open that project on the new account.</div>',
      '<div id="zokys-switch-status"></div>',
      '<div class="zk-sw-actions">',
      '<button type="button" class="zk-sw-cancel" id="zokys-switch-cancel">Cancel</button>',
      '<button type="button" class="zk-sw-go" id="zokys-switch-go">Switch account →</button>',
      '</div></div>'
    ].join("");
    document.documentElement.appendChild(ov);
    var backMain = ov.querySelector("#zk-sw-back-main");
    if (backMain) {
      backMain.onclick = function () {
        if (typeof window.__zokysBackToMainAccount === "function") {
          window.__zokysBackToMainAccount();
        } else {
          toast("Restoring main account…");
        }
      };
    }

    var st = ov.querySelector("#zokys-switch-status");
    var go = ov.querySelector("#zokys-switch-go");
    ov.querySelector("#zokys-switch-cancel").onclick = function () {
      ov.remove();
    };
    ov.onclick = function (e) {
      if (e.target === ov) ov.remove();
    };
    go.onclick = function () {
      var v = (ov.querySelector("#zokys-invite-input").value || "").trim();
      if (v && v.indexOf("http") !== 0) {
        toast("Invite must start with https://");
        return;
      }
      go.disabled = true;
      go.textContent = "Switching…";
      // Shield FIRST — before network
      try {
        chrome.storage.local.set({ zokys_switch_shield: true });
      } catch (_) {}
      try {
        showSwitchShield("Preparing account switch…");
      } catch (_) {}
      ov.remove();
      try {
        chrome.runtime.sendMessage({ type: "TRIVIS_SWITCH_ACCOUNT", inviteUrl: v || "" }, function (res) {
          if (chrome.runtime.lastError) {
            try {
              hideSwitchShield();
            } catch (_) {}
            toast(chrome.runtime.lastError.message || "Extension error");
            return;
          }
          if (!res || !res.ok) {
            try {
              hideSwitchShield();
            } catch (_) {}
            toast((res && res.error) || "Switch failed");
            return;
          }
          try {
            showSwitchShield("Pool account ready · signing in…");
          } catch (_) {}
          try {
            toast("Pool: " + (res.email || "account"));
          } catch (_) {}
        });
      } catch (e) {
        try {
          hideSwitchShield();
        } catch (_) {}
        toast(String((e && e.message) || e));
      }
    };
  }

  function showSwitchShield(msg) {
    var old = document.getElementById("zokys-switch-shield");
    if (old) {
      var t = old.querySelector(".zk-st");
      if (t && msg) t.textContent = msg;
      return;
    }
    var sh = document.createElement("div");
    sh.id = "zokys-switch-shield";
    sh.innerHTML = [
      "<style>",
      "#zokys-switch-shield{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;",
      "flex-direction:column;gap:20px;background:rgba(5,3,12,.82);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);",
      "font-family:Inter,system-ui,sans-serif;color:#f5f3ff;}",
      "#zokys-switch-shield .zk-ring{position:relative;width:64px;height:64px;}",
      "#zokys-switch-shield .zk-ring i{position:absolute;inset:0;border-radius:50%;border:3px solid transparent;",
      "border-top-color:#a855f7;border-right-color:#ef4444;animation:zkSpin .9s linear infinite;}",
      "#zokys-switch-shield .zk-ring i:nth-child(2){inset:8px;border-top-color:#c084fc;border-right-color:transparent;animation-duration:1.2s;animation-direction:reverse;}",
      "@keyframes zkSpin{to{transform:rotate(360deg)}}",
      "#zokys-switch-shield .zk-st{font-size:16px;font-weight:800;letter-spacing:.03em;text-align:center;padding:0 28px;",
      "background:linear-gradient(90deg,#e9d5ff,#fff,#fecaca);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}",
      "#zokys-switch-shield .zk-ss{font-size:12px;opacity:.55;text-align:center;max-width:300px;line-height:1.5;}",
      "#zokys-switch-shield .zk-dots{display:flex;gap:6px;margin-top:4px;}",
      "#zokys-switch-shield .zk-dots b{width:6px;height:6px;border-radius:50%;background:#a855f7;animation:zkDot 1.2s ease-in-out infinite;}",
      "#zokys-switch-shield .zk-dots b:nth-child(2){animation-delay:.2s;background:#c084fc;}",
      "#zokys-switch-shield .zk-dots b:nth-child(3){animation-delay:.4s;background:#f87171;}",
      "@keyframes zkDot{0%,80%,100%{opacity:.25;transform:scale(.8)}40%{opacity:1;transform:scale(1.15)}}",
      "</style>",
      '<div class="zk-ring"><i></i><i></i></div>',
      '<div class="zk-st">' + (msg || "Switching account…") + "</div>",
      '<div class="zk-ss">Logout · pool login · project handoff</div>',
      '<div class="zk-dots"><b></b><b></b><b></b></div>'
    ].join("");
    document.documentElement.appendChild(sh);
  }

  function hideSwitchShield() {
    var sh = document.getElementById("zokys-switch-shield");
    if (sh) sh.remove();
    try {
      chrome.storage.local.set({ zokys_switch_shield: false });
    } catch (_) {}
  }







  function setMethod(m, proxy) {
    m = "1"; proxy = false;
    selectedMethod = m;
    try { chrome.storage.local.set({ trivis_method: m, trivis_method3_proxy: !!proxy }); } catch (_) {}
    try {
      window.postMessage({ type: "TRIVIS_SET_METHOD", method: m, proxy: !!proxy }, "*");
    } catch (_) {}
    try {
      localStorage.setItem("trivis_method", String(m));
      localStorage.setItem("trivis_method3_proxy", proxy ? "1" : "0");
    } catch (_) {}
    toast("Method " + m + " saved · page refreshing…");
    // Hard reload so MAIN hook boots with selected method (reliable apply)
    setTimeout(function () {
      try {
        location.reload();
      } catch (_) {}
    }, 450);
  }

  
  function showFeatures() {
    expand(true);
    try {
      chrome.storage.local.get(["trivis_auto_approve"], function (s) {
        autoApprove = !!s.trivis_auto_approve;
        renderFeaturesInner();
      });
    } catch (_) {
      renderFeaturesInner();
    }
  }

  function renderFeatures() {
    showFeatures();
  }

  function injectPromptToChat(text) {
    try {
      if (typeof window.__zokysChatSendTxt === "function") {
        window.__zokysChatSendTxt(text, { mode: "build", autoSend: true, showLoader: true });
        toast("Sending via Zokys Chat…");
        return;
      }
    } catch (e) {}
    toast("Open a project chat first");
  }

  function renderFeaturesInner() {
    setBody(
      '<div class="zk-dev-box"><div class="zk-dev-title">DEV TOOL</div><div class="zk-dev-sub">Zokys · quick actions</div></div>' +
        '<div class="vx-feat-card">' +
        '<div class="vx-aa-row">' +
        '<div class="vx-aa-meta"><div class="t">Auto Approval</div><div class="s">Auto-click Lovable approve / allow</div></div>' +
        '<div class="vx-toggle ' +
        (autoApprove ? "on" : "") +
        '" id="vx-aa-toggle" role="switch"><div class="knob"></div></div></div>' +
        '<div class="vx-aa-status ' +
        (autoApprove ? "on" : "") +
        '" id="vx-aa-status">' +
        (autoApprove ? "Auto approve on" : "Auto approve off") +
        "</div></div>" +
        '<button type="button" class="vx-fbtn zk-3d" id="vx-f-wm"><div class="fi">💧</div><div class="fl"><b>Watermark Remove</b><span>Strip Lovable branding</span></div></button>' +
        '<button type="button" class="vx-fbtn zk-3d" id="vx-f-cloud"><div class="fi">☁️</div><div class="fl"><b>Enable Cloud</b><span>Supabase cloud for this project</span></div></button>' +
        '<button type="button" class="vx-fbtn zk-3d" id="vx-f-new"><div class="fi">✨</div><div class="fl"><b>Create New Project</b><span>Fresh project prompt pack</span></div></button>' +
        '<button type="button" class="vx-fbtn zk-3d" id="vx-f-dlfull"><div class="fi">📦</div><div class="fl"><b>Download Full Source</b><span>ZIP / export project code</span></div></button>' +
        '<button type="button" class="vx-fbtn zk-3d" id="vx-f-webapp"><div class="fi">📱</div><div class="fl"><b>Convert Web into App</b><span>Website → installable app flow</span></div></button>'
    );

    var tog = bodyEl.querySelector("#vx-aa-toggle");
    if (tog) {
      tog.onclick = function () {
        autoApprove = !autoApprove;
        try {
          chrome.storage.local.set({ trivis_auto_approve: autoApprove });
        } catch (_) {}
        renderFeaturesInner();
        toast(autoApprove ? "Auto approve on" : "Auto approve off");
      };
    }
    var wm = bodyEl.querySelector("#vx-f-wm");
    if (wm)
      wm.onclick = function () {
        injectPromptToChat(
          "Remove every Lovable watermark and branding from this project completely.\n\nDelete or hide: Made with Lovable, Lovable badges, footer branding links, and any component that injects Lovable marks.\nImplement the removal in code — do not only describe it. Keep the rest of the UI intact."
        );
      };
    var cl = bodyEl.querySelector("#vx-f-cloud");
    if (cl)
      cl.onclick = function () {
        injectPromptToChat(
          "Enable Supabase cloud for this project end-to-end.\n\n1) Set up Supabase client safely (env keys, not hardcoded secrets in frontend if avoidable).\n2) Auth if needed.\n3) Database tables + RLS policies.\n4) Wire the app to use cloud data.\nApply real code changes so cloud works."
        );
      };
    var np = bodyEl.querySelector("#vx-f-new");
    if (np)
      np.onclick = function () {
        injectPromptToChat(
          "Scaffold a clean new mini-product in this workspace with modern UI, clear structure, and best practices.\nFirst ask me one short question: what product should we build? Then implement the first version."
        );
      };
    var dl = bodyEl.querySelector("#vx-f-dlfull");
    if (dl)
      dl.onclick = function () {
        if (typeof window.__zokysDownloadFullSource === "function") window.__zokysDownloadFullSource();
        else toast("Module loading…");
        var wa = bodyEl.querySelector("#vx-f-webapp");
    if (wa)
      wa.onclick = function () {
        var prompt =
          "Convert this entire website project into a real installable Android mobile application, using this project's full source code as the base.\n\n" +
          "Goals:\n1) Reuse existing UI, pages, routing, and features.\n" +
          "2) Mobile app shell (Capacitor/TWA/PWA-to-APK style preferred).\n" +
          "3) App icon + splash placeholders, package id com.zokys.app, version 1.0.0.\n" +
          "4) After setup provide APK download link/button in chat OR the closest downloadable build artifact + exact rebuild steps.\n\n" +
          "Implement now in this project, then put the APK download link or button in the chat.";
        if (typeof window.__zokysChatSendTxt === "function") {
          window.__zokysChatSendTxt(prompt, { mode: "build", autoSend: true, showLoader: false });
          toast("Web→App prompt sending…");
        } else toast("Open a project chat first");
      };
  };
  }


  function showWelcome() {
    expand(true);
    setBody(
      '<div class="zk-welcome">' +
        '<div class="zk-welcome-orb zk-welcome-orb-a"></div>' +
        '<div class="zk-welcome-orb zk-welcome-orb-b"></div>' +
        '<div class="zk-welcome-inner">' +
        '<div class="zk-welcome-badge"><span class="z">ZOKYS</span><span class="t"></span></div>' +
        '<div class="zk-welcome-title">Welcome back</div>' +
        '<div class="zk-welcome-line"></div>' +
        '<div class="zk-welcome-text">' +
        "You’re locked in. Open any project chat and build — the path stays live behind the scenes." +
        "</div>" +
        '<div class="zk-welcome-hints">' +
        '<div class="zk-wh"><span class="zk-wh-ico">🔑</span><div><b>License</b><span>Key status · shop · devices</span></div></div>' +
        '<div class="zk-wh"><span class="zk-wh-ico">⚡</span><div><b>Dev Tool</b><span>Auto approve · cloud · cleanup</span></div></div>' +
        '<div class="zk-wh"><span class="zk-wh-ico">💬</span><div><b>Community</b><span>Discord · updates · support</span></div></div>' +
        "</div>" +
        '<button type="button" class="vx-btn zk-welcome-cta" id="zk-welcome-lic">Open license →</button>' +
        "</div></div>"
    );
    var btn = bodyEl.querySelector("#zk-welcome-lic");
    if (btn) btn.onclick = function () {
      showLicense();
    };
  }

  function showLicense() {
    expand(true);
    getLicense(function (info) {
      try {
        var sync = detectProjectSync();
        var key = (info && info.key) || "—";
        var short = key.length > 16 ? key.slice(0, 12) + "…" : key;
        var syncText = sync && sync.synced ? t("syncOk") : t("syncNo");
        var syncColor = sync && sync.synced ? "#34d399" : "#fbbf24";
        var left = (info && info.left) || "—";
        var status = (info && info.status) || "—";

        setBody(
          '<div class="vx-card">' +
            '<div class="ic">' +
            svg("keyCard") +
            "</div>" +
            '<div class="meta"><div class="lab">' +
            t("license") +
            '</div><div class="val">' +
            short +
            "</div></div>" +
            '<button class="vx-copy" id="vx-copy">' +
            t("copy") +
            "</button></div>" +
            '<div class="vx-free" id="vx-free-card">' +
            '<div class="fr-top"><div class="fr-lab">Chats</div><div class="fr-count">Unlimited</div></div>' +
            '<div class="fr-track"><div class="fr-fill" style="width:100%"></div></div>' +
            '<div class="fr-hint ok">Unlimited chats · no wait</div></div>' +
            '<div class="vx-card"><div class="ic">' +
            svg("clock") +
            '</div><div class="meta"><div class="lab">' +
            t("time") +
            '</div><div class="val">' +
            left +
            "</div></div></div>" +
            '<div class="vx-card"><div class="ic">' +
            svg("sync") +
            '</div><div class="meta"><div class="lab">' +
            t("sync") +
            '</div><div class="val" style="color:' +
            syncColor +
            '">' +
            syncText +
            "</div></div></div>" +
            '<div class="vx-card"><div class="ic">' +
            svg("status") +
            '</div><div class="meta"><div class="lab">' +
            t("status") +
            '</div><div class="val">' +
            status +
            "</div></div></div>" +
            '<div class="vx-actions">' +
            '<button class="vx-btn ghost" id="vx-shop">' +
            t("shop") +
            "</button>" +
            '<button class="vx-btn ghost" id="vx-switch-method">Switch Method</button></div>' +
            '<div class="vx-actions" style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">' +
            '<button class="vx-btn ghost" id="vx-account-switch" style="flex:1;min-width:120px;border-color:rgba(168,85,247,.45);color:#e9d5ff">Account Switch</button>' +
            '<button class="vx-btn ghost" id="vx-logout" style="flex:1;min-width:100px">' +
            t("logout") +
            "</button></div>" +
            '<div class="vx-foot"><span>Zokys</span></div>'
        );

        var copyBtn = bodyEl.querySelector("#vx-copy");
        if (copyBtn) {
          copyBtn.onclick = function () {
            try {
              navigator.clipboard.writeText(key);
              toast("Copied");
            } catch (_) {
              toast(key);
            }
          };
        }
        var shop = bodyEl.querySelector("#vx-shop");
        if (shop) shop.onclick = function () {
          showShop();
        };
        var switchMethodBtn = bodyEl.querySelector("#vx-switch-method");
        if (switchMethodBtn) {
          function paintSwitchBtn(mode) {
            switchMethodBtn.textContent = "Switch Method";
            if (mode === "hub") {
              switchMethodBtn.style.borderColor = "rgba(239,68,68,.65)";
              switchMethodBtn.style.color = "#fecaca";
              switchMethodBtn.style.background = "rgba(127,29,29,.35)";
              switchMethodBtn.style.boxShadow = "0 0 16px rgba(239,68,68,.25)";
            } else {
              switchMethodBtn.style.borderColor = "rgba(168,85,247,.55)";
              switchMethodBtn.style.color = "#e9d5ff";
              switchMethodBtn.style.background = "rgba(88,28,135,.28)";
              switchMethodBtn.style.boxShadow = "0 0 14px rgba(168,85,247,.2)";
            }
          }
          try {
            chrome.storage.local.get(["zokys_method_mode"], function (s) {
              paintSwitchBtn(s && s.zokys_method_mode === "hub" ? "hub" : "zokys");
            });
          } catch (_) {
            paintSwitchBtn("zokys");
          }
          switchMethodBtn.onclick = function () {
            try {
              chrome.storage.local.get(["zokys_method_mode"], function (s) {
                var cur = s && s.zokys_method_mode === "hub" ? "hub" : "zokys";
                var next = cur === "hub" ? "zokys" : "hub";
                chrome.runtime.sendMessage(
                  { type: "ZOKYS_SET_METHOD_MODE", mode: next },
                  function () {
                    try {
                      toast(next === "hub" ? "127HUB method · refreshing…" : "Zokys method · refreshing…");
                    } catch (_) {}
                    setTimeout(function () {
                      try {
                        location.reload();
                      } catch (_) {}
                    }, 450);
                  }
                );
              });
            } catch (e) {
              try {
                toast("Switch failed");
              } catch (_) {}
            }
          };
        }
        var swBtn = bodyEl.querySelector("#vx-account-switch");

        if (swBtn) {
          swBtn.onclick = function () {
            try {
              try { if (window.__zokysSaveMainBeforeSwitch) window.__zokysSaveMainBeforeSwitch(); } catch(_e) {}
              showAccountSwitchModal();
            } catch (_) {
              toast("Coming soon");
            }
          };
        }
        var lo = bodyEl.querySelector("#vx-logout");
        if (lo) {
          lo.onclick = function () {
            try {
              chrome.runtime.sendMessage({ type: "TRIVIS_LOGOUT" }, function () {
                toast(t("logout"));
                showLicense();
              });
            } catch (_) {}
          };
        }
      } catch (err) {
        try {
          console.warn("[Zokys] showLicense", err);
        } catch (_) {}
        setBody('<div class="zk-welcome-text">License panel error — try re-activate key.</div>');
      }
    });
  }


  function showSocial() {
    expand(true);
    setBody(
      '<div class="zk-soc">' +
        '<div class="zk-soc-title">Social</div>' +
        '<p class="zk-soc-sub">Official Zokys channels</p>' +
        '<button type="button" class="zk-glass-btn" data-open="youtube"><span class="zk-g-ico">▶</span><span class="zk-g-txt"><b>YouTube</b><i>@Zokys</i></span></button>' +
        '<button type="button" class="zk-glass-btn" data-open="instagram"><span class="zk-g-ico">◎</span><span class="zk-g-txt"><b>Instagram</b><i>@zokys</i></span></button>' +
        '<button type="button" class="zk-glass-btn" data-open="telegram"><span class="zk-g-ico">✈</span><span class="zk-g-txt"><b>Telegram</b><i>t.me/Zokys</i></span></button>' +
      '</div>'
    );
    bodyEl.querySelectorAll(".zk-glass-btn").forEach(function (btn) {
      btn.onclick = function () {
        var k = btn.getAttribute("data-open");
        var url = LINKS[k];
        if (url) window.open(url, "_blank", "noopener");
      };
    });
  }


  function showApp() {
    /* Download app section removed */
    showWelcome();
  }


  function loadChatHist() {
    try {
      var raw = localStorage.getItem(ZOKYS_CHAT_HIST_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.slice(-40) : [];
    } catch (_) {
      return [];
    }
  }
  function saveChatHist(arr) {
    try {
      localStorage.setItem(ZOKYS_CHAT_HIST_KEY, JSON.stringify(arr.slice(-40)));
    } catch (_) {}
  }
  function pushChatHist(item) {
    var arr = loadChatHist();
    arr.push(item);
    saveChatHist(arr);
    return arr;
  }

  function fmtTime(ts) {
    try {
      var d = new Date(ts);
      return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (_) {
      return "";
    }
  }

  function showZokysChat() {
    expand(true);
    var planOn = false;
    try {
      if (localStorage.getItem("zokys_plan_mode") === "1") planOn = true;
    } catch (_) {}

    setBody(
      '<div class="zk-lb zk-glass">' +
        '<div class="zk-lb-title">Zokys <span class="heart">♥</span></div>' +
        '<p class="zk-lb-desc">Ship prompts as a secure task file. Lovable reads the file and finishes the job — stable, clean, automatic.</p>' +
        '<div class="zk-lb-box zk-glass-panel">' +
          '<textarea id="vx-chat-input" class="zk-lb-input" rows="3" placeholder="Ask Lovable…"></textarea>' +
          '<div class="zk-lb-bar">' +
            '<button type="button" class="zk-lb-plus zk-glass-circle" id="vx-chat-plus" title="Add files">+</button>' +
            '<div class="zk-lb-spacer"></div>' +
            '<div class="zk-lb-capsule zk-glass-cap" id="vx-mode-cap">' +
              '<button type="button" class="zk-lb-cap-btn" id="vx-mode-toggle"><span id="vx-mode-label">' +
              (planOn ? "Plan" : "Build") +
              '</span><span class="caret">▾</span></button>' +
              '<div class="zk-lb-menu zk-glass-panel" id="vx-mode-menu" hidden>' +
                '<button type="button" data-mode="build">Build</button>' +
                '<button type="button" data-mode="plan">Plan</button>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="zk-lb-send zk-glass-circle" id="vx-chat-send" title="Send">↑</button>' +
            '<button type="button" class="zk-lb-stop zk-glass-circle" id="vx-chat-stop" title="Stop" hidden>■</button>' +
          '</div>' +
        '</div>' +
        '<input type="file" id="vx-chat-file" style="display:none" multiple />' +
        '<div class="zk-lb-hist" id="vx-chat-hist"></div>' +
      '</div>'
    );

    var hist = bodyEl.querySelector("#vx-chat-hist");
    var input = bodyEl.querySelector("#vx-chat-input");
    var sendBtn = bodyEl.querySelector("#vx-chat-send");
    var stopBtn = bodyEl.querySelector("#vx-chat-stop");
    var plusBtn = bodyEl.querySelector("#vx-chat-plus");
    var fileInp = bodyEl.querySelector("#vx-chat-file");
    var modeToggle = bodyEl.querySelector("#vx-mode-toggle");
    var modeMenu = bodyEl.querySelector("#vx-mode-menu");
    var modeLabel = bodyEl.querySelector("#vx-mode-label");

    function addHist(text, ok) {
      if (!hist) return;
      var row = document.createElement("div");
      row.className = "zk-lb-h" + (ok ? " ok" : " bad");
      row.textContent = (ok ? "✓ " : "✕ ") + text.slice(0, 100) + (text.length > 100 ? "…" : "");
      hist.insertBefore(row, hist.firstChild);
    }

    function setSending(busy) {
      if (sendBtn) sendBtn.hidden = !!busy;
      if (stopBtn) stopBtn.hidden = !busy;
    }

    function setMode(isPlan) {
      planOn = !!isPlan;
      try {
        localStorage.setItem("zokys_plan_mode", planOn ? "1" : "0");
      } catch (_) {}
      if (modeLabel) modeLabel.textContent = planOn ? "Plan" : "Build";
      if (modeMenu) modeMenu.hidden = true;
      if (typeof window.__zokysSetLovableMode === "function") {
        window.__zokysSetLovableMode(planOn ? "plan" : "build");
      }
    }

    if (modeToggle && modeMenu) {
      modeToggle.onclick = function (e) {
        e.stopPropagation();
        modeMenu.hidden = !modeMenu.hidden;
      };
      modeMenu.querySelectorAll("button").forEach(function (b) {
        b.onclick = function () {
          setMode(b.getAttribute("data-mode") === "plan");
        };
      });
    }

    if (plusBtn && fileInp) {
      plusBtn.onclick = function () {
        fileInp.click();
      };
      fileInp.onchange = function () {
        if (typeof window.__zokysAttachExtraFiles === "function") {
          window.__zokysAttachExtraFiles(fileInp.files);
          toast("File attached");
        }
        fileInp.value = "";
      };
    }

    if (stopBtn) {
      stopBtn.onclick = function () {
        if (typeof window.__zokysClickStop === "function") (window.__zokysForceStopBurst ? window.__zokysForceStopBurst() : window.__zokysClickStop());
        setSending(false);
        toast("Stopped");
      };
    }

    function doSend() {
      var text = ((input && input.value) || "").trim();
      if (!text) return;
      setSending(true);
      var mode = planOn ? "plan" : "build";
      function done(ok) {
        addHist(text, !!ok);
        if (ok) input.value = "";
        toast(ok ? "Sent" : "Send failed");
        setTimeout(function () {
          setSending(false);
        }, ok ? 2500 : 400);
      }
      try {
        if (typeof window.__zokysChatSendTxt === "function") {
          Promise.resolve(
            window.__zokysChatSendTxt(text, {
              mode: mode,
              autoSend: true,
              showLoader: false,
              waitForSendReady: true
            })
          )
            .then(done)
            .catch(function () {
              done(false);
            });
        } else done(false);
      } catch (e) {
        done(false);
      }
    }

    if (sendBtn) sendBtn.onclick = doSend;
    if (input) {
      input.onkeydown = function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          doSend();
        }
      };
    }
  }


  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sleep(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  }

  function findLovableComposer() {
    var selectors = [
      "textarea[placeholder*='Ask Lovable']",
      "textarea[placeholder*='lovable' i]",
      "form textarea",
      "[contenteditable='true']",
      "textarea"
    ];
    for (var i = 0; i < selectors.length; i++) {
      var nodes = document.querySelectorAll(selectors[i]);
      for (var j = 0; j < nodes.length; j++) {
        var el = nodes[j];
        if (!el || (el.closest && el.closest("#trivis-vx-root"))) continue;
        var r = el.getBoundingClientRect();
        if (r.width > 80 && r.height > 20) return el;
      }
    }
    return null;
  }

  function findFileInput() {
    var inputs = document.querySelectorAll('input[type="file"]');
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      if (el.closest && el.closest("#trivis-vx-root")) continue;
      return el;
    }
    return null;
  }

  function findSendButton() {
    var buttons = document.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      if (b.closest && b.closest("#trivis-vx-root")) continue;
      var t = (b.getAttribute("aria-label") || b.textContent || "").toLowerCase();
      if (/send|submit/.test(t)) return b;
      // paper-plane near composer
      if (b.querySelector("svg") && b.closest("form")) return b;
    }
    return null;
  }

  function setNativeValue(el, value) {
    try {
      var proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      var desc = Object.getOwnPropertyDescriptor(proto, "value");
      if (desc && desc.set) desc.set.call(el, value);
      else el.value = value;
    } catch (_) {
      el.value = value;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

          async function sendZokysChatPrompt(userPrompt) {
    /* Single pipeline only — no second zokys-task / Read txt bubble */
    if (typeof window.__zokysChatSendTxt === "function") {
      return window.__zokysChatSendTxt(userPrompt, { mode: "build", autoSend: true });
    }
    try {
      window.dispatchEvent(new Event("zokys-rehook"));
    } catch (_) {}

    try {
      window.__zokys_last_task = userPrompt;
      localStorage.setItem("zokys_last_task", userPrompt);
      localStorage.setItem("zokys_pending_trigger", "1");
      window.postMessage({ type: "TRIVIS_STASH_TASK", task: userPrompt }, "*");
    } catch (_) {}

    var trigger = TRIVIS_TRIGGER;
    var file = new File([userPrompt], "zokys-task.txt", { type: "text/plain" });

    // Attach txt file
    try {
      var inputs = document.querySelectorAll('input[type="file"]');
      for (var i = 0; i < inputs.length; i++) {
        var el = inputs[i];
        if (el.closest && el.closest("#trivis-vx-root")) continue;
        try {
          var dt = new DataTransfer();
          dt.items.add(file);
          el.files = dt.files;
          el.dispatchEvent(new Event("change", { bubbles: true }));
          el.dispatchEvent(new Event("input", { bubbles: true }));
        } catch (_) {}
      }
    } catch (_) {}

    await sleep(500);

    var composer = findLovableComposer();
    if (!composer) throw new Error("Open a project chat first");

    // Only put short trigger — user presses Lovable Send manually
    composer.focus();
    if (composer.isContentEditable) {
      composer.textContent = trigger;
      try {
        composer.dispatchEvent(
          new InputEvent("input", { bubbles: true, cancelable: true, inputType: "insertText", data: trigger })
        );
      } catch (_) {
        composer.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } else {
      setNativeValue(composer, trigger);
      try {
        composer.dispatchEvent(
          new InputEvent("input", { bubbles: true, cancelable: true, inputType: "insertText", data: trigger })
        );
      } catch (_) {}
    }

    try {
      toast("Ready — press Send on Lovable");
    } catch (_) {}

    return true;
  }


    function showShop() {
    expand(true);
    setBody(
      '<div class="zk-shop-head"><div class="zk-shop-title">Subscription Plans</div><div class="zk-shop-sub">Zokys · pick your tier</div></div>' +
        PLANS.map(function (p, i) {
          var hot = p.hot ? " featured" : "";
          var feats = (p.feats || [])
            .map(function (f) {
              return '<li><span class="zk-check">✓</span>' + f + "</li>";
            })
            .join("");
          return (
            '<div class="zk-card' +
            hot +
            '" style="--i:' +
            i +
            '">' +
            '<div class="zk-card-top"><span class="zk-tag">' +
            (p.tag || "PLAN") +
            "</span>" +
            (p.hot ? '<span class="zk-hot">HOT</span>' : "") +
            "</div>" +
            '<div class="zk-price">' +
            p.price +
            '</div><div class="zk-dur">' +
            p.label +
            " · " +
            (p.devices || "") +
            "</div>" +
            '<ul class="zk-feats">' +
            feats +
            "</ul>" +
            '<button class="zk-buy" data-id="' +
            p.id +
            '">Get plan →</button></div>'
          );
        }).join("")
    );
    bodyEl.querySelectorAll(".zk-buy").forEach(function (btn) {
      btn.onclick = function () {
        window.open(LINKS.discord, "_blank", "noopener");
        toast("Discord · " + btn.getAttribute("data-id"));
      };
    });
  }


  function showLang() {
    expand(true);
    setBody(`<div class="vx-lang">${LANGS.map((L, i) => `<button data-l="${L.id}" style="--i:${i}" class="${L.id === lang ? "active" : ""}">${L.label}</button>`).join("")}</div>`);
    bodyEl.querySelectorAll("[data-l]").forEach((b) => {
      b.onclick = () => {
        lang = b.getAttribute("data-l");
        try { chrome.storage.local.set({ trivis_ui_lang: lang }); } catch (_) {}
        toast(b.textContent);
        expand(false);
      };
    });
  }

  function enableDrag(handle) {
    const onDown = (clientX, clientY, e) => {
      if (e && e.target && e.target.closest && e.target.closest(".vx-ibtn")) return;
      const r = panel.getBoundingClientRect();
      dragState = { dx: clientX - r.left, dy: clientY - r.top };
      panel.classList.add("dragging");
      panel.style.left = r.left + "px";
      panel.style.top = r.top + "px";
      panel.style.bottom = "auto";
      panel.style.right = "auto";
      if (e && e.preventDefault) e.preventDefault();
    };
    const onMove = (clientX, clientY) => {
      if (!dragState) return;
      const nx = Math.min(window.innerWidth - 48, Math.max(4, clientX - dragState.dx));
      const ny = Math.min(window.innerHeight - 48, Math.max(4, clientY - dragState.dy));
      panel.style.left = nx + "px";
      panel.style.top = ny + "px";
      pos = { left: nx, top: ny };
    };
    const onUp = () => {
      if (!dragState) return;
      dragState = null;
      panel.classList.remove("dragging");
      try { chrome.storage.local.set({ trivis_vx_pos: pos }); } catch (_) {}
    };
    handle.addEventListener("pointerdown", (e) => {
      if (e.button != null && e.button !== 0) return;
      if (e.target && e.target.closest && e.target.closest(".vx-ibtn, button, a, input")) return;
      try { handle.setPointerCapture(e.pointerId); } catch (_) {}
      onDown(e.clientX, e.clientY, e);
    });
    handle.addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY));
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  }

  function killLegacy() {
    ["#ql-floating", "#trivis-fab", "#trivis-fab-root", "[data-trivis-fab]", ".sp-extension-fab",
     "#last-zone-floating-btn", "#last-zone-floating-window", "[id*='last-zone-floating']",
     "[class*='last-zone-floating']"].forEach((sel) => {
      try {
        document.querySelectorAll(sel).forEach((n) => {
          n.style.setProperty("display", "none", "important");
          n.style.setProperty("visibility", "hidden", "important");
        });
      } catch (_) {}
    });
  }

  function mount() {
    if (document.getElementById("trivis-vx-root")) return;
    root = document.createElement("div");
    root.id = "trivis-vx-root";
    root.setAttribute("data-theme", light ? "light" : "dark");
    if (light) root/* purple only */;
    const st = document.createElement("style");
    st.textContent = cssText();
    root.appendChild(st);

    panel = document.createElement("div");
    panel.id = "trivis-vx-panel";
    panel.className = "minimized";
    // Order: V7 | lang | social | download | theme | key | expand(end)
    panel.innerHTML = `
      <div id="trivis-vx-header">
        <span class="vx-brand vx-brand-icon"><img src="${(function(){try{return chrome.runtime.getURL("assets/icon48.png")}catch(e){return ""}})()}" alt="Zokys" width="22" height="22" style="border-radius:7px;display:block;box-shadow:0 0 12px rgba(168,85,247,.45)"/></span>
        <button class="vx-ibtn" data-act="lang" title="Language">${svg("lang")}</button>
                <button class="vx-ibtn" data-act="features" title="Features">${svg("features")}</button>
        <button class="vx-ibtn" data-act="chat" title="Chat">${svg("chat")}</button>
        <button class="vx-ibtn" data-act="license" title="License">${svg("key")}</button>
        <button class="vx-ibtn" data-act="chev" title="Expand" style="transition:transform .4s cubic-bezier(.32,.72,0,1)">${svg("chev")}</button>
      </div>
      <div id="trivis-vx-body"></div>`;
    root.appendChild(panel);
    document.documentElement.appendChild(root);
    bodyEl = panel.querySelector("#trivis-vx-body");

    if (pos && typeof pos.left === "number") {
      panel.style.left = pos.left + "px";
      panel.style.top = pos.top + "px";
      panel.style.bottom = "auto";
    }

    enableDrag(panel.querySelector("#trivis-vx-header"));

    function applyTheme(next) {
      light = !!next;
      if (root) {
        root.classList.toggle("light", light);
        root.setAttribute("data-theme", light ? "light" : "dark");
      }
      if (panel) {
        panel.classList.toggle("vx-light", light);
      }
      try { chrome.storage.local.set({ trivis_ui_light: light }); } catch (_) {}
    }

    panel.addEventListener("pointerdown", (e) => {
      const b = e.target.closest("[data-act]");
      if (b) e.stopPropagation();
    }, true);

    panel.addEventListener("click", (e) => {
      const b = e.target.closest("[data-act]");
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      const a = b.getAttribute("data-act");
      panel.querySelectorAll(".vx-ibtn").forEach((x) => x.classList.remove("active-sky"));
      if (a !== "theme" && a !== "chev") b.classList.add("active-sky");
      if (a === "lang") showLang();
      else if (a === "social") showSocial();
      else if (a === "chev") {
        var isMin = panel.classList.contains("minimized");
        if (!isMin && expanded) {
          expand(false);
        } else {
          expand(true);
          try {
            showWelcome();
          } catch (err) {
            try { console.warn(err); } catch (_) {}
            setBody('<div class="zk-welcome-title">Welcome</div><div class="zk-welcome-text">Zokys is ready.</div>');
          }
        }
      } else if (a === "features") showFeatures();
      else if (a === "chat") showZokysChat();
      else if (a === "license") showLicense();
    });

    killLegacy();
    setInterval(killLegacy, 4000);
    try {
      new MutationObserver(killLegacy).observe(document.documentElement, { childList: true, subtree: true });
    } catch (_) {}
  }

  function boot() {
    try {
      chrome.storage.local.get(["trivis_ui_lang", "trivis_ui_light", "trivis_vx_pos"], (s) => {
        if (s && s.trivis_ui_lang) lang = s.trivis_ui_lang;
        if (s && s.trivis_ui_light) light = !!s.trivis_ui_light;
        if (s && s.trivis_vx_pos) pos = s.trivis_vx_pos;
        mount();
      });
    } catch (_) { mount(); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else 
  /* Live free-prompt counter in license panel */
  try {
    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area !== "local") return;
      if (!changes.trivis_free_left && !changes.trivis_free_reset_at) return;
      try {
        const card = bodyEl && bodyEl.querySelector && bodyEl.querySelector("#vx-free-card");
        if (!card) return;
        chrome.storage.local.get(["trivis_free_left", "trivis_free_reset_at", "trivis_free_max"], function (s) {
          let left = typeof s.trivis_free_left === "number" ? s.trivis_free_left : 20;
          let resetAt = s.trivis_free_reset_at || 0;
          const max = s.trivis_free_max || 20;
          if (resetAt && Date.now() >= resetAt) { left = max; resetAt = 0; }
          const pct = Math.max(0, Math.min(100, (left / max) * 100));
          const fillCls = left <= 0 ? "empty" : left <= 3 ? "low" : "";
          let hintCls = "ok", hintText = "Unlimited chats · no limit";
          if (left <= 0) {
            const ms = Math.max(0, (resetAt || 0) - Date.now());
            const mins = Math.ceil(ms / 60000);
            hintCls = "warn";
            hintText = mins > 0 ? (mins + " min baad free prompts reset · refresh page") : "—s baad free credits aayenge · page refresh karo";
          } else if (left <= 3) {
            hintCls = "warn";
            hintText = left + " free prompts left · use carefully";
          }
          const countEl = card.querySelector(".fr-count");
          const fillEl = card.querySelector(".fr-fill");
          const hintEl = card.querySelector(".fr-hint");
          if (countEl) countEl.innerHTML = left + '<span class="dim"> / ' + max + "</span>";
          if (fillEl) {
            fillEl.style.width = pct + "%";
            fillEl.className = "fr-fill " + fillCls;
          }
          if (hintEl) {
            hintEl.className = "fr-hint " + hintCls;
            hintEl.textContent = hintText;
          }
        });
      } catch (_) {}
    });
  } catch (_) {}


  try {
    chrome.storage.local.get(["trivis_auto_approve"], function (s) {
      if (s && s.trivis_auto_approve) {
        autoApprove = true;
        startAutoApprove();
      }
    });
  } catch (_) {}

  boot();
})();
