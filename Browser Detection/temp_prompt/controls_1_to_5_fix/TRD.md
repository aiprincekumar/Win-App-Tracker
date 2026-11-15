# Popup Media Controls 1 to 5 Fix — Technical Requirements Document (TRD)

> **Task ID:** `TASK-MEDIA-CTRL-FS-FIX-001`  
> **Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Document Type:** Technical Requirements Document (TRD)  
> **Target Path:** `temp_prompt/controls_1_to_5_fix/TRD.md`  

---

## 🏛️ 1. Technical Architecture & IPC Protocols

### 1.1 Message Router Flaw & Corrected Schema in `content_media.js`

#### Defective Implementation:
```javascript
// DEFECTIVE (content_media.js lines 1879-1893):
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || (!message.type && !message.action)) return;
  const actionType = message.action || message.type; // <-- RESOLVES TO 'toggle_play'
  if (actionType === 'GET_DOMAINS') { ... }
  if (actionType === 'MEDIA_CONTROL') { // <-- EVALUATES TO FALSE!
    const result = handleMediaControl(message.action, message.data || {});
    sendResponse(result);
    return true;
  }
});
```

#### Corrected Architectural Pattern:
```javascript
// CORRECTED (content_media.js):
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) return;
  const msgType = message.type || '';
  const msgAction = message.action || '';

  // 1. Telemetry / Query Media State
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

  // 3. Direct Media Action Fallback
  if (KNOWN_MEDIA_ACTIONS.has(msgAction) || KNOWN_MEDIA_ACTIONS.has(msgType)) {
    const targetAction = KNOWN_MEDIA_ACTIONS.has(msgAction) ? msgAction : msgType;
    const result = handleMediaControl(targetAction, message.data || message);
    sendResponse(result);
    return true;
  }
});
```

### 1.2 Recognized Media Actions Roster (`KNOWN_MEDIA_ACTIONS`)
```javascript
const KNOWN_MEDIA_ACTIONS = new Set([
  'play', 'pause', 'toggle_play',
  'seek_relative', 'seek_percent', 'seek_to',
  'toggle_mute', 'set_volume', 'volume_step',
  'step_speed', 'set_speed', 'cycle_speed',
  'toggle_fullscreen', 'toggle_pip', 'toggle_theater',
  'dim_cinematic'
]);
```

---

## 🖥️ 2. Fullscreen Overlay HUD Linking Architecture

### 2.1 Dual-Execution Pattern for `#btnCtrlFullscreen` in `popup/popup.js`
1. **Tier 1 (Instant In-Page DOM Execution):**
   Execute script directly in the page's `MAIN` world via `browserAPI.scripting.executeScript`:
   ```javascript
   func: () => {
     // Priority 1: Trigger in-page Floating Sentinel Fullscreen HUD Button
     const floatingBtn = document.getElementById('__sentinel_fs_floating_btn__');
     if (floatingBtn) {
       try { floatingBtn.click(); return; } catch (_) {}
     }
     // Priority 2: Use dedicated Sentinel Fullscreen Controller instance
     if (window.__SentinelFullscreenController && typeof window.__SentinelFullscreenController.toggle === 'function') {
       try { window.__SentinelFullscreenController.toggle(null, { forceWeb: true }); return; } catch (_) {}
     }
     // Priority 3: Native player button fallback
     const ytFsBtn = document.querySelector('#movie_player .ytp-fullscreen-button') || document.querySelector('.ytp-fullscreen-button');
     if (ytFsBtn) { try { ytFsBtn.click(); return; } catch (_) {} }
   }
   ```
2. **Tier 2 (Background IPC Relay):**
   Dispatch `sendMediaControl('toggle_fullscreen')` to notify the background worker and content script handlers of the state change.

---

## 🛡️ 3. Verification & Compliance Standards

- **W3C Trusted Types:** Injected execution snippets must use `.click()` and direct method invocation; no `innerHTML` injection.
- **Node.js Compilation Gate:** `node -c content_media.js` and `node -c popup/popup.js` must pass with zero syntax errors.
- **Automated Test Gate:** `node tests/test_media_controls_and_fullscreen_fix.js` must execute all 7 test categories with 100% pass rate.
