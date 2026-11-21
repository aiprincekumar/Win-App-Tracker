# Phase 03: QA Verification & Standalone Test Suite

> **Phase Number:** 03  
> **Workspace Container:** `temp_prompt/light_mode_idle_badge_overhaul/`  
> **Task ID:** `TASK-LIGHT-MODE-IDLE-BADGE-001`  
> **Target Subagent Role:** Level 4 QA Verification Tester  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Files:**  
> - `tests/test_light_mode_idle_status_badges.js` (new standalone test suite)  
> - `run_all_tests.js` (master regression runner)  

---

## 🎯 1. Phase Objective
Author and execute a comprehensive 8-battery automated verification test suite `tests/test_light_mode_idle_status_badges.js` to rigorously certify:
1. All target status pill badges across Dashboard and Popup possess valid Light Mode CSS rules.
2. Light Mode text colors achieve WCAG AA (>= 4.5:1) or WCAG AAA (>= 7.0:1) contrast ratios against their respective surfaces.
3. Status indicator dots possess crisp definition and appropriate active glowing box-shadows.
4. **Dark Mode Zero-Mutation Invariant:** 100% of baseline dark mode tokens and selectors remain untouched.
5. All touched CSS and test files adhere to UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
6. Master test suite `node run_all_tests.js` passes 100% clean with 0 regressions.

---

## 📦 2. Prerequisites & Environment State
- Phase 01 and Phase 02 completed.
- Working directory: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
- Node.js runtime available.

---

## 🧪 3. Detailed Battery Test Specifications

### Battery 1: Audio Visualizer Header Status Pill Light Mode Rules
- Assert `body.theme-light .viz-header-status-pill` or `[data-theme="light"] .viz-header-status-pill` exists in stylesheet.
- Assert background is `#f8fafc` or clean light surface.
- Assert border is `1px solid #cbd5e1` or subtle border.
- Assert color is `#475569` or high-contrast slate.
- Assert `.viz-live-dot` has `#64748b` background in light mode.
- Assert `.viz-live-dot.active` has vibrant green `#059669` with box-shadow.

### Battery 2: Focus Sentinel Hub Badges Light Mode Contrast
- Assert `.badge-focus` has text color `#065f46` (contrast ratio >= 7.2:1 against light surface).
- Assert `.badge-break` has text color `#1e40af` (contrast ratio >= 7.0:1).
- Assert `.badge-focus-micro` and `.badge-break-micro` have matching high-contrast text.
- Assert `.zen-status-badge` has clean light surface `#f8fafc` and `#1e293b` text.

### Battery 3: Sleep Sentinel Hub Badges Light Mode Rules
- Assert `.dash-sleep-badge.idle` has `#f1f5f9` background, `#cbd5e1` border, `#475569` text.
- Assert `.dash-sleep-badge.active` has indigo tint background and `#312e81` text.

### Battery 4: Hero Media Player & Deck Status Pills Light Mode Rules
- Assert `.status-pill.idle` has `#f1f5f9` background, `#cbd5e1` border, `#475569` text.
- Assert `.status-pill.playing` has emerald tint and `#065f46` text.
- Assert `.deck-status-pill` variants exist with high-contrast text.

### Battery 5: Popup Live Media Dynamic Status Button
- Assert `[data-theme="light"] .dynamic-status-btn.idle` has `#f1f5f9` background and `#475569` text.
- Assert `[data-theme="light"] .dynamic-status-btn.idle .status-dot` has `#64748b` background.
- Assert `[data-theme="light"] .dynamic-status-btn.playing .status-dot` has `#059669` and glow.

### Battery 6: Popup Sleep Tab Dial Status Badge
- Assert `[data-theme="light"] .sleep-status-badge.idle` has `#f1f5f9` background, `#cbd5e1` border, `#475569` text.
- Assert `[data-theme="light"] .sleep-status-badge.running` has indigo tint and `#3730a3` text.
- Assert `[data-theme="light"] .sleep-status-badge.paused` has amber tint and `#92400e` text.

### Battery 7: Popup Focus Tab Status Badge
- Assert `[data-theme="light"] .popup-focus-badge.idle` has `#f1f5f9` background, `#cbd5e1` border, `#475569` text.
- Assert `[data-theme="light"] .popup-focus-badge.running` has emerald tint and `#065f46` text.
- Assert `[data-theme="light"] .popup-focus-badge.break` has cyan tint and `#0e7490` text.

### Battery 8: Dark Mode Zero-Mutation Invariant & UTF-8 with BOM Audit
- Assert dark mode rules for `.viz-header-status-pill`, `.status-pill.idle`, `.badge-focus`, `.sleep-status-badge.idle`, and `.popup-focus-badge.idle` remain 100% intact.
- Audit all touched files (`wellbeing_light.css`, `media.css`, `themes.css`, `tab_sleep.css`, `tab_wellness.css`, test file) for UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🛠️ 4. Execution Commands & Exit Gates

```powershell
# 1. Run standalone verification suite
node tests/test_light_mode_idle_status_badges.js

# 2. Run master regression test suite
node run_all_tests.js
```

### Passing Acceptance Threshold
- `test_light_mode_idle_status_badges.js`: 8/8 batteries PASS (0 failures).
- `run_all_tests.js`: 100% test suites PASS (0 failures).
- Exit Code: 0.
