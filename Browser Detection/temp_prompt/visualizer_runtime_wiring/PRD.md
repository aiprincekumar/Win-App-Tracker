# Product Requirements Document (PRD): Real-Time Spectrum Visualizer

> **Document Type:** Product Requirements Document  
> **Target Container:** `temp_prompt/visualizer_runtime_wiring/`  
> **Status:** APPROVED FOR IMPLEMENTATION  

---

## 👥 1. User Personas & Pain Points

- **Primary Persona:** Power User / Media Producer auditing background media consumption, audio levels, and tab playback through the Web Activity & Media Sentinel extension.
- **Current Pain Point:**
  The user views the Real-Time Spectrum Visualizer Bento card in the dashboard. While the UI canvas and buttons exist, the visualizer does not react to playing media, the mode switch buttons (32-Band FFT vs Waveform) do not toggle, the canvas stays black, and the stereo VU meters remain permanently frozen at `-∞dB`. The user explicitly demanded:
  *"Real-Time Spectrum Visualizer यह सेक्शन काम नहीं कर रहा है, इसके लिए बैकएंड लॉजिक लिखो... अगर लिंक नहीं है तो लिंक करो और अगर लॉजिक लिखा ही हुआ नहीं है तो लॉजिक ऐड करो। कुल मिलाकर कहने का मतलब यह है कि इसको वर्केबल बनाओ।"*

---

## 📋 2. Functional Requirements (FR)

- **FR-01 (Script Linking):** The dashboard HTML page must cleanly load `media_deck_visualizer_feature.js` so that `globalThis.MediaDeckVisualizerFeature` is available to the runtime without requiring CommonJS `require()`.
- **FR-02 (Dual Visualization Modes):**
  - **Mode A (32-Band FFT Spectrum):** 32 vertical frequency bars rendered with smooth cyber emerald (`#10b981`) -> electric cyan (`#06b6d4`) -> neon violet (`#8b5cf6`) gradient and falling peak-hold markers with realistic gravity drop.
  - **Mode B (Oscilloscope Waveform):** Neon cyan (`#06b6d4`) continuous sine wave trace with subtle glowing blur (`shadowBlur: 10`, `shadowColor: '#10b981'`).
- **FR-03 (Interactive Mode Switcher):** Clicking `#btnVizModeBars` switches the visualizer to FFT bars and adds the `.active` / `.btn-active` class. Clicking `#btnVizModeWave` switches to oscilloscope wave and adds the `.active` class.
- **FR-04 (Stereo VU Meter decibel Readouts):**
  - Left channel level bar (`#vuBarLeft`) and decibel readout (`#vuValLeft`) dynamically reflect audio signal (-40dB to +6dB).
  - Right channel level bar (`#vuBarRight`) and decibel readout (`#vuValRight`) dynamically reflect audio signal (-40dB to +6dB).
  - When signals reach or exceed 0dB, the clipping indicator (`#vuClipIndicator`) activates with `.clipping` class and displays `0dB CLIP!`; otherwise displays `0dB OK`.
- **FR-05 (Media Playback Auto-Sync):**
  - When background or tab media is playing (`isPlaying === true`), visualizer wakes up automatically and renders at 60fps.
  - When media is paused or stopped, visualizer gracefully halts and displays a calm idle baseline.

---

## ⚡ 3. Non-Functional Requirements (NFR)

- **NFR-01 (Zero-Overhead Idle Sleep):** Strict 0% CPU consumption when media is paused or dashboard tab is hidden (`document.visibilityState === 'hidden'`). No continuous unthrottled RAF timers.
- **NFR-02 (Security & CSP):** 100% W3C Trusted Types safe: zero `.innerHTML` assignments, zero `dangerouslySetInnerHTML`, zero `eval()`, and zero inline `onclick` attributes.
- **NFR-03 (Performance):** 60fps frame rate during active playback on standard hardware with negligible garbage collection pressure (pre-allocated `Float32Array` buffers).
- **NFR-04 (Encoding):** 100% UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) compliance.

---

## ✅ 4. Given-When-Then Acceptance Criteria

```gherkin
Scenario: Browser Page Load & Visualizer Module Binding
  Given the user opens dashboard/dashboard.html in Chrome
  When the page finishes loading scripts
  Then window.MediaDeckVisualizerFeature is defined
  And initAudioVisualizer executes successfully on #canvasAudioVisualizer

Scenario: Interactive Mode Switching
  Given the visualizer is initialized
  When the user clicks #btnVizModeWave
  Then visualizer mode transitions to 'wave'
  And #btnVizModeWave acquires the 'btn-active' class
  And #btnVizModeBars loses the 'btn-active' class
  When the user clicks #btnVizModeBars
  Then visualizer mode transitions to 'bars'
  And #btnVizModeBars acquires the 'btn-active' class

Scenario: Live Audio Playback & VU Meter Telemetry
  Given active media starts playing in an open browser tab
  When dashboard receives playback telemetry (isPlaying: true)
  Then the 60fps render loop starts
  And #vuBarLeft and #vuBarRight animate their width percentages
  And #vuValLeft and #vuValRight display formatted decibel values (e.g. -12.4dB)

Scenario: Zero-Overhead Sleep on Media Pause or Hidden Tab
  Given the visualizer is actively rendering at 60fps
  When media is paused OR the dashboard tab is switched to background
  Then cancelAnimationFrame is called
  And the visualizer enters sleep mode with 0% CPU draw
```
