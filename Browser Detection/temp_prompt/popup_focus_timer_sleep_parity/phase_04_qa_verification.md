# Phase 4: Independent QA Verification & Regression Testing Specification

> **Phase Identifier:** `PHASE-04-QA-VERIFICATION`  
> **Parent Task:** `TASK-POPUP-FOCUS-TIMER-SLEEP-PARITY-002`  
> **Target Subagent:** Level 4 Independent QA Verification Subagent (`qa_engineer`)  
> **Target Files:** `tests/test_popup_focus_timer_sleep_parity.js`, `run_all_tests.js`  
> **Lead Department:** Department 08 (QA & Testing)  

---

## 🎯 1. Phase Objective

Perform rigorous independent automated verification of the Focus Block Sleep-Parity enhancement:
1. Construct dedicated test suite `tests/test_popup_focus_timer_sleep_parity.js` across 8 thorough test batteries.
2. Verify DOM layout, element IDs, and semantic structures.
3. Verify event listeners and button bindings (-5m, +5m, +15m, toggle, reset).
4. Verify backend delta logic with positive and negative clamping.
5. Verify master test runner `node run_all_tests.js` passes 100% clean with zero failures.
6. Verify zero secret leaks via `gitleaks detect --redact`.
7. Verify UTF-8 with BOM on all touched files.

---

## 🧪 2. Test Battery Matrix (`tests/test_popup_focus_timer_sleep_parity.js`)

| Battery # | Battery Scope & Verification Target | Assertion Criteria |
| :---: | :--- | :--- |
| **Battery 1** | DOM Structural Parity in `popup/popup.html` | Asserts existence of `#popupFocusDialFinishTime`, `#btnPopupFocusReduce5m`, `#btnPopupFocusExtend5m`, `#btnPopupFocusExtend15m`, `#cardFocusPresetsAndCustom`, `.focus-tab-presets-grid`, `#inputFocusCustomMinutes`, `#btnSetFocusCustom`. |
| **Battery 2** | Legacy DOM IDs & CSS Class Preservation | Confirms `#cardPopupFocusTimer`, `#popupFocusBadge`, `#popupFocusClock`, `#btnPopupFocusToggle`, `#btnPopupFocusReset` exist without mutation or collision. |
| **Battery 3** | Quick Actions Row Layout & Attribute Verification | Validates `aria-label`, `title`, and child spans for icons and text on `#btnPopupFocusToggle`. |
| **Battery 4** | Preset Chips Completeness & Active Toggling | Verifies all 6 preset chips (15, 25, 30, 45, 50, 60m) are rendered and `.active` class toggles cleanly with duration state. |
| **Battery 5** | Custom Duration Input Range & Form Validation | Verifies min=1, max=720 bounds, numeric type, and click/Enter handler trigger. |
| **Battery 6** | Backend Negative Delta & Min Floor Clamping | Asserts `extendFocusTimer(-5)` subtracts 300s, clamps at minimum 60s floor without negative countdown, and reschedules alarms correctly. |
| **Battery 7** | Target Finish Time Live Formatter Logic | Tests format string outputs for "No active timer" (idle) and "Finish: H:MM AM/PM" (running). |
| **Battery 8** | W3C Trusted Types & UTF-8 BOM Audit | Scans modified files for `innerHTML` assignments (must be 0) and verifies UTF-8 with BOM header bytes (`0xEF, 0xBB, 0xBF`). |

---

## 🚦 3. Regression Test Execution Commands

```powershell
# 1. Run the dedicated test suite
node tests/test_popup_focus_timer_sleep_parity.js

# 2. Run the legacy focus suites
node tests/test_focus_block_circular_dial.js
node tests/test_focus_time_phase1_uiux.js
node tests/test_focus_time_subsystem.js

# 3. Run the master test runner
node run_all_tests.js

# 4. Run secret scan
gitleaks detect --redact
```

---

## 📋 4. Exit Criteria for Grade A+ Certification
1. All 8 batteries in `test_popup_focus_timer_sleep_parity.js` exit with code 0 (100% PASS).
2. All test suites in `node run_all_tests.js` pass with 0 failures.
3. Terminal proof of clean test runner execution captured.
4. Gitleaks reports 0 leaks.
5. All touched files verified with UTF-8 BOM.
