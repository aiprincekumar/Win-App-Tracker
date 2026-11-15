# Phase 1 Execution Prompt
## Single-Execution Determinism in Popup & Content Script

> **Assigned Role:** Level 4 Frontend Engineer (`frontend_engineer`)  
> **Mandatory Rule Directive:** Load and adhere to [`dynamic_departments_matrix.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/dynamic_departments_matrix.md), [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md), and [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md) before executing instructions.  
> **Target Files:**  
> - [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)  
> - [`content_media.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/content_media.js)  
> **Verification Gate:** `node -c popup/popup.js` and `node -c content_media.js`  

---

## 1. Phase Objective
Refactor media control event handlers in `popup/popup.js` to strip all redundant `browserAPI.scripting.executeScript` calls, relying strictly on `sendMediaControl(...)` as the single authoritative IPC dispatch. In `content_media.js`, eliminate the internal double-toggle race condition between `forwardActionToMainWorld` and `primaryMediaElement` manipulation, and guarantee a single click on the floating fullscreen button.

---

## 2. Prerequisites & Working Context
- Review [`TRD.md`](TRD.md) Section 2 for exact low-level designs and flow charts.
- Working directory: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
- All modifications must preserve optimistic cooldown variables (`lastPlayToggleTime`, `lastMuteToggleTime`, `lastSpeedChangeTime`, etc.) and the 800ms cooldown guards in `renderMediaCard`.
- `#btnGlobalMediaToggle` (lines 3154-3168) must remain 100% untouched.

---

## 3. Surgical Instructions for `popup/popup.js`

### Step 3.1: Refactor `handleTogglePlay` (lines ~3316-3356)
- Remove the `if (browserAPI.scripting ... executeScript) { ... }` block entirely.
- Retain `lastPlayToggleTime = Date.now();` and optimistic cache state updates.
- Keep the call to `sendMediaControl('toggle_play', {}, targetTabId);`.

### Step 3.2: Refactor Seek Buttons (`#btnCtrlRewind` & `#btnCtrlForward`, lines ~3363-3448)
- In `btnRewind`: Remove `executeScript`. Retain `lastProgressDragTime = Date.now();`, optimistic `currentTime` calculation, and invoke `sendMediaControl('seek_relative', { offsetSeconds: -10 }, targetTabId);`.
- In `btnForward`: Remove `executeScript`. Retain `lastProgressDragTime = Date.now();`, optimistic `currentTime` calculation, and invoke `sendMediaControl('seek_relative', { offsetSeconds: 10 }, targetTabId);`.

### Step 3.3: Refactor Mute Buttons (`#btnCtrlToggleMute` & `#btnQuickMute`, lines ~3450-3505)
- Remove `executeScript`.
- Retain `lastMuteToggleTime = Date.now();`, optimistic `isMuted` calculation, and invoke `sendMediaControl('toggle_mute', {}, targetTabId);`.

### Step 3.4: Refactor Speed Steppers (`#btnCtrlSpeedDown` & `#btnCtrlSpeedUp`, lines ~3510-3605)
- In `btnCtrlSpeedDown`: Remove `executeScript`. Retain `lastSpeedChangeTime = Date.now();`, optimistic `calculateNextLadderSpeed`, and invoke `sendMediaControl('step_speed', { direction: 'down' }, targetTabId);`.
- In `btnCtrlSpeedUp`: Remove `executeScript`. Retain `lastSpeedChangeTime = Date.now();`, optimistic `calculateNextLadderSpeed`, and invoke `sendMediaControl('step_speed', { direction: 'up' }, targetTabId);`.

### Step 3.5: Refactor Fullscreen Button (`#btnCtrlFullscreen`, lines ~3610-3665)
- Remove `executeScript` block that attempted to find and click `__sentinel_fs_floating_btn__`.
- Invoke `sendMediaControl('toggle_fullscreen', {}, targetTabId);`.

### Step 3.6: Refactor Extended Controls (`#btnCtrlPip`, `#btnCtrlTheater`, `#btnCtrlQualityDown`, `#btnCtrlQualityUp`, lines ~3670-3790)
- Remove `executeScript` blocks from each handler.
- Dispatch solely via `sendMediaControl('toggle_pip', {}, targetTabId);`, `sendMediaControl('toggle_theater', {}, targetTabId);`, and `sendMediaControl('step_quality', { direction: 'down' / 'up' }, targetTabId);`.

---

## 4. Surgical Instructions for `content_media.js`

### Step 4.1: Eliminate Internal Double Toggle in `handleMediaControl(action, data)`
- In lines ~1560-1595:
  When an action is `toggle_play`, `play`, `pause`, or `toggle_mute`:
  If `isYouTubeDomain() || isMainWorldBridgeActive()`:
  - Forward the action to the Main World engine via `forwardActionToMainWorld(action, data)`.
  - Do NOT execute concurrent direct DOM manipulation on `primaryMediaElement` for that toggle action.
  If NOT on YouTube or bridge page:
  - Execute direct HTML5 manipulation on `primaryMediaElement` (e.g. `primaryMediaElement.play()`, `primaryMediaElement.pause()`, `primaryMediaElement.muted = !primaryMediaElement.muted`).
- For continuous actions (`set_volume`, `seek_relative`, `seek_percent`, `step_speed`), ensure single clean execution.

### Step 4.2: Guarantee Single Click on Floating Fullscreen Button
- In `case 'toggle_fullscreen'`:
  Verify `floatingBtn.click()` is executed cleanly as Priority 1 without being preempted or duplicated.

---

## 5. Verification Gate
Execute the following verification command:
```bash
node -c popup/popup.js && node -c content_media.js
```
Both files must exit cleanly with code 0.
