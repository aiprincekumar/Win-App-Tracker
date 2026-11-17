# Technical Requirements Document (TRD)
# Feature: Visualizer Inner UI Content Expansion
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Governance & Specification Reference:**
> - **Lead Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Department:** Dept 04 System Architecture & Dept 05 Frontend Engineering
> - **Target Codebase:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`

---

## 🏗️ 1. High-Level Design (HLD) & DOM Topology

The Real-Time Spectrum Visualizer card is structured in `dashboard/dashboard.html` as follows:

```html
<div id="heroAudioLabStatus" class="audio-lab-widget glass-card bento-card liquid-glass-card bento-span-4 bento-row-span-2 visualizer-hero-card">
  <!-- Card Header (~42px flex-shrink: 0) -->
  <div class="audio-lab-header visualizer-card-header">
    <div class="audio-lab-title-group visualizer-title-group">
      <span class="audio-lab-icon visualizer-icon">🎛️</span>
      <h3 id="txtVisualizerTitle" class="visualizer-title" data-i18n="visualizer_title">Real-Time Spectrum Visualizer</h3>
    </div>
  </div>

  <!-- Card Body (flex: 1 1 auto; height: 100%; min-height: 0;) -->
  <div class="audio-lab-body visualizer-card-body">
    <!-- Visualizer Panel (flex: 1 1 auto; display: flex; flex-direction: column;) -->
    <div id="visualizerPanel" class="visualizer-panel">
      
      <!-- 1. Top Controls Bar (~36px flex-shrink: 0) -->
      <div class="visualizer-controls visualizer-controls-bar">
        ... (Effect select & Action buttons) ...
      </div>

      <!-- 2. Canvas Container (EXPANDED: flex: 1 1 auto; height: 100%; min-height: 180px;) -->
      <div class="visualizer-canvas-container">
        <canvas id="canvasAudioVisualizer" width="600" height="220" role="img" aria-label="Audio frequency visualizer"></canvas>
      </div>

      <!-- 3. Bottom VU Meters (~46px flex-shrink: 0; margin-top: auto;) -->
      <div class="vu-meters-container" role="region" aria-label="Audio Level Meters">
        ... (Stereo L/R bars & 0dB headroom badge) ...
      </div>

    </div>
  </div>
</div>
```

---

## 📐 2. Low-Level Design (LLD) & CSS Flexbox Engine

### 2.1 Vertical Geometry Budget
Outer card minimum height: **380px**  
Padding: **20px top + 20px bottom = 40px**  
Available content height: **340px**

| Component | Current Height | Proposed Expanded Height | Flex Property |
| :--- | :--- | :--- | :--- |
| Header (`.visualizer-card-header`) | 42px | 42px | `flex-shrink: 0;` |
| Gap between header & body | 8px | 8px | - |
| Controls Bar (`.visualizer-controls-bar`) | 36px | 36px | `flex-shrink: 0;` |
| **Canvas Container (`.visualizer-canvas-container`)** | **130px (Static)** | **~200px - 220px (Dynamic)** | **`flex: 1 1 auto; min-height: 180px;`** |
| VU Meters (`.vu-meters-container`) | 46px | 46px | `flex-shrink: 0; margin-top: auto;` |
| Inter-element gaps | 2 x 8px = 16px | 2 x 8px = 16px | - |
| **Total Height Utilized** | **~278px (Leaving 62px+ dead space)** | **~340px (100% efficient utilization)** | **Zero Dead Space** |

### 2.2 CSS Rules Specification (`media.css` and `dashboard.css`)
```css
/* Visualizer Card Body Elastic Stretch */
.visualizer-card-body,
#heroAudioLabStatus .visualizer-card-body {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
  height: 100% !important;
  min-height: 0 !important;
  padding-top: 0.5rem;
  gap: 8px;
}

/* Visualizer Panel Flex Elastic Pipeline */
.visualizer-panel,
.visualizer-hero-card .visualizer-panel,
#heroAudioLabStatus .visualizer-panel {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
  height: 100% !important;
  min-height: 0 !important;
  margin-top: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  gap: 8px;
}

/* Expanded Visualizer Canvas Chassis */
.visualizer-canvas-container,
#heroAudioLabStatus .visualizer-canvas-container {
  width: 100% !important;
  flex: 1 1 auto !important;
  height: 100% !important;
  min-height: 180px !important;
  background: var(--viz-canvas-bg, rgba(10, 15, 28, 0.85));
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--viz-canvas-border, rgba(99, 102, 241, 0.2));
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 16px rgba(99, 102, 241, 0.08);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Canvas Element Stretch */
#canvasAudioVisualizer {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
}

/* Snug VU Level Meters Docking */
.vu-meters-container,
#heroAudioLabStatus .vu-meters-container {
  flex-shrink: 0 !important;
  margin-top: auto !important;
  padding: 6px 12px !important;
  gap: 4px !important;
}
```

---

## 🎨 3. Dynamic Canvas Resolution & Render Math

### 3.1 Adaptive Baseline Sizing in `dashboard.js` & `media_deck_visualizer_feature.js`
In `updateVisualizerCanvasResolution()`:
```javascript
function updateVisualizerCanvasResolution() {
  if (typeof document === 'undefined') return;
  const canvas = document.getElementById('canvasAudioVisualizer');
  if (!canvas) return;

  const isFullscreen = isVisualizerFullscreenActive() || isVisualizerFullWindowActive();
  const container = canvas.parentElement;
  const rect = (container && typeof container.getBoundingClientRect === 'function') 
    ? container.getBoundingClientRect() 
    : null;

  if (isFullscreen) {
    if (rect && rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
    } else {
      canvas.width = 1400;
      canvas.height = 600;
    }
  } else {
    // Compact (Normal) Mode: Dynamically sample container height
    if (rect && rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width);
      canvas.height = Math.max(180, Math.round(rect.height));
    } else {
      canvas.width = 600;
      canvas.height = 220; // Expanded baseline from legacy 120
    }
  }
}
```

### 3.2 Visualizer Modes Scale Equations
- **32-Band Spectrum Bars:**
  `const barHeight = (dataArray[i] / 255) * (canvas.height * 0.88);`
  `const y = canvas.height - barHeight;`
- **Oscilloscope Waveform:**
  `const v = dataArray[i] / 128.0;`
  `const y = (v * canvas.height) / 2;`
- **Radial Burst:**
  `const maxRadius = Math.min(canvas.width, canvas.height) * 0.44;`
- **Flame Peaks:**
  `const flameH = (dataArray[i] / 255) * (canvas.height * 0.92);`
