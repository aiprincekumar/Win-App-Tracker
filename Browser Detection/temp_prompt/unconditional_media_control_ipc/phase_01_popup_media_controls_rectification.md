# Phase 1 Execution Prompt
## `popup/popup.js` Media Control Button Rectification

> **Phase:** 1 of 3  
> **Target File:** [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Prerequisites:** Decision Gate Cleared, `AUTH-MGR-*` Token Active  
> **Local Gate Command:** `node -c popup/popup.js`  

---

## 🎯 1. Phase Objective

Rectify all media control button handlers in `popup/popup.js` to dispatch `sendMediaControl(...)` unconditionally, target top-frame only (`target: { tabId: targetTabId }`, omitting `allFrames: true`) in `executeScript`, preserve on-video overlay linkage for fullscreen, retain all optimistic cooldown timestamps, and strictly freeze `#btnGlobalMediaToggle`.

---

## 📍 2. File Anchors & Precise Target Blocks

1. **`handleTogglePlay`:** (Around line 3315-3360)
   - Action: `sendMediaControl('toggle_play', {}, targetTabId)` unconditionally.
   - ExecuteScript: target `{ tabId: targetTabId }` without `allFrames: true`.
2. **`btnRewind`:** (Around line 3368-3415)
   - Action: `sendMediaControl('seek_relative', { offsetSeconds: -10 }, targetTabId)` unconditionally.
   - ExecuteScript: target `{ tabId: targetTabId }` without `allFrames: true`.
3. **`btnForward`:** (Around line 3417-3464)
   - Action: `sendMediaControl('seek_relative', { offsetSeconds: 10 }, targetTabId)` unconditionally.
   - ExecuteScript: target `{ tabId: targetTabId }` without `allFrames: true`.
4. **`handleToggleMute`:** (Around line 3466-3506)
   - Action: `sendMediaControl('toggle_mute', {}, targetTabId)` unconditionally.
   - ExecuteScript: target `{ tabId: targetTabId }` without `allFrames: true`.
5. **`btnSpeedDown` & `btnSpeedUp`:** (Around line 3520-3625)
   - Action: `sendMediaControl('step_speed', { direction: 'down'/'up', targetSpeed, step: -0.25/+0.25 }, targetTabId)` unconditionally.
   - ExecuteScript: target `{ tabId: targetTabId }` without `allFrames: true`.
6. **`btnFullscreen`:** (Around line 3627-3697)
   - Action: `sendMediaControl('toggle_fullscreen', {}, targetTabId)` unconditionally.
   - ExecuteScript: target `{ tabId: targetTabId }` without `allFrames: true`.
   - Priorities: Priority 1 `document.getElementById('__sentinel_fs_floating_btn__').click()`, Priority 2 `window.__SentinelFullscreenController.toggle(null, { forceWeb: true })`, Priority 3 native player button or KeyF event.
7. **`btnPip` & `btnTheater` & `btnQualityDown` & `btnQualityUp`:** (Around lines 3699-3833)
   - Ensure unconditional `sendMediaControl` and top-frame targeting (`{ tabId: targetTabId }`).

---

## 🚫 3. Strict Out-of-Scope Constraints

1. **DO NOT touch `#btnGlobalMediaToggle`:** Lines 3125-3139 must remain 100% frozen (`TOGGLE_GLOBAL_MEDIA`).
2. **DO NOT reintroduce manual CSS classes:** Zero occurrences of `sentinel-fullscreen-active`, `moviePlayer.classList.add('ytp-fullscreen')`, etc.
3. **DO NOT remove optimistic cooldown guards:** Keep `Date.now() - lastPlayToggleTime < 800` in `renderMediaCard`.

---

## 🏁 4. Verification Gate & Deliverables

- Run: `node -c popup/popup.js`
- Verify exit code 0 and syntax cleanliness.
- Micro-commit: `git commit -m "fix(popup): dispatch sendMediaControl unconditionally and target top frame"`
