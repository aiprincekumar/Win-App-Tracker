# Real-Time Spectrum Visualizer Runtime Wiring & Logic Completion: Master Tracking Board

> **Document Type:** Live Phase Orchestration Index, Problem-Solution Dossier & Diagnostic Matrix  
> **Workspace Container:** `temp_prompt/visualizer_runtime_wiring/`  
> **Governing Architecture:** [PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Date:** 2026-11-17  
> **Target Task ID:** TASK-VIZ-RUNTIME-WIRING-001  
> **Target Scope:** Full-stack MV3 Dashboard Visualizer Wiring (`dashboard/dashboard.html`, `dashboard/dashboard.js`, `src/dashboard/features/media_deck_visualizer_feature.js`, and dedicated QA tests).

---

## 📋 1. Executive Problem-Solution Dossier

### Problem Statement
The user reported:
> "Real-Time Spectrum Visualizer यह सेक्शन काम नहीं कर रहा है, इसके लिए बैकएंड लॉजिक लिखो। और लिखने से पहले यह देख लेना कि कहीं पहले से तो नहीं लिखा हुआ है और लिंक नहीं है, जिस कारण यह काम नहीं कर रहा है। अगर लिंक नहीं है तो लिंक करो और अगर लॉजिक लिखा ही हुआ नहीं है तो लॉजिक ऐड करो। कुल मिलाकर कहने का मतलब यह है कि इसको वर्केबल बनाओ। सिर्फ अभी UI/UX है, कोई लॉजिक नहीं है, मतलब कुछ भी काम नहीं कर रहा है।"

### Root Cause Diagnosis
1. **Existing Implementation Status:**
   - The visualizer logic is **ALREADY FULLY WRITTEN** inside `src/dashboard/features/media_deck_visualizer_feature.js`. It contains:
     - 60fps canvas visualizer engine with double-buffered rendering
     - 32-Band FFT spectrum analyzer with dynamic gradient bars and falling peak-hold dots
     - Oscilloscope waveform trace mode (neon cyan sine trace)
     - Stereo VU meter decibel calculations (-40dB to +6dB) with left/right level bars and +0dB clipping indicator
     - Mode switcher handlers (`#btnVizModeBars`, `#btnVizModeWave`)
     - Procedural audio telemetry synthesizer (`synthesizeAudioTelemetry`)
     - Zero-overhead idle sleep sentinel (pauses RAF loop on hidden tab or paused audio)
2. **The Missing Runtime Link:**
   - In `dashboard/dashboard.html`, only `<script src="dashboard.js"></script>` is loaded.
   - In `dashboard/dashboard.js` (lines 49-76):
     ```javascript
     const _MediaDeckVisualizer = (typeof globalThis !== 'undefined' && globalThis.MediaDeckVisualizerFeature) 
       ? globalThis.MediaDeckVisualizerFeature 
       : _safeRequire('./src/dashboard/features/media_deck_visualizer_feature.js', '../src/dashboard/features/media_deck_visualizer_feature.js');
     ```
   - In Chrome MV3 browser context, `require` does NOT exist.
   - Because `media_deck_visualizer_feature.js` is never loaded via a `<script>` tag in `dashboard.html`, `globalThis.MediaDeckVisualizerFeature` is `undefined`.
   - Consequently, `_MediaDeckVisualizer` evaluates to `null`.
   - All facade functions in `dashboard.js` (`initAudioVisualizer`, `setVisualizerMode`, `renderVisualizerFrame`, `startVisualizerLoop`, `stopVisualizerLoop`, `setAudioPlayingState`, `getVisualizerState`) fail silently or return `null`.
   - No click handlers are bound to `#btnVizModeBars` or `#btnVizModeWave`.
   - The canvas remains black, VU meters stay at `-∞dB` (0% width), and the UI remains completely inactive.

### Architectural Solution
1. **Script Tag Linking in `dashboard/dashboard.html`:**
   - Add `<script src="../src/dashboard/features/media_deck_visualizer_feature.js"></script>` immediately prior to `<script src="dashboard.js"></script>`.
   - Ensure clean execution order without breaking CSP or Trusted Types.
2. **Resilient Browser Bridge in `dashboard/dashboard.js`:**
   - Strengthen `_MediaDeckVisualizer` resolution with direct window lookup and resilient fallback.
   - Bind click events for mode buttons (`#btnVizModeBars`, `#btnVizModeWave`) directly in `dashboard.js` as well as feature module.
   - Synchronize live audio playback states (`pm.isPlaying`, `activeMediaStreams`) with `setAudioPlayingState(true/false)`.
   - Ensure `initAudioVisualizer(canvas)` is called on dashboard DOM ready.
3. **End-to-End Interactivity & Zero-Overhead Sleep:**
   - Auto-wake visualizer when media streams are detected playing.
   - Auto-sleep (0% CPU / RAF cancellation) when media is paused or dashboard tab is hidden (`document.visibilityState === 'hidden'`).
   - Stereo VU meter decibel calculations update in real time with audio telemetry.
4. **Independent QA Verification:**
   - Dedicated integration test suite proving browser-runtime linkage, mode toggling, VU meter width calculations, and idle sleep.
   - Verify all 48 test suites in `tests/` pass cleanly with exit code 0.
   - 100% UTF-8 with BOM compliance on all touched files.

---

## 🚦 2. Universal 7-Column Diagnostic Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `dashboard/dashboard.html` | Missing `<script>` tag for `media_deck_visualizer_feature.js`; browser never loads module into `globalThis`. | Add `<script src="../src/dashboard/features/media_deck_visualizer_feature.js"></script>` before `dashboard.js`. | `globalThis.MediaDeckVisualizerFeature` is populated on page load. | Phase 1 | DOM script tag presence check & AST parse |
| 2 | `dashboard/dashboard.js` | `_MediaDeckVisualizer` null-check fails in browser; facade functions return null; mode buttons unbound. | Enhance module resolution bridge, wire click handlers, and ensure active playback state synchronizes with visualizer. | Mode buttons switch visualizer state; canvas renders 60fps; VU meters live. | Phase 2 | `node -c dashboard/dashboard.js` & mode switcher tests |
| 3 | `src/dashboard/features/media_deck_visualizer_feature.js` | Potential edge case where DOM elements are queried before DOMContentLoaded or if canvas sizing is dynamic. | Ensure defensive DOM queries, robust fallback context, and clean idle baseline rendering. | Visualizer renders reliably across all screen sizes and tab states. | Phase 2 | Battery 6-8 tests in `test_dashboard_features_phase2.js` |
| 4 | `tests/test_visualizer_runtime_wiring.js` | Lack of dedicated test verifying browser script-loading simulation without Node.js `require` fallback. | Implement comprehensive integration test verifying non-require browser execution, mode toggle, and VU meter styling. | Prevents silent regression where visualizer breaks in extension runtime. | Phase 3 | `node tests/test_visualizer_runtime_wiring.js` (Exit 0) |

---

## 🏁 3. Phase Status Checklist

| Phase # | Phase Name | Focus & Scope | Assigned Role | Status | Test Gate | QA Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Script Linking & Runtime Module Bridging | Add script tag in `dashboard.html`, verify CSP, enhance module resolution in `dashboard.js` | Level 4 Frontend Engineer | PENDING | `node -c`, script tag presence, 0 innerHTML | Pending Gate 1 |
| **Phase 2** | Visualizer Engine & Event Wiring | Wire mode buttons, connect `activeMediaStreams` & `primaryMedia`, enable 32-band FFT & wave rendering | Level 4 Audio/Visualizer Engineer | PENDING | Mode toggle tests, VU meter level calculations | Pending Gate 2 |
| **Phase 3** | QA Verification, Sleep Sentinel & BOM | Build integration test, verify zero-overhead sleep, run all 48 test suites, verify UTF-8 BOM | Level 4 Independent QA Engineer | PENDING | Full test suite clean pass (48/48 exit code 0), gitleaks 0 leaks | Pending Gate 3 |
