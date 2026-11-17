# Phase 2 Execution Prompt: Dynamic Canvas Resolution & 60 FPS Render Scaling Engine
# Task: Visualizer Inner UI Content Expansion
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Execution Directive for Level 4 Fullstack Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 05 Frontend Engineering & Dept 04 System Architecture.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
> - **Security Standard:** 100% W3C Trusted Types Compliant (Zero innerHTML).

---

## 🎯 1. Phase Objective

Upgrade the canvas initialization, dynamic resolution calculations, and rendering loop in `dashboard/dashboard.js` and `src/dashboard/features/media_deck_visualizer_feature.js`:
1. Ensure `initAudioVisualizer` sets the expanded baseline height (`canvas.height = 220` instead of legacy 120).
2. Update `updateVisualizerCanvasResolution` so compact mode dynamically queries `canvas.parentElement.getBoundingClientRect()` and sets canvas resolution proportionally.
3. Adapt the render loop for all 6 visualization effects (`bars`, `wave`, `radial`, `matrix_dots`, `flame`, `stereo_mirror`) so they dynamically scale vertically with `canvas.height`.
4. Ensure zero clipping, zero blurriness, and 60 FPS rendering performance.

---

## 📂 2. Target Files & Anchors

- **Dashboard Script:** [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L2320-L2450) & [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L2530-L2570)
- **Feature Module:** [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L200-L350)

---

## 🛠️ 3. Step-by-Step Implementation Instructions

### Step 2.1: Update Canvas Baseline Resolution in `initAudioVisualizer`
In `dashboard/dashboard.js` and `media_deck_visualizer_feature.js`:
```javascript
function initAudioVisualizer(canvasEl, options = {}) {
  const canvas = canvasEl || (typeof document !== 'undefined' ? document.getElementById('canvasAudioVisualizer') : null);
  if (canvas) {
    if (!canvas.width) canvas.width = 600;
    if (!canvas.height || canvas.height <= 120) canvas.height = 220; // Expanded baseline
  }
  ...
}
```

### Step 2.2: Upgrade `updateVisualizerCanvasResolution`
Make compact mode sample container geometry:
```javascript
function updateVisualizerCanvasResolution() {
  if (typeof document === 'undefined') return;
  const canvas = document.getElementById('canvasAudioVisualizer');
  if (!canvas) return;

  const isFullscreen = isVisualizerFullscreenActive() || isVisualizerFullWindowActive();
  const container = canvas.parentElement;
  const rect = (container && typeof container.getBoundingClientRect === 'function') ? container.getBoundingClientRect() : null;

  if (isFullscreen) {
    if (rect && rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
    } else {
      canvas.width = 1400;
      canvas.height = 600;
    }
  } else {
    // Compact Mode: Auto-adapt to expanded container height
    if (rect && rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width);
      canvas.height = Math.max(180, Math.round(rect.height));
    } else {
      canvas.width = 600;
      canvas.height = 220;
    }
  }
}
```

### Step 2.3: Calibrate Vertical Draw Loop Scaling
Verify that bar and waveform heights scale dynamically using `canvas.height` so that graphics occupy the full height smoothly:
```javascript
// Spectrum Bars
const barHeight = (dataArray[i] / 255) * (canvas.height * 0.88);
const y = canvas.height - barHeight;

// Oscilloscope Wave
const y = (slice * canvas.height) / 2;
```

---

## 🚦 4. Verification Gate

Execute verification check:
```powershell
node tests/test_visualizer_compact_fullscreen_embed.js
node tests/test_visualizer_radial_scaling.js
```
Must pass with exit code 0.
