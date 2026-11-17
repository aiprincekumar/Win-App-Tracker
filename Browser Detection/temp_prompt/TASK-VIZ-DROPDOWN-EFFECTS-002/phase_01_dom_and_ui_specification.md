<!-- UTF-8 with BOM -->
# TASK-VIZ-DROPDOWN-EFFECTS-002: Phase 1 Standalone Execution Prompt

> **Phase Focus:** DOM Restructuring & Dropdown Component Specification  
> **Assigned Role:** Level 4 Frontend Engineering Specialist  
> **Authorization Mandate:** Requires valid `AUTH-MGR-*` token from Level 2 Manager  
> **Target Files:**
> - [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L740-L745)
> - [`dashboard/styles/media.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media.css#L1110-L1180)
> - [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css#L5900-L5970)

---

## 🎯 1. Phase Objective

Refactor the Visualizer Controls bar in `dashboard/dashboard.html` from the dual-button toggle (`#btnVizModeBars` and `#btnVizModeWave`) to a styled, accessible Liquid Glass `<select id="selectVizEffect">` offering six visualizer effect options. Maintain 100% backward compatibility by preserving the legacy `#btnVizModeBars` and `#btnVizModeWave` buttons in a `.visually-hidden` container so that existing tests, queries, and facades continue to function without breaking. Add matching CSS rules in `media.css` and `dashboard.css`.

---

## 📦 2. Prerequisites & Inputs

1. Active workspace: `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
2. Review design specs in [`DESIGN.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/TASK-VIZ-DROPDOWN-EFFECTS-002/DESIGN.md)
3. Review DOM requirements in [`PRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/TASK-VIZ-DROPDOWN-EFFECTS-002/PRD.md)

---

## ⚓ 3. Technical Context & File Anchors

### Anchor 1: `dashboard/dashboard.html` (lines 739-744)
```html
<div id="visualizerPanel" class="visualizer-panel">
  <div class="visualizer-controls visualizer-controls-bar">
    <button type="button" id="btnVizModeBars" class="btn btn-xs btn-active btn-viz-mode active" data-viz-mode="bars" data-i18n="visualizer_mode_bars">32-Band FFT</button>
    <button type="button" id="btnVizModeWave" class="btn btn-xs btn-viz-mode" data-viz-mode="wave" data-i18n="visualizer_mode_wave">Waveform</button>
  </div>
  <div class="visualizer-canvas-container">
```

### Anchor 2: `dashboard/styles/media.css` (lines 1111-1127)
Existing styling for `.visualizer-controls` and `.visualizer-controls-bar`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1.1: Update `dashboard/dashboard.html`
Replace the contents of `.visualizer-controls-bar` with the new dropdown markup and preserve legacy buttons inside a `.visually-hidden` wrapper:

```html
<div class="visualizer-controls visualizer-controls-bar">
  <label for="selectVizEffect" class="viz-dropdown-label" data-i18n="visualizer_effect_label">Effect:</label>
  <div class="viz-select-wrapper">
    <select id="selectVizEffect" class="select-viz-effect glass-select" aria-label="Audio Visualizer Effect">
      <option value="bars" data-i18n="viz_effect_bars">32-Band Spectrum</option>
      <option value="wave" data-i18n="viz_effect_wave">Oscilloscope Wave</option>
      <option value="radial" data-i18n="viz_effect_radial">Radial Frequency Burst</option>
      <option value="matrix_dots" data-i18n="viz_effect_matrix">Matrix Digital Dots</option>
      <option value="flame" data-i18n="viz_effect_flame">Neon Flame Peaks</option>
      <option value="stereo_mirror" data-i18n="viz_effect_stereo">Stereo Mirror Butterfly</option>
    </select>
  </div>
  <!-- Backward-compatible legacy mode buttons (hidden from visual flow, synced for API and test parity) -->
  <div class="viz-legacy-buttons visually-hidden" aria-hidden="true" style="display: none;">
    <button type="button" id="btnVizModeBars" class="btn btn-xs btn-active btn-viz-mode active" data-viz-mode="bars" tabindex="-1">32-Band FFT</button>
    <button type="button" id="btnVizModeWave" class="btn btn-xs btn-viz-mode" data-viz-mode="wave" tabindex="-1">Waveform</button>
  </div>
</div>
```

### Step 1.2: Add CSS in `dashboard/styles/media.css` & `dashboard/dashboard.css`
Directly beneath `.visualizer-controls-bar`, add styling for `.viz-dropdown-label`, `.viz-select-wrapper`, and `.select-viz-effect`:

```css
/* Visualizer Dropdown Controls & Label */
.viz-dropdown-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--viz-select-label-text, #94a3b8);
  margin-right: 4px;
  letter-spacing: 0.02em;
  user-select: none;
}

.viz-select-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.select-viz-effect,
#selectVizEffect {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  height: 28px;
  padding: 0 28px 0 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border-radius: 9999px;
  background-color: var(--viz-select-bg, rgba(15, 23, 42, 0.75));
  border: 1px solid var(--viz-select-border, rgba(255, 255, 255, 0.12));
  color: var(--viz-select-text, #e2e8f0);
  cursor: pointer;
  outline: none;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.select-viz-effect:hover,
#selectVizEffect:hover {
  background-color: var(--viz-select-hover-bg, rgba(30, 41, 59, 0.85));
  border-color: var(--viz-select-hover-border, rgba(56, 189, 248, 0.4));
  color: #f8fafc;
}

.select-viz-effect:focus,
.select-viz-effect:focus-visible,
#selectVizEffect:focus,
#selectVizEffect:focus-visible {
  border-color: rgba(56, 189, 248, 0.8);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.35), 0 0 14px rgba(6, 182, 212, 0.25);
}

.select-viz-effect option {
  background-color: #0f172a;
  color: #f8fafc;
  font-size: 12px;
  padding: 6px 10px;
}

/* Light Theme Overrides */
body.theme-light .viz-dropdown-label {
  color: #64748b;
}

body.theme-light .select-viz-effect,
body.theme-light #selectVizEffect {
  background-color: rgba(255, 255, 255, 0.85);
  border-color: rgba(148, 163, 184, 0.35);
  color: #1e293b;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230284c7' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
}

body.theme-light .select-viz-effect:hover,
body.theme-light #selectVizEffect:hover {
  background-color: #ffffff;
  border-color: rgba(14, 165, 233, 0.6);
  color: #0f172a;
}

body.theme-light .select-viz-effect option {
  background-color: #ffffff;
  color: #0f172a;
}
```

### Step 1.3: Verify UTF-8 BOM
Ensure files are written with standard UTF-8 Byte Order Mark (`0xEF, 0xBB, 0xBF`).

---

## 🚫 5. Architectural Constraints & Boundaries
- DO NOT delete `#btnVizModeBars` or `#btnVizModeWave` from the DOM (they must remain present).
- DO NOT use inline `onchange` attributes in the HTML.
- DO NOT alter `#visualizerPanel`, `#canvasAudioVisualizer`, or the VU meter structure.

---

## 🏁 6. Local Verification Gate

Execute verification command:
```bash
node tests/test_visualizer_separation_qa_parity.js
```
**Gate Requirement:** All 5 gates pass 100% clean (including Gate 1 verifying all 18 DOM IDs).
