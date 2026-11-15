# Phase 2 Execution Prompt
## Test Suite Overhaul: Assert 0 Conflicting Scripts & 1 Authoritative IPC

> **Assigned Role:** Level 4 QA Test Engineer (`qa_test_engineer`)  
> **Mandatory Rule Directive:** Load and adhere to [`dynamic_departments_matrix.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/dynamic_departments_matrix.md), [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md), and [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md) before executing instructions.  
> **Target File:** [`tests/test_media_controls_and_fullscreen_fix.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_media_controls_and_fullscreen_fix.js)  
> **Verification Gate:** `node tests/test_media_controls_and_fullscreen_fix.js`  

---

## 1. Phase Objective
Overhaul `tests/test_media_controls_and_fullscreen_fix.js` to reflect and enforce the Single-Execution Determinism architecture. Specifically, assert that 0 conflicting `executeScript` calls exist inside media control button handlers in `popup/popup.js`, verify that each button relies exclusively on unconditional `sendMediaControl` IPC dispatch, and update the simulated runtime mock test suite to assert exactly 1 IPC call and 0 `executeScript` calls.

---

## 2. Prerequisites & Working Context
- Phase 1 must be completed with `node -c` exit code 0.
- Target test file: `tests/test_media_controls_and_fullscreen_fix.js`.
- All other test invariants (IPC router parsing, action execution, fullscreen overlay linking, global media toggle guard, Trusted Types compliance, optimistic state lock) must be preserved.

---

## 3. Surgical Instructions for `tests/test_media_controls_and_fullscreen_fix.js`

### Step 3.1: Update Header & Test Overview
- Update comments in lines 1-55 to document the Single-Execution Determinism requirements:
  - 0 conflicting `executeScript` calls in media control button handlers in `popup.js`.
  - Single authoritative `sendMediaControl` IPC dispatch.
  - Retention of optimistic cooldown locks and `#btnGlobalMediaToggle` isolation.

### Step 3.2: Update Test 4 & Test 6 (Static Structural Assertions)
- In Test 4 (`#btnCtrlFullscreen` verification):
  - Assert that `#btnCtrlFullscreen` handler does NOT contain `browserAPI.scripting.executeScript`.
  - Assert that it unconditionally dispatches `sendMediaControl('toggle_fullscreen', {}, targetTabId);`.
- In Test 6 (In-Popup Media Controls Wiring):
  - In `handleTogglePlay`: assert that it does NOT contain `browserAPI.scripting.executeScript`; assert that it dispatches `sendMediaControl('toggle_play', {}, targetTabId);`.
  - In `btnRewind` and `btnForward`: assert that neither contains `browserAPI.scripting.executeScript`; assert dispatch of `sendMediaControl('seek_relative', ...)`.
  - In `btnCtrlToggleMute` and `btnQuickMute`: assert that neither contains `executeScript`; assert dispatch of `sendMediaControl('toggle_mute', ...)`.
  - In `btnCtrlSpeedDown` and `btnCtrlSpeedUp`: assert that neither contains `executeScript`; assert dispatch of `sendMediaControl('step_speed', ...)`.
  - In `btnCtrlPip`, `btnCtrlTheater`, `btnCtrlQualityDown`, `btnCtrlQualityUp`: assert that none contain `executeScript`; assert dispatch of `sendMediaControl`.

### Step 3.3: Update Test 9 (Runtime Simulated Functional Mock Suite)
- In the mock environment:
  - Track `interceptedMediaControls` and `interceptedExecuteScripts`.
  - When clicking `mockElements.btnCtrlTogglePlay`, assert:
    ```javascript
    assert.strictEqual(interceptedMediaControls.length, 1);
    assert.strictEqual(interceptedMediaControls[0].action, 'toggle_play');
    assert.strictEqual(interceptedExecuteScripts.length, 0, 'Must NOT execute conflicting executeScript on play toggle');
    ```
  - When clicking `mockElements.dynamicStatusBtn`, assert 1 IPC call and 0 `executeScript`.
  - When clicking `mockElements.btnCtrlRewind` / `mockElements.btnCtrlForward`, assert 1 IPC call and 0 `executeScript`.
  - When clicking `mockElements.btnCtrlToggleMute` / `mockElements.btnQuickMute`, assert 1 IPC call and 0 `executeScript`.
  - When clicking `mockElements.btnCtrlSpeedDown` / `mockElements.btnCtrlSpeedUp`, assert 1 IPC call and 0 `executeScript`.
  - When clicking `mockElements.btnCtrlFullscreen`, assert 1 IPC call (`toggle_fullscreen`) and 0 `executeScript`.
  - When clicking `mockElements.btnCtrlPip`, `mockElements.btnCtrlTheater`, quality buttons, assert 1 IPC call and 0 `executeScript`.

---

## 4. Verification Gate
Execute the following verification command:
```bash
node tests/test_media_controls_and_fullscreen_fix.js
```
The test suite must exit cleanly with code 0 and output:
```
🎉 ALL MEDIA CONTROLS & ON-VIDEO OVERLAY FULLSCREEN TESTS PASSED WITH 100% SUCCESS!
```
