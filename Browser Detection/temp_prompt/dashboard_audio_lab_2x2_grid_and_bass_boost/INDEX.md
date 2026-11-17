# Live Tracking Board & Diagnostic Impact Dossier: Audio Lab 2x2 Grid & Sub-Bass Enhancer

> **Task ID:** `TASK-DASHBOARD-AUDIOLAB-2X2-GRID-001`  
> **Target Path:** `temp_prompt/dashboard_audio_lab_2x2_grid_and_bass_boost/INDEX.md`  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Lead Department:** Dept 01 (Product Requirements) & Dept 04/05 (UI/UX & Frontend Engineering)  
> **Primary Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Status:** `PHASE_PROMPTS_GENERATED_AWAITING_MANAGER_APPROVAL`  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Problem Statement
1. **Header Badge Redundancy:** The status badge `#audioLabPresetBadge` ("Flat") next to the "Audio Lab & DSP Enhancements" header redundantly duplicates the EQ preset information already displayed inside the Equalizer card (dropdown `#audioEqPresetSelect` and 5-band slider array). This creates visual clutter and confuses users.
2. **Bottom Controls Overflow:** The audio enhancement controls in `.enhancements-grid` currently pack 3 toggle cards ("Vocal Clarity", "Night Shield", "Audio-Only Mode") into a cramped 3-column layout. On standard desktop and laptop viewports, cards become too narrow, causing `.switch-toggle` switches to overflow outside their card boundary.
3. **Asymmetric Grid Balance:** Having 3 toggle cards leaves an unbalanced, awkward layout with an empty slot.
4. **Missing Low-Frequency DSP Feature:** The Web Audio DSP pipeline lacks a dedicated low-shelf punch/sub-bass enhancement feature for bass-heavy media playback.

### 1.2 Proposed Architecture Solution
1. **Header Badge Refinement:** Surgically remove `#audioLabPresetBadge` from the header badges container (`.audio-lab-badges`), keeping only dynamic feature badges (`#audioLabVocalBadge`, `#audioLabNightBadge`).
2. **2x2 Balanced Grid Layout:** Refactor `.enhancements-grid` from 3 columns to a clean 2-column layout (`repeat(2, minmax(0, 1fr))`) with 12px gap, guaranteeing zero switch overflow and generous horizontal breathing room.
3. **4th DSP Feature Addition:** Add "Sub-Bass Enhancer / Bass Boost" (`toggleBassBoost`) as the 4th card, establishing a visually balanced 2x2 grid.
4. **Full Web Audio Pipeline Wiring:** Implement low-shelf `BiquadFilterNode` boost (+7dB at 60Hz, clamped to +12dB max) in `web_audio_dsp.js`, full storage persistence in `chrome.storage.local`, controller synchronization in `audio_lab_controller.js`, and bilingual English/Hindi translations.
5. **QA Test Parity:** Update 4 existing test suites asserting `#audioLabPresetBadge` and author a comprehensive automated test suite verifying DOM, CSS, DSP math, storage, and i18n parity.

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Name | Target File(s) | Assigned Agent | Status | QA Signoff |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **01** | Header Badge Refinement | `dashboard/dashboard.html`<br>`dashboard/dashboard.js`<br>`src/dashboard/audio/audio_lab_controller.js` | Level 4 Frontend Engineer | `PENDING_AUTH` | `PENDING` |
| **02** | 2x2 Grid Layout & 4th Feature HTML/CSS | `dashboard/dashboard.html`<br>`dashboard/dashboard.css`<br>`dashboard/styles/audio_lab.css` | Level 4 UI/UX Engineer | `PENDING_AUTH` | `PENDING` |
| **03** | Web Audio DSP Runtime & Persistence | `src/inject/audio/web_audio_dsp.js`<br>`src/dashboard/audio/audio_lab_controller.js`<br>`dashboard/dashboard.js`<br>`src/core/i18n.js` | Level 4 Audio DSP Engineer | `PENDING_AUTH` | `PENDING` |
| **04** | QA Verification & Test Suite Parity | `tests/test_dashboard_full_audio_lab_parity.js`<br>`tests/test_dashboard_theme_and_a11y_verification.js`<br>`tests/test_dashboard_uiux_phase1.js`<br>`tests/test_equalizer_layout_separation_phase1_2.js`<br>`tests/test_dashboard_audio_lab_2x2_grid_and_bass_boost.js`<br>`run_all_tests.js` | Level 4 QA Verification Engineer | `PENDING_AUTH` | `PENDING` |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | Target File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.html` | Duplicate `#audioLabPresetBadge` displayed in header next to title while preset is already in Equalizer card. | Remove `#audioLabPresetBadge` element from `.audio-lab-badges`. | Cleaner header layout, zero visual duplication. | Phase 1 | `node tests/test_header_status_badges.js` |
| **2** | `dashboard/dashboard.js` & `src/dashboard/audio/audio_lab_controller.js` | Code assumes `#audioLabPresetBadge` is always present in DOM; missing element could cause null pointer error. | Add null checks (`if (presetBadge) { ... }`) or remove obsolete header badge references. | Safe execution without runtime TypeError. | Phase 1 | `node tests/test_syntax_and_manifest_integrity.js` |
| **3** | `dashboard/styles/audio_lab.css` & `dashboard/dashboard.css` | `.enhancements-grid` configured with `repeat(3, minmax(0, 1fr))`, causing toggle switches to overflow outside cards. | Change grid to `repeat(2, minmax(0, 1fr))`, gap `12px`, with responsive 1-column mobile collapse. | Prevents toggle switch clipping, clean 2x2 alignment. | Phase 2 | `node tests/test_dashboard_uiux_phase1.js` |
| **4** | `dashboard/dashboard.html` | Only 3 enhancement cards exist in `.enhancements-grid`, leaving 2x2 grid incomplete. | Add 4th card for "Sub-Bass Boost" (`toggleBassBoost`, `lblAudioBassTitle`, `lblAudioBassDesc`). | Symmetric 2x2 grid with high-utility audio feature. | Phase 2 | `node tests/test_dashboard_full_audio_lab_parity.js` |
| **5** | `src/inject/audio/web_audio_dsp.js` | DSP pipeline lacks processing logic for bass boost enhancement. | Add low-shelf filter boost (+7dB at 60Hz, clamped <= +12dB) to `applyAudioLabSettings`. | Authentic hardware-quality low-frequency enhancement. | Phase 3 | `node tests/test_popup_phase5_audio_lab_and_dsp.js` |
| **6** | `src/dashboard/audio/audio_lab_controller.js` & `dashboard/dashboard.js` | State management lacks `bass_boost` in defaults, storage persistence, and bilingual strings. | Add `bass_boost: false` to default settings, handle toggle events, persist to `chrome.storage.local`, add EN/HI i18n keys. | Full persistence, tab sync, and bilingual parity. | Phase 3 | `node tests/test_dashboard_i18n_bilingual_parity.js` |
| **7** | Existing test suites (`tests/test_dashboard_full_audio_lab_parity.js`, etc.) | Tests assert existence of `#audioLabPresetBadge` in `dashboard.html`. | Update tests to assert absence of duplicate header badge and verify preset lives in Equalizer card. | 100% clean test execution without regressions. | Phase 4 | `node run_all_tests.js` (64/64 clean) |
