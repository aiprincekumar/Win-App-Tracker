# Light Mode Contrast & Visibility Overhaul Phase 2: Master Index & Live Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/light_mode_contrast_phase2/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `dashboard/styles/wellbeing_light.css`, `dashboard/styles/media.css`, `dashboard/styles/media/hero_player.css`, `dashboard/styles/focus_sleep_advanced.css`, `tests/`  
> **Lead Departments:** Dept 01 (Product Requirements), Dept 04 (UI/UX Design System), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Target Autonomy Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Scope & Target UI Components
This initiative executes a surgical, high-contrast accessibility overhaul across **6 key UI components** in the Web Activity & Media Sentinel dashboard:

1. **EXTEND TIME Buttons (+5m, +15m):**
   - **Focus Extenders:** `#btnFocusExtend5`, `#btnFocusExtend15` (`.dash-focus-extender-btn`). In `wellbeing_blacklist.css`, these buttons inherit dark slate backgrounds (`rgba(30, 41, 59, 0.7)`) and light text (`#f1f5f9`), appearing as jarring dark patches on light cards.
   - **Sleep Extenders:** `#btnExtendSleep5`, `#btnExtendSleep15` (`.dash-sleep-extender-btn`). Refined to ensure full visual consistency and WCAG AAA compliance.
2. **Completion Chime Row & Focus Toggle Cards:**
   - **Chime Selector Row:** `.focus-chime-selector-row`, `.chime-label`, `#selectFocusChimeTone`, `.styled-select.chime-select`, `#btnPreviewChime`, `.btn-chime-preview`.
   - **Focus Advanced Toggle Cards:** `.dash-advanced-toggles-grid`, `.control-toggle-item`, `.toggle-title`, `.toggle-desc`, `.switch-toggle`, `.slider-round`, `.extended-toggles-divider`. In dark mode, `.toggle-title` is `#f1f5f9`, which washes out completely against light card bodies.
3. **Pomodoro Reset Button:**
   - `#btnResetPomodoro` (`.btn-focus-secondary`), along with `#btnPausePomodoro`. Currently styled with `background: rgba(30, 41, 59, 0.7)` and `border: 1px solid rgba(255, 255, 255, 0.14)` in `wellbeing_blacklist.css`, creating low contrast and visual clash.
4. **Focus Mode Selector Bar & Streak/Session Progress Bar:**
   - **Mode Selector:** `.focus-mode-tabs-row`, `.focus-mode-tab` (Focus, Short Break, Long Break). In dark mode, the container uses `rgba(15, 23, 42, 0.5)` with dim muted text `#94a3b8`.
   - **Cycle & Streak:** `.focus-cycle-progress-row`, `.focus-cycle-dots`, `.cycle-dot`, `.focus-cycle-text`, `.focus-streak-and-target`, `.focus-streak-badge`, `.focus-target-progress-bar`, `.target-progress-fill`, `.target-goal-text`. The streak badge uses light orange `#fb923c` on light background (< 3.2:1 contrast), and the progress bar track is translucent white.
5. **Sleep Sentinel Hub Card:**
   - `#cardSleepSentinelHub`, `.sleep-hero-card`, status badge `#dashSleepStatusBadge` (`.dash-sleep-badge.idle`, `.dash-sleep-badge.active`), SVG dial track `.dash-sleep-dial-track`, countdown display `.dash-sleep-time`, target finish `.dash-sleep-finish`, and section labels `.dash-sleep-section-label`.
6. **Media Controls / Action Bar:**
   - `.media-deck-header-actions` action buttons (`#btnMuteAllOthers`, `#btnMuteAll`), active stream count badge `#badgeActiveStreamsCount`, and Hero player remote media controls (`.btn-ctrl-hero`, `.btn-ctrl-hero-stepper`, `.hero-speed-stepper`, `#heroSpeedDisplay`).

### 1.2 Universal Rule 28 Modularity Invariant
- `wellbeing_blacklist.css` (1,640 lines) is strictly preserved **100% UNTOUCHED**.
- `focus_sleep_advanced.css` (654 lines) is close to the 700-line hard limit; all new focus and light mode rules must be placed in the modular companion stylesheet `dashboard/styles/wellbeing_light.css` (currently only 77 lines).
- Dark Mode Zero-Mutation Invariant: No dark mode styles (`body.theme-dark`, `[data-theme="dark"]`) may be modified.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Focus Hub Contrast & Controls | `dashboard/styles/wellbeing_light.css` | Level 4 Frontend Engineer | `node tests/test_advanced_features_focus_sleep.js` | ⏳ PENDING |
| **02** | Sleep Hub & Media Action Bar Contrast | `dashboard/styles/wellbeing_light.css`<br>`dashboard/styles/media.css`<br>`dashboard/styles/media/hero_player.css` | Level 4 Frontend Engineer | `node tests/test_bidirectional_mute_toggle_phase3.js` | ⏳ PENDING |
| **03** | QA Verification & Standalone Test Suite | `tests/test_light_mode_contrast_phase2.js`<br>`run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_light_mode_contrast_phase2.js`<br>`node run_all_tests.js` | ⏳ PENDING |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/styles/wellbeing_light.css` | `.dash-focus-extender-btn` inherits dark slate background `rgba(30, 41, 59, 0.7)` and light text `#f1f5f9` from `wellbeing_blacklist.css` | Add scoped `body.theme-light .dash-focus-extender-btn` with `#ffffff` bg, `#cbd5e1` border, `#1e293b` text (13.35:1 contrast) | Crisp, readable extend time buttons matching sleep extenders | Phase 1 | `node tests/test_light_mode_contrast_phase2.js` |
| **2** | `dashboard/styles/wellbeing_light.css` | `.control-toggle-item` in focus section has `rgba(255, 255, 255, 0.03)` bg and `.toggle-title` is `#f1f5f9` (invisible in light mode) | Add light theme rules for `.control-toggle-item` (`#ffffff` bg, `#e2e8f0` border), `.toggle-title` (`#0f172a`), `.toggle-desc` (`#64748b`), `.slider-round` (`#cbd5e1`) | 100% visible focus toggle cards with WCAG AAA typography | Phase 1 | `node tests/test_light_mode_contrast_phase2.js` |
| **3** | `dashboard/styles/wellbeing_light.css` | `.focus-chime-selector-row`, `.styled-select.chime-select`, and `.btn-chime-preview` lack light mode styling | Add light theme rules: `.chime-label` (`#1e293b`), select dropdown (`#ffffff` bg, `#0f172a` text, `#cbd5e1` border), and preview button | High-contrast chime selection row | Phase 1 | `node tests/test_light_mode_contrast_phase2.js` |
| **4** | `dashboard/styles/wellbeing_light.css` | `.btn-focus-secondary` (`#btnResetPomodoro`) uses dark slate `rgba(30, 41, 59, 0.7)` and light border | Add `body.theme-light .btn-focus-secondary` with `#ffffff` bg, `#cbd5e1` border, `#334155` text (7.33:1 contrast) | Accessible reset button matching secondary button design system | Phase 1 | `node tests/test_light_mode_contrast_phase2.js` |
| **5** | `dashboard/styles/wellbeing_light.css` | `.focus-mode-tabs-row` uses `rgba(15, 23, 42, 0.5)` with dim `#94a3b8` tab text | Add `body.theme-light .focus-mode-tabs-row` (`#f1f5f9` bg, `#e2e8f0` border), `.focus-mode-tab` (`#475569`), active tab (`#ffffff` bg, `#047857` text, `#10b981` border) | Vibrant, accessible segmented mode switcher | Phase 1 | `node tests/test_light_mode_contrast_phase2.js` |
| **6** | `dashboard/styles/wellbeing_light.css` | `.focus-cycle-progress-row` has dark bg `rgba(15, 23, 42, 0.4)`, `#fb923c` streak text (< 3.2:1 contrast), and invisible progress bar track | Add light theme rules: row bg `#f8fafc`, streak badge (`#c2410c` text on `rgba(249, 115, 22, 0.12)` - 7.15:1 contrast), progress bar track `#e2e8f0` | Fully visible streak and session progress indicators | Phase 1 | `node tests/test_light_mode_contrast_phase2.js` |
| **7** | `dashboard/styles/wellbeing_light.css` | `#cardSleepSentinelHub` dial track `.dash-sleep-dial-track`, countdown display, and idle badge need light theme contrast | Add light theme rules: `.dash-sleep-dial-track` (`stroke: #e2e8f0`), `.dash-sleep-time` (`#0f172a`), `.dash-sleep-badge.idle` (`#f1f5f9` bg, `#475569` text) | High-contrast Sleep Sentinel hub card | Phase 2 | `node tests/test_light_mode_contrast_phase2.js` |
| **8** | `dashboard/styles/wellbeing_light.css` / `media.css` | `.media-deck-header-actions .btn.btn-secondary` (`#btnMuteAllOthers`, `#btnMuteAll`), `#badgeActiveStreamsCount`, and hero stepper buttons need light mode refinement | Add light mode styling for media deck action buttons (`#ffffff` bg, `#cbd5e1` border, `#1e293b` text, active state vibrant) and `#badgeActiveStreamsCount` | Crisp, high-contrast media action toolbar | Phase 2 | `node tests/test_light_mode_contrast_phase2.js` |
| **9** | `tests/test_light_mode_contrast_phase2.js` | No automated test coverage for the 6 new light mode components | Create dedicated 8-battery standalone test suite validating CSS rules, contrast ratios, and dark mode invariant | Complete regression guard with 0 false positives | Phase 3 | `node tests/test_light_mode_contrast_phase2.js` |
