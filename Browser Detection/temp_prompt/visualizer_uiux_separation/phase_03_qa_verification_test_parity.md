# Phase 3 Standalone Execution Prompt: QA Verification, Test Parity & Security Certification

> **Document Type:** Phase 3 Standalone Sub Agent Execution Prompt  
> **Workspace Container:** `temp_prompt/visualizer_uiux_separation/`  
> **Target Execution Role:** Level 4 QA Verification Tester (`subagent_qa_verification_tester`)  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Status:** `READY_FOR_DISPATCH`  

---

## 🎯 1. Phase Objective
Perform independent, end-to-end verification and test suite alignment for the Real-Time Spectrum Visualizer UI/UX separation and Equalizer integration:
1. Verify canvas rendering loop (`drawVisualizerFrame`), mode switching (`bars` vs `wave`), and VU meter animations in `dashboard/dashboard.js`.
2. Inspect and modernize test assertions in `tests/test_dashboard_full_audio_lab_parity.js`, `tests/test_dashboard_uiux_phase1.js`, and `tests/test_dashboard_features_phase2.js` to align with the new structural separation.
3. Execute all 44 test suites via `node run_all_tests.js` and verify 100% pass (Exit Code 0).
4. Run `gitleaks detect --redact` to certify 0 secrets or credential leaks.
5. Verify 100% compliance with UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) across all modified codebase files.
6. Issue Grade A+ QA signoff and executive completion proof.

---

## 📋 2. Prerequisites & Inputs
- **Prerequisite:** Phases 1 and 2 completed.
- **Target Files for Verification:**
  - `dashboard/dashboard.html`
  - `dashboard/dashboard.css`
  - `dashboard/styles/media.css`
  - `dashboard/dashboard.js`
  - `tests/test_dashboard_full_audio_lab_parity.js`
  - `tests/test_dashboard_uiux_phase1.js`
  - `tests/test_dashboard_features_phase2.js`
  - `run_all_tests.js`

---

## 🔍 3. Technical Context & File Anchors

### Target Assertions in `tests/`:
1. `tests/test_dashboard_full_audio_lab_parity.js`:
   - Checks presence of all 18 audio lab IDs (`heroAudioBoostSlider`, `canvasAudioVisualizer`, `btnVizModeBars`, `btnVizModeWave`, `vuBarLeft`, `vuBarRight`, `vuClipIndicator`, `heroAudioLabStatus`, `heroAudioEqCard`).
   - Checks structural separation: `#heroAudioEqCard` must NOT be nested inside `#heroAudioLabStatus`.
   - Checks zero inline handlers and zero `.innerHTML` in audio functions.
2. `tests/test_dashboard_uiux_phase1.js`:
   - Line 186: Checks `#heroAudioLabStatus` has classes `.audio-lab-widget`, `.glass-card`, `.bento-card`, `.liquid-glass-card`, `.bento-span-4`, `.bento-row-span-2`.
   - Line 188: Checks `#heroAudioEqCard` has `.bento-span-12`.
3. `tests/test_dashboard_features_phase2.js`:
   - Checks all 15 IDs and 23 CSS selectors in `dashboard.css` and `media.css`.

---

## 🛠️ 4. Surgical Step-by-Step Instructions

### Step 3.1: Canvas Rendering & JS Logic Validation
1. In `dashboard/dashboard.js`, verify `initAudioVisualizer`, `drawVisualizerFrame`, and mode button listeners.
2. Ensure canvas element resolution (`600x120`) renders correctly in the new dedicated card.
3. Ensure mode switching properly switches between 32-band FFT bars and oscilloscope waveform.
4. Run AST check: `node -c dashboard/dashboard.js` (must exit 0).

### Step 3.2: Modernize Test Assertions if Required
1. In `tests/test_dashboard_full_audio_lab_parity.js`:
   - If regex parses `#heroAudioLabStatus` content expecting Boost slider inside it, update the assertion to verify that `#heroAudioBoostSlider` is located in `#heroAudioEqCard` (reflecting the upgraded studio deck architecture), while all 18 IDs remain 100% verified across `dashboard.html`.
   - Maintain the structural separation check: `#heroAudioEqCard` is independent of `#heroAudioLabStatus`.
2. In `tests/test_dashboard_uiux_phase1.js`:
   - Confirm `#heroAudioLabStatus` maintains `.bento-span-4 .bento-row-span-2` beside `#heroMediaPlayerCard` (`.bento-span-8 .bento-row-span-2`).

### Step 3.3: Execute Full Test Battery
Run the universal test runner:
```powershell
node run_all_tests.js
```
Requirement: Exactly 44 tests executed, 44 passed, 0 failed, exit code 0.

### Step 3.4: Security Audit & Encoding Standards
1. Run secret scanner:
```powershell
gitleaks detect --redact
```
Requirement: 0 leaks detected.
2. Verify UTF-8 BOM (`0xEF, 0xBB, 0xBF`) on all modified files:
   - `dashboard/dashboard.html`
   - `dashboard/dashboard.css`
   - `dashboard/styles/media.css`
   - `tests/test_dashboard_full_audio_lab_parity.js` (if modified)

---

## 📦 5. Deliverables Manifest
- Validated Codebase Files
- Test Execution Terminal Output (44/44 PASS)
- Gitleaks Scan Clean Proof
- Grade A+ Verification Signoff Report

---

## 🚦 6. Verification Gate & Signoff Criteria
- `node run_all_tests.js` -> 44/44 PASS (Exit Code 0).
- `gitleaks detect --redact` -> 0 leaks.
- Zero `.innerHTML` across all modified functions.
- Raw terminal proof delivered to Level 2 Manager.
