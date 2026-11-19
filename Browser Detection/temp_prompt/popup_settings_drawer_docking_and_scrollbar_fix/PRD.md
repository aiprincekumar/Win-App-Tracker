# Product Requirements Document (PRD): Popup Settings Drawers UI/UX Refinement

> **Document Type:** Product Requirements Document  
> **Workspace Container:** `temp_prompt/popup_settings_drawer_docking_and_scrollbar_fix/`  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Stakeholder:** Human Developer (Atul Verma)  

---

## 🎯 1. Problem Statement & User Personas

### 1.1 Problem Statement
In the browser extension popup, users frequently switch to the Sleep and Focus tabs to manage active timers and adjust settings. 
Currently:
1. When adjusting sleep settings (presets, automations), scrolling pushes the hero countdown dial out of view, breaking active status awareness.
2. In the Focus Tab on Windows machines, a wide, default system scrollbar appears, degrading the dark glassmorphic design and occluding content.

### 1.2 Target User Personas
- **The Power Multitasker:** Wants to quickly tweak countdown duration or automation toggles without losing sight of the active timer dial.
- **The Aesthetic-Minded Developer:** Demands pixel-perfect UI consistency with zero native OS scrollbar bleed, smooth animations, and compact visual balance.

---

## 📋 2. Functional Requirements (FR)

- **FR-1 (Docked Sleep Hero):** The Sleep Tab hero card (`#cardSleepHeroRing`) must remain permanently pinned/docked at the top of `#viewSleepPane`. It must never scroll off-screen when the settings drawer is opened or scrolled.
- **FR-2 (Bounded Sleep Drawer Scrolling):** The settings drawer (`#sleepSettingsDrawer`) must have its own internal vertical scroll container with a max-height limit (280px) and custom sleek scrollbars.
- **FR-3 (Focus Cyber-Dark Scrollbar):** The Focus Tab (`#viewFocusPane` and `#focusSettingsDrawer .drawer-inner-content`) must feature custom WebKit scrollbars: 4px width, cyber-cyan/slate thumb, rounded corners, transparent track, eliminating native Windows scrollbars.
- **FR-4 (Focus Compact Spacing):** Inner spacing, padding, and vertical gaps across cards in `#focusSettingsDrawer` must be compressed by 20–25% to maximize visible content without unnecessary scrolling.
- **FR-5 (Theme Parity):** Both dark and light themes must render accessible, elegant scrollbars matching their respective color palettes.

---

## ⚡ 3. Non-Functional Requirements (NFR)

- **NFR-1 (60fps Performance):** CSS Grid transitions (`grid-template-rows: 0fr -> 1fr`) must remain hardware-accelerated without layout shift (CLS < 0.05).
- **NFR-2 (Zero DOM Regressions):** All existing DOM IDs, data attributes, ARIA attributes, and classes must be preserved 100%.
- **NFR-3 (W3C Zero-innerHTML):** No dynamic HTML string injection; pure CSS/DOM attribute manipulation only.
- **NFR-4 (Universal Rule Compliance):** All files encoded in UTF-8 with BOM; all JS functions <= 50 lines per Rule 28.

---

## 📜 4. INVEST-Compliant User Stories & Acceptance Criteria

### User Story 1: Docked Sleep Hero Ring
*As a user configuring bedtime settings, I want the Sleep hero ring and action buttons to remain docked in view so that I can always see my countdown status while scrolling settings.*
- **Given** the Sleep Tab is active and the settings drawer is opened
- **When** the user scrolls through duration presets or sleep automations
- **Then** the `#cardSleepHeroRing` container remains anchored at the top
- **And** only the drawer inner content scrolls vertically.

### User Story 2: Sleek Cyber-Dark Focus Scrollbar
*As a Windows user viewing the Focus Tab, I want a sleek custom scrollbar matching the dark cyberpunk aesthetic instead of the bulky Windows native scrollbar.*
- **Given** the extension popup is opened on a Windows browser
- **When** the Focus Tab or its settings drawer requires vertical scrolling
- **Then** the scrollbar displays with a 4px width, rounded thumb, and cyber-cyan/slate styling
- **And** no native Windows gray scrollbar is visible.

### User Story 3: Compact Vertical Spacing
*As an extension user with limited popup viewport height, I want compact card spacing so that settings are comfortable to read without unnecessary dead space.*
- **Given** the Focus settings drawer is expanded
- **When** rendered inside the 380px popup container
- **Then** the padding and gap between cards is reduced to 6px
- **And** all controls fit cleanly within the bounded drawer area.
