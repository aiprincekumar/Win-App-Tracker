# Phase 1 Standalone Execution Prompt: DOM Restructuring & Layout Separation

> **Document Type:** Phase 1 Standalone Sub Agent Execution Prompt  
> **Workspace Container:** `temp_prompt/visualizer_uiux_separation/`  
> **Target Execution Role:** Level 4 Frontend Engineer (`subagent_frontend_engineer`)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Status:** `READY_FOR_DISPATCH`  

---

## 🎯 1. Phase Objective
Restructure the DOM layout in Tab B (`#paneMedia`) of `dashboard/dashboard.html` to establish:
1. A dedicated **Real-Time Spectrum Visualizer & Offscreen DSP Status Bento Card** occupying `bento-span-4 bento-row-span-2` directly beside `#heroMediaPlayerCard` (`bento-span-8 bento-row-span-2`).
2. Migration and seamless integration of the Master Volume Boost slider, readout, telemetry badges, and the 3 Audio Enhancement switches (Vocal Clarity, Night Shield, Audio-Only Mode) into the 12-column Graphic Equalizer Studio Deck (`#heroAudioEqCard`).
3. Complete preservation of all 18 DOM IDs, `data-i18n` localization bindings, and ARIA accessibility attributes.

---

## 📋 2. Prerequisites & Inputs
- **Target File:** `dashboard/dashboard.html` (Lines ~720 to 925).
- **Reference Specifications:**
  - `temp_prompt/visualizer_uiux_separation/PRD.md`
  - `temp_prompt/visualizer_uiux_separation/TRD.md`
  - `temp_prompt/visualizer_uiux_separation/DESIGN.md`
- **Initial Verification:** Ensure git tree is clean (`git status`).

---

## 🔍 3. Technical Context & File Anchors

### Target File: `dashboard/dashboard.html`
- **Anchor 1 (Lines 722-832):** Current `#heroAudioLabStatus` container containing Boost slider, 3 enhancement cards, DSP status dot, and `#visualizerPanel`.
- **Anchor 2 (Lines 833-921):** Current `#heroAudioEqCard` containing 5-band vertical equalizer sliders and preset select.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1.1: Restructure Card Beside Hero Player (`#heroAudioLabStatus`)
1. In `dashboard/dashboard.html`, keep the container `#heroAudioLabStatus` with classes:
   `class="audio-lab-widget visualizer-hero-card glass-card bento-card liquid-glass-card bento-span-4 bento-row-span-2"`
2. Reorganize its internal markup so that it acts exclusively as the **Real-Time Spectrum Visualizer & Offscreen DSP Status Card**:
   - Header with visualizer icon `🎛️`, visualizer heading (`<h3 id="txtVisualizerTitle" class="visualizer-title" data-i18n="visualizer_title">Real-Time Spectrum Visualizer</h3>`), and offscreen DSP status indicator dot with note (`#audioLabStatusText`: "Offscreen Web Audio DSP Pipeline Active" `data-i18n="audiolab_dsp_active"`).
   - Mode switcher controls (`#btnVizModeBars` with `data-viz-mode="bars"` and `#btnVizModeWave` with `data-viz-mode="wave"`).
   - Canvas container (`<div class="visualizer-canvas-container">`) containing `<canvas id="canvasAudioVisualizer" width="600" height="120" role="img" aria-label="Audio frequency visualizer"></canvas>`.
   - Stereo VU meters container (`.vu-meters-container`) with `#vuBarLeft`, `#vuBarRight`, `#vuValLeft`, `#vuValRight`, and `#vuClipIndicator`.
3. Remove the Master Boost slider and 3 enhancement switches from inside this card (they move into `#heroAudioEqCard` in Step 1.2).

### Step 1.2: Consolidate Master Boost & Enhancements into `#heroAudioEqCard`
1. In `#heroAudioEqCard` (`bento-span-12`), insert the Audio Lab Telemetry Badges (`#audioLabPresetBadge`, `#audioLabVocalBadge`, `#audioLabNightBadge`) in the `.eq-card-header`.
2. Above the `.eq-bands-grid`, add a dedicated studio gain & enhancement section:
   - Master Volume Boost slider (`#heroAudioBoostSlider`), readout (`#heroAudioBoostVal`), scale marks, and ARIA attributes (`role="slider"`, `min="0"`, `max="200"`, `step="5"`, `value="100"`).
   - Audio enhancement switches: Vocal Clarity (`#toggleVocalClarity`), Night Shield (`#toggleNightShield`), and Audio-Only Mode (`#toggleAudioOnlyMode`) with `role="switch"` and respective `data-i18n` labels (`#lblAudioVocalTitle`, `#lblAudioNightTitle`, `#lblAudioOnlyTitle`).
3. Retain the existing 5-Band Graphic Equalizer vertical sliders (`#eqBand60` through `#eqBand16000`), preset dropdown (`#audioEqPresetSelect`), and reset button (`#btnResetEq`).

### Step 1.3: Verify ARIA and Localization Attributes
1. Confirm all 18 IDs are present.
2. Confirm no duplicate IDs exist across `dashboard/dashboard.html`.
3. Confirm all switches retain `role="switch"` and all sliders retain `role="slider"`.

---

## 🚫 5. Architectural Constraints & Boundaries
- **Strict Prohibition on ID Deletions:** Do NOT delete or rename any DOM ID.
- **Zero Inline Event Handlers:** Do NOT add `onclick`, `onchange`, `oninput`, or `<script>` tags inside HTML markup.
- **W3C Trusted Types Compliance:** Maintain zero `.innerHTML` policy.

---

## 📦 6. Deliverables Manifest
- Modified: `dashboard/dashboard.html`

---

## 🚦 7. Local Verification Gate
Execute the following verification commands to ensure Phase 1 integrity:
```powershell
# 1. Verify syntax integrity of dashboard.js against DOM
node -c dashboard/dashboard.js

# 2. Check Phase 2 test suite for visualizer ID presence
node tests/test_dashboard_features_phase2.js

# 3. Check full audio lab test battery
node tests/test_dashboard_full_audio_lab_parity.js
```
All Phase 1 checks must pass cleanly before transitioning to Phase 2.
