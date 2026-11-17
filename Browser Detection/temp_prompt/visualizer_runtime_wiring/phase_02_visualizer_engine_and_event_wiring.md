# Phase 2 Execution Prompt: Visualizer Engine & Event Wiring

> **Phase:** 2 of 3  
> **Target Role:** Level 4 Audio/Visualizer Engineer  
> **Focus:** Event listeners for mode toggling, canvas initialization, and live audio telemetry integration  
> **Prerequisites:** Phase 1 complete  
> **Governing Spec:** [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/visualizer_runtime_wiring/TRD.md)  

---

## 🎯 1. Phase Objective
Wire interactive mode switching buttons (`#btnVizModeBars` and `#btnVizModeWave`), ensure canvas visualizer is reliably initialized on DOM load, and synchronize live media playback state (`activeMediaStreams` and `primaryMedia.isPlaying`) with `setAudioPlayingState()` so the spectrum visualizer and stereo VU meters actively respond in real time.

---

## 📂 2. Target Files & Line Anchors
1. [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L2210-L2265):
   - Visualizer facades and mode handler bindings.
2. [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L4740-L4755):
   - Update `setAudioPlayingState()` call site with active media streams.
3. [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L7860-L7885):
   - DOM Ready initialization and button listener attachment.
4. [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L415-L495):
   - Defensively query DOM elements and ensure click listeners update button active classes (`btn-active` / `active`).

---

## 🛠️ 3. Surgical Instructions

1. **Explicit Mode Switcher Event Binding:**
   In `dashboard/dashboard.js`, in the initialization block (around lines 7860-7885):
   Ensure both `#btnVizModeBars` and `#btnVizModeWave` have direct, CSP-safe event listeners attached:
   ```javascript
   const btnBars = document.getElementById('btnVizModeBars');
   const btnWave = document.getElementById('btnVizModeWave');
   if (btnBars) {
     btnBars.addEventListener('click', () => {
       setVisualizerMode('bars');
     });
   }
   if (btnWave) {
     btnWave.addEventListener('click', () => {
       setVisualizerMode('wave');
     });
   }
   ```

2. **Synchronize Live Playback State:**
   Ensure that whenever media state is updated (`updateDashboardUI`, `updateMediaAnalytics`, or streaming polling):
   Check if any stream is currently playing:
   ```javascript
   const anyPlaying = Boolean((pm && pm.isPlaying) || (activeMediaStreams && activeMediaStreams.some(s => s.isPlaying && !s.isMuted)));
   setAudioPlayingState(anyPlaying);
   ```

3. **Verify Canvas Visualizer Initialization:**
   Ensure `initAudioVisualizer` is invoked with the canvas element and that visualizer context is properly bound.

4. **Preserve Trusted Types & Zero CSP Violations:**
   Zero `.innerHTML` assignments.
   Preserve UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🧪 4. Local Test Gate
Execute:
```powershell
node tests/test_dashboard_features_phase2.js
```
Verify Battery 6 (60fps Canvas Audio Visualizer Engine) and Battery 7 (Stereo VU Peak Level Meters) pass 100% clean.
