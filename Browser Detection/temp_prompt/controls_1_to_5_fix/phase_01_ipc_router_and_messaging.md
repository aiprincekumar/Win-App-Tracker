# Phase 1: In-Page Content Script IPC Message Router Repair

> **Phase Number:** 1 of 3  
> **Phase Target:** `content_media.js`  
> **Target Path:** `temp_prompt/controls_1_to_5_fix/phase_01_ipc_router_and_messaging.md`  
> **Assigned Role:** Level 4 Chrome Extension Engineer  
> **Lead Department:** Dept 04 Chrome Extension Engineering  
> **Test Gate:** `node -c content_media.js` & IPC envelope parser unit verification  

---

## 🎯 1. Phase Objective
Repair the incoming message router in [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js) so that:
1. Messages dispatched with the envelope `{ type: 'MEDIA_CONTROL', action: '<action_name>', data: { ... } }` or `{ action: '<action_name>' }` are properly extracted and routed to `handleMediaControl(action, data)`.
2. Variable `actionType` is decoupled into `msgType` and `msgAction` so that `msgType === 'MEDIA_CONTROL'` does not fail when `message.action` contains the specific command (e.g., `'toggle_play'`).
3. `handleMediaControl('toggle_fullscreen')` prioritizes triggering `document.getElementById('__sentinel_fs_floating_btn__').click()` or invoking `window.__SentinelFullscreenController.toggle()`.

---

## 📂 2. Target Files & Line Anchors
- **Primary File:** [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js)
  - Anchors: Lines 1642-1675 (`handleMediaControl` fullscreen case)
  - Anchors: Lines 1870-1920 (`browserAPI.runtime.onMessage.addListener`)

---

## 🛠️ 3. Concrete Implementation Steps

### Step 1.1: Refactor `onMessage.addListener` Router
In [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js), replace the naive single variable `actionType = message.action || message.type` with decoupled message identification:
```javascript
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

### Step 1.2: Upgrade `toggle_fullscreen` Handler in `handleMediaControl`
Ensure `case 'toggle_fullscreen':` checks for the in-page Floating Sentinel Fullscreen HUD Button:
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
    // Native player fallback
    toggleNativeFullscreen(primaryMediaElement);
  }
  break;
}
```

---

## 🚦 4. Verification Gate & Deliverables Manifest
1. Run syntax check:
   ```powershell
   node -c content_media.js
   ```
2. Run automated test gate:
   ```powershell
   node tests/test_media_controls_and_fullscreen_fix.js
   ```
3. Deliverables: Clean `content_media.js` with verified zero IPC packet drops.
