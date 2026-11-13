# 6-Tab Single-Word Architecture UI/UX Refinement — PRD

> **Document Type:** Product Requirements Document (PRD)  
> **Task ID:** `TASK-POPUP-6TAB-UIUX-001`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Target Path:** `temp_prompt/six_tab_popup_architecture/PRD.md`  
> **Author & Lead Architect:** Atul Verma (`aiprincekumar` / `aiprincekumar010100@gmail.com`)  
> **Status:** APPROVED / READY FOR EXECUTION  

---

## 👥 1. User Personas & Problem Scenarios

### Persona 1: The Power Multitasker & Researcher
- **Context:** Constantly switches between video tutorials, documentation tabs, and productivity apps.
- **Pain Point:** Previously, to adjust smart automation settings (like Auto-Pause on new tab or Auto Ad Silencer), they had to scroll to the bottom of the active Player pane, pushing live player telemetry out of view.
- **Needs:** Direct, 1-click access to background automation tools in a separate `⚡ Tools` tab without interfering with media playback.

### Persona 2: The Digital Wellness & Quantified-Self Enthusiast
- **Context:** Monitors daily browsing time and enforces strict focus boundaries.
- **Pain Point:** In the 4-pillar UI, tracking analytics (donut chart, stats pills) and domain activity history were stacked vertically, requiring heavy scrolling to inspect individual domain records.
- **Needs:** A dedicated `⏱️ Tracking` tab for top-level focus metrics and a separate `🌐 Domains` tab for in-depth domain history searching, filtering, and review.

---

## 🎯 2. Functional Requirements (FR)

- **FR-01: 6-Tab Navigation Bar:** The popup header must render 6 navigation tabs with distinct emoji icons and single-word labels:
  - `🎬 Media` (`#mainTabMedia`)
  - `🎛️ Audio` (`#mainTabAudio`)
  - `⚡ Tools` (`#mainTabTools`)
  - `📚 Studio` (`#mainTabStudio`)
  - `⏱️ Tracking` (`#mainTabTracking`)
  - `🌐 Domains` (`#mainTabDomains`)
- **FR-02: 6 View Panes:** The popup main container must provide 6 corresponding tab panels (`role="tabpanel"`):
  - `#viewMediaPane` (Active by default, contains `#mediaSentinelCard` and `#playerMicroActionsRow`)
  - `#viewAudioPane` (Contains Master Volume Boost, 5-Band EQ `#audioEqCard`, Enhancements)
  - `#viewToolsPane` (Contains Smart Automations `#cardSmartAutomations`, Cinema Dimmer, Loop Media)
  - `#viewStudioPane` (Contains Notes `#studioNoteCard`, Bookmarks `#studioBookmarksCard`, Gallery `#studioScreenshotsCard`, Resume `#studioResumePlaybackCard`)
  - `#viewTrackingPane` (Contains Donut Chart `#donutChartContainer`, Stats Pills, Focus Ratio, Doomscroll Breaker `#doomscrollBreakerCard`)
  - `#viewDomainsPane` (Contains Domain Directory `.breakdown-section`, `#domainCategorySelect`, `#domainSearchInput`, `#domainsListContainer`)
- **FR-03: Reactive Tab Switching:** Clicking any of the 6 tabs activates that tab, deactivates all others, reveals the matching panel, and hides the non-active panels.
- **FR-04: Storage Persistence:** The active tab selection must be persisted to `chrome.storage.local` under the key `active_popup_tab`. Re-opening the popup must restore the previously active tab unless overridden by Quick Settings.
- **FR-05: Quick Settings Default Tab Alignment:** The `#selectDefaultTab` dropdown in `#quickSettingsPopover` must include all 6 tab options (`media`, `audio`, `tools`, `studio`, `tracking`, `domains`).
- **FR-06: Canonical DOM ID Preservation:** All 34 canonical DOM element IDs must be preserved in the DOM structure with zero missing elements.

---

## ⚡ 3. Non-Functional Requirements (NFR)

- **NFR-01: Fixed Viewport Geometry:** The popup must strictly maintain its 420px width (`width: 420px; max-width: 420px; min-width: 420px;`). No horizontal scrollbar or element overflow is permitted.
- **NFR-02: Zero Backend Mutations:** No modifications may be made to `background.js`, WebSocket connections, port handlers, or server scripts.
- **NFR-03: High Performance & Zero Jitter:** Tab transitions must execute within <16ms (60 FPS) with hardware-accelerated CSS opacity and transform transitions.
- **NFR-04: W3C Trusted Types & CSP Compliance:** Zero dynamic assignments to `innerHTML` that concatenate unescaped strings. All dynamic DOM rendering must use safe methods (`createElement`, `textContent`, `appendChild`).
- **NFR-05: Test Coverage:** 100% pass rate across all 14 automated test suites in `tests/`.

---

## 📦 4. INVEST-Compliant User Stories & MoSCoW Prioritization

### Must Have (P0)
- **US-01 (Single-Word Tab Navigation):** As a user, I want a clean 6-tab navigation bar with single-word labels so that the interface feels balanced and fits neatly in the popup header.
- **US-02 (Tools Tab Extraction):** As a user, I want Smart Automations moved to a dedicated `⚡ Tools` tab so that the `🎬 Media` player pane remains uncluttered and easy to use.
- **US-03 (Domains Tab Extraction):** As a user, I want the Domain Breakdown list moved to a dedicated `🌐 Domains` tab so that I can inspect browsing records without scrolling past charts.
- **US-04 (Zero Backend Invariant):** As a developer, I want all changes confined to popup HTML, CSS, and JS so that existing background daemons and WebSocket pipelines remain untouched.

### Should Have (P1)
- **US-05 (Distinct Active Tab Gradients):** As a user, I want each active tab to display a tailored accent gradient (e.g. amber for Tools, emerald for Domains) so that I immediately know which view is active.
- **US-06 (Quick Settings Integration):** As a user, I want the Quick Settings default tab dropdown to support all 6 tabs so that I can launch straight into my preferred view.

---

## 🧪 5. Rigorous Given-When-Then Acceptance Criteria Contracts

### Contract 1: Navigation Rendering
- **Given:** The user opens the extension popup.
- **When:** The DOM loads and `setupEventListeners()` executes.
- **Then:** Exactly 6 tab buttons (`#mainTabMedia`, `#mainTabAudio`, `#mainTabTools`, `#mainTabStudio`, `#mainTabTracking`, `#mainTabDomains`) must be visible with role `tab` inside `<nav class="top-nav-tabs">`.

### Contract 2: Tools Tab Activation
- **Given:** The user is on the `🎬 Media` tab.
- **When:** The user clicks `#mainTabTools`.
- **Then:** `#mainTabTools` gains class `active`, `#viewToolsPane` becomes visible, `#viewMediaPane` becomes hidden, and `chrome.storage.local.get('active_popup_tab')` returns `'tools'`.

### Contract 3: Domains Tab Activation & Filtering
- **Given:** The user clicks `#mainTabDomains`.
- **When:** The pane loads.
- **Then:** `#domainCategorySelect`, `#domainSearchInput`, and `#domainsListContainer` are displayed with full vertical clearance and zero layout shift.

### Contract 4: Backward Compatibility & Invariant IDs
- **Given:** All automated test suites are executed via `node tests/*.js`.
- **When:** Node compiles and tests DOM queries against `popup.html`.
- **Then:** All 34 canonical element IDs are found, and all 14 test suites pass with exit code 0.
