# Design System Specification: Sleep Timer & UI Controls

> **Specification Reference:** `temp_prompt/sleep_timer_and_ui_controls/DESIGN.md`  
> **Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`  
> **Design Language:** Modern Dark Slate Glassmorphism  
> **Accessibility Standard:** WCAG 2.1 AA Compliant Contrast & Focus States  

---

## 🎨 1. Visual Design Language & Color Tokens

The UI maintains visual parity with the existing Sentinel dark theme while adding dynamic state indicators and high-contrast accents:

| Token Name | Hex Value | RGB Value | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#0a0f1d` | `10, 15, 29` | Outer app backdrop |
| `--bg-card` | `#131d31` | `19, 29, 49` | Card & container surfaces |
| `--bg-card-hover` | `#1b2944` | `27, 41, 68` | Interactive hover states |
| `--border-subtle` | `#1f2e4d` | `31, 46, 77` | Default card borders |
| `--border-focus` | `#38bdf8` | `56, 189, 248` | Focus rings & primary highlights |
| `--text-primary` | `#f8fafc` | `248, 250, 252` | Headings & high-emphasis labels |
| `--text-secondary`| `#94a3b8` | `148, 163, 184` | Descriptions & subheadings |
| `--text-muted` | `#64748b` | `100, 116, 139` | Captions & inactive tabs |
| `--timer-safe` | `#22c55e` | `34, 197, 94` | Timer > 50% remaining (Green) |
| `--timer-warning` | `#eab308` | `234, 179, 8` | Timer 20% - 50% remaining (Yellow) |
| `--timer-critical`| `#ef4444` | `239, 68, 68` | Timer < 20% remaining (Red) |

---

## 📐 2. Modern Scalable Vector Graphics (SVG) Specifications

All emoji icons in the popup footer are replaced with 24x24 scalable vector paths rendered with `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, and `fill="none"`:

### 2.1 Refresh Telemetry Icon
```xml
<svg class="sentinel-svg-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
</svg>
```

### 2.2 Global Play/Pause Dual-State Icon
- **State A: Pause All (When media is active)**
```xml
<svg class="sentinel-svg-icon icon-pause" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
  <rect x="6" y="4" width="4" height="16" rx="1"/>
  <rect x="14" y="4" width="4" height="16" rx="1"/>
</svg>
```
- **State B: Resume (When media is paused/idle)**
```xml
<svg class="sentinel-svg-icon icon-play" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
  <polygon points="5 3 19 12 5 21 5 3"/>
</svg>
```

### 2.3 Sleep Timer Moon & Clock Icon
```xml
<svg class="sentinel-svg-icon icon-sleep" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  <polyline points="12 6 12 12 16 14"/>
</svg>
```

### 2.4 Video Detector HUD Link Icon
```xml
<svg class="sentinel-svg-icon icon-hud" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
</svg>
```

### 2.5 Dashboard Navigation Icon
```xml
<svg class="sentinel-svg-icon icon-dashboard" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
  <rect x="3" y="3" width="7" height="9" rx="1"/>
  <rect x="14" y="3" width="7" height="5" rx="1"/>
  <rect x="14" y="12" width="7" height="9" rx="1"/>
  <rect x="3" y="16" width="7" height="5" rx="1"/>
</svg>
```

---

## 🎛️ 3. Compact Button Group Layout & Popover UI

### 3.1 Footer Toolbar Grid Structure
The popup footer is reorganized into a clean 5-button responsive flex container:
```html
<footer class="footer-control-toolbar" role="toolbar" aria-label="Media Sentinel Global Actions">
  <button id="btnRefresh" class="toolbar-btn" title="Refresh Telemetry" aria-label="Refresh Telemetry">
    <!-- SVG Refresh Icon -->
    <span class="btn-label">Refresh</span>
  </button>
  <button id="btnGlobalMediaToggle" class="toolbar-btn" title="Toggle Play / Pause Across All Tabs" aria-label="Toggle Play Pause">
    <!-- SVG Play/Pause Icon -->
    <span id="lblGlobalMediaText" class="btn-label">Play/Pause</span>
  </button>
  <button id="btnSleepTimerTrigger" class="toolbar-btn" title="Sleep Timer Options" aria-label="Sleep Timer" aria-haspopup="dialog" aria-expanded="false">
    <!-- SVG Sleep Icon -->
    <span id="lblSleepTimerText" class="btn-label">Timer</span>
    <span id="sleepTimerActiveIndicator" class="timer-dot hidden"></span>
  </button>
  <button id="btnReconnectWs" class="toolbar-btn btn-hud-action" title="Launch Video Detector HUD" aria-label="HUD Bridge">
    <!-- SVG HUD Icon -->
    <span class="btn-label">HUD</span>
  </button>
  <button id="btnOpenDashboard" class="toolbar-btn btn-dashboard-primary" title="Open Full Dashboard" aria-label="Open Dashboard">
    <!-- SVG Dashboard Icon -->
    <span class="btn-label">Dashboard</span>
  </button>
</footer>
```

### 3.2 Floating Sleep Timer Popover
Positioned directly above the footer toolbar with glassmorphism backdrop blur:
```html
<div id="sleepTimerPopover" class="sleep-timer-popover hidden" role="dialog" aria-modal="true" aria-labelledby="sleepPopoverTitle">
  <div class="popover-header">
    <div class="popover-title-row">
      <span class="popover-icon">🌙</span>
      <h3 id="sleepPopoverTitle" class="popover-title">Sleep Timer</h3>
    </div>
    <button id="btnCloseSleepPopover" class="popover-close-btn" aria-label="Close Popover">✕</button>
  </div>
  
  <div class="popover-body">
    <!-- Active Countdown Section (Shown when running) -->
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

    <!-- Presets Grid (Shown when idle) -->
    <div id="sleepPresetsContainer" class="sleep-presets-container">
      <span class="section-micro-label">Quick Presets:</span>
      <div class="presets-btn-grid">
        <button class="preset-pill-btn" data-minutes="15">15 min</button>
        <button class="preset-pill-btn" data-minutes="30">30 min</button>
        <button class="preset-pill-btn" data-minutes="45">45 min</button>
        <button class="preset-pill-btn" data-minutes="60">60 min</button>
      </div>

      <div class="custom-timer-row">
        <label for="customTimerInput" class="custom-timer-label">Custom:</label>
        <div class="custom-input-group">
          <input type="number" id="customTimerInput" min="1" max="1440" placeholder="Min" class="custom-input">
          <button id="btnSetCustomTimer" class="btn-set-custom">Set</button>
        </div>
      </div>

      <div class="fade-out-toggle-row">
        <span class="toggle-desc">Gradual 30s Audio Fade</span>
        <label class="switch-toggle-sm">
          <input type="checkbox" id="toggleSleepFade" checked>
          <span class="slider-round-sm"></span>
        </label>
      </div>
    </div>
  </div>
</div>
```

---

## ⚡ 4. CSS Micro-Interactions & Critical Pulse Animation

When the timer countdown dips under 60 seconds, the chip and badge activate a critical pulse:
```css
@keyframes sentinel-critical-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    border-color: rgba(239, 68, 68, 1);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
    border-color: rgba(239, 68, 68, 0.4);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    border-color: rgba(239, 68, 68, 1);
  }
}

.countdown-val.critical-pulse {
  animation: sentinel-critical-pulse 1.5s infinite ease-in-out;
  color: #ef4444;
}
```
