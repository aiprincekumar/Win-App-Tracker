# 🚀 Phase 1 Execution Prompt: Comprehensive UI/UX Architecture, Visual Layout & Interactive Frontend Wiring

> **Phase:** 1 of 2  
> **Initiative:** Focus Time & Focus Sentinel Subsystem End-to-End Implementation  
> **Container Directory:** [`temp_prompt/focus_time/`](.)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Subagent Role:** Level 4 Frontend Engineer  
> **Department Rule:** Dept 05 Frontend Engineering & Dept 06 UI/UX Design  

---

## 🎯 1. Phase Objective

The objective of **Phase 1** is to construct and verify the complete visual presentation, responsive layout, cyber-dark glassmorphism styling, and interactive client-side controllers for the **Focus Time & Focus Sentinel Subsystem** across the Dashboard and Extension Popup.

By the conclusion of Phase 1, the user will be able to visually inspect and interact with:
1. The upgraded **Hero Focus Sentinel Bento Card** with an SVG Radial Countdown Dial ($r=54$, $C=339.292$), presets, extenders, and feature toggles in `#paneWellbeing`.
2. The new **Focus Time Analytics Metric Card** (`#cardFocusAnalytics`) inside `#trackingMetricsGrid` in Tab A.
3. The real-time **Sidebar Live Micro-Widget** (`#wellbeingLiveMicroWidget`).
4. The compact **Popup Mini-Timer Controller** (`#cardPopupFocusTimer`) in `viewTrackingPane`.

All UI components must be fully wired to client-side state with smooth visual ticking, dial offset math, and 100% W3C Trusted Types zero-innerHTML safety before any backend logic is authoritatively implemented in Phase 2.

---

## 🔗 2. File Context & Line Anchors

- [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L1192-L1215) — Current `#widgetPomodoroSentinel` markup.
- [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L284-L358) — Tab A `#trackingMetricsGrid` KPI cards row.
- [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L78-L88) — Sidebar `#wellbeingLiveMicroWidget` HUD.
- [`dashboard/styles/wellbeing_blacklist.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/wellbeing_blacklist.css) — Focus & Wellbeing CSS module.
- [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L3964-L4045) — Current Pomodoro widget initialization and UI controller.
- [`popup/popup.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L525-L572) — `viewTrackingPane` Digital Wellness section.
- [`popup/popup.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css) — Popup styling.
- [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js) — Popup controller logic.

---

## 🛠️ 3. Surgical Step-by-Step Instructions

### Step 1.1: Upgrade Hero Pomodoro Sentinel Card in [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L1192-L1215)
Replace the existing basic `#widgetPomodoroSentinel` contents with the full Focus Sentinel Hero Card layout:
1. **Preserve Container ID:** Keep `<div id="widgetPomodoroSentinel" class="bento-card liquid-glass-card bento-span-6 pomodoro-hero-card">`.
2. **Card Header:**
   - Icon: `<span class="card-icon settings-card-icon">🧘</span>`
   - Title: `<h3 id="txtPomodoroTitle" class="card-heading settings-card-title">Focus Sentinel & Pomodoro</h3>`
   - Subtitle: `<span class="settings-card-sub">Deep work intervals, automated media cutoff & break recovery</span>`
   - Mode & Status Badge: `<span id="pomodoroModeBadge" class="badge-focus">Focus (25m)</span>`
   - Status Dot: `<span id="dashFocusActiveDot" class="status-indicator-dot hidden" aria-hidden="true"></span>`
3. **Hero Body & Radial Dial Layout:**
   - Dial Wrapper: `<div class="dash-focus-dial-wrapper">`
   - SVG Dial: Width `140`, Height `140`, viewBox `0 0 120 120`.
   - Dial Track Circle: `cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="8"` (class `dash-focus-dial-track`).
   - Dial Progress Circle: `id="dashFocusDialProgress"` (class `dash-focus-dial-progress tier-focus`), `cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-dasharray="339.292" stroke-dashoffset="0" transform="rotate(-90 60 60)"`.
   - Dial Center Readout:
     - Digital Clock: `<div id="pomodoroTimeDisplay" class="focus-big-clock" aria-live="polite">25:00</div>`
     - Finish Time: `<div id="pomodoroFinishTime" class="focus-finish-time">Target: --:--</div>`
4. **Quick Duration Presets Grid:**
   - Label: `<span class="focus-section-label">Quick Presets</span>`
   - Presets Container: `<div class="dash-focus-presets-grid">`
   - Buttons:
     * `<button type="button" class="dash-focus-preset-btn" data-minutes="15">15m</button>`
     * `<button type="button" class="dash-focus-preset-btn active" data-minutes="25">25m</button>`
     * `<button type="button" class="dash-focus-preset-btn" data-minutes="45">45m</button>`
     * `<button type="button" class="dash-focus-preset-btn" data-minutes="60">60m</button>`
5. **Quick Extenders & Actions Panel:**
   - Extender Buttons:
     * `<button type="button" id="btnFocusExtend5" class="dash-focus-extender-btn" data-add="5">+5m</button>`
     * `<button type="button" id="btnFocusExtend15" class="dash-focus-extender-btn" data-add="15">+15m</button>`
   - Primary Actions:
     * Start/Pause Toggle: `<button type="button" id="btnStartPomodoro" class="btn-focus-primary"><span id="btnFocusToggleIcon">▶️</span><span id="btnFocusToggleText">Start Focus</span></button>`
     * Reset Button: `<button type="button" id="btnResetPomodoro" class="btn-focus-secondary"><span>🔄</span><span>Reset</span></button>`
6. **Feature Toggles Row:**
   - Auto-pause toggle: Checkbox `<input type="checkbox" id="toggleFocusAutoPauseMedia" class="styled-checkbox" checked>` with label "Auto-pause media during focus".
   - Sound chime toggle: Checkbox `<input type="checkbox" id="toggleFocusChime" class="styled-checkbox" checked>` with label "Sound chime on cycle completion".

---

### Step 1.2: Add Focus Time Metric Card in Tab A ([`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L284-L358))
Inside `#trackingMetricsGrid` in `#paneTracking`, add a dedicated Focus Analytics card alongside the existing 5 cards:
```html
<!-- Metric Card 6: Focus Time Analytics -->
<div id="cardFocusAnalytics" class="metric-card bento-card liquid-glass-card bento-span-3">
  <div class="metric-header">
    <span id="lblMetricFocus" class="metric-label">Today's Focus Time</span>
    <span class="metric-icon-box emerald">🧘</span>
  </div>
  <div class="metric-value-container">
    <span id="trackMetricFocusTime" class="metric-big-num">0h 00m</span>
  </div>
  <div class="metric-footer">
    <span id="trackMetricFocusSessions" class="metric-subtext">0 completed sessions today</span>
  </div>
</div>
```

---

### Step 1.3: Polish Sidebar Micro-Widget HUD ([`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L78-L88))
Verify `#wellbeingLiveMicroWidget` retains its structure and connects smoothly with dynamic classes:
- `#wellbeingMicroStatusDot`: adds `.idle`, `.active`, `.paused`, `.break`.
- `#wellbeingMicroClock`: displays `25:00` or live active remaining time.
- `#wellbeingMicroMode`: displays `Focus Idle`, `Deep Focus`, `Focus Paused`, or `Rest Break`.

---

### Step 1.4: Add Popup Focus Time Mini-Controller in [`popup/popup.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L525-L572))
Inside `viewTrackingPane` within `#cardFocusWellness` (before or alongside `#focusRatioBarContainer`), insert a compact Focus Time Sentinel section:
```html
<!-- Compact Focus Time Sentinel Card -->
<div id="cardPopupFocusTimer" class="popup-focus-card">
  <div class="popup-focus-header">
    <span class="popup-focus-title">🧘 Focus Block</span>
    <span id="popupFocusBadge" class="popup-focus-badge idle">25m</span>
  </div>
  <div class="popup-focus-body">
    <span id="popupFocusClock" class="popup-focus-clock">25:00</span>
    <div class="popup-focus-actions">
      <button type="button" id="btnPopupFocusToggle" class="popup-focus-btn primary" title="Start Focus">▶️</button>
      <button type="button" id="btnPopupFocusReset" class="popup-focus-btn secondary" title="Reset Timer">🔄</button>
    </div>
  </div>
</div>
```

---

### Step 1.5: Author Cyber-Dark Modular CSS in [`dashboard/styles/wellbeing_blacklist.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/wellbeing_blacklist.css) and [`popup/popup.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css)
1. Add SVG radial dial layout classes:
   - `.dash-focus-dial-wrapper`: relative centering container.
   - `.dash-focus-svg-dial`: dimensions `140x140`, circular drop-shadow.
   - `.dash-focus-dial-track`: stroke `rgba(255, 255, 255, 0.08)`.
   - `.dash-focus-dial-progress`: stroke-linecap `round`, `stroke-dasharray: 339.292`, `transition: stroke-dashoffset 0.35s ease, stroke 0.3s ease`.
   - State modifiers: `.tier-focus` (`stroke: #10b981`), `.tier-break` (`stroke: #06b6d4`), `.tier-paused` (`stroke: #f59e0b`).
2. Add presets grid styles: `.dash-focus-presets-grid`, `.dash-focus-preset-btn` with hover/active states.
3. Add extenders styles: `.dash-focus-extender-btn`.
4. Add action button styles: `.btn-focus-primary`, `.btn-focus-secondary`.
5. Add popup mini-timer styles in `popup.css`.

---

### Step 1.6: Wire Frontend Event Listeners & Radial Dial Math in [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js) and [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js)
1. In `dashboard/dashboard.js`:
   - Bind preset buttons to update active duration (`15`, `25`, `45`, `60`), updating `#pomodoroTimeDisplay` and `#pomodoroModeBadge`.
   - Bind extender buttons (`+5m`, `+15m`) to dynamically add seconds and recalibrate the clock.
   - Bind `#btnStartPomodoro` to toggle play/pause state.
   - Bind `#btnResetPomodoro` to restore initial duration and reset the SVG dial offset to `0`.
   - Implement `updateFocusRadialDial(remainingSec, totalSec, mode, status)`:
     ```javascript
     const CIRCUMFERENCE = 339.292;
     const ratio = totalSec > 0 ? remainingSec / totalSec : 0;
     const offset = CIRCUMFERENCE * (1 - ratio);
     dialProgressEl.style.strokeDashoffset = Math.max(0, Math.min(CIRCUMFERENCE, offset)).toFixed(3);
     ```
   - Strictly zero innerHTML: use `textContent`, `setAttribute`, and `classList`.
2. In `popup/popup.js`:
   - Bind `#btnPopupFocusToggle` and `#btnPopupFocusReset` to trigger focus actions and update `#popupFocusClock` and `#popupFocusBadge`.

---

## 🚫 4. Strict Scope Boundaries & Out-of-Scope Declarations

- **Sleep Sentinel Hub (`#cardSleepSentinelHub`):** DO NOT modify or overwrite any part of `#cardSleepSentinelHub`, `#dashSleepCountdownDisplay`, `#dashSleepDialProgress`, or its handlers.
- **Doomscroll Breaker (`#doomscrollBreakerCard`):** DO NOT modify or overwrite interval selectors or toggles.
- **Domain Budgets & Tracking Blacklist:** DO NOT modify budget lists or domain chips.
- **Media Deck & Audio Lab:** DO NOT modify any equalizer or visualizer components.

---

## 📦 5. Deliverables Manifest

1. Updated [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html) with upgraded Hero Card and Tab A `#cardFocusAnalytics`.
2. Updated [`dashboard/styles/wellbeing_blacklist.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/wellbeing_blacklist.css) with cyber-dark Focus Sentinel styles.
3. Updated [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js) with interactive frontend wiring and radial dial offset math.
4. Updated [`popup/popup.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html) with `#cardPopupFocusTimer`.
5. Updated [`popup/popup.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css) with mini-timer styling.
6. Updated [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js) with popup focus event handlers.

---

## 🧪 6. Local Verification Gate

Execute the following commands before requesting Phase 1 signoff:
1. **Extension Syntax & Manifest Integrity:**
   ```bash
   node tests/test_syntax_and_manifest_integrity.js
   ```
   *Pass Criterion:* Exit code 0, all 15 tests pass.
2. **Phase 1 DOM & SVG Dial Integrity Assertion:**
   Create and execute a Node.js verification script verifying:
   - `#widgetPomodoroSentinel` contains `dashFocusDialProgress` with `r="54"` and `stroke-dasharray="339.292"`.
   - `#pomodoroTimeDisplay`, `#pomodoroFinishTime`, `#pomodoroModeBadge` exist.
   - Presets for 15m, 25m, 45m, 60m and extenders +5m, +15m exist.
   - `#cardFocusAnalytics` exists inside `#trackingMetricsGrid` in Tab A.
   - `#cardPopupFocusTimer` exists inside `viewTrackingPane` in `popup.html`.
   - Zero assignments to `.innerHTML` in modified JavaScript files.
