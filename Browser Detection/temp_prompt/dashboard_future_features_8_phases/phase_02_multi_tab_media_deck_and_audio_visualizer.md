# Phase 2: Multi-Tab Live Media Deck & Audio Visualizer (Features 3 & 4)
## Standalone Executable Implementation Specification

> **Task ID:** `TASK-DASHBOARD-FUTURE-8-FEATURES-001` (Phase 2)  
> **Target Subsystems:** Feature 3 (Multi-Tab Media Deck) & Feature 4 (60fps Canvas Audio Visualizer)  
> **Assigned Role:** Level 4 Full-Stack / Media Engineer  
> **Required Skills:** `frontend-patterns`, `backend-patterns`, `javascript`, `web-design-guidelines`  
> **Target Test Gate:** `tests/test_dashboard_features_phase2.js` (Must pass with Exit Code 0)  
> **Master Reference:** [`dashboard_future_features_prompt.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard_future_features_prompt.md)  
> **Parent Ephemeral:** `temp_prompt/dashboard_future_features_8_phases/`  

---

## 🎯 1. Phase Objective

Implement **Feature 3 (Multi-Tab Live Media Deck)** and **Feature 4 (Real-Time Audio Visualizer & Frequency Spectrum Analyzer)** across the Sentinel Dashboard and background service worker.
This enables users to:
1. Concurrently view, monitor, and remotely operate all open browser tabs containing active or audible media streams.
2. Execute "Solo Tab" mode (muting all other browser tabs instantly with one click) and "Global Mute Others".
3. Experience a hardware-accelerated 60fps real-time visualizer on `#canvasAudioVisualizer` with dual modes (32-band FFT gradient bars with peak-hold dots and neon oscilloscope waveform trace).
4. Monitor stereo VU peak meters (-40dB to +6dB) with +0dB red clipping detection.
5. Guarantee zero-overhead CPU usage via an automatic idle sleep loop when media is paused or the dashboard tab is in the background.

---

## 📦 2. Prerequisites & Environment State

- Phase 1 completed and verified with `tests/test_dashboard_features_phase1.js` passing clean.
- Certified codebase: `dashboard/dashboard.html`, `dashboard/dashboard.js`, `dashboard/dashboard.css`, `background.js`.
- Active working memory: [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md) and [`project_feature_memory.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/project_feature_memory.md).

---

## 🔍 3. Technical Context & File Anchors

- `background.js`:
  - Locate `chrome.runtime.onMessage.addListener` (lines 350-550).
  - Add IPC message handler for `DASHBOARD_GET_ALL_MEDIA_STREAMS`.
  - Add IPC handler for `MEDIA_STREAM_SOLO`.
- `dashboard/dashboard.html`:
  - In `#paneMedia`, insert container `#multiTabMediaDeck` above or beside the primary Hero player card.
  - In `#heroAudioLabStatus` or `#cardHeroPlayer`, insert the visualizer container with `<canvas id="canvasAudioVisualizer" width="600" height="120"></canvas>`, mode toggle buttons (`btnVisualizerBars`, `btnVisualizerWave`), and stereo VU level bars (`vuMeterLeft`, `vuMeterRight`).
- `dashboard/dashboard.js`:
  - Merge `DASHBOARD_FUTURE_I18N` keys for Features 3 & 4 into `en` and `hi`.
  - Implement `pollMultiTabMediaStreams()`.
  - Implement `renderMultiTabMediaDeck(tabsList)`.
  - Implement `handleRemoteMediaCommand(tabId, command, value)`.
  - Implement `handleSoloTab(targetTabId)`.
  - Implement `initAudioVisualizer()`, `renderVisualizerFrame()`, `startVisualizerLoop()`, and `stopVisualizerLoop()`.
  - Add `document.addEventListener('visibilitychange')` to halt RAF rendering when tab is hidden.
- `dashboard/dashboard.css`:
  - Multi-tab card grid layout (`.media-deck-grid`, `.media-deck-card`).
  - Visualizer canvas and VU level bar styling according to `DESIGN.md`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 1: Background Service Worker Multi-Tab Stream Discovery
1. Open `background.js`.
2. Implement helper `getAllActiveMediaStreams()`:
   - Queries `chrome.tabs.query({ audible: true })`.
   - Iterates entries in `tabMediaMap`.
   - Merges and deduplicates tab info into an array of `MediaStreamTabInfo` objects (tabId, windowId, url, domain, title, favIconUrl, isAudible, isMuted, playbackState, currentTime, duration, volume).
3. In `chrome.runtime.onMessage.addListener`, handle:
   - `action === 'DASHBOARD_GET_ALL_MEDIA_STREAMS'`: sendResponse with `getAllActiveMediaStreams()`.
   - `action === 'MEDIA_STREAM_SOLO'`: unmutes `message.soloTabId` and mutes every other tab using `chrome.tabs.update(tId, { muted: true })`.

### Step 2: Multi-Tab Live Media Deck UI in `dashboard/dashboard.html`
1. In `#paneMedia`, add container `#multiTabMediaDeckContainer`:
   ```html
   <div id="multiTabMediaDeckContainer" class="card media-deck-container">
     <div class="card-header">
       <h3 id="txtMediaDeckTitle">🎬 Multi-Tab Live Media Deck</h3>
       <button id="btnMuteAllOthers" class="btn btn-sm btn-secondary">🔇 Mute All Others</button>
     </div>
     <div id="mediaDeckGrid" class="media-deck-grid">
       <!-- Dynamically populated via renderMultiTabMediaDeck -->
     </div>
   </div>
   ```

### Step 3: Real-Time Audio Visualizer UI in `dashboard/dashboard.html`
1. Inside `#heroAudioLabStatus`, add `#visualizerPanel`:
   ```html
   <div id="visualizerPanel" class="visualizer-panel">
     <div class="visualizer-header">
       <span id="txtVisualizerTitle">🎛️ Real-Time Spectrum Visualizer</span>
       <div class="visualizer-controls">
         <button id="btnVizModeBars" class="btn btn-xs btn-active">32-Band FFT</button>
         <button id="btnVizModeWave" class="btn btn-xs">Waveform</button>
       </div>
     </div>
     <canvas id="canvasAudioVisualizer" width="600" height="120" role="img" aria-label="Audio frequency visualizer"></canvas>
     <div class="vu-meters-container">
       <div class="vu-bar-wrapper"><span>L</span><div class="vu-meter"><div id="vuBarLeft" class="vu-level"></div></div></div>
       <div class="vu-bar-wrapper"><span>R</span><div class="vu-meter"><div id="vuBarRight" class="vu-level"></div></div></div>
       <span id="vuClipIndicator" class="vu-clip-badge">0dB OK</span>
     </div>
   </div>
   ```

### Step 4: Logic Implementation in `dashboard/dashboard.js`
1. In `initDashboard()`, register polling or event listening for multi-tab media streams:
   - Call `chrome.runtime.sendMessage({ action: 'DASHBOARD_GET_ALL_MEDIA_STREAMS' })`.
   - Update `#mediaDeckGrid` with active cards.
   - Attach click listeners for Play/Pause, Mute, Volume, Scrubber, and "Solo Tab".
   - Wire "Solo Tab" to dispatch `MEDIA_STREAM_SOLO`.
2. Implement Canvas Audio Visualizer Engine:
   - Obtain canvas context `ctx = canvas.getContext('2d')`.
   - Connect or simulate 32-band FFT frequency array and time-domain waveform data from audio telemetry.
   - Implement `renderVisualizerFrame()`:
     - Mode A: Clears canvas with slight alpha trail, renders 32 gradient vertical bars (Emerald -> Cyan -> Violet) with white peak-hold dots that drop with realistic gravity.
     - Mode B: Draws neon continuous oscilloscope waveform trace.
     - Computes stereo RMS / peak amplitude, updating `#vuBarLeft` and `#vuBarRight` width, and triggers `#vuClipIndicator` red if signal $\ge 0\text{dB}$.
   - Attach idle sleep sentinel:
     - If media is paused OR `document.hidden`, call `cancelAnimationFrame(rafId)` and clear canvas.
     - When resumed or tab becomes visible, restart RAF loop.

### Step 5: Styling in `dashboard/dashboard.css`
1. Style `.media-deck-grid` with responsive CSS Grid (`repeat(auto-fill, minmax(280px, 1fr))`).
2. Style `.media-deck-card` with Liquid Glass borders, status badges, and mini sliders.
3. Style `#canvasAudioVisualizer` with rounded corners and high-contrast backdrop.
4. Style `.vu-meter` and `.vu-level` with gradient green-to-red indicators.

---

## 🚫 5. Architectural Constraints & Out-of-Scope Boundaries

- **Zero-innerHTML:** Construct deck cards and tooltips using `document.createElement`.
- **Sub-10ms Render Budget:** Never execute heavy calculations or blocking DOM reads inside `requestAnimationFrame`.
- **Strict Single-Dispatch Determinism:** When clicking media controls in multi-tab deck cards, dispatch IPC deterministically without duplicate race conditions.

---

## 📋 6. Deliverables Manifest

1. `background.js` (`DASHBOARD_GET_ALL_MEDIA_STREAMS` and `MEDIA_STREAM_SOLO` handlers).
2. `dashboard/dashboard.html` (`#multiTabMediaDeckContainer`, `#canvasAudioVisualizer`, VU meters).
3. `dashboard/dashboard.js` (Multi-tab deck rendering, solo mode, 60fps canvas engine, sleep loop).
4. `dashboard/dashboard.css` (Grid styling, deck cards, canvas styling, VU bars).
5. `tests/test_dashboard_features_phase2.js` (Automated verification test suite).

---

## 🧪 7. Local Verification Gate (Test Gate 2)

Execute the dedicated test suite:
```powershell
node tests/test_dashboard_features_phase2.js
node -c background.js
node -c dashboard/dashboard.js
```

### Acceptance Criteria:
1. `tests/test_dashboard_features_phase2.js` exits with code 0.
2. Background service worker reliably identifies and reports multiple audible/media tabs.
3. Solo Tab muting sends mute commands to all other tabs while preserving the target tab.
4. Canvas visualizer renders 32 bands and waveform cleanly, and enters 0% CPU sleep mode when paused or hidden.
5. Node.js AST check (`node -c`) reports 0 syntax errors.
6. All files verified UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
