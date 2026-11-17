<!-- UTF-8 with BOM -->
# TASK-VIZ-DROPDOWN-EFFECTS-002: Technical Requirements Document (TRD)

> **Specification & Governance:**
> - **Task Identifier:** `TASK-VIZ-DROPDOWN-EFFECTS-002`
> - **Lead Department:** Department 04 (Architecture) & Department 05 (Frontend Engineering)
> - **Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)

---

## 🏛️ 1. Architecture Overview & Component Boundaries

The Real-Time Spectrum Visualizer architecture consists of three tightly coupled modules:
1. **DOM Presentation Layer (`dashboard/dashboard.html` & `dashboard/styles/media.css`):**
   Renders the Bento Card header, dropdown `<select id="selectVizEffect">`, legacy hidden buttons (`#btnVizModeBars`, `#btnVizModeWave`), Canvas element (`#canvasAudioVisualizer`), and VU meters.
2. **Visualizer Core Engine (`src/dashboard/features/media_deck_visualizer_feature.js`):**
   An IIFE feature module exposing methods on `window.MediaDeckVisualizerFeature`. It manages the 60fps `requestAnimationFrame` render loop, frequency synthesis, decibel calculations, and Canvas 2D graphics rendering.
3. **Dashboard Controller & Facade (`dashboard/dashboard.js`):**
   Initializes event listeners, binds DOM inputs to feature methods, manages preference persistence via `chrome.storage.local`, and exposes global facade functions for testing.

---

## ⚙️ 2. Data Contracts & State Machine Specification

### 2.1 Supported Visualizer Modes
```typescript
type VisualizerMode = 
  | 'bars'           // 32-Band FFT Frequency Bars with peak-hold caps
  | 'wave'           // Oscilloscope Neon Sine Waveform
  | 'radial'         // Circular Radial Frequency Burst
  | 'matrix_dots'    // Matrix Cyber Voxel Grid
  | 'flame'          // Neon Flame / Warm Energy Peaks
  | 'stereo_mirror'; // Bilateral Stereo Dual-Channel Butterfly
```

### 2.2 Mode Sequence Cycle Map
When the user clicks the canvas or triggers next mode:
$$\text{bars} \longrightarrow \text{wave} \longrightarrow \text{radial} \longrightarrow \text{matrix\_dots} \longrightarrow \text{flame} \longrightarrow \text{stereo\_mirror} \longrightarrow \text{bars}$$

### 2.3 State Object Contract (`getVisualizerState()`)
```json
{
  "mode": "bars",
  "isPlaying": true,
  "isSleeping": false,
  "rafId": 124,
  "currentSoloTabId": null,
  "cachedStreamsCount": 1,
  "peakBarsSample": [12.4, 18.2, 25.1, 8.5, 4.0]
}
```

### 2.4 Storage Persistence Contract
- **Storage Target:** `chrome.storage.local` (fallback: `localStorage`)
- **Key:** `'media_sentinel_viz_effect'`
- **Schema:**
```typescript
interface VisualizerStorageState {
  media_sentinel_viz_effect: VisualizerMode; // e.g. "radial"
}
```

---

## 🎨 3. Canvas 2D Mathematical & Algorithmic Specifications

The canvas resolution is fixed at $W = 600$ px and $H = 120$ px. The background is cleared every frame with `rgba(8, 11, 17, 0.35)` to produce an authentic phosphor decay trail.

### Effect 1: `bars` (32-Band FFT Frequency Spectrum)
- **Input Data:** `freqs` array (32 floats, normalized $0.0 \dots 1.0$).
- **Layout:** $N = 32$ bands, $\text{gap} = 3$ px, $\text{barWidth} = \frac{W - (N - 1) \cdot \text{gap}}{N} \approx 15.8$ px.
- **Smoothing (Lerp):** $V_i = V_i \cdot 0.65 + \text{freqs}[i] \cdot 0.35$.
- **Bar Height:** $h_i = \max(2, V_i \cdot (H - 12))$.
- **Color Gradient:** Linear gradient from bottom ($y = H$) to top ($y = 0$):
  - Stop $0.0$: `#10b981` (Cyber Emerald)
  - Stop $0.55$: `#06b6d4` (Electric Cyan)
  - Stop $1.0$: `#8b5cf6` (Neon Violet)
- **Peak Hold Cap:** Falling white cap dot ($2$ px high) with gravity acceleration $+1.25$ px/frame.

### Effect 2: `wave` (Oscilloscope Neon Sine Trace)
- **Input Data:** `wave` array (64 floats, $-1.0 \dots +1.0$).
- **Center Baseline:** $y_{\text{mid}} = \frac{H}{2} = 60$ px.
- **Slice Width:** $\Delta x = \frac{W}{63} \approx 9.52$ px.
- **Point Position:** $y_j = y_{\text{mid}} + \text{wave}[j] \cdot (H \cdot 0.42)$.
- **Rendering:** `ctx.strokeStyle = '#06b6d4'`, `ctx.lineWidth = 2.5`, `ctx.shadowBlur = 10`, `ctx.shadowColor = '#10b981'`.

### Effect 3: `radial` (Circular Radial Frequency Burst)
- **Origin:** Center of canvas $(c_x, c_y) = (300, 60)$.
- **Base Radius:** $R_0 = 24 + \text{leftRms} \cdot 10$ px (pulsing heart).
- **Spokes:** $N = 32$ rays radiating outward at angle $\theta_i = \frac{2\pi \cdot i}{N} - \frac{\pi}{2}$.
- **Spoke Length:** $L_i = 4 + V_i \cdot 34$ px.
- **Ray Coordinates:**
  $$x_{\text{inner}} = c_x + R_0 \cos(\theta_i), \quad y_{\text{inner}} = c_y + R_0 \sin(\theta_i)$$
  $$x_{\text{outer}} = c_x + (R_0 + L_i) \cos(\theta_i), \quad y_{\text{outer}} = c_y + (R_0 + L_i) \sin(\theta_i)$$
- **Center Core:** Glowing filled circle of radius $R_0 \cdot 0.6$ with radial gradient from `#38bdf8` to `rgba(6, 182, 212, 0.1)`.
- **Styling:** `ctx.strokeStyle = '#38bdf8'`, `ctx.lineWidth = 3`, `ctx.lineCap = 'round'`.

### Effect 4: `matrix_dots` (Matrix Digital Dots / Cyber Voxel Grid)
- **Columns:** 32 columns across $W$, spacing matching bars.
- **Rows per Column:** $M = 8$ vertical dots.
- **Dot Diameter:** $d = 4$ px with vertical spacing $10$ px.
- **Illumination Condition:** Dot $k$ (where $k = 0$ is bottom and $k = 7$ is top) illuminates if:
  $$\frac{k + 0.5}{M} \le V_i$$
- **Coloring:**
  - Active: `#10b981` (Cyber Emerald) with `shadowBlur = 4`, `shadowColor = '#10b981'`.
  - Inactive (Substrate): `rgba(255, 255, 255, 0.06)` (unlit matrix dot).

### Effect 5: `flame` (Neon Flame / Fire Peaks)
- **Input:** Frequency spectrum with extra bass weight (low bands $0 \dots 10$).
- **Ribbon Count:** 32 vertical flame columns or 3 overlapping bezier wave layers.
- **Energy Modulation:** $y_{\text{flame}} = H - \max(4, V_i \cdot (H - 8) \cdot (1.0 + 0.2 \cdot \sin(t \cdot 8 + i \cdot 0.8)))$.
- **Color Gradient:**
  - Bottom ($y = H$): `#dc2626` (Crimson Fire)
  - Mid ($y = H \cdot 0.5$): `#f59e0b` (Amber Flame)
  - Tip ($y = 0$): `#fbbf24` (Electric Gold)
- **Fluid Tip:** Upper tip drawn with quadratic curve or rounded cap.

### Effect 6: `stereo_mirror` (Stereo Dual-Channel Butterfly)
- **Center Axis:** $x_{\text{mid}} = 300$ px.
- **Bilateral Half-Width:** Each channel occupies $300$ px (Left spans $300 \to 0$, Right spans $300 \to 600$).
- **Bands per Half:** 16 bands each side.
- **Left Channel:** Rendered in Electric Cyan (`#06b6d4`) mirrored to the left.
- **Right Channel:** Rendered in Neon Violet (`#a855f7`) mirrored to the right.
- **Center Baseline Glow:** Vertical divider line at $x_{\text{mid}}$ with subtle pulse.

---

## 🔒 4. Security & Compliance Specifications

1. **Zero innerHTML:** Dropdown options, labels, and styles MUST NOT touch `.innerHTML`.
2. **CSP Manifest V3:** No `eval()`, no inline scripts (`<select onchange="...">`). Event handlers must be bound using `addEventListener('change', ...)` in `dashboard.js`.
3. **UTF-8 with BOM:** All files (`.html`, `.css`, `.js`) must maintain the UTF-8 Byte Order Mark (`0xEF, 0xBB, 0xBF`).

---

## 🧪 5. Testing Contract & Acceptance Verification

### Battery Tests in `test_visualizer_runtime_wiring.js`:
1. **Battery 1 (DOM Invariant):** Assert existence of `#selectVizEffect`, `#btnVizModeBars`, `#btnVizModeWave`, `#canvasAudioVisualizer`.
2. **Battery 2 (Export Contract):** Assert `setVisualizerMode` accepts all 6 mode strings.
3. **Battery 3 (Mode Switching & Synchronization):**
   - For each mode $m \in \{\text{'bars'}, \text{'wave'}, \text{'radial'}, \text{'matrix_dots'}, \text{'flame'}, \text{'stereo_mirror'}\}$:
   - Call `setVisualizerMode(m)`.
   - Assert `getVisualizerState().mode === m`.
   - If $m == 'bars'$, assert `#btnVizModeBars` has `.active`.
   - If $m == 'wave'$, assert `#btnVizModeWave` has `.active`.
4. **Battery 4 (60fps Render Execution):**
   - Execute `renderVisualizerFrame()` under each of the 6 modes.
   - Assert `rendered === true` and no exceptions thrown.
5. **Battery 5 (Zero-Overhead Idle Sleep):**
   - When `isVisualizerPlaying === false` or `doc.visibilityState === 'hidden'`, assert `renderVisualizerFrame().sleeping === true`.
