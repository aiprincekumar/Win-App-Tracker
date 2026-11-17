# Phase 3 Execution Prompt: Automated QA Test Suite & Full Regression Certification

> **Phase:** 3 of 3  
> **Phase Name:** Automated QA Test Suite & Full Regression Certification  
> **Target Role:** Level 4 QA Verification Agent  
> **Assigned Scope:** Author `tests/test_ws_status_cards_navigation.js` and execute full regression test runner `run_all_tests.js`.  
> **Target Files:**
> - [`tests/test_ws_status_cards_navigation.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_ws_status_cards_navigation.js)
> - [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)

---

## 🎯 Phase Objective
Develop a dedicated, automated 6-battery test suite in `tests/test_ws_status_cards_navigation.js` that tests all facets of the interactive status cards feature in a simulated DOM environment, then verify 100% clean passage of the entire workspace test suite via `node run_all_tests.js` with exit code 0.

---

## 📋 Prerequisites & Context
- Universal Rule 5 & 8: Maintain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
- Universal Rule 1 & Anti-Skip Pillar D: Independent QA verification sign-off is mandatory before declaring completion.
- Universal Rule 10: 100% W3C Trusted Types compliant (zero innerHTML assignments).
- Universal Rule 16: Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`).

---

## 🛠️ Surgical Step-by-Step Instructions

### Step 1: Author `tests/test_ws_status_cards_navigation.js`
The test suite must cover 6 comprehensive batteries:
1. **Battery 1: DOM Markup & Accessibility Semantics**
   - Verify `#sidebarDataHubCard` and `#sidebarHudCard` exist in `dashboard/dashboard.html`.
   - Verify `role="button"`, `tabindex="0"`, `aria-controls="cardHardwareBridges"`, and non-empty `aria-label` and `title`.
2. **Battery 2: CSS Stylesheet Interactivity & Keyframes**
   - Verify `.interactive-hud-card` or `.sidebar-hud-card[role="button"]` defines `cursor: pointer` and hover transform.
   - Verify `@keyframes serviceRowHighlightGlow` and `.service-row-highlight` exist in stylesheets.
   - Verify `@keyframes reconnectBtnPulse` and `.highlight-pulse` exist in stylesheets.
   - Verify `@media (prefers-reduced-motion: reduce)` rules are present.
3. **Battery 3: Click Event Navigation to Settings**
   - Emulate click on `#sidebarDataHubCard` -> verify `switchTab('settings')` is called.
   - Emulate click on `#sidebarHudCard` -> verify `switchTab('settings')` is called.
4. **Battery 4: Keyboard Activation (Enter & Space)**
   - Emulate `Enter` keydown -> triggers navigation.
   - Emulate `Space` keydown -> triggers navigation AND verifies `preventDefault()` was called.
5. **Battery 5: Scroll Targeting, Focus Handoff & Highlight Classes**
   - For SQLite Data Hub: verifies `#rowBridgeHub` receives `scrollIntoView()` and `.service-row-highlight`, and `#btnSidebarReconnectHub` receives `.focus()` and `.highlight-pulse`.
   - For Video Detector HUD: verifies `#rowBridgeHud` receives `scrollIntoView()` and `.service-row-highlight`, and `#btnSidebarReconnect` receives `.focus()` and `.highlight-pulse`.
   - Verifies 2000ms timer cleanup removes the classes.
6. **Battery 6: W3C Trusted Types & Syntax Integrity**
   - Validates `dashboard/dashboard.js` with zero forbidden `innerHTML` strings in the new code.
   - Validates clean JavaScript parsing (`node -c`).

### Step 2: Register in `run_all_tests.js` (If applicable)
Check if test files are auto-discovered or explicitly listed in `run_all_tests.js`. If explicitly listed, ensure `tests/test_ws_status_cards_navigation.js` is included.

### Step 3: Run Full Test Suite
Execute:
`node run_all_tests.js`
Verify that all test suites pass with 100% clean exit code 0.

---

## 🚦 Local Verification Gate
Execute:
1. `node tests/test_ws_status_cards_navigation.js` -> 100% pass across all 6 batteries.
2. `node run_all_tests.js` -> 100% pass across entire test suite.
Pass Criteria: Exit code 0, 0 failures, 0 regressions.
