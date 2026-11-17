<!-- UTF-8 with BOM -->
# TASK-VIZ-DROPDOWN-EFFECTS-002: Live Tracking Board & Problem-Solution Dossier

> **Specification & Governance:**
> - **Task Identifier:** `TASK-VIZ-DROPDOWN-EFFECTS-002`
> - **Lead Architecture:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Lead Department:** Department 05 (Frontend Engineering) & Department 08 (QA & Testing)
> - **Target Execution Workspace:** `c:\Users\Atul Verma\Desktop\Win App Tracker\Browser Detection`
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)

---

## 📋 1. Executive Problem-Solution Summary

### Problem Context (User Problem Description)
The user stated:
> *"इसके अंदर अभी सिर्फ दो ही फॉर्म हैं, वेवफॉर्म और मल्टीपल ऑप्शन। इसके जगह पर मल्टीपल ऑप्शन प्रोवाइड करो ड्रॉपडाउन के द्वारा और एटलीस्ट छह अलग-अलग तरह का इफेक्ट ऐड करो फिलहाल के लिए। सिलेक्शन ड्रॉपdown के द्वारा होना चाहिए।"*
> *(Currently, there are only two forms/options: waveform and multiple option [32-band FFT bars]. Replace this with multiple options provided via a dropdown, and add at least six distinct types of visualizer effects for now. The selection must be through a dropdown.)*

1. **Rigid Dual-Button UI Controls:**
   In `dashboard/dashboard.html` (lines ~740-743), visualization mode selection is constrained to two hardcoded capsule buttons: `#btnVizModeBars` ("32-Band FFT") and `#btnVizModeWave` ("Waveform"). This does not scale for expanding audio analysis modes and clutters the Bento Card header.
2. **Limited 2-Mode Visualizer Engine:**
   In `src/dashboard/features/media_deck_visualizer_feature.js` (lines ~398, ~484, ~613-676), the engine's state machine strictly validates `mode !== 'bars' && mode !== 'wave'`, rejecting any expanded visualization algorithms.
3. **Absence of Rich Dynamic Visualizations:**
   Modern audio workstations provide circular radial analyzers, matrix particle voxel grids, harmonic flame meters, and bilateral stereo mirror butterflies. Currently only basic vertical bars and a sine wave are rendered.
4. **Missing Persistent User Preferences:**
   When the user switches modes, the selection is held only in ephemeral memory and resets to `'bars'` upon reload.

### The Surgical Solution
1. **Phase 1: DOM & UI Dropdown Architecture:**
   - Introduce an accessible, Liquid Glass `<select id="selectVizEffect" class="select-viz-effect glass-select">` with 6 distinct options.
   - Retain `#btnVizModeBars` and `#btnVizModeWave` inside a `.visually-hidden` container with synchronized DOM states to preserve 100% backward compatibility for existing scripts, facades, and tests.
   - Add bilingual labels and option text (English & Hindi) in the dashboard translation dictionaries.
2. **Phase 2: High-Performance 60fps Canvas 2D Visualizer Engine Expansion:**
   - Expand `media_deck_visualizer_feature.js` to support 6 distinct 60fps real-time visualizer algorithms:
     1. `bars`: 32-Band FFT Frequency Bars with falling peak-hold white cap dots.
     2. `wave`: Oscilloscope Neon Sine Waveform with dynamic time-phase animation.
     3. `radial`: Circular Radial Frequency Burst radiating outward with reactive core pulsing.
     4. `matrix_dots`: Matrix Digital Dots / Cyber Voxel Grid with glowing illumination thresholds.
     5. `flame`: Neon Flame / Fire Peaks with fluid sinuous vertical thermal energy ribbons.
     6. `stereo_mirror`: Stereo Dual-Channel Butterfly Mirror expanding symmetrically from center.
   - Expand `setVisualizerMode()` to accept and validate all 6 effect keys.
   - Canvas click listener cycles through all 6 effects in order.
3. **Phase 3: Dashboard Controller Wiring & Storage Synchronization:**
   - In `dashboard/dashboard.js`, attach `change` listener to `#selectVizEffect`, synchronizing `setVisualizerMode(selectedEffect)` and storing preference in `chrome.storage.local` / `localStorage` under `media_sentinel_viz_effect`.
   - Update facade functions to resolve and return the active effect from the 6 options.
4. **Phase 4: Test Suite Verification & Independent QA Certification:**
   - Update `tests/test_visualizer_runtime_wiring.js` to test all 6 modes, dropdown event dispatching, persistence, and 60fps rendering without regressions.
   - Ensure `tests/test_visualizer_separation_qa_parity.js` and `run_all_tests.js` pass with 100% exit code 0.

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Name | Primary Target Files | Target Subagent | Status | QA Signoff |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **01** | DOM & UI Dropdown Specification | `dashboard/dashboard.html`, `dashboard/styles/media.css`, `dashboard/dashboard.css` | Frontend Specialist (Level 4) | `COMPLETED` | Passed Gate 1 |
| **02** | 6-Effect Canvas Visualizer Engine | `src/dashboard/features/media_deck_visualizer_feature.js` | Frontend Specialist (Level 4) | `COMPLETED` | Passed Gate 2 |
| **03** | Controller Wiring & Storage Sync | `dashboard/dashboard.js` | Frontend Specialist (Level 4) | `COMPLETED` | Passed Gate 3 |
| **04** | Test Suite Hardening & QA Audit | `tests/test_visualizer_runtime_wiring.js`, `tests/test_visualizer_separation_qa_parity.js` | QA Test Specialist (Level 4) | `COMPLETED` | Certified Grade A+ |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.html` | Hardcoded dual-button toggle (`#btnVizModeBars` / `#btnVizModeWave`) at lines ~740-743 restricts options to 2 and prevents dropdown selection. | Implement `<select id="selectVizEffect">` with 6 effect options and label; wrap legacy buttons in `.visually-hidden` container. | Enables seamless multi-effect selection via dropdown while preserving 100% backward compatibility. | Phase 1 | `node tests/test_visualizer_separation_qa_parity.js` |
| **2** | `dashboard/styles/media.css` | CSS only defines capsule styling for `.btn-viz-mode`; lacks styling for `.select-viz-effect` and `.viz-select-wrapper`. | Add Liquid Glass styling for `.viz-select-wrapper` and `.select-viz-effect` with custom SVG chevron, focus ring, and theme substrates. | Dropdown seamlessly integrates into the dark/light Bento aesthetic with WCAG AA contrast. | Phase 1 | `node tests/test_visualizer_separation_qa_parity.js` |
| **3** | `dashboard/dashboard.css` | Root master stylesheet lacks `.select-viz-effect` overrides and token mappings for dark/light themes. | Add synchronized Liquid Glass token overrides for visualizer select controls in `dashboard.css`. | Prevents layout shift and styling desynchronization across bundle loads. | Phase 1 | `node tests/test_visualizer_separation_qa_parity.js` |
| **4** | `src/dashboard/features/media_deck_visualizer_feature.js` | Mode validator strictly checks `mode !== 'bars' && mode !== 'wave'`, rejecting new effect identifiers. | Expand mode validator whitelist to support `['bars', 'wave', 'radial', 'matrix_dots', 'flame', 'stereo_mirror']`. | Visualizer engine cleanly accepts all 6 distinct effect keys. | Phase 2 | `node tests/test_visualizer_runtime_wiring.js` |
| **5** | `src/dashboard/features/media_deck_visualizer_feature.js` | Render frame only implements `visualizerMode === 'bars'` and `'wave'`. | Implement 4 new 60fps render branches: `radial`, `matrix_dots`, `flame`, and `stereo_mirror` with mathematical DSP algorithms. | Delivers 6 fluid 60fps audio visualizer effects with zero frame drops. | Phase 2 | `node tests/test_visualizer_runtime_wiring.js` |
| **6** | `dashboard/dashboard.js` | Dashboard controller only wires click listeners to buttons and does not listen to dropdown change or persist preference. | Wire `change` listener on `#selectVizEffect`, synchronize state, handle canvas click cycling across 6 modes, and persist to `storage.local`. | Selection persists across tab reloads and browser sessions. | Phase 3 | `node tests/test_visualizer_runtime_wiring.js` |
| **7** | `dashboard/dashboard.js` | Translation dictionary lacks localized labels for dropdown and 6 effects in English and Hindi. | Add `visualizer_effect_label` and `viz_effect_*` keys to English (`en`) and Hindi (`hi`) translation dictionaries. | Fully localized UI matching bilingual application architecture. | Phase 3 | `node tests/test_dashboard_i18n_bilingual_parity.js` |
| **8** | `tests/test_visualizer_runtime_wiring.js` | Battery 3 only asserts dual-state toggle between 'bars' and 'wave'; does not verify 6 effects or dropdown events. | Expand Battery 3 to test all 6 effects, dropdown dispatching, legacy button state synchronization, and persistence. | Comprehensive automated verification guarantees 0 regressions. | Phase 4 | `node tests/test_visualizer_runtime_wiring.js` |

---

## 🛡️ 4. Non-Negotiable Constitutional Constraints
1. **Main Agent (CEO) & Level 2 Manager Zero-Code Hard Lock:** All implementation, file edits, and test executions must be delegated exclusively to dedicated Level 4 Subagents with valid `AUTH-MGR-*` tokens.
2. **Backward Compatibility Invariant:** Legacy DOM IDs (`#btnVizModeBars`, `#btnVizModeWave`) MUST remain accessible in the DOM to avoid breaking existing automation or tests.
3. **W3C Trusted Types Compliance:** 0 assignments to `innerHTML` or `outerHTML`. All DOM modifications must use `createElement`, `createElementNS`, `textContent`, `setAttribute`, or `classList`.
4. **Zero-Overhead Idle Sleep Sentinel:** All 6 visualizer effects MUST completely pause rendering (`cancelAnimationFrame`) when audio is paused or document is hidden.
5. **Encoding Standard:** All generated and modified files must be UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
