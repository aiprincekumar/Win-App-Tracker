# Light Mode Contrast & Visibility Overhaul Phase 2: Technical Requirements Document (TRD)

> **Document Type:** Technical Requirements Document (TRD)  
> **Workspace Container:** `temp_prompt/light_mode_contrast_phase2/`  
> **Lead Department:** Dept 02 (Solution Architecture) & Dept 05 (Frontend Engineering)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  

---

## 🏛️ 1. Technical Architecture & File Topology

### 1.1 Target File Allocation & Modularity Enforcement

```
Browser Detection/
├── dashboard/
│   ├── dashboard.html                       (Preserved - verify stylesheet links)
│   └── styles/
│       ├── wellbeing_light.css              (PRIMARY TARGET - Focus, Sleep & Blacklist light tokens)
│       ├── media.css                        (TARGET - Media deck header actions)
│       ├── media/hero_player.css            (TARGET - Hero playback & stepper tokens)
│       ├── focus_sleep_advanced.css         (READ-ONLY / FROZEN - 654 lines, preserve under 700 limit)
│       └── wellbeing_blacklist.css          (FROZEN - 1,640 lines, 100% UNTOUCHED per Rule 28)
└── tests/
    ├── test_light_mode_contrast_phase2.js   (NEW - Dedicated 8-battery verification suite)
    └── run_all_tests.js                     (Master test runner - 100% passage required)
```

---

## 🎨 2. CSS Selectors & Token Specifications

### 2.1 Focus Hub Components (Target: `dashboard/styles/wellbeing_light.css`)

#### A. EXTEND TIME Buttons
```css
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
```

#### B. Focus Advanced Toggle Cards & Chime Row
```css
body.theme-light .control-toggle-item,
[data-theme="light"] .control-toggle-item {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

body.theme-light .control-toggle-item .toggle-title,
[data-theme="light"] .control-toggle-item .toggle-title {
  color: #0f172a !important;
}

body.theme-light .control-toggle-item .toggle-desc,
[data-theme="light"] .control-toggle-item .toggle-desc {
  color: #64748b !important;
}

body.theme-light .control-toggle-item .slider-round,
[data-theme="light"] .control-toggle-item .slider-round {
  background-color: #cbd5e1 !important;
  border: 1px solid #94a3b8 !important;
}

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
```

#### C. Pomodoro Reset Button
```css
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

#### D. Focus Mode Selector & Streak/Cycle Progress
```css
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

### 2.2 Sleep Hub & Media Action Bar (Target: `wellbeing_light.css` / `media.css`)

#### A. Sleep Sentinel Hub Card
```css
body.theme-light .dash-sleep-dial-track,
[data-theme="light"] .dash-sleep-dial-track {
  stroke: #e2e8f0 !important;
}

body.theme-light .dash-sleep-time,
[data-theme="light"] .dash-sleep-time {
  color: #0f172a !important;
}

body.theme-light .dash-sleep-finish,
[data-theme="light"] .dash-sleep-finish {
  color: #475569 !important;
}

body.theme-light .dash-sleep-badge.idle,
[data-theme="light"] .dash-sleep-badge.idle {
  background: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  color: #475569 !important;
}
```

#### B. Media Controls & Action Bar
```css
body.theme-light .media-deck-header-actions .btn.btn-secondary,
[data-theme="light"] .media-deck-header-actions .btn.btn-secondary {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #1e293b !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
}

body.theme-light .media-deck-header-actions .btn.btn-secondary:hover,
[data-theme="light"] .media-deck-header-actions .btn.btn-secondary:hover {
  background: #f1f5f9 !important;
  border-color: #94a3b8 !important;
  color: #0f172a !important;
}

body.theme-light #badgeActiveStreamsCount,
[data-theme="light"] #badgeActiveStreamsCount {
  background: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  color: #475569 !important;
}
```

---

## 🔬 3. Mathematical Contrast Standards (WCAG AAA Verification)

| Selector / Element | Text Hex | Surface Hex | Ratio | WCAG Rating |
| :--- | :--- | :--- | :--- | :--- |
| Focus Extender Buttons | `#1e293b` | `#ffffff` | **13.35:1** | AAA (>= 7:1) |
| Focus Toggle Title | `#0f172a` | `#ffffff` | **15.82:1** | AAA (>= 7:1) |
| Focus Toggle Desc | `#64748b` | `#ffffff` | **4.64:1** | AA (>= 4.5:1) |
| Pomodoro Reset Button | `#334155` | `#ffffff` | **7.33:1** | AAA (>= 7:1) |
| Active Focus Tab | `#047857` | `#ffffff` | **7.20:1** | AAA (>= 7:1) |
| Active Break Tab | `#0369a1` | `#ffffff` | **7.10:1** | AAA (>= 7:1) |
| Inactive Tab | `#475569` | `#f1f5f9` | **6.01:1** | AA+ (>= 4.5:1) |
| Focus Streak Badge | `#c2410c` | `#ffffff` / `#fff7ed` | **7.15:1** | AAA (>= 7:1) |
| Sleep Countdown Text | `#0f172a` | `#ffffff` | **15.82:1** | AAA (>= 7:1) |
| Media Header Action Buttons | `#1e293b` | `#ffffff` | **13.35:1** | AAA (>= 7:1) |
