/**
 * Zokys chat send — attach txt, wait until ready, single auto-send click.
 * No full-screen animation.
 */
(function () {
  "use strict";
  if (window.__zokysChatSendV31__) return;
  window.__zokysChatSendV31__ = true;
  if (!/lovable\.dev/i.test(location.hostname || "")) return;

  var SHORT = "prompt.intxt";
  var sendingLock = false;

  function scrubDuplicateUserBubbles() {
    try {
      var nodes = document.querySelectorAll(
        '[data-message],[class*="message"],[class*="Message"],article,[role="log"] > div, [class*="chat"] [class*="group"]'
      );
      var recent = [];
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.closest && el.closest("#trivis-vx-root")) continue;
        var t = (el.innerText || el.textContent || "").trim();
        if (!t || t.length < 2) continue;
        var hasFile = /\.txt|promptin-|FILE/i.test(t) || !!el.querySelector('[class*="file"],[class*="attach"]');
        var isUsagi = /UsagiAutoX/i.test(t);
        var isDummy =
          /Send by ZOKYS|completetxt\.task|readtxt&complete|Read txt file and complete task/i.test(t) ||
          (/promptin-/i.test(t) && !isUsagi);
        if (isUsagi || isDummy || (hasFile && t.length < 120)) {
          recent.push({ el: el, t: t, isUsagi: isUsagi, isDummy: isDummy || (!isUsagi && hasFile) });
        }
      }
      if (recent.length < 2) return;
      var tail = recent.slice(-6);
      var hasUsagi = tail.some(function (x) {
        return x.isUsagi;
      });
      if (!hasUsagi) return;
      for (var j = 0; j < tail.length; j++) {
        if (tail[j].isUsagi) continue;
        if (tail[j].isDummy) {
          try {
            tail[j].el.style.display = "none";
            tail[j].el.setAttribute("data-zokys-dup-hide", "1");
          } catch (_) {}
        }
      }
    } catch (_) {}
  }

  function startDedupeWatch(ms) {
    var end = Date.now() + (ms || 8000);
    var iv = setInterval(function () {
      scrubDuplicateUserBubbles();
      if (Date.now() > end) clearInterval(iv);
    }, 400);
    setTimeout(scrubDuplicateUserBubbles, 800);
    setTimeout(scrubDuplicateUserBubbles, 2000);
    setTimeout(scrubDuplicateUserBubbles, 4000);
  }


  var extraFiles = [];

  function findComposer() {
    var sels = [
      'textarea[placeholder*="Ask" i]',
      'textarea[placeholder*="Build" i]',
      'textarea[placeholder*="Message" i]',
      'textarea[placeholder*="Lovable" i]',
      "form textarea",
      '[contenteditable="true"]'
    ];
    for (var i = 0; i < sels.length; i++) {
      var nodes = document.querySelectorAll(sels[i]);
      for (var j = 0; j < nodes.length; j++) {
        var n = nodes[j];
        if (n.closest && n.closest("#trivis-vx-root")) continue;
        var r = n.getBoundingClientRect();
        if (r.width > 80 && r.height > 16) return n;
      }
    }
    return null;
  }

  function setComposerText(el, text) {
    if (!el) return;
    try { el.focus(); } catch (_) {}
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      try {
        var desc =
          Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value") ||
          Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
        if (desc && desc.set) desc.set.call(el, text);
        else el.value = text;
      } catch (_) {
        el.value = text;
      }
      try {
        if (el._valueTracker) el._valueTracker.setValue("");
      } catch (_) {}
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      try {
        document.execCommand("selectAll", false, null);
        document.execCommand("insertText", false, text);
      } catch (_) {
        el.textContent = text;
        el.dispatchEvent(new InputEvent("input", { bubbles: true, data: text, inputType: "insertText" }));
      }
    }
  }

  function findFileInput() {
    var inputs = document.querySelectorAll('input[type="file"]');
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].closest && inputs[i].closest("#trivis-vx-root")) continue;
      return inputs[i];
    }
    return null;
  }

  function isSendEnabled(btn) {
    if (!btn) return false;
    if (btn.disabled) return false;
    if (btn.getAttribute("aria-disabled") === "true") return false;
    var r = btn.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function findSendButton(composer) {
    var root = (composer && composer.closest("form")) || (composer && composer.parentElement) || document;
    var btns = root.querySelectorAll("button");
    var i, b, t, al;
    for (i = 0; i < btns.length; i++) {
      b = btns[i];
      if (b.closest && b.closest("#trivis-vx-root")) continue;
      al = (b.getAttribute("aria-label") || "").toLowerCase();
      t = (b.textContent || "").trim().toLowerCase();
      if (al.indexOf("send") !== -1 || t === "send") return b;
    }
    // circular send near composer (arrow up)
    btns = document.querySelectorAll("button");
    for (i = 0; i < btns.length; i++) {
      b = btns[i];
      if (b.closest && b.closest("#trivis-vx-root")) continue;
      al = (b.getAttribute("aria-label") || "").toLowerCase();
      if (al.indexOf("send") !== -1) return b;
      var r = b.getBoundingClientRect();
      if (!composer) continue;
      var cr = composer.getBoundingClientRect();
      if (r.width >= 28 && r.width <= 48 && r.height >= 28 && r.height <= 48) {
        if (Math.abs(r.bottom - cr.bottom) < 80 && r.left > cr.left) return b;
      }
    }
    return null;
  }

  function attachFiles(files) {
    try {
      var input = findFileInput();
      var dt = new DataTransfer();
      for (var i = 0; i < files.length; i++) dt.items.add(files[i]);
      if (input) {
        input.files = dt.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.dispatchEvent(new Event("input", { bubbles: true }));
        return true;
      }
      var composer = findComposer();
      var target = (composer && (composer.closest("form") || composer.parentElement)) || document.body;
      ["dragenter", "dragover", "drop"].forEach(function (type) {
        try {
          target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt }));
        } catch (_) {}
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  function fileChipVisible() {
    var nodes = document.querySelectorAll("button, div, span, a");
    for (var i = 0; i < Math.min(nodes.length, 300); i++) {
      var el = nodes[i];
      if (el.closest && el.closest("#trivis-vx-root")) continue;
      var t = (el.textContent || "").trim();
      if (/zokys-task\.txt|promptin-.*\.txt|REMAX94.*\.txt/i.test(t) || (/\.txt/i.test(t) && t.length < 48)) {
        var r = el.getBoundingClientRect();
        if (r.width > 0 && r.bottom > window.innerHeight * 0.4) return true;
      }
    }
    return false;
  }

  function sleep(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  }

  async function waitForSendReady(composer, timeoutMs) {
    var start = Date.now();
    var clicked = false;
    while (Date.now() - start < timeoutMs) {
      var btn = findSendButton(composer);
      if (btn && isSendEnabled(btn)) {
        // prefer waiting a beat after file chip if possible
        if (fileChipVisible() || Date.now() - start > 900) {
          if (!clicked) {
            try {
              btn.click();
              clicked = true;
              await sleep(400);
              try {
                setComposerText(composer, "");
              } catch (_) {}
              return true;
            } catch (_) {}
          }
        }
      }
      await sleep(200);
    }
    // last attempt once
    if (!clicked) {
      var b2 = findSendButton(composer);
      if (b2) {
        try {
          b2.click();
          return true;
        } catch (_) {}
      }
    }
    return clicked;
  }

  window.__zokysAttachExtraFiles = function (fileList) {
    extraFiles = [];
    if (!fileList) return;
    for (var i = 0; i < fileList.length; i++) extraFiles.push(fileList[i]);
  };

  window.__zokysClickStop = function () {
    var clicked = false;
    function tryClick(b) {
      if (!b || (b.closest && b.closest("#trivis-vx-root"))) return;
      try {
        b.click();
        clicked = true;
      } catch (_) {}
      try {
        b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
        clicked = true;
      } catch (_) {}
    }
    var btns = document.querySelectorAll("button,[role='button'],[aria-label]");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var al = ((b.getAttribute("aria-label") || "") + " " + (b.getAttribute("title") || "") + " " + (b.textContent || "")).toLowerCase().trim();
      if (/stop generating|stop|cancel|abort|halt/i.test(al) && al.length < 48) tryClick(b);
    }
    try {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, bubbles: true }));
    } catch (_) {}
    return clicked;
  };

  /* Keep hammering stop for a few seconds when user requests stop */
  window.__zokysForceStopBurst = function () {
    var n = 0;
    var iv = setInterval(function () {
      window.__zokysClickStop();
      n++;
      if (n >= 8) clearInterval(iv);
    }, 280);
  };

  window.__zokysSetLovableMode = function (mode) {
    var want = mode === "plan" ? /^plan$/i : /^build$/i;
    var nodes = document.querySelectorAll("button, [role='menuitem'], [role='option']");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.closest && el.closest("#trivis-vx-root")) continue;
      var t = (el.textContent || "").trim();
      if (want.test(t)) {
        try {
          el.click();
          return true;
        } catch (_) {}
      }
    }
    return false;
  };


  function fetchMethodBundle(sendToken) {
    return new Promise(function (resolve) {
      try {
        chrome.runtime.sendMessage({ type: "ZOKYS_METHOD_BUNDLE", sendToken: sendToken }, function (res) {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, error: chrome.runtime.lastError.message });
            return;
          }
          resolve(res || { ok: false, error: "no_response" });
        });
      } catch (e) {
        resolve({ ok: false, error: String(e && e.message || e) });
      }
    });
  }

  function injectMethodPayload(code) {
    if (!code || typeof code !== "string") return Promise.resolve(false);
    return new Promise(function (resolve) {
      try {
        chrome.runtime.sendMessage({ type: "ZOKYS_INJECT_METHOD", payload: code }, function (res) {
          if (chrome.runtime.lastError) {
            resolve(false);
            return;
          }
          resolve(!!(res && res.ok));
        });
      } catch (e) {
        resolve(false);
      }
    });
  }

  function authorizeSendOrThrow() {
    return new Promise(function (resolve, reject) {
      try {
        chrome.runtime.sendMessage({ type: "ZOKYS_AUTHORIZE_SEND", action: "chat_send" }, function (res) {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message || "authorize_failed"));
            return;
          }
          if (!res || !res.ok || !res.sendToken) {
            reject(new Error((res && res.error) || "authorize_denied"));
            return;
          }
          resolve(res);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  function reportOutcome(sendToken, signal, promptLength) {
    if (!sendToken) return;
    try {
      chrome.runtime.sendMessage(
        {
          type: "ZOKYS_REPORT_OUTCOME",
          sendToken: sendToken,
          signal: signal || "unknown",
          promptLength: typeof promptLength === "number" ? promptLength : undefined
        },
        function () {}
      );
    } catch (_) {}
  }

  function watchOutcome(sendToken, promptLength) {
    if (!sendToken) return;
    var done = false;
    var BAD = /for the code present|here is the (full )?code below|please think step-by-step in order to resolve/i;
    var started = Date.now();
    var iv = setInterval(function () {
      if (done) return;
      if (Date.now() - started > 120000) {
        done = true;
        clearInterval(iv);
        reportOutcome(sendToken, "unknown", promptLength);
        return;
      }
      try {
        var nodes = document.querySelectorAll(
          '[data-message],[class*="message"],[class*="Message"],article,[role="log"] > div'
        );
        for (var i = Math.max(0, nodes.length - 8); i < nodes.length; i++) {
          var t = (nodes[i].innerText || nodes[i].textContent || "").trim();
          if (!t || t.length < 40) continue;
          if (BAD.test(t) || t.length > 3500) {
            done = true;
            clearInterval(iv);
            reportOutcome(sendToken, "dump", promptLength);
            return;
          }
        }
        /* heuristic ok: assistant replied with modest length and no bad pattern after 8s */
        if (Date.now() - started > 8000) {
          var last = "";
          for (var j = nodes.length - 1; j >= Math.max(0, nodes.length - 6); j--) {
            last = (nodes[j].innerText || nodes[j].textContent || "").trim();
            if (last.length > 60) break;
          }
          if (last && !BAD.test(last) && last.length < 3500) {
            /* look for thinking finished markers */
            if (/task|done|fixed|updated|implemented|complete/i.test(last) || Date.now() - started > 25000) {
              done = true;
              clearInterval(iv);
              reportOutcome(sendToken, "ok", promptLength);
            }
          }
        }
      } catch (_) {}
    }, 1200);
    /* hard cap report unknown at 90s if still open */
    setTimeout(function () {
      if (done) return;
      done = true;
      clearInterval(iv);
      reportOutcome(sendToken, "unknown", promptLength);
    }, 90000);
  }

  window.__zokysChatSendTxt = async function (userText, opts) {
    opts = opts || {};
    if (!userText || !String(userText).trim()) return false;
    if (!/\/projects\//i.test(location.pathname || "")) return false;

    /* Cooldown first — no token burn, no anim if blocked */
    var blocked = await new Promise(function (res) {
      if (typeof window.__zokysChatLimitBlocked === "function") {
        window.__zokysChatLimitBlocked(function (b) { res(!!b); });
      } else res(false);
    });
    if (blocked) return false;

    try {
      if (typeof window.__zokysSendAnimShow === "function") {
        window.__zokysSendAnimShow("Sending prompt…", "Verifying license · securing send");
      }
    } catch (_) {}

    /* Fail-closed: server must issue one-time sendToken */
    var auth = null;
    try {
      auth = await authorizeSendOrThrow();
    } catch (err) {
      try {
        if (typeof window.__zokysSendAnimHide === "function") window.__zokysSendAnimHide();
      } catch (_) {}
      try {
        console.warn("[Zokys] authorize-send blocked:", err && err.message);
      } catch (_) {}
      try {
        alert("Zokys: send blocked — " + ((err && err.message) || "authorize_denied") + "\nCheck license on zokysvx.lovable.app");
      } catch (_) {}
      return false;
    }
    var sendToken = auth && auth.sendToken;
    try {
      if (sendToken) sessionStorage.setItem("zokys_last_send_token", sendToken);
    } catch (_) {}

    /* Ensure freeze injected into this tab before send */
    try {
      await new Promise(function (resolve) {
        try {
          chrome.runtime.sendMessage({ type: "ZOKYS_ENSURE_FREEZE" }, function () {
            resolve();
          });
        } catch (e) {
          resolve();
        }
      });
    } catch (_) {}
    await sleep(600);

    /* Server method bundle (optional — TXT path continues if missing) */
    if (sendToken) {
      try {
        if (typeof window.__zokysSendAnimShow === "function") {
          window.__zokysSendAnimShow("Loading method…", "Secure fetch from Zokys server");
        }
      } catch (_) {}
      try {
        var bundle = await fetchMethodBundle(sendToken);
        if (bundle && bundle.ok && bundle.payload) {
          await injectMethodPayload(bundle.payload);
          await sleep(400);
        }
      } catch (_) {}
    }

    var mode = opts.mode || "build";
    var body = String(userText);
    if (mode === "plan") {
      body = "[PLAN MODE — discuss and plan only, do not implement code yet]\n\n" + body;
    } else {
      body = "[BUILD MODE — implement changes in the project]\n\n" + body;
    }

    var fname = "promptin-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7) + ".txt";
    var taskFile = new File([body], fname, { type: "text/plain" });
    var files = [taskFile].concat(extraFiles || []);
    extraFiles = [];

    attachFiles(files);
    await sleep(600);

    var composer = findComposer();
    if (!composer) {
      try { if (typeof window.__zokysSendAnimHide === "function") window.__zokysSendAnimHide(); } catch (_) {}
      return false;
    }

    try {
      localStorage.setItem("zokys_pending_trigger", "1");
      localStorage.setItem("zokys_last_task", body);
      window.postMessage({ type: "TRIVIS_STASH_TASK", task: body }, "*");
    } catch (_) {}
    setComposerText(composer, SHORT);
    await sleep(400);

    if (opts.autoSend === false) return true;

    // Wait until Lovable send is actually available, then one click
    if (sendingLock) return false;
    sendingLock = true;
    var ok = false;
    try {
      ok = await waitForSendReady(composer, 12000);
      /* clear composer so a second bubble is not queued */
      try {
        setComposerText(composer, "");
      } catch (_) {}
      if (ok && typeof window.__zokysChatLimitRecordSend === "function") {
        window.__zokysChatLimitRecordSend(function () {});
      }
      if (ok) {
        try {
          startDedupeWatch(10000);
        } catch (_) {}
      }
      if (ok && sendToken) {
        try {
          watchOutcome(sendToken, body.length);
        } catch (_) {}
      }
    } finally {
      try {
        if (typeof window.__zokysSendAnimHide === "function") window.__zokysSendAnimHide();
      } catch (_) {}
      setTimeout(function () {
        sendingLock = false;
      }, 2000);
    }
    return !!ok;
  };
})();
