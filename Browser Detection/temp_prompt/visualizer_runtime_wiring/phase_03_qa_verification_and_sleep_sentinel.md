# Phase 3 Execution Prompt: QA Verification & Sleep Sentinel

> **Phase:** 3 of 3  
> **Target Role:** Level 4 Independent QA Engineer  
> **Focus:** Dedicated integration testing, zero-overhead idle sleep verification, full regression suite, and UTF-8 BOM audit  
> **Prerequisites:** Phase 1 and Phase 2 complete  
> **Governing Spec:** [`TRD.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/visualizer_runtime_wiring/TRD.md)  

---

## 🎯 1. Phase Objective
Create a dedicated integration test suite (`tests/test_visualizer_runtime_wiring.js`) to verify browser-runtime script loading without Node.js `require()` fallback, test interactive mode switching, verify decibel scaling formulas and VU meter width percentages, validate the Zero-Overhead Idle Sleep Sentinel, run all 48 test suites across the repository, and certify UTF-8 with BOM and zero secret leaks.

---

## 📂 2. Target Files & Artifacts
1. `tests/test_visualizer_runtime_wiring.js` (New dedicated test suite).
2. `tests/test_visualizer_separation_qa_parity.js`.
3. All modified files (`dashboard/dashboard.html`, `dashboard/dashboard.js`, `src/dashboard/features/media_deck_visualizer_feature.js`).

---

## 🛠️ 3. Surgical Instructions

1. **Implement `tests/test_visualizer_runtime_wiring.js`:**
   - Test Battery 1: DOM Invariant & Script Tag Presence in `dashboard.html`.
   - Test Battery 2: Browser Global Loading Simulation (executing `media_deck_visualizer_feature.js` without `require` and verifying `globalThis.MediaDeckVisualizerFeature` registers cleanly).
   - Test Battery 3: Interactive Mode Switcher (`bars` vs `wave`) toggling and class updates.
   - Test Battery 4: Stereo VU Meter decibel scaling and clipping detection.
   - Test Battery 5: Zero-Overhead Idle Sleep Sentinel (RAF halt on pause/hidden).
   - Test Battery 6: 100% W3C Trusted Types & 0 innerHTML assignments.

2. **Run Full Regression Test Suite:**
   Run all 48 test suites in `tests/`:
   ```powershell
   node run_all_tests.js
   ```
   Ensure 100% pass rate with exit code 0.

3. **Verify UTF-8 with BOM Encoding:**
   Verify `0xEF, 0xBB, 0xBF` bytes at the beginning of all modified files.

4. **Run Gitleaks Secret Audit:**
   ```powershell
   gitleaks detect --redact
   ```
   Ensure 0 leaks detected.

---

## 🧪 4. Local Test Gate
Execute:
```powershell
node tests/test_visualizer_runtime_wiring.js
node run_all_tests.js
```
Both must exit with code 0.
