/**
 * Zokys service worker bridge
 * - License + control against https://zokysvx.lovable.app
 * - Fail-closed authorize-send (one-time sendToken)
 * - Heartbeat recheck (expire / ban / revoke / lock)
 * - Inject freeze scripts ONLY when licensed
 * Freeze script paths unchanged.
 */


const LOCK_FLAG_KEY = "zokys_extension_locked";
const LOCK_MSG_KEY = "zokys_lock_message";
const THEME_KEY = "zokys_remote_theme";
const FEATURES_KEY = "zokys_remote_features";

const ZOKYS_BASE = "https://zokysvx.lovable.app";
const TRIVIS_API = ZOKYS_BASE + "/api/public/validate-license";
const TRIVIS_API_FALLBACK = ZOKYS_BASE + "/api/validate-license";
const EXTENSION_STATUS_API = ZOKYS_BASE + "/api/public/extension-status";
const EXTENSION_STATUS_API_FALLBACK = ZOKYS_BASE + "/api/extension-status";
const SWITCH_API = ZOKYS_BASE + "/api/public/switch-account";
const SWITCH_API_FALLBACK = ZOKYS_BASE + "/api/switch-account";
const AUTHORIZE_SEND_API = ZOKYS_BASE + "/api/public/authorize-send";
const REPORT_OUTCOME_API = ZOKYS_BASE + "/api/public/report-outcome";
const METHOD_BUNDLE_API = ZOKYS_BASE + "/api/public/method-bundle";
const CONSUME_SEND_API = ZOKYS_BASE + "/api/public/consume-send";
const HEARTBEAT_API = ZOKYS_BASE + "/api/public/heartbeat";
const HEARTBEAT_API_FALLBACK = ZOKYS_BASE + "/api/heartbeat";
/* Accept ZOKYS-XXXX-XXXX-XXXX and legacy TRIVIS-XXXX-XXXX */
const KEY_RE = /^(ZOKYS|TRIVIS|REMAX94)-[A-Z0-9]{4}-[A-Z0-9]{4}(-[A-Z0-9]{4})?$/i;
const TOKEN_KEY = "trivis_license_key";
const OK_KEY = "trivis_lic_ok";
const SESSION_KEY = "trivis_lic_session";
const NAME_KEY = "trivis_user_name";
const EXP_KEY = "trivis_lic_expires";
const DEVICE_KEY = "trivis_device_id";
const LAST_CHECK_KEY = "trivis_last_recheck";

const HEARTBEAT_ALARM = "trivis_license_heartbeat";
const HEARTBEAT_MINUTES = 1;

/* Dual method packs — default Zokys; optional 127HUB core (v30.5.1) */
const METHOD_MODE_KEY = "zokys_method_mode"; /* "zokys" | "hub" */

const ZOKYS_FREEZE_MAIN = ["scripts/content/z3hfc0.js"];
const ZOKYS_FREEZE_ISOLATED = [
  "scripts/shared/a2m9kx.js",
  "scripts/shared/p5v0lc.js",
  "scripts/shared/j6y4bn.js",
  "scripts/content/r7wq1a.js"
];

/* 127HUB core method (MAIN, document_start style) — pageHook stack, no full powerkits UI */
const HUB_FREEZE_MAIN = [
  "methods/hub/zokys-hub-bypass.js",
  "methods/hub/drag-blocker.js",
  "methods/hub/jszip.min.js",
  "methods/hub/pageHook.js"
];
const HUB_FREEZE_ISOLATED = [];

const FREEZE_SCRIPTS_MAIN = ZOKYS_FREEZE_MAIN;
const FREEZE_SCRIPTS_ISOLATED = ZOKYS_FREEZE_ISOLATED;

async function getMethodMode() {
  try {
    const r = await chrome.storage.local.get([METHOD_MODE_KEY]);
    const m = r[METHOD_MODE_KEY];
    return m === "hub" ? "hub" : "zokys";
  } catch (_) {
    return "zokys";
  }
}

async function setMethodMode(mode) {
  const m = mode === "hub" ? "hub" : "zokys";
  await chrome.storage.local.set({ [METHOD_MODE_KEY]: m });
  return m;
}

function deviceId() {
  return new Promise((resolve) => {
    chrome.storage.local.get([DEVICE_KEY], (r) => {
      if (r[DEVICE_KEY]) return resolve(r[DEVICE_KEY]);
      let id = "tv_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      try {
        const arr = new Uint8Array(16);
        crypto.getRandomValues(arr);
        id =
          "tv_" +
          Array.from(arr)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
            .slice(0, 24);
      } catch (_) {}
      chrome.storage.local.set({ [DEVICE_KEY]: id }, () => resolve(id));
    });
  });
}


async function applyRemoteControl(data) {
  if (!data || typeof data !== "object") return;
  try {
    const patch = {};
    if (typeof data.extension_locked === "boolean") {
      patch[LOCK_FLAG_KEY] = data.extension_locked;
      patch[LOCK_MSG_KEY] = data.lock_message || "";
    }
    if (data.theme) patch[THEME_KEY] = data.theme;
    if (data.features) patch[FEATURES_KEY] = data.features;
    if (Object.keys(patch).length) await chrome.storage.local.set(patch);
  } catch (_) {}
}

async function isLicensed() {
  const r = await chrome.storage.local.get([OK_KEY, TOKEN_KEY, EXP_KEY]);
  if (!(r[OK_KEY] === true || r[OK_KEY] === "1") || !r[TOKEN_KEY]) return false;
  if (r[EXP_KEY]) {
    const t = Date.parse(r[EXP_KEY]);
    if (t && Date.now() > t) {
      await clearLicense();
      return false;
    }
  }
  return true;
}

async function clearLicense() {
  await chrome.storage.local.remove([
    TOKEN_KEY,
    OK_KEY,
    SESSION_KEY,
    NAME_KEY,
    EXP_KEY,
    LAST_CHECK_KEY
  ]);
}

/**
 * Server recheck using stored key + device.
 * Persistent login stays until server says invalid OR local expiry.
 * Network fail → keep current session (no false logout offline).
 */
async function revalidateFromServer() {
  const r = await chrome.storage.local.get([TOKEN_KEY, NAME_KEY, OK_KEY, EXP_KEY]);
  if (!(r[OK_KEY] === true || r[OK_KEY] === "1") || !r[TOKEN_KEY]) {
    return { ok: false, reason: "no_session" };
  }

  // Local expiry first
  if (r[EXP_KEY]) {
    const t = Date.parse(r[EXP_KEY]);
    if (t && Date.now() > t) {
      await clearLicense();
      return { ok: false, reason: "expired" };
    }
  }

  const key = String(r[TOKEN_KEY]).trim().toUpperCase();
  if (!KEY_RE.test(key)) {
    await clearLicense();
    return { ok: false, reason: "bad_key" };
  }

  try {
    const dev = await deviceId();
    const name = String(r[NAME_KEY] || "Zokys User").slice(0, 64);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    let resp;
    try {
      resp = await fetch(TRIVIS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, deviceId: dev, name, recheck: true }),
        signal: ctrl.signal
      });
    } finally {
      clearTimeout(timer);
    }

    let data = await resp.json().catch(() => null);
    if ((!data || !data.ok) && typeof TRIVIS_API_FALLBACK !== "undefined") {
      try {
        const resp2 = await fetch(TRIVIS_API_FALLBACK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, deviceId: dev, name, recheck: true })
        });
        const data2 = await resp2.json().catch(() => null);
        if (data2 && data2.ok) data = data2;
      } catch (_) {}
    }
    try { if (data && data.ok) await applyRemoteControl(data); } catch (_) {}

    // Explicit invalid from server → kill session (ban / revoke / device limit)
    if (data && data.ok === false) {
      await clearLicense();
      return {
        ok: false,
        reason: "revoked",
        error: data.error || data.message || "License revoked"
      };
    }

    // HTTP hard fail that clearly means banned (401/403)
    if (resp.status === 401 || resp.status === 403) {
      await clearLicense();
      return { ok: false, reason: "revoked", error: "License revoked" };
    }

    // Network / 5xx / parse fail → keep session (offline safe)
    if (!resp.ok || !data) {
      await chrome.storage.local.set({ [LAST_CHECK_KEY]: Date.now() });
      return { ok: true, reason: "network_keep" };
    }

    // Server OK — refresh expiry / name if provided
    const patch = { [LAST_CHECK_KEY]: Date.now(), [OK_KEY]: true };
    if (data.expires_at) patch[EXP_KEY] = data.expires_at;
    if (data.user_name) patch[NAME_KEY] = data.user_name;
    if (data.session) patch[SESSION_KEY] = data.session;
    await chrome.storage.local.set(patch);

    return {
      ok: true,
      reason: "revalidated",
      expires_at: data.expires_at || r[EXP_KEY] || null,
      name: data.user_name || r[NAME_KEY] || null
    };
  } catch (_) {
    // Offline / abort → keep session
    return { ok: true, reason: "network_keep" };
  }
}

function isLovableProjectUrl(url) {
  try {
    // Only project workspace — never dashboard/home (freeze breaks project list + slows SPA)
    return /https:\/\/([a-z0-9-]+\.)?lovable\.dev\/projects\/[a-zA-Z0-9_-]+/i.test(String(url || ""));
  } catch (_) {
    return false;
  }
}

async function injectFreezeIntoTab(tabId, tabUrl) {
  try {
    if (tabUrl && !isLovableProjectUrl(tabUrl)) return;
    if (!tabUrl) {
      try {
        const t = await chrome.tabs.get(tabId);
        if (!t || !isLovableProjectUrl(t.url || "")) return;
      } catch (_) {
        return;
      }
    }
  } catch (_) {
    return;
  }

  try {
    const chk = await chrome.scripting.executeScript({
      target: { tabId, allFrames: false },
      world: "MAIN",
      func: function () {
        return !!window.__ZOKYS_FREEZE_INJECTED__;
      }
    });
    if (chk && chk[0] && chk[0].result === true) return;
  } catch (_) {}

  await new Promise((r) => setTimeout(r, 2500));

  try {
    const chk2 = await chrome.scripting.executeScript({
      target: { tabId, allFrames: false },
      world: "MAIN",
      func: function () {
        return !!window.__ZOKYS_FREEZE_INJECTED__;
      }
    });
    if (chk2 && chk2[0] && chk2[0].result === true) return;
  } catch (_) {}

  // Mark BEFORE inject so parallel onUpdated cannot double-run
  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: false },
      world: "MAIN",
      func: function () {
        try {
          window.__ZOKYS_FREEZE_INJECTED__ = true;
        } catch (e) {}
      }
    });
  } catch (_) {}

  const mode = await getMethodMode();
  const mainFiles = mode === "hub" ? HUB_FREEZE_MAIN : ZOKYS_FREEZE_MAIN;
  const isoFiles = mode === "hub" ? HUB_FREEZE_ISOLATED : ZOKYS_FREEZE_ISOLATED;

  try {
    for (const file of mainFiles) {
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: false },
        files: [file],
        world: "MAIN"
      });
    }
  } catch (_) {}

  try {
    if (isoFiles && isoFiles.length) {
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: false },
        files: isoFiles,
        world: "ISOLATED"
      });
    }
  } catch (_) {}

  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: false },
      files: ["scripts/content/zokys-label-main.js"],
      world: "MAIN"
    });
  } catch (_) {}

  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: false },
      world: "MAIN",
      func: function () {
        try {
          window.__TRIVIS_LICENSED__ = true;
          window.__ZOKYS_LICENSED__ = true;
        } catch (e) {}
      }
    });
  } catch (_) {}
}


async function injectFreezeAllLovableTabs() {
  const ok = await isLicensed();
  if (!ok) return;
  try {
    const tabs = await chrome.tabs.query({
      url: ["https://lovable.dev/projects/*", "https://*.lovable.dev/projects/*"]
    });
    for (const tab of tabs) {
      if (tab.id && isLovableProjectUrl(tab.url || "")) {
        await injectFreezeIntoTab(tab.id, tab.url);
      }
    }
  } catch (_) {}
}

function scheduleHeartbeat() {
  try {
    chrome.alarms.create(HEARTBEAT_ALARM, {
      delayInMinutes: 1,
      periodInMinutes: HEARTBEAT_MINUTES
    });
  } catch (_) {}
}



async function clearLovableSession() {
  try {
    const all = await chrome.cookies.getAll({});
    for (const c of all) {
      const host = (c.domain || "").replace(/^\./, "");
      if (!/lovable\.dev$/i.test(host) && host !== "lovable.dev") continue;
      try {
        const url = "https://" + host + (c.path || "/");
        await chrome.cookies.remove({ url: url, name: c.name });
        if (c.storeId) {
          await chrome.cookies.remove({ url: url, name: c.name, storeId: c.storeId });
        }
      } catch (_) {}
    }
  } catch (_) {}
  // Common auth cookie names explicit wipe
  const names = [
    "sb-access-token",
    "sb-refresh-token",
    "lovable-session",
    "lovable-session-id",
    "__session",
    "session"
  ];
  for (const name of names) {
    for (const host of ["lovable.dev", "www.lovable.dev"]) {
      try {
        await chrome.cookies.remove({ url: "https://" + host + "/", name: name });
      } catch (_) {}
    }
  }
}


async function executeAccountSwitch(inviteUrl) {
  const ok = await isLicensed();
  if (!ok) {
    return { ok: false, error: "Activate license first" };
  }
  const r = await chrome.storage.local.get([TOKEN_KEY, DEVICE_KEY]);
  const license_key = String(r[TOKEN_KEY] || "").trim();
  const device_id = r[DEVICE_KEY] || (await deviceId());
  if (!license_key) {
    return { ok: false, error: "No license key" };
  }

  const prev = await chrome.storage.local.get(["zokys_last_pool_email"]);
  const exclude_email = (prev && prev.zokys_last_pool_email) || "";
  const body = {
    license_key,
    device_id,
    invite_url: inviteUrl || "",
    exclude_email: exclude_email || undefined
  };

  async function post(url) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal
      });
      const data = await resp.json().catch(() => null);
      return { resp, data };
    } finally {
      clearTimeout(t);
    }
  }

  let data = null;
  try {
    let out = await post(SWITCH_API);
    data = out.data;
    if (!data || (out.resp && out.resp.status === 404)) {
      out = await post(SWITCH_API_FALLBACK);
      data = out.data;
    }
  } catch (e) {
    return {
      ok: false,
      error: e && e.name === "AbortError" ? "Timeout" : "Network error"
    };
  }

  if (!data || data.ok === false) {
    return {
      ok: false,
      reason: (data && data.reason) || "failed",
      error: (data && (data.message || data.error)) || "Switch failed",
      switches_today: data && data.switches_today,
      daily_limit: data && data.daily_limit
    };
  }

  if (!data.account || !data.account.email || !data.account.password) {
    return { ok: false, error: "Server did not return account credentials" };
  }

  await clearLovableSession();

  const targetUrl = data.targetUrl || inviteUrl || "https://lovable.dev/";
  const email = String(data.account.email || "").trim();
  const password = String(data.account.password || "");

  await chrome.storage.local.set({
    zokys_switch_pending: true,
    zokys_switch_email: email,
    zokys_switch_password: password,
    zokys_invite_url: targetUrl,
    zokys_switch_at: Date.now(),
    zokys_switch_step: "login",
    zokys_last_pool_email: email
  });

  // Wipe page storage on all Lovable tabs, then focus login
  try {
    const tabs = await chrome.tabs.query({ url: ["https://lovable.dev/*", "https://*.lovable.dev/*"] });
    for (const tab of tabs) {
      if (!tab.id) continue;
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          world: "MAIN",
          func: function () {
            try {
              localStorage.clear();
              sessionStorage.clear();
            } catch (e) {}
            try {
              if (indexedDB && indexedDB.databases) {
                indexedDB.databases().then(function (dbs) {
                  (dbs || []).forEach(function (db) {
                    if (db && db.name) indexedDB.deleteDatabase(db.name);
                  });
                });
              }
            } catch (e) {}
          }
        });
      } catch (_) {}
    }
  } catch (_) {}

  // Force all lovable tabs to login (replace) after storage wipe
  try {
    const tabs = await chrome.tabs.query({ url: ["https://lovable.dev/*", "https://*.lovable.dev/*"] });
    for (const tab of tabs) {
      if (!tab.id) continue;
      try {
        await chrome.tabs.update(tab.id, { url: "https://lovable.dev/login?zokys_sw=" + Date.now() });
      } catch (_) {}
    }
  } catch (_) {}

  return {
    ok: true,
    email: email,
    targetUrl: targetUrl,
    switches_today: data.switches_today,
    switches_left_today: data.switches_left_today,
    daily_limit: data.daily_limit || 2,
    cost: data.cost || 0
  };
}



async function applyLockState(data) {
  if (!data || typeof data !== "object") return;
  const locked = data.extension_locked === true || data.extension_locked === "true" || data.extension_locked === 1;
  const msg = String(data.lock_message || "Extension is locked. Please contact the administrator.").trim();
  await chrome.storage.local.set({
    [LOCK_FLAG_KEY]: locked,
    [LOCK_MSG_KEY]: msg || "Extension is locked. Please contact the administrator."
  });
  try {
    const tabs = await chrome.tabs.query({ url: ["https://lovable.dev/*", "https://*.lovable.dev/*"] });
    for (const tab of tabs) {
      if (!tab.id) continue;
      try {
        chrome.tabs.sendMessage(tab.id, {
          type: "ZOKYS_LOCK_STATE",
          locked,
          message: msg
        }).catch(() => {});
      } catch (_) {}
    }
  } catch (_) {}
}

async function fetchExtensionStatus() {
  const body = {};
  try {
    const r = await chrome.storage.local.get([TOKEN_KEY]);
    if (r[TOKEN_KEY]) body.license_key = r[TOKEN_KEY];
  } catch (_) {}
  async function post(url) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal
      });
      return await resp.json().catch(() => null);
    } finally {
      clearTimeout(t);
    }
  }
  try {
    let data = await post(EXTENSION_STATUS_API);
    if (!data || data.ok === undefined) {
      data = await post(EXTENSION_STATUS_API_FALLBACK);
    }
    if (data) await applyLockState(data);
    return data;
  } catch (_) {
    return null;
  }
}


chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || !msg.type) return false;

  if (msg.type === "TRIVIS_LOCK_STATUS" || msg.type === "ZOKYS_LOCK_STATUS") {
    (async () => {
      try {
        await fetchExtensionStatus();
      } catch (_) {}
      const r = await chrome.storage.local.get([LOCK_FLAG_KEY, LOCK_MSG_KEY]);
      sendResponse({
        locked: r[LOCK_FLAG_KEY] === true,
        message: r[LOCK_MSG_KEY] || "Extension is locked"
      });
    })();
    return true;
  }

  if (msg.type === "TRIVIS_VALIDATE") {
    (async () => {
      try {
        const key = String(msg.key || "").trim().toUpperCase();
        const name = String(msg.name || "").trim().slice(0, 64);
        const dev = await deviceId();
        if (!KEY_RE.test(key)) {
          sendResponse({ ok: false, error: "Format: ZOKYS-XXXX-XXXX-XXXX" });
          return;
        }
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 15000);
        let resp;
        try {
          resp = await fetch(TRIVIS_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, deviceId: dev, name }),
            signal: ctrl.signal
          });
        } finally {
          clearTimeout(t);
        }
        let data = await resp.json().catch(() => null);
        if ((!data || !data.ok) && typeof TRIVIS_API_FALLBACK !== "undefined") {
          try {
            const resp2 = await fetch(TRIVIS_API_FALLBACK, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key, deviceId: dev, name })
            });
            const data2 = await resp2.json().catch(() => null);
            if (data2 && data2.ok) data = data2;
          } catch (_) {}
        }
        try { if (data && data.ok) await applyRemoteControl(data); } catch (_) {}
        if (!data || !data.ok) {
          sendResponse({
            ok: false,
            error: (data && (data.error || data.message)) || "HTTP " + resp.status
          });
          return;
        }
        const patch = {
          [TOKEN_KEY]: key,
          [OK_KEY]: true,
          [SESSION_KEY]: data.session || "sess_" + Date.now(),
          [NAME_KEY]: data.user_name || name || "Trivis User",
          [LAST_CHECK_KEY]: Date.now()
        };
        if (data.expires_at) patch[EXP_KEY] = data.expires_at;
        await chrome.storage.local.set(patch);
        try { await applyLockState(data); } catch (_) {}
        await injectFreezeAllLovableTabs();
        scheduleHeartbeat();
        sendResponse({
          ok: true,
          session: patch[SESSION_KEY],
          expires_at: data.expires_at || null,
          user_name: patch[NAME_KEY],
          name: patch[NAME_KEY],
          key
        });
      } catch (e) {
        sendResponse({
          ok: false,
          error: e && e.name === "AbortError" ? "Timeout" : "Network error"
        });
      }
    })();
    return true;
  }

  // Fast local status — persistent login, no key prompt
  if (msg.type === "TRIVIS_STATUS") {
    (async () => {
      // Optional force server recheck
      if (msg.recheck) {
        await revalidateFromServer();
      }
      const ok = await isLicensed();
      const r = await chrome.storage.local.get([TOKEN_KEY, NAME_KEY, EXP_KEY]);
      sendResponse({
        ok,
        key: r[TOKEN_KEY] || null,
        name: r[NAME_KEY] || null,
        expires_at: r[EXP_KEY] || null
      });
    })();
    return true;
  }

  // Explicit server recheck (UI / manual)
  if (msg.type === "TRIVIS_RECHECK") {
    (async () => {
      const result = await revalidateFromServer();
      const r = await chrome.storage.local.get([TOKEN_KEY, NAME_KEY, EXP_KEY]);
      sendResponse({
        ok: result.ok && (await isLicensed()),
        reason: result.reason || null,
        error: result.error || null,
        key: r[TOKEN_KEY] || null,
        name: r[NAME_KEY] || null,
        expires_at: r[EXP_KEY] || null
      });
    })();
    return true;
  }

  if (msg.type === "TRIVIS_SWITCH_ACCOUNT" || msg.type === "ZOKYS_SWITCH_ACCOUNT") {
    (async () => {
      try {
        const res = await executeAccountSwitch(msg.inviteUrl || msg.invite_url || "");
        sendResponse(res);
      } catch (e) {
        sendResponse({ ok: false, error: String(e && e.message || e) });
      }
    })();
    return true;
  }







  if (msg.type === "ZOKYS_GET_METHOD_MODE") {
    getMethodMode().then((mode) => sendResponse({ ok: true, mode })).catch(() => sendResponse({ ok: false, mode: "zokys" }));
    return true;
  }

  if (msg.type === "ZOKYS_SET_METHOD_MODE") {
    (async () => {
      try {
        const mode = await setMethodMode(msg.mode === "hub" ? "hub" : "zokys");
        /* clear inject flag so next load reinjects */
        try {
          const tabs = await chrome.tabs.query({
            url: ["https://lovable.dev/projects/*", "https://*.lovable.dev/projects/*"]
          });
          for (const tab of tabs) {
            if (!tab.id) continue;
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id, allFrames: false },
                world: "MAIN",
                func: function () {
                  try {
                    window.__ZOKYS_FREEZE_INJECTED__ = false;
                    window.__ZOKYS_METHOD_MODE__ = null;
                  } catch (e) {}
                }
              });
            } catch (_) {}
          }
        } catch (_) {}
        sendResponse({ ok: true, mode: mode, hardRefresh: true });
      } catch (e) {
        sendResponse({ ok: false, error: String(e && e.message || e) });
      }
    })();
    return true;
  }

  if (msg.type === "ZOKYS_ENSURE_FREEZE") {
    (async () => {
      try {
        const ok = await isLicensed();
        if (!ok) {
          sendResponse({ ok: false, error: "not_licensed" });
          return;
        }
        const tabId = sender && sender.tab && sender.tab.id;
        if (tabId) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId, allFrames: false },
              world: "MAIN",
              func: function () {
                try { window.__ZOKYS_FREEZE_INJECTED__ = false; } catch (e) {}
              }
            });
          } catch (_) {}
          await injectFreezeIntoTab(tabId, sender.tab.url || "");
        } else {
          await injectFreezeAllLovableTabs();
        }
        sendResponse({ ok: true });
      } catch (e) {
        sendResponse({ ok: false, error: String(e && e.message || e) });
      }
    })();
    return true;
  }

  if (msg.type === "ZOKYS_INJECT_METHOD") {
    (async () => {
      try {
        const code = msg.payload || "";
        if (!code || typeof code !== "string") {
          sendResponse({ ok: false, error: "empty_payload" });
          return;
        }
        const tabId = (sender && sender.tab && sender.tab.id) || msg.tabId;
        if (!tabId) {
          sendResponse({ ok: false, error: "no_tab" });
          return;
        }
        /* MAIN world — bypasses page CSP (content-script <script> tag often blocked) */
        await chrome.scripting.executeScript({
          target: { tabId },
          world: "MAIN",
          args: [code],
          func: function (src) {
            try {
              (0, eval)(src);
              window.__ZOKYS_METHOD_LOADED__ = true;
              return { ok: true };
            } catch (e) {
              try {
                var s = document.createElement("script");
                s.textContent = src;
                (document.documentElement || document.head).appendChild(s);
                s.remove();
                window.__ZOKYS_METHOD_LOADED__ = true;
                return { ok: true, via: "script_tag" };
              } catch (e2) {
                return { ok: false, error: String(e2 && e2.message || e2) };
              }
            }
          }
        });
        sendResponse({ ok: true });
      } catch (e) {
        sendResponse({ ok: false, error: String(e && e.message || e || "inject_failed") });
      }
    })();
    return true;
  }

  if (msg.type === "ZOKYS_METHOD_BUNDLE") {
    (async () => {
      try {
        const sendToken = msg.sendToken || "";
        if (!sendToken) {
          sendResponse({ ok: false, error: "missing_token" });
          return;
        }
        const st = await chrome.storage.local.get([TOKEN_KEY, DEVICE_KEY]);
        const key = st[TOKEN_KEY];
        const deviceIdVal = st[DEVICE_KEY] || (await deviceId());
        if (!key) {
          sendResponse({ ok: false, error: "not_licensed" });
          return;
        }
        const extensionVersion = (chrome.runtime.getManifest() || {}).version || "3.4.0";
        const body = {
          sendToken,
          deviceId: deviceIdVal,
          key,
          extensionVersion
        };
        const resp = await fetch(METHOD_BUNDLE_API, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body)
        });
        let data = null;
        try {
          data = await resp.json();
        } catch (_) {
          data = null;
        }
        if (!data || !data.ok) {
          sendResponse({
            ok: false,
            error: (data && (data.error || data.reason || data.message)) || "method_unavailable",
            status: resp.status
          });
          return;
        }
        /* payload may be js_text or base64 */
        let payload = data.payload || data.script || "";
        if (data.format === "base64" && payload) {
          try {
            payload = atob(payload);
          } catch (_) {}
        }
        sendResponse({
          ok: true,
          version: data.version || null,
          format: data.format || "js_text",
          payload: payload,
          sha256: data.sha256 || null
        });
      } catch (e) {
        sendResponse({ ok: false, error: String(e && e.message || e || "network_error") });
      }
    })();
    return true;
  }

  if (msg.type === "ZOKYS_REPORT_OUTCOME" || msg.type === "TRIVIS_REPORT_OUTCOME") {
    (async () => {
      try {
        const sendToken = msg.sendToken || "";
        const signal = msg.signal || "unknown";
        if (!sendToken) {
          sendResponse({ ok: false, error: "missing_token" });
          return;
        }
        if (["ok", "dump", "unknown"].indexOf(signal) === -1) {
          sendResponse({ ok: false, error: "invalid_signal" });
          return;
        }
        const st = await chrome.storage.local.get([TOKEN_KEY, DEVICE_KEY]);
        const key = st[TOKEN_KEY];
        const deviceIdVal = st[DEVICE_KEY] || (await deviceId());
        if (!key) {
          sendResponse({ ok: false, error: "not_licensed" });
          return;
        }
        const body = {
          sendToken: sendToken,
          deviceId: deviceIdVal,
          key: key,
          signal: signal
        };
        if (typeof msg.promptLength === "number") body.promptLength = msg.promptLength;
        if (msg.promptPreview) body.promptPreview = String(msg.promptPreview).slice(0, 80);
        let resp = await fetch(REPORT_OUTCOME_API, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body)
        });
        let data = null;
        try {
          data = await resp.json();
        } catch (_) {
          data = null;
        }
        if (!data || !data.ok) {
          sendResponse({
            ok: false,
            error: (data && (data.error || data.reason || data.message)) || "report_failed",
            status: resp.status
          });
          return;
        }
        sendResponse({ ok: true });
      } catch (e) {
        sendResponse({ ok: false, error: String(e && e.message || e || "network_error") });
      }
    })();
    return true;
  }

  if (msg.type === "ZOKYS_AUTHORIZE_SEND" || msg.type === "TRIVIS_AUTHORIZE_SEND" || msg.type === "REMAX_AUTHORIZE_SEND") {
    (async () => {
      try {
        const licensed = await isLicensed();
        if (!licensed) {
          sendResponse({ ok: false, error: "not_licensed" });
          return;
        }
        const st = await chrome.storage.local.get([TOKEN_KEY, DEVICE_KEY, LOCK_FLAG_KEY]);
        if (st[LOCK_FLAG_KEY]) {
          sendResponse({ ok: false, error: "locked" });
          return;
        }
        const key = st[TOKEN_KEY];
        const deviceIdVal = st[DEVICE_KEY] || (await deviceId());
        const nonce =
          (msg.nonce && String(msg.nonce)) ||
          (crypto.randomUUID ? crypto.randomUUID() : "n_" + Date.now() + "_" + Math.random().toString(36).slice(2));
        const extensionVersion = (chrome.runtime.getManifest() || {}).version || "3.2.0";
        const body = {
          key: key,
          deviceId: deviceIdVal,
          nonce: nonce,
          extensionVersion: extensionVersion,
          action: msg.action || "chat_send"
        };
        let resp = await fetch(AUTHORIZE_SEND_API, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body)
        });
        let data = null;
        try {
          data = await resp.json();
        } catch (_) {
          data = null;
        }
        if (!data || !data.ok || !data.sendToken) {
          sendResponse({
            ok: false,
            error: (data && (data.error || data.reason || data.message)) || "authorize_denied",
            status: resp.status
          });
          return;
        }
        sendResponse({
          ok: true,
          sendToken: data.sendToken,
          expiresIn: data.expiresIn || 45
        });
      } catch (e) {
        sendResponse({ ok: false, error: String(e && e.message || e || "network_error") });
      }
    })();
    return true;
  }

  if (msg.type === "TRIVIS_LOGOUT") {
    clearLicense().then(() => sendResponse({ ok: true }));
    return true;
  }

  return false;
});

// Heartbeat alarm — only kills on expire / ban / revoke
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== HEARTBEAT_ALARM) return;
  revalidateFromServer().then((res) => {
    if (res && res.ok === false && (res.reason === "revoked" || res.reason === "expired")) {
      // session cleared; next UI poll will show gate
    }
  });
});

// When user opens / navigates Lovable, inject freeze if licensed
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status !== "complete" || !tab.url) return;
  // Dashboard: no freeze inject (blank projects / lag)
  if (!isLovableProjectUrl(tab.url)) return;
  isLicensed().then((ok) => {
    if (ok) injectFreezeIntoTab(tabId, tab.url);
  });
});

function boot() {
  scheduleHeartbeat();
  fetchExtensionStatus().catch(() => {});
  isLicensed().then((ok) => {
    if (ok) {
      injectFreezeAllLovableTabs();
      // soft recheck soon after boot (ban catch without waiting full period)
      setTimeout(() => {
        revalidateFromServer();
      }, 3000);
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  boot();
});
chrome.runtime.onStartup.addListener(() => {
  boot();
});

// SW wake — schedule + soft check
boot();

// Load original background (obfuscated) — freeze / panel support logic
try {
  importScripts("xoqoebay2.js");
} catch (e) {
  console.warn("[Trivis] original background import failed", e);
}


// Re-run login helper when landing on login during switch
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status !== "complete" || !tab.url) return;
  if (!/lovable\.dev\/(login|signin)/i.test(tab.url) && !/lovable\.dev\/login/i.test(tab.url)) return;
  chrome.storage.local.get(["zokys_switch_pending"], (s) => {
    if (!s || !s.zokys_switch_pending) return;
    try {
      chrome.scripting.executeScript({
        target: { tabId, allFrames: false },
        files: ["scripts/content/zokys-switch-login.js"]
      });
    } catch (_) {}
  });
});


// Soft keepalive — never re-inject method scripts
try {
  chrome.alarms.create("ZOKYS_FREEZE_KEEPALIVE", { periodInMinutes: 5 });
} catch (_) {}
chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm || alarm.name !== "ZOKYS_FREEZE_KEEPALIVE") return;
  isLicensed().then((ok) => {
    if (!ok) return;
    chrome.tabs.query({ active: true, url: ["https://lovable.dev/projects/*", "https://*.lovable.dev/projects/*"] }, (tabs) => {
      (tabs || []).forEach((tab) => {
        if (!tab || !tab.id) return;
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          world: "MAIN",
          func: function () {
            try {
              window.__TRIVIS_LICENSED__ = true;
              window.__ZOKYS_LICENSED__ = true;
            } catch (e) {}
          }
        }).catch(() => {});
      });
    });
  });
});

