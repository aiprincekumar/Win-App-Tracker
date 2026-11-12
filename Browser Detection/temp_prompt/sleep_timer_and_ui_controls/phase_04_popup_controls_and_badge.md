# Phase 4: Popup Modern Controls, SVG Icons & Countdown Badge

> **Phase Reference:** `phase_04_popup_controls_and_badge.md`  
> **Milestone:** 4 of 5  
> **Assigned Role:** Frontend Popup Specialist  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Architecture Standard:** Modern Vector SVG Iconography & Zero-innerHTML W3C Trusted Types  
> **Governing Document:** [`DESIGN.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/sleep_timer_and_ui_controls/DESIGN.md)  

---

## 🎯 1. Phase Objective

Transform the extension popup interface into a high-DPI modern command center. Replace plain text emoji footer buttons with crisp, scalable SVG icons; integrate a 1-click Global Play/Pause button; construct the floating Sleep Timer popover with quick presets (15m, 30m, 45m, 60m) and custom minute input; and implement real-time countdown updates with dynamic color interpolation (`#22c55e` Green -> `#eab308` Yellow -> `#ef4444` Red) on the browser action badge and popup status chip.

---

## 📦 2. Prerequisites & Inputs

- Completion of Phases 1, 2, and 3.
- Vector SVG specifications and color tokens defined in [`DESIGN.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/sleep_timer_and_ui_controls/DESIGN.md).
- Ensure all modifications maintain UTF-8 with BOM standard (`0xEF, 0xBB, 0xBF`).

---

## 🔗 3. Technical Context & File Anchors

- **Target File 1:** [`popup/popup.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html#L253-L272)
  - Anchor: Action Footer (restructure into 5-button SVG toolbar and insert Sleep Timer popover).
- **Target File 2:** [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js#L500-L600)
  - Anchor: Footer action event listeners, badge countdown updater, and popover toggle logic.
- **Target File 3:** [`popup/popup.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css#L550-L650)
  - Anchor: Footer buttons, popover modal, glassmorphism styles, and pulse animation.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 4.1: Modern SVG Toolbar & Popover in `popup/popup.html`
In [`popup/popup.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html):
Replace lines 253-271 with the modern SVG control toolbar and floating popover:
```html
    <!-- Action Footer Toolbar -->
    <footer class="footer-control-toolbar" role="toolbar" aria-label="Media Sentinel Global Actions">
      <!-- 1. Refresh Button -->
      <button id="btnRefresh" class="toolbar-btn" title="Refresh Telemetry" aria-label="Refresh Telemetry">
        <svg class="sentinel-svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
        <span id="btnRefreshText" class="btn-label">Refresh</span>
      </button>

      <!-- 2. Global Play/Pause Button -->
      <button id="btnGlobalMediaToggle" class="toolbar-btn" title="Toggle Play / Pause Across All Tabs" aria-label="Toggle Play Pause">
        <svg id="svgGlobalMediaIcon" class="sentinel-svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polygon id="svgPlayPolygon" points="5 3 19 12 5 21 5 3"/>
        </svg>
        <span id="lblGlobalMediaText" class="btn-label">Media</span>
      </button>

      <!-- 3. Sleep Timer Launcher Button -->
      <button id="btnSleepTimerTrigger" class="toolbar-btn" title="Sleep Timer Options" aria-label="Sleep Timer" aria-haspopup="dialog" aria-expanded="false">
        <svg class="sentinel-svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span id="lblSleepTimerText" class="btn-label">Timer</span>
        <span id="sleepTimerActiveDot" class="timer-active-dot hidden"></span>
      </button>

      <!-- 4. HUD Bridge Button -->
      <button id="btnReconnectWs" class="toolbar-btn btn-hud-action" title="Launch Video Detector HUD" aria-label="HUD Bridge">
        <svg class="sentinel-svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span id="btnReconnectWsText" class="btn-label">HUD</span>
      </button>

      <!-- 5. Dashboard Primary Button -->
      <button id="btnOpenDashboard" class="toolbar-btn btn-dashboard-primary" title="Open Full Dashboard" aria-label="Open Dashboard">
        <svg class="sentinel-svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="7" height="9" rx="1"/>
          <rect x="14" y="3" width="7" height="5" rx="1"/>
          <rect x="14" y="12" width="7" height="9" rx="1"/>
          <rect x="3" y="16" width="7" height="5" rx="1"/>
        </svg>
        <span id="btnOpenDashboardText" class="btn-label">Dash</span>
      </button>
    </footer>

    <!-- Floating Sleep Timer Popover Dialog -->
    <div id="sleepTimerPopover" class="sleep-timer-popover hidden" role="dialog" aria-modal="true" aria-labelledby="sleepPopoverTitle">
      <div class="popover-header">
        <div class="popover-title-row">
          <span class="popover-icon">🌙</span>
          <h3 id="sleepPopoverTitle" class="popover-title">Sleep Timer</h3>
        </div>
        <button id="btnCloseSleepPopover" class="popover-close-btn" aria-label="Close Popover">✕</button>
      </div>

      <div class="popover-body">
        <!-- Active Countdown Section -->
        <div id="activeCountdownContainer" class="active-countdown-container hidden">
          <div class="countdown-display">
            <span id="countdownTimeRemaining" class="countdown-val">00:00</span>
            <span id="countdownStatusBadge" class="countdown-badge">Active</span>
          </div>
          <div class="countdown-progress-bar">
            <div id="countdownProgressFill" class="countdown-fill" style="width: 100%;"></div>
          </div>
          <button id="btnCancelActiveTimer" class="btn-cancel-timer">Cancel Timer</button>
        </div>

        <!-- Presets Grid -->
        <div id="sleepPresetsContainer" class="sleep-presets-container">
          <span class="section-micro-label">Quick Presets:</span>
          <div class="presets-btn-grid">
            <button class="preset-pill-btn" data-minutes="15">15m</button>
            <button class="preset-pill-btn" data-minutes="30">30m</button>
            <button class="preset-pill-btn" data-minutes="45">45m</button>
            <button class="preset-pill-btn" data-minutes="60">60m</button>
          </div>

          <div class="custom-timer-row">
            <label for="customTimerInput" class="custom-timer-label">Custom:</label>
            <div class="custom-input-group">
              <input type="number" id="customTimerInput" min="1" max="1440" placeholder="Min" class="custom-input">
              <button id="btnSetCustomTimer" class="btn-set-custom">Set</button>
            </div>
          </div>

          <div class="fade-out-toggle-row">
            <span class="toggle-desc">30s Audio Fade-out</span>
            <label class="switch-toggle-sm">
              <input type="checkbox" id="toggleSleepFade" checked>
              <span class="slider-round-sm"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
```

### Step 4.2: Interaction & Color Interpolation Engine in `popup/popup.js`
In [`popup/popup.js`](file:///c:/Users/Atul Verma/Desktop/Win%20App Tracker/Browser%20Detection/popup/popup.js):
1. **Color Interpolation Algorithm:**
```javascript
function calculateTimerColor(remainingMs, totalDurationMs) {
  if (totalDurationMs <= 0) return '#ef4444';
  const ratio = Math.max(0, Math.min(1, remainingMs / totalDurationMs));

  const green = [34, 197, 94];
  const yellow = [234, 179, 8];
  const red = [239, 68, 68];

  let r, g, b;
  if (ratio > 0.5) {
    const factor = (ratio - 0.5) / 0.5;
    r = Math.round(yellow[0] + factor * (green[0] - yellow[0]));
    g = Math.round(yellow[1] + factor * (green[1] - yellow[1]));
    b = Math.round(yellow[2] + factor * (green[2] - yellow[2]));
  } else if (ratio > 0.2) {
    const factor = (ratio - 0.2) / 0.3;
    r = Math.round(red[0] + factor * (yellow[0] - red[0]));
    g = Math.round(red[1] + factor * (yellow[1] - red[1]));
    b = Math.round(red[2] + factor * (yellow[2] - red[2]));
  } else {
    return '#ef4444';
  }
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
```

2. **Sleep Timer Popover & Presets Wiring:**
- Toggle popover visibility on `#btnSleepTimerTrigger` click.
- Close popover on `#btnCloseSleepPopover` click or Escape key.
- Preset pill buttons (`data-minutes`): send `SET_SLEEP_TIMER` action with `durationMinutes`.
- Custom timer button: validate input 1-1440, send `SET_SLEEP_TIMER`.
- Cancel button: send `CANCEL_SLEEP_TIMER`.

3. **Live Countdown Ticker:**
- Run 1-second interval while popup is open.
- Compute `remainingMs = state.targetTime - Date.now()`.
- Format time display (`MM:SS`).
- Compute color via `calculateTimerColor()`.
- Update progress bar fill width and countdown chip color.
- If `remainingMs < 60000`, add `.critical-pulse` class.

4. **Global Play/Pause Toggle:**
- Bind click on `#btnGlobalMediaToggle`: dispatch `TOGGLE_GLOBAL_MEDIA` action to background.
- Update icon state (toggle between pause bars and play triangle).

### Step 4.3: Responsive CSS Styling in `popup/popup.css`
In [`popup/popup.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css):
- Style `.footer-control-toolbar` as a high-density 5-button flexbox with equal distribution (`gap: 6px`).
- Style `.toolbar-btn` with dark slate background, rounded corners, subtle hover border glow, and transition.
- Style `.sleep-timer-popover` positioned above the footer with glassmorphism blur (`backdrop-filter: blur(12px)`), dark slate card background, and z-index 100.
- Add `.critical-pulse` keyframe animation for red countdown state.

---

## 🚫 5. Architectural Constraints & Boundaries

- All dynamic DOM operations must use `createElement`, `setAttribute`, `textContent`. Zero `innerHTML`.
- Footer layout must be responsive with zero horizontal scrolling or button overlapping at default 400px popup width.
- Keyboard accessible: Popover can be opened and closed with standard Tab/Enter/Escape keys.

---

## 📋 6. Deliverables Manifest

1. Updated [`popup/popup.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.html) with SVG toolbar and popover.
2. Updated [`popup/popup.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.js) with countdown ticker, color interpolation, and popover handlers.
3. Updated [`popup/popup.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/popup/popup.css) with toolbar layout, glassmorphism popover, and pulse animations.

---

## 🧪 7. Local Verification Gate

Execute the syntax and manifest integrity suite:
```powershell
node tests/test_syntax_and_manifest_integrity.js
```
**Exit Criterion:** Command exits with code 0; syntax and brace integrity in `popup/popup.js` pass with 100% success.
