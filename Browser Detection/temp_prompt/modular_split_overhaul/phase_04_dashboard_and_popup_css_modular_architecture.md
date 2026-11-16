# Phase 04: Dashboard & Popup CSS Modular Architecture

> **Document Type:** Dedicated Phase Instruction Set  
> **Workspace Container:** [`temp_prompt/modular_split_overhaul/phase_04_dashboard_and_popup_css_modular_architecture.md`](phase_04_dashboard_and_popup_css_modular_architecture.md)  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Department:** Dept 04 (UI/UX Design System) & Dept 05 (Frontend Engineering)  
> **Target Agent Role:** Level 4 UI/UX Design System Specialist  
> **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)  
> **Status:** READY FOR EXECUTION (LOCKED UNDER DECISION GATE BARRIER)  

---

## 🎯 1. Phase Objective

Deconstruct the two oversized stylesheets in the extension:
- **`dashboard/dashboard.css`** (**3,891 lines, 96 KB**)
- **`popup/popup.css`** (**3,738 lines, 94 KB**)

into clean, categorized modular stylesheets organized by layout, components, widgets, and themes. Establish master stylesheets that maintain 100% backward compatibility with test assertions inspecting raw stylesheet text (e.g. `.audio-eq-widget {`, `.audio-eq-widget.liquid-glass-card {`, WCAG focus rings, and high-contrast rules).

---

## 📋 2. Prerequisites & Inputs

- **Prerequisites:** Phase 01 through Phase 03 completed cleanly; all prior verification tests green.
- **Target Files:**
  - `dashboard/dashboard.css` (3,891 lines) — [dashboard.css](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css#L1-L3891)
  - `popup/popup.css` (3,738 lines) — [popup.css](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css#L1-L3738)
  - Target modular directories: `dashboard/styles/` and `popup/styles/`

---

## 🔍 3. Technical Context & File Anchors

1. **In `dashboard/dashboard.css`:**
   - Lines 1-350: `:root` tokens, liquid glass cards, and reset.
   - Lines 351-1100: Sidebar navigation, header, and main layout grid.
   - Lines 1101-1800: Tracking pane cards, time-series chart styles, and tables.
   - Lines 1801-2550: Media hero card, mini player dock, chapter markers, and timeline scrubber.
   - Lines 2551-3150: Audio Lab Bento Deck (`.audio-eq-widget`, `.liquid-glass-card`, vertical sliders `#eqBand60`, decibel badges).
   - Lines 3151-3600: Omni Command Palette modal (`.omni-modal-overlay`, `.omni-palette-card`, kbd badges) and hotkeys cheat sheet.
   - Lines 3601-3891: Theme overrides (`.theme-light`, `.theme-high-contrast`, focus indicators).

2. **In `popup/popup.css`:**
   - Lines 1-450: Compact extension popup reset, box-sizing, and typography.
   - Lines 451-950: Header brand, status badges (`#todayHeaderTimeBadge`, `#hubStatusBadge`, `#wsStatusBadge`).
   - Lines 951-1650: 6-tab horizontal navigation bar and tab pane visibility.
   - Lines 1651-2400: Quick settings, toggle switches, and smart automation rows.
   - Lines 2401-3100: Media player tab, equalizer card, and digital wellness dials.
   - Lines 3101-3738: Toast banner, light mode, and high-contrast accessibility rules.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

1. **Step 1: Modularize Dashboard Styles (`dashboard/styles/`)**
   - Create `dashboard/styles/tokens.css`: Color variables, typography scales, glassmorphism blur and shadow tokens.
   - Create `dashboard/styles/layout.css`: Sidebar layout, brand logo, grid container, and responsive breakpoints.
   - Create `dashboard/styles/tracking.css`: Daily tracking stat cards, donut chart SVG rules, and domain table.
   - Create `dashboard/styles/media.css`: Media hero player, mini dock, and precision timeline scrubber styling.
   - Create `dashboard/styles/audio_lab.css`: Dedicated `.audio-eq-widget`, specular highlight, and 5 vertical frequency sliders.
   - Create `dashboard/styles/palette.css`: Omni Command Palette modal card, input, and fuzzy result list.
   - Create `dashboard/styles/hotkeys.css`: Cheat sheet modal card and grid.
   - Create `dashboard/styles/themes.css`: Theme overrides (`body.theme-light`, `body.theme-high-contrast`).

2. **Step 2: Modularize Popup Styles (`popup/styles/`)**
   - Create `popup/styles/base.css`: Root popup dimensions (380x600px), reset, and typography.
   - Create `popup/styles/header.css`: Brand header and status badges.
   - Create `popup/styles/tabs.css`: 6-tab bar layout, tab active indicator, and pane transitions.
   - Create `popup/styles/quick_settings.css`: Switch toggles, select dropdowns, and automation rows.
   - Create `popup/styles/audio_lab.css`: Compact equalizer card, boost slider, and preset select.
   - Create `popup/styles/wellness.css`: Digital wellness dials and sleep timer controls.
   - Create `popup/styles/themes.css`: High-contrast borders, focus rings, and light mode styles.

3. **Step 3: Establish Backward-Compatible Master Stylesheets**
   - Update `dashboard/dashboard.css` and `popup/popup.css` as master aggregators.
   - **Crucial Rule:** Tests like `test_dashboard_full_audio_lab_parity.js` use `fs.readFileSync(dashCssPath, 'utf8')` and assert string inclusions (e.g. `css.includes('.audio-eq-widget {')`). The master stylesheet must either inline or concatenate the modular component sheets so that all string inclusion assertions pass without a build step!
   - Ensure UTF-8 BOM encoding (`0xEF, 0xBB, 0xBF`) on all stylesheets.

---

## 🚫 5. Architectural Constraints & Boundaries

- **Viewport Boundary:** `popup.css` must strictly preserve 380px maximum popup width. Zero horizontal overflow allowed.
- **String Test Invariant:** `dashboard.css` MUST satisfy all raw CSS string inclusion tests in `tests/test_dashboard_full_audio_lab_parity.js` and `test_dashboard_theme_and_a11y_verification.js`.
- **WCAG Standard:** Maintain minimum 4.5:1 text contrast and visible `:focus-visible` rings on all interactive elements.

---

## 📦 6. Deliverables Manifest

- `dashboard/styles/tokens.css`
- `dashboard/styles/layout.css`
- `dashboard/styles/tracking.css`
- `dashboard/styles/media.css`
- `dashboard/styles/audio_lab.css`
- `dashboard/styles/palette.css`
- `dashboard/styles/hotkeys.css`
- `dashboard/styles/themes.css`
- `dashboard/dashboard.css` (Master Aggregated Stylesheet)
- `popup/styles/base.css`
- `popup/styles/header.css`
- `popup/styles/tabs.css`
- `popup/styles/quick_settings.css`
- `popup/styles/audio_lab.css`
- `popup/styles/wellness.css`
- `popup/styles/themes.css`
- `popup/popup.css` (Master Aggregated Stylesheet)

---

## 🧪 7. Local Verification Gate

Execute and pass all tests cleanly with exit code 0:
```powershell
node tests/test_dashboard_theme_and_a11y_verification.js
node tests/test_light_mode_contrast_and_wcag.js
node tests/test_dashboard_full_audio_lab_parity.js
node tests/test_six_tab_popup_architecture.js
node tests/test_theme_toggle.js
node tests/test_header_status_badges.js
```
