# Phase 2: Popup Media Controls Refactoring & Overlay Fullscreen Linking

> **Phase Number:** 2 of 3  
> **Phase Target:** `popup/popup.js`  
> **Target Path:** `temp_prompt/controls_1_to_5_fix/phase_02_popup_controls_and_fullscreen.md`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Lead Department:** Dept 05 Frontend Engineering  
> **Test Gate:** `node -c popup/popup.js` & `node tests/test_volume_timeline_fullscreen_controls.js`  

---

## 🎯 1. Phase Objective
Refactor the media controls in [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js) so that:
1. The 124 lines of bloated manual DOM class manipulation and synthetic keyboard events in `#btnCtrlFullscreen` are completely replaced by clean delegation to the on-video overlay button `#__sentinel_fs_floating_btn__` and `window.__SentinelFullscreenController.toggle()`.
2. Normal Play/Pause (`#btnCtrlTogglePlay` / `#dynamicStatusBtn`) cleanly triggers `handleTogglePlay` -> `sendMediaControl('toggle_play')`.
3. Controls 2 (Seek ±10s), 3 (Mute/Volume), and 4 (Speed ± steppers) cleanly wire to their corresponding IPC actions.
4. **CRITICAL INVARIANT:** `#btnGlobalMediaToggle` (Universal Play/Pause across all browser tabs) must remain **100% untouched and unchanged**.

---

## 📂 2. Target Files & Line Anchors
- **Primary File:** [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)
  - Anchors: Lines 3125-3139 (`#btnGlobalMediaToggle` — DO NOT MODIFY)
  - Anchors: Lines 3290-3490 (In-card Play/Pause, Rewind, Forward, Speed, Mute)
  - Anchors: Lines 3501-3560 (`#btnCtrlFullscreen` click listener)
  - Anchors: Lines 3762-3830 (Scrubber and Volume slider event bindings)

---

## 🛠️ 3. Concrete Implementation Steps

### Step 2.1: Replace `#btnCtrlFullscreen` with Clean Overlay Linking
Replace the bloated script injection in `#btnCtrlFullscreen` with a concise, dual-execution pattern:
```javascript
const btnFullscreen = document.getElementById('btnCtrlFullscreen');
if (btnFullscreen) {
  btnFullscreen.addEventListener('click', async () => {
    const now = Date.now();
    if (now - lastFullscreenClick < 350) return;
    lastFullscreenClick = now;

    let targetTabId = (activeMediaCached && activeMediaCached.tabId) ||
      (dashboardData && dashboardData.globalMediaState && dashboardData.globalMediaState.primaryMedia && dashboardData.globalMediaState.primaryMedia.tabId);

    if (!targetTabId && browserAPI.tabs && typeof browserAPI.tabs.query === 'function') {
      try {
        const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
        if (tabs && tabs[0] && tabs[0].id) {
          targetTabId = tabs[0].id;
        }
      } catch (_) {}
    }

    // 1. Direct Scripting Execution: Link directly to on-video overlay button or controller
    if (browserAPI.scripting && typeof browserAPI.scripting.executeScript === 'function' && targetTabId) {
      browserAPI.scripting.executeScript({
        target: { tabId: targetTabId },
        world: 'MAIN',
        func: () => {
          // Priority 1: Trigger the in-page Floating Sentinel Fullscreen HUD Button
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
      }).catch(() => {});
    }

    // 2. Relay via Background IPC
    sendMediaControl('toggle_fullscreen', { source: 'popup_btn_fullscreen' });
  });
}
```

### Step 2.2: Verify Controls 1 to 4 Handlers
- Ensure `#btnCtrlTogglePlay` and `#dynamicStatusBtn` invoke `handleTogglePlay()` which calls `sendMediaControl('toggle_play')`.
- Ensure `#btnCtrlRewind` and `#btnCtrlForward` invoke `sendMediaControl('seek_relative', { offsetSeconds: -10 / +10 })`.
- Ensure `#btnCtrlToggleMute` and `#btnQuickMute` invoke `sendMediaControl('toggle_mute')`.
- Ensure `#btnCtrlSpeedDown` and `#btnCtrlSpeedUp` invoke `sendMediaControl('step_speed', { direction: 'down' / 'up' })`.

### Step 2.3: Strictly Verify `#btnGlobalMediaToggle` Is Untouched
- Check lines 3125-3139 in `popup/popup.js`. Verify the listener dispatches `{ type: 'TOGGLE_GLOBAL_MEDIA' }`. No edits permitted in this block.

---

## 🚦 4. Verification Gate & Deliverables Manifest
1. Run syntax check:
   ```powershell
   node -c popup/popup.js
   ```
2. Verify syntax and manifest integrity:
   ```powershell
   node tests/test_syntax_and_manifest_integrity.js
   ```
3. Deliverables: Refactored `popup/popup.js` with ~100 lines of bloat eliminated and full overlay linking.
