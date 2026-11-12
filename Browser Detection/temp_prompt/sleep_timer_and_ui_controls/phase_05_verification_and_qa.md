# Phase 5: Verification, Automated Test Suite & Certification

> **Phase Reference:** `phase_05_verification_and_qa.md`  
> **Milestone:** 5 of 5  
> **Assigned Role:** QA Verification Engineer  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Architecture Standard:** Deterministic Node.js CLI Verification & AST Auditing  
> **Governing Document:** [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/sleep_timer_and_ui_controls/TRD.md)  

---

## 🎯 1. Phase Objective

Construct a comprehensive, deterministic automated test suite in [`tests/test_sleep_timer_and_ui_controls.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_sleep_timer_and_ui_controls.js) to certify the end-to-end functionality of the Sleep Timer, Inactivity Sentinel, and UI Controls suite. Validate state machine transitions, epoch calculations, color interpolation algorithms, storage schema serialization, SVG markup validity, and zero `innerHTML` compliance. Achieve Grade A+ certification before declaring initiative complete.

---

## 📦 2. Prerequisites & Inputs

- Completion of all preceding phases (Phases 1 through 4).
- Access to all modified files: `background.js`, `content_media.js`, `dashboard/dashboard.html`, `dashboard/dashboard.js`, `popup/popup.html`, `popup/popup.js`.
- Ensure all created/modified files maintain UTF-8 with BOM standard (`0xEF, 0xBB, 0xBF`).

---

## 🔗 3. Technical Context & File Anchors

- **Target File 1:** [`tests/test_sleep_timer_and_ui_controls.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_sleep_timer_and_ui_controls.js) (newly created test suite).
- **Target File 2:** [`tests/test_syntax_and_manifest_integrity.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_syntax_and_manifest_integrity.js) (regression baseline).

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 5.1: Construct `tests/test_sleep_timer_and_ui_controls.js`
Create [`tests/test_sleep_timer_and_ui_controls.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_sleep_timer_and_ui_controls.js) implementing 10 deterministic test suites:

1. **Test 1: Sleep Timer Finite State Machine Transitions:**
   - Verify transitions: `IDLE` -> `RUNNING` -> `PAUSED` -> `RUNNING` -> `TRIGGERED`.
   - Verify cancellation: `RUNNING` -> `CANCELLED` -> `IDLE`.
2. **Test 2: Epoch Calculation & Target Time Invariants:**
   - Verify `targetTime = startTime + durationMinutes * 60 * 1000`.
   - Verify clamp limits: min 1 minute, max 1440 minutes.
3. **Test 3: Mathematical Dynamic Color Interpolation Accuracy:**
   - Verify > 50% remaining returns green shade (`#22c55e`).
   - Verify 35% remaining returns amber/yellow shade (`#eab308`).
   - Verify <= 20% remaining returns critical red (`#ef4444`).
4. **Test 4: Dynamic Badge Text Formatting Engine:**
   - Verify remaining >= 60s formats as `XXm` (e.g. `30m`, `15m`, `1m`).
   - Verify remaining < 60s formats as `XXs` (e.g. `45s`, `10s`).
   - Verify expired/idle formats as empty string `""`.
5. **Test 5: Storage Schema Contract Serialization:**
   - Validate `sentinel_sleep_timer` contains required fields: `state`, `durationMinutes`, `startTime`, `targetTime`, `pauseMedia`, `enableFadeOut`.
   - Validate `sentinel_sleep_settings` defaults match specifications.
6. **Test 6: Inactivity Auto-Sleep Sentinel Logic:**
   - Simulate `chrome.idle` state transition to `idle`.
   - Verify media sessions are queried and paused when `enableInactivityAutoSleep` is true.
7. **Test 7: DOM Structure & Element Presence in `popup/popup.html`:**
   - Verify `#btnRefresh`, `#btnGlobalMediaToggle`, `#btnSleepTimerTrigger`, `#btnReconnectWs`, `#btnOpenDashboard`.
   - Verify `#sleepTimerPopover` containing `.preset-pill-btn`, `#customTimerInput`, `#btnCancelActiveTimer`.
8. **Test 8: DOM Structure & Element Presence in `dashboard/dashboard.html`:**
   - Verify `#cardSleepSettings`, `#settingDefaultSleepDuration`, `#settingSleepFadeToggle`, `#settingInactivitySleepToggle`, `#btnSaveSleepSettings`.
9. **Test 9: Modern SVG Vector Markup Integrity:**
   - Verify all 5 toolbar buttons contain valid `<svg>` elements with `viewBox="0 0 24 24"`, `width="16"`, `height="16"`, `stroke="currentColor"`.
10. **Test 10: Zero innerHTML & W3C Trusted Types Audit:**
   - Scan `popup.js`, `dashboard.js`, `content_media.js` for `.innerHTML =`.
   - Certify zero insecure innerHTML assignments across all files.

### Step 5.2: Execute Full Verification Suite
Run the test suites sequentially:
```powershell
node tests/test_sleep_timer_and_ui_controls.js
node tests/test_syntax_and_manifest_integrity.js
```

---

## 🚫 5. Architectural Constraints & Boundaries

- All tests must be 100% self-contained and deterministic with zero network dependencies.
- Exit code must strictly be 0 on success, non-zero on failure.
- Include clear visual emoji reporting (`✅`, `❌`, `🧪`, `🎉`) matching existing test suites.

---

## 📋 6. Deliverables Manifest

1. Created [`tests/test_sleep_timer_and_ui_controls.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_sleep_timer_and_ui_controls.js) comprehensive test suite.
2. Verified pass logs for `test_syntax_and_manifest_integrity.js`.

---

## 🧪 7. Local Verification Gate & Grade A+ Certification Criteria

- **Gate Criterion 1:** `node tests/test_sleep_timer_and_ui_controls.js` passes with 10/10 green tests.
- **Gate Criterion 2:** `node tests/test_syntax_and_manifest_integrity.js` passes with 100% success.
- **Grade A+ Criteria:**
  - 0 syntax errors across all extension scripts.
  - 0 parse errors under Node `vm.Script`.
  - 0 `.innerHTML` violations (W3C Trusted Types compliant).
  - 100% UTF-8 with BOM standard compliance.
