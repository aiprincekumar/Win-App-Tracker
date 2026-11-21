# Phase 3 Execution Instruction: Independent QA Verification & Standalone Test Suite

> **Phase ID:** PHASE-LIGHT-CONTRAST-003  
> **Target Subsystem:** QA Verification Suite & Master Test Runner  
> **Assigned Role:** Level 4 QA Verification Tester  
> **Target Files:** `tests/test_light_mode_contrast_phase2.js`, `run_all_tests.js`  
> **Reference Specs:** [`INDEX.md`](INDEX.md), [`TRD.md`](TRD.md), [`DESIGN.md`](DESIGN.md)  
> **Authorization Mandate:** Requires active `AUTH-MGR-*` token from Level 2 Manager prior to execution.

---

## 🎯 1. Phase Objective
Construct a comprehensive 8-battery standalone verification test suite (`tests/test_light_mode_contrast_phase2.js`) to validate all 6 light mode contrast enhancements with mathematical precision, enforce Universal Rule 28 file budgets, ensure the Dark Mode Zero-Mutation Invariant, and integrate seamlessly into the master regression test runner `run_all_tests.js`.

---

## 🧪 2. 8-Battery Test Specification

### Battery 1: Focus & Sleep Extend Time Buttons
- Verify `wellbeing_light.css` scopes `.dash-focus-extender-btn` under `body.theme-light` and `[data-theme="light"]`.
- Verify background is `#ffffff`, border is `#cbd5e1`, and text is `#1e293b`.
- Verify hover state transitions to `#f1f5f9` with border `#10b981`.

### Battery 2: Completion Chime Row & Focus Toggle Cards
- Verify `wellbeing_light.css` styles `.focus-chime-selector-row`, `.chime-label` (`#1e293b`), and `.styled-select.chime-select` (`#ffffff` bg, `#0f172a` text).
- Verify `.dash-advanced-toggles-grid .control-toggle-item` uses `#ffffff` surface and `#e2e8f0` border.
- Verify `.toggle-title` is `#0f172a` (high contrast) and `.toggle-desc` is `#64748b`.
- Verify `.slider-round` track uses visible `#cbd5e1` with `#94a3b8` border.

### Battery 3: Pomodoro Reset & Secondary Action Buttons
- Verify `wellbeing_light.css` styles `.btn-focus-secondary` in light mode with `#ffffff` bg, `#cbd5e1` border, and `#334155` text.
- Verify hover state transitions to `#f1f5f9` with `#0f172a` text.

### Battery 4: Focus Mode Selector Bar & Streak/Cycle Progress
- Verify `.focus-mode-tabs-row` uses `#f1f5f9` background and `#e2e8f0` border.
- Verify inactive tab `.focus-mode-tab` is `#475569`.
- Verify active focus tab `.focus-mode-tab.active` is `#047857` with `#10b981` border.
- Verify active break tab is `#0369a1` with `#0284c7` border.
- Verify `.focus-streak-badge` uses `#c2410c` on `rgba(249, 115, 22, 0.12)`.
- Verify `.focus-target-progress-bar` track is `#e2e8f0`.

### Battery 5: Sleep Sentinel Hub Card, Dial & Badges
- Verify `.dash-sleep-dial-track` has `stroke: #e2e8f0`.
- Verify `.dash-sleep-time` is `#0f172a`.
- Verify `.dash-sleep-badge.idle` is `#f1f5f9` bg with `#475569` text.

### Battery 6: Media Action Bar Buttons & Hero Stepper Controls
- Verify `.media-deck-header-actions .btn.btn-secondary` uses `#ffffff` bg, `#cbd5e1` border, and `#1e293b` text.
- Verify active toggle state has red outline/glow tokens (`#ef4444`, `#dc2626`).
- Verify `#badgeActiveStreamsCount` has `#475569` text.

### Battery 7: Mathematical Contrast Audit (WCAG AAA >= 7:1)
- Calculate relative luminance and exact contrast ratios for all 10 key text-to-background pairs.
- Assert all ratios meet or exceed their required thresholds (>= 7:1 for text, >= 4.5:1 for small badges/descriptions).

### Battery 8: Dark Mode Invariant & Rule 28 File Budget
- Verify `wellbeing_blacklist.css` is 100% UNTOUCHED.
- Verify `wellbeing_light.css` is under 300 lines (< 500 lines target).
- Verify dark mode root variables in `themes.css` are completely unchanged (`--bg-deep: #080b11;`, `--text-primary: #f8fafc;`).
- Verify 100% UTF-8 with BOM across all touched files.

---

## 🔒 3. Verification Gate Commands
1. Run standalone test suite:
   ```bash
   node tests/test_light_mode_contrast_phase2.js
   ```
2. Run master regression suite:
   ```bash
   node run_all_tests.js
   ```
3. Run secret scan:
   ```bash
   gitleaks detect --redact
   ```
- All suites must pass with Exit Code 0 and zero regressions.
