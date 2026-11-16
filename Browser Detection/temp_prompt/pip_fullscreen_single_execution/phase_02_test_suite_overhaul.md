# Phase 2 Execution Specification: Test Suite Overhaul & Single-Execution Mocking

> **Phase:** 2 of 3  
> **Assigned Role:** Level 4 QA Test Engineer  
> **Department:** Dept 08 QA & Testing  
> **Target File:** [`tests/test_media_controls_and_fullscreen_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_media_controls_and_fullscreen_fix.js)  
> **Gate Verification:** `node tests/test_media_controls_and_fullscreen_fix.js` (Exit code 0, 100% test assertions pass)  
> **Mandatory Anchor:** First load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.  

---

## 🎯 1. Mission Objectives

Update `tests/test_media_controls_and_fullscreen_fix.js` to replace the obsolete "dual actuation" assertions for Fullscreen and PiP with deterministic single-execution assertions. Update both static code pattern assertions and functional VM mock simulations to verify that when `browserAPI.scripting.executeScript` executes, `sendMediaControl` is NOT dispatched (preventing the double-toggle bug), and when scripting fails or is absent, `sendMediaControl` is reliably dispatched as a fallback.

---

## 🛠️ 2. Detailed Technical Instructions

### 2.1 File Location & Overview
Open [`tests/test_media_controls_and_fullscreen_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_media_controls_and_fullscreen_fix.js).

### 2.2 Section 3.2 & Section 4 Updates (Fullscreen Invariants)
Locate Section 3.2 (around line 558) and Section 4 (around line 667):
1. **Static Pattern Assertions:**
   - Verify `btnFsBlock` contains:
     * `browserAPI.scripting.executeScript`
     * `world: 'MAIN'`
     * `.catch(` with `sendMediaControl('toggle_fullscreen', {}, targetTabId)`
     * `else {` with `sendMediaControl('toggle_fullscreen', {}, targetTabId)`
   - Verify that `sendMediaControl('toggle_fullscreen')` does NOT occur outside/after the closing brace of the `if/else` statement in `btnFsBlock`.
2. **Line Count:** Ensure line count check continues to assert clean, compact code (`<= 55` lines).
3. **Log Message:** Update console log to: `Single-execution determinism (direct executeScript in MAIN world with fallback sendMediaControl IPC) verified in #btnCtrlFullscreen`.

### 2.3 Section 6 Updates (PiP Invariants)
Locate Section 6 (around line 850):
1. Verify `extBlock` or `btnPip` block contains:
   * `browserAPI.scripting.executeScript`
   * `.catch(` with `sendMediaControl('toggle_pip', {}, targetTabId)`
   * `else {` with `sendMediaControl('toggle_pip', {}, targetTabId)`
2. Verify that `sendMediaControl('toggle_pip')` is NOT called outside the `if/else` block.

### 2.4 Section 9.9 VM Functional Simulation (Fullscreen)
Locate Section 9.9 (around line 1287):
1. **Primary Single-Execution Test:**
   ```javascript
   interceptedMediaControls.length = 0;
   interceptedExecuteScripts.length = 0;
   mockElements.btnCtrlFullscreen.click();

   // In single-execution determinism:
   // Direct executeScript MUST be called exactly once
   assert.strictEqual(interceptedExecuteScripts.length, 1, 'Must execute direct executeScript on fullscreen');
   assert.strictEqual(interceptedExecuteScripts[0].target.tabId, 42);
   assert.strictEqual(interceptedExecuteScripts[0].world, 'MAIN');

   // sendMediaControl must NOT be called when executeScript succeeds (eliminating double-toggle!)
   assert.strictEqual(interceptedMediaControls.length, 0, 'sendMediaControl must NOT be called when direct executeScript succeeds');
   console.log('  ✅ #btnCtrlFullscreen: Single-execution determinism verified (executeScript executed, IPC suppressed)');
   ```
2. **Fallback Simulation Test:**
   Add/verify test where `browserAPI.scripting` is unavailable or `executeScript` rejects:
   Verify `sendMediaControl('toggle_fullscreen', {}, targetTabId)` is dispatched and `interceptedMediaControls.length === 1`.

### 2.5 Section 9.10 VM Functional Simulation (PiP)
Locate Section 9.10 (around line 1302):
1. **Primary Single-Execution Test:**
   ```javascript
   interceptedMediaControls.length = 0;
   interceptedExecuteScripts.length = 0;
   mockElements.btnCtrlPip.click();

   // Direct executeScript MUST be called exactly once
   assert.strictEqual(interceptedExecuteScripts.length, 1, 'Must execute direct executeScript on PiP');
   assert.strictEqual(interceptedExecuteScripts[0].target.tabId, 42);

   // sendMediaControl must NOT be called when executeScript succeeds (eliminating double-toggle!)
   assert.strictEqual(interceptedMediaControls.length, 0, 'sendMediaControl must NOT be called when direct executeScript succeeds');
   console.log('  ✅ #btnCtrlPip: Single-execution determinism verified (executeScript executed, IPC suppressed)');
   ```
2. **Fallback Simulation Test:**
   Add/verify test where `browserAPI.scripting` is unavailable or `executeScript` rejects:
   Verify `sendMediaControl('toggle_pip', {}, targetTabId)` is dispatched and `interceptedMediaControls.length === 1`.

---

## 🔒 3. Mandatory Invariants

- Do NOT weaken or remove tests for `#btnGlobalMediaToggle`.
- Do NOT weaken checks for debounce timestamps or Trusted Types.
- Maintain UTF-8 with BOM format.

---

## ✅ 4. Phase Verification Gate

Execute in PowerShell:
```powershell
node tests/test_media_controls_and_fullscreen_fix.js
```
Must print:
`🎉 ALL MEDIA CONTROLS & ON-VIDEO OVERLAY FULLSCREEN TESTS PASSED WITH 100% SUCCESS!`
with exit code 0.
Report results to Level 2 Manager.
