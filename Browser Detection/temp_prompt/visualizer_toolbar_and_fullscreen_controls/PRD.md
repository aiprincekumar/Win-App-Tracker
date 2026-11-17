<!-- 0xEF, 0xBB, 0xBF UTF-8 BOM Encoded -->
# Product Requirements Document (PRD)
# Task: Visualizer Toolbar Flex Alignment & Dual-Mode Full Window / Full Screen Controls
# Task ID: TASK-VIZ-TOOLBAR-ALIGN-FULLSCREEN-001

> **Lead Department:** Dept 01 Product Requirements & UI/UX Governance
> **Status:** APPROVED FOR IMPLEMENTATION

---

## 🎯 1. User Personas & Problem Context
- **Power Media User:** Listens to music or streaming audio while monitoring real-time frequency response in the dashboard. Needs to quickly switch between a compact card, an in-window theater layout, and a full-monitor presentation.
- **Audio Engineer / Tester:** Uses spectrum visualization to monitor frequency peaks and dynamic range. Requires clear, responsive toolbar controls without cramped elements or visual clutter.

---

## 📋 2. Functional Requirements (FR)

### FR-01: Toolbar Flex Alignment (`justify-between`)
- **FR-01.1:** The visualizer toolbar `.visualizer-controls-bar` must span 100% of the visualizer card's usable width (`width: 100%`).
- **FR-01.2:** The container must use flexbox alignment (`display: flex; justify-content: space-between; align-items: center;`).
- **FR-01.3:** The Effect Selector (`.viz-select-wrapper`) must align flush to the left of the toolbar.
- **FR-01.4:** The Action Buttons (`#btnVizVideoEmbedToggle`, `#btnVizFullWindow`, `#btnVizFullscreen`) must be grouped inside a container (`.viz-actions-group`) aligned flush to the right of the toolbar.

### FR-02: Full Window (Theater) Mode
- **FR-02.1:** Clicking `#btnVizFullWindow` must toggle the visualizer container into in-window theater mode (`.visualizer-theater-mode` on `#heroAudioLabStatus`).
- **FR-02.2:** Full Window mode must NOT invoke browser native fullscreen (`requestFullscreen()`). The browser chrome, address bar, and OS taskbar must remain visible.
- **FR-02.3:** The button tooltip and `aria-label` must update to reflect state:
  - Inactive: `title="Toggle Visualizer Full Window (Theater)"`, `aria-expanded="false"`, `aria-label="Toggle Visualizer Full Window (Theater)"`.
  - Active: `title="Exit Visualizer Full Window (Theater)"`, `aria-expanded="true"`, `aria-label="Exit Visualizer Full Window (Theater)"`.

### FR-03: Full Screen Mode (Native W3C Fullscreen API)
- **FR-03.1:** Clicking `#btnVizFullscreen` must invoke the browser's native `Element.requestFullscreen()` API on the visualizer container/card (`#heroAudioLabStatus` or parent visualizer container).
- **FR-03.2:** If the document is already in fullscreen mode (`document.fullscreenElement`), clicking `#btnVizFullscreen` must invoke `document.exitFullscreen()`.
- **FR-03.3:** The system must listen to `fullscreenchange` events on `document` to ensure button state (`aria-expanded`, `.active`, icon swap) automatically updates even if the user exits via the `Escape` key.
- **FR-03.4:** If native fullscreen is rejected or unsupported (e.g. strict iframe permissions), the system must gracefully fall back to Full Window (Theater) mode.

---

## 🛡️ 3. Non-Functional Requirements (NFR)
- **NFR-01 (Accessibility):** Fully keyboard navigable via `Tab` and `Enter`/`Space`. WCAG 2.1 AA compliant color contrast in both dark and light themes.
- **NFR-02 (Performance):** Zero jank or layout shift (CLS < 0.01). Instant CSS transitions (< 180ms) for button hover and state toggles.
- **NFR-03 (Security):** 100% W3C Trusted Types compliant. Zero `innerHTML` usage.
- **NFR-04 (Backward Compatibility):** Existing classes and IDs must remain intact to avoid breaking legacy styles or existing test batteries.
