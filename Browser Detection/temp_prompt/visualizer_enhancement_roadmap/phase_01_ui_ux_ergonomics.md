# Phase 1 Execution Prompt: Visualizer UI/UX Redesign & Zero-Expansion Spatial Ergonomics
# Task: Visualizer Ergonomics, Canvas HUD, Compact Pill Selector & Calibration Graticule
# Task ID: TASK-VIZ-ROADMAP-PHASE-01
# Architecture Level: Level 4 Execution Subagent Specification

> **Execution Directive for Level 4 Frontend Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` (Dept 01 Product Requirements & Dept 05 Frontend Engineering) and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 05 Frontend Engineering & UI/UX Design.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
> - **Security Standard:** 100% W3C Trusted Types Compliant (Zero `innerHTML` assignments).
> - **Performance Target:** 60 FPS Render Loop (<16.6ms frame budget), CLS = 0.00, Zero DOM memory leaks.
> - **Spatial Constraint:** STRICT ZERO-EXPANSION of outer widget bounding box (`#heroAudioLabStatus`).

---

## 🎯 1. Objective & Executive Scope

The **Real-Time Spectrum Visualizer** embedded inside the Bento Media Dashboard is currently experiencing severe spatial crowding in its top header controls bar (`.visualizer-controls-bar`). The standard HTML native dropdown (`<select id="selectVizEffect">`), mode labels, and window action buttons (video embed toggle, theater mode, fullscreen) compete for limited horizontal width within the 4-column Bento grid card (`bento-span-4 bento-row-span-2`).

**Phase 1 Executive Scope:**
1. **Zero-Expansion Spatial Ergonomics:** Completely redesign and streamline the visualizer's internal layout without increasing the outer widget dimensions (width, height, or grid footprint of `#heroAudioLabStatus` / `.audio-lab-widget`).
2. **Compact Dropdown Pill Selector:** Replace the bulky standard HTML `<select>` dropdown with an ultra-compact, floating glass pill badge (`.viz-pill-selector`) that opens a frosted glass popover menu while maintaining strict bidirectional synchronization with the underlying `#selectVizEffect` for full test and API backward compatibility.
3. **Canvas HUD Overlay Layer:** Introduce a lightweight, hardware-accelerated Head-Up Display (HUD) overlay directly positioned over the 2D canvas (`.visualizer-canvas-container`) displaying real-time stream telemetry (live FPS badge, active audio stream state) and non-obtrusive micro-controls.
4. **Settings Glass Drawer / Sliding Flyout Overlay:** Implement a slide-out or flip-down micro-drawer (`.viz-settings-drawer`) anchored inside the visualizer panel that smoothly reveals secondary controls (graticule toggle, peak hold decay speed, sensitivity slider) and tucks away cleanly when dismissed, eliminating vertical clutter.
5. **High-Visibility Studio Peak-Hold VU Meters:** Upgrade the existing stereo VU bar footer into high-contrast studio-grade level meters with floating peak decay indicators (`.vu-peak-indicator`) adhering to professional broadcast meter dynamics (instant attack, 400ms peak hold, exponential falloff).
6. **Canvas Graticule Grid & Frequency Calibration Scale:** Render a subtle, subpixel-aligned acoustic graticule directly on the canvas surface with reference octave frequency guidelines (60 Hz, 250 Hz, 1 kHz, 4 kHz, 16 kHz) and calibrated decibel scale markings (-36 dB, -24 dB, -12 dB, 0 dB).

---

## 📋 2. Prerequisites, Dependencies & Input State

### 2.1 Baseline State & Existing Capabilities
- **Current Visualizer Engine:** `src/dashboard/features/media_deck_visualizer_feature.js` supports 6 visualization modes (`bars`, `wave`, `radial`, `matrix_dots`, `flame`, `stereo_mirror`) with an automated sleep sentinel when audio is paused or the document is hidden.
- **Current DOM Markup:** `dashboard/dashboard.html` lines 737-814 contains `#heroAudioLabStatus` containing `.visualizer-controls-bar`, `.visualizer-canvas-container`, and `.vu-meters-container`.
- **Active Tests:** All existing regression tests must continue passing without regression:
  - `tests/test_visualizer_toolbar_buttons_fix.js`
  - `tests/test_visualizer_compact_fullscreen_embed.js`
  - `tests/test_visualizer_effects_dropdown.js`

### 2.2 Backward Compatibility Invariant
- The DOM element `<select id="selectVizEffect">` must remain present in the DOM (visually hidden via `display: none;` or `visually-hidden` class) so that any script or automated test querying `doc.getElementById('selectVizEffect')` or dispatching `change` events continues to function with 100% reliability.

---

## 📂 3. Technical Context & File Anchors

| Component | Target File | Line Anchor | Responsibility |
| :--- | :--- | :--- | :--- |
| **HTML Structure** | [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L737-L815) | L737-L815 | Bento card markup, controls bar, canvas chassis, settings drawer slot, VU meter footer |
| **Media Styles** | [`dashboard/styles/media.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media.css#L1240-L1460) | L1240-L1460 | Controls bar, compact pill selector, settings drawer, HUD overlays, VU meter gradients |
| **Chassis & VU** | [`dashboard/styles/media.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media.css#L1625-L1805) | L1625-L1805 | Canvas container layout, VU peak indicators, light theme token overrides |
| **Hero Deck Context** | [`dashboard/styles/media/hero_player.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media/hero_player.css#L1-L120) | L1-L120 | Bento grid alignment, liquid glass visual tokens, dark/light theme elevation |
| **Visualizer JS Engine** | [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L630-L845) | L630-L845 | Mode state, compact pill synchronization, peak-hold state machine, graticule toggles |
| **Render Loop** | [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L1185-L1450) | L1185-L1450 | 60 FPS canvas loop, graticule grid rendering, peak-hold decay calculations |
| **Dashboard Controller** | [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L420-L480) | L420-L480 | Event binding for drawer toggle, pill popover dismiss, keyboard accessibility |

---

## 🛠️ 4. Surgical Step-by-Step Implementation Instructions

### Step 1.1: DOM Refactor in `dashboard/dashboard.html`
In [`dashboard/dashboard.html#L737-L815`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L737-L815), reconstruct the inner markup of `#heroAudioLabStatus` while strictly preserving its outer container tags:

```html
<!-- Real-Time Spectrum Visualizer & Audio FFT Card -->
<div id="heroAudioLabStatus" class="audio-lab-widget glass-card bento-card liquid-glass-card bento-span-4 bento-row-span-2 visualizer-hero-card">
  <!-- Card Header -->
  <div class="audio-lab-header visualizer-card-header">
    <div class="audio-lab-title-group visualizer-title-group">
      <span class="audio-lab-icon visualizer-icon" aria-hidden="true">🎛️</span>
      <h3 id="txtVisualizerTitle" class="visualizer-title" data-i18n="visualizer_title">Real-Time Spectrum Visualizer</h3>
    </div>
    <!-- Stream Status Pulse Pill -->
    <div id="vizHeaderStatusPill" class="viz-header-status-pill" aria-live="polite">
      <span class="viz-live-dot" id="vizLiveDot" aria-hidden="true"></span>
      <span id="vizHeaderStatusText" class="viz-live-text">STANDBY</span>
    </div>
  </div>

  <!-- Card Body -->
  <div class="audio-lab-body visualizer-card-body">
    <div id="visualizerPanel" class="visualizer-panel">
      
      <!-- Streamlined Controls Bar with Compact Pill Selector -->
      <div class="visualizer-controls visualizer-controls-bar">
        <!-- Custom Compact Glass Pill Selector -->
        <div class="viz-pill-selector-wrapper" id="vizPillSelectorWrapper">
          <button type="button" id="btnVizPillTrigger" class="viz-pill-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="Select Audio Visualizer Effect">
            <span class="viz-pill-icon" id="vizPillIcon" aria-hidden="true">⚡</span>
            <span class="viz-pill-label" id="vizPillLabel">32-Band FFT</span>
            <svg class="viz-pill-chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <!-- Floating Glass Popover Menu -->
          <div id="vizPillPopoverMenu" class="viz-pill-popover-menu" role="listbox" aria-label="Visualizer Effects" tabindex="-1" hidden>
            <button type="button" role="option" class="viz-popover-option active" data-effect="bars" aria-selected="true">
              <span class="viz-opt-icon">⚡</span><span class="viz-opt-text" data-i18n="viz_effect_bars">32-Band Spectrum</span>
            </button>
            <button type="button" role="option" class="viz-popover-option" data-effect="wave" aria-selected="false">
              <span class="viz-opt-icon">🌊</span><span class="viz-opt-text" data-i18n="viz_effect_wave">Oscilloscope Wave</span>
            </button>
            <button type="button" role="option" class="viz-popover-option" data-effect="radial" aria-selected="false">
              <span class="viz-opt-icon">✨</span><span class="viz-opt-text" data-i18n="viz_effect_radial">Radial Frequency Burst</span>
            </button>
            <button type="button" role="option" class="viz-popover-option" data-effect="matrix_dots" aria-selected="false">
              <span class="viz-opt-icon">🟢</span><span class="viz-opt-text" data-i18n="viz_effect_matrix">Matrix Digital Dots</span>
            </button>
            <button type="button" role="option" class="viz-popover-option" data-effect="flame" aria-selected="false">
              <span class="viz-opt-icon">🔥</span><span class="viz-opt-text" data-i18n="viz_effect_flame">Neon Flame Peaks</span>
            </button>
            <button type="button" role="option" class="viz-popover-option" data-effect="stereo_mirror" aria-selected="false">
              <span class="viz-opt-icon">🦋</span><span class="viz-opt-text" data-i18n="viz_effect_stereo">Stereo Mirror Butterfly</span>
            </button>
          </div>
        </div>

        <!-- Hidden Backward-Compatible Native Select (synced for API & tests) -->
        <select id="selectVizEffect" class="visually-hidden" aria-hidden="true" tabindex="-1" style="display: none;">
          <option value="bars">32-Band Spectrum</option>
          <option value="wave">Oscilloscope Wave</option>
          <option value="radial">Radial Frequency Burst</option>
          <option value="matrix_dots">Matrix Digital Dots</option>
          <option value="flame">Neon Flame Peaks</option>
          <option value="stereo_mirror">Stereo Mirror Butterfly</option>
        </select>

        <!-- Right Side Action Group -->
        <div class="viz-actions-group">
          <!-- Settings Drawer Toggle Button -->
          <button type="button" id="btnVizSettingsToggle" class="btn-viz-action-icon" title="Open Visualizer Settings" aria-label="Open Visualizer Settings" aria-expanded="false" tabindex="0">
            <svg class="viz-action-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>

          <!-- Video Embed Mode Toggle -->
          <button type="button" id="btnVizVideoEmbedToggle" class="btn-viz-action-icon" title="Switch to Video Player (Embed Mode)" aria-label="Switch to Video Player (Embed Mode)" aria-pressed="false" tabindex="0">
            <svg class="viz-action-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <polygon points="10 8 16 11 10 14 10 8" fill="currentColor"></polygon>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </button>

          <!-- Full Window / Theater Mode Toggle -->
          <button type="button" id="btnVizFullWindow" class="btn-viz-action-icon" title="Toggle Visualizer Full Window (Theater)" aria-label="Toggle Visualizer Full Window (Theater)" aria-expanded="false" tabindex="0">
            <svg class="viz-action-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
          </button>

          <!-- Fullscreen Toggle -->
          <button type="button" id="btnVizFullscreen" class="btn-viz-action-icon" title="Toggle Visualizer Fullscreen" aria-label="Toggle Visualizer Fullscreen" aria-expanded="false" tabindex="0">
            <svg class="viz-action-svg viz-icon-expand" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
            <svg class="viz-action-svg viz-icon-compress visually-hidden" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="4 14 10 14 10 20"></polyline>
              <polyline points="20 10 14 10 14 4"></polyline>
              <line x1="14" y1="10" x2="21" y2="3"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Canvas Chassis with Embedded HUD Overlay and Settings Drawer -->
      <div class="visualizer-canvas-container" id="vizCanvasContainer">
        <!-- HTML5 Canvas Surface -->
        <canvas id="canvasAudioVisualizer" width="600" height="180" role="img" aria-label="Real-time audio frequency spectrum and waveform visualizer"></canvas>

        <!-- Canvas HUD Overlay Layer (Pointer Events: None for non-interactive elements) -->
        <div class="viz-canvas-hud" id="vizCanvasHud" aria-hidden="true">
          <!-- Top Left Telemetry Pill -->
          <div class="viz-hud-telemetry-cluster">
            <span class="viz-hud-badge viz-hud-fps" id="vizHudFpsBadge">60 FPS</span>
            <span class="viz-hud-badge viz-hud-rate" id="vizHudRateBadge">48 kHz</span>
          </div>

          <!-- Bottom Frequency Graticule Guide Markings -->
          <div class="viz-hud-graticule-labels" id="vizHudGraticuleLabels">
            <span class="viz-scale-label" style="left: 8%;">60Hz</span>
            <span class="viz-scale-label" style="left: 28%;">250Hz</span>
            <span class="viz-scale-label" style="left: 50%;">1kHz</span>
            <span class="viz-scale-label" style="left: 72%;">4kHz</span>
            <span class="viz-scale-label" style="left: 92%;">16kHz</span>
          </div>
        </div>

        <!-- Sliding Micro-Settings Glass Drawer (Overlay on Canvas) -->
        <div id="vizSettingsDrawer" class="viz-settings-drawer" role="dialog" aria-label="Visualizer Configuration" aria-modal="false" hidden>
          <div class="viz-drawer-header">
            <span class="viz-drawer-title">Visualizer Settings</span>
            <button type="button" id="btnVizDrawerClose" class="btn-viz-drawer-close" aria-label="Close Settings">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="viz-drawer-content">
            <!-- Graticule Scale Toggle -->
            <div class="viz-drawer-row">
              <span class="viz-drawer-label">Frequency Graticule</span>
              <label class="viz-toggle-switch">
                <input type="checkbox" id="chkGraticuleToggle" checked aria-label="Toggle Frequency Graticule">
                <span class="viz-toggle-slider"></span>
              </label>
            </div>
            <!-- Peak Hold Decay Option -->
            <div class="viz-drawer-row">
              <span class="viz-drawer-label">Peak Hold Decay</span>
              <div class="viz-btn-segmented" role="group" aria-label="Peak Decay Rate">
                <button type="button" class="viz-seg-btn" data-decay="slow">Slow</button>
                <button type="button" class="viz-seg-btn active" data-decay="normal">Studio</button>
                <button type="button" class="viz-seg-btn" data-decay="fast">Fast</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- High-Visibility Dual Stereo VU Peak Level Meters -->
      <div class="vu-meters-container" id="vuMetersContainer" role="region" aria-label="Stereo Audio Level Meters">
        <!-- Left Channel -->
        <div class="vu-bar-wrapper">
          <span class="vu-label" id="lblVuLeft">L</span>
          <div class="vu-meter-track" aria-hidden="true">
            <div id="vuBarLeft" class="vu-level-fill" style="width: 0%;"></div>
            <div id="vuPeakLeft" class="vu-peak-indicator" style="left: 0%;"></div>
          </div>
          <span id="vuValLeft" class="vu-db-text" aria-live="off">-∞dB</span>
        </div>
        <!-- Right Channel -->
        <div class="vu-bar-wrapper">
          <span class="vu-label" id="lblVuRight">R</span>
          <div class="vu-meter-track" aria-hidden="true">
            <div id="vuBarRight" class="vu-level-fill" style="width: 0%;"></div>
            <div id="vuPeakRight" class="vu-peak-indicator" style="left: 0%;"></div>
          </div>
          <span id="vuValRight" class="vu-db-text" aria-live="off">-∞dB</span>
        </div>
        <!-- 0dB Headroom & Overload Indicator -->
        <div class="vu-status-cluster">
          <span id="vuClipIndicator" class="vu-clip-badge" title="0dB Headroom Status">0dB OK</span>
        </div>
      </div>

    </div>
  </div>
</div>
```

---

### Step 1.2: CSS Rules in `dashboard/styles/media.css`
Append or update the following rules inside [`dashboard/styles/media.css#L1240-L1460`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media.css#L1240-L1460) and [`dashboard/styles/media.css#L1625-L1805`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media.css#L1625-L1805):

```css
/* ========================================================================= */
/* VISUALIZER ZERO-EXPANSION ERGONOMIC LAYOUT & PILL SELECTOR                */
/* ========================================================================= */

/* Streamlined Controls Bar */
.visualizer-controls-bar {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 100% !important;
  box-sizing: border-box !important;
  padding: 4px 8px !important;
  margin-bottom: 6px !important;
  background: rgba(15, 23, 42, 0.45) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  min-height: 34px !important;
  max-height: 34px !important;
  flex-shrink: 0 !important;
}

/* Compact Glass Pill Selector */
.viz-pill-selector-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.viz-pill-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.35);
  border-radius: 14px;
  padding: 3px 10px;
  color: #f8fafc;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.viz-pill-trigger:hover,
.viz-pill-trigger[aria-expanded="true"] {
  background: rgba(49, 46, 129, 0.7);
  border-color: rgba(129, 140, 248, 0.6);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}

.viz-pill-trigger:focus-visible {
  outline: 2px solid #818cf8;
  outline-offset: 1px;
}

.viz-pill-icon {
  font-size: 0.8rem;
  line-height: 1;
}

.viz-pill-chevron {
  transition: transform 0.2s ease;
}

.viz-pill-trigger[aria-expanded="true"] .viz-pill-chevron {
  transform: rotate(180deg);
}

/* Floating Glass Popover Menu */
.viz-pill-popover-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 1000;
  min-width: 190px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  padding: 4px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7), 0 0 16px rgba(99, 102, 241, 0.2);
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: vizPopoverFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.viz-pill-popover-menu[hidden] {
  display: none !important;
}

@keyframes vizPopoverFadeIn {
  from { opacity: 0; transform: translateY(-4px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.viz-popover-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: none;
  background: transparent;
  color: #cbd5e1;
  font-size: 0.72rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all 0.15s ease;
}

.viz-popover-option:hover,
.viz-popover-option:focus-visible {
  background: rgba(99, 102, 241, 0.2);
  color: #ffffff;
  outline: none;
}

.viz-popover-option.active {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.35), rgba(6, 182, 212, 0.25));
  color: #38bdf8;
  font-weight: 600;
}

/* Header Status Pill */
.viz-header-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.viz-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #64748b;
  transition: background 0.3s ease;
}

.viz-live-dot.active {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

/* ========================================================================= */
/* CANVAS CHASSIS, HUD OVERLAY & SLIDING SETTINGS DRAWER                    */
/* ========================================================================= */

.visualizer-canvas-container {
  position: relative !important;
  width: 100% !important;
  flex: 1 1 auto !important;
  height: 100% !important;
  min-height: 180px !important;
  background: var(--viz-canvas-bg, rgba(8, 12, 22, 0.95)) !important;
  border-radius: 10px !important;
  overflow: hidden !important;
  border: 1px solid rgba(99, 102, 241, 0.2) !important;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(99, 102, 241, 0.05) !important;
}

/* Canvas HUD Overlay */
.viz-canvas-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
  z-index: 10;
}

.viz-hud-telemetry-cluster {
  display: flex;
  gap: 6px;
  align-items: center;
}

.viz-hud-badge {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.6rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.viz-hud-fps {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.25);
}

.viz-hud-graticule-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 4px 2px 4px;
  pointer-events: none;
}

.viz-scale-label {
  position: absolute;
  bottom: 4px;
  transform: translateX(-50%);
  font-size: 0.55rem;
  font-family: 'JetBrains Mono', monospace;
  color: rgba(148, 163, 184, 0.45);
  user-select: none;
}

/* Sliding Settings Glass Drawer Overlay */
.viz-settings-drawer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(99, 102, 241, 0.35);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
  padding: 10px 14px;
  z-index: 20;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
  transform: translateY(0);
  opacity: 1;
}

.viz-settings-drawer[hidden] {
  display: none !important;
  transform: translateY(-100%);
  opacity: 0;
}

.viz-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 8px;
}

.viz-drawer-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #38bdf8;
}

.btn-viz-drawer-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  transition: color 0.15s ease;
}

.btn-viz-drawer-close:hover {
  color: #f43f5e;
}

.viz-drawer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.viz-drawer-row:last-child {
  margin-bottom: 0;
}

.viz-drawer-label {
  font-size: 0.68rem;
  color: #cbd5e1;
}

/* Micro Toggle Switch */
.viz-toggle-switch {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
}

.viz-toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.viz-toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #334155;
  border-radius: 18px;
  transition: 0.2s;
}

.viz-toggle-slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background: white;
  border-radius: 50%;
  transition: 0.2s;
}

.viz-toggle-switch input:checked + .viz-toggle-slider {
  background: #6366f1;
}

.viz-toggle-switch input:checked + .viz-toggle-slider:before {
  transform: translateX(14px);
}

/* Segmented Decay Rate Buttons */
.viz-btn-segmented {
  display: inline-flex;
  background: rgba(30, 41, 59, 0.7);
  border-radius: 6px;
  padding: 2px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.viz-seg-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 2px 8px;
  font-size: 0.62rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.viz-seg-btn:hover {
  color: #ffffff;
}

.viz-seg-btn.active {
  background: #4f46e5;
  color: #ffffff;
  font-weight: 600;
}

/* ========================================================================= */
/* STUDIO PEAK-HOLD STEREO VU METERS                                         */
/* ========================================================================= */

.vu-meters-container {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  padding: 6px 10px !important;
  background: rgba(15, 23, 42, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  margin-top: 6px !important;
  flex-shrink: 0 !important;
}

.vu-bar-wrapper {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
}

.vu-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  font-weight: 700;
  color: #38bdf8;
  width: 12px;
  text-align: center;
}

.vu-meter-track {
  position: relative;
  flex: 1 1 auto;
  height: 6px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 3px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.6);
}

.vu-level-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #10b981 0%, #10b981 65%, #f59e0b 85%, #ef4444 100%);
  transition: width 0.04s ease-out;
}

.vu-peak-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ffffff;
  box-shadow: 0 0 4px #ffffff;
  border-radius: 1px;
  pointer-events: none;
  transition: left 0.02s linear;
}

.vu-db-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  color: #94a3b8;
  width: 44px;
  text-align: right;
}

.vu-status-cluster {
  display: flex;
  justify-content: flex-end;
  margin-top: 2px;
}

.vu-clip-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #10b981;
  letter-spacing: 0.5px;
}

/* Light Theme Harmonization */
body.theme-light .visualizer-controls-bar {
  background: rgba(241, 245, 249, 0.8) !important;
  border-color: rgba(203, 213, 225, 0.8) !important;
}

body.theme-light .viz-pill-trigger {
  background: #ffffff;
  border-color: rgba(99, 102, 241, 0.4);
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

body.theme-light .viz-pill-popover-menu {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(203, 213, 225, 0.9);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

body.theme-light .viz-popover-option {
  color: #334155;
}

body.theme-light .viz-popover-option:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #1e1b4b;
}

body.theme-light .viz-settings-drawer {
  background: rgba(255, 255, 255, 0.95);
  border-bottom-color: rgba(203, 213, 225, 0.8);
}

body.theme-light .viz-drawer-label {
  color: #334155;
}

body.theme-light .vu-meters-container {
  background: rgba(241, 245, 249, 0.8) !important;
  border-color: rgba(203, 213, 225, 0.8) !important;
}
```

---

### Step 1.3: Canvas Graticule Grid & Peak-Hold Decay in `media_deck_visualizer_feature.js`
In [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js):

1. **Add Peak-Hold State Variables (lines 645-660):**
```javascript
// Studio Peak-Hold Decay State Machine
let leftPeakVal = 0;
let rightPeakVal = 0;
let leftPeakHoldTime = 0;
let rightPeakHoldTime = 0;
let peakDecayRate = 0.03; // Normal studio decay rate
let isGraticuleEnabled = true;
```

2. **Implement Subpixel-Aligned Acoustic Graticule Drawing Function:**
```javascript
/**
 * Renders subtle acoustic frequency octaves and decibel gridlines directly on the canvas.
 * Subpixel +0.5 offset prevents blurry lines on Retina/High-DPI displays.
 */
function renderCanvasGraticule(ctx, width, height, isLightTheme = false) {
  if (!isGraticuleEnabled) return;

  ctx.save();
  ctx.lineWidth = 1;

  // Horizontal dB grid lines: -12dB (75% height), -24dB (50% height), -36dB (25% height)
  const dbLines = [
    { ratio: 0.25, label: '-12dB' },
    { ratio: 0.50, label: '-24dB' },
    { ratio: 0.75, label: '-36dB' }
  ];

  ctx.strokeStyle = isLightTheme ? 'rgba(15, 23, 42, 0.08)' : 'rgba(99, 102, 241, 0.12)';
  ctx.setLineDash([3, 4]);

  for (const line of dbLines) {
    const y = Math.floor(height * line.ratio) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Vertical Frequency octave ticks: 60Hz, 250Hz, 1kHz, 4kHz, 16kHz
  // Corresponding to standard 32-band log distribution
  const freqTicks = [0.08, 0.28, 0.50, 0.72, 0.92];
  ctx.strokeStyle = isLightTheme ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.08)';
  ctx.setLineDash([2, 5]);

  for (const xRatio of freqTicks) {
    const x = Math.floor(width * xRatio) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  ctx.restore();
}
```

3. **Call Graticule Inside `renderVisualizerFrame`:**
Immediately after background clearing and before drawing the active effect (lines 1204-1206):
```javascript
ctx.fillStyle = 'rgba(8, 11, 17, 0.35)';
ctx.fillRect(0, 0, width, height);

// Draw calibration graticule background
renderCanvasGraticule(ctx, width, height, options.isLightTheme);
```

4. **Enhance Stereo VU Meters Update Routine with Peak Decay:**
In `renderVisualizerFrame` / VU meter calculation (around lines 1350-1420):
```javascript
const now = timestamp || Date.now();

// Left channel peak hold & decay
if (leftPercent >= leftPeakVal) {
  leftPeakVal = leftPercent;
  leftPeakHoldTime = now + 400; // Hold for 400ms
} else if (now > leftPeakHoldTime) {
  leftPeakVal = Math.max(0, leftPeakVal - peakDecayRate * 100);
}

// Right channel peak hold & decay
if (rightPercent >= rightPeakVal) {
  rightPeakVal = rightPercent;
  rightPeakHoldTime = now + 400; // Hold for 400ms
} else if (now > rightPeakHoldTime) {
  rightPeakVal = Math.max(0, rightPeakVal - peakDecayRate * 100);
}

// Update DOM indicators
const elPeakLeft = doc.getElementById('vuPeakLeft');
const elPeakRight = doc.getElementById('vuPeakRight');
if (elPeakLeft) elPeakLeft.style.left = `${Math.min(99, leftPeakVal)}%`;
if (elPeakRight) elPeakRight.style.left = `${Math.min(99, rightPeakVal)}%`;
```

---

### Step 1.4: Wire Pill Selector & Settings Drawer in `dashboard/dashboard.js`
In [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js):

1. **Pill Selector Popover Interactivity:**
   - On `#btnVizPillTrigger` click, toggle `#vizPillPopoverMenu` `hidden` attribute and update `aria-expanded`.
   - On popover option click:
     - Read `data-effect` attribute.
     - Call `setVisualizerMode(effect)`.
     - Update trigger label `#vizPillLabel` and icon `#vizPillIcon`.
     - Update underlying hidden `#selectVizEffect.value = effect` and dispatch `change` event.
     - Close popover.
   - On outside click or `Escape` key, close popover.
2. **Settings Drawer Interactivity:**
   - On `#btnVizSettingsToggle` click, toggle `#vizSettingsDrawer` `hidden` attribute and update `aria-expanded`.
   - On `#btnVizDrawerClose` click or `Escape` key, close drawer.
   - On `#chkGraticuleToggle` change, update `setGraticuleEnabled(e.target.checked)`.
   - On `.viz-seg-btn` click, set peak decay rate (`slow` = 0.015, `normal` = 0.03, `fast` = 0.06).

---

## 🔒 5. Constraints & Constitutional Invariants

1. **Zero-Expansion Container Boundary:** Under NO circumstances may the outer dimensions, margin, padding, or bento grid spans of `#heroAudioLabStatus` (`bento-span-4 bento-row-span-2`) expand vertically or horizontally. All newly introduced elements (HUD, popover menu, settings drawer) must fit strictly within the internal canvas chassis or use anchored absolute/fixed positioning.
2. **100% W3C Trusted Types Compliance:** All DOM elements must be constructed using `document.createElement`, `classList`, `setAttribute`, and `textContent`. ZERO usage of `innerHTML` or `insertAdjacentHTML` with unvetted strings.
3. **60 FPS Performance & Memory Stability:**
   - Graticule paths must use minimal path operations without allocating new objects or arrays inside the per-frame render loop.
   - All event listeners on popover and drawer must be bound idempotently with `!el.__bound` guards.
4. **WCAG 2.1 AA Accessibility:**
   - Custom pill dropdown must implement full WAI-ARIA `listbox` pattern: `aria-haspopup="listbox"`, `aria-expanded`, `role="option"`, `aria-selected`, and keyboard ArrowUp/ArrowDown navigation.
   - All buttons must possess distinct, descriptive `aria-label` tags.

---

## 📦 6. Deliverables Manifest

| S.No | Deliverable | File Path | Scope of Changes |
| :--- | :--- | :--- | :--- |
| 1 | **Dashboard Markup** | `dashboard/dashboard.html` | Replaced crowded controls bar with Pill Selector, Canvas HUD, Settings Drawer, and Dual Peak-Hold VU meters |
| 2 | **Styles & Layout** | `dashboard/styles/media.css` | Added styling for Pill Selector, Popover Menu, Canvas HUD, Settings Drawer, and Peak-Hold Indicators |
| 3 | **Visualizer Engine** | `src/dashboard/features/media_deck_visualizer_feature.js` | Added acoustic graticule drawing, peak decay state machine, and pill/drawer sync methods |
| 4 | **Dashboard Controller** | `dashboard/dashboard.js` | Added click-outside, keyboard navigation, and drawer toggle event bindings |
| 5 | **Verification Suite** | `tests/test_visualizer_phase_01_ergonomics.js` | Standalone automated test verifying DOM structure, styles, peak decay logic, and Trusted Types |

---

## 🚦 7. Verification Gate & Acceptance Criteria

Execute the automated test suite to certify Phase 1:

```powershell
node tests/test_visualizer_phase_01_ergonomics.js
node tests/test_visualizer_toolbar_buttons_fix.js
node tests/test_visualizer_compact_fullscreen_embed.js
```

### Acceptance Criteria:
- [ ] Bounding box of `#heroAudioLabStatus` does not increase in height or width.
- [ ] Compact glass pill trigger displays active visualizer mode with smooth popover dropdown.
- [ ] Clicking an effect in popover menu immediately updates `#selectVizEffect` and switches visualizer mode.
- [ ] Acoustic graticule grid lines (60Hz, 250Hz, 1kHz, 4kHz, 16kHz, dB ticks) render smoothly at 60 FPS.
- [ ] Settings drawer slides open on gear button click and closes smoothly via button or Escape key.
- [ ] VU meters display floating peak indicators (`#vuPeakLeft`, `#vuPeakRight`) with calibrated falloff decay.
- [ ] 100% W3C Trusted Types safe: 0 instances of `innerHTML`.
- [ ] All automated tests exit with code 0.
