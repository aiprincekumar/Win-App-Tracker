# Phase 1 Execution Prompt: Script Linking & Runtime Module Bridging

> **Phase:** 1 of 3  
> **Target Role:** Level 4 Frontend Engineer  
> **Focus:** Script tag linking in `dashboard/dashboard.html` & resilient browser module resolution in `dashboard/dashboard.js`  
> **Prerequisites:** None  
> **Governing Spec:** [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/visualizer_runtime_wiring/TRD.md)  

---

## 🎯 1. Phase Objective
Link `src/dashboard/features/media_deck_visualizer_feature.js` into `dashboard/dashboard.html` using a clean relative script tag, and reinforce `dashboard/dashboard.js` with resilient browser runtime module resolution and dynamic fallback so that `_MediaDeckVisualizer` is never null in the browser runtime.

---

## 📂 2. Target Files & Line Anchors
1. [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L1690-L1705):
   - Add `<script src="../src/dashboard/features/media_deck_visualizer_feature.js"></script>` directly before `<script src="dashboard.js"></script>`.
2. [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L70-L96):
   - Enhance `_MediaDeckVisualizer` resolution to check `window.MediaDeckVisualizerFeature` and `globalThis.MediaDeckVisualizerFeature`.
   - Ensure helper/facade functions safely retrieve the resolved visualizer instance.

---

## 🛠️ 3. Surgical Instructions

1. **Update `dashboard/dashboard.html`:**
   Locate line ~1698 where `<script src="dashboard.js"></script>` is declared.
   Insert the feature script tag:
   ```html
     <!-- Feature Modules (Browser-accessible relative imports) -->
     <script src="../src/dashboard/features/media_deck_visualizer_feature.js"></script>
     <script src="dashboard.js"></script>
   ```

2. **Enhance Module Resolution in `dashboard/dashboard.js`:**
   In `dashboard/dashboard.js`, ensure `_MediaDeckVisualizer` checks `window.MediaDeckVisualizerFeature` and provides a getter or runtime fallback function `getVisualizerFeature()`:
   ```javascript
   function getVisualizerFeature() {
     if (typeof globalThis !== 'undefined' && globalThis.MediaDeckVisualizerFeature) {
       return globalThis.MediaDeckVisualizerFeature;
     }
     if (typeof window !== 'undefined' && window.MediaDeckVisualizerFeature) {
       return window.MediaDeckVisualizerFeature;
     }
     return _MediaDeckVisualizer;
   }
   ```
   Update all visualizer facades (`initAudioVisualizer`, `setVisualizerMode`, `renderVisualizerFrame`, `startVisualizerLoop`, `stopVisualizerLoop`, `setAudioPlayingState`, `getVisualizerState`) to use `getVisualizerFeature()`.

3. **Preserve Trusted Types & Zero CSP Violations:**
   Zero `.innerHTML` assignments.
   Preserve UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🧪 4. Local Test Gate
Execute:
```powershell
node -c dashboard/dashboard.js
```
Verify script tag exists in `dashboard/dashboard.html` and AST parses with 0 syntax errors.
