# Hairline Ghost-Style Scrollbar Refinement: Product Requirements Document (PRD)

> **Document Type:** Product Requirements Document  
> **Workspace Container:** `temp_prompt/hairline_ghost_scrollbar_refinement/`  
> **Lead Department:** Dept 01 (Product Requirements) & Dept 04 (UI/UX Design System)  

---

## 👤 1. User Personas & Problem Scenarios

### Persona 1: Power User / Night Owl
- **Context:** Operates in a darkened room, monitoring bedtime timers or focus sessions within the browser popup.
- **Pain Point:** Intrusive 4px scrollbars or stark white/opaque bars break immersion and clutter the tight 380px extension window.
- **Goal:** Wants an ultra-clean, ambient cyber-dark interface where scrollbars appear only as an ethereal, ultra-thin hairline guide when needed and blend seamlessly into the background when reading.

### Persona 2: Design-Conscious Developer
- **Context:** Interacts with settings drawers, audio lab presets, and domain lists.
- **Pain Point:** Discrepancies between general popup scrollbars and tab-specific drawers feel inconsistent and unpolished.
- **Goal:** Consistent 2px hairline ghost styling with smooth hover transitions across every scrollable container.

---

## 📋 2. Functional Requirements (FR)

| Req ID | Priority | Description | Acceptance Contract |
| :--- | :---: | :--- | :--- |
| **FR-01** | P0 | **2px Hairline Scrollbar Geometry** | All `::-webkit-scrollbar` width and height declarations across popup views, panes, and drawers must be set to `2px`. |
| **FR-02** | P0 | **Subtle Ghost Alpha Opacity** | Idle dark mode scrollbar thumbs must use low whisper opacity (`rgba(255, 255, 255, 0.12)` general; `rgba(129, 140, 248, 0.28)` sleep; `rgba(6, 182, 212, 0.28)` focus). |
| **FR-03** | P0 | **Interactive Hover Bloom** | Hover states on scrollbar thumbs must brighten gently without becoming jarring (general: `0.28`; sleep: `0.65`; focus: `0.65`). |
| **FR-04** | P1 | **Light Mode Theme Parity** | Under `[data-theme="light"]`, scrollbars must maintain 2px hairline width with subtle low-opacity dark thumbs (`rgba(0, 0, 0, 0.12)` general; `rgba(99, 102, 241, 0.25)` sleep; `rgba(15, 118, 110, 0.22)` focus). |
| **FR-05** | P0 | **Transparent Floating Track** | Scrollbar tracks must remain 100% `background: transparent;` to prevent opaque gutters. |
| **FR-06** | P0 | **Test Suite Synchronization** | `tests/test_popup_drawer_docking_and_scrollbar_fix.js` assertions must be updated to validate 2px geometry and ghost colors with 100% pass rate. |

---

## ⚡ 3. Non-Functional Requirements (NFR)

| Req ID | Target Metric | Description |
| :--- | :--- | :--- |
| **NFR-01** | 60 FPS | Zero jank or layout recalculation overhead during scrolling. |
| **NFR-02** | 0px CLS | Zero Cumulative Layout Shift; scrollbar changes must not shift container widths or padding. |
| **NFR-03** | 100% Safe | W3C Trusted Types zero-innerHTML preservation. |
| **NFR-04** | UTF-8 BOM | Every edited CSS and test file must retain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`). |
| **NFR-05** | Zero Leaks | 0 findings on `gitleaks detect --redact`. |

---

## 🎯 4. Given-When-Then Acceptance Criteria Contracts

### Contract 1: General Popup Views (popup/popup.css)
- **Given** the popup is opened in dark theme,
- **When** viewing scrollable containers (`body`, `.tab-pane`, `.drawer-inner-content`, `.drawer-expandable-wrap`, `.domains-list`, `.studio-items-list`),
- **Then** the scrollbar width and height must evaluate to `2px`,
- **And** the track must be transparent,
- **And** the thumb must render with `rgba(255, 255, 255, 0.12)` border radius 999px, blooming to `rgba(255, 255, 255, 0.28)` on hover.

### Contract 2: Sleep Tab Scrollbar Refinement (popup/styles/tabs/tab_sleep.css)
- **Given** the user switches to Tab 7 (Sleep View Pane) or expands `#sleepSettingsDrawer`,
- **When** content overflows the bounded drawer container,
- **Then** the scrollbar must render with `2px` width and `2px` height,
- **And** the thumb must use subtle indigo ghost color `rgba(129, 140, 248, 0.28)`, blooming to `rgba(129, 140, 248, 0.65)` on hover,
- **And** W3C `scrollbar-color: rgba(129, 140, 248, 0.28) transparent;` must be defined.

### Contract 3: Focus Tab Scrollbar Refinement (popup/styles/tabs/tab_wellness.css)
- **Given** the user switches to Tab 6 (Focus View Pane) or expands `#focusSettingsDrawer`,
- **When** content overflows the bounded drawer container,
- **Then** the scrollbar must render with `2px` width and `2px` height,
- **And** the thumb must use subtle cyan ghost color `rgba(6, 182, 212, 0.28)`, blooming to `rgba(6, 182, 212, 0.65)` on hover,
- **And** W3C `scrollbar-color: rgba(6, 182, 212, 0.28) transparent;` must be defined.

### Contract 4: Regression Test Verification (tests/)
- **Given** test runner executes `tests/test_popup_drawer_docking_and_scrollbar_fix.js`,
- **When** Battery 3 validates custom scrollbar rules,
- **Then** it must assert `width: 2px;` and `height: 2px;` across all targets,
- **And** all 5 batteries must pass with exit code 0.
