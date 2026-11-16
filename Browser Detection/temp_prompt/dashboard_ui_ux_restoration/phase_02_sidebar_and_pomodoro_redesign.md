# Phase 02: Sidebar De-Clutter & Pomodoro Re-Architecture
## Subsystem Execution Specification: Extract Pomodoro & Standardize Compact Sidebar

> **Phase:** 02 of 04  
> **Task ID:** `TASK-DASHBOARD-UIUX-RESTORE-PHASE-02`  
> **Target Subsystems:** Sidebar Navigation & Pomodoro Focus Sentinel  
> **Master Reference:** [`dashboard_ui_ux_restoration_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_ui_ux_restoration_prompt.md)  
> **Target Files (For Future Implementation):** `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/dashboard.js`  
> **Pre-Condition:** Phase 1 complete; application code locked during prompt stage.  
> **Authorization Token:** `AUTH-MGR-20261117-UIUX-RESTORE-002`  

---

## 🎯 1. Phase 2 Objectives

1. **De-Clutter Sidebar Navigation:** Completely remove the bulky `#widgetPomodoroSentinel` from `<aside class="sidebar">`. Restore the clean visual rhythm of the 3 primary navigation tabs and the 2 compact status cards.
2. **Re-Architect Pomodoro Sentinel in Top App Bar:** Position an ultra-compact interactive pill (`#pomodoroNavPill`) inside the Top App Bar (`.app-bar-right`). The pill displays a live icon (🧘), countdown timer (`25:00`), and mode badge (`Focus`).
3. **Interactive Glassmorphism Popover Modal:** Clicking `#pomodoroNavPill` toggles a floating glassmorphism card (`#pomodoroPopoverModal`) with circular/linear progress bar and full controls (Start, Pause, Reset, Mode toggle).
4. **Standardize Sidebar HUD Cards:** Enforce an ergonomic 64px fixed-height micro-card layout for SQLite Data Hub and Video Detector HUD cards to guarantee zero sidebar overflow on 768px height displays.

---

## 🛠️ 2. Detailed Implementation Instructions

### Step 2.1: Remove Bulky Widget from Sidebar in `dashboard/dashboard.html`
Locate lines 45-56 in `dashboard/dashboard.html`:
```html
<!-- REMOVE THIS ENTIRE BULKY BLOCK FROM SIDEBAR -->
<div id="widgetPomodoroSentinel" class="sidebar-hud-card pomodoro-card">
  ...
</div>
```
Delete it from `<aside class="sidebar">`.

### Step 2.2: Insert Pomodoro Pill in Top App Bar in `dashboard/dashboard.html`
In `.top-app-bar .app-bar-right`, before the Export Dropdown, insert:

```html
<!-- RESTORED: Compact Pomodoro Interactive Pill in Top Bar -->
<div class="pomodoro-pill-container">
  <button type="button" id="pomodoroNavPill" class="pomodoro-nav-pill" aria-haspopup="true" aria-expanded="false" title="Focus Sentinel & Pomodoro">
    <span class="pomodoro-pill-icon">🧘</span>
    <span id="pomodoroPillClock" class="pomodoro-pill-time">25:00</span>
    <span id="pomodoroPillBadge" class="badge-focus-micro">Focus</span>
  </button>

  <!-- Floating Glassmorphism Popover Modal -->
  <div id="pomodoroPopoverModal" class="pomodoro-popover-card liquid-glass-card hidden" role="dialog" aria-modal="false" aria-label="Pomodoro Controls">
    <div class="pomodoro-popover-header">
      <div class="pomodoro-popover-title-group">
        <span class="pomodoro-popover-title">🧘 Focus Sentinel</span>
        <span id="pomodoroModeBadge" class="badge-focus">Focus (25m)</span>
      </div>
      <button type="button" id="btnPomodoroPopoverClose" class="btn-icon-close" aria-label="Close">✕</button>
    </div>
    <div class="pomodoro-popover-body">
      <div id="pomodoroTimeDisplay" class="pomodoro-big-time">25:00</div>
      <div class="pomodoro-progress-track">
        <div id="pomodoroProgressBar" class="pomodoro-progress-fill" style="width: 100%;"></div>
      </div>
      <div class="pomodoro-popover-actions">
        <button type="button" id="btnStartPomodoro" class="btn-pomodoro primary">▶️ Start</button>
        <button type="button" id="btnPausePomodoro" class="btn-pomodoro">⏸️ Pause</button>
        <button type="button" id="btnResetPomodoro" class="btn-pomodoro">🔄 Reset</button>
      </div>
    </div>
  </div>
</div>
```

### Step 2.3: Update Styles in `dashboard/styles/layout.css`
```css
/* Top Bar Pomodoro Interactive Pill */
.pomodoro-pill-container {
  position: relative;
  display: inline-block;
}

.pomodoro-nav-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--glass-surface-bg);
  border: 1px solid var(--glass-border);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--text-primary);
}

.pomodoro-nav-pill:hover, .pomodoro-nav-pill:focus-visible {
  background: var(--glass-surface-hover);
  border-color: rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}

.pomodoro-pill-time {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 0.875rem;
}

.badge-focus-micro {
  font-size: 0.7rem;
  padding: 2px 6px;
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-emerald);
  border-radius: 9999px;
  font-weight: 600;
}

/* Floating Popover */
.pomodoro-popover-card {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 300px;
  padding: 1.25rem;
  background: var(--glass-surface-hover);
  backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--glass-card-hover-shadow);
  z-index: 1000;
}

.pomodoro-big-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2.25rem;
  font-weight: 800;
  text-align: center;
  color: var(--text-primary);
  margin: 0.75rem 0 0.5rem;
}

.pomodoro-progress-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.pomodoro-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-emerald), var(--accent-cyan));
  transition: width 300ms ease;
}

.pomodoro-popover-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}
```

### Step 2.4: Sync JS Timer Events
In `src/dashboard/features/wellbeing_blacklist_feature.js` or `dashboard.js`:
- Update `updatePomodoroUI()` to update both `#pomodoroTimeDisplay` and `#pomodoroPillClock`.
- Ensure `#btnStartPomodoro`, `#btnPausePomodoro`, `#btnResetPomodoro` remain fully bound.
- Wire click on `#pomodoroNavPill` to toggle `#pomodoroPopoverModal`.

---

## 🧪 3. Verification & Acceptance Criteria
- [ ] Sidebar navigation has zero vertical scrollbars on 768px height viewport.
- [ ] `#pomodoroNavPill` ticks every second in top bar.
- [ ] Clicking pill opens popover smoothly; Start/Pause/Reset operate cleanly.
- [ ] Clicking outside closes the popover.
