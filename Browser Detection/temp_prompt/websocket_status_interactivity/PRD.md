# Product Requirements Document (PRD): WebSocket Status Indicators Interactivity

> **Feature Name:** Interactive WebSocket Status Indicators & Deep-Link Navigation  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target Module:** Dashboard Sidebar Telemetry Cluster & Settings Bridge Cards  
> **Lead Department:** Dept 01 Product Requirements  

---

## 🎯 1. Objective & User Personas

### 1.1 Objective
Empower developers and end users to immediately resolve offline or interrupted WebSocket states (SQLite Data Hub on port 65433 or Video Detector HUD on port 65432) with a single click or keyboard gesture directly from the persistent sidebar, automatically navigating to and highlighting the exact reconnection action in the Settings panel.

### 1.2 User Personas
- **Desktop Power User:** Monitors extension telemetry while multitasking; notices red offline dot in sidebar and desires an instant 1-click jump to reconnect without hunting through settings tabs.
- **Keyboard / Accessibility User:** Operates the dashboard entirely via `Tab`, `Shift+Tab`, `Enter`, and `Space`. Needs clear focus rings, standard button semantics, and automated focus delegation to the target action.
- **Extension Maintainer / QA:** Requires rock-solid backward compatibility with telemetry events, multi-browser filtering, and automated test suites.

---

## 📋 2. Functional Requirements (FR)

| ID | Functional Requirement Description | Acceptance Criteria | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | **Interactive Sidebar Cards:** The SQLite Data Hub and Video Detector HUD cards in `dashboard/dashboard.html` must be rendered as interactive button elements (`role="button"`, `tabindex="0"`). | Cards receive focus on keyboard tab; cursor displays pointer; tooltips describe click navigation. | P0 (Must Have) |
| **FR-02** | **Keyboard Activation:** Pressing `Enter` or `Space` while focused on either sidebar status card must trigger the navigation action. | `e.key === 'Enter' \|\| e.key === ' '` executes navigation and prevents default page scrolling. | P0 (Must Have) |
| **FR-03** | **Tab Switching:** Activating the SQLite Data Hub card or Video Detector HUD card must programmatically switch the active dashboard tab to `'settings'`. | `switchTab('settings')` executed; `#navTabSettings` becomes active; `#tabContentSettings` is displayed. | P0 (Must Have) |
| **FR-04** | **Smooth Centering & Scroll:** The viewport must smoothly scroll the relevant service row into the center of the screen. | `targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })` executed cleanly. | P0 (Must Have) |
| **FR-05** | **Focus Transfer:** Keyboard focus must be programmatically transferred to the respective Reconnect button (`#btnSidebarReconnectHub` or `#btnSidebarReconnect`). | Reconnect button receives `.focus()`; user can immediately press `Enter` or `Space` to reconnect. | P0 (Must Have) |
| **FR-06** | **Transient Glow / Pulse Feedback:** The target service row and/or button must display a transient pulsing glow highlight that automatically cleans up after ~1.8 seconds. | CSS class `.service-row-highlight` applied; keyframe animation pulses; class removed after timer expires. | P1 (Should Have) |
| **FR-07** | **Haptic Feedback:** If `window.sentinelHaptics` or `SentinelHapticAudioEngine` is present, clicking the card must trigger tactile click audio. | `sentinelHaptics.playClick()` invoked safely with null-guards. | P2 (Nice to Have) |

---

## 🛡️ 3. Non-Functional Requirements (NFR)

1. **Backward Compatibility & Telemetry Preservation (NFR-01):**
   - All existing functions (`updateHUDStatus()`, `updateDataHubStatus()`) must continue to update DOM status dots and labels without disruption.
   - All canonical DOM IDs (`#dataHubSidebarDot`, `#dataHubSidebarLabel`, `#hudStatusDot`, `#hudStatusLabel`, `#btnSidebarReconnectHub`, `#btnSidebarReconnect`, `#rowBridgeHub`, `#rowBridgeHud`) must remain unchanged.
2. **Accessibility & WCAG 2.1 AA Compliance (NFR-02):**
   - High-contrast `:focus-visible` outline on interactive sidebar cards.
   - Distinct `aria-label` providing full context for screen readers.
   - Status labels marked `aria-hidden="true"` retain hygiene when visually hidden.
3. **Performance & Lightweight Execution (NFR-03):**
   - Zero layout shifts (CLS); CSS animations use hardware-accelerated properties (`box-shadow`, `border-color`, `transform`).
   - Cleanup timer (`setTimeout`) must be idempotent and clear without memory leaks.
4. **Security & Trusted Types (NFR-04):**
   - 100% W3C Trusted Types compliant: zero `innerHTML` or `outerHTML` assignments; all DOM modifications performed via standard attributes and `classList`.
5. **Code Quality & Encoding (NFR-05):**
   - All modified and new files must maintain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
   - Clean AST parsing via Node.js `vm.Script`.
   - 0 leaks in `gitleaks detect --redact`.

---

## 🧪 4. INVEST User Stories & MoSCoW Prioritization

### User Story 1 (Data Hub Status Interactivity)
- **As a** developer monitoring data ingestion,
- **I want to** click the sidebar SQLite Data Hub widget when it shows offline,
- **So that** I am immediately brought to the SQLite Data Hub Daemon row in Settings with the Reconnect Hub button focused and highlighted.

### User Story 2 (HUD Status Keyboard Navigation)
- **As an** accessible keyboard user navigating the dashboard,
- **I want to** tab to the Video Detector HUD card and press `Enter`,
- **So that** the dashboard switches to Settings, centers the Video Detector HUD bridge row, and places focus directly on the Reconnect HUD button.
