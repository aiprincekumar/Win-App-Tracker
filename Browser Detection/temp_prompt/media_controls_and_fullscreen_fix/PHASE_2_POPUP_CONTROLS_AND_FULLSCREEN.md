# Phase 2: Popup Media Controls & On-Video Overlay Fullscreen Linking

> **Task ID:** `TASK-MEDIA-CTRL-FS-FIX-001-P02`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target File:** [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)  
> **Author & Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Status:** READY FOR SUBAGENT EXECUTION  

---

## 🎯 1. Phase Objective

Refactor the popup media control handlers in `popup/popup.js`. Specifically:
1. **On-Video Overlay Fullscreen Linking:** Eliminate the bloated ~100-line script injection in `#btnCtrlFullscreen` (lines 3501-3625) and replace it with clean delegation that triggers the on-video overlay button (`#__sentinel_fs_floating_btn__`) or calls `__SentinelFullscreenController.toggle()` and sends `sendMediaControl('toggle_fullscreen')`.
2. **Normal Play/Pause Wiring:** Ensure `#btnCtrlTogglePlay` and `#dynamicStatusBtn` reliably toggle playback for the active tab's media player via `sendMediaControl('toggle_play')`.
3. **Seek, Mute, Speed, Timeline & Volume Verification:** Verify that Seek +/-10s dispatches `seek_relative`, Mute/Unmute dispatches `toggle_mute`, Speed +/- dispatches `step_speed`, Timeline scrubber dispatches `seek_percent`, and Volume slider dispatches `set_volume`.
4. **Universal Play/Pause Guard:** Ensure `#btnGlobalMediaToggle` in the footer toolbar remains **100% UNTOUCHED** (it handles multi-tab `TOGGLE_GLOBAL_MEDIA`).

---

## 📋 2. Prerequisites & Inputs

- Target file: `popup/popup.js`
- Requires active authorization token issued by Level 2 Manager (`AUTH-MGR-*`).
- Adherence to Universal Rule 5 (UTF-8 with BOM `0xEF, 0xBB, 0xBF`), Rule 8 (Zero `.innerHTML` assignments), and Rule 27 (Syntax integrity).
- Completion of Phase 1 (`content_media.js` IPC router fix).

---

## 🔍 3. Technical Context & File Anchors

### 3.1 Fullscreen Bloat Anchor: `popup/popup.js` (Lines 3501-3625)
Currently, clicking `#btnCtrlFullscreen` executes an in-line `browserAPI.scripting.executeScript` function spanning ~100 lines (lines 3522-3617):
- Re-implements manual removal/addition of `.sentinel-web-fullscreen`, `.sentinel-fullscreen-active`.
- Tries to dispatch synthetic keyboard events (`KeyF`) or click native YouTube buttons.
- Clashes with `fullscreen_controller.js`, triggering double-toggle race conditions or failing user activation.
- Falls back to `sendMediaControl('toggle_fullscreen')` only on catch.

**The Desired Implementation:**
The in-page floating HUD button `#__sentinel_fs_floating_btn__` and `window.__SentinelFullscreenController` were designed precisely to solve these browser restrictions. The popup fullscreen button must simply link directly to this architecture!

### 3.2 Media Controls Wiring Anchor: `popup/popup.js` (Lines 3290-3490)
- `handleTogglePlay`: Updates optimistic cache and calls `sendMediaControl('toggle_play')`.
- `#btnRewind`: Decrements 10s and calls `sendMediaControl('seek_relative', { offsetSeconds: -10 })`.
- `#btnForward`: Increments 10s and calls `sendMediaControl('seek_relative', { offsetSeconds: 10 })`.
- `handleToggleMute`: Toggles mute state and calls `sendMediaControl('toggle_mute')`.
- `#btnSpeedDown` & `#btnSpeedUp`: Step ladder speed and call `sendMediaControl('step_speed', ...)`.

### 3.3 Scrubber & Volume Anchor: `popup/popup.js` (Lines 3762-3830)
- `#progressBarContainer`: Dispatches `sendMediaControl('seek_percent', { percent, positionSeconds })`.
- `#volumeBarContainer`: Dispatches `sendMediaControl('set_volume', { percent, volume })`.

### 3.4 Invariant Anchor: `popup/popup.js` (Lines 3125-3139)
```javascript
  // 5. Global Media Toggle Across Tabs
  const btnGlobalMediaToggle = document.getElementById('btnGlobalMediaToggle');
  if (btnGlobalMediaToggle) {
    btnGlobalMediaToggle.addEventListener('click', () => {
      try {
        const p = browserAPI.runtime.sendMessage({ type: 'TOGGLE_GLOBAL_MEDIA' }, (res) => {
          if (res && res.action) {
            showPopupToast(res.action === 'PAUSE_ALL' ? 'Paused all media' : 'Resumed media', 'info');
          }
          refreshDashboard(true);
        });
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (_) {}
    });
  }
```
**CRITICAL INVARIANT:** This block must remain **100% UNTOUCHED**. Do not alter its event listener, message type, or behavior.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 2.1: Refactor `#btnCtrlFullscreen` Click Handler
Replace the 124-line block (lines 3501-3625) in `popup/popup.js` with:
```javascript
  const btnFullscreen = document.getElementById('btnCtrlFullscreen');
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', async () => {
      const now = Date.now();
      if (now - lastFullscreenClick < 350) return;
      lastFullscreenClick = now;

      let targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
        (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

      // Resolve active tabId reliably if not cached yet
      if (!targetTabId && browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
        try {
          const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
          if (tabs && tabs[0] && tabs[0].id) {
            targetTabId = tabs[0].id;
          }
        } catch (_) {}
      }

      // 1. Direct Scripting Injection: Link directly to on-video overlay button or controller
      if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
        browserAPI.scripting.executeScript({
          target: { tabId: targetTabId },
          func: () => {
            // Priority 1: Trigger the in-page Floating Sentinel Fullscreen HUD Button
            const floatingBtn = document.getElementById('__sentinel_fs_floating_btn__');
            if (floatingBtn) {
              try {
                floatingBtn.click();
                return;
              } catch (_) {}
            }

            // Priority 2: Use dedicated Sentinel Fullscreen Controller instance
            const ctrl = window.__SentinelFullscreenController || globalThis.__SentinelFullscreenController;
            if (ctrl && typeof ctrl.toggle === 'function') {
              try {
                ctrl.toggle(null, { forceWeb: true });
                return;
              } catch (_) {}
            }
          }
        }).catch(() => {});
      }

      // 2. Dispatch IPC Media Control message through background relay
      sendMediaControl('toggle_fullscreen', {}, targetTabId);
    });
  }
```

### Step 2.2: Verify and Wire Normal Play/Pause Controls
In `popup/popup.js`:
Verify `handleTogglePlay`:
```javascript
  const handleTogglePlay = () => {
    if (activeMediaCached) {
      activeMediaCached.isPlaying = !activeMediaCached.isPlaying;
      renderMediaCard({ primaryMedia: activeMediaCached });
    }
    const targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
      (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

    if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
      browserAPI.scripting.executeScript({
        target: { tabId: targetTabId },
        func: () => {
          const video = Array.from(document.querySelectorAll('video')).find(v => !v.paused) || document.querySelector('video');
          if (video) {
            if (video.paused) {
              const p = video.play();
              if (p && typeof p.catch === 'function') p.catch(() => {});
            } else {
              video.pause();
            }
          }
        }
      }).catch(() => {});
    }
    sendMediaControl('toggle_play');
  };

  const dynamicStatusBtn = document.getElementById('dynamicStatusBtn');
  if (dynamicStatusBtn) dynamicStatusBtn.addEventListener('click', handleTogglePlay);

  const btnCtrlTogglePlay = document.getElementById('btnCtrlTogglePlay');
  if (btnCtrlTogglePlay) btnCtrlTogglePlay.addEventListener('click', handleTogglePlay);
```
Ensure clicking `#dynamicStatusBtn` and `#btnCtrlTogglePlay` both invoke `handleTogglePlay` and send `toggle_play`.

### Step 2.3: Verify Seek +/-10s Controls
- `#btnCtrlRewind` dispatches `sendMediaControl('seek_relative', { offsetSeconds: -10 })`.
- `#btnCtrlForward` dispatches `sendMediaControl('seek_relative', { offsetSeconds: 10 })`.

### Step 2.4: Verify Mute/Unmute Controls
- `#btnCtrlToggleMute` and `#btnQuickMute` both invoke `handleToggleMute` and dispatch `sendMediaControl('toggle_mute')`.

### Step 2.5: Verify Speed +/- Controls
- `#btnCtrlSpeedDown` dispatches `sendMediaControl('step_speed', { direction: 'down', targetSpeed, step: -0.25 }, targetTabId)`.
- `#btnCtrlSpeedUp` dispatches `sendMediaControl('step_speed', { direction: 'up', targetSpeed, step: 0.25 }, targetTabId)`.

### Step 2.6: Verify Timeline Scrubber & Volume Slider
- `#progressBarContainer` dispatches `sendMediaControl('seek_percent', { percent: pct, positionSeconds: posSec })`.
- `#volumeBarContainer` dispatches `sendMediaControl('set_volume', { percent: volPercent, volume: volPercent / 100 })`.

### Step 2.7: Ensure `#btnGlobalMediaToggle` is 100% UNTOUCHED
Verify lines 3125-3139 are completely untouched and still bind to `type: 'TOGGLE_GLOBAL_MEDIA'`.

---

## 🚫 5. Architectural Constraints & Boundaries

- **Zero innerHTML assignments:** All DOM manipulations must use safe methods.
- **Debounce Guards:** Preserve 350ms click debounce on fullscreen toggle to prevent double-toggle bouncing.
- **Clean Code Reduction:** Net reduction of ~90-100 lines of complex manual fullscreen DOM manipulation.

---

## 📦 6. Deliverables Manifest

1. Updated `popup/popup.js` with streamlined `#btnCtrlFullscreen` and verified media control handlers.
2. Verification output from `node -c popup/popup.js`.

---

## 🧪 7. Local Verification Gate

```powershell
node -c popup/popup.js
node tests/test_volume_timeline_fullscreen_controls.js
```
Both commands must exit with code 0 and 0 errors.
