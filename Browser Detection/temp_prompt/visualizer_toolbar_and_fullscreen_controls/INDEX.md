<!-- 0xEF, 0xBB, 0xBF UTF-8 BOM Encoded -->
# Phase-wise Execution Tracking Board & Problem-Solution Dossier
# Task: Visualizer Toolbar Flex Alignment & Dual-Mode Full Window / Full Screen Controls
# Task ID: TASK-VIZ-TOOLBAR-ALIGN-FULLSCREEN-001

> **Governance & Specification Reference:**
> - **Lead Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Architecture Recommendation:** [`architecture_recommendation.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/architecture_recommendation.md)
> - **Prompt Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)
> - **Department Rules:** `dynamic_departments_matrix.md` (Dept 01 Product Requirements, Dept 05 Frontend Engineering, Dept 08 QA & Testing)

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Problem Statement
1. **Clustered Toolbar Elements:** In the current visualizer toolbar (`.visualizer-controls-bar`), the effect dropdown (`#selectVizEffect`) and action icon buttons (`#btnVizVideoEmbedToggle`, `#btnVizFullscreen`) are clustered together inside an `inline-flex` container with minimal gap, leaving awkward empty space on the right and feeling cramped.
2. **Ambiguity Between Full Window & Full Screen:** Currently, clicking `#btnVizFullscreen` only toggles a fixed-position viewport overlay (`.visualizer-theater-mode`), but does not trigger the browser's native W3C Fullscreen API (`element.requestFullscreen()`). Users who want true monitor fullscreen cannot achieve it, while users who want an expanded viewport without browser window locks lack clear affordance.
3. **Missing Discrete Control Affordance:** Users require two distinct, intuitive controls:
   - **Full Window Mode (Theater):** Maximizes the visualizer panel within the dashboard viewport/browser window without triggering OS-level fullscreen locks.
   - **Full Screen Mode:** Engages true W3C `requestFullscreen()` on the visualizer container/canvas, utilizing the entire physical monitor display.

### 1.2 Architectural Solution
1. **Flex `justify-between` Toolbar Layout:** Refactor `.visualizer-controls-bar` to full width (`width: 100%`) with flexbox `justify-content: space-between; align-items: center;`. The left side anchors the effect selector (`.viz-select-wrapper`), while the right side groups action buttons into a cohesive `.viz-actions-group` capsule with uniform micro-spacing and specular borders.
2. **Dedicated Full Window & Full Screen Controls:**
   - Introduce `#btnVizFullWindow` for Viewport Theater maximize (toggling `.visualizer-theater-mode` on `#heroAudioLabStatus`).
   - Standardize `#btnVizFullscreen` for true native W3C `requestFullscreen()` with graceful exit and `fullscreenchange` document synchronization.
   - Maintain full backward compatibility for existing accessibility attributes, tooltips, and test suite selectors.
3. **Synchronized State Machine & Event Handling:** Implement dual-state tracking (`isTheaterActive`, `isFullscreenActive`) in `src/dashboard/features/media_deck_visualizer_feature.js` and `dashboard/dashboard.js`, listening to `document.addEventListener('fullscreenchange')` and `keydown` (`Escape`) to guarantee reliable two-way UI synchronization.
4. **Automated Regression Test Suite:** Expand `tests/test_visualizer_compact_fullscreen_embed.js` to assert flex alignment, discrete Full Window and Full Screen button presence, SVG iconography, ARIA states, and test gate passage across all 57+ repository suites.

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Name | Assigned Agent | Target Files | Status | QA Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Toolbar DOM & Flex `justify-between` CSS Alignment | Level 4 Frontend Engineer | `dashboard/dashboard.html`, `dashboard/styles/media.css`, `dashboard/dashboard.css` | `COMPLETED` | Verified Clean DOM & CSS Flex Gate |
| **Phase 2** | Dual-Mode Full Window (Theater) & True W3C Fullscreen JS Wiring | Level 4 Fullstack Engineer | `src/dashboard/features/media_deck_visualizer_feature.js`, `dashboard/dashboard.js` | `COMPLETED` | Verified Dual-Mode Wiring Gate |
| **Phase 3** | Automated Regression Test Battery & Full Suite Verification | Level 4 QA Verification Engineer | `tests/test_visualizer_compact_fullscreen_embed.js`, `run_all_tests.js` | `PENDING` | Grade A+ Certification |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `dashboard/dashboard.html` | Toolbar controls grouped inline without left/right separation; missing discrete Full Window button | Wrap action buttons in `.viz-actions-group`, add `#btnVizFullWindow` alongside `#btnVizFullscreen` | Balanced toolbar hierarchy; explicit visualizer affordances | Phase 1 | HTML DOM structure assertions |
| **2** | `dashboard/styles/media.css` & `dashboard/dashboard.css` | `.visualizer-controls-bar` is `display: inline-flex; width: auto;` causing clumping | Set `width: 100%; display: flex; justify-content: space-between; align-items: center;` and style `.viz-actions-group` | Responsive edge-to-edge alignment with emerald/sky specular pill styling | Phase 1 | Computed CSS properties checks |
| **3** | `src/dashboard/features/media_deck_visualizer_feature.js` | `toggleVisualizerFullscreen` only toggled CSS theater mode, lacking true W3C Fullscreen API | Implement `toggleVisualizerFullWindow` (theater) and true `toggleVisualizerFullscreen` (`requestFullscreen()`) with `fullscreenchange` listener | Independent viewport maximize and true physical monitor fullscreen | Phase 2 | Fullscreen & Theater feature unit tests |
| **4** | `dashboard/dashboard.js` | Legacy event handler bound `#btnVizFullscreen` directly to theater mode | Update facade to wire `#btnVizFullWindow` and `#btnVizFullscreen` to feature module methods | Complete operational parity between dashboard script and modular feature | Phase 2 | Mock DOM click dispatch tests |
| **5** | `tests/test_visualizer_compact_fullscreen_embed.js` | Test suite only tests single fullscreen button and theater CSS selectors | Add assertions for `.viz-actions-group`, `justify-between`, `#btnVizFullWindow`, and W3C Fullscreen API mocking | Zero regression across 57+ test suites (Exit code 0) | Phase 3 | `node run_all_tests.js` |
