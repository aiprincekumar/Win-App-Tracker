# Light Mode Status Pill Badge ("IDLE", "ACTIVE", etc.) Contrast & Visibility Overhaul: Master Index & Live Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/light_mode_idle_badge_overhaul/`  
> **Task ID:** `TASK-LIGHT-MODE-IDLE-BADGE-001`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `dashboard/styles/wellbeing_light.css`, `dashboard/styles/media.css`, `popup/styles/themes.css`, `popup/styles/tabs/tab_sleep.css`, `popup/styles/tabs/tab_wellness.css`, `tests/`  
> **Lead Departments:** Dept 01 (Product Requirements), Dept 04 (UI/UX Design System), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Target Autonomy Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Scope & Target UI Components
This initiative executes a surgical, high-contrast accessibility and visibility overhaul across **all status pill badges** ("IDLE", "ACTIVE", etc.) in both the Web Activity & Media Sentinel Dashboard and Popup.

#### Identified Defects in Light Mode (`body.theme-light` / `[data-theme="light"]`):
1. **Audio Visualizer Status Pill & Live Dot:**
   - Elements: `#vizHeaderStatusPill` (`.viz-header-status-pill`), `.viz-live-dot`, `#vizHeaderStatusText` (`.viz-live-text`), and `#vizHudFpsBadge` / `#vizHudRateBadge` (`.viz-hud-badge`).
   - Defect: Inherits dark translucent background `rgba(15, 23, 42, 0.6)` and muddy grey dot `#64748b`. In Light Mode, this creates an ugly, dark, muddy patch with dim text and low contrast (< 2.8:1).
   - Solution: Clean light surface (`#f8fafc` or `rgba(241, 245, 249, 0.85)`), crisp subtle border (`#cbd5e1`), accessible high-contrast text (`#475569` for IDLE, `#065f46` for ACTIVE), and a crisp dot (`#64748b` for idle, vibrant emerald `#059669` for active with glow).
2. **Focus Sentinel Hub Status Badges:**
   - Elements: `#pomodoroModeBadge` (`.badge-focus`, `.badge-break`), `#pomodoroPillBadge` (`.badge-focus-micro`, `.badge-break-micro`), `#zenFocusStatus` (`.zen-status-badge`), and sidebar indicator `#wellbeingMicroStatusDot` (`.hud-dot.idle`).
   - Defect: `.badge-focus` in dark mode uses `rgba(16, 185, 129, 0.2)` with light green text `#34d399` which washes out completely against light backgrounds (< 2.4:1 contrast).
   - Solution: Scoped light theme rules: `.badge-focus` with `background: rgba(16, 185, 129, 0.12)`, `border: 1px solid rgba(16, 185, 129, 0.4)`, `color: #065f46` (WCAG AAA >= 7.2:1); `.badge-break` with `background: rgba(59, 130, 246, 0.12)`, `border: 1px solid rgba(59, 130, 246, 0.4)`, `color: #1e40af`; `.zen-status-badge` with `#f8fafc` surface and `#1e293b` text.
3. **Sleep Sentinel Hub Status Badges:**
   - Elements: `#dashSleepStatusBadge` (`.dash-sleep-badge.idle`, `.dash-sleep-badge.active`), `#dashSleepActiveDot`, and sidebar indicator `#sleepMicroStatusDot` (`.hud-dot.idle`).
   - Defect: Sidebar dots have dim dark box-shadows in light mode. Idle dots look washed out and muddy.
   - Solution: Refine sleep badge and dot contrast in `wellbeing_light.css` with clean `#f1f5f9` surface, `#cbd5e1` border, `#475569` text, and crisp dot.
4. **Media Player Hero & Deck Status Badges:**
   - Elements: `#playerStatusBadge` (`.status-pill.idle`, `.status-pill.playing`, `.status-pill.paused`) and `.deck-status-pill` (`.deck-status-pill.muted`, `.deck-status-pill.playing`, `.deck-status-pill.paused`).
   - Defect: In `media.css`, `.status-pill.idle` uses `background: rgba(255, 255, 255, 0.05)` and `color: var(--text-muted)` without light theme overrides, appearing washed out and virtually unreadable on light card bodies.
   - Solution: Scoped light mode rules for `.status-pill.idle` (`background: #f1f5f9`, `border: 1px solid #cbd5e1`, `color: #475569`), `.status-pill.playing` (`color: #065f46`), `.status-pill.paused` (`color: #92400e`), and `.deck-status-pill` variants.
5. **Popup Live Media Dynamic Status Button:**
   - Elements: `#dynamicStatusBtn` (`.dynamic-status-btn.idle`), `#dynamicStatusDot` (`.status-dot`), `#dynamicStatusText`.
   - Defect: While `.dynamic-status-btn.idle` has background `#f1f5f9` in `themes.css`, its internal `.status-dot` falls back to `background: #475569` without crisp definition, border, or light mode elevation.
   - Solution: Refine `.dynamic-status-btn.idle` and its `.status-dot` in `popup/styles/themes.css` with crisp `#64748b` dot, `#cbd5e1` border, and sharp typography.
6. **Popup Sleep & Focus Status Badges:**
   - Elements: `#sleepDialStatusBadge` (`.sleep-status-badge.idle`, `.running`, `.paused`, `.fading`, `.triggered`) and `#popupFocusBadge` (`.popup-focus-badge.idle`, `.running`, `.break`, `.paused`).
   - Defect: Completely MISSING light mode rules in `tab_sleep.css` and `tab_wellness.css`! In light mode, `.sleep-status-badge.idle` and `.popup-focus-badge.idle` inherit dark mode `rgba(148, 163, 184, 0.15)` and `#94a3b8` text, looking muddy, dim, and low-contrast (< 2.3:1).
   - Solution: Add comprehensive `[data-theme="light"]` overrides for `.sleep-status-badge` and `.popup-focus-badge` with clean light surfaces (`#f1f5f9`), crisp borders (`#cbd5e1`), accessible slate text (`#475569`), and vibrant active states (Indigo for Sleep, Emerald for Focus, Cyan for Break, Amber for Paused).

### 1.2 Universal Rule 28 & Architectural Invariants
- `wellbeing_blacklist.css` (1,640 lines) is strictly preserved **100% UNTOUCHED**.
- All new dashboard light mode rules for sleep and focus must be placed in the modular companion stylesheet `dashboard/styles/wellbeing_light.css` (currently 471 lines, well below the 700-line hard limit).
- All visualizer light mode rules placed in `dashboard/styles/media.css` or `dashboard/styles/wellbeing_light.css`.
- **Dark Mode Zero-Mutation Invariant:** Dark mode styles (`body.theme-dark`, `[data-theme="dark"]`, default styles) MUST remain 100% untouched.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Dashboard Status Pill Badges Contrast Overhaul | `dashboard/styles/wellbeing_light.css`<br>`dashboard/styles/media.css` | Level 4 Frontend Engineer | `node tests/test_light_mode_contrast_and_visibility.js` | ⏳ PENDING |
| **02** | Popup Status Pill Badges Contrast Overhaul | `popup/styles/themes.css`<br>`popup/styles/tabs/tab_sleep.css`<br>`popup/styles/tabs/tab_wellness.css` | Level 4 Frontend Engineer | `node tests/test_popup_focus_timer_sleep_parity.js` | ⏳ PENDING |
| **03** | QA Verification & Standalone Test Suite | `tests/test_light_mode_idle_status_badges.js`<br>`run_all_tests.js` | Level 4 QA Verification Tester | `node tests/test_light_mode_idle_status_badges.js`<br>`node run_all_tests.js` | ⏳ PENDING |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/styles/media.css` | `.viz-header-status-pill` lacks light mode rules; renders dark slate `rgba(15, 23, 42, 0.6)` with dim text and muddy dot | Add `body.theme-light .viz-header-status-pill` (`#f8fafc` bg, `#cbd5e1` border, `#475569` text) and `.viz-live-dot` (`#64748b`) | Crisp, bright, accessible Audio Visualizer header pill (WCAG AA >= 4.5:1) | Phase 1 | `node tests/test_light_mode_idle_status_badges.js` |
| **2** | `dashboard/styles/media.css` | `.status-pill.idle` and `.deck-status-pill` have no light mode overrides; text washed out on light card backgrounds | Add `body.theme-light .status-pill.idle` (`#f1f5f9` bg, `#cbd5e1` border, `#475569` text) and active states | High-contrast status pills across Hero player and Media Deck cards | Phase 1 | `node tests/test_light_mode_idle_status_badges.js` |
| **3** | `dashboard/styles/wellbeing_light.css` | `.badge-focus` and `.badge-break` in Focus Sentinel Hub use low-contrast text `#34d399` (< 2.4:1 contrast) | Add `body.theme-light .badge-focus` (`rgba(16, 185, 129, 0.12)` bg, `#065f46` text - 7.2:1 contrast) and `.badge-break` | High-contrast WCAG AAA focus mode status pills | Phase 1 | `node tests/test_light_mode_idle_status_badges.js` |
| **4** | `dashboard/styles/wellbeing_light.css` | `.badge-focus-micro`, `.badge-break-micro`, and `.zen-status-badge` lack dedicated light mode contrast | Add scoped light mode rules for micro-pills and Zen Work status badge | Clean, readable micro indicators in Focus Hub | Phase 1 | `node tests/test_light_mode_idle_status_badges.js` |
| **5** | `popup/styles/themes.css` | `.dynamic-status-btn.idle` dot lacks dedicated light mode definition; active playing/paused/buffering/muted dots need contrast verification | Enhance `[data-theme="light"] .dynamic-status-btn.idle .status-dot` with `#64748b` crisp surface and subtle shadow | Sharp, tactile Live Media dynamic status button in Popup | Phase 2 | `node tests/test_light_mode_idle_status_badges.js` |
| **6** | `popup/styles/tabs/tab_sleep.css` | `.sleep-status-badge` has 0 light mode rules; renders dark `rgba(148, 163, 184, 0.15)` with muddy `#94a3b8` text (< 2.3:1) | Add `[data-theme="light"] .sleep-status-badge.idle` (`#f1f5f9` bg, `#cbd5e1` border, `#475569` text) and active variants | Crisp, professional Sleep Tab dial status badge | Phase 2 | `node tests/test_light_mode_idle_status_badges.js` |
| **7** | `popup/styles/tabs/tab_wellness.css` | `.popup-focus-badge` has 0 light mode rules; renders dark slate with washed-out text | Add `[data-theme="light"] .popup-focus-badge.idle` (`#f1f5f9` bg, `#cbd5e1` border, `#475569` text) and active variants | Crisp, accessible Focus Tab status badge in Popup | Phase 2 | `node tests/test_light_mode_idle_status_badges.js` |
| **8** | `tests/test_light_mode_idle_status_badges.js` | No automated test suite validating status pill light mode contrast, color tokens, and dark mode invariant | Create standalone 8-battery verification test suite | 100% test gate certification with zero false positives | Phase 3 | `node tests/test_light_mode_idle_status_badges.js` |
