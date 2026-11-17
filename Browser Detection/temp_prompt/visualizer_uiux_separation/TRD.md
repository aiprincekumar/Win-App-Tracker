# Real-Time Spectrum Visualizer UI/UX Separation: Technical Requirements Document (TRD)

> **Document Type:** Technical Architecture & Interface Specification  
> **Workspace Container:** `temp_prompt/visualizer_uiux_separation/`  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Date:** 2026-11-17  

---

## 🏛️ 1. Architecture Overview (HLD & LLD)

### 1.1 High-Level Architecture (Tab B Grid Topology)
The layout in `dashboard/dashboard.html` for Tab B (`#paneMedia`) uses a 12-column Bento CSS grid (`.bento-grid`).

```
+-----------------------------------------------------------------------------------+
| Multi-Tab Media Deck Container (#multiTabMediaDeckContainer, span-12)             |
+---------------------------------------------------+-------------------------------+
| Live Media Player Status Hero Card                | Real-Time Spectrum Visualizer |
| (#heroMediaPlayerCard)                            | & Offscreen DSP Status Card   |
|                                                   | (#heroAudioLabStatus)         |
| bento-span-8, bento-row-span-2                    | bento-span-4, bento-row-span-2|
|                                                   | - Visualizer Header & DSP Dot |
| - Media Metadata & Artwork                        | - 32-Band FFT / Waveform Btns |
| - Playback & Volume Sliders                       | - Canvas (600x120)            |
| - Primary Transport & Fullscreen Controls         | - L/R VU Meters & 0dB Badge   |
+---------------------------------------------------+-------------------------------+
| Dedicated Master Studio Audio Deck (#heroAudioEqCard, bento-span-12)              |
| - Header: Preset Dropdown & Reset Button                                          |
| - Tier 1: Master Volume Boost (0-200%) + Vocal / Night / Audio-Only Toggles       |
| - Tier 2: 5-Band Graphic Equalizer Vertical Sliders (60Hz, 250Hz, 1k, 4k, 16kHz) |
+-----------------------------------------------------------------------------------+
| Media Playback History Table (span-12)                                            |
+-----------------------------------------------------------------------------------+
```

### 1.2 Low-Level Component Hierarchy

#### Dedicated Visualizer Bento Card:
```html
<div id="heroAudioLabStatus" class="audio-lab-widget visualizer-hero-card glass-card bento-card liquid-glass-card bento-span-4 bento-row-span-2">
  <div class="visualizer-card-header">
    <div class="visualizer-title-group">
      <span class="visualizer-icon">🎛️</span>
      <h3 id="txtVisualizerTitle" class="visualizer-title" data-i18n="visualizer_title">Real-Time Spectrum Visualizer</h3>
    </div>
    <div class="audio-lab-status-note">
      <span class="status-indicator-dot online"></span>
      <span id="audioLabStatusText" class="audio-lab-note" data-i18n="audiolab_dsp_active">Offscreen DSP Active</span>
    </div>
  </div>
  <div class="visualizer-card-body">
    <div class="visualizer-controls-bar">
      <button type="button" id="btnVizModeBars" class="btn-viz-mode active" data-viz-mode="bars" data-i18n="visualizer_mode_bars">32-Band FFT</button>
      <button type="button" id="btnVizModeWave" class="btn-viz-mode" data-viz-mode="wave" data-i18n="visualizer_mode_wave">Waveform</button>
    </div>
    <div class="visualizer-canvas-container">
      <canvas id="canvasAudioVisualizer" width="600" height="120" role="img" aria-label="Audio frequency visualizer"></canvas>
    </div>
    <div class="vu-meters-container" role="region" aria-label="Audio Level Meters">
      <div class="vu-bar-wrapper">
        <span class="vu-label">L</span>
        <div class="vu-meter"><div id="vuBarLeft" class="vu-level" style="width: 0%;"></div></div>
        <span id="vuValLeft" class="vu-db-text">-∞dB</span>
      </div>
      <div class="vu-bar-wrapper">
        <span class="vu-label">R</span>
        <div class="vu-meter"><div id="vuBarRight" class="vu-level" style="width: 0%;"></div></div>
        <span id="vuValRight" class="vu-db-text">-∞dB</span>
      </div>
      <span id="vuClipIndicator" class="vu-clip-badge">0dB OK</span>
    </div>
  </div>
</div>
```

#### Consolidated Studio Equalizer Card (`#heroAudioEqCard`):
```html
<div id="heroAudioEqCard" class="audio-eq-widget glass-card bento-card liquid-glass-card bento-span-12">
  <!-- Equalizer Card Header -->
  <div class="eq-card-header">
    <div class="eq-title-group">
      <span class="eq-icon">🎚️</span>
      <div class="eq-title-meta">
        <h4 id="lblAudioEqTitle" class="eq-heading" data-i18n="audiolab_eq_title">Studio Audio Deck & Graphic Equalizer</h4>
        <span class="eq-badge-specs">Master Gain Boost • Audio Enhancements • 5-Band Biquad Peaking Filters</span>
      </div>
    </div>
    <div class="audio-lab-badges">
      <span id="audioLabPresetBadge" class="badge badge-preset">Flat</span>
      <span id="audioLabVocalBadge" class="badge badge-feature">Vocal: OFF</span>
      <span id="audioLabNightBadge" class="badge badge-feature">Night: OFF</span>
    </div>
    <div class="eq-actions-group">
      <select id="audioEqPresetSelect" class="eq-preset-dropdown" aria-label="Equalizer Preset">...</select>
      <button type="button" id="btnResetEq" class="btn-reset-eq" aria-label="Reset Equalizer" data-i18n="audiolab_reset_eq">🔄 Reset EQ</button>
    </div>
  </div>

  <!-- Studio Deck Body: Gain Shaping & Enhancements -->
  <div class="eq-studio-top-deck">
    <!-- Master Boost Slider -->
    <div class="audio-boost-control">
      <div class="boost-label-row">
        <div class="boost-title-wrap">
          <span class="boost-icon">🔊</span>
          <span id="lblAudioMasterBoost" class="boost-label" data-i18n="audiolab_master_boost">Master Volume Boost</span>
        </div>
        <span id="heroAudioBoostVal" class="boost-value">100%</span>
      </div>
      <input type="range" id="heroAudioBoostSlider" min="0" max="200" step="5" value="100" class="audio-boost-slider" aria-label="Master Volume Boost" role="slider" aria-valuemin="0" aria-valuemax="200" aria-valuenow="100" />
      <div class="boost-scale-marks">
        <span data-i18n="audiolab_boost_min">0%</span>
        <span>50%</span>
        <span class="mark-normal" data-i18n="audiolab_boost_normal">100% (Normal)</span>
        <span>150%</span>
        <span class="mark-max" data-i18n="audiolab_boost_max">200% (Max)</span>
      </div>
    </div>

    <!-- Audio Enhancement Toggles -->
    <div class="audio-enhancements-row">
      <!-- Vocal Clarity -->
      <div class="enhancement-chip">
        <label class="switch-toggle" for="toggleVocalClarity">
          <input type="checkbox" id="toggleVocalClarity" role="switch" aria-label="Vocal Clarity" />
          <span class="slider-round"></span>
        </label>
        <span id="lblAudioVocalTitle" class="enhancement-title" data-i18n="audiolab_vocal_title">🗣️ Vocal Clarity</span>
      </div>
      <!-- Night Shield -->
      <div class="enhancement-chip">
        <label class="switch-toggle" for="toggleNightShield">
          <input type="checkbox" id="toggleNightShield" role="switch" aria-label="Night Shield" />
          <span class="slider-round"></span>
        </label>
        <span id="lblAudioNightTitle" class="enhancement-title" data-i18n="audiolab_night_title">🌙 Night Shield</span>
      </div>
      <!-- Audio-Only Mode -->
      <div class="enhancement-chip">
        <label class="switch-toggle" for="toggleAudioOnlyMode">
          <input type="checkbox" id="toggleAudioOnlyMode" role="switch" aria-label="Audio-Only Mode" />
          <span class="slider-round"></span>
        </label>
        <span id="lblAudioOnlyTitle" class="enhancement-title" data-i18n="audiolab_audio_only_title">📻 Audio-Only Mode</span>
      </div>
    </div>
  </div>

  <!-- 5-Band Vertical Frequency Sliders Grid -->
  <div class="eq-bands-grid" role="region" aria-label="Equalizer Frequency Bands">
    <!-- Bands 60, 250, 1000, 4000, 16000 -->
  </div>
</div>
```

---

## 🔒 2. Data Contracts & DOM Element Manifest (18 Critical IDs)

All 18 DOM elements must be strictly preserved with identical IDs and ARIA attributes:

| Element ID | Tag | Purpose | Expected ARIA / Attributes |
| :--- | :--- | :--- | :--- |
| `heroAudioLabStatus` | `div` | Dedicated Visualizer & DSP Status Card | `class="... bento-span-4 bento-row-span-2"` |
| `txtVisualizerTitle` | `h3/span` | Visualizer Section Heading | `data-i18n="visualizer_title"` |
| `audioLabStatusText` | `span` | Offscreen DSP Telemetry Status Text | `data-i18n="audiolab_dsp_active"` |
| `btnVizModeBars` | `button` | 32-Band FFT Mode Switch | `data-viz-mode="bars"`, `data-i18n="visualizer_mode_bars"` |
| `btnVizModeWave` | `button` | Oscilloscope Waveform Mode Switch | `data-viz-mode="wave"`, `data-i18n="visualizer_mode_wave"` |
| `canvasAudioVisualizer`| `canvas` | Spectrum Analysis Canvas | `width="600" height="120" role="img"` |
| `vuBarLeft` | `div` | Left Channel VU Dynamic Level Bar | `style="width: ...%"` |
| `vuBarRight` | `div` | Right Channel VU Dynamic Level Bar | `style="width: ...%"` |
| `vuValLeft` | `span` | Left Channel Numeric dB Readout | Text content `-∞dB` to `0dB` |
| `vuValRight` | `span` | Right Channel Numeric dB Readout | Text content `-∞dB` to `0dB` |
| `vuClipIndicator` | `span` | 0dB Clipping Status Badge | `0dB OK` / `CLIP` |
| `heroAudioEqCard` | `div` | Consolidated Studio Equalizer Deck | `class="... bento-span-12"` |
| `heroAudioBoostSlider`| `input` | Master Volume Boost Slider | `role="slider" min="0" max="200" step="5" value="100"` |
| `heroAudioBoostVal` | `span` | Boost Percentage Readout | Text content `100%` |
| `audioLabPresetBadge` | `span` | Active EQ Preset Badge | Dynamic text `Flat`, `Bass Boost`, etc. |
| `audioLabVocalBadge` | `span` | Vocal Clarity Status Badge | Dynamic text `Vocal: ON/OFF` |
| `audioLabNightBadge` | `span` | Night Shield Status Badge | Dynamic text `Night: ON/OFF` |
| `toggleVocalClarity` | `input` | Vocal Clarity Checkbox Switch | `role="switch"` |
| `toggleNightShield` | `input` | Night Shield Checkbox Switch | `role="switch"` |
| `toggleAudioOnlyMode` | `input` | Audio-Only Mode Checkbox Switch | `role="switch"` |

---

## 🛡️ 3. Security, Performance & CSP Controls

1. **Manifest V3 Strict CSP:** Zero inline script tags, zero inline event attributes (`onclick`, `onchange`, `oninput`), zero `javascript:` URIs.
2. **Trusted Types & Zero innerHTML:** All DOM manipulations in `dashboard.js` must continue using `textContent`, `setAttribute`, and `classList`.
3. **Canvas Animation Loop Performance:** The `requestAnimationFrame` loop in `dashboard.js` must maintain checks to ensure rendering pauses when media is not playing or when the tab is hidden, preventing unnecessary GPU drain.
