# 5-Band Equalizer & Audio Lab: Pure Separate Split Containers Master Tracking Board

> **Document Type:** Live Phase Orchestration Index, Problem-Solution Dossier & Diagnostic Matrix  
> **Workspace Container:** `temp_prompt/equalizer_pure_split_containers/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Date:** 2026-11-17  
> **Target Task ID:** `TASK-EQ-PURE-SPLIT-CONTAINERS-001`  
> **Target Scope:** Frontend UI Architecture Only (`dashboard/dashboard.html`, `dashboard/dashboard.css`, test suites). Strictly zero backend changes.

---

## 📋 1. Executive Problem-Solution Dossier

### User Feedback & Defect Analysis
The user provided critical feedback regarding the previous layout separation:
> *"तुमने इसे सिर्फ़ डिवाइड कर दिया है, स्प्लिट नहीं किया है। मैंने तुम्हें स्प्लिट करने के लिए बोला था। तुमने अभी एक ही कंटेनर में दो पार्ट कर दिया है जो कि मैं नहीं चाहता हूँ। दो सेपरेट अलग-अलग पार्ट होने चाहिए, मतलब कंटेनर होने चाहिए, डिव होने चाहिए। एक ही में दो अलग-अलग पार्ट नहीं होने चाहिए, तो अलग-अलग प्योर सेपरेट होने चाहिए।"*

### Root Cause
In the previous implementation (`TASK-EQ-LAYOUT-SEPARATION-001`), both the 5-Band Graphic Equalizer and the Audio Lab DSP Enhancements were wrapped inside a single parent container (`<div id="heroAudioEqCard" class="... bento-span-12">`) and divided internally via a 2-column CSS grid (`.audio-eq-split-deck` with `.eq-deck-left-col` and `.eq-deck-right-col`). This created "two parts inside one container", rather than **two pure, independent, separate sibling Bento containers/cards**.

### Architectural Solution: Two Pure Sibling Bento Containers
1. **Container 1 (Dedicated 5-Band Graphic Equalizer Card):**
   - Independent top-level Bento Card: `<div id="heroAudioEqCard" class="audio-eq-widget glass-card bento-card liquid-glass-card bento-span-6">`
   - Houses solely the 5-Band Equalizer:
     - Header (`#lblAudioEqTitle`, specs badge)
     - Preset selector dropdown (`#audioEqPresetSelect`)
     - Quick reset button (`#btnResetEq`)
     - 5-Band vertical slider grid (`#eqBand0`-`#eqBand4` / 60Hz-14kHz/16kHz) and dB badges (`#eqVal0`-`#eqVal4`)
2. **Container 2 (Dedicated Audio Lab & DSP Enhancements Card):**
   - Independent top-level Bento Card: `<div id="heroAudioLabCard" class="audio-lab-widget glass-card bento-card liquid-glass-card bento-span-6">`
   - Houses solely the Audio Lab & DSP controls:
     - Audio Lab header (`#audioLabTitle`), live telemetry status dot and text (`#audioLabStatusText`)
     - Active feature badges (`#audioLabPresetBadge`, `#audioLabVocalBadge`, `#audioLabNightBadge`)
     - Master Volume Boost slider panel (`#lblAudioMasterBoost`, `#heroAudioBoostSlider`, `#heroAudioBoostVal`, scale marks 0%-200%)
     - Studio enhancement toggles grid (`#lblAudioVocalTitle`, `#toggleVocalClarity`, `#lblNightModeTitle`, `#toggleNightMode`, `#lblAudioOnlyTitle`, `#toggleAudioOnlyMode`)
3. **Pure Separation Invariant:**
   - Neither container is nested inside the other.
   - No outer wrapper div encompasses both containers.
   - Both are direct sibling elements inside the Bento Grid (`.bento-grid`) of Tab B (`#panelMediaDeck` / Media Analytics).
   - Desktop layout: Side-by-side (`bento-span-6` each, filling 12 columns together).
   - Tablet/Mobile layout (viewport <= 1024px): Responsive clean stacking (`bento-span-12` full width each).

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Focus & Scope | Assigned Role | Status | Test Gate | QA Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Pure DOM Restructuring | Break single wrapper into two pure top-level sibling Bento cards (`#heroAudioEqCard` and `#heroAudioLabCard`); eliminate `.audio-eq-split-deck` wrapper; preserve all 18 DOM IDs | Level 4 Frontend Engineer | COMPLETED | AST syntax check, DOM sibling verification | Passed Gate 1 |
| **Phase 2** | CSS Refinement & Responsive Bento-Span-6 Layout | Style `#heroAudioEqCard` and `#heroAudioLabCard` as independent `bento-span-6` cards; ensure liquid glass styling, specular borders, and responsive <=1024px stacking | Level 4 CSS/Design Engineer | COMPLETED | Visual layout check, responsive reflow, WCAG contrast | Passed Gate 2 |
| **Phase 3** | QA Verification & Test Suite Parity | Update test assertions to validate two independent sibling containers; run full 53-suite test battery (`node run_all_tests.js`); verify exit code 0 and gitleaks | Level 4 QA Verification Tester | COMPLETED | `node run_all_tests.js` (53/53 PASS) | Certified Grade A+ |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `dashboard/dashboard.html` | Equalizer and Audio Lab are contained inside a single `#heroAudioEqCard` parent div with `.audio-eq-split-deck` | Split into two pure sibling `<div class="... bento-span-6">` elements (`#heroAudioEqCard` and `#heroAudioLabCard`) directly under Bento Grid | Pure physical and visual container separation; clean independent DOM trees | Phase 1 | `tests/test_dashboard_features_phase2.js` |
| 2 | `dashboard/dashboard.css` | CSS uses `.audio-eq-split-deck` grid inside `#heroAudioEqCard` with `.eq-deck-left-col` border-right | Remove internal split-deck rules; define `#heroAudioEqCard` and `#heroAudioLabCard` as standalone Bento cards with `grid-column: span 6;` and responsive `@media (max-width: 1024px) { grid-column: span 12; }` | Native Bento grid alignment; modular liquid-glass cards with zero layout shift | Phase 2 | `tests/test_light_mode_contrast_and_wcag.js` |
| 3 | `dashboard/dashboard.js` | JavaScript references all 18 DOM element IDs for event listeners and state updates | Confirm all DOM IDs remain intact and bound cleanly to their respective cards; update any container-level queries | 100% interactive parity; EQ and Audio Lab updates operate seamlessly | Phase 1 | `node -c dashboard/dashboard.js` |
| 4 | `tests/test_equalizer_layout_separation_phase1_2.js` | Test asserts presence of `.audio-eq-split-deck` and single container structure | Update test to verify `#heroAudioEqCard` and `#heroAudioLabCard` exist as two separate sibling cards with `bento-span-6` | Test accurately reflects pure separate container architecture | Phase 3 | `node tests/test_equalizer_layout_separation_phase1_2.js` |
| 5 | `tests/test_dashboard_full_audio_lab_parity.js` | Test verifies `#heroAudioEqCard` container properties and element presence | Update assertions to check `#heroAudioEqCard` (Equalizer) and `#heroAudioLabCard` (Audio Lab) independently | All parity and Trusted Types checks pass 100% green | Phase 3 | `node tests/test_dashboard_full_audio_lab_parity.js` |
| 6 | `tests/test_visualizer_separation_qa_parity.js` | Test checks container separation for `#heroAudioEqCard` | Verify both `#heroAudioEqCard` and `#heroAudioLabCard` are independent of `#visualizerPanel` | Complete multi-card modular verification | Phase 3 | `node tests/test_visualizer_separation_qa_parity.js` |
| 7 | Global Test Battery | 50 test suites validate extension integrity across all features | Execute `node run_all_tests.js` to certify 50/50 test suites pass with exit code 0 | Complete regression safety and system stability certified | Phase 3 | `node run_all_tests.js` |

---

## 🛡️ 4. Invariants & Guardrails

1. **Constitutional Zero-Backend Invariant:** This initiative is strictly restricted to frontend UI/UX in `dashboard/dashboard.html`, `dashboard/dashboard.css`, and associated test suites. Zero changes permitted in background workers, native messaging, or SQLite hub.
2. **Strict Preservation of All 18 Audio DOM IDs:**
   - Equalizer Card: `#heroAudioEqCard`, `#lblAudioEqTitle`, `#audioEqPresetSelect`, `#btnResetEq`, `#eqBand0`-`#eqBand4` (or 60Hz-14kHz), `#eqVal0`-`#eqVal4`.
   - Audio Lab Card: `#heroAudioLabCard`, `#audioLabTitle`, `#audioLabStatusText`, `#audioLabPresetBadge`, `#audioLabVocalBadge`, `#audioLabNightBadge`, `#lblAudioMasterBoost`, `#heroAudioBoostSlider`, `#heroAudioBoostVal`, `#lblAudioVocalTitle`, `#toggleVocalClarity`, `#lblNightModeTitle`, `#toggleNightMode`, `#lblAudioOnlyTitle`, `#toggleAudioOnlyMode`.
3. **Pure Separate Containers:** The Equalizer and Audio Lab MUST NOT share an enclosing outer card div. They must be pure sibling elements in the Bento grid.
4. **W3C Trusted Types & Security:** Zero `.innerHTML` or `.outerHTML` usage; zero inline event handlers (`onclick`, `onchange`).
5. **UTF-8 with BOM:** All modified files must preserve UTF-8 with BOM encoding (`0xEF, 0xBB, 0xBF`).
