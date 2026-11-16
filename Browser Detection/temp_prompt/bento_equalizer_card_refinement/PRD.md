# Product Requirements Document (PRD): Bento 5-Band Graphic Equalizer Card & Media Analytics UI/UX Refinement

> **Document Type:** Product Requirements Document (PRD)  
> **Workspace Container:** `temp_prompt/bento_equalizer_card_refinement/`  
> **Feature Name:** Bento 5-Band Graphic Equalizer Card & Media Analytics UI/UX Refinement  
> **Governing Lead Department:** Department 01 (Product Requirements) & Department 05 (Frontend Engineering)  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Date:** 2026-11-16  

---

## 👥 1. Target User Personas

1. **The Audiophile Power User (Alex):** Listens to diverse music and video streams through high-end headphones or studio monitors. Demands fine-grained, tactile equalization across distinct frequency spectrums (punchy 60Hz sub-bass, clean 1kHz vocal presence, crisp 16kHz air) with immediate visual feedback, presets, and quick resets.
2. **The Movie & Dialogue Streamer (Priya):** Watches movies and shows on streaming platforms where dialogue is frequently overwhelmed by background music or explosive action. Relies on Vocal Clarity and Night Shield toggles, as well as Vocal Enhancer EQ presets, to hear crisp speech without disturbing others.
3. **The Accessibility & Keyboard User (Jordan):** Relies on keyboard navigation, screen readers, and high-contrast visuals. Demands full ARIA slider conformance, clear value announcements (e.g., "+3 dB at 1kHz"), prominent focus rings, and seamless bilingual support (English/Hindi).

---

## 🎯 2. Functional Requirements (FR)

| Req ID | Title | Description | Acceptance Standard |
| :---: | :--- | :--- | :--- |
| **FR-1** | Dedicated Equalizer Bento Card | Extract the 5-band equalizer into a standalone Bento Liquid Glass Card with ID `#heroAudioEqCard` and classes `audio-eq-widget glass-card bento-card liquid-glass-card bento-span-12` (or `bento-span-6`). | Standalone card rendered outside `#heroAudioLabStatus` within Tab B Bento grid container. |
| **FR-2** | 5-Band Biquad Frequency Sliders | Render 5 vertical frequency sliders for 60Hz, 250Hz, 1kHz, 4kHz, and 16kHz with range `min="-12"` to `max="12"`, `step="1"`, and default `0`. | Preserves IDs `#eqBand60`, `#eqBand250`, `#eqBand1000`, `#eqBand4000`, `#eqBand16000` and numeric readouts `#eqVal60` through `#eqVal16000`. |
| **FR-3** | Preset Selector Dropdown | Provide 9 equalization presets (Flat, Bass Boost, Vocal Enhancer, Treble Boost, Electronic, Rock, Acoustic, Night Mode, Custom). | Preserves ID `#audioEqPresetSelect` and all 9 option values. Selecting a preset updates all 5 sliders and storage dynamically. |
| **FR-4** | Quick Reset Button | Provide a prominent reset button to instantly restore all 5 bands to 0dB (Flat). | Preserves ID `#btnResetEq` with `data-i18n="audiolab_reset_eq"`. Clicking resets sliders to 0dB, updates preset to `flat`, and persists settings. |
| **FR-5** | Streamlined Audio Lab Card | Retain `#heroAudioLabStatus` housing Master Volume Boost (0% to 200%), 3 Audio Enhancement switches, 3 Telemetry Badges, and DSP status text. | Preserves all boost and enhancement IDs (`#heroAudioBoostSlider`, `#heroAudioBoostVal`, `#lblAudioMasterBoost`, `#toggleVocalClarity`, `#toggleNightShield`, `#toggleAudioOnlyMode`, badges, and `#audioLabStatusText`). |
| **FR-6** | Symmetrical Bilingual Parity | Ensure 100% of labels, headings, tooltips, and badges support instant dynamic translation between English and Hindi without hardcoded text. | All text nodes have valid `data-i18n` attributes mapped to pure English and authentic Hindi dictionaries. |
| **FR-7** | Keyboard & ARIA Conformance | All 5 EQ sliders must declare `role="slider"`, `tabindex="0"`, `aria-label`, `aria-valuemin="-12"`, `aria-valuemax="12"`, and `aria-valuenow`. | Keyboard arrow keys adjust band by +/-1dB; PageUp/PageDown adjust by +/-3dB; Home/End set to -12dB/+12dB. |
| **FR-8** | Visual Decibel Scale & Detents | Display clear visual dB markings (-12dB, -6dB, 0dB, +6dB, +12dB) with a glowing zero-dB center detent line across the slider grid. | Visually distinct zero-dB baseline; sliders indicate boost (positive/green-cyan) vs cut (negative/amber-rose). |

---

## ⚡ 3. Non-Functional Requirements (NFR)

1. **NFR-1: Zero Cumulative Layout Shift (CLS = 0):** The Bento grid and card containers must have explicit min-heights (`min-height: 140px`) and defined aspect ratios so that loading or tab switching does not cause layout jitter.
2. **NFR-2: GPU Hardware-Accelerated Rendering:** All animations, hovers, specular borders, and blur shaders must operate strictly on `transform`, `opacity`, and `filter` with `will-change: transform`.
3. **NFR-3: W3C Trusted Types & Strict CSP:** Zero inline scripts, zero `javascript:` URLs, zero inline `on*` event handlers, and zero assignments to `.innerHTML`.
4. **NFR-4: Responsive Breakpoint Resilience:** Seamless layout transitions across Desktop (>1200px, 12 columns), Tablet (769px–1200px, collapse to 6-span/12-span), and Mobile (<=768px, full 12-span single column).
5. **NFR-5: High Contrast Accessibility (WCAG 2.1 AA & AAA):** Contrast ratio for all active text and labels must meet or exceed 7.0:1 (AAA) against dark mode surface (`#080b11`) and light mode surface (`#f8fafc`).
6. **NFR-6: File Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on all modified HTML, CSS, and JS files.

---

## 📖 4. INVEST User Stories

- **US-1 (Studio Ergonomics):** As an audiophile user, I want the 5-band equalizer displayed in a dedicated, wide Bento card so that I can easily grab and adjust individual frequency bands with precise vertical travel.
- **US-2 (Quick Reset):** As a user testing extreme EQ curves, I want a single-click "Reset EQ" button so that I can instantly return to a reference Flat response without manually resetting 5 separate sliders.
- **US-3 (Clarity & Enhancements Separation):** As a movie watcher, I want Master Volume Boost and Vocal Clarity located in an uncluttered Audio Lab card so that I can adjust speech intelligibility quickly without navigating through equalizer sliders.
- **US-4 (Screen Reader & Accessibility):** As a visually impaired user navigating with NVDA/JAWS, I want each equalizer slider to announce its frequency and decibel level so that I can accurately sculpt sound using keyboard navigation.

---

## 🏷️ 5. MoSCoW Feature Prioritization

- **Must Have:**
  - Dedicated `#heroAudioEqCard` Bento container in Tab B.
  - 100% preservation of all 18 existing Audio Lab & EQ DOM IDs.
  - Preservation of `#heroAudioLabStatus` with Master Boost, 3 enhancements, badges, and DSP status.
  - 100% passage of `test_dashboard_full_audio_lab_parity.js`, `test_dashboard_uiux_phase1.js`, and `test_dashboard_theme_and_a11y_verification.js`.
- **Should Have:**
  - 180px–200px vertical slider track height with glowing zero-dB center detent line.
  - Specular Liquid Glass borders (`--glass-specular-border`) and lift hover micro-interactions.
  - Visual dB scale guide (-12dB to +12dB).
- **Could Have:**
  - Real-time frequency response curve visualizer canvas above or behind the vertical sliders.
  - Interactive preset chips for 1-click preset switching.
- **Won't Have (Out of Scope for this Task):**
  - Changing the number of equalizer bands (must remain strictly 5 bands: 60Hz, 250Hz, 1kHz, 4kHz, 16kHz).
  - Mutating Web Audio DSP background message types or audio nodes in `offscreen_audio.js`.

---

## 🧪 6. Given-When-Then Acceptance Criteria Contracts

### Contract 1: Standalone Card Presence & DOM Integrity
- **Given:** The user navigates to Tab B (Media Analytics) in `dashboard/dashboard.html`.
- **When:** The DOM tree is rendered.
- **Then:** `#heroAudioEqCard` exists as a top-level Bento card inside `#tabContentMediaAnalytics`, containing `#lblAudioEqTitle`, `#audioEqPresetSelect`, `#btnResetEq`, and all 5 band sliders (`#eqBand60` to `#eqBand16000`).
- **And:** `#heroAudioLabStatus` exists as a sibling Bento card, containing `#heroAudioBoostSlider`, `#lblAudioMasterBoost`, `#toggleVocalClarity`, `#toggleNightShield`, `#toggleAudioOnlyMode`, and `#audioLabStatusText`.

### Contract 2: Interactive Slider & Preset Bidirectional Sync
- **Given:** The user moves `#eqBand1000` (1kHz) slider from 0dB to +6dB.
- **When:** The `input` event triggers.
- **Then:** `#eqVal1000` updates to `+6dB`, `#audioEqPresetSelect` automatically switches its value to `custom`, `#audioLabPresetBadge` updates to `Custom`, and settings are synced to `chrome.storage.local` and dispatched via `APPLY_AUDIO_LAB_SETTINGS` IPC.

### Contract 3: Quick Reset Action
- **Given:** Any or all 5 EQ sliders have non-zero decibel values.
- **When:** The user clicks `#btnResetEq`.
- **Then:** All 5 sliders snap to 0dB, all readouts display `0dB`, `#audioEqPresetSelect` switches to `flat`, and `#audioLabPresetBadge` displays `Flat`.
