# Phase 2 Instruction Prompt: Bento Grid CSS Geometry & Liquid Glass Audio Styling

> **Phase Identifier:** `phase_02_bento_css_liquid_glass`  
> **Target Subagent Role:** Level 4 CSS/Design Engineer (`Frontend Engineer` / `CSS Specialist`)  
> **Model Tier:** `flash` (per Universal Rule 25)  
> **Workspace Container:** `temp_prompt/bento_equalizer_card_refinement/`  
> **Target File:** [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css)  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Status:** Ready for Execution Authorization  

---

## 🎯 1. Phase Objective

Implement dedicated styling for the **5-Band Graphic Equalizer Studio Deck** (`#heroAudioEqCard` / `.audio-eq-widget`) and refine the **Audio Lab Widget** (`#heroAudioLabStatus` / `.audio-lab-widget`) in `dashboard/dashboard.css`. Deliver a tactile studio mixing console aesthetic with iOS 26 Liquid Glass depth, 180px vertical slider travel, centered zero-dB detent indicators, responsive 12-column Bento Grid balancing, and WCAG AAA contrast conformance.

---

## 📋 2. Prerequisites & Environment State

- Phase 1 must be completed: `#heroAudioEqCard` and streamlined `#heroAudioLabStatus` exist in `dashboard/dashboard.html`.
- Target file: `dashboard/dashboard.css` (encoded in UTF-8 with BOM: `0xEF, 0xBB, 0xBF`).
- Authorization: Level 2 Manager Token `AUTH-MGR-*`.

---

## 🔍 3. Technical Context & CSS File Anchors

In [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css):
- Lines 814–875: `.bento-grid-container`, `.bento-span-*`, `.liquid-glass-card`
- Lines 926–940: Responsive media queries (`max-width: 1200px` and `max-width: 768px`)
- Existing Audio Lab classes: `.audio-lab-widget`, `.audio-boost-control`, `.audio-eq-section`, `.eq-bands-grid`, `.eq-vertical-slider`, `.enhancements-grid`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 2.1: Implement Dedicated Equalizer Card Styling (`.audio-eq-widget`)
In `dashboard/dashboard.css`, replace legacy `.audio-eq-section` styles with modern studio deck styling for `.audio-eq-widget`:

```css
/* ==========================================================================
   Dedicated 5-Band Graphic Equalizer Studio Deck (.audio-eq-widget)
   ========================================================================== */
.audio-eq-widget {
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.75rem;
  min-height: 280px;
  position: relative;
  overflow: hidden;
}

/* Card Header & Metadata */
.eq-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--glass-card-border);
}

.eq-title-group {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.eq-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
}

.eq-title-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.eq-heading {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.015em;
}

.eq-badge-specs {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-secondary);
  font-family: var(--mono-font, monospace);
  opacity: 0.85;
}

/* Action Controls (Preset & Reset) */
.eq-actions-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.eq-preset-dropdown {
  background: var(--glass-surface-bg);
  border: 1px solid var(--glass-specular-border);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(12px);
  outline: none;
}

.eq-preset-dropdown:hover,
.eq-preset-dropdown:focus {
  border-color: var(--accent-emerald);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
}

.btn-reset-eq {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--glass-specular-border);
  color: var(--text-primary);
  padding: 0.5rem 0.95rem;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(12px);
}

.btn-reset-eq:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: var(--accent-emerald);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.btn-reset-eq:active {
  transform: scale(0.97);
}
```

### Step 2.2: Style the Expansive 5-Band Vertical Slider Grid
```css
/* Equalizer Sliders 5-Column Grid */
.eq-bands-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.5rem;
  padding: 1.5rem 1rem 1rem 1rem;
  position: relative;
  align-items: center;
}

/* Zero-dB Center Detent Horizon Line */
.eq-bands-grid::before {
  content: '';
  position: absolute;
  top: 52%;
  left: 2rem;
  right: 2rem;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(16, 185, 129, 0.4) 20%,
    rgba(16, 185, 129, 0.4) 80%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* Individual Band Column */
.eq-band-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  position: relative;
  z-index: 2;
}

/* Decibel Value Readout */
.eq-db-val {
  font-family: var(--mono-font, monospace);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent-emerald);
  min-width: 42px;
  text-align: center;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  transition: all 0.15s ease;
}

/* Slider Track Wrapper with Height */
.eq-slider-track-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 190px;
  padding: 0.5rem 0;
}

/* Vertical Input Slider */
.eq-vertical-slider {
  -webkit-appearance: slider-vertical;
  appearance: slider-vertical;
  writing-mode: vertical-lr;
  direction: rtl;
  width: 32px;
  height: 180px;
  margin: 0 auto;
  cursor: pointer;
  background: transparent;
  touch-action: none;
}

.eq-vertical-slider:focus-visible {
  outline: 2px solid var(--accent-emerald);
  outline-offset: 4px;
}

/* Frequency Labels & Subtext */
.eq-freq-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.eq-freq-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--mono-font, monospace);
}

.eq-freq-sub {
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}
```

### Step 2.3: Streamline `.audio-lab-widget` (#heroAudioLabStatus)
Refine `.audio-lab-widget` so that without the vertical sliders, Master Boost and the three Audio Enhancement cards distribute their layout naturally without vertical stretching:

```css
/* Streamlined Audio Lab Widget */
.audio-lab-widget {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
}

.audio-lab-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
  justify-content: space-around;
}

.audio-boost-control {
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem 1.15rem;
  border-radius: 14px;
  border: 1px solid var(--glass-card-border);
}

.enhancements-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.enhancement-card {
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-card-border);
  transition: all 0.2s ease;
}

.enhancement-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--glass-specular-border);
}
```

### Step 2.4: Responsive Collapse Refinements
Ensure `@media (max-width: 1200px)` and `@media (max-width: 768px)` handle `#heroAudioEqCard` smoothly:
```css
@media (max-width: 1200px) {
  #heroAudioEqCard {
    grid-column: span 12;
  }
}

@media (max-width: 768px) {
  #heroAudioEqCard {
    grid-column: span 12;
    padding: 1rem 0.75rem;
  }
  .eq-bands-grid {
    gap: 0.5rem;
    padding: 1rem 0;
  }
  .eq-vertical-slider {
    height: 140px;
  }
  .eq-slider-track-wrap {
    height: 150px;
  }
}
```

---

## 🚫 5. Architectural Constraints & Boundaries

- Do NOT remove any existing root variables or light-theme override classes.
- Ensure all color tokens maintain contrast ratios $\ge 7.0:1$ for text against background surfaces.
- Save file in UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 📦 6. Deliverables Manifest

- Modified: `dashboard/dashboard.css` (Studio deck styling, vertical slider faders, center detent line, and responsive queries).

---

## 🧪 7. Local Verification Gate

Execute test suites:
```powershell
node tests/test_dashboard_theme_and_a11y_verification.js
node tests/test_dashboard_uiux_phase1.js
node tests/test_dashboard_full_audio_lab_parity.js
```
**Exit Condition:** All tests pass with exit code 0 and 0 errors.
