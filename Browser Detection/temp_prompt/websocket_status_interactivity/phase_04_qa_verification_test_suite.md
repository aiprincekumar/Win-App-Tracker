# Phase 4: Independent QA Automated Test Suite & Regression Verification

> **Phase:** 04  
> **Workspace:** `temp_prompt/websocket_status_interactivity/`  
> **Target Files:**
> - [`tests/test_sidebar_websocket_interactivity.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_sidebar_websocket_interactivity.js)
> - [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)  
> **Assigned Agent:** Level 4 QA Subagent  
> **Prerequisites:** Phase 1, Phase 2, and Phase 3 completed.  

---

## 🎯 1. Phase Objective

Author an automated verification test suite (`tests/test_sidebar_websocket_interactivity.js`) covering DOM contracts, accessibility attributes, CSS keyframe styles, AST validation, mock DOM navigation event execution, and telemetry invariance. Register the test suite in `run_all_tests.js`, verify 100% test passage (55/55 suites with exit code 0), and verify zero secret leaks via `gitleaks`.

---

## 📋 2. Step-by-Step Surgical Instructions

### Step 2.1: Author `tests/test_sidebar_websocket_interactivity.js`
The test suite must include 6 comprehensive verification batteries:

1. **Battery 1: Canonical DOM IDs & Markup Contracts**
   - Assert existence of `#sidebarDataHubCard` and `#sidebarHudCard` in `dashboard/dashboard.html`.
   - Assert all 4 nested telemetry IDs are present: `#dataHubSidebarDot`, `#dataHubSidebarLabel`, `#hudStatusDot`, `#hudStatusLabel`.
   - Assert destination IDs exist in settings: `#rowBridgeHub`, `#rowBridgeHud`, `#btnSidebarReconnectHub`, `#btnSidebarReconnect`.

2. **Battery 2: Accessibility & WAI-ARIA Standards**
   - Assert `role="button"` on both sidebar cards.
   - Assert `tabindex="0"` on both sidebar cards.
   - Assert descriptive `aria-label` and `title` attributes.
   - Assert `aria-hidden="true"` on `.hud-status-hidden` labels.

3. **Battery 3: CSS Micro-Interactions & Pulse Keyframes**
   - Assert presence of `.sidebar-hud-card[role="button"]` or `.interactive-hud-card` in `header_sidebar.css` and `dashboard.css`.
   - Assert `:focus-visible` styling is declared.
   - Assert `@keyframes serviceRowHighlightGlow` and `.service-row-highlight` exist in `settings.css` and `dashboard.css`.
   - Assert `@keyframes reconnectBtnPulse` and `.highlight-pulse` exist.

4. **Battery 4: JavaScript AST & Navigation Logic Parsing**
   - Validate AST syntax compilation of `dashboard/dashboard.js` using `vm.Script`.
   - Assert definition and export of `navigateToBridgeService`.
   - Assert event listener registrations for `click` and `keydown` on both cards.

5. **Battery 5: Mock DOM Event Dispatch & Highlight Verification**
   - Simulate clicking `#sidebarDataHubCard`:
     - Verify `switchTab('settings')` is invoked.
     - Verify `row.scrollIntoView` is called with `{ behavior: 'smooth', block: 'center' }`.
     - Verify `btn.focus` is invoked.
     - Verify `service-row-highlight` and `highlight-pulse` classes are applied.
   - Simulate keydown (`Enter`, Space) on `#sidebarHudCard`:
     - Verify equivalent navigation and highlighting for Video Detector HUD.

6. **Battery 6: Telemetry Invariance & UTF-8 BOM Verification**
   - Simulate `updateHUDStatus('online')`, `updateHUDStatus('starting')`, `updateHUDStatus('offline')`.
   - Simulate `updateDataHubStatus(true)` and `updateDataHubStatus(false)`.
   - Verify that sidebar dots (`#dataHubSidebarDot`, `#hudStatusDot`) update classes correctly.
   - Verify UTF-8 BOM (`0xEF, 0xBB, 0xBF`) on all modified files (`dashboard.html`, `dashboard.js`, `dashboard.css`, `header_sidebar.css`, `settings.css`, and test file).

### Step 2.2: Register in `run_all_tests.js` (if necessary)
Ensure the new test file is executed as part of `node run_all_tests.js`.

### Step 2.3: Security Scan & Rules Verification
- Run `gitleaks detect --redact` (must yield 0 leaks).
- Run `npm run rules:check` (if applicable) or verify all rules integrity.

---

## 🧪 3. Local Verification Gate

Execute verification check:
```powershell
node tests/test_sidebar_websocket_interactivity.js
node run_all_tests.js
```
Gate passes cleanly with exit code 0 (55/55 suites PASS).
