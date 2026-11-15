# Phase 2 Specification: Test Suite Modernization & Dual Actuation Verification

> **Phase:** 2 of 3  
> **Task ID:** `TASK-PARITY-OVERHAUL-DIRECT-SCRIPTING-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Assigned Role:** Level 4 QA Test Engineer  
> **Required Dynamic Skills:** `e2e-testing`, `code-simplification`  
> **Target Files:**
> - [`tests/test_media_controls_and_fullscreen_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_media_controls_and_fullscreen_fix.js)

---

## 🎯 1. Phase Objective

Update and modernize `tests/test_media_controls_and_fullscreen_fix.js` to assert the dual-actuation architecture (0ms direct `browserAPI.scripting.executeScript` with `world: 'MAIN'` alongside `sendMediaControl(...)` IPC dispatch). Replace obsolete assertions that previously enforced "0 executeScript calls" in button handlers with assertions verifying proper script injection and dual actuation. Update the runtime mock simulation harness in Test 9 to intercept and verify both the direct in-page script invocation and the IPC message dispatch across all media buttons. Ensure all 10 verification test suites in `test_media_controls_and_fullscreen_fix.js` pass with 100% success.

---

## 📋 2. Prerequisites & Inputs

1. Successful completion and verification of Phase 1 (`popup/popup.js` and `content_media.js` updated and passing `node -c`).
2. `tests/test_media_controls_and_fullscreen_fix.js` accessible on disk.

---

## 🔍 3. Technical Context & File Anchors

### 3.1 `tests/test_media_controls_and_fullscreen_fix.js` File Anchors
- **Test 4: Fullscreen Button Invariants:**
  - Lines ~510–525: Previously asserted `!btnFsBlock.includes('browserAPI.scripting.executeScript')`.
  - Required Update: Assert that `#btnCtrlFullscreen` contains `browserAPI.scripting.executeScript` with `world: 'MAIN'` and `sendMediaControl('toggle_fullscreen')`, while preserving the removal of obsolete manual DOM classes (`sentinel-fullscreen-active`, `moviePlayer.classList`, etc.).
- **Test 6: In-Popup Media Controls Wiring:**
  - Lines ~670–750: Previously asserted 0 conflicting executeScript in Play/Pause, Rewind, Forward, Mute, Speed, etc.
  - Required Update: Assert that Play/Pause, Rewind, Forward, Mute, Speed Steppers, and Window modes all contain direct `browserAPI.scripting.executeScript` with `world: 'MAIN'` AND `sendMediaControl`.
- **Test 9: Runtime Simulated Functional Mock Suite:**
  - Lines ~900–1150: Previously verified `executeScriptCalls.length === 0` on button clicks.
  - Required Update: Provide a functional mock for `browserAPI.scripting.executeScript` in the simulated VM sandbox. Assert that clicking `#btnCtrlTogglePlay`, `#dynamicStatusBtn`, `#btnCtrlRewind`, `#btnCtrlForward`, `#btnCtrlToggleMute`, `#btnCtrlSpeedDown`, `#btnCtrlSpeedUp`, `#btnCtrlFullscreen`, etc. logs exactly 1 `executeScript` call (with correct target and world) AND exactly 1 `sendMediaControl` IPC dispatch.
- **Preserved Tests:**
  - Test 1 (IPC Router Parsing)
  - Test 2 (`handleMediaControl` Execution)
  - Test 3 (On-Video Overlay Fullscreen Button Linking)
  - Test 5 (Universal Global Media Toggle Invariant Guard)
  - Test 7 (Extension Syntax & Trusted Types)
  - Test 8 (Optimistic State Lock & Cooldown Timestamps)
  - Test 10 (Parity Resilience & Fallback Verification)

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Update Test 4 Assertions
In `tests/test_media_controls_and_fullscreen_fix.js` (Test 4):
Update the `#btnCtrlFullscreen` assertions:
```javascript
// Verify popup.js delegates to dual actuation: executeScript (world: 'MAIN') AND sendMediaControl('toggle_fullscreen')
assert(popupJsCode.includes("sendMediaControl('toggle_fullscreen', {}, targetTabId);"),
  'popup.js must dispatch sendMediaControl("toggle_fullscreen", {}, targetTabId)');

const btnFsIndex = popupJsCode.indexOf("const btnFullscreen = document.getElementById('btnCtrlFullscreen');");
assert(btnFsIndex !== -1, 'Must find btnCtrlFullscreen in popup.js');
const nextBtnIndex = popupJsCode.indexOf("const btnPip = document.getElementById('btnCtrlPip');", btnFsIndex);
assert(nextBtnIndex !== -1, 'Must find boundary for btnCtrlPip');
const btnFsBlock = popupJsCode.slice(btnFsIndex, nextBtnIndex);

assert(btnFsBlock.includes('browserAPI.scripting.executeScript'),
  'popup.js #btnCtrlFullscreen must contain browserAPI.scripting.executeScript for 0ms actuation');
assert(btnFsBlock.includes("world: 'MAIN'"),
  'popup.js #btnCtrlFullscreen must execute in MAIN world for direct DOM and controller access');
```

### Step 2: Update Test 6 Assertions
In Test 6:
Update each media control wiring check to assert that both direct `executeScript` with `world: 'MAIN'` and `sendMediaControl` are present in each button's handler:
- Play/Pause (`handleTogglePlay`): Contains `executeScript`, `world: 'MAIN'`, and `sendMediaControl('toggle_play'`.
- Rewind (`btnRewind`): Contains `executeScript`, `world: 'MAIN'`, and `sendMediaControl('seek_relative', { offsetSeconds: -10 }`.
- Forward (`btnForward`): Contains `executeScript`, `world: 'MAIN'`, and `sendMediaControl('seek_relative', { offsetSeconds: 10 }`.
- Toggle Mute (`handleToggleMute`): Contains `executeScript`, `world: 'MAIN'`, and `sendMediaControl('toggle_mute'`.
- Speed Steppers (`btnSpeedDown`, `btnSpeedUp`): Contains `executeScript`, `world: 'MAIN'`, and `sendMediaControl('step_speed'`.
- Fullscreen (`btnFullscreen`): Contains `executeScript`, `world: 'MAIN'`, and `sendMediaControl('toggle_fullscreen'`.

### Step 3: Update Test 9 Mock Simulation Harness
In Test 9:
Enhance the mock sandbox environment:
1. Provide an `executeScript` tracker:
   ```javascript
   const executeScriptCalls = [];
   const mockBrowserAPI = {
     scripting: {
       executeScript: (options) => {
         executeScriptCalls.push(options);
         return Promise.resolve([{ result: true }]);
       }
     },
     runtime: { ... },
     storage: { ... },
     tabs: { ... }
   };
   ```
2. When simulating button click events (e.g. `mockElements.btnCtrlTogglePlay.click()`, `mockElements.btnCtrlRewind.click()`, etc.):
   - Assert `executeScriptCalls.length >= 1` (direct in-page script executed).
   - Assert `lastCall.world === 'MAIN'`.
   - Assert `sentMessages.length >= 1` (IPC dispatched).
   - Assert `sentMessages.some(m => m.action === ...)` matches expected action.

### Step 4: Execute Verification Gate
Run `node tests/test_media_controls_and_fullscreen_fix.js` and verify all 10 tests pass cleanly with 100% green output.

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries

1. Do NOT weaken or remove Test 5 (`#btnGlobalMediaToggle` invariant guard).
2. Do NOT weaken Test 7 (syntax validation and W3C Trusted Types zero-innerHTML check).
3. Do NOT weaken Test 8 (cooldown timestamp verification and 800ms guard).

---

## 📦 6. Deliverables Manifest

1. Updated [`tests/test_media_controls_and_fullscreen_fix.js`](file:///c:/Users/Atul Verma/Desktop/Win App Tracker/Browser Detection/tests/test_media_controls_and_fullscreen_fix.js) with modernized dual-actuation assertions and functional simulation harness.

---

## 🚦 7. Local Verification Gate

Run:
```powershell
node tests/test_media_controls_and_fullscreen_fix.js
```
Must output: `🎉 ALL MEDIA CONTROLS & ON-VIDEO OVERLAY FULLSCREEN TESTS PASSED WITH 100% SUCCESS!` with exit code 0.
