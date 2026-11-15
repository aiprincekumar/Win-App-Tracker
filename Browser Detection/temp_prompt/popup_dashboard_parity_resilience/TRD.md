# Technical Requirements Document (TRD)
## Parity Overhaul: Popup Mode & Dashboard Mode Media Controls Resilience & Fix Latent Bridge Bugs

> **Document Version:** 1.0.0  
> **Initiative:** Media Controls Parity & Bridge Resilience  
> **Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Governance:** Universal Rule 22 & [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  

---

## 🏗️ 1. High-Level Design (HLD) & Architectural Overview

The Chrome extension uses a 4-tier execution topology to manage media across multiple tabs:
1. **Presentation Tier:** Popup Mode (`popup/popup.js`) and Dashboard Mode (`dashboard/dashboard.js`).
2. **Orchestration Tier:** Background Service Worker (`background.js`) synthesizing global media state and routing IPC envelopes.
3. **Isolation Tier:** Content Script (`content_media.js`) operating in the MV3 isolated world.
4. **Execution Tier:** Main World Engine (`inject_main_world.js`) interacting directly with the YouTube player API and page context.

```
[ Popup / Dashboard ]
        │  sendMediaControl({ action, data, tabId })
        ▼
[ Background Service Worker ]
        │  safeSendTabMessage(tabId, { type: 'CONTROL_MEDIA', action, data })
        ▼
[ Content Script (Isolated World) ]
        ├── isBridgeActive? ──► [ Main World Engine (YouTube API / OSD) ]
        └── Fallback? ────────► [ Direct HTML5 Media Element ]
```

---

## 🔧 2. Low-Level Design (LLD) & Surgical Code Specifications

### 2.1 File 1: `inject_main_world.js`
- **Path:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\inject_main_world.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/inject_main_world.js)
- **Line Anchor:** Lines ~636–660
- **Existing Defective Implementation:**
  ```javascript
  case 'toggle_mute': {
    let isNowMuted = false;
    if (moviePlayer && typeof moviePlayer.isMuted === 'function') {
      try {
        if (moviePlayer.isMuted()) {
          if (typeof moviePlayer.unMute === 'function') moviePlayer.unMute();
          isNowMuted = false;
        } else {
          if (typeof moviePlayer.mute === 'function') moviePlayer.mute();
          isNowMuted = true;
        }
      } catch (_) {}
    }

    if (video) {
      try {
        video.muted = !video.muted;
        isNowMuted = video.muted;
      } catch (_) {}
    }

    showOSD(isNowMuted ? 'Muted' : 'Unmuted', isNowMuted ? '🔇' : '🔊');
    break;
  }
  ```
- **Surgical Correction Specification:**
  ```javascript
  case 'toggle_mute': {
    let isNowMuted = false;
    if (moviePlayer && typeof moviePlayer.isMuted === 'function') {
      try {
        if (moviePlayer.isMuted()) {
          if (typeof moviePlayer.unMute === 'function') moviePlayer.unMute();
          isNowMuted = false;
        } else {
          if (typeof moviePlayer.mute === 'function') moviePlayer.mute();
          isNowMuted = true;
        }
      } catch (_) {}
    } else if (video) {
      try {
        video.muted = !video.muted;
        isNowMuted = video.muted;
      } catch (_) {}
    }

    showOSD(isNowMuted ? 'Muted' : 'Unmuted', isNowMuted ? '🔇' : '🔊');
    break;
  }
  ```
- **Architectural Invariant:** Mutually exclusive execution guarantees that `video.muted` is NEVER flipped a second time when `moviePlayer` has already processed the mute toggle.

---

### 2.2 File 2: `content_media.js`
- **Path:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js)
- **Line Anchor:** Lines ~1577–1605
- **Existing Fragile Implementation:**
  ```javascript
  function handleMediaControl(action, data = {}) {
    const { primaryMediaElement } = evaluatePageMediaState();
    if (!isTopFrame && !primaryMediaElement) {
      return { success: false, ignored: true, reason: 'No media in this subframe' };
    }

    const isYouTube = typeof isYouTubeDomain === 'function'
      ? isYouTubeDomain()
      : Boolean(typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname.includes('youtube.com'));

    const isBridgeActive = typeof isMainWorldBridgeActive === 'function'
      ? isMainWorldBridgeActive()
      : Boolean(typeof document !== 'undefined' && (document.documentElement || document.body) && typeof (document.documentElement || document.body).getAttribute === 'function' && (document.documentElement || document.body).getAttribute('data-sentinel-bridge-ready') === 'true');

    const isMainWorldTarget = isYouTube || isBridgeActive;

    // 1. Forward action to Main World engine (essential for YouTube native player methods, volume slider & OSD)
    // Avoid double-toggle race for toggle_fullscreen across isolated and main worlds
    if (isMainWorldTarget && action !== 'toggle_fullscreen') {
      forwardActionToMainWorld(action, data);
    } else if (primaryMediaElement || action === 'toggle_fullscreen') {
      // 2. Perform direct HTML5 video element manipulation ONLY when not handled by Main World bridge
  ```
- **Surgical Correction Specification:**
  ```javascript
  function handleMediaControl(action, data = {}) {
    const { primaryMediaElement } = evaluatePageMediaState();
    if (!isTopFrame && !primaryMediaElement) {
      return { success: false, ignored: true, reason: 'No media in this subframe' };
    }

    const isYouTube = typeof isYouTubeDomain === 'function'
      ? isYouTubeDomain()
      : Boolean(typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname.includes('youtube.com'));

    const isBridgeActive = typeof isMainWorldBridgeActive === 'function'
      ? isMainWorldBridgeActive()
      : Boolean(typeof document !== 'undefined' && (document.documentElement || document.body) && typeof (document.documentElement || document.body).getAttribute === 'function' && (document.documentElement || document.body).getAttribute('data-sentinel-bridge-ready') === 'true');

    const isMainWorldTarget = isYouTube || isBridgeActive;

    // 1. Forward action to Main World engine (essential for YouTube native player methods, volume slider & OSD)
    // Avoid double-toggle race for toggle_fullscreen across isolated and main worlds
    let forwardedToMainWorld = false;
    if (isMainWorldTarget && action !== 'toggle_fullscreen') {
      forwardActionToMainWorld(action, data);
      forwardedToMainWorld = true;
    }

    // 2. Resilient Fallback to primaryMediaElement:
    // If bridge is NOT active (e.g. inject_main_world.js unready, throttled, or CSP-restricted)
    // or if the action was not forwarded, execute directly on primaryMediaElement.
    const shouldExecuteDirect = (!forwardedToMainWorld || !isBridgeActive) && (Boolean(primaryMediaElement) || action === 'toggle_fullscreen');

    if (shouldExecuteDirect) {
      try {
        switch (action) {
  ```
- **Architectural Invariant:** When `isBridgeActive` is false, even on YouTube, direct manipulation on `primaryMediaElement` ensures the user's action executes immediately without packet drop.

---

### 2.3 File 3: `popup/popup.js`
- **Path:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\popup\popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)
- **Line Anchors:**
  - Lines ~919–950: `sendMediaControl(action, data, tabId)`
  - Lines ~2010–2015: `getActiveMediaTabId()`
  - Lines ~3340–3520: In-card media control button event listeners
- **Surgical Correction Specification:**
  1. **Unify `getActiveMediaTabId()`:**
     ```javascript
     function getActiveMediaTabId() {
       return (activeMediaCached && activeMediaCached.tabId) ||
         (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId) ||
         activeTabId ||
         null;
     }
     ```
  2. **Harmonize `sendMediaControl` Resolution:**
     ```javascript
     function sendMediaControl(action, data = {}, tabId = null) {
       const now = Date.now();
       const actionKey = `${action}_${JSON.stringify(data)}`;

       if (actionKey === lastControlActionKey && (now - lastControlActionTime) < 280) {
         return;
       }
       if (action !== 'set_volume' && action !== 'seek_percent' && (now - lastControlActionTime) < 180) {
         return;
       }
       lastControlActionKey = actionKey;
       lastControlActionTime = now;

       const resolvedTabId = tabId || getActiveMediaTabId();

       try {
         const p = browserAPI.runtime.sendMessage({
           type: 'CONTROL_MEDIA',
           action,
           data,
           tabId: resolvedTabId
         }, () => {
           if (!isDraggingVolume && !isDraggingProgress) {
             setTimeout(refreshDashboard, 120);
           }
         });
         if (p && typeof p.catch === 'function') {
           p.catch(() => {});
         }
       } catch (_) {}
     }
     ```
  3. **Harmonize Button Listeners:**
     Update handlers for `#btnCtrlTogglePlay`, `#dynamicStatusBtn`, `#btnCtrlRewind`, `#btnCtrlForward`, `#btnCtrlToggleMute`, `#btnQuickMute`, `#btnCtrlSpeedDown`, `#btnCtrlSpeedUp`, `#btnCtrlPip`, `#btnCtrlTheater`, `#btnCtrlQualityDown`, `#btnCtrlQualityUp` to consistently pass `getActiveMediaTabId()`.
  4. **Strict Invariant Guard:**
     - Preserve all optimistic cooldown locks: `lastPlayToggleTime`, `lastMuteToggleTime`, `lastSpeedChangeTime`, `lastControlsRowActiveTime`.
     - Completely freeze `#btnGlobalMediaToggle` (lines ~3154–3168).
     - Maintain 0 `executeScript` in all button handlers.

---

### 2.4 File 4: `tests/test_media_controls_and_fullscreen_fix.js`
- **Path:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection\tests\test_media_controls_and_fullscreen_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_media_controls_and_fullscreen_fix.js)
- **Surgical Addition Specification:**
  Add **Test 10: Bridge Parity, Fallback Resilience, and Mute Determinism Suite**:
  1. **10.1 `inject_main_world.js` Mute Determinism:** Assert that `inject_main_world.js` contains `else if (video)` or does not unconditionally mutate `video.muted` when `moviePlayer.isMuted` is present.
  2. **10.2 `content_media.js` Resilient Fallback:** Assert that `handleMediaControl` checks bridge readiness and executes direct `primaryMediaElement` fallback when `!isBridgeActive`.
  3. **10.3 `popup/popup.js` Target Tab Parity:** Assert that `getActiveMediaTabId` incorporates `activeTabId` fallback and that `sendMediaControl` resolves `tabId` via `getActiveMediaTabId()`.
  4. **10.4 Invariant Protection:** Re-verify 0 `executeScript`, preserved cooldown locks, and untouched `#btnGlobalMediaToggle`.

---

## 🔒 3. Security, Performance & Error Budgets

| Metric | Budget / Target | Verification Method |
| :--- | :--- | :--- |
| **W3C Trusted Types** | 0 `innerHTML` / `outerHTML` assignments | Static regex & AST search |
| **IPC Message Drop Rate** | 0.00% dropped messages | Simulated IPC routing unit tests |
| **Mute Action Determinism** | 100% single toggle (0 self-cancels) | Mock execution unit tests |
| **UI Interaction Latency** | < 16ms perceived response | Optimistic state lock |
| **Syntax Errors** | 0 errors across all scripts | `node -c` and `vm.Script` compilation |
