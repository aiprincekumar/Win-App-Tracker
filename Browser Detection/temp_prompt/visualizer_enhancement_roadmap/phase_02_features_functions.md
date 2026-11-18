# Phase 2 Execution Prompt: Visualizer Advanced Audio Features & Interactive Signal Engine
# Task: Clipping Alert, Frame Freeze/Snapshot, Gain Slider, Color Palettes, Test Generator & Musical Telemetry
# Task ID: TASK-VIZ-ROADMAP-PHASE-02
# Architecture Level: Level 4 Execution Subagent Specification

> **Execution Directive for Level 4 Frontend Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` (Dept 01 Product Requirements & Dept 05 Frontend Engineering) and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 05 Frontend Engineering & Audio DSP Engineering.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
> - **Security Standard:** 100% W3C Trusted Types Compliant (Zero `innerHTML` assignments).
> - **Performance Target:** 60 FPS Render Loop (<16.6ms frame budget), Non-blocking Web Worker/DSP math, Zero audio thread degradation.
> - **Spatial Constraint:** STRICT ZERO-EXPANSION of outer widget bounding box (`#heroAudioLabStatus`).

---

## 🎯 1. Objective & Executive Scope

Following the ergonomic refactoring and zero-expansion spatial restructuring accomplished in Phase 1, **Phase 2** elevates the **Real-Time Spectrum Visualizer** from a passive display into an interactive, studio-grade audio analysis and diagnostic instrument.

**Phase 2 Executive Scope:**
1. **Dynamic Overload / Clipping Alert & 1-Click Latch Reset:** Implement a broadcast-standard digital overload indicator on `#vuClipIndicator` that latches into an unmistakable crimson warning state upon detecting 0 dBFS signal clipping, supporting both 1-click manual clearance and an automated 3.5s quiet-decay timer.
2. **Freeze Mode & Instant PNG Snapshot Frame Capture:** Provide an animation pause buffer (`#btnVizFreezeToggle`) allowing detailed acoustic examination of transient peaks, paired with a 1-click snapshot export engine (`#btnVizSnapshot`) that copies high-resolution PNG frames directly to the system clipboard and initiates download fallback.
3. **Interactive Preamp Sensitivity / Gain Multiplier Slider:** Integrate a non-destructive visualizer gain micro-slider (0.2x to 3.0x preamp multiplier) inside the settings drawer, enabling boost of quiet acoustic sources (podcasts, lo-fi streams) without inducing backend audio distortion, persisted in `localStorage`.
4. **Dynamic Color Palette Engine:** Add 5 calibrated hardware themes (Cyberpunk Neon, Emerald Matrix, Sunset Glow, Classic Amber CRT, and Monochrome Glass) that dynamically regenerate canvas linear and radial gradients across all 6 visualizer modes.
5. **Dual Audio Source Engine (Live Media vs Test Signal Generator):** Introduce an on-demand signal generator (1 kHz Sine wave, Pink Noise, and logarithmic 20Hz-20kHz Frequency Sweep Chirp) switchable against live browser media tab telemetry for calibration and demonstration.
6. **Real-Time BPM & Musical Root Note / Pitch Telemetry Pill:** Deploy a lightweight, low-latency pitch and rhythmic onset estimation algorithm calculating musical root key (e.g., `A4 (440Hz)`, `C#3 (138Hz)`) and estimated tempo (`124 BPM`), presented on the canvas HUD overlay.

---

## 📋 2. Prerequisites, Dependencies & Input State

### 2.1 Baseline State & Existing Capabilities
- **Phase 1 Foundations Active:** The streamlined controls bar with compact glass pill selector, sliding settings drawer (`#vizSettingsDrawer`), canvas HUD overlay (`#vizCanvasHud`), and dual peak-hold VU meters are operational in `dashboard/dashboard.html` and `dashboard/styles/media.css`.
- **Active Visualizer Module:** `src/dashboard/features/media_deck_visualizer_feature.js` manages audio FFT telemetry arrays (`freqs[32]` and `wave[32]`) and canvas rendering.
- **Passing Verification Gates:**
  - `tests/test_visualizer_phase_01_ergonomics.js`
  - `tests/test_visualizer_toolbar_buttons_fix.js`
  - `tests/test_visualizer_compact_fullscreen_embed.js`

### 2.2 Functional Invariants
- **Non-Destructive Audio Processing:** The visualizer gain multiplier and test signals must operate exclusively within the visualization subsystem and MUST NEVER modify the actual host OS audio playback volume, introduce audible clipping to media streams, or interfere with background tab audio capture.

---

## 📂 3. Technical Context & File Anchors

| Component | Target File | Line Anchor | Responsibility |
| :--- | :--- | :--- | :--- |
| **HTML Controls** | [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L750-L815) | L750-L815 | Settings drawer sliders, palette radio pills, freeze/snapshot buttons, clipping indicator |
| **Styles & Themes** | [`dashboard/styles/media.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media.css#L1250-L1480) | L1250-L1480 | Latching clipping badge animations, gain slider track, palette swatch styling, HUD toast |
| **Hero Player Tokens** | [`dashboard/styles/media/hero_player.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media/hero_player.css#L1-L150) | L1-L150 | Liquid glass elevation tokens, color variables, pulse keyframes |
| **Audio DSP Engine** | [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L630-L750) | L630-L750 | Preamp gain, test signal synthesis, BPM detection, palette color definitions |
| **Canvas Loop & Export**| [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L1185-L1450) | L1185-L1450 | Frame freeze gate, canvas snapshot export, dynamic palette gradient application |
| **Dashboard Controller** | [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L430-L510) | L430-L510 | Clipboard API integration, clip latch reset click handler, drawer input wiring |

---

## 🛠️ 4. Surgical Step-by-Step Implementation Instructions

### Step 2.1: Dynamic Overload / Clipping Alert Engine & 1-Click Latch Reset
In [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L805-L815), configure `#vuClipIndicator` as an interactive, accessible button:

```html
<div class="vu-status-cluster">
  <button type="button" id="vuClipIndicator" class="vu-clip-badge" title="Click to Reset Clipping Indicator" aria-label="Audio Overload Indicator. Status: OK. Click to reset." tabindex="0">
    <span class="vu-clip-dot" aria-hidden="true"></span>
    <span id="vuClipText" class="vu-clip-text">0dB OK</span>
  </button>
</div>
```

In [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js):
1. **Clipping State Tracking:**
```javascript
let isClippingLatched = false;
let clippingLastTriggerTime = 0;
const CLIPPING_AUTO_DECAY_MS = 3500; // Auto-resets after 3.5s of clean audio

function resetClippingIndicator(doc) {
  isClippingLatched = false;
  const d = doc || (typeof document !== 'undefined' ? document : null);
  if (!d) return;
  const indicator = d.getElementById('vuClipIndicator');
  const textEl = d.getElementById('vuClipText');
  if (indicator) {
    indicator.classList.remove('is-clipped');
    indicator.setAttribute('aria-label', 'Audio Overload Indicator. Status: OK.');
  }
  if (textEl) {
    textEl.textContent = '0dB OK';
  }
}
```

2. **Trigger Logic Inside Audio Frame Evaluation:**
```javascript
// Check for digital overload (amplitude >= 0.999 or dB >= 0)
const isCurrentlyOverloading = (leftVal >= 0.999 || rightVal >= 0.999 || maxDb >= 0.0);

if (isCurrentlyOverloading) {
  isClippingLatched = true;
  clippingLastTriggerTime = now;
  const indicator = doc.getElementById('vuClipIndicator');
  const textEl = doc.getElementById('vuClipText');
  if (indicator && !indicator.classList.contains('is-clipped')) {
    indicator.classList.add('is-clipped');
    indicator.setAttribute('aria-label', 'Warning: Audio signal is clipping! Click to reset.');
  }
  if (textEl) {
    textEl.textContent = 'CLIP OVERLOAD';
  }
} else if (isClippingLatched && (now - clippingLastTriggerTime > CLIPPING_AUTO_DECAY_MS)) {
  // Auto-decay if signal remains below clipping for 3.5s
  resetClippingIndicator(doc);
}
```

3. **Wire 1-Click Manual Reset in `dashboard/dashboard.js`:**
```javascript
const btnClip = document.getElementById('vuClipIndicator');
if (btnClip && !btnClip.__clipBound) {
  btnClip.__clipBound = true;
  btnClip.addEventListener('click', () => {
    mediaDeckFeature.resetClippingIndicator(document);
  });
  btnClip.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      mediaDeckFeature.resetClippingIndicator(document);
    }
  });
}
```

---

### Step 2.2: Freeze Mode & Instant PNG Snapshot Frame Capture Engine
In [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L760-L790), add Freeze and Snapshot buttons to `.viz-actions-group`:

```html
<!-- Freeze Frame Capture Button -->
<button type="button" id="btnVizFreezeToggle" class="btn-viz-action-icon" title="Freeze Visualizer Frame" aria-label="Freeze Visualizer Frame" aria-pressed="false" tabindex="0">
  <svg class="viz-action-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"></path>
  </svg>
</button>

<!-- Snapshot Export Button -->
<button type="button" id="btnVizSnapshot" class="btn-viz-action-icon" title="Copy Snapshot to Clipboard" aria-label="Copy Visualizer Snapshot to Clipboard" tabindex="0">
  <svg class="viz-action-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
</button>
```

In [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js):
1. **Freeze State Management:**
```javascript
let isVisualizerFrozen = false;

function toggleVisualizerFreeze(options = {}) {
  isVisualizerFrozen = !isVisualizerFrozen;
  const doc = options.doc || (typeof document !== 'undefined' ? document : null);
  if (doc) {
    const btn = doc.getElementById('btnVizFreezeToggle');
    const hud = doc.getElementById('vizCanvasHud');
    if (btn) {
      btn.setAttribute('aria-pressed', String(isVisualizerFrozen));
      btn.classList.toggle('active', isVisualizerFrozen);
    }
    let freezeBadge = doc.getElementById('vizHudFreezeBadge');
    if (isVisualizerFrozen) {
      if (!freezeBadge && hud) {
        freezeBadge = doc.createElement('span');
        freezeBadge.id = 'vizHudFreezeBadge';
        freezeBadge.className = 'viz-hud-badge viz-hud-freeze';
        freezeBadge.textContent = '❄️ FROZEN';
        hud.querySelector('.viz-hud-telemetry-cluster')?.appendChild(freezeBadge);
      }
    } else if (freezeBadge) {
      freezeBadge.remove();
    }
  }
  return isVisualizerFrozen;
}
```

2. **In `renderVisualizerFrame` Loop:**
```javascript
// Freeze guard: if frozen, preserve current canvas pixels and exit early
if (isVisualizerFrozen) {
  return { rendered: true, frozen: true };
}
```

3. **Snapshot Export Engine:**
```javascript
/**
 * Captures the current visualizer canvas state as a PNG blob.
 * Copies directly to system clipboard, falling back to local file download.
 */
async function captureVisualizerSnapshot(options = {}) {
  if (!visualizerCanvas) return { success: false, error: 'Canvas not initialized' };

  try {
    const blob = await new Promise(resolve => visualizerCanvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Canvas blob generation failed');

    let copiedToClipboard = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        copiedToClipboard = true;
      } catch (clipErr) {
        // Fallback to download on clipboard permission denial
        copiedToClipboard = false;
      }
    }

    // Trigger file download fallback or secondary save
    const doc = options.doc || (typeof document !== 'undefined' ? document : null);
    if (!copiedToClipboard && doc) {
      const url = URL.createObjectURL(blob);
      const a = doc.createElement('a');
      a.href = url;
      a.download = `sentinel-spectrum-${Date.now()}.png`;
      doc.body.appendChild(a);
      a.click();
      doc.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    // Display temporary HUD confirmation toast
    showHudToast(doc, copiedToClipboard ? '📸 Snapshot Copied to Clipboard!' : '📥 Snapshot Downloaded!');
    return { success: true, copiedToClipboard };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
```

---

### Step 2.3: Interactive Preamp Sensitivity / Gain Multiplier Slider
In [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html) inside `#vizSettingsDrawer`:

```html
<!-- Visualizer Preamp Sensitivity Slider -->
<div class="viz-drawer-row">
  <div class="viz-drawer-label-group">
    <span class="viz-drawer-label">Visualizer Preamp Gain</span>
    <span class="viz-drawer-sublabel">Non-destructive signal magnification</span>
  </div>
  <div class="viz-slider-group">
    <input type="range" id="rangeVizGain" min="0.2" max="3.0" step="0.1" value="1.0" class="viz-gain-range" aria-label="Visualizer Sensitivity Gain Multiplier">
    <span id="lblVizGainVal" class="viz-gain-val">1.0x</span>
  </div>
</div>
```

In [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js):
```javascript
let visualizerGain = 1.0;

// Restore saved gain from localStorage
try {
  const savedGain = localStorage.getItem('sentinel_viz_gain');
  if (savedGain) {
    const parsed = parseFloat(savedGain);
    if (parsed >= 0.2 && parsed <= 3.0) visualizerGain = parsed;
  }
} catch (e) { /* LocalStorage sandboxing fallback */ }

function setVisualizerGain(gain, options = {}) {
  const num = Math.max(0.2, Math.min(3.0, Number(gain) || 1.0));
  visualizerGain = Math.round(num * 10) / 10;
  
  try {
    localStorage.setItem('sentinel_viz_gain', String(visualizerGain));
  } catch (e) {}

  const doc = options.doc || (typeof document !== 'undefined' ? document : null);
  if (doc) {
    const slider = doc.getElementById('rangeVizGain');
    const label = doc.getElementById('lblVizGainVal');
    if (slider && parseFloat(slider.value) !== visualizerGain) {
      slider.value = String(visualizerGain);
    }
    if (label) {
      label.textContent = `${visualizerGain.toFixed(1)}x`;
    }
  }
  return visualizerGain;
}
```

**Gain Application in Frequency & Waveform Processing:**
```javascript
// In synthesizeAudioTelemetry or live telemetry feed:
const amplifiedFreq = Math.min(1.0, rawFreq * visualizerGain);
const amplifiedWave = Math.min(1.0, (rawWave - 0.5) * visualizerGain + 0.5);
```

---

### Step 2.4: Multi-Theme Dynamic Color Palette Engine
Define the 5 calibrated color palettes in [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js):

```javascript
const VIZ_PALETTES = {
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    primary: '#ec4899',   // Neon Pink
    secondary: '#06b6d4', // Cyan
    accent: '#8b5cf6',    // Violet
    gradientStops: [
      { offset: 0.0, color: '#ec4899' },
      { offset: 0.5, color: '#8b5cf6' },
      { offset: 1.0, color: '#06b6d4' }
    ]
  },
  matrix: {
    id: 'matrix',
    name: 'Emerald Matrix',
    primary: '#10b981',   // Emerald
    secondary: '#059669', // Deep Jade
    accent: '#34d399',    // Neon Mint
    gradientStops: [
      { offset: 0.0, color: '#34d399' },
      { offset: 0.5, color: '#10b981' },
      { offset: 1.0, color: '#047857' }
    ]
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Glow',
    primary: '#f97316',   // Warm Tangerine
    secondary: '#ef4444', // Crimson Flame
    accent: '#fbbf24',    // Golden Amber
    gradientStops: [
      { offset: 0.0, color: '#ef4444' },
      { offset: 0.5, color: '#f97316' },
      { offset: 1.0, color: '#fbbf24' }
    ]
  },
  crt_amber: {
    id: 'crt_amber',
    name: 'Classic Amber CRT',
    primary: '#f59e0b',   // Phosphor Amber
    secondary: '#d97706', // Ochre
    accent: '#78350f',    // Deep Sepia
    gradientStops: [
      { offset: 0.0, color: '#fbbf24' },
      { offset: 0.6, color: '#d97706' },
      { offset: 1.0, color: '#78350f' }
    ]
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome Glass',
    primary: '#f8fafc',   // Crisp White
    secondary: '#94a3b8', // Silver Slate
    accent: '#38bdf8',    // Ice Blue
    gradientStops: [
      { offset: 0.0, color: '#ffffff' },
      { offset: 0.5, color: '#94a3b8' },
      { offset: 1.0, color: '#334155' }
    ]
  }
};

let currentPaletteId = 'cyberpunk';

function setVisualizerPalette(paletteId, options = {}) {
  if (!VIZ_PALETTES[paletteId]) return currentPaletteId;
  currentPaletteId = paletteId;

  try {
    localStorage.setItem('sentinel_viz_palette', paletteId);
  } catch (e) {}

  const doc = options.doc || (typeof document !== 'undefined' ? document : null);
  if (doc) {
    const swatches = doc.querySelectorAll('.viz-palette-swatch');
    swatches.forEach(swatch => {
      const isActive = swatch.getAttribute('data-palette') === paletteId;
      swatch.classList.toggle('active', isActive);
      swatch.setAttribute('aria-checked', String(isActive));
    });
  }
  return currentPaletteId;
}
```

In the settings drawer of [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html):
```html
<div class="viz-drawer-row">
  <span class="viz-drawer-label">Color Palette</span>
  <div class="viz-palette-pills" role="radiogroup" aria-label="Visualizer Color Themes">
    <button type="button" role="radio" class="viz-palette-swatch active" data-palette="cyberpunk" title="Cyberpunk Neon" aria-checked="true" style="--swatch-color: #ec4899;"></button>
    <button type="button" role="radio" class="viz-palette-swatch" data-palette="matrix" title="Emerald Matrix" aria-checked="false" style="--swatch-color: #10b981;"></button>
    <button type="button" role="radio" class="viz-palette-swatch" data-palette="sunset" title="Sunset Glow" aria-checked="false" style="--swatch-color: #f97316;"></button>
    <button type="button" role="radio" class="viz-palette-swatch" data-palette="crt_amber" title="Classic Amber CRT" aria-checked="false" style="--swatch-color: #f59e0b;"></button>
    <button type="button" role="radio" class="viz-palette-swatch" data-palette="monochrome" title="Monochrome Glass" aria-checked="false" style="--swatch-color: #e2e8f0;"></button>
  </div>
</div>
```

---

### Step 2.5: Dual Audio Source Engine: Live Media vs Test Signal Generator
In [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js):

```javascript
let audioSourceMode = 'live'; // 'live' | 'test_sine' | 'test_noise' | 'test_chirp'

function generateTestSignalTelemetry(type, timestamp = Date.now()) {
  const t = timestamp * 0.001;
  const freqs = new Float32Array(NUM_BANDS);
  const wave = new Float32Array(NUM_BANDS);

  if (type === 'test_sine') {
    // Pure 1kHz test tone concentrated at band 16
    for (let i = 0; i < NUM_BANDS; i++) {
      const dist = Math.abs(i - 16);
      freqs[i] = Math.max(0, 0.95 - dist * 0.25);
      wave[i] = 0.5 + 0.45 * Math.sin(t * 20 + i * 0.4);
    }
  } else if (type === 'test_noise') {
    // Pink Noise (1/f spectral density)
    for (let i = 0; i < NUM_BANDS; i++) {
      const pinkWeight = 1.0 / Math.sqrt(i + 1);
      const randomJitter = 0.7 + Math.random() * 0.3;
      freqs[i] = Math.min(1.0, pinkWeight * randomJitter);
      wave[i] = 0.5 + (Math.random() - 0.5) * 0.6;
    }
  } else if (type === 'test_chirp') {
    // 20Hz-20kHz Logarithmic Frequency Sweep (repeats every 3.5s)
    const sweepProgress = (t % 3.5) / 3.5;
    const activeBand = Math.floor(sweepProgress * NUM_BANDS);
    for (let i = 0; i < NUM_BANDS; i++) {
      const dist = Math.abs(i - activeBand);
      freqs[i] = Math.max(0, 1.0 - dist * 0.3);
      wave[i] = 0.5 + 0.45 * Math.sin(t * (10 + sweepProgress * 50) + i);
    }
  }

  return { freqs, wave, left: freqs[8], right: freqs[16] };
}
```

In the settings drawer, add Source toggle buttons:
```html
<div class="viz-drawer-row">
  <span class="viz-drawer-label">Signal Source</span>
  <div class="viz-btn-segmented" role="group" aria-label="Audio Input Source">
    <button type="button" class="viz-seg-btn active" data-source="live">Live Tab</button>
    <button type="button" class="viz-seg-btn" data-source="test_sine">1kHz Sine</button>
    <button type="button" class="viz-seg-btn" data-source="test_noise">Pink Noise</button>
    <button type="button" class="viz-seg-btn" data-source="test_chirp">Sweep Chirp</button>
  </div>
</div>
```

---

### Step 2.6: Real-Time BPM & Musical Root Note / Pitch Telemetry Pill
In [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js):

```javascript
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let lastBpmEstimate = 120;
let lastRootNoteEstimate = 'A4';
let lastMusicalCalcTime = 0;

// Onset energy history for rhythmic tempo estimation
const onsetHistory = [];
const ONSET_HISTORY_SIZE = 40;

function estimateMusicalTelemetry(freqs, timestamp = Date.now()) {
  if (!freqs || freqs.length < NUM_BANDS) return { note: 'A4', bpm: 120 };

  // Run calculation at 4Hz (every 250ms) to ensure lightweight 60 FPS performance
  if (timestamp - lastMusicalCalcTime < 250) {
    return { note: lastRootNoteEstimate, bpm: lastBpmEstimate };
  }
  lastMusicalCalcTime = timestamp;

  // 1. Root Note estimation: Find dominant peak frequency bin
  let peakVal = 0;
  let peakBin = 0;
  for (let i = 1; i < NUM_BANDS; i++) {
    if (freqs[i] > peakVal) {
      peakVal = freqs[i];
      peakBin = i;
    }
  }

  if (peakVal > 0.15) {
    // Log-spaced frequency mapping from bin 0-31 (approx 20Hz - 20,000Hz)
    const estFreq = 20 * Math.pow(1000, peakBin / (NUM_BANDS - 1));
    const midiNote = Math.round(12 * Math.log2(estFreq / 440)) + 69;
    if (midiNote >= 24 && midiNote <= 108) {
      const noteName = NOTE_NAMES[midiNote % 12];
      const octave = Math.floor(midiNote / 12) - 1;
      lastRootNoteEstimate = `${noteName}${octave}`;
    }
  }

  // 2. BPM estimation: Track low-frequency energy pulses (bands 1 to 5)
  const bassEnergy = (freqs[1] + freqs[2] + freqs[3] + freqs[4]) / 4;
  onsetHistory.push({ time: timestamp, energy: bassEnergy });
  if (onsetHistory.length > ONSET_HISTORY_SIZE) onsetHistory.shift();

  // Peak interval autocorrelation
  let beatIntervals = [];
  for (let i = 1; i < onsetHistory.length - 1; i++) {
    if (onsetHistory[i].energy > 0.4 &&
        onsetHistory[i].energy > onsetHistory[i - 1].energy &&
        onsetHistory[i].energy > onsetHistory[i + 1].energy) {
      beatIntervals.push(onsetHistory[i].time);
    }
  }

  if (beatIntervals.length >= 3) {
    let deltas = [];
    for (let i = 1; i < beatIntervals.length; i++) {
      const dt = beatIntervals[i] - beatIntervals[i - 1];
      if (dt >= 300 && dt <= 1000) { // 60 BPM to 200 BPM
        deltas.push(dt);
      }
    }
    if (deltas.length > 0) {
      const avgDt = deltas.reduce((a, b) => a + b, 0) / deltas.length;
      const rawBpm = Math.round(60000 / avgDt);
      if (rawBpm >= 60 && rawBpm <= 200) {
        lastBpmEstimate = Math.round(lastBpmEstimate * 0.7 + rawBpm * 0.3);
      }
    }
  }

  return { note: lastRootNoteEstimate, bpm: lastBpmEstimate };
}
```

In `renderVisualizerFrame`, update the canvas HUD musical pill:
```javascript
const musical = estimateMusicalTelemetry(freqs, timestamp);
const musicalPill = doc.getElementById('vizHudMusicalPill');
if (musicalPill) {
  musicalPill.textContent = `🎵 ${musical.note} • ${musical.bpm} BPM`;
}
```

In [`dashboard/dashboard.html`](file:///c:/Users/Atul Verma/Desktop/Win App Tracker/Browser Detection/dashboard/dashboard.html#L790-L800), add the Musical Pill into `#vizCanvasHud`:
```html
<div class="viz-hud-telemetry-cluster">
  <span class="viz-hud-badge viz-hud-fps" id="vizHudFpsBadge">60 FPS</span>
  <span class="viz-hud-badge viz-hud-musical" id="vizHudMusicalPill">🎵 A4 • 120 BPM</span>
</div>
```

---

### Step 2.7: Styles in `dashboard/styles/media.css`
Append styling for the new controls:

```css
/* ========================================================================= */
/* PHASE 2: ADVANCED CONTROLS & THEME PALETTES                               */
/* ========================================================================= */

/* Clipping Alert Latched Pulse */
.vu-clip-badge {
  cursor: pointer;
  border: 1px solid rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  transition: all 0.2s ease;
  user-select: none;
}

.vu-clip-badge.is-clipped {
  background: rgba(239, 68, 68, 0.3) !important;
  border-color: #ef4444 !important;
  color: #fca5a5 !important;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.6) !important;
  animation: vuClipPulse 0.8s infinite alternate ease-in-out !important;
}

@keyframes vuClipPulse {
  0% { transform: scale(1); box-shadow: 0 0 4px rgba(239, 68, 68, 0.4); }
  100% { transform: scale(1.05); box-shadow: 0 0 16px rgba(239, 68, 68, 0.8); }
}

/* Freeze Active Button */
.btn-viz-action-icon.active {
  background: rgba(56, 189, 248, 0.25) !important;
  border-color: #38bdf8 !important;
  color: #38bdf8 !important;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.4) !important;
}

.viz-hud-freeze {
  background: rgba(56, 189, 248, 0.2) !important;
  border-color: #38bdf8 !important;
  color: #38bdf8 !important;
  animation: freezeBlink 1.5s infinite ease-in-out;
}

@keyframes freezeBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Preamp Gain Slider */
.viz-gain-range {
  width: 90px;
  height: 4px;
  -webkit-appearance: none;
  background: #334155;
  border-radius: 2px;
  outline: none;
}

.viz-gain-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #38bdf8;
  cursor: pointer;
  box-shadow: 0 0 6px #38bdf8;
}

.viz-gain-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: #38bdf8;
  width: 32px;
  text-align: right;
}

/* Palette Swatches */
.viz-palette-pills {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.viz-palette-swatch {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--swatch-color);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.viz-palette-swatch:hover {
  transform: scale(1.15);
}

.viz-palette-swatch.active {
  border-color: #ffffff;
  box-shadow: 0 0 8px var(--swatch-color);
}

/* Musical Telemetry Pill */
.viz-hud-musical {
  color: #a855f7;
  border-color: rgba(168, 85, 247, 0.3);
}

/* Canvas Toast Notification */
.viz-hud-toast {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid #38bdf8;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8), 0 0 16px rgba(56, 189, 248, 0.3);
  z-index: 50;
  pointer-events: none;
  animation: vizToastPop 2s forwards ease;
}

@keyframes vizToastPop {
  0% { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
  15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -60%) scale(0.95); }
}
```

---

## 🔒 5. Constraints & Constitutional Invariants

1. **Zero Layout Expansion:** All controls (gain slider, palette swatches, test signal toggles) MUST reside within the existing `#vizSettingsDrawer` sliding overlay. The outer dimensions of `#heroAudioLabStatus` must remain strictly locked.
2. **Non-Destructive Audio Sandboxing:** The gain multiplier and test signal telemetry are internal to the visualizer module and MUST NEVER manipulate real browser tab media volume or stream destinations.
3. **100% W3C Trusted Types Compliance:**
   - Any dynamic elements (HUD badges, toast notifications) must be assembled using standard `document.createElement`, `setAttribute`, and `textContent`.
   - Zero tolerance for `innerHTML`.
4. **Performance & Memory Cleanliness:**
   - Onset detection array `onsetHistory` is capped at 40 elements to prevent infinite memory growth.
   - Canvas blob URLs created for snapshots must be released with `URL.revokeObjectURL(url)` within 2 seconds.

---

## 📦 6. Deliverables Manifest

| S.No | Deliverable | File Path | Scope of Changes |
| :--- | :--- | :--- | :--- |
| 1 | **Dashboard Markup** | `dashboard/dashboard.html` | Added freeze/snapshot buttons, interactive clip indicator, and settings drawer sliders/swatches |
| 2 | **Styles & Themes** | `dashboard/styles/media.css` | Added clipping pulse animation, gain slider track, palette swatches, and toast styles |
| 3 | **Audio DSP Engine** | `src/dashboard/features/media_deck_visualizer_feature.js` | Added latching clip detection, freeze mode, snapshot engine, gain multiplier, 5 palettes, test signals, and BPM/key estimation |
| 4 | **Dashboard Controller** | `dashboard/dashboard.js` | Added event bindings for clip reset, freeze toggle, snapshot capture, gain, and palette switches |
| 5 | **Verification Suite** | `tests/test_visualizer_phase_02_features.js` | Automated test certifying clipping latch, snapshot export, gain scaling, palette rendering, and BPM detection |

---

## 🚦 7. Verification Gate & Acceptance Criteria

Execute the automated test suite to certify Phase 2:

```powershell
node tests/test_visualizer_phase_02_features.js
node tests/test_visualizer_phase_01_ergonomics.js
node tests/test_visualizer_toolbar_buttons_fix.js
```

### Acceptance Criteria:
- [ ] Clipping alert latches red when amplitude hits 0 dBFS and resets upon clicking `#vuClipIndicator`.
- [ ] Freeze mode pauses the visualizer frame on screen while audio playback continues.
- [ ] Snapshot button captures a clean PNG of the canvas, copies to clipboard, and triggers download fallback.
- [ ] Gain slider scales visualization amplitude (0.2x to 3.0x) without distorting actual audio playback.
- [ ] All 5 color palettes (Cyberpunk, Matrix, Sunset, Amber CRT, Monochrome) render distinct color schemes.
- [ ] Audio source toggle switches seamlessly between live stream and test signals (Sine, Noise, Chirp).
- [ ] BPM and musical root note estimation updates smoothly on the HUD without frame stutter.
- [ ] 100% W3C Trusted Types compliant: 0 instances of `innerHTML`.
- [ ] All automated tests exit with code 0.
