<!-- 0xEF, 0xBB, 0xBF UTF-8 BOM Encoded -->
# Phase 1 Execution Prompt: Toolbar DOM & Flex `justify-between` CSS Alignment

> **Execution Directive for Level 4 Frontend Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 05 Frontend Engineering & UI/UX Design.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
> - **Security Standard:** 100% W3C Trusted Types Compliant (Zero innerHTML).

---

## 🎯 1. Phase Objective
Refactor the Visualizer Controls Toolbar in `dashboard/dashboard.html`, `dashboard/styles/media.css`, and `dashboard/dashboard.css`:
1. Group action buttons inside a dedicated `.viz-actions-group` wrapper aligned flush to the right of `.visualizer-controls-bar`.
2. Introduce `#btnVizFullWindow` as a dedicated action button for Full Window (Theater) toggle.
3. Update `.visualizer-controls-bar` styling to `width: 100%; display: flex; justify-content: space-between; align-items: center;`.
4. Style `.viz-actions-group` and `#btnVizFullWindow` with consistent dark and light mode tokens.

---

## 📂 2. Target Files & Anchors
- **HTML Document:** [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L748-L787)
- **Primary Media Stylesheet:** [`dashboard/styles/media.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media.css#L1030-L1080)
- **Consolidated Dashboard Stylesheet:** [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css#L5960-L6050)

---

## 🛠️ 3. Step-by-Step Implementation Instructions

### Step 1.1: Refactor Toolbar DOM in `dashboard/dashboard.html`
In lines 748-787:
```html
<div class="visualizer-controls visualizer-controls-bar">
  <label for="selectVizEffect" id="lblVizEffect" class="viz-dropdown-label visually-hidden" data-i18n="visualizer_effect_label">Effect:</label>
  <div class="viz-select-wrapper">
    <select id="selectVizEffect" class="form-select visualizer-mode-select select-viz-effect glass-select" aria-label="Audio Visualizer Effect">
      <option value="bars" data-i18n="viz_effect_bars">32-Band Spectrum</option>
      <option value="wave" data-i18n="viz_effect_wave">Oscilloscope Wave</option>
      <option value="radial" data-i18n="viz_effect_radial">Radial Frequency Burst</option>
      <option value="matrix_dots" data-i18n="viz_effect_matrix">Matrix Digital Dots</option>
      <option value="flame" data-i18n="viz_effect_flame">Neon Flame Peaks</option>
      <option value="stereo_mirror" data-i18n="viz_effect_stereo">Stereo Mirror Butterfly</option>
    </select>
  </div>
  <div class="viz-actions-group">
    <button type="button" id="btnVizVideoEmbedToggle" class="btn-viz-action-icon" title="Switch to Video Player (Embed Mode)" aria-label="Switch to Video Player (Embed Mode)" aria-pressed="false" tabindex="0">
      <svg class="viz-action-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <polygon points="10 8 16 11 10 14 10 8" fill="currentColor"></polygon>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    </button>
    <button type="button" id="btnVizFullWindow" class="btn-viz-action-icon" title="Toggle Visualizer Full Window (Theater)" aria-label="Toggle Visualizer Full Window (Theater)" aria-expanded="false" tabindex="0">
      <svg class="viz-action-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="3" x2="9" y2="21"></line>
      </svg>
    </button>
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
  <!-- Keep existing viz-legacy-buttons visually-hidden for backward test compatibility -->
  <div class="viz-legacy-buttons visually-hidden" aria-hidden="true" style="display: none;">
    <button type="button" id="btnVizModeBars" class="btn btn-xs btn-active btn-viz-mode active" data-viz-mode="bars" data-i18n="visualizer_mode_bars" tabindex="-1">32-Band FFT</button>
    <button type="button" id="btnVizModeWave" class="btn btn-xs btn-viz-mode" data-viz-mode="wave" data-i18n="visualizer_mode_wave" tabindex="-1">Waveform</button>
  </div>
</div>
```

### Step 1.2: Update CSS in `dashboard/styles/media.css` and `dashboard/dashboard.css`
Update `.visualizer-controls-bar` and add `.viz-actions-group`:
```css
.visualizer-controls-bar {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 100% !important;
  box-sizing: border-box !important;
  gap: 8px;
  background: rgba(15, 23, 42, 0.65);
  padding: 4px 8px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.viz-actions-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
```
Ensure both stylesheets (`media.css` and `dashboard.css`) maintain identical rules.

---

## 🔍 4. Verification Gate
- Validate HTML syntax and ensure `#btnVizFullWindow` and `#btnVizFullscreen` are present.
- Verify `display: flex` and `justify-content: space-between` are declared in both stylesheets.
