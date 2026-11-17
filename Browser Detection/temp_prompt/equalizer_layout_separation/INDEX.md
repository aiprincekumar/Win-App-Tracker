﻿﻿﻿# 5-Band Equalizer & Audio Lab Layout Separation: Master Tracking Board

> **Document Type:** Live Phase Orchestration Index, Problem-Solution Dossier & Diagnostic Matrix  
> **Workspace Container:** 	emp_prompt/equalizer_layout_separation/  
> **Governing Architecture:** [PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (prompt_generation_specialist)  
> **Date:** 2026-11-17  
> **Target Task ID:** TASK-EQ-LAYOUT-SEPARATION-001  
> **Target Scope:** Frontend UI Only (dashboard/dashboard.html, dashboard/dashboard.css, dashboard/styles/audio_lab.css). Strictly zero backend changes.

---

## 📋 1. Executive Problem-Solution Dossier

### Problem Statement
In Tab B (Media Analytics) of dashboard/dashboard.html, the 5-Band Graphic Equalizer, Master Volume Boost slider, Vocal Clarity switch, Night Shield switch, Audio-Only Mode toggle, and Audio Lab badges are currently aggregated inside a single monolithic vertical card (#heroAudioEqCard). This layout suffers from several key usability and visual hierarchy issues:
1. **Vertical Monolith Cramping:** The Gain Shaping deck (Master Boost slider + 3 enhancement chips) is stacked directly on top of the 5-Band Graphic Equalizer frequency sliders. This forces the card into excessive vertical height, requiring excessive page scrolling to reach the Media Playback History table.
2. **Loss of Studio Ergonomics:** Graphic equalizers in pro-audio interfaces are traditionally positioned as dedicated lateral rack units. Stacking gain boost controls and enhancement switches directly above frequency bands crowds the faders and reduces horizontal breathing room.
3. **User Request for Separation:** The user specifically directed that the 5-Band Graphic Equalizer be cleanly separated out as it was previously, positioned on the **LEFT** side, while all remaining content (Master Volume Boost slider, Vocal Clarity, Night Shield, Audio-Only Mode, Audio Lab badges/presets) is placed into a dedicated container/section on the **RIGHT** side.

### Architectural Solution
1. **Two-Column Split Deck Architecture:**
   - **LEFT SIDE (Dedicated 5-Band Graphic Equalizer Section):**
     - Title & Header: 🎚️ 5-Band Graphic Equalizer with biquad peaking filter specifications (Biquad Peaking Filters (Q=1.4) • [-12dB, +12dB]).
     - Equalizer Preset Selector: <select id="audioEqPresetSelect"> with all 9 studio curves (Flat, Bass Boost, Vocal Enhancer, Treble Boost, Electronic, Rock, Acoustic, Night Mode, Custom).
     - Quick Reset Button: <button id="btnResetEq">🔄 Reset EQ</button>.
     - 5-Band Vertical Slider Grid: .eq-bands-grid containing 60Hz (Sub-Bass), 250Hz (Bass), 1kHz (Vocals), 4kHz (Presence), and 16kHz (Air) faders (#eqBand60, #eqBand250, #eqBand1000, #eqBand4000, #eqBand16000) and live dB badges (#eqVal60 through #eqVal16000).
   - **RIGHT SIDE (Audio Enhancements & DSP Lab Section):**
     - Header & Status: 🎛️ Audio Lab & DSP Enhancements (#audioLabTitle), live telemetry status dot and note (#audioLabStatusText), and active feature badges (#audioLabPresetBadge, #audioLabVocalBadge, #audioLabNightBadge).
     - Master Volume Boost Control: Dedicated slider panel with #heroAudioBoostSlider (0% to 200%), live percentage readout (#heroAudioBoostVal), label (#lblAudioMasterBoost), and calibrated scale marks (0%, 50%, 100% Normal, 150%, 200% Max).
     - Audio Enhancement Cards: Grid/column of studio toggle chips for Vocal Clarity (#toggleVocalClarity), Night Shield (#toggleNightShield), and Audio-Only Mode (#toggleAudioOnlyMode) with bilingual descriptions.
2. **Liquid Glass 2.0 Responsive Container:**
   - Implement either a seamless dual-card layout or an integrated split-deck layout inside #heroAudioEqCard (ento-span-12), using CSS Grid / Flexbox (display: grid; grid-template-columns: 1fr 1fr; gap: 20px;) on desktop and stacking cleanly (grid-template-columns: 1fr;) on mobile/tablet (viewport width <= 1024px).
   - Apply frosted glass acrylic backdrops (ackdrop-filter: blur(16px)), specular inner borders, subtle elevation shadows, and smooth 150ms hover physics.
   - 100% theme parity across dark mode (	heme-dark) and light mode (	heme-light) with WCAG AA compliance (contrast ratio >= 4.5:1).
3. **DOM ID Immutability & 100% Test Parity:**
   - Retain all 18 audio lab and equalizer DOM element IDs unchanged.
   - Retain all bilingual data-i18n translation keys.
   - Zero .innerHTML assignments (100% W3C Trusted Types & MV3 CSP compliance).
   - Ensure all 48 test suites in 	ests/ pass cleanly with exit code 0.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Focus & Scope | Assigned Role | Status | Test Gate | QA Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | DOM Separation Left/Right | Restructure HTML: Equalizer on LEFT side, Master Boost + Enhancements on RIGHT side; preserve all 18 IDs | Level 4 Frontend Engineer | COMPLETED | node -c, DOM ID integrity check | Passed Gate 1 |
| **Phase 2** | CSS Liquid Glass & Grid Polish | Dual-pane split grid/flex, specular borders, responsive breakpoints (desktop 2-col, mobile 1-col), light/dark theme contrast | Level 4 CSS/Design Engineer | COMPLETED | CSS validation, WCAG AA contrast check | Passed Gate 2 |
| **Phase 3** | QA Verification & Test Parity | Execute full test battery (49 suites), verify audio lab parity, Trusted Types check, secret audit (gitleaks) | Level 4 QA Verification Tester | COMPLETED | node run_all_tests.js (49/49 PASS) | Passed Gate 3 (Grade A+) |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | dashboard/dashboard.html | Equalizer and Audio Enhancements are vertically stacked inside a single monolithic body, causing vertical bloating and losing pro-audio split layout | Restructure DOM inside Tab B into a lateral dual-section architecture: 5-Band EQ on LEFT, Audio Lab (Master Boost + 3 Toggles + Badges) on RIGHT | Balanced visual ergonomics; instant side-by-side access to EQ faders and gain enhancement toggles | Phase 1 | 	ests/test_dashboard_features_phase2.js |
| 2 | dashboard/dashboard.css | CSS styles .eq-studio-top-deck as a full-width vertical block above .eq-bands-grid | Redesign layout rules to support .audio-eq-split-deck with .eq-deck-left-col (52%) and .eq-deck-right-col (48%); add media queries for <=1024px stacking | Zero horizontal overflow; flawless responsive reflow; specular liquid glass card aesthetics | Phase 2 | 	ests/test_dashboard_uiux_phase1.js |
| 3 | dashboard/styles/audio_lab.css | Modular audio stylesheet rules assume single-column vertical flow for boost slider and enhancement chips | Refactor .audio-boost-control and .audio-enhancements-section to fit comfortably in the right column of the split deck | Optimal control density; clean slider track width; no text truncation or wrapping defects | Phase 2 | 	ests/test_light_mode_contrast_and_wcag.js |
| 4 | dashboard/dashboard.js | Event listeners and UI update routines expect all 18 DOM IDs to be present and queryable | Verify initDashboardAudioLab, updateDashboardAudioLabUI, and EQ slider listeners bind seamlessly to new DOM hierarchy | 100% interactive parity; immediate reactivity upon slider adjustment or preset selection | Phase 1 | 	ests/test_dashboard_full_audio_lab_parity.js |
| 5 | 	ests/test_dashboard_full_audio_lab_parity.js | Test assertions check container structure, class names, and element presence for #heroAudioEqCard and audio elements | Maintain #heroAudioEqCard with required classes and verify left/right child element presence without regression | All 12 batteries of Phase 5 Audio Lab test suite pass with 100% green checkmarks | Phase 3 | node run_all_tests.js |

---

## 🛡️ 4. Risk Mitigation & Invariants

1. **Constitutional Zero-Backend Invariant:** This task is strictly frontend UI layout and styling (dashboard/dashboard.html, dashboard/dashboard.css, dashboard/styles/audio_lab.css). Strictly ZERO modifications to background scripts, Native Messaging hosts, SQLite data hub daemon, or HUD bridge servers.
2. **18 Audio DOM IDs Immutability:** Under no circumstances may any of the following 18 DOM IDs be renamed, modified, or removed:
   - lblAudioEqTitle, udioEqPresetSelect, tnResetEq
   - eqBand60, eqBand250, eqBand1000, eqBand4000, eqBand16000
   - eqVal60, eqVal250, eqVal1000, eqVal4000, eqVal16000
   - lblAudioMasterBoost, heroAudioBoostSlider, heroAudioBoostVal
   - 	oggleVocalClarity, 	oggleNightShield, 	oggleAudioOnlyMode
   - udioLabTitle, udioLabStatusText, udioLabPresetBadge, udioLabVocalBadge, udioLabNightBadge
3. **W3C Trusted Types & Zero-innerHTML Security:** All DOM modifications must maintain 100% strict CSP compliance. Zero assignments to .innerHTML or .outerHTML; zero inline onclick or onchange attributes.
4. **Bilingual i18n Parity:** All static text and dynamic tooltips must preserve bilingual data-i18n attributes (udiolab_eq_title, udiolab_master_boost, udiolab_vocal_title, udiolab_night_title, udiolab_audio_only_title, udiolab_reset_eq, etc.).
5. **Zero Cumulative Layout Shift (CLS = 0):** The split-pane layout must have explicit dimensions and flex/grid proportions to avoid layout shifts or slider track clipping during rendering.
6. **Rollback Snapshot:** Git commit 02b38c represents the clean verified baseline. If any regression occurs, changes can be rolled back via git checkout -- dashboard/.