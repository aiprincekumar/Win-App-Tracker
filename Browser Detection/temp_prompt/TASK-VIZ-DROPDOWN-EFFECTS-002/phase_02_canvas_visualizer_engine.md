<!-- UTF-8 with BOM -->
# TASK-VIZ-DROPDOWN-EFFECTS-002: Phase 2 Standalone Execution Prompt

> **Phase Focus:** Canvas 2D Visualizer Engine Expansion (6 Effects & Dropdown Binding)  
> **Assigned Role:** Level 4 Frontend Engineering Specialist  
> **Authorization Mandate:** Requires valid `AUTH-MGR-*` token from Level 2 Manager  
> **Target File:**
> - [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L390-L730)

---

## 🎯 1. Phase Objective

Upgrade the Real-Time Canvas 2D Audio Visualizer Engine in `media_deck_visualizer_feature.js` from a dual-mode engine (`bars` and `wave`) to a 6-effect engine supporting:
1. `bars`: 32-Band FFT Spectrum Analyzer with falling peak-hold white cap dots.
2. `wave`: Oscilloscope Neon Sine Trace with dynamic time-offset modulation.
3. `radial`: Circular Radial Frequency Burst radiating 32 spokes from center with pulsing core.
4. `matrix_dots`: Cyber Matrix Voxel Grid with discrete glowing threshold dots.
5. `flame`: Neon Flame Peaks with warm kinetic fire energy gradient.
6. `stereo_mirror`: Stereo Dual-Channel Butterfly Mirror expanding symmetrically from center.

Ensure `initAudioVisualizer` and `setVisualizerMode` cleanly synchronize with `#selectVizEffect` and `#btnVizModeBars`/`#btnVizModeWave`, while strictly maintaining the Zero-Overhead Idle Sleep Sentinel.

---

## 📦 2. Prerequisites & Inputs

1. Completion of Phase 1 (`dashboard.html` contains `#selectVizEffect`).
2. Review mathematical formulas in [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/TASK-VIZ-DROPDOWN-EFFECTS-002/TRD.md#3-canvas-2d-mathematical--algorithmic-specifications).

---

## ⚓ 3. Technical Context & File Anchors

### Anchor: `src/dashboard/features/media_deck_visualizer_feature.js`
- Lines 398: `let visualizerMode = 'bars';`
- Lines 433-451: Button binding in `initAudioVisualizer()`
- Lines 484-517: `setVisualizerMode(mode, options)`
- Lines 613-676: Mode branches inside `renderVisualizerFrame()`

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 2.1: Define Supported Modes Constant
Around line 398, declare:
```javascript
const VALID_VIZ_MODES = ['bars', 'wave', 'radial', 'matrix_dots', 'flame', 'stereo_mirror'];
```

### Step 2.2: Expand `initAudioVisualizer` Dropdown Binding
Inside `initAudioVisualizer(canvasEl, options = {})`, locate the doc querying section (~lines 433-451) and add:
```javascript
const selectEffect = doc.getElementById('selectVizEffect');
if (selectEffect && !selectEffect.__vizBound) {
  selectEffect.__vizBound = true;
  selectEffect.value = visualizerMode;
  selectEffect.addEventListener('change', (e) => {
    if (e && e.target) {
      setVisualizerMode(e.target.value, options);
    }
  });
}
```
Ensure existing click bindings on `btnBars` and `btnWave` remain in place for backward compatibility.

### Step 2.3: Expand `setVisualizerMode`
Update `setVisualizerMode(mode, options = {})`:
```javascript
function setVisualizerMode(mode, options = {}) {
  if (!VALID_VIZ_MODES.includes(mode)) return visualizerMode;
  visualizerMode = mode;

  const doc = options.doc || (typeof document !== 'undefined' ? document : null);
  if (doc) {
    const selectEffect = doc.getElementById('selectVizEffect');
    if (selectEffect && selectEffect.value !== mode) {
      selectEffect.value = mode;
    }

    const btnBars = doc.getElementById('btnVizModeBars');
    const btnWave = doc.getElementById('btnVizModeWave');
    if (btnBars) {
      if (mode === 'bars') {
        btnBars.classList.add('btn-active', 'active');
        if (typeof btnBars.setAttribute === 'function') btnBars.setAttribute('aria-pressed', 'true');
      } else {
        btnBars.classList.remove('btn-active', 'active');
        if (typeof btnBars.setAttribute === 'function') btnBars.setAttribute('aria-pressed', 'false');
      }
    }
    if (btnWave) {
      if (mode === 'wave') {
        btnWave.classList.add('btn-active', 'active');
        if (typeof btnWave.setAttribute === 'function') btnWave.setAttribute('aria-pressed', 'true');
      } else {
        btnWave.classList.remove('btn-active', 'active');
        if (typeof btnWave.setAttribute === 'function') btnWave.setAttribute('aria-pressed', 'false');
      }
    }
  }

  return visualizerMode;
}
```

### Step 2.4: Implement All 6 Effects in `renderVisualizerFrame`
Inside `renderVisualizerFrame(timestamp = Date.now(), options = {})`, preserve background clearing and telemetry synthesis, then implement the 6 render branches:

```javascript
// Mode 1: 32-Band FFT Frequency Spectrum with Falling Peak-Hold Dots
if (visualizerMode === 'bars') {
  const gap = 3;
  const totalGaps = (NUM_BANDS - 1) * gap;
  const barWidth = Math.max(2, (width - totalGaps) / NUM_BANDS);

  for (let i = 0; i < NUM_BANDS; i++) {
    const targetVal = freqs[i] || 0;
    currentBandValues[i] = currentBandValues[i] * 0.65 + targetVal * 0.35;
    const barHeight = Math.max(2, currentBandValues[i] * (height - 12));
    const x = i * (barWidth + gap);
    const y = height - barHeight;

    const grad = ctx.createLinearGradient(0, height, 0, 0);
    grad.addColorStop(0, '#10b981');
    grad.addColorStop(0.55, '#06b6d4');
    grad.addColorStop(1, '#8b5cf6');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth, barHeight);

    if (y < peakHoldBars[i] || peakHoldBars[i] === 0) {
      peakHoldBars[i] = y;
    } else {
      peakHoldBars[i] = Math.min(height - 4, peakHoldBars[i] + 1.25);
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, peakHoldBars[i] - 2, barWidth, 2);
  }
}

// Mode 2: Oscilloscope Waveform Mode (Neon Sine Trace)
else if (visualizerMode === 'wave') {
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#06b6d4';
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#10b981';

  const sliceWidth = width / (wave.length - 1);
  const midY = height / 2;

  for (let j = 0; j < wave.length; j++) {
    const amp = wave[j] || 0;
    const x = j * sliceWidth;
    const y = midY + amp * (height * 0.42);
    if (j === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// Mode 3: Radial Frequency Burst (Circular Audio Ring)
else if (visualizerMode === 'radial') {
  const cx = width / 2;
  const cy = height / 2;
  const baseRadius = 22 + (telemetry.leftRms || 0) * 12;

  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < NUM_BANDS; i++) {
    currentBandValues[i] = currentBandValues[i] * 0.65 + (freqs[i] || 0) * 0.35;
    const spokeLen = 4 + currentBandValues[i] * 32;
    const angle = (i / NUM_BANDS) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(angle) * (baseRadius + 2);
    const y1 = cy + Math.sin(angle) * (baseRadius + 2);
    const x2 = cx + Math.cos(angle) * (baseRadius + spokeLen);
    const y2 = cy + Math.sin(angle) * (baseRadius + spokeLen);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = i % 2 === 0 ? '#38bdf8' : '#818cf8';
    ctx.stroke();
  }
}

// Mode 4: Matrix Digital Dots / Cyber Voxel Grid
else if (visualizerMode === 'matrix_dots') {
  const gap = 3;
  const totalGaps = (NUM_BANDS - 1) * gap;
  const colWidth = Math.max(2, (width - totalGaps) / NUM_BANDS);
  const numRows = 8;
  const dotHeight = (height - 16) / numRows;

  for (let i = 0; i < NUM_BANDS; i++) {
    currentBandValues[i] = currentBandValues[i] * 0.65 + (freqs[i] || 0) * 0.35;
    const x = i * (colWidth + gap);

    for (let r = 0; r < numRows; r++) {
      const threshold = (r + 0.5) / numRows;
      const isLit = currentBandValues[i] >= threshold;
      const y = height - 8 - (r + 1) * dotHeight;

      if (isLit) {
        ctx.fillStyle = r > 5 ? '#f43f5e' : r > 3 ? '#38bdf8' : '#10b981';
        ctx.fillRect(x, y + 2, colWidth, dotHeight - 4);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(x, y + 2, colWidth, dotHeight - 4);
      }
    }
  }
}

// Mode 5: Neon Flame Peaks (Warm Dynamic Fire Energy)
else if (visualizerMode === 'flame') {
  const gap = 3;
  const totalGaps = (NUM_BANDS - 1) * gap;
  const barWidth = Math.max(2, (width - totalGaps) / NUM_BANDS);
  const time = (timestamp || Date.now()) * 0.005;

  for (let i = 0; i < NUM_BANDS; i++) {
    const flutter = Math.sin(time * 3 + i * 0.5) * 0.15;
    currentBandValues[i] = currentBandValues[i] * 0.6 + (freqs[i] || 0) * 0.4;
    const flameHeight = Math.max(4, (currentBandValues[i] + flutter) * (height - 10));
    const x = i * (barWidth + gap);
    const y = height - flameHeight;

    const grad = ctx.createLinearGradient(0, height, 0, y);
    grad.addColorStop(0, '#dc2626');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#fbbf24');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, barWidth, flameHeight, [4, 4, 0, 0]) : ctx.fillRect(x, y, barWidth, flameHeight);
    ctx.fill();
  }
}

// Mode 6: Stereo Dual-Channel Butterfly Mirror
else if (visualizerMode === 'stereo_mirror') {
  const halfWidth = width / 2;
  const halfBands = NUM_BANDS / 2;
  const barWidth = Math.max(2, (halfWidth - (halfBands * 2)) / halfBands);

  // Center divider pulse
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(halfWidth - 1, 4, 2, height - 8);

  for (let i = 0; i < halfBands; i++) {
    currentBandValues[i] = currentBandValues[i] * 0.65 + (freqs[i] || 0) * 0.35;
    const barHeight = Math.max(2, currentBandValues[i] * (height - 14));
    const y = (height - barHeight) / 2;

    // Left Mirror (expands from center to left)
    const xLeft = halfWidth - (i + 1) * (barWidth + 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(xLeft, y, barWidth, barHeight);

    // Right Mirror (expands from center to right)
    const xRight = halfWidth + i * (barWidth + 2) + 2;
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(xRight, y, barWidth, barHeight);
  }
}
```

### Step 2.5: Verify UTF-8 BOM
Ensure `media_deck_visualizer_feature.js` is written with UTF-8 BOM (`0xEF, 0xBB, 0xBF`).

---

## 🚫 5. Architectural Constraints & Boundaries
- DO NOT remove or mutate public exports of `MediaDeckVisualizerFeature`.
- DO NOT assign to `innerHTML` or `outerHTML`.
- PRESERVE the Idle Sleep Sentinel (`renderVisualizerFrame` returns `{ sleeping: true }` when idle).

---

## 🏁 6. Local Verification Gate

Execute verification command:
```bash
node tests/test_visualizer_runtime_wiring.js
```
**Gate Requirement:** All battery checks pass cleanly with exit code 0.
