<!-- UTF-8 with BOM -->
# TASK-VIZ-DROPDOWN-EFFECTS-002: Product Requirements Document (PRD)

> **Specification & Governance:**
> - **Task Identifier:** `TASK-VIZ-DROPDOWN-EFFECTS-002`
> - **Lead Department:** Department 01 (Product Requirements) & Department 05 (Frontend Engineering)
> - **Architect:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)

---

## 🎯 1. Overview & Business Objectives

The Media Sentinel Extension provides a rich, real-time media analytics dashboard. The Audio Lab component features a real-time spectrum visualizer that reflects live media playback across browser tabs. Currently, the interface only offers two modes via buttons: `32-Band FFT` and `Waveform`.

The goal of this initiative is to replace the button toggle with a modern dropdown selector containing at least **six diverse, visually engaging audio effects**, while persisting the user's selected mode across sessions and maintaining 100% backward compatibility and test stability.

---

## 👤 2. User Personas & User Stories

### User Persona:
- **Audio Enthusiast & Power User ("Alex"):** Listens to high-fidelity music, podcasts, and streams while working. Enjoys ambient visuals and expects customizable, aesthetic audio spectrum modes on the dashboard.

### INVEST-Compliant User Stories:

#### Story 1: Dropdown Selection UI
- **As an** audio enthusiast,
- **I want to** select my preferred audio visualizer effect from a styled dropdown list,
- **So that** I have quick access to multiple visual styles without cluttering the dashboard interface.

#### Story 2: Six High-Quality 60fps Visualizer Effects
- **As a** user watching live audio telemetry,
- **I want to** choose between at least six distinct visualizer styles (Spectrum Bars, Waveform, Radial Burst, Matrix Dots, Neon Flame, and Stereo Mirror),
- **So that** I can customize the aesthetic mood to match whatever genre or content I am listening to.

#### Story 3: Persistent Preference
- **As a** returning user,
- **I want to** have my chosen visualizer effect remembered between tab switches and browser restarts,
- **So that** I don't have to re-select my preferred visualizer style every time I open the dashboard.

#### Story 4: Click-to-Cycle Interactivity
- **As a** user interacting with the visualizer canvas,
- **I want to** click directly on the canvas to cycle through the effects,
- **So that** I can preview all effects effortlessly without opening the dropdown menu every time.

---

## 📋 3. MoSCoW Feature Prioritization

| Priority | Requirement Code | Feature Description |
| :--- | :---: | :--- |
| **Must Have** | `FR-1` | `<select id="selectVizEffect">` dropdown with 6 distinct visualizer effect options. |
| **Must Have** | `FR-2` | Implementation of all 6 effects in the Canvas 2D engine at a steady 60fps. |
| **Must Have** | `FR-3` | Backward-compatible DOM state synchronization for `#btnVizModeBars` and `#btnVizModeWave`. |
| **Must Have** | `FR-4` | Zero-Overhead Idle Sleep Sentinel (halt RAF loop when audio stops or tab is hidden). |
| **Must Have** | `NFR-1` | 100% W3C Trusted Types compliance (zero `innerHTML` assignments). |
| **Should Have** | `FR-5` | User preference persistence in `chrome.storage.local` / `localStorage`. |
| **Should Have** | `FR-6` | Canvas direct click handler to cycle sequentially through all 6 effects. |
| **Should Have** | `FR-7` | Bilingual English & Hindi translations for dropdown label and all 6 effects. |
| **Could Have** | `FR-8` | Micro-animation smooth crossfade when switching effects. |
| **Won't Have** | `FR-9` | WebGL 3D shader pipeline (out of scope; Canvas 2D provides guaranteed compatibility and 60fps). |

---

## 📐 4. Functional Requirements (FR)

- **`FR-1: Dropdown Component Architecture`**
  - Replace visible capsule buttons with `<select id="selectVizEffect" class="select-viz-effect glass-select">` inside `.visualizer-controls-bar`.
  - Provide 6 `<option>` elements with values: `bars`, `wave`, `radial`, `matrix_dots`, `flame`, `stereo_mirror`.
  - Include an accessible `<label for="selectVizEffect">` with i18n attribute `data-i18n="visualizer_effect_label"`.

- **`FR-2: Six Canvas 2D Visualizer Effects`**
  1. `bars`: 32 frequency bars with smooth lerping, triple-stop gradient (emerald -> cyan -> violet), and falling peak-hold white cap dots.
  2. `wave`: Oscilloscope neon cyan sine trace with glow blur and time-phase modulation.
  3. `radial`: Circular solar flare burst radiating frequency spokes from center with bass-reactive pulsing core.
  4. `matrix_dots`: Cyber voxel matrix grid (32 columns x 10 dot rows) illuminating discrete green/emerald dots according to band power.
  5. `flame`: Sinuous vertical flame plumes with warm energy gradient (crimson -> amber -> gold) dancing to low-end frequencies.
  6. `stereo_mirror`: Bilateral butterfly mirror expanding symmetrically left and right from canvas center in violet/cyan.

- **`FR-3: Backward Compatibility Preservation`**
  - Retain `#btnVizModeBars` and `#btnVizModeWave` in `dashboard.html` inside `<div class="viz-legacy-buttons visually-hidden" aria-hidden="true">`.
  - When `#selectVizEffect` changes to `bars`, `#btnVizModeBars` receives `.active`, `.btn-active`, and `aria-pressed="true"`.
  - When `#selectVizEffect` changes to `wave`, `#btnVizModeWave` receives `.active`, `.btn-active`, and `aria-pressed="true"`.
  - When `#selectVizEffect` changes to other modes, both buttons clear active classes.

- **`FR-4: Preference Persistence`**
  - When mode changes, save key `media_sentinel_viz_effect` to `chrome.storage.local` (with `localStorage` fallback).
  - On dashboard initialization, retrieve `media_sentinel_viz_effect` and set visualizer mode accordingly.

- **`FR-5: Canvas Click-to-Cycle`**
  - Clicking `#canvasAudioVisualizer` advances to the next effect in sequence: `bars` -> `wave` -> `radial` -> `matrix_dots` -> `flame` -> `stereo_mirror` -> `bars`.
  - Synchronizes dropdown `.value` and updates persistence.

---

## ⚡ 5. Non-Functional Requirements (NFR)

- **`NFR-1: Performance & Frame Rate`**
  - All 6 effects must maintain 60fps on standard desktop hardware (frame render duration < 3ms).
  - Zero heap allocation (no `new Object` or array creations) inside the `requestAnimationFrame` loop.

- **`NFR-2: Zero-Overhead Idle Sleep`**
  - When audio is paused or the browser tab is hidden, the RAF loop must be completely cancelled (`cancelAnimationFrame`), consuming 0% CPU.

- **`NFR-3: Security & CSP Compliance`**
  - 100% W3C Trusted Types compliant: zero `innerHTML` or `outerHTML` assignments.
  - Zero inline event handlers (`onclick`, `onchange`) in HTML.

- **`NFR-4: Accessibility (WCAG 2.1 AA)`**
  - Dropdown must be accessible via keyboard (Tab, Arrow keys, Enter).
  - Explicit `<label>` association with `for="selectVizEffect"`.
  - Minimum contrast ratio >= 4.5:1 against dark and light substrate backgrounds.

- **`NFR-5: File Integrity Standard`**
  - All modified files must strictly preserve UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).

---

## 🧪 6. Given-When-Then Acceptance Criteria Contracts

### Contract 1: Dropdown Selection & Effect Switch
- **Given** the dashboard is loaded with active audio playback,
- **When** the user selects "Radial Frequency Burst" from `#selectVizEffect`,
- **Then** the canvas immediately transitions to rendering the radial burst effect, and `getVisualizerState().mode` returns `'radial'`.

### Contract 2: Legacy Button Synchronization
- **Given** the visualizer is currently in `'wave'` mode,
- **When** the user changes `#selectVizEffect` to `'bars'`,
- **Then** `#btnVizModeBars` receives `.active` and `.btn-active` classes, while `#btnVizModeWave` has active classes removed.

### Contract 3: Canvas Click-to-Cycle
- **Given** the visualizer is currently rendering `'stereo_mirror'`,
- **When** the user clicks on `<canvas id="canvasAudioVisualizer">`,
- **Then** the mode cycles to `'bars'`, and `#selectVizEffect.value` updates to `'bars'`.

### Contract 4: Zero-Overhead Idle Sleep
- **Given** the visualizer is rendering in any of the 6 modes at 60fps,
- **When** the active audio stream is paused or the dashboard tab is minimized/hidden,
- **Then** the RAF loop halts immediately, `isVisualizerSleeping` becomes `true`, and 0 CPU cycles are consumed.

### Contract 5: Storage Persistence
- **Given** the user selects `'flame'` mode,
- **When** the user refreshes the dashboard page,
- **Then** the visualizer initializes in `'flame'` mode, and `#selectVizEffect.value` is `'flame'`.
