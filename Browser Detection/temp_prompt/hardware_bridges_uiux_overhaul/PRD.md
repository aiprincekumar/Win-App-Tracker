# Product Requirements Document (PRD): Local Services & Hardware Bridges UI/UX Overhaul

> **Document Type:** Product Requirements Document  
> **Workspace Container:** `temp_prompt/hardware_bridges_uiux_overhaul/`  
> **Lead Department:** Dept 01 Product Requirements  

---

## 👥 1. Target User Personas & Problem Scenarios

1. **Power User & Digital Sovereignty Advocate (Alex):**
   - *Needs:* Alex runs local background daemons (SQLite event hub on port 65433, Video Detector HUD on port 65432) to ensure 100% local, offline telemetry processing without reliance on cloud servers.
   - *Pain Point:* When checking the extension Settings dashboard, the Hardware Bridges card looks static and uninformative. Alex cannot tell at a glance whether the SQLite hub is connected, listening in WAL mode, or experiencing reconnection backoff without opening developer tools or inspecting logs.
2. **Multitasking Productivity Professional (Priya):**
   - *Needs:* Priya frequently switches between work contexts and uses both the compact popup window and full dashboard settings.
   - *Pain Point:* The status indicators in the popup header look sleek and modern, but the dashboard's Hardware Bridges section feels disconnected and clunky, causing friction when diagnosing local service connectivity.

---

## 🎯 2. Functional Requirements (FR)

- **FR-01: Bento Grid Card Presentation:** `#cardHardwareBridges` must render as a responsive Bento Grid card (`bento-span-6` on desktop, `bento-span-12` on mobile) utilizing Liquid Glass 2.0 aesthetics with backdrop blur and subtle border gradient.
- **FR-02: SQLite Data Hub Telemetry Row:**
  - Displays icon (`💾`), localized service name, port pill (`Port 65433 (WAL)`), and descriptive subtitle.
  - Features real-time status pill (`#bridgeHubStatusBadge`) containing an animated LED dot (`#bridgeHubStatusDot`) and localized text (`#bridgeHubStatusText`) reflecting: `Connected` (green), `Connecting...` (amber pulse), `Disconnected` (red).
  - Displays action button `#btnSidebarReconnectHub` with icon, dynamic label, and tactile hover/press states.
- **FR-03: Video Detector HUD Bridge Telemetry Row:**
  - Displays icon (`🖥️`), localized service name, port pill (`Port 65432`), and descriptive subtitle.
  - Features real-time status pill (`#bridgeHudStatusBadge`) containing an animated LED dot (`#bridgeHudStatusDot`) and localized text (`#bridgeHudStatusText`) reflecting: `Connected` (green), `Starting...` (amber pulse), `Disconnected` (red).
  - Displays action button `#btnSidebarReconnect` with icon, dynamic label, and tactile hover/press states.
- **FR-04: Real-time Telemetry Synchronization:**
  - When connection states change via WebSocket events, dashboard polling, or user interaction, all corresponding DOM nodes in `#cardHardwareBridges` must update instantly without page reload.
  - Button state transitions to loading/disabled during reconnection attempts.
- **FR-05: Tactile Audio Haptic Feedback:**
  - Clicking reconnect triggers subtle procedural click audio.
  - Successful connection triggers uplifting chime.
  - Failed connection triggers warning tone (if audio haptics are enabled).
- **FR-06: Symmetrical Bilingual Parity:**
  - 100% of text elements within `#cardHardwareBridges` must switch seamlessly between English and Hindi when language is toggled.

---

## 🔒 3. Non-Functional Requirements (NFR)

- **NFR-01: W3C Trusted Types & Zero-innerHTML:** 100% compliance with W3C Trusted Types. Zero `.innerHTML`, `document.write`, or inline HTML evaluation.
- **NFR-02: WCAG 2.1 AAA Accessibility:** Text and badge contrast ratios must exceed 7.0:1 on normal text across all 4 theme substrates. All interactive elements must support keyboard navigation (Tab, Enter, Space) and have valid ARIA labels.
- **NFR-03: Zero FOUC & Sub-16ms Render:** Styling must apply synchronously within the 16ms animation frame budget without layout shifts (CLS < 0.01).
- **NFR-04: Encoding Purity:** All files must start with UTF-8 BOM (`0xEF, 0xBB, 0xBF`) to ensure cross-platform PowerShell and editor fidelity.
- **NFR-05: Zero Security Leaks:** Gitleaks audit must pass with 0 secrets detected.

---

## 📖 4. INVEST-Compliant User Stories

- **US-01:** *As a developer running the SQLite Data Hub daemon*, I want to see a live visual status pill with an animated LED dot in `#cardHardwareBridges`, so that I immediately know if my local database telemetry is active.
- **US-02:** *As a user troubleshooting HUD connectivity*, I want the reconnect button to show interactive loading states and play subtle haptic audio chimes, so that I have immediate multi-sensory confirmation of connection events.
- **US-03:** *As a bilingual user switching between English and Hindi*, I want all hardware bridge titles, descriptions, port pills, and status badges to translate completely and accurately, so that my experience is cohesive.

---

## ✅ 5. Given-When-Then Acceptance Criteria Contracts

- **Scenario 1: SQLite Data Hub Offline State**
  - *Given* the SQLite Data Hub daemon on port 65433 is stopped,
  - *When* the user navigates to `#paneSettings`,
  - *Then* `#bridgeHubStatusBadge` renders with class `.status-pill.offline`, `#bridgeHubStatusDot` renders with red glow, `#bridgeHubStatusText` displays "Offline", and `#btnSidebarReconnectHub` displays "⚡ Reconnect Hub".
- **Scenario 2: SQLite Data Hub Reconnect Trigger**
  - *Given* the user clicks `#btnSidebarReconnectHub`,
  - *When* the reconnection sequence begins,
  - *Then* `#bridgeHubStatusBadge` immediately switches to `.status-pill.connecting`, `#bridgeHubStatusDot` pulses amber, `#bridgeHubStatusText` displays "Connecting...", `#btnSidebarReconnectHub` displays "⏳ Connecting...", and tactile haptic click chime plays.
- **Scenario 3: Video Detector HUD Connection Achieved**
  - *Given* the Video Detector HUD WebSocket bridge on port 65432 successfully connects,
  - *When* `updateHUDStatus(true)` is invoked,
  - *Then* `#bridgeHudStatusBadge` renders with class `.status-pill.online`, `#bridgeHudStatusDot` glows emerald green, `#bridgeHudStatusText` displays "Connected", and `#btnSidebarReconnect` displays "✅ Connected".
