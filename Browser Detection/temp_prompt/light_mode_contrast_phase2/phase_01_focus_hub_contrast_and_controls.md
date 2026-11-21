# Phase 1 Execution Instruction: Focus Hub Contrast & Controls

> **Phase ID:** PHASE-LIGHT-CONTRAST-001  
> **Target Subsystem:** Focus Sentinel & Advanced Suite UI Tokens  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Target File:** `dashboard/styles/wellbeing_light.css`  
> **Reference Specs:** [`INDEX.md`](INDEX.md), [`TRD.md`](TRD.md), [`DESIGN.md`](DESIGN.md)  
> **Authorization Mandate:** Requires active `AUTH-MGR-*` token from Level 2 Manager prior to file mutation.

---

## 🎯 1. Phase Objective
Implement scoped Light Mode overrides in the modular companion stylesheet `dashboard/styles/wellbeing_light.css` to fix contrast degradation across:
1. **Focus Extend Time Buttons:** `#btnFocusExtend5`, `#btnFocusExtend15` (`.dash-focus-extender-btn`).
2. **Pomodoro Reset Button:** `#btnResetPomodoro` (`.btn-focus-secondary`) and `#btnPausePomodoro`.
3. **Focus Mode Selector Tabs:** `.focus-mode-tabs-row`, `.focus-mode-tab` (Focus, Short Break, Long Break active & hover states).
4. **Focus Cycle & Streak Bar:** `.focus-cycle-progress-row`, `.focus-cycle-text`, `.focus-streak-badge`, `.focus-target-progress-bar`, `.target-goal-text`.
5. **Completion Chime Row & Focus Toggle Cards:** `.focus-chime-selector-row`, `.chime-label`, `.styled-select.chime-select`, `.btn-chime-preview`, `.dash-advanced-toggles-grid .control-toggle-item`, `.toggle-title`, `.toggle-desc`, `.slider-round`.

---

## 📐 2. Concrete Modification Steps

### Step 1: Open Target File
Open [`dashboard/styles/wellbeing_light.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/wellbeing_light.css).
Notice that `wellbeing_light.css` currently ends around line 77.
Confirm `wellbeing_blacklist.css` is NOT touched (Rule 28 frozen invariant).

### Step 2: Append Scoped CSS Rules for Focus Extend & Reset Buttons
Append the following high-contrast rules to `dashboard/styles/wellbeing_light.css`:
```css
/* Focus Extender Buttons (+5m, +15m) */
body.theme-light .dash-focus-extender-btn,
[data-theme="light"] .dash-focus-extender-btn {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #1e293b !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
}

body.theme-light .dash-focus-extender-btn:hover,
[data-theme="light"] .dash-focus-extender-btn:hover {
  background: #f1f5f9 !important;
  border-color: #10b981 !important;
  color: #0f172a !important;
}

/* Focus Secondary Action Buttons (Reset, Pause) */
body.theme-light .btn-focus-secondary,
[data-theme="light"] .btn-focus-secondary {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #334155 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
}

body.theme-light .btn-focus-secondary:hover,
[data-theme="light"] .btn-focus-secondary:hover {
  background: #f1f5f9 !important;
  border-color: #94a3b8 !important;
  color: #0f172a !important;
}
```

### Step 3: Append Focus Mode Selector & Streak/Cycle Rules
```css
/* Focus Mode Selector Bar */
body.theme-light .focus-mode-tabs-row,
[data-theme="light"] .focus-mode-tabs-row {
  background: #f1f5f9 !important;
  border: 1px solid #e2e8f0 !important;
}

body.theme-light .focus-mode-tab,
[data-theme="light"] .focus-mode-tab {
  color: #475569 !important;
}

body.theme-light .focus-mode-tab:hover,
[data-theme="light"] .focus-mode-tab:hover {
  color: #0f172a !important;
  background: #e2e8f0 !important;
}

body.theme-light .focus-mode-tab.active,
[data-theme="light"] .focus-mode-tab.active {
  background: #ffffff !important;
  border-color: #10b981 !important;
  color: #047857 !important;
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.2) !important;
}

body.theme-light .focus-mode-tab[data-mode="shortBreak"].active,
body.theme-light .focus-mode-tab[data-mode="longBreak"].active,
[data-theme="light"] .focus-mode-tab[data-mode="shortBreak"].active,
[data-theme="light"] .focus-mode-tab[data-mode="longBreak"].active {
  background: #ffffff !important;
  border-color: #0284c7 !important;
  color: #0369a1 !important;
  box-shadow: 0 1px 3px rgba(14, 165, 233, 0.2) !important;
}

/* 4-Stage Pomodoro Cycle & Streak Progress */
body.theme-light .focus-cycle-progress-row,
[data-theme="light"] .focus-cycle-progress-row {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

body.theme-light .focus-cycle-text,
body.theme-light .target-goal-text,
[data-theme="light"] .focus-cycle-text,
[data-theme="light"] .target-goal-text {
  color: #475569 !important;
}

body.theme-light .focus-streak-badge,
[data-theme="light"] .focus-streak-badge {
  background: rgba(249, 115, 22, 0.12) !important;
  border: 1px solid rgba(249, 115, 22, 0.35) !important;
  color: #c2410c !important;
}

body.theme-light .focus-target-progress-bar,
[data-theme="light"] .focus-target-progress-bar {
  background: #e2e8f0 !important;
}
```

### Step 4: Append Completion Chime & Focus Toggle Cards
```css
/* Completion Chime Selector Row */
body.theme-light .focus-chime-selector-row,
[data-theme="light"] .focus-chime-selector-row {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
}

body.theme-light .chime-label,
[data-theme="light"] .chime-label {
  color: #1e293b !important;
  font-weight: 600 !important;
}

body.theme-light .styled-select.chime-select,
[data-theme="light"] .styled-select.chime-select {
  background-color: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #0f172a !important;
}

body.theme-light .btn-chime-preview,
[data-theme="light"] .btn-chime-preview {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #334155 !important;
}

body.theme-light .btn-chime-preview:hover,
[data-theme="light"] .btn-chime-preview:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
}

/* Focus Advanced Toggle Cards */
body.theme-light .dash-advanced-toggles-grid .control-toggle-item,
[data-theme="light"] .dash-advanced-toggles-grid .control-toggle-item {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

body.theme-light .dash-advanced-toggles-grid .control-toggle-item .toggle-title,
[data-theme="light"] .dash-advanced-toggles-grid .control-toggle-item .toggle-title {
  color: #0f172a !important;
}

body.theme-light .dash-advanced-toggles-grid .control-toggle-item .toggle-desc,
[data-theme="light"] .dash-advanced-toggles-grid .control-toggle-item .toggle-desc {
  color: #64748b !important;
}

body.theme-light .dash-advanced-toggles-grid .control-toggle-item .slider-round,
[data-theme="light"] .dash-advanced-toggles-grid .control-toggle-item .slider-round {
  background-color: #cbd5e1 !important;
  border: 1px solid #94a3b8 !important;
}
```

---

## 🔒 3. Verification Gate
- Verify UTF-8 with BOM on `dashboard/styles/wellbeing_light.css`.
- Ensure line count of `wellbeing_light.css` remains well under 250 lines (< 500 target per Rule 28).
- Verify existing tests continue to pass: `node tests/test_advanced_features_focus_sleep.js`.
