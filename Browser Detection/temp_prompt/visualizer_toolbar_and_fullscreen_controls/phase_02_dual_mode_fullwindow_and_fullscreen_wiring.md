<!-- 0xEF, 0xBB, 0xBF UTF-8 BOM Encoded -->
# Phase 2 Execution Prompt: Dual-Mode Full Window (Theater) & True W3C Fullscreen JS Wiring

> **Execution Directive for Level 4 Fullstack Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 05 Frontend Engineering & Dept 04 System Architecture.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
> - **Security Standard:** 100% W3C Trusted Types Compliant (Zero innerHTML).

---

## 🎯 1. Phase Objective
Implement distinct, synchronized logic for Full Window (Theater) and Native W3C Fullscreen in `src/dashboard/features/media_deck_visualizer_feature.js` and `dashboard/dashboard.js`:
1. Decouple `setVisualizerFullscreenState` / `toggleVisualizerFullscreen` so that:
   - Full Window (Theater) Mode: toggles `#heroAudioLabStatus.visualizer-theater-mode` via `#btnVizFullWindow`.
   - Full Screen Mode: triggers `target.requestFullscreen()` / `document.exitFullscreen()` via `#btnVizFullscreen`.
2. Attach `fullscreenchange` listener to document to synchronize `#btnVizFullscreen` state automatically when entering/exiting (including on Esc key press).
3. Ensure graceful fallback to Full Window mode if `requestFullscreen()` rejects or is unavailable in the execution environment.
4. Update `dashboard/dashboard.js` event listeners to mirror modular feature functions.

---

## 📂 2. Target Files & Anchors
- **Visualizer Feature Module:** [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L605-L625)
- **Dashboard Facade Script:** [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L8580-L8600)

---

## 🛠️ 3. Step-by-Step Implementation Instructions

### Step 2.1: Implement Dual State Handlers in `media_deck_visualizer_feature.js`
1. **Full Window (Theater) Mode Logic:**
   ```javascript
   let isFullWindowActive = false;

   function setVisualizerFullWindowState(active, options = {}) {
     isFullWindowActive = Boolean(active);
     const doc = options.doc || (typeof document !== 'undefined' ? document : null);
     if (!doc) return isFullWindowActive;

     const card = doc.getElementById('heroAudioLabStatus');
     const btn = doc.getElementById('btnVizFullWindow');
     const canvas = visualizerCanvas || doc.getElementById('canvasAudioVisualizer');

     if (card) {
       if (isFullWindowActive) {
         card.classList.add('visualizer-theater-mode');
         if (doc.body) doc.body.classList.add('visualizer-theater-active');
       } else {
         card.classList.remove('visualizer-theater-mode');
         if (doc.body) doc.body.classList.remove('visualizer-theater-active');
       }
     }

     if (btn) {
       btn.setAttribute('aria-expanded', isFullWindowActive ? 'true' : 'false');
       if (isFullWindowActive) {
         btn.classList.add('active');
         btn.setAttribute('title', 'Exit Visualizer Full Window (Theater)');
         btn.setAttribute('aria-label', 'Exit Visualizer Full Window (Theater)');
       } else {
         btn.classList.remove('active');
         btn.setAttribute('title', 'Toggle Visualizer Full Window (Theater)');
         btn.setAttribute('aria-label', 'Toggle Visualizer Full Window (Theater)');
       }
     }

     if (canvas) {
       resizeVisualizerCanvas(canvas, isFullWindowActive || isNativeFullscreenActive);
     }

     return isFullWindowActive;
   }

   function toggleVisualizerFullWindow(options = {}) {
     return setVisualizerFullWindowState(!isFullWindowActive, options);
   }
   ```

2. **Native W3C Fullscreen Logic:**
   ```javascript
   let isNativeFullscreenActive = false;

   function updateFullscreenButtonState(doc, active) {
     const btn = doc.getElementById('btnVizFullscreen');
     if (!btn) return;
     btn.setAttribute('aria-expanded', active ? 'true' : 'false');
     if (active) {
       btn.classList.add('active');
       btn.setAttribute('title', 'Exit Fullscreen Visualizer');
       btn.setAttribute('aria-label', 'Exit Fullscreen Visualizer');
     } else {
       btn.classList.remove('active');
       btn.setAttribute('title', 'Toggle Visualizer Fullscreen');
       btn.setAttribute('aria-label', 'Toggle Visualizer Fullscreen');
     }
     const iconExpand = btn.querySelector ? btn.querySelector('.viz-icon-expand') : null;
     const iconCompress = btn.querySelector ? btn.querySelector('.viz-icon-compress') : null;
     if (iconExpand && iconCompress) {
       if (active) {
         iconExpand.classList.add('visually-hidden');
         iconCompress.classList.remove('visually-hidden');
       } else {
         iconExpand.classList.remove('visually-hidden');
         iconCompress.classList.add('visually-hidden');
       }
     }
   }

   function toggleVisualizerFullscreen(options = {}) {
     const doc = options.doc || (typeof document !== 'undefined' ? document : null);
     if (!doc) return false;

     const targetEl = doc.getElementById('heroAudioLabStatus') || doc.getElementById('visualizerPanel');
     const isCurrentlyFs = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);

     if (isCurrentlyFs) {
       if (doc.exitFullscreen) {
         doc.exitFullscreen().catch(() => {});
       } else if (doc.webkitExitFullscreen) {
         doc.webkitExitFullscreen();
       }
     } else if (targetEl) {
       if (targetEl.requestFullscreen) {
         targetEl.requestFullscreen().catch(() => {
           // Fallback to Full Window mode if native fullscreen is denied
           toggleVisualizerFullWindow(options);
         });
       } else if (targetEl.webkitRequestFullscreen) {
         targetEl.webkitRequestFullscreen();
       } else {
         toggleVisualizerFullWindow(options);
       }
     }
     return !isCurrentlyFs;
   }
   ```

3. **Event Listeners Binding:**
   Bind click listener on `#btnVizFullWindow` and `#btnVizFullscreen`.
   Bind `fullscreenchange` and `webkitfullscreenchange` on `doc`:
   ```javascript
   if (!doc.__vizFullscreenEventBound) {
     doc.__vizFullscreenEventBound = true;
     const onFsChange = () => {
       isNativeFullscreenActive = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
       updateFullscreenButtonState(doc, isNativeFullscreenActive);
       const canvas = visualizerCanvas || doc.getElementById('canvasAudioVisualizer');
       if (canvas) resizeVisualizerCanvas(canvas, isNativeFullscreenActive || isFullWindowActive);
     };
     doc.addEventListener('fullscreenchange', onFsChange);
     doc.addEventListener('webkitfullscreenchange', onFsChange);
   }
   ```

4. **Export Methods:**
   Export `toggleVisualizerFullWindow`, `setVisualizerFullWindowState`, `toggleVisualizerFullscreen`, `setVisualizerFullscreenState`.

---

## 🔍 4. Verification Gate
- Unit tests verify clicking `#btnVizFullWindow` sets `.visualizer-theater-mode`.
- Unit tests verify clicking `#btnVizFullscreen` invokes `requestFullscreen()`.
- Exiting fullscreen via `fullscreenchange` event syncs button attributes cleanly.
