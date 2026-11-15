# Phase 1: IPC Message Dispatch & content_media.js Router Fix

> **Task ID:** `TASK-MEDIA-CTRL-FS-FIX-001-P01`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target File:** [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js)  
> **Author & Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Assigned Role:** Level 4 Backend/Content Script Engineer  
> **Status:** READY FOR SUBAGENT EXECUTION  

---

## 🎯 1. Phase Objective

Fix the critical message routing bug in `content_media.js` that causes all media control commands forwarded from `background.js` or sent by `popup.js` (`toggle_play`, `seek_relative`, `seek_percent`, `toggle_mute`, `set_volume`, `step_speed`, `set_speed`, `cycle_speed`, `toggle_fullscreen`, `toggle_pip`, `toggle_theater`) to be silently dropped. Furthermore, enhance `handleMediaControl('toggle_fullscreen')` to check for the in-page Floating Sentinel Fullscreen HUD Button (`#__sentinel_fs_floating_btn__`) and trigger it cleanly before falling back to keyboard/web-fullscreen logic.

---

## 📋 2. Prerequisites & Inputs

- Target file: `content_media.js`
- Requires active authorization token issued by Level 2 Manager (`AUTH-MGR-*`).
- Adherence to Universal Rule 5 (UTF-8 with BOM `0xEF, 0xBB, 0xBF`), Rule 8 (Zero `.innerHTML` assignments), and Rule 27 (Syntax integrity).

---

## 🔍 3. Technical Context & File Anchors

### 3.1 The Bug Anchor: `content_media.js` (Lines 1878-1915)
```javascript
  // Runtime IPC Message Listener (Queries & Controls)
  browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || (!message.type && !message.action)) return;
    const actionType = message.action || message.type;

    if (actionType === 'QUERY_PAGE_MEDIA') {
      const { currentState } = evaluatePageMediaState();
      sendResponse(currentState);
      return true;
    }

    if (actionType === 'MEDIA_CONTROL') {
      const result = handleMediaControl(message.action, message.data || {});
      sendResponse(result);
      return true;
    }

    if (actionType === 'SET_VOLUME') {
      const result = handleMediaControl('set_volume', message.data || { volume: message.volume, percent: message.percent });
      sendResponse(result);
      return true;
    }

    if (actionType === 'FADE_AND_PAUSE') {
      executeSmoothFadeAndPause(message.fadeDurationSeconds || 30);
      sendResponse({ received: true });
      return true;
    }

    if (actionType === 'PAUSE_MEDIA') {
      if (fadeIntervalId) {
        clearInterval(fadeIntervalId);
        fadeIntervalId = null;
      }
      try {
        const { primaryMediaElement } = evaluatePageMediaState();
        if (primaryMediaElement && !primaryMediaElement.paused) {
          primaryMediaElement.pause();
        }
      } catch (_) {}
      sendResponse({ paused: true });
      return true;
    }
```

### 3.2 Root Cause Analysis
In `background.js` (lines 2808-2812), media commands are forwarded to content scripts as:
```javascript
safeSendTabMessage(targetTabId, {
  type: 'MEDIA_CONTROL',
  action: message.action,
  data: message.data || {}
}, ...)
```
When `message.action` is `'toggle_play'` (or any specific control), `const actionType = message.action || message.type;` evaluates `actionType = 'toggle_play'`.
Then, `if (actionType === 'MEDIA_CONTROL')` evaluates to **FALSE**.
Because there is no top-level check for `actionType === 'toggle_play'`, the message is never routed to `handleMediaControl` and execution exits silently with zero feedback.

### 3.3 Fullscreen Handling Anchor: `content_media.js` (Lines 1652-1669)
```javascript
          case 'toggle_fullscreen': {
            if (window.__SentinelFullscreenController && typeof window.__SentinelFullscreenController.toggle === 'function') {
              window.__SentinelFullscreenController.toggle(null, { forceWeb: true });
            } else {
              forwardActionToMainWorld('toggle_fullscreen', data);
              const ytFsBtn = document.querySelector('#movie_player .ytp-fullscreen-button') || document.querySelector('.ytp-fullscreen-button');
              if (ytFsBtn) {
                try { ytFsBtn.click(); } catch (_) {}
              } else {
                try {
                  const ev = new KeyboardEvent('keydown', { key: 'f', code: 'KeyF', keyCode: 70, which: 70, bubbles: true });
                  (document.getElementById('movie_player') || document).dispatchEvent(ev);
                } catch (_) {}
              }
              toggleWebFullscreen(primaryMediaElement);
            }
            break;
          }
```
If the floating button element `#__sentinel_fs_floating_btn__` has been mounted into the DOM, clicking it or invoking `__SentinelFullscreenController.toggle()` directly provides the cleanest, most reliable interaction.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1.1: Restructure `browserAPI.runtime.onMessage.addListener`
In `content_media.js` around line 1879:
Replace the flawed `actionType` resolution with robust message structure parsing:
```javascript
  // Runtime IPC Message Listener (Queries & Controls)
  browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || (!message.type && !message.action)) return;

    const msgType = message.type || '';
    const msgAction = message.action || '';

    // 1. Telemetry Query
    if (msgType === 'QUERY_PAGE_MEDIA' || msgAction === 'QUERY_PAGE_MEDIA') {
      const { currentState } = evaluatePageMediaState();
      sendResponse(currentState);
      return true;
    }

    // 2. Standard MEDIA_CONTROL Envelope (from background worker or popup)
    if (msgType === 'MEDIA_CONTROL' || msgAction === 'MEDIA_CONTROL') {
      const targetAction = message.action && message.action !== 'MEDIA_CONTROL'
        ? message.action
        : (message.data && message.data.action);
      const targetData = message.data || {};
      const result = handleMediaControl(targetAction, targetData);
      sendResponse(result);
      return true;
    }

    // 3. Direct Media Action Fallback (when action is sent directly as type or action)
    const KNOWN_MEDIA_ACTIONS = [
      'play', 'pause', 'toggle_play', 'seek_relative', 'seek_percent',
      'toggle_mute', 'set_volume', 'SET_VOLUME', 'step_speed', 'set_speed',
      'cycle_speed', 'toggle_fullscreen', 'toggle_pip', 'toggle_theater',
      'step_quality', 'set_quality'
    ];
    if (KNOWN_MEDIA_ACTIONS.includes(msgAction) || KNOWN_MEDIA_ACTIONS.includes(msgType)) {
      const targetAction = KNOWN_MEDIA_ACTIONS.includes(msgAction) ? msgAction : msgType;
      const targetData = message.data || (targetAction === 'set_volume' ? { volume: message.volume, percent: message.percent } : {});
      const result = handleMediaControl(targetAction, targetData);
      sendResponse(result);
      return true;
    }

    // 4. Dedicated SET_VOLUME Envelope
    if (msgType === 'SET_VOLUME' || msgAction === 'SET_VOLUME') {
      const result = handleMediaControl('set_volume', message.data || { volume: message.volume, percent: message.percent });
      sendResponse(result);
      return true;
    }

    // 5. Smooth Fade and Pause Envelope
    if (msgType === 'FADE_AND_PAUSE' || msgAction === 'FADE_AND_PAUSE') {
      executeSmoothFadeAndPause(message.fadeDurationSeconds || 30);
      sendResponse({ received: true });
      return true;
    }

    // 6. Direct PAUSE_MEDIA Command
    if (msgType === 'PAUSE_MEDIA' || msgAction === 'PAUSE_MEDIA') {
      if (fadeIntervalId) {
        clearInterval(fadeIntervalId);
        fadeIntervalId = null;
      }
      try {
        const { primaryMediaElement } = evaluatePageMediaState();
        if (primaryMediaElement && !primaryMediaElement.paused) {
          primaryMediaElement.pause();
        }
      } catch (_) {}
      sendResponse({ paused: true });
      return true;
    }
```

### Step 1.2: Enhance `handleMediaControl('toggle_fullscreen')`
In `content_media.js` (lines 1652-1669):
Update the `case 'toggle_fullscreen':` block to prioritize:
1. `document.getElementById('__sentinel_fs_floating_btn__')` — if present in DOM, trigger `.click()`.
2. `window.__SentinelFullscreenController.toggle(null, { forceWeb: true })` — if controller is loaded.
3. Fallbacks: `forwardActionToMainWorld('toggle_fullscreen', data)` and native YouTube player / `toggleWebFullscreen`.

```javascript
          case 'toggle_fullscreen': {
            const floatingBtn = document.getElementById('__sentinel_fs_floating_btn__');
            if (floatingBtn) {
              try {
                floatingBtn.click();
              } catch (_) {
                if (window.__SentinelFullscreenController && typeof window.__SentinelFullscreenController.toggle === 'function') {
                  window.__SentinelFullscreenController.toggle(null, { forceWeb: true });
                }
              }
            } else if (window.__SentinelFullscreenController && typeof window.__SentinelFullscreenController.toggle === 'function') {
              window.__SentinelFullscreenController.toggle(null, { forceWeb: true });
            } else {
              forwardActionToMainWorld('toggle_fullscreen', data);
              const ytFsBtn = document.querySelector('#movie_player .ytp-fullscreen-button') || document.querySelector('.ytp-fullscreen-button');
              if (ytFsBtn) {
                try { ytFsBtn.click(); } catch (_) {}
              } else {
                try {
                  const ev = new KeyboardEvent('keydown', { key: 'f', code: 'KeyF', keyCode: 70, which: 70, bubbles: true });
                  (document.getElementById('movie_player') || document).dispatchEvent(ev);
                } catch (_) {}
              }
              toggleWebFullscreen(primaryMediaElement);
            }
            break;
          }
```

---

## 🚫 5. Architectural Constraints & Boundaries

- **Zero Changes to Data Models:** Do not alter the structure of `activeMediaSessions` or `synthesizeGlobalMediaState()`.
- **W3C Trusted Types Compliance:** Zero assignments to `.innerHTML`.
- **UTF-8 with BOM Standard:** Ensure modified file preserves UTF-8 BOM encoding.

---

## 📦 6. Deliverables Manifest

1. Updated `content_media.js` with corrected `onMessage` listener and enhanced `toggle_fullscreen` handling.
2. Verification output from `node -c content_media.js`.

---

## 🧪 7. Local Verification Gate

```powershell
node -c content_media.js
node tests/test_syntax_and_manifest_integrity.js
```
Both commands must exit with code 0 and 0 errors.
