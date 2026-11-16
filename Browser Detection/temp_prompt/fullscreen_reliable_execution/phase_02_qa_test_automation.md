# Phase 2: QA Test Automation - Synthetic Gesture & State Verification

> **Task ID:** `TASK-FULLSCREEN-PARITY-002`  
> **Phase:** 2 of 3  
> **Assigned Role:** Level 4 QA Automation Engineer (`QA Automation Engineer`)  
> **Recommended Model:** `pro`  
> **Department Governance:** Department 08 (QA & Test Automation Engineering)  
> **Target Files:**  
> - [`tests/test_fullscreen_controller.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_fullscreen_controller.js)  
> - [`tests/test_media_controls_and_fullscreen_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_media_controls_and_fullscreen_fix.js)  

---

## 🎯 1. Phase Objective

Implement and execute automated test suites to rigorously verify that:
1. Synthetic events (`isTrusted: false`) triggered from popups or scripts automatically engage Web Fullscreen without attempting ignored native clicks.
2. In `fullscreen_controller.js`, `enterNativeFullscreen()` verifies `isFullscreenActive()` and never shows a false-positive OSD when native fullscreen fails.
3. In-page physical clicks (`isTrusted: true`) continue to trigger native fullscreen with seamless fallback to web fullscreen.
4. Single-execution determinism is preserved: `sendMediaControl('toggle_fullscreen')` is dispatched only when direct scripting is unavailable or throws.

---

## 📋 2. Prerequisites & Working Context

1. Phase 1 surgical modifications in `fullscreen_controller.js`, `popup/popup.js`, and `content_media.js` must be completed and pass syntax check `node -c`.
2. Adhere to [`TRD.md`](TRD.md) and [`PRD.md`](PRD.md).
3. Do not modify application logic in Phase 2; focus exclusively on test harness and assertion updates.

---

## 🧪 3. Detailed Test Suite Specifications

### Test Suite 1: `tests/test_fullscreen_controller.js`
Update and extend `tests/test_fullscreen_controller.js` with new test sections:
1. **Section A: Synthetic vs. Trusted Gesture Differentiation**
   - Create simulated floating button with click listener.
   - Dispatch synthetic click `{ isTrusted: false }`:
     - Assert that `enterWebFullscreen()` was called directly.
     - Assert that `document.documentElement.classList.contains('sentinel-fullscreen-active') === true`.
     - Assert that OSD displays `'Web Fullscreen'`.
   - Dispatch trusted click `{ isTrusted: true }`:
     - Assert that native fullscreen entry was attempted.
2. **Section B: False-Positive Native Success Prevention**
   - Mock a YouTube player container where `ytFsBtn.click()` returns `undefined` but `document.fullscreenElement` remains `null`.
   - Call `enterNativeFullscreen()`.
   - Assert that `showOSD('Fullscreen', '⛶')` was NOT called.
   - Assert that controller automatically fell through to `enterWebFullscreen()`.
   - Assert that `isFullscreenActive() === true` (due to web fullscreen).
3. **Section C: Popup Direct Scripting AST & Invocation Contract**
   - Parse `popup/popup.js` using Node.js `esprima` or AST inspection.
   - Verify `#btnCtrlFullscreen` click handler prioritizes `__SentinelFullscreenController.toggle(null, { forceWeb: true })` or `toggleWebFullscreen()` over `floatingBtn.click()`.

### Test Suite 2: `tests/test_media_controls_and_fullscreen_fix.js`
Verify and run `tests/test_media_controls_and_fullscreen_fix.js`:
- Confirm that VM mock tests for single-execution determinism and media control dispatch pass 100%.
- Ensure `#btnCtrlFullscreen` and `#btnCtrlPip` dispatch single execution (scripting 1, IPC 0 on success).

---

## 🏁 4. Local Verification Gate

Execute the following commands from workspace root:
```powershell
node tests/test_fullscreen_controller.js
node tests/test_media_controls_and_fullscreen_fix.js
```
**Gate Requirement:** Both test suites must execute and complete with exit code 0 and zero assertion failures.
