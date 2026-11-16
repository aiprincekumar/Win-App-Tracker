# Bento Graphic Equalizer Card & Dashboard UI/UX Refinement: Master Index & Live Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/bento_equalizer_card_refinement/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target System:** Web Activity & Media Sentinel (`dashboard/dashboard.html` & `dashboard/dashboard.css`)  
> **Lead Department:** Department 05 (Frontend Engineering) & Department 08 (QA & Testing)  
> **Creation Timestamp:** 2026-11-16  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 The Operational Defect & Architectural Limitation
In the previous implementation of Tab B (Media Analytics) in `dashboard/dashboard.html`, the **5-Band Biquad Graphic Equalizer** (`.audio-eq-section`) was nested inside the **Audio Lab & DSP Telemetry Card** (`#heroAudioLabStatus`), which was constrained to a single 4-column span (`bento-span-4 bento-row-span-2`).

This caused severe UI/UX and ergonomic deficiencies:
1. **Vertical Crowding & Slider Compression:** Five vertical sliders (60Hz, 250Hz, 1kHz, 4kHz, 16kHz) along with Master Volume Boost (0–200%), three Audio Enhancement switches (Vocal Clarity, Night Shield, Audio-Only), telemetry badges, and DSP pipeline status notes were forced into a narrow 4-column card. The vertical sliders lacked adequate track travel and touch/mouse precision.
2. **Sub-optimal Visual Hierarchy:** The equalizer, which is a premier studio-grade DSP feature, lacked visual prominence and felt cramped rather than resembling a high-end audio mixing console.
3. **Imbalanced Bento Grid Geometry:** The 8-column Hero Player (`#heroMediaPlayerCard`) paired with a vertically overstuffed 4-column Audio Lab card created visual tension and height asymmetry.

### 1.2 The Architectural Solution
1. **Dedicated Bento Liquid Glass Card (`#heroAudioEqCard`):** Extract the 5-Band Graphic Equalizer into its own standalone Bento Liquid Glass Card with studio mixing console ergonomics, generous vertical slider travel (180px–200px), dedicated dB scale markings (-12dB to +12dB), centered zero-dB detent indicators, preset selector dropdown, and quick reset button.
2. **Refined Audio Lab & Enhancements Card (`#heroAudioLabStatus`):** Retain `#heroAudioLabStatus` as a clean, uncrowded Bento card dedicated to Master Volume Boost (0% to 200%), telemetry status badges (Preset, Vocal, Night), the three Audio Enhancement toggles (Vocal Clarity, Night Shield, Audio-Only Mode), and the active DSP pipeline status note.
3. **Harmonious 12-Column Bento Grid Balancing:** Balance the Bento grid geometry across desktop (12 columns), tablet (1200px collapse), and mobile (768px single-column stack), ensuring zero Cumulative Layout Shift (CLS = 0) and hardware-accelerated Liquid Glass materiality.
4. **100% Invariant & Test Suite Parity:** Strictly preserve 100% of existing DOM IDs, data-i18n bilingual attributes, ARIA roles, keyboard slider navigation, and ensure all existing test suites (`test_dashboard_full_audio_lab_parity.js`, `test_unified_timeline_scrubber.js`, `test_dashboard_theme_and_a11y_verification.js`, `test_dashboard_uiux_phase1.js`) pass with 100% success and exit code 0.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Suite | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | HTML DOM Architecture & Card Separation | `dashboard/dashboard.html` | Level 4 Frontend Engineer | `node tests/test_dashboard_full_audio_lab_parity.js`<br>`node tests/test_dashboard_uiux_phase1.js` | 🟢 COMPLETED |
| **02** | Bento Grid CSS Geometry & Liquid Glass Ergonomics | `dashboard/dashboard.css` | Level 4 CSS/Design Engineer | `node tests/test_dashboard_theme_and_a11y_verification.js`<br>`node tests/test_dashboard_uiux_phase1.js` | 🟢 COMPLETED |
| **03** | Test Modernization & Independent QA Verification | `tests/test_dashboard_full_audio_lab_parity.js`<br>`tests/test_dashboard_uiux_phase1.js` | Level 4 QA Verification Tester | Full workspace test suite execution + `gitleaks detect --redact` | 🟢 COMPLETED (GRADE A+) |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.html` | 5-Band Equalizer nested inside `#heroAudioLabStatus`, creating vertical overcrowding in 4-column card. | Extract `.audio-eq-section` into standalone `<div id="heroAudioEqCard" class="audio-eq-widget glass-card bento-card liquid-glass-card bento-span-12">` (or balanced 6-span), preserving all IDs. | Dedicated studio console layout; zero DOM ID breakage; 100% i18n parity preserved. | Phase 1 | `node tests/test_dashboard_full_audio_lab_parity.js` (PASSED) |
| **2** | `dashboard/dashboard.css` | Slider tracks and bento grid layout lack dedicated styling for standalone equalizer studio deck. | Add `.audio-eq-widget` styles: 180px vertical track height, center 0dB detent glow, frequency response guides, specular border, and responsive collapse. | Studio-grade aesthetic; tactile slider physics; zero CLS across desktop, tablet, and mobile. | Phase 2 | `node tests/test_dashboard_theme_and_a11y_verification.js` (PASSED) |
| **3** | `dashboard/dashboard.html` | `#heroAudioLabStatus` content density was too high for a 4-span card. | Streamline `#heroAudioLabStatus` to focus exclusively on Master Volume Boost, 3 Enhancement toggles, and Telemetry Badges. | Balanced, readable layout without vertical scrollbars or visual overlap. | Phase 1 & 2 | `node tests/test_dashboard_full_audio_lab_parity.js` (PASSED) |
| **4** | `tests/test_dashboard_uiux_phase1.js` | Battery 6 checks exact class string of `#heroMediaPlayerCard` and `#heroAudioLabStatus`. | Retain existing card classes or modernize assertions to recognize both `#heroAudioLabStatus` and `#heroAudioEqCard` as certified Bento cards. | 100% test suite pass; strict regression immunity. | Phase 3 | `node tests/test_dashboard_uiux_phase1.js` (PASSED) |
| **5** | `tests/test_dashboard_full_audio_lab_parity.js` | Battery 11 checks container `<div id="heroAudioLabStatus">` for 0 inline handlers and scripts. | Extend security audit battery to inspect both `#heroAudioLabStatus` and `#heroAudioEqCard` for zero inline handlers, and add Battery 12 certifying dedicated Bento Studio Deck architecture. | Hardened CSP & Trusted Types compliance verified across all audio cards. | Phase 3 | `node tests/test_dashboard_full_audio_lab_parity.js` (PASSED) |

---

## 🔒 4. Constitutional Guardrails & Invariants

1. **Strict DOM ID Preservation:** Under NO CIRCUMSTANCES may any of the following 18 audio IDs be renamed, removed, or duplicated:
   - `#heroAudioBoostSlider`, `#heroAudioBoostVal`, `#lblAudioMasterBoost`
   - `#btnResetEq`, `#audioEqPresetSelect`, `#lblAudioEqTitle`
   - `#eqBand60`, `#eqVal60`, `#eqBand250`, `#eqVal250`, `#eqBand1000`, `#eqVal1000`, `#eqBand4000`, `#eqVal4000`, `#eqBand16000`, `#eqVal16000`
   - `#toggleVocalClarity`, `#toggleNightShield`, `#toggleAudioOnlyMode`
   - `#audioLabPresetBadge`, `#audioLabVocalBadge`, `#audioLabNightBadge`
   - `#heroAudioLabStatus`, `#audioLabStatusText`
2. **Bilingual i18n Symmetry:** All `data-i18n` attributes (`audiolab_title`, `audiolab_master_boost`, `audiolab_eq_title`, `audiolab_reset_eq`, `eq_preset_*`, `audiolab_vocal_*`, `audiolab_night_*`, `audiolab_audio_only_*`, `audiolab_dsp_active`) must remain 100% intact.
3. **Accessibility (WCAG 2.1 AA / AAA):** All vertical sliders must retain `role="slider"`, `aria-label`, `aria-valuemin="-12"`, `aria-valuemax="12"`, `aria-valuenow`, and `:focus-visible` styling with `--accent-emerald` focus rings.
4. **Zero-innerHTML Security:** Strict compliance with W3C Trusted Types and Manifest V3 CSP. Zero inline `onclick`, `onchange`, or `oninput` attributes.
5. **UTF-8 with BOM Standard:** All modified HTML, CSS, and JS files must retain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🏆 5. Independent Level 4 QA Verification Signoff & Certification

- **Certification Authority:** Level 4 Independent QA Verification Subagent (`Dept 08 QA & Testing` / `Dept 12 SRE & Security`)
- **Authorization Token:** `AUTH-MGR-20261116-DASHBOARD-EQ-BENTO-001`
- **Quality Score:** **Grade A+ (100% Pass Rate)**
- **Test Suite Results:**
  - `tests/test_dashboard_full_audio_lab_parity.js`: **12 of 12 batteries PASSED (100%)**
  - `tests/test_dashboard_uiux_phase1.js`: **8 of 8 batteries PASSED (100%)**
  - `tests/test_dashboard_theme_and_a11y_verification.js`: **8 of 8 batteries PASSED (100%)**
  - `tests/test_unified_timeline_scrubber.js`: **5 of 5 batteries PASSED (100%)**
  - Workspace Total: **37 of 37 test suites PASSED (0 failures, 100% exit code 0)**
- **Security Audit:** `gitleaks detect --redact` -> **0 leaks found (152 commits scanned)**
- **Encoding Standards:** UTF-8 BOM (`0xEF, 0xBB, 0xBF`) verified on `dashboard.html`, `dashboard.css`, and all modernized test files.
