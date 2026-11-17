# Live Tracking Board: WebSocket Status Indicators Interactivity & Deep-Link Navigation

> **Task Workspace:** `temp_prompt/websocket_status_interactivity/`  
> **Project Scope:** Web Activity & Media Sentinel (`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`)  
> **Task ID:** `TASK-SIDEBAR-WS-STATUS-INTERACTIVITY-001`  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Target Autonomy Score: 1.0)  
> **Lead Departments:** Dept 01 Product Requirements, Dept 04 UI/UX Design System, Dept 05 Frontend Engineering, Dept 08 QA & Testing  
> **Authorization State:** WAITING_FOR_MANAGER_GATE (Level 3C Specialist Certified)  

---

## 📋 Executive Problem-Solution Dossier

### Problem Statement
1. **Static Sidebar Telemetry Indicators:** In `dashboard/dashboard.html`, while `#wellbeingLiveMicroWidget` is interactive and navigates to the Wellbeing tab on click, the sibling status widgets for SQLite Data Hub and Video Detector HUD are passive `<div>` elements lacking canonical IDs, `role="button"`, and keyboard focusability (`tabindex="0"`).
2. **Missing Deep-Link Navigation:** Users viewing an offline or starting status on the sidebar HUD cards cannot click or press Enter/Space to immediately navigate to the relevant service controls in the Settings tab.
3. **No Visual Context Bridge on Arrival:** When switching to the Settings tab, users must manually search for the Hardware Bridges card and locate the respective Reconnect button (`#btnSidebarReconnectHub` or `#btnSidebarReconnect`). There is no auto-scroll (`scrollIntoView`), autofocus, or transient visual highlight (glow/pulse) indicating which service row needs attention.
4. **Strict Invariant Requirements:** Any enhancement to the sidebar status cards must maintain 100% backward compatibility for all existing telemetry functions (`updateHUDStatus`, `updateDataHubStatus`), keep all canonical DOM IDs (`#dataHubSidebarDot`, `#dataHubSidebarLabel`, `#hudStatusDot`, `#hudStatusLabel`, `#btnSidebarReconnectHub`, `#btnSidebarReconnect`), preserve W3C Trusted Types compliance, and guarantee zero regressions across all 54 existing test suites.

### Solution Architecture
1. **Phase 1: Accessible HTML Markup & Canonical DOM IDs (`dashboard/dashboard.html`):**
   - Assign canonical container IDs: `#sidebarDataHubCard` (SQLite Data Hub widget) and `#sidebarHudCard` (Video Detector HUD widget).
   - Inject accessibility attributes: `role="button"`, `tabindex="0"`, `aria-label="SQLite Data Hub Status - Click to configure or reconnect"`, `aria-label="Video Detector HUD Status - Click to configure or reconnect"`.
   - Update titles to reflect interactive capability. Retain all existing nested telemetry IDs.
2. **Phase 2: CSS Interactive Micro-states, Focus Rings & Pulse Glow Animation (`dashboard.css`, `header_sidebar.css`, `settings.css`):**
   - Add `.sidebar-hud-card[role="button"]` cursor, hover lift, and `:focus-visible` accessible outline (WCAG 2.1 AA compliant).
   - Author `@keyframes serviceRowHighlightGlow` and `@keyframes reconnectBtnPulse` in `dashboard/styles/settings.css` and `dashboard.css`.
   - Define `.service-row-highlight` and `.highlight-pulse` classes with calibrated glowing borders, dynamic box-shadows, and smooth fade-out.
3. **Phase 3: JavaScript Navigation Engine & Telemetry Invariance (`dashboard/dashboard.js`):**
   - Implement `navigateToBridgeService(serviceType)` helper:
     - Calls `switchTab('settings')`.
     - Identifies target row (`#rowBridgeHub` / `#rowBridgeHud`) and reconnect button (`#btnSidebarReconnectHub` / `#btnSidebarReconnect`).
     - Invokes `scrollIntoView({ behavior: 'smooth', block: 'center' })`.
     - Focuses the button (`btn.focus({ preventScroll: true })`).
     - Applies `.service-row-highlight` and `.highlight-pulse` with an automated cleanup timer (`setTimeout(..., 1800)`).
   - Bind click and keydown (`Enter`, `' '`) listeners to `#sidebarDataHubCard` and `#sidebarHudCard`.
   - Wire tactile haptic feedback (`SentinelHapticAudioEngine.playClick()`) when available.
   - Maintain 100% telemetry invariance for `updateHUDStatus()` and `updateDataHubStatus()`.
4. **Phase 4: Independent QA Automated Test Suite & Regression Verification (`tests/`):**
   - Author `tests/test_sidebar_websocket_interactivity.js` verifying DOM contracts, keyboard accessibility, smooth scroll dispatch, focus delegation, transient highlight class toggles, and telemetry simulation.
   - Run `node run_all_tests.js` (ensuring 55/55 suites pass with exit code 0).
   - Enforce UTF-8 with BOM (`0xEF, 0xBB, 0xBF`), zero innerHTML (Trusted Types), and gitleaks clean audit.

---

## 🚦 Phase Status Checklist

| Phase # | Name | Target File(s) | Assigned Agent | Status | Local Gate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Accessible HTML Markup & Canonical DOM IDs | `dashboard/dashboard.html` | Level 4 Subagent | ⏳ PENDING | DOM parser check, canonical ID validation, ARIA role audit |
| **Phase 2** | CSS Interactive Micro-states & Highlight Pulse | `dashboard/dashboard.css`, `header_sidebar.css`, `settings.css` | Level 4 Subagent | ⏳ PENDING | CSS syntax validation, :focus-visible rings, keyframe animation check |
| **Phase 3** | JavaScript Navigation Engine & Telemetry Invariance | `dashboard/dashboard.js` | Level 4 Subagent | ⏳ PENDING | AST vm.Script compile, mock DOM click/keyboard dispatch, telemetry tests |
| **Phase 4** | QA Automated Test Suite & Full Regression Pass | `tests/test_sidebar_websocket_interactivity.js`, `run_all_tests.js` | Level 4 QA Subagent | ⏳ PENDING | 55/55 test suites PASS (exit code 0), UTF-8 BOM check, gitleaks 0 leaks |

---

## 🔍 Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `dashboard/dashboard.html` | Sidebar HUD cards lack canonical IDs, keyboard focusability (`tabindex="0"`), and interactive ARIA role (`role="button"`). | Add `id="sidebarDataHubCard"`, `id="sidebarHudCard"`, `role="button"`, `tabindex="0"`, and informative `aria-label` / `title` attributes. | Screen reader accessible, keyboard operable, targetable in JS and tests. | Phase 1 | HTML parser & DOM ID audit |
| 2 | `dashboard/styles/layout/header_sidebar.css` & `dashboard.css` | `.sidebar-hud-card` does not provide distinct focus-visible indicator or active click scale transform for keyboard users. | Add `:focus-visible` ring (`outline: 2px solid var(--accent-primary)`) and active state compression. | Exceeds WCAG 2.1 AA focus indication requirements. | Phase 2 | CSS token & pseudo-class check |
| 3 | `dashboard/styles/settings.css` & `dashboard.css` | No keyframe glow or transient highlight class exists for highlighting the target bridge row or button when arriving from sidebar. | Author `@keyframes serviceRowHighlightGlow` and `.service-row-highlight` with glowing border and subtle pulse. | Clear visual beacon directing user attention to relevant reconnect button. | Phase 2 | Keyframe parsing & theme parity |
| 4 | `dashboard/dashboard.js` | No event listeners or navigation logic connected to sidebar WebSocket status cards. | Wire click and keyboard (`Enter`, Space) handlers that trigger `switchTab('settings')`, smooth scroll, focus, and transient highlight. | 1-click intuitive transition from status observation to service reconnection. | Phase 3 | AST parsing & event simulation |
| 5 | `dashboard/dashboard.js` | Telemetry functions `updateHUDStatus` and `updateDataHubStatus` must remain completely intact. | Keep all existing DOM selectors, class assignments, and state transitions strictly preserved. | Zero regression on WebSocket telemetry, retry loops, or multi-browser updates. | Phase 3 | Telemetry mock test suite |
| 6 | `tests/test_sidebar_websocket_interactivity.js` | Need dedicated regression test suite validating the new navigation, a11y attributes, and pulse behavior. | Author 6-battery test suite covering DOM contracts, a11y, CSS classes, AST, click/keyboard navigation, and telemetry invariance. | Prevents regressions, certifies Grade A+ quality gate. | Phase 4 | `node tests/test_sidebar_websocket_interactivity.js` |
| 7 | Full Workspace & Git | Modified files must adhere to UTF-8 BOM standard, W3C Trusted Types, and 0 gitleaks findings. | Verify BOM bytes on all touched files, run all 55 test suites, scan secrets with gitleaks, and commit locally per Rule 15. | 100% clean test suite, zero security leaks, atomic commit proof. | Phase 4 | `node run_all_tests.js` & `gitleaks detect` |
