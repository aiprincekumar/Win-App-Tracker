# Product Requirements Document (PRD)
# Feature: Visualizer Inner UI Content Expansion
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Governance & Specification Reference:**
> - **Lead Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Department:** Dept 01 Product Requirements & Dept 05 Frontend Engineering
> - **Target Audience:** Audiophile users, media enthusiasts, and productivity tracker operators

---

## 🎯 1. Executive Summary & Problem Description

The Sentinel Media Dashboard features a dedicated **Real-Time Spectrum Visualizer** Bento Card (`#heroAudioLabStatus`). While the card has a generous outer footprint (`min-height: 380px`), the inner frequency visualizer canvas is artificially restricted to a hardcoded 130px height. As a result, the canvas appears cramped and diminutive, surrounded by excessive dead space, diminishing the visual value of the 60 FPS audio visualizer.

This feature expands the internal visualizer UI components—particularly the canvas and its container—so they stretch dynamically to occupy the available vertical space of the card, while leaving the outer bounds, height, and grid placement completely untouched.

---

## 👤 2. User Personas & Scenarios

- **Persona 1: The Media Enthusiast (Devraj):** Plays music/podcasts in background browser tabs while working. Keeps the dashboard open on a secondary monitor. Wants the spectrum visualizer to look vibrant, bold, and immersive without wasting screen space.
- **Persona 2: The Audiophile Power User (Elena):** Fine-tunes audio using the 5-Band Equalizer and monitors clipping via VU meters. Expects the visualizer display to be prominent and readable at a glance.

---

## 📋 3. Functional Requirements (FR)

- **FR-01 (Inner UI Full-Height Expansion):** The inner UI hierarchy (`.visualizer-card-body`, `.visualizer-panel`, `.visualizer-canvas-container`) must utilize the entire available vertical space between the card header and bottom footer without overflowing.
- **FR-02 (Strict Outer Invariance):** The outer card (`#heroAudioLabStatus`) dimensions, bento grid span (`bento-span-4 bento-row-span-2`), outer `min-height: 380px`, padding, and outer border radius must NOT be altered or enlarged.
- **FR-03 (Canvas Container Flex Growth):** `.visualizer-canvas-container` must dynamically expand from its current 130px height to fill available height (~200px to ~240px) using `flex: 1 1 auto; height: 100%; min-height: 180px;`.
- **FR-04 (Dynamic Canvas Resolution):** The canvas element (`#canvasAudioVisualizer`) must adjust its coordinate resolution to match container height, rendering crisp 60 FPS waveforms and FFT bars without distortion.
- **FR-05 (All 6 Modes Proportional Scaling):** 32-Band Spectrum, Oscilloscope Wave, Radial Frequency Burst, Matrix Digital Dots, Neon Flame Peaks, and Stereo Mirror Butterfly must all scale their vertical draw commands to utilize the expanded height.
- **FR-06 (Ergonomic VU Meters & Controls Bar):** The top toolbar (`.visualizer-controls-bar`) and bottom VU meters (`.vu-meters-container`) must maintain their compact, tactile styling without being squished or stretched out of proportion.
- **FR-07 (Bilingual & Theme Parity):** Dark mode and Light mode (`body.theme-light`) must both reflect identical expanded flex geometry.

---

## ⚡ 4. Non-Functional Requirements (NFR)

- **NFR-01 (Performance & 60 FPS Budget):** Canvas rendering must maintain steady 60 FPS (<16.6ms per frame) during active media playback with zero frame drops.
- **NFR-02 (Zero Layout Shift / CLS):** Cumulative Layout Shift must remain 0. No jumping or jittering when media playback starts or stops.
- **NFR-03 (W3C Trusted Types & Strict CSP):** 100% compliant with W3C Trusted Types. Zero `innerHTML`, zero `outerHTML`, and zero inline scripts.
- **NFR-04 (Accessibility & WCAG 2.1 AA):** All controls and VU meters must maintain compliant contrast ratios (>= 4.5:1 text, >= 3:1 UI components).

---

## 📝 5. INVEST User Stories & Acceptance Criteria

### User Story 1
**As a** dashboard user viewing active audio playback,  
**I want** the spectrum visualizer canvas to fill the height of its card,  
**So that** the frequency bars and waveforms are prominently visible and visually appealing.

### Given-When-Then Acceptance Contracts

#### Scenario 1: Inner Canvas Dynamic Expansion
- **Given** the dashboard is loaded in normal (mini/compact) mode,
- **When** the Real-Time Spectrum Visualizer card (`#heroAudioLabStatus`) is rendered,
- **Then** the canvas container (`.visualizer-canvas-container`) height must exceed 175px (measured height ~200px+),
- **And** the outer card `#heroAudioLabStatus` must maintain its original outer bounds and `min-height: 380px`.

#### Scenario 2: Zero Outer Bounds Mutation
- **Given** the dashboard Bento Grid layout,
- **When** inspecting `#heroAudioLabStatus`,
- **Then** its class list must retain `bento-span-4 bento-row-span-2`,
- **And** its outer margin, outer padding, and grid positioning must remain unchanged relative to sibling cards.

#### Scenario 3: Visualizer Effects Scaling
- **Given** audio is playing and any effect mode is selected (e.g. 32-Band Spectrum, Oscilloscope Wave, Radial Burst),
- **When** the canvas draws audio FFT data,
- **Then** the rendered graphics must scale dynamically to utilize the expanded vertical canvas space without clipping or blurriness.
