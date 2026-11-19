# Product Requirements Document (PRD): Popup Collapsible Settings Drawers

> **Document Type:** Product Requirements Document  
> **Workspace Container:** `temp_prompt/popup_collapsible_settings_drawer/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Lead Department:** Dept 01: Product Requirements  

---

## 👤 1. Target User Personas & Problem Scenarios

1. **The Quick-Action Worker (Primary):**
   Opens the extension popup to quickly start or extend a 25m Focus Block or 30m Sleep Timer. They need to see the large circular radial dial, active time remaining, and quick action buttons instantly without having to scroll down past secondary configurations.
2. **The Deep Configuration User (Secondary):**
   Occasionally adjusts bedtime sleep automations (fade-out duration, end of video auto-pause, inactivity timeout action) or focus presets. They want these settings easily accessible via a single tap on an elegant, collapsible drawer.
3. **The Multi-Screen / Laptop User:**
   Operates on smaller laptop screens (e.g., 1366x768 or 1080p with 125% OS scaling) where browser extension popups can easily overflow the visible viewport if total height exceeds 600px.

---

## 📋 2. Functional Requirements (FR)

- **FR-1: Zero-Scroll Primary Viewport:**
  The default view of both `#viewSleepPane` and `#viewFocusPane` MUST fit entirely within a maximum popup container height of 560px without triggering any vertical scrollbar.
- **FR-2: Collapsible Sleep Settings Drawer:**
  The Sleep Tab secondary controls (`#cardSleepPresetsAndCustom` and `#cardSleepAutomations`) must be enclosed within a collapsible drawer toggled via an accessible header button (`#btnToggleSleepSettingsDrawer`).
- **FR-3: Collapsible Focus Settings Drawer:**
  The Focus Tab secondary controls (`#cardFocusPresetsAndCustom`, `#focusRatioBarContainer`, and `#doomscrollBreakerCard`) must be enclosed within a collapsible drawer toggled via an accessible header button (`#btnToggleFocusSettingsDrawer`).
- **FR-4: Smooth Hardware-Accelerated Toggle:**
  Drawer expansion and collapse must animate fluidly with a modern 280ms cubic-bezier transition, rotating the chevron indicator 180 degrees.
- **FR-5: User Preference Persistence:**
  The open/closed state of each drawer must be persisted to `chrome.storage.local` under keys `sleepSettingsDrawerOpen` and `focusSettingsDrawerOpen`. When re-opening the popup, the previous state is respected.
- **FR-6: Strict DOM Element ID Preservation:**
  All existing DOM IDs, data attributes, input fields, and button triggers MUST remain intact in the DOM hierarchy to maintain 100% compatibility with background scripts, popup handlers, and existing automated test suites.
- **FR-7: Bilingual Localization (i18n):**
  Drawer headers and accessibility titles must support English and Hindi with exact key parity in `locales/en.json` and `locales/hi.json`.

---

## 🛡️ 3. Non-Functional Requirements (NFR)

- **NFR-1: Performance & 60fps Animation:** CSS Grid transitions must execute with zero dropped frames and zero Cumulative Layout Shift (CLS = 0.00) outside the drawer container.
- **NFR-2: W3C Trusted Types Compliance:** All DOM updates in JavaScript must strictly use `textContent`, `setAttribute`, or class operations; zero `innerHTML` usage.
- **NFR-3: Accessibility (WCAG 2.1 AA):** Drawer toggle buttons must have valid `aria-expanded` ("true" / "false"), `aria-controls` referencing the drawer content ID, and support keyboard operation (Enter / Space).
- **NFR-4: Code Modularity (Rule 28):** All new or refactored functions in `popup/popup.js` must remain <= 50 lines with nesting depth <= 3.
- **NFR-5: Regression Immunity:** 100% of the existing 102 test suites in `node run_all_tests.js` must pass without regressions.

---

## 📝 4. Acceptance Criteria (Given-When-Then Contracts)

### Contract 1: Zero-Scroll Default Render
- **Given** the extension popup is opened on the Sleep Tab (`#viewSleepPane`),
- **When** the tab is loaded with default settings,
- **Then** `#cardSleepHeroRing` is completely visible, the settings drawer is collapsed, and no vertical scrollbar appears on `#viewSleepPane`.

### Contract 2: Interactive Drawer Expansion
- **Given** the settings drawer on the Sleep Tab is in its collapsed state (`aria-expanded="false"`),
- **When** the user clicks `#btnToggleSleepSettingsDrawer`,
- **Then** `aria-expanded` toggles to `"true"`, the chevron indicator rotates, and the drawer body smoothly expands to reveal `#cardSleepPresetsAndCustom` and `#cardSleepAutomations`.

### Contract 3: Local Storage State Persistence
- **Given** the user expands the Focus Tab settings drawer,
- **When** the popup is closed and subsequently re-opened,
- **Then** the Focus Tab settings drawer initializes in the expanded state with `aria-expanded="true"`.

### Contract 4: Existing Button & Input Interactivity
- **Given** the Sleep Tab settings drawer is expanded,
- **When** the user clicks preset pill `30m` (`[data-minutes="30"]`),
- **Then** the active duration is updated to 30 minutes, dial progress resets, and event handlers execute identically to the pre-refactor state.
