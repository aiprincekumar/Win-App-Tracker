# Executive Architecture Summary: Real-Time Spectrum Visualizer Runtime Wiring

> **Initiative:** Web Activity & Media Sentinel MV3 Extension - Real-Time Audio Visualizer Runtime Activation  
> **Workspace Container:** `temp_prompt/visualizer_runtime_wiring/`  
> **Target Files:** `dashboard/dashboard.html`, `dashboard/dashboard.js`, `src/dashboard/features/media_deck_visualizer_feature.js`, `tests/`  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  

---

## 🎯 1. High-Level Technical Objectives

1. **Eliminate Browser Runtime Loading Disconnect:**
   Bridge the architectural gap between the Node.js test environment (which loaded `media_deck_visualizer_feature.js` via `require()`) and the Chrome MV3 browser extension runtime (where `require` is unavailable and `dashboard.html` previously omitted the script tag).

2. **Complete End-to-End Interactivity & Telemetry Pipeline:**
   - Link the existing 60fps canvas visualizer engine directly into `dashboard.html`.
   - Ensure `#btnVizModeBars` and `#btnVizModeWave` toggle between 32-Band FFT Spectrum and Oscilloscope Waveform traces with tactile visual states.
   - Bind real-time decibel calculations (-40dB to +6dB) to stereo VU meter bars (`#vuBarLeft`, `#vuBarRight`), textual readouts (`#vuValLeft`, `#vuValRight`), and +0dB clipping indicator (`#vuClipIndicator`).

3. **Enforce Zero-Overhead Idle Sleep Sentinel:**
   Strictly suspend the `requestAnimationFrame` loop (0% CPU, 0% GPU draw calls) when:
   - Media playback is paused or stopped.
   - The dashboard tab is hidden or minimized (`document.visibilityState === 'hidden'`).
   Automatically wake the visualizer and resume 60fps telemetry rendering when media starts playing and the tab is visible.

4. **100% Security & Standards Compliance:**
   - Zero `.innerHTML` assignments (100% W3C Trusted Types safe).
   - Zero inline event handlers (Manifest V3 CSP compliant).
   - UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) encoding on all touched files.
   - Full regression passage across all 48 existing test suites in `tests/`.

---

## 🗺️ 2. Milestone Roadmap & Dependency Topology

```mermaid
flowchart TD
    subgraph Phase1 ["Phase 1: Script Linking & Runtime Bridge"]
        P1_HTML["dashboard.html: Add media_deck_visualizer_feature.js Script Tag"]
        P1_Bridge["dashboard.js: Resilient Module Resolution & Null-Safe Facade"]
        P1_HTML --> P1_Bridge
    end

    subgraph Phase2 ["Phase 2: Visualizer Engine & Event Wiring"]
        P2_Init["initAudioVisualizer Canvas & Context Binding"]
        P2_Events["Mode Switcher Buttons: Bars vs Waveform"]
        P2_Media["Live Audio State Sync: activeMediaStreams & primaryMedia"]
        P2_Render["60fps FFT / Oscilloscope + Stereo VU dB Calculation"]
        P1_Bridge --> P2_Init
        P2_Init --> P2_Events
        P2_Init --> P2_Media
        P2_Media --> P2_Render
    end

    subgraph Phase3 ["Phase 3: QA Verification & Sleep Sentinel"]
        P3_Sleep["Sleep Sentinel: Idle 0% CPU & Tab Hidden RAF Pause"]
        P3_Test["Dedicated Integration Test: Browser Runtime Parity"]
        P3_Regress["Full Regression: All 48 Test Suites Green (Exit 0)"]
        P3_Audit["BOM Encoding & Gitleaks Secret Audit"]
        P2_Render --> P3_Sleep
        P3_Sleep --> P3_Test
        P3_Test --> P3_Regress
        P3_Regress --> P3_Audit
    end
```

---

## 🛡️ 3. Risk Mitigation & Architectural Tradeoffs

| Risk Category | Potential Failure Mode | Architectural Mitigation |
| :--- | :--- | :--- |
| **Script Load Order** | `dashboard.js` executes before `media_deck_visualizer_feature.js` finishes loading. | Place `<script src="../src/dashboard/features/media_deck_visualizer_feature.js"></script>` strictly **BEFORE** `<script src="dashboard.js"></script>`. In `dashboard.js`, implement a dynamic deferred binding inside `DOMContentLoaded`. |
| **Security / CSP** | Extension rejected due to inline scripts or unsafe eval. | Zero inline scripts; use only standard relative `<script src="...">` tags; zero innerHTML assignments. |
| **Performance Drag** | Uncapped RAF loop draining user battery or CPU cycles when idle. | The Zero-Overhead Idle Sleep Sentinel automatically cancels `requestAnimationFrame` when `isPlaying === false` or `document.visibilityState === 'hidden'`. |
| **DOM Null Reference** | Canvas or VU meter elements queried before DOM is ready. | All DOM element bindings are guarded with null-checks and initialized during `DOMContentLoaded` / `window.onload`. |
