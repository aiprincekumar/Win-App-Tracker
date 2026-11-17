# Phase 2 Standalone Execution Prompt: CSS Liquid Glass Styling & Dark Theme Redesign

> **Document Type:** Phase 2 Standalone Sub Agent Execution Prompt  
> **Workspace Container:** `temp_prompt/visualizer_uiux_separation/`  
> **Target Execution Role:** Level 4 CSS/Design Engineer (`subagent_css_design_engineer`)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Status:** `READY_FOR_DISPATCH`  

---

## 🎯 1. Phase Objective
Apply studio-grade iOS 26 Liquid Glass CSS styling to the newly separated Real-Time Spectrum Visualizer card and the consolidated Studio Equalizer deck in `dashboard/dashboard.css` and `dashboard/styles/media.css`. Specifically:
1. Redesign FFT / Waveform mode buttons (`#btnVizModeBars`, `#btnVizModeWave`) with glowing active states, subtle borders, and dark theme design tokens.
2. Upgrade VU meter tracks (`#vuBarLeft`, `#vuBarRight`), level indicators, and decibel readouts with high-contrast gradient physics.
3. Redesign the 0dB clipping indicator badge (`#vuClipIndicator`) with dynamic alert states (safe cyan/green vs clipping amber/red).
4. Style the integrated Master Boost and Audio Enhancement section inside `#heroAudioEqCard` to balance with the 5-band vertical equalizer sliders.
5. Provide complete dark and light mode theme variables and WCAG 2.1 AA focus-visible outlines.

---

## 📋 2. Prerequisites & Inputs
- **Prerequisite:** Successful completion of Phase 1 DOM restructuring.
- **Target Files:**
  - `dashboard/dashboard.css`
  - `dashboard/styles/media.css`
- **Reference Specification:** `temp_prompt/visualizer_uiux_separation/DESIGN.md`.

---

## 🔍 3. Technical Context & File Anchors

### Target Files:
1. `dashboard/dashboard.css`: Contains master layout tokens, `.audio-lab-widget`, `.audio-eq-widget`, and global theme variables.
2. `dashboard/styles/media.css`: Contains `.visualizer-panel`, `.visualizer-canvas-container`, `.vu-meters-container`, and media deck rules.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 2.1: Style Dedicated Visualizer Bento Card
1. In `dashboard/dashboard.css` and `dashboard/styles/media.css`, ensure `.audio-lab-widget.visualizer-hero-card` or `#heroAudioLabStatus`:
   - Occupies `grid-column: span 4; grid-row: span 2;`.
   - Has liquid glass depth: `backdrop-filter: blur(24px) saturate(190%)`, `border: 1px solid rgba(255, 255, 255, 0.08)`, and rounded corners (`border-radius: 16px`).
   - Symmetrically balances height with `#heroMediaPlayerCard` (`bento-span-8 bento-row-span-2`).

### Step 2.2: Redesign FFT & Waveform Mode Buttons
1. Style `.visualizer-controls` and mode buttons:
   - Modern pill or rounded rect styling (`height: 28px; padding: 0 12px; font-size: 11px; font-weight: 600; border-radius: 6px;`).
   - Default state: Semi-transparent glass background (`rgba(30, 41, 59, 0.6)`), subtle border, muted slate text.
   - Active state (`.btn-active` or `[data-viz-mode].active`): Cyan/indigo gradient fill, crisp border (`rgba(99, 102, 241, 0.5)`), neon glow shadow (`0 0 12px rgba(56, 189, 248, 0.25)`).
   - Smooth 180ms cubic-bezier transition on hover and focus.

### Step 2.3: Restyle Visualizer Canvas Container
1. Style `.visualizer-canvas-container`:
   - Studio dark chassis background (`rgba(10, 15, 28, 0.75)`), subtle inner border (`1px solid rgba(99, 102, 241, 0.2)`).
   - Border radius: `8px`, overflow: `hidden`.
   - Maintain canvas display block with responsive `width: 100%; height: auto; aspect-ratio: 5 / 1;` or fixed `height: 120px;`.

### Step 2.4: Restyle Stereo VU Meters & 0dB Headroom Indicator
1. Style `.vu-meters-container`:
   - Flex or grid alignment placing L and R meter tracks with numeric readouts and `#vuClipIndicator` aligned cleanly.
2. Style `.vu-meter` tracks and `.vu-level` fill:
   - Track height: `6px`, track background: `rgba(15, 23, 42, 0.8)`.
   - Level gradient: `linear-gradient(90deg, #10b981 0%, #06b6d4 60%, #eab308 85%, #ef4444 100%)`.
   - Level transition: `width 60ms linear`.
3. Style `#vuClipIndicator`:
   - Normal state (`0dB OK`): Pill badge, soft emerald border, muted green text.
   - Clipping state (`.clipping`): Glowing red outline, red background tint, text `#f87171`, box-shadow `0 0 10px rgba(239, 68, 68, 0.4)`.

### Step 2.5: Style Consolidated Studio Equalizer Gain Section
1. In `#heroAudioEqCard`, style the new upper studio deck:
   - Flexbox or two-column grid laying out Master Volume Boost slider on the left and the 3 audio enhancement chips on the right.
   - Seamlessly blend with the 5-band vertical frequency sliders grid below.
   - Ensure clean vertical slider travel (180px) and visible dB scale labels.

### Step 2.6: Light Theme and WCAG AA Verification
1. Add `body.theme-light` token overrides for all new visualizer and studio deck classes.
2. Ensure minimum 4.5:1 text contrast for all labels and badges.
3. Ensure `:focus-visible` outlines on all interactive buttons, sliders, and switches.

---

## 🚫 5. Architectural Constraints & Boundaries
- Do NOT break existing responsive breakpoints (`@media (max-width: 1024px)`, `@media (max-width: 768px)`).
- Ensure zero Cumulative Layout Shift (CLS = 0).
- Preserve existing selector names expected by `tests/test_dashboard_features_phase2.js` (e.g. `.visualizer-panel`, `.visualizer-canvas-container`, `#canvasAudioVisualizer`, `.vu-meters-container`, `.vu-meter`, `.vu-level`, `.vu-clip-badge`).

---

## 📦 6. Deliverables Manifest
- Modified: `dashboard/dashboard.css`
- Modified: `dashboard/styles/media.css`

---

## 🚦 7. Local Verification Gate
```powershell
# 1. Verify CSS syntax and selectors
node tests/test_dashboard_features_phase2.js

# 2. Verify Theme and A11y
node tests/test_dashboard_theme_and_a11y_verification.js

# 3. Verify Light Mode Contrast
node tests/test_light_mode_contrast_and_wcag.js
```
All Phase 2 checks must pass cleanly before transitioning to Phase 3.
