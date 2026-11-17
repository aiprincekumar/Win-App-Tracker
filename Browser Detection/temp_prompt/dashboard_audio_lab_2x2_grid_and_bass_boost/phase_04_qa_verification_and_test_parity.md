# Phase 4: QA Testing, Legacy Suite Updates & Full Parity

> **Target Phase:** Phase 4 of 4  
> **Task ID:** `TASK-DASHBOARD-AUDIOLAB-2X2-GRID-001`  
> **Document:** `temp_prompt/dashboard_audio_lab_2x2_grid_and_bass_boost/phase_04_qa_verification_and_test_parity.md`  
> **Target Files:**  
> - `tests/test_dashboard_full_audio_lab_parity.js`  
> - `tests/test_dashboard_theme_and_a11y_verification.js`  
> - `tests/test_dashboard_uiux_phase1.js`  
> - `tests/test_equalizer_layout_separation_phase1_2.js`  
> - `tests/test_dashboard_audio_lab_2x2_grid_and_bass_boost.js` (NEW)  
> - `run_all_tests.js`  
> **Lead Role:** Level 4 QA Verification Engineer  

---

## 🎯 1. Phase Objective
Update the 4 existing test suites that specifically assert the legacy `#audioLabPresetBadge` element, author a comprehensive new automated verification test suite (`tests/test_dashboard_audio_lab_2x2_grid_and_bass_boost.js`) covering DOM structure, CSS 2-column layout, switch overflow prevention, DSP calculations, storage persistence, and i18n dictionaries, and certify 100% pass across all test suites via `node run_all_tests.js`.

---

## 📥 2. Prerequisites & Input Context
- Phase 1, Phase 2, and Phase 3 deliverables implemented and verified locally.
- Legacy test files requiring surgical assertion updates:
  1. `tests/test_dashboard_full_audio_lab_parity.js`: Line 110 & 211
  2. `tests/test_dashboard_theme_and_a11y_verification.js`: Line 465 & 503
  3. `tests/test_dashboard_uiux_phase1.js`: Line 229
  4. `tests/test_equalizer_layout_separation_phase1_2.js`: Line 85

---

## 🔧 3. Surgical Implementation Steps

### Step 4.1: Update Legacy Test Assertions
1. **`tests/test_dashboard_full_audio_lab_parity.js`:**
   - Update line 110: Replace assertion requiring `#audioLabPresetBadge` with an assertion verifying `#audioLabPresetBadge` is absent from header, and that preset is displayed via `#audioEqPresetSelect`:
     ```javascript
     assert(!html.includes('id="audioLabPresetBadge"'), 'dashboard.html must not contain duplicate #audioLabPresetBadge in header');
     assert(html.includes('id="audioEqPresetSelect"'), 'dashboard.html must contain #audioEqPresetSelect');
     ```
   - In DOM mock helper (line 211): remove or keep safe mock fallback.
2. **`tests/test_dashboard_theme_and_a11y_verification.js`:**
   - Line 465: Replace assertion with `assert(!html.includes('id="audioLabPresetBadge"'))`.
   - Line 503: Update mock lookup accordingly.
3. **`tests/test_dashboard_uiux_phase1.js`:**
   - Line 229: In mandatory elements array, remove `'audioLabPresetBadge'` and include `'toggleBassBoost'`.
4. **`tests/test_equalizer_layout_separation_phase1_2.js`:**
   - Line 85: Remove `'audioLabPresetBadge'` from expected elements array.

### Step 4.2: Author Dedicated Test Suite
Create `tests/test_dashboard_audio_lab_2x2_grid_and_bass_boost.js` with 6 rigorous test batteries:
1. **Battery 1: Header Badge Refinement Verification**
   - Asserts `#audioLabPresetBadge` is completely absent from `dashboard.html`.
   - Asserts dynamic feature badges `#audioLabVocalBadge` and `#audioLabNightBadge` remain present.
2. **Battery 2: 2x2 Grid Layout & 4 Cards Structure**
   - Asserts `.enhancements-grid` contains exactly 4 `.enhancement-card` chips.
   - Asserts all 4 toggles exist with correct IDs: `toggleVocalClarity`, `toggleNightShield`, `toggleBassBoost`, `toggleAudioOnlyMode`.
   - Asserts aria roles (`role="switch"`) and labels are present.
3. **Battery 3: CSS 2-Column Geometry & Containment**
   - Asserts `dashboard/styles/audio_lab.css` and `dashboard/dashboard.css` specify `grid-template-columns: repeat(2, minmax(0, 1fr))`.
   - Asserts card containment (`box-sizing: border-box`, `overflow: hidden`, `min-width: 0`).
   - Asserts `@media (max-width: 640px)` collapse to `1fr`.
4. **Battery 4: Web Audio DSP Pipeline Low-Shelf Math**
   - Instantiates or imports `WebAudioDSP`.
   - Tests `applyAudioLabSettings({ bass_boost: true })`: verifies target gain at 60Hz receives +7dB boost.
   - Tests combined `bass_boost: true` and `vocal_clarity: true`: verifies mathematical clamping and correct net offset (+3dB).
5. **Battery 5: Controller & Storage Persistence Contract**
   - Asserts `DEFAULT_AUDIO_LAB_SETTINGS` includes `bass_boost: false`.
   - Asserts `updateDashboardAudioLabUI` synchronizes `#toggleBassBoost.checked`.
   - Asserts `persistDashboardAudioLabSettings` includes `bass_boost` in `audio_lab_settings`.
6. **Battery 6: Bilingual i18n Dictionary Parity**
   - Asserts `audiolab_bass_title` and `audiolab_bass_desc` exist in both English and Hindi dictionaries.
   - Asserts strings are non-empty and accurately translated.

### Step 4.3: Register in `run_all_tests.js`
Add `test_dashboard_audio_lab_2x2_grid_and_bass_boost.js` to the test suite manifest in `run_all_tests.js`.

### Step 4.4: Execute Full Test Runner
Run `node run_all_tests.js` and verify all 64 test suites pass cleanly with exit code 0.

---

## 🚫 4. Architectural Constraints & Boundaries
- Zero tolerance for broken tests or skipped assertions.
- All tests must execute deterministically without relying on network or real audio hardware.
- Preserve UTF-8 with BOM encoding on all edited test files.

---

## 📦 5. Deliverables Manifest
- Updated legacy tests (4 files)
- New test suite: `tests/test_dashboard_audio_lab_2x2_grid_and_bass_boost.js`
- Updated test runner: `run_all_tests.js`

---

## 🧪 6. Final Certification Gate
Run:
```bash
node run_all_tests.js
```
Gate criteria: **ALL 64 TEST SUITES PASSED CLEANLY (Exit Code 0)**.
