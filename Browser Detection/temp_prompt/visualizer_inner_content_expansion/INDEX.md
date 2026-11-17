# Phase-wise Execution Tracking Board & Problem-Solution Dossier
# Task: Visualizer Inner UI Content Expansion (Fill Outer Container Without Mutating Outer Bounds/Height)
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Governance & Specification Reference:**
> - **Lead Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Architecture Recommendation:** [`architecture_recommendation.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/architecture_recommendation.md)
> - **Prompt Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)
> - **Department Rules:** `dynamic_departments_matrix.md` (Dept 01 Product Requirements, Dept 04 Architecture, Dept 05 Frontend Engineering, Dept 08 QA & Testing)
> - **Decision Gate Assessment:** `PROMPT_FILES_REQUIRED = YES` (Compound UI/UX Flex Architecture & Canvas Render Adaptation)
> - **Recommended Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomous Forward Momentum, Autonomy Score: 1.0)
> - **Active Status:** `SPECIFICATION_LOCKED` (Ready for Level 2 Manager Authorization & Level 4 Sub Agent Dispatch)

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Problem Statement
1. **Visualizer Canvas Constriction & Dead Space:** In the current dashboard layout, the "Real-Time Spectrum Visualizer" card (`#heroAudioLabStatus`, `bento-span-4 bento-row-span-2`, `min-height: 380px`) contains an internal canvas container (`.visualizer-canvas-container`) locked to a rigid, hardcoded `height: 130px; min-height: 120px;`. This constricts the visualizer canvas to a small fraction of the available card space, leaving an awkward ~120px+ void/empty vertical dead zone inside the card.
2. **Absolute Outer Bounds Hard Lock Constraint:** The user requirement explicitly mandates that the outer container bounds, bento grid column/row spans (`bento-span-4 bento-row-span-2`), outer card padding, borders, and outer min-height (`min-height: 380px`) MUST NOT be increased or altered. The expansion must occur purely from within, allowing inner UI components to stretch organically to fill the chassis.
3. **Broken Internal Flex-Grow Propagation:** While `.visualizer-card-body` has `display: flex; flex-direction: column;`, the intermediate panel (`.visualizer-panel`) and the canvas wrapper (`.visualizer-canvas-container`) lack comprehensive elastic growth rules (`flex: 1 1 auto; height: 100%; min-height: 0;`). Consequently, available vertical space is left abandoned instead of being claimed by the frequency visualizer.
4. **Static Canvas Resolution & Waveform Compression:** In `dashboard.js` and `media_deck_visualizer_feature.js`, `#canvasAudioVisualizer` defaults to fixed baseline dimensions (`width="600" height="120"`). When the canvas container expands from 130px to ~200px-240px, the canvas internal resolution must adapt dynamically so that 32-band FFT bars, oscilloscope waves, radial bursts, and neon flames scale to fill the full vertical amplitude without clipping, distortion, or blurriness.

### 1.2 Architectural Solution
1. **CSS Elastic Flexbox Engine (Zero Outer Mutation):**
   - Refactor `.visualizer-card-body`, `.visualizer-panel`, and `.visualizer-canvas-container` to form a continuous, unbroken flexbox column pipeline.
   - Eliminate hardcoded `height: 130px` on `.visualizer-canvas-container`, replacing it with `flex: 1 1 auto; height: 100%; min-height: 180px;`.
   - Maintain 100% invariant protection over `#heroAudioLabStatus` outer dimensions, ensuring zero displacement of sibling cards (`#heroAudioEqCard`, `#subPlayerIdle`, `#paneMedia`).
2. **Dynamic Canvas Resolution & Adaptive Render Loop:**
   - Update `initAudioVisualizer` and `updateVisualizerCanvasResolution` in `dashboard/dashboard.js` and `src/dashboard/features/media_deck_visualizer_feature.js` to dynamically calculate container height and set canvas resolution accordingly (e.g. 600x220 in compact mode).
   - Calibrate the rendering engine across all 6 visualizer modes (`bars`, `wave`, `radial`, `matrix_dots`, `flame`, `stereo_mirror`) so bar heights and waveforms utilize the expanded canvas height dynamically (`canvas.height * 0.88`).
3. **Ergonomic VU Level Meters Docking:**
   - Position `.vu-meters-container` snugly at the bottom of the card with `flex-shrink: 0; margin-top: auto;` and streamlined padding (`6px 12px`), maintaining crystal-clear -∞dB to 0dB visual telemetry without encroaching on canvas real estate.
4. **Comprehensive Automated Verification:**
   - Deploy automated test suite `tests/test_visualizer_inner_content_expansion.js` certifying zero outer bound mutations, verified flex-grow rules, dynamic canvas dimension updates, light/dark mode parity, and full passage across all repository test suites (Exit Code 0).

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Name | Assigned Agent | Target Files | Status | QA Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | CSS Flexbox Expansion Engine & DOM Alignment | Level 4 Frontend Engineer | `dashboard/dashboard.html`, `dashboard/styles/media.css`, `dashboard/dashboard.css` | `READY_FOR_EXECUTION` | Pending Phase Gate |
| **Phase 2** | Dynamic Canvas Resolution & 60 FPS Render Scaling Engine | Level 4 Fullstack Engineer | `src/dashboard/features/media_deck_visualizer_feature.js`, `dashboard/dashboard.js` | `PAUSED` | Pending Phase 1 Gate |
| **Phase 3** | Automated Regression Test Battery & Full Suite Verification | Level 4 QA Verification Engineer | `tests/test_visualizer_inner_content_expansion.js`, `run_all_tests.js` | `PAUSED` | Grade A+ Certification |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `dashboard/styles/media.css` & `dashboard/dashboard.css` | `.visualizer-canvas-container` has hardcoded `height: 130px; min-height: 120px;`, trapping the canvas in a small box and leaving dead space | Replace static height with `flex: 1 1 auto; height: 100%; min-height: 180px;` and ensure parent containers have `flex: 1; min-height: 0;` | Canvas container seamlessly stretches to fill available card vertical space | Phase 1 | Computed CSS properties checks |
| **2** | `dashboard/dashboard.html` & CSS | `#heroAudioLabStatus` lacks explicit height stretch propagation to `.visualizer-card-body` and `.visualizer-panel` | Ensure `.visualizer-card-body` and `.visualizer-panel` are styled with `flex: 1 1 auto; height: 100%;` and `justify-content: space-between;` | Visualizer controls, canvas, and VU meters occupy balanced vertical proportions | Phase 1 | HTML DOM structure assertions |
| **3** | `src/dashboard/features/media_deck_visualizer_feature.js` | Canvas rendering functions assume baseline 120px height, causing visualizer elements to draw small | Make drawing loops dynamically compute scaling factors from `canvas.height` and `canvas.width` | All 6 visualizer modes render with rich, full-height spectral fidelity | Phase 2 | Canvas rendering unit tests |
| **4** | `dashboard/dashboard.js` | `updateVisualizerCanvasResolution` only resizes canvas in fullscreen/theater mode, leaving compact mode locked to 600x120 | Update resolution updater to sample container rect in compact mode and set dynamic baseline height (e.g. 600x220) | High-DPI crisp rendering across compact, full-window, and fullscreen modes | Phase 2 | Resolution updater tests |
| **5** | `tests/test_visualizer_inner_content_expansion.js` | No automated test exists to verify inner content expansion and outer container immutability | Create dedicated test suite asserting CSS rules, DOM hierarchy, canvas scaling, and zero outer mutations | Prevents layout regressions across all 57+ test suites | Phase 3 | `node tests/test_visualizer_inner_content_expansion.js` |
