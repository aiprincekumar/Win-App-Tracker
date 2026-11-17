# Interactive WebSocket Connection Status Cards & Deep-Link Navigation — Live Tracking Board & Problem-Solution Dossier

> **Task ID:** `TASK-WS-CARD-NAV-001`  
> **Target Workspace:** [`c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection)  
> **Lead Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Governance Document:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Ephemeral Container:** `temp_prompt/ws_card_navigation/`  
> **Decision Gate Status:** `PROMPT_FILES_REQUIRED = YES` (Certified Explicit Assessment per Rule 22)  
> **Recommended Execution Strategy:** `STRATEGY_A_AUTONOMOUS` (Target Autonomy Score: 1.0)  

---

## 📌 1. Executive Problem-Solution Dossier

### 1.1 The User Need & Current State
In the Web Activity & Media Sentinel dashboard sidebar, two WebSocket telemetry HUD cards display real-time daemon connection status:
1. **SQLite Data Hub:** `ws://127.0.0.1:65433 (WAL)` (`#sidebarDataHubCard`)
2. **Video Detector HUD:** `ws://127.0.0.1:65432` (`#sidebarHudCard`)

Currently, while these cards display connection status indicators and badges, they do not facilitate direct interaction or navigation. When a user observes a disconnected or offline service in the sidebar telemetry, they must manually:
1. Navigate to the sidebar menu and click "Settings & Data".
2. Search through the settings panels to locate the "Local Services & Hardware Bridges" card (`#cardHardwareBridges`).
3. Identify the corresponding service row (`#rowBridgeHub` or `#rowBridgeHud`).
4. Click the appropriate Reconnect button (`#btnSidebarReconnectHub` or `#btnSidebarReconnect`).

This creates unnecessary friction and cognitive overhead during daemon troubleshooting and setup.

### 1.2 The Phased Remediation Architecture
1. **Phase 1: DOM Accessibility & Visual Interactive Styling (`dashboard.html`, `header_sidebar.css`, `settings.css`, `dashboard.css`)**  
   Audit and enforce WCAG 2.1 AA accessibility on `#sidebarDataHubCard` and `#sidebarHudCard`: verify `role="button"`, `tabindex="0"`, descriptive `aria-label`, `title`, and `aria-controls="cardHardwareBridges"`. Confirm interactive cursor (`pointer`), hover elevate (`translateY(-1px)`), active scale feedback, and high-visibility focus ring (`focus-visible`). Sync transient highlight keyframes (`serviceRowHighlightGlow`, `reconnectBtnPulse`) across stylesheets.
2. **Phase 2: Deep-Link Navigation, Focus Transfer & Interaction Logic (`dashboard/dashboard.js`)**  
   Implement a resilient, modular controller function `navigateToBridgeService(serviceId)` that:
   - Invokes `switchTab('settings')` to activate the Settings tab pane.
   - Smoothly scrolls the target service row (`#rowBridgeHub` or `#rowBridgeHud`) into center view (`scrollIntoView({ behavior: 'smooth', block: 'center' })`).
   - Transfers keyboard focus to the corresponding action button (`#btnSidebarReconnectHub` or `#btnSidebarReconnect`), enabling immediate 2nd-click/Enter/Space activation.
   - Applies transient visual glow/pulse feedback (`.service-row-highlight` and `.highlight-pulse`) with automatic 2000ms cleanup timers.
   - Attaches `click` and `keydown` (`Enter`, `Space` with `preventDefault()`) listeners to `#sidebarDataHubCard` and `#sidebarHudCard`.
3. **Phase 3: Automated QA Test Suite & Full Regression Certification (`tests/test_ws_status_cards_navigation.js`)**  
   Author a comprehensive 6-battery test suite verifying click navigation, keyboard accessibility, smooth scroll dispatch, focus handoff, transient class application, and reduced-motion fallback. Execute the entire test suite (`node run_all_tests.js`) to guarantee 100% clean exit code 0.

---

## 🚦 2. Phase Status & Execution Checklist

| Phase # | Phase Title & Scope | Target Files | Status | Assigned Role | Gate Verification | Quality Certification |
| :---: | :--- | :--- | :---: | :--- | :--- | :---: |
| **Phase 1** | DOM Accessibility & Visual Interactive Styling | `dashboard/dashboard.html`<br>`dashboard/styles/layout/header_sidebar.css`<br>`dashboard/styles/settings.css`<br>`dashboard/dashboard.css` | `READY_FOR_EXECUTION` | Level 4 Frontend Engineer | `git diff --check`<br>`W3C Validator` | Grade A+ Pending |
| **Phase 2** | Deep-Link Navigation & Interaction Logic | `dashboard/dashboard.js` | `READY_FOR_EXECUTION` | Level 4 Frontend Engineer | `node -c dashboard/dashboard.js` | Grade A+ Pending |
| **Phase 3** | Automated QA Test Suite & Regression Gate | `tests/test_ws_status_cards_navigation.js`<br>`run_all_tests.js` | `READY_FOR_EXECUTION` | Level 4 QA Verification Agent | `node tests/test_ws_status_cards_navigation.js`<br>`node run_all_tests.js` | Grade A+ Pending |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix (Rule 20)

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.html` | Status cards had static semantic roles in earlier revisions or need guaranteed explicit `role="button"` and `tabindex="0"` attributes. | Verify and certify `id="sidebarDataHubCard"` and `id="sidebarHudCard"` carry `role="button"`, `tabindex="0"`, `aria-controls="cardHardwareBridges"`, and descriptive `aria-label`. | Screen readers and keyboard navigators recognize both cards as actionable buttons. | Phase 1 | DOM Inspector & A11y Audit |
| **2** | `dashboard/styles/layout/header_sidebar.css`<br>`dashboard/dashboard.css` | Hover and active micro-interactions must provide unambiguous click affordance (cursor, elevate, border highlight, focus outline). | Ensure `.sidebar-hud-card[role="button"]` and `.interactive-hud-card` have `cursor: pointer`, hover translate, specular glow, and `focus-visible` outline. | Immediate visual affordance that status widgets are interactive deep links. | Phase 1 | Visual CSS Verification |
| **3** | `dashboard/styles/settings.css`<br>`dashboard/dashboard.css` | Target service rows require transient glowing animations (`serviceRowHighlightGlow`, `reconnectBtnPulse`) to draw eye to the focused reconnect control. | Certify keyframes and utility classes `.service-row-highlight` and `.highlight-pulse` exist in both `styles/settings.css` and master `dashboard.css`. | User gets unmistakable visual feedback on which service is targeted. | Phase 1 | Animation Keyframe Audit |
| **4** | `dashboard/dashboard.js` | No event listeners (click/keydown) attached to `#sidebarDataHubCard` or `#sidebarHudCard`; clicking status cards does nothing. | Implement `navigateToBridgeService(serviceId)` and bind `click` and `keydown` (Enter/Space) handlers in `initializeEventListeners()`. | Status card clicks seamlessly transition view to Settings and target the bridge row. | Phase 2 | `node -c dashboard/dashboard.js` |
| **5** | `dashboard/dashboard.js` | Navigation to settings requires smooth scroll and focus handoff to action button for instant 2nd-click reconnect. | Within `navigateToBridgeService()`, call `switchTab('settings')`, then `scrollIntoView({ behavior: 'smooth', block: 'center' })` on target row and `button.focus({ preventScroll: true })`. | User can immediately press Enter/Space or click again to reconnect the offline daemon. | Phase 2 | Interaction Emulation Test |
| **6** | `dashboard/dashboard.js` | Highlight classes must be transient without polluting DOM or lingering indefinitely. | Apply timer-based removal (`setTimeout(..., 2000)`) with instance cancellation to clear `.service-row-highlight` and `.highlight-pulse`. | Clean DOM state across repeated navigations with zero memory/timer leaks. | Phase 2 | DOM State Cycle Check |
| **7** | `tests/test_ws_status_cards_navigation.js` | Need automated test suite to prevent regression of status card interactivity, deep linking, and a11y across future refactors. | Author 6-battery test suite verifying DOM attributes, event bindings, tab switching, scroll calls, focus transfer, and timer cleanup. | 100% automated regression protection integrated into `run_all_tests.js`. | Phase 3 | `node run_all_tests.js` |

---

## 🧭 4. Implementation Strategy Evaluation

### 4.1 Selected Strategy: `STRATEGY_A_AUTONOMOUS`
- **Autonomy Score:** `1.0`
- **Rationale:**
  1. The task requirements, DOM element IDs, and CSS animation classes are 100% specified and deterministic.
  2. The target elements already exist in the codebase (`#sidebarDataHubCard`, `#sidebarHudCard`, `#cardHardwareBridges`, `#rowBridgeHub`, `#rowBridgeHud`, `#btnSidebarReconnectHub`, `#btnSidebarReconnect`).
  3. No architectural forks, database changes, or user-facing trade-offs exist.
  4. Execution flows naturally across 3 sequential phases with automated unit and regression test gates.
