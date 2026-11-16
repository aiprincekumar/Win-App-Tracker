# Phase 05: CSS Facade & Stylesheet Deconstruction

> **Task ID:** TASK-MODULAR-SPLIT-006-P05  
> **Specialist Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Agent Role:** Level 4 UI/UX Design System Specialist (`design_system_specialist`)  
> **Target Files:** [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css), [`popup/popup.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css), [`dashboard/styles/**`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles), [`popup/styles/**`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/styles), [`scripts/build_css_modules.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/scripts/build_css_modules.js)  
> **Prerequisites:** Phase 01 through Phase 04 completed and verified  
> **Status:** READY FOR LEVEL 4 SUBAGENT DISPATCH  

---

## 🎯 1. Phase Objective
Establish a clean, scalable CSS authoring architecture that allows developers to add new design tokens, component styles, and themes directly into modular files (`dashboard/styles/` and `popup/styles/`) while ensuring deterministic assembly into master stylesheets (`dashboard/dashboard.css` and `popup/popup.css`) via `scripts/build_css_modules.js`. Verify 100% preservation of all visual selectors, responsive rules, light/dark themes, and WCAG 2.1 AA accessibility contrast ratios.

---

## 📂 2. Target File Map & Line Anchors

- **Dashboard Modular Stylesheets:**
  - `dashboard/styles/tokens.css` (Liquid glass & specular depth tokens)
  - `dashboard/styles/layout.css` (Grid layout, sidebar, bento wrapper)
  - `dashboard/styles/tracking.css` (Domain activity tables & pills)
  - `dashboard/styles/media.css` (Active media cards & video controls)
  - `dashboard/styles/audio_lab.css` (Equalizer widgets & canvas visualizer)
  - `dashboard/styles/palette.css` (Omni command palette modal)
  - `dashboard/styles/hotkeys.css` (Keyboard shortcuts cheatsheet)
  - `dashboard/styles/themes.css` (Dark, light & high-contrast themes)
- **Popup Modular Stylesheets:**
  - `popup/styles/base.css` (380x600px geometry, reset, base typography)
  - `popup/styles/header.css` (Status badges, connection indicators)
  - `popup/styles/tabs.css` (6-tab layout & view panel switching)
  - `popup/styles/quick_settings.css` (Toggle switches, pause toolbar)
  - `popup/styles/audio_lab.css` (Popup audio lab & mini sliders)
  - `popup/styles/wellness.css` (Digital wellness timers & cards)
  - `popup/styles/themes.css` (Popup light mode & high-contrast overrides)
- **Build & Aggregation Script:**
  - `scripts/build_css_modules.js` (Deterministic module assembly with UTF-8 BOM)

---

## 🛠️ 3. Surgical Step-by-Step Instructions

1. **Verify Modular Stylesheets:**
   Inspect all files in `dashboard/styles/` and `popup/styles/` to confirm complete separation of concerns and presence of all required classes.
2. **Synchronize Build Script (`scripts/build_css_modules.js`):**
   - Verify that running `node scripts/build_css_modules.js` reconstructs `dashboard/dashboard.css` and `popup/popup.css` deterministically.
   - Ensure the build script uses UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all outputs.
   - Provide clean extension hooks in `dashboard/styles/tokens.css` and `popup/styles/themes.css` for future styling additions requested by the user.
3. **Validate Selector Integrity & Test Parity:**
   Ensure all critical selectors required by test suites exist in the assembled master files:
   - `.audio-eq-widget`
   - `.audio-eq-widget.liquid-glass-card`
   - `#heroAudioEqCard`
   - `body.theme-light .audio-eq-widget`
   - `.btn-time-pause` (34x32px compact button)
4. **Enforce WCAG 2.1 AA Contrast:**
   Verify that light mode and dark mode color palettes maintain minimum 4.5:1 text contrast.

---

## 🚫 4. Architectural Constraints & Out-of-Scope Boundaries

- **DO NOT** change the dimensions of the popup window (`width: 380px; height: 600px`).
- **DO NOT** remove or alter CSS classes queried by JavaScript DOM operations or test suites.

---

## 🧪 5. Local Verification Gate

Run the following test suites to verify Phase 05 completion:
```bash
node scripts/build_css_modules.js
node tests/test_dashboard_theme_and_a11y_verification.js
node tests/test_light_mode_contrast_and_wcag.js
node tests/test_theme_toggle.js
node tests/test_four_pillar_hub_ui.js
```
**Gate Requirement:** Build script must exit with 0, and all visual styling test suites must pass 100% clean.
