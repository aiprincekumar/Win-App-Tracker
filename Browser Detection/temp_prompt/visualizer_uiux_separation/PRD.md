# Real-Time Spectrum Visualizer UI/UX Separation: Product Requirements Document (PRD)

> **Document Type:** Product Requirements Document (PRD)  
> **Workspace Container:** `temp_prompt/visualizer_uiux_separation/`  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Date:** 2026-11-17  

---

## 👥 1. User Personas & Problem Scenarios

### Persona 1: The Media Sentinel Operator (Power User)
- **Goal:** Monitor browser audio playback across multiple streaming tabs (YouTube, Spotify, SoundCloud) in real time.
- **Pain Point:** The existing visualizer is cramped beneath sliders and toggles, making it impossible to see clear peak frequencies or stereo clipping while watching media playback.
- **Needs:** An expansive, studio-grade spectrum visualizer right next to the Live Media Player status card, showing stereo levels, instant mode toggling (32-band FFT vs Waveform), and an unambiguous 0dB clipping indicator.

### Persona 2: The Audiophile / Sound Tuner
- **Goal:** Sculpt audio frequencies, enhance vocal clarity for podcasts, or soften transients for night viewing.
- **Pain Point:** Volume boost and audio enhancement toggles are located in one card while the 5-band graphic equalizer is in another, causing fragmented controls.
- **Needs:** A unified Master Studio Audio Deck where gain boost, enhancements, and EQ filters are arranged logically in one wide mixing board.

---

## 🎯 2. Functional Requirements (FR)

- **FR-01 (Visualizer Placement):** The Real-Time Spectrum Visualizer and Offscreen DSP Status badge must be rendered in a dedicated Bento card spanning `bento-span-4 bento-row-span-2`, positioned immediately adjacent to `#heroMediaPlayerCard` (`bento-span-8 bento-row-span-2`).
- **FR-02 (Canvas Sizing & Rendering):** The spectrum canvas (`#canvasAudioVisualizer`) must render dynamically without distortion across both 32-band FFT mode and oscilloscope Waveform mode at 60fps.
- **FR-03 (Mode Toggles):** The mode switch buttons (`#btnVizModeBars` and `#btnVizModeWave`) must provide instant visual feedback with active styling, clear typography, and accessible keyboard navigation.
- **FR-04 (Stereo VU Meters):** Dual Left and Right VU meter channels (`#vuBarLeft`, `#vuBarRight`) must show real-time dynamic level bars with numeric decibel readouts (`#vuValLeft`, `#vuValRight`).
- **FR-05 (0dB Clipping Indicator):** A dedicated badge (`#vuClipIndicator`) must clearly display safe headroom (`0dB OK`) and trigger an alert state when clipping occurs.
- **FR-06 (Audio Lab Consolidation):** The Master Volume Boost slider (`#heroAudioBoostSlider`), readout (`#heroAudioBoostVal`), telemetry badges, and the three enhancement switches (`#toggleVocalClarity`, `#toggleNightShield`, `#toggleAudioOnlyMode`) must be integrated seamlessly into the 5-Band Equalizer card (`#heroAudioEqCard`).
- **FR-07 (Bilingual Support):** All text elements must preserve their existing `data-i18n` attributes for bilingual English and Hindi localization.

---

## ⚙️ 3. Non-Functional Requirements (NFR)

- **NFR-01 (Zero Layout Shift):** Layout changes must produce zero Cumulative Layout Shift (CLS = 0) on Tab B loading.
- **NFR-02 (Performance):** Canvas rendering loop must remain decoupled and throttle gracefully when the dashboard tab is hidden or backgrounded, consuming < 2% CPU.
- **NFR-03 (W3C Trusted Types & MV3 CSP):** Zero `.innerHTML` assignments in all HTML and JS modifications; strictly use `textContent` and DOM APIs.
- **NFR-04 (Accessibility):** WCAG 2.1 AA compliance for color contrast (minimum 4.5:1 for text, 3:1 for interactive UI components), explicit ARIA roles (`role="slider"`, `role="switch"`, `role="region"`, `role="img"`).
- **NFR-05 (Test Suite Passage):** 100% of all 44 test suites in `tests/` must pass cleanly with exit code 0.

---

## 📊 4. MoSCoW Feature Prioritization

- **Must Have (P0):**
  - Dedicated visualizer card beside Live Media Player (`bento-span-4 bento-row-span-2`).
  - Integration of Master Boost and 3 enhancement toggles into `#heroAudioEqCard`.
  - Preservation of all 18 DOM IDs and bilingual `data-i18n` bindings.
  - 100% pass on all 44 test suites.
- **Should Have (P1):**
  - Dark theme liquid glass styling for FFT/Waveform buttons, VU meters, and 0dB badge.
  - Specular highlight borders and hover physics matching iOS 26 liquid glass tokens.
- **Could Have (P2):**
  - Subtle glowing glow trail on the visualizer canvas bars when active.
- **Won't Have (P3):**
  - Addition of new audio DSP nodes or changing the Web Audio API filter topology (strictly out of scope).

---

## 📋 5. INVEST User Stories & Acceptance Criteria

### User Story 1: Dedicated Visualizer Beside Media Player
> **As an** operator watching active media streams,  
> **I want** the spectrum visualizer to sit directly beside the live player in a dedicated card,  
> **So that** I have a prominent, unobstructed view of audio activity and stereo balance.

```gherkin
Scenario: Viewing the dedicated visualizer card
  Given I navigate to Tab B (Media Analytics) in dashboard.html
  When the page renders
  Then the visualizer card must occupy bento-span-4 bento-row-span-2 adjacent to #heroMediaPlayerCard
  And the canvas #canvasAudioVisualizer must be clearly visible with 600x120 internal resolution
  And the offscreen DSP status badge #audioLabStatusText must be present
```

### User Story 2: Consolidated Equalizer and Boost Console
> **As an** audio listener adjusting sound preferences,  
> **I want** the Master Boost slider and audio enhancements inside the Equalizer card,  
> **So that** all sound-altering controls are united in one comprehensive deck.

```gherkin
Scenario: Adjusting audio boost and EQ in the unified deck
  Given I am inspecting #heroAudioEqCard in dashboard.html
  When I look at the upper section of the card
  Then I see the Master Volume Boost slider (#heroAudioBoostSlider) and readout (#heroAudioBoostVal)
  And I see the switches for Vocal Clarity, Night Shield, and Audio-Only Mode
  And below I see the 5 vertical sliders (#eqBand60 to #eqBand16000) for frequency shaping
```
