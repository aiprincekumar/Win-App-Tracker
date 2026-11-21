# Light Mode Visibility & Contrast Fix: Master Index & Live Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/light_mode_visibility_contrast_fix/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `dashboard/styles/themes.css`, `dashboard/styles/tracking.css`, `dashboard/styles/media.css`, `dashboard/styles/media/hero_player.css`, `dashboard/styles/media/visualizer_deck.css`, `dashboard/styles/focus_sleep_advanced.css`, `dashboard/styles/wellbeing_blacklist.css`, `dashboard/styles/layout.css`, `dashboard/dashboard.css`, `tests/`  
> **Lead Departments:** Dept 01 (Product Requirements), Dept 04 (UI/UX Design System), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Target Autonomy Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Current Architectural Defects & Contrast Failures in Light Mode
When the user switches to Light Mode (`body.theme-light` or `[data-theme="light"]`), 10 core interface components suffer from severe contrast degradation, invisible text, or hardcoded dark background artifacts:

1. **Table Headers (Domain Breakdown & Media Playback History):**
   - Tables (`#domainAnalyticsTable`, `#mediaHistoryTable`) utilize `.modern-data-table th`, which has a hardcoded dark background `background: rgba(15, 23, 42, 0.9)` and muted gray text. In Light Mode, `themes.css` only targeted `.data-table th`, leaving `.modern-data-table th` showing dark headers amidst a light card stage.
2. **Audio Visualizer Controls & Action Buttons:**
   - Visualizer action icons (`.btn-viz-action-icon`, `.viz-btn-segmented`, `.btn-viz-drawer-close`) use hardcoded dark slate backgrounds `rgba(30, 41, 59, 0.7)` and translucent white borders `rgba(255, 255, 255, 0.1)`. In Light Mode, they appear as heavy dark blotches with dim icons.
3. **Media Playback Controls & Volume Toolbar:**
   - Hero playback buttons (`.btn-ctrl-hero`, `.btn-ctrl-hero-stepper`) use `rgba(255, 255, 255, 0.05)` backgrounds and turn pure `#ffffff` on hover, rendering them completely invisible against light card backgrounds. Volume track and scrubber tooltips lack calibrated light tokens.
4. **Focus Sentinel & Sleep Sentinel Presets/Buttons:**
   - Sleep presets (`.dash-sleep-preset-btn`) hardcode `color: #cbd5e1`, which is virtually unreadable against white surfaces (< 1.6:1 contrast). Focus presets (`.dash-focus-preset-btn`) have hardcoded dark backgrounds `rgba(15, 23, 42, 0.6)` and `color: #f1f5f9`.
5. **Ambient Soundscapes & Sound Card Containers:**
   - The soundscape container (`.focus-soundscape-panel`, `.sleep-soundscape-panel`) has hardcoded dark slate `rgba(15, 23, 42, 0.5)` background and low-contrast title text, clashing with the light card body.
6. **Power-Nap Card & Duration Controls:**
   - The banner (`.sleep-power-nap-banner`) hardcodes light gray text (`.power-nap-title { color: #e2e8f0; }`, `.power-nap-desc { color: #94a3b8; }`) on a translucent gradient that washes out completely in Light Mode (< 2:1 contrast).
7. **Sleep Cutoff Sentinel Toggle Cards:**
   - Toggle rows (`.dash-sleep-toggle-row`) hardcode dark backgrounds `rgba(15, 23, 42, 0.45)`, dark dropdowns `rgba(15, 23, 42, 0.85)` with light text `#e2e8f0`, and dark sliders.
8. **Blacklist Pattern Empty State:**
   - The empty container (`.blacklist-chips-grid:empty::before`) is nested inside a dark slate box `rgba(15, 23, 42, 0.45)` with white border `rgba(255, 255, 255, 0.08)`, and chips use dark red backgrounds that fail light readability.
9. **Danger Zone Action Cards:**
   - `.settings-card.danger-card` has hardcoded dark gradient `linear-gradient(135deg, rgba(30, 20, 25, 0.7), rgba(15, 23, 42, 0.8))`, `.warning-text` is light red `#fca5a5` (failing WCAG AA against light surfaces), and `.danger-action-item` has hardcoded dark backgrounds `rgba(15, 23, 42, 0.6)`.
10. **Data Export Cards (Time Tracking CSV, Media History CSV, Executive HTML Digest):**
    - Export tiles (`.export-tile`) hardcode dark slate `rgba(15, 23, 42, 0.6)`, and `.btn-export-tile` has `rgba(255, 255, 255, 0.05)` with hover turning `#fff`, causing total wash-out in Light Mode.

### 1.2 The Architectural Solution & Phased Scope
All 10 defects are resolved using scoped Light Mode selectors (`body.theme-light`, `[data-theme="light"]`) without altering, mutating, or regressing a single line of Dark Mode styling (`body.theme-dark`, `[data-theme="dark"]`).

- **Phase 1: Dashboard Navigation, Tables & Media Deck** (Bugs 1, 2, 3)
- **Phase 2: Hubs — Sleep, Focus, Wellbeing & Audio Lab** (Bugs 4, 5, 6, 7)
- **Phase 3: Settings, Blacklist, Danger Zone & Data Export** (Bugs 8, 9, 10)
- **Phase 4: Independent QA Verification & Regression Testing** (Verification Gate)

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Dashboard Navigation, Tables & Media Deck | `dashboard/styles/themes.css`<br>`dashboard/styles/tracking.css`<br>`dashboard/styles/media.css`<br>`dashboard/styles/media/hero_player.css`<br>`dashboard/styles/media/visualizer_deck.css` | Level 4 Frontend Engineer | `node tests/test_dashboard_theme_and_a11y_verification.js` | ⏳ PENDING |
| **02** | Hubs — Sleep, Focus, Wellbeing & Audio Lab | `dashboard/styles/themes.css`<br>`dashboard/styles/focus_sleep_advanced.css`<br>`dashboard/styles/wellbeing_blacklist.css`<br>`dashboard/dashboard.css` | Level 4 Frontend Engineer | `node tests/test_advanced_features_focus_sleep.js` | ⏳ PENDING |
| **03** | Settings, Blacklist, Danger Zone & Data Export | `dashboard/styles/themes.css`<br>`dashboard/styles/layout.css`<br>`dashboard/styles/wellbeing_blacklist.css`<br>`dashboard/dashboard.css` | Level 4 Frontend Engineer | `node tests/test_dashboard_uiux_phase1.js` | ⏳ PENDING |
| **04** | Independent QA Verification & Master Regression | `tests/test_light_mode_contrast_and_visibility.js`<br>`run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_light_mode_contrast_and_visibility.js`<br>`node run_all_tests.js` | ⏳ PENDING |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/styles/themes.css`<br>`dashboard/styles/tracking.css` | `.modern-data-table th` has hardcoded dark `rgba(15, 23, 42, 0.9)` background; `themes.css` only targeted `.data-table th`. | Add scoped `body.theme-light .modern-data-table th` with `#f1f5f9` background, `#1e293b` text (11.8:1 contrast), and `#cbd5e1` border. | Crisp, legible table headers across Domain Analytics and Media Playback History. | Phase 1 | Node CSS inspection & test suite |
| **2** | `dashboard/styles/media/visualizer_deck.css`<br>`dashboard/styles/themes.css` | `.btn-viz-action-icon`, `.viz-btn-segmented` use hardcoded dark slate backgrounds `rgba(30, 41, 59, 0.7)` and lack Light Mode rules. | Add `body.theme-light .btn-viz-action-icon` with `background: rgba(0, 0, 0, 0.05)`, border `rgba(0, 0, 0, 0.12)`, text `#334155`. | High-contrast visualizer control buttons cleanly visible on light stage. | Phase 1 | Node CSS inspection |
| **3** | `dashboard/styles/media/hero_player.css`<br>`dashboard/styles/media.css` | `.btn-ctrl-hero` has white hover text (`#fff`) and translucent white backgrounds washing out in Light Mode. | Add `body.theme-light .btn-ctrl-hero` with `#ffffff` background, `#cbd5e1` border, `#0f172a` text, and `#047857` primary text. | Media playback controls, steppers, and volume slider fully readable. | Phase 1 | Node CSS inspection |
| **4** | `dashboard/styles/wellbeing_blacklist.css`<br>`dashboard/dashboard.css` | `.dash-sleep-preset-btn` hardcodes `#cbd5e1` text (< 1.6:1 contrast); `.dash-focus-preset-btn` has dark `rgba(15, 23, 42, 0.6)` background. | Add `body.theme-light .dash-sleep-preset-btn` and `.dash-focus-preset-btn` with `#ffffff` / `#f8fafc` background, `#1e293b` text, and distinct active states. | Preset buttons across Focus and Sleep Hubs have > 7:1 WCAG AAA contrast. | Phase 2 | Node CSS inspection |
| **5** | `dashboard/styles/focus_sleep_advanced.css` | `.sleep-soundscape-panel`, `.focus-soundscape-panel` hardcode dark background `rgba(15, 23, 42, 0.5)`. | Add `body.theme-light .sleep-soundscape-panel`, `.focus-soundscape-panel` with `#f8fafc` glass background, `#cbd5e1` border, and `#0f172a` text. | Soundscape cards blend smoothly with light theme cards. | Phase 2 | Node CSS inspection |
| **6** | `dashboard/styles/focus_sleep_advanced.css` | `.sleep-power-nap-banner` has hardcoded light text `#e2e8f0` and `#94a3b8` on faint background. | Add `body.theme-light .sleep-power-nap-banner` with `#1e1b4b` title, `#475569` desc, and `#6366f1` button. | High-contrast, vibrant power-nap banner exceeding 7:1 contrast. | Phase 2 | Node CSS inspection |
| **7** | `dashboard/styles/focus_sleep_advanced.css` | `.dash-sleep-toggle-row` has hardcoded dark `rgba(15, 23, 42, 0.45)` background and dark select elements. | Add `body.theme-light .dash-sleep-toggle-row` with `#ffffff` background, `#e2e8f0` border, `#0f172a` title, and light select dropdowns. | Sleep Cutoff Sentinel toggle cards clear and readable. | Phase 2 | Node CSS inspection |
| **8** | `dashboard/styles/wellbeing_blacklist.css` | `.blacklist-chips-grid` has hardcoded dark background `rgba(15, 23, 42, 0.45)`; empty state text lacks contrast. | Add `body.theme-light .blacklist-chips-grid` with `#f8fafc` background, `#cbd5e1` border, `#64748b` empty text, and light red chips. | Blacklist pattern container and empty state crisp and legible. | Phase 3 | Node CSS inspection |
| **9** | `dashboard/styles/layout.css` | `.settings-card.danger-card` has dark gradient, `.warning-text` is `#fca5a5`, `.danger-action-item` is dark slate. | Add `body.theme-light .settings-card.danger-card` with light rose surface, `#991b1b` warning text (8.5:1 contrast), and `#ffffff` action items. | Danger Zone clearly communicates warning without unreadable washed-out text. | Phase 3 | Node CSS inspection |
| **10** | `dashboard/styles/layout.css` | `.export-tile` has dark background `rgba(15, 23, 42, 0.6)`; `.btn-export-tile` washes out on hover. | Add `body.theme-light .export-tile` with `#ffffff` background, `#e2e8f0` border, `#0f172a` title, and light button tokens. | Data Export tiles (Time Tracking, Media History, HTML Digest) crisp and tactile. | Phase 3 | Node CSS inspection |
| **11** | `tests/test_light_mode_contrast_and_visibility.js` | Verification suite for Light Mode contrast and zero dark-mode regression does not yet exist. | Construct comprehensive standalone test suite validating all 10 component groups across `body.theme-light` and `[data-theme="light"]`. | 100% verified contrast ratios (WCAG AAA >= 7:1) and zero Dark Mode regressions. | Phase 4 | Standalone Node test execution |
| **12** | `run_all_tests.js` | Full repository integration gate covering 105+ test suites. | Run master test runner to guarantee zero regressions across entire extension. | 105/105 test suites pass clean (Exit Code 0). | Phase 4 | `node run_all_tests.js` |
