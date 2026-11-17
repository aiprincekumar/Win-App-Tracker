# scripts/gen_visualizer_expansion_prompts.py
# Deterministic generator for Visualizer Inner Content Expansion ephemeral prompt suite
# Governed by PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md & Universal Rule 5/8 (UTF-8 with BOM)

import os

task_dir = os.path.join("temp_prompt", "visualizer_inner_content_expansion")
os.makedirs(task_dir, exist_ok=True)

def write_bom_file(filename, content):
    filepath = os.path.join(task_dir, filename)
    with open(filepath, "w", encoding="utf-8-sig") as f:
        f.write(content.strip() + "\n")
    size = os.path.getsize(filepath)
    print(f"[BOM CERTIFIED] Wrote {filename} ({size} bytes)")

# ---------------------------------------------------------------------------
# 1. INDEX.md
# ---------------------------------------------------------------------------
index_content = """# Phase-wise Execution Tracking Board & Problem-Solution Dossier
# Task: Visualizer Inner UI Content Expansion (Fill Outer Container Without Mutating Outer Bounds/Height)
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Governance & Specification Reference:**
> - **Lead Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Architecture Recommendation:** [`architecture_recommendation.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/architecture_recommendation.md)
> - **Prompt Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)
> - **Department Rules:** `dynamic_departments_matrix.md` (Dept 01 Product Requirements, Dept 04 Architecture, Dept 05 Frontend Engineering, Dept 08 QA & Testing)
> - **Decision Gate Assessment:** `PROMPT_FILES_REQUIRED = YES` (Compound UI/UX Flex Architecture & Canvas Render Adaptation)
> - **Recommended Strategy:** `STRATEGY_A_AUTONOMOUS` (Autonomous Forward Momentum, Autonomy Score: 1.0)
> - **Active Status:** `SPECIFICATION_LOCKED` (Ready for Level 2 Manager Authorization & Level 4 Sub Agent Dispatch)

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Problem Statement
1. **Visualizer Canvas Constriction & Dead Space:** In the current dashboard layout, the "Real-Time Spectrum Visualizer" card (`#heroAudioLabStatus`, `bento-span-4 bento-row-span-2`, `min-height: 380px`) contains an internal canvas container (`.visualizer-canvas-container`) locked to a rigid, hardcoded `height: 130px; min-height: 120px;`. This constricts the visualizer canvas to a small fraction of the available card space, leaving an awkward ~120px+ void/empty vertical dead zone inside the card.
2. **Absolute Outer Bounds Hard Lock Constraint:** The user requirement explicitly mandates that the outer container bounds, bento grid column/row spans (`bento-span-4 bento-row-span-2`), outer card padding, borders, and outer min-height (`min-height: 380px`) MUST NOT be increased or altered. The expansion must occur purely from within, allowing inner UI components to stretch organically to fill the chassis.
3. **Broken Internal Flex-Grow Propagation:** While `.visualizer-card-body` has `display: flex; flex-direction: column;`, the intermediate panel (`.visualizer-panel`) and the canvas wrapper (`.visualizer-canvas-container`) lack comprehensive elastic growth rules (`flex: 1 1 auto; height: 100%; min-height: 0;`). Consequently, available vertical space is left abandoned instead of being claimed by the frequency visualizer.
4. **Static Canvas Resolution & Waveform Compression:** In `dashboard.js` and `media_deck_visualizer_feature.js`, `#canvasAudioVisualizer` defaults to fixed baseline dimensions (`width="600" height="120"`). When the canvas container expands from 130px to ~200px-240px, the canvas internal resolution must adapt dynamically so that 32-band FFT bars, oscilloscope waves, radial bursts, and neon flames scale to fill the full vertical amplitude without clipping, distortion, or blurriness.

### 1.2 Architectural Solution
1. **CSS Elastic Flexbox Engine (Zero Outer Mutation):**
   - Refactor `.visualizer-card-body`, `.visualizer-panel`, and `.visualizer-canvas-container` to form a continuous, unbroken flexbox column pipeline.
   - Eliminate hardcoded `height: 130px` on `.visualizer-canvas-container`, replacing it with `flex: 1 1 auto; height: 100%; min-height: 180px;`.
   - Maintain 100% invariant protection over `#heroAudioLabStatus` outer dimensions, ensuring zero displacement of sibling cards (`#heroAudioEqCard`, `#subPlayerIdle`, `#paneMedia`).
2. **Dynamic Canvas Resolution & Adaptive Render Loop:**
   - Update `initAudioVisualizer` and `updateVisualizerCanvasResolution` in `dashboard/dashboard.js` and `src/dashboard/features/media_deck_visualizer_feature.js` to dynamically calculate container height and set canvas resolution accordingly (e.g. 600x220 in compact mode).
   - Calibrate the rendering engine across all 6 visualizer modes (`bars`, `wave`, `radial`, `matrix_dots`, `flame`, `stereo_mirror`) so bar heights and waveforms utilize the expanded canvas height dynamically (`canvas.height * 0.88`).
3. **Ergonomic VU Level Meters Docking:**
   - Position `.vu-meters-container` snugly at the bottom of the card with `flex-shrink: 0; margin-top: auto;` and streamlined padding (`6px 12px`), maintaining crystal-clear -∞dB to 0dB visual telemetry without encroaching on canvas real estate.
4. **Comprehensive Automated Verification:**
   - Deploy automated test suite `tests/test_visualizer_inner_content_expansion.js` certifying zero outer bound mutations, verified flex-grow rules, dynamic canvas dimension updates, light/dark mode parity, and full passage across all repository test suites (Exit Code 0).

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Name | Assigned Agent | Target Files | Status | QA Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | CSS Flexbox Expansion Engine & DOM Alignment | Level 4 Frontend Engineer | `dashboard/dashboard.html`, `dashboard/styles/media.css`, `dashboard/dashboard.css` | `READY_FOR_EXECUTION` | Pending Phase Gate |
| **Phase 2** | Dynamic Canvas Resolution & 60 FPS Render Scaling Engine | Level 4 Fullstack Engineer | `src/dashboard/features/media_deck_visualizer_feature.js`, `dashboard/dashboard.js` | `PAUSED` | Pending Phase 1 Gate |
| **Phase 3** | Automated Regression Test Battery & Full Suite Verification | Level 4 QA Verification Engineer | `tests/test_visualizer_inner_content_expansion.js`, `run_all_tests.js` | `PAUSED` | Grade A+ Certification |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `dashboard/styles/media.css` & `dashboard/dashboard.css` | `.visualizer-canvas-container` has hardcoded `height: 130px; min-height: 120px;`, trapping the canvas in a small box and leaving dead space | Replace static height with `flex: 1 1 auto; height: 100%; min-height: 180px;` and ensure parent containers have `flex: 1; min-height: 0;` | Canvas container seamlessly stretches to fill available card vertical space | Phase 1 | Computed CSS properties checks |
| **2** | `dashboard/dashboard.html` & CSS | `#heroAudioLabStatus` lacks explicit height stretch propagation to `.visualizer-card-body` and `.visualizer-panel` | Ensure `.visualizer-card-body` and `.visualizer-panel` are styled with `flex: 1 1 auto; height: 100%;` and `justify-content: space-between;` | Visualizer controls, canvas, and VU meters occupy balanced vertical proportions | Phase 1 | HTML DOM structure assertions |
| **3** | `src/dashboard/features/media_deck_visualizer_feature.js` | Canvas rendering functions assume baseline 120px height, causing visualizer elements to draw small | Make drawing loops dynamically compute scaling factors from `canvas.height` and `canvas.width` | All 6 visualizer modes render with rich, full-height spectral fidelity | Phase 2 | Canvas rendering unit tests |
| **4** | `dashboard/dashboard.js` | `updateVisualizerCanvasResolution` only resizes canvas in fullscreen/theater mode, leaving compact mode locked to 600x120 | Update resolution updater to sample container rect in compact mode and set dynamic baseline height (e.g. 600x220) | High-DPI crisp rendering across compact, full-window, and fullscreen modes | Phase 2 | Resolution updater tests |
| **5** | `tests/test_visualizer_inner_content_expansion.js` | No automated test exists to verify inner content expansion and outer container immutability | Create dedicated test suite asserting CSS rules, DOM hierarchy, canvas scaling, and zero outer mutations | Prevents layout regressions across all 57+ test suites | Phase 3 | `node tests/test_visualizer_inner_content_expansion.js` |
"""

# ---------------------------------------------------------------------------
# 2. SUMMARY.md
# ---------------------------------------------------------------------------
summary_content = """# Executive Architecture Summary
# Initiative: Visualizer Inner UI Content Expansion
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Governance & Specification Reference:**
> - **Lead Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Architecture Recommendation:** [`architecture_recommendation.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/architecture_recommendation.md)
> - **Prompt Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)

---

## 🏛️ 1. High-Level Initiative Scope & Technical Objectives

The objective of this initiative is to expand the inner UI content of the **Real-Time Spectrum Visualizer** (`#heroAudioLabStatus`) within the Sentinel Web Activity & Media Tracker dashboard so that it fills the outer container organically, eliminating awkward dead space and maximizing visual telemetry impact while **strictly preserving outer container bounds and height**.

### Key Technical Objectives:
1. **Internal Content Expansion:** Maximize the vertical footprint of the frequency canvas and visualizer components from ~130px to ~200px-240px (a >53% visual expansion).
2. **Strict Outer Invariance:** The outer card bounds (`bento-span-4 bento-row-span-2`, `min-height: 380px`, padding, outer borders, margin) MUST NOT be modified or increased. Bento grid harmony is preserved 100%.
3. **Elastic Flexbox Architecture:** Implement an unbroken CSS flexbox pipeline (`flex: 1 1 auto; height: 100%; min-height: 0;`) across `.visualizer-card-body`, `.visualizer-panel`, and `.visualizer-canvas-container`.
4. **Dynamic Canvas Resolution & Scale:** Upgrade canvas resolution management and the 60 FPS rendering pipeline in `dashboard.js` and `media_deck_visualizer_feature.js` to dynamically calculate aspect ratio and vertical amplitudes.
5. **Zero-Regression Assurance:** Guarantee 100% test pass rate across all existing visualizer, fullscreen, layout, and regression test batteries.

---

## 🗺️ 2. Cross-Phase Milestone Roadmap & Dependency Topology

```mermaid
flowchart LR
    P1["Phase 1: CSS Flex Expansion & DOM Alignment"] --> P2["Phase 2: Canvas Resolution & Render Scaling"]
    P2 --> P3["Phase 3: Automated Regression Tests & QA Gate"]
    P3 --> Cert["Grade A+ Signoff & Executive Delivery"]
```

### Dependency Breakdown:
- **Phase 1 (Frontend):** Resolves the styling blockage by removing hardcoded `height: 130px` and establishing elastic flex rules. Unlocks Phase 2.
- **Phase 2 (Fullstack):** Leverages the expanded container geometry from Phase 1 to calibrate dynamic canvas sizing and rendering loops. Unlocks Phase 3.
- **Phase 3 (QA):** Validates both structural CSS, canvas rendering math, and end-to-end dashboard integrity, certifying Exit Code 0.

---

## ⚖️ 3. Risk Mitigation & Architectural Tradeoff Analysis

| Decision / Tradeoff | Selected Approach | Alternative Rejected | Architectural Rationale |
| :--- | :--- | :--- | :--- |
| **Container Sizing Model** | Elastic Flexbox Growth (`flex: 1 1 auto; height: 100%`) | Increasing card `min-height` to 480px | Increasing outer height would break bento grid row alignment with sibling cards and violates strict user constraint. Elastic flex growth fills whatever container height is available. |
| **Canvas Dimensionality** | Dynamic native pixel scaling (`canvas.width`, `canvas.height`) | CSS bitmap stretching (`width: 100%; height: 100%`) | Pure CSS bitmap scaling causes severe pixelation, blurry text, and jagged spectrum bars. Updating internal canvas resolution preserves razor-sharp 60 FPS rendering. |
| **VU Meter Placement** | Pinned to card bottom via `margin-top: auto; flex-shrink: 0;` | Overlaid on top of canvas | Overlaying VU meters obscures lower spectrum frequencies; bottom docking gives clean, professional audiophile studio deck aesthetics. |

---

## 🛡️ 4. Execution Strategy Recommendation

- **Recommended Strategy:** **Strategy A: Fully Autonomous Phase-wise Execution**
- **Autonomy Score:** **1.0** (Deterministic scope, zero ambiguity, clear acceptance gates).
- **Execution Workflow:** Level 2 Manager issues `AUTH-MGR-*` tokens and dispatches Phases 1 through 3 sequentially to dedicated Level 4 Sub Agents.
"""

# ---------------------------------------------------------------------------
# 3. PRD.md
# ---------------------------------------------------------------------------
prd_content = """# Product Requirements Document (PRD)
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
"""

# ---------------------------------------------------------------------------
# 4. TRD.md
# ---------------------------------------------------------------------------
trd_content = """# Technical Requirements Document (TRD)
# Feature: Visualizer Inner UI Content Expansion
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Governance & Specification Reference:**
> - **Lead Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Department:** Dept 04 System Architecture & Dept 05 Frontend Engineering
> - **Target Codebase:** `c:\\Users\\Atul Verma\\Desktop\\Win App Tracker\\Browser Detection`

---

## 🏗️ 1. High-Level Design (HLD) & DOM Topology

The Real-Time Spectrum Visualizer card is structured in `dashboard/dashboard.html` as follows:

```html
<div id="heroAudioLabStatus" class="audio-lab-widget glass-card bento-card liquid-glass-card bento-span-4 bento-row-span-2 visualizer-hero-card">
  <!-- Card Header (~42px flex-shrink: 0) -->
  <div class="audio-lab-header visualizer-card-header">
    <div class="audio-lab-title-group visualizer-title-group">
      <span class="audio-lab-icon visualizer-icon">🎛️</span>
      <h3 id="txtVisualizerTitle" class="visualizer-title" data-i18n="visualizer_title">Real-Time Spectrum Visualizer</h3>
    </div>
  </div>

  <!-- Card Body (flex: 1 1 auto; height: 100%; min-height: 0;) -->
  <div class="audio-lab-body visualizer-card-body">
    <!-- Visualizer Panel (flex: 1 1 auto; display: flex; flex-direction: column;) -->
    <div id="visualizerPanel" class="visualizer-panel">
      
      <!-- 1. Top Controls Bar (~36px flex-shrink: 0) -->
      <div class="visualizer-controls visualizer-controls-bar">
        ... (Effect select & Action buttons) ...
      </div>

      <!-- 2. Canvas Container (EXPANDED: flex: 1 1 auto; height: 100%; min-height: 180px;) -->
      <div class="visualizer-canvas-container">
        <canvas id="canvasAudioVisualizer" width="600" height="220" role="img" aria-label="Audio frequency visualizer"></canvas>
      </div>

      <!-- 3. Bottom VU Meters (~46px flex-shrink: 0; margin-top: auto;) -->
      <div class="vu-meters-container" role="region" aria-label="Audio Level Meters">
        ... (Stereo L/R bars & 0dB headroom badge) ...
      </div>

    </div>
  </div>
</div>
```

---

## 📐 2. Low-Level Design (LLD) & CSS Flexbox Engine

### 2.1 Vertical Geometry Budget
Outer card minimum height: **380px**  
Padding: **20px top + 20px bottom = 40px**  
Available content height: **340px**

| Component | Current Height | Proposed Expanded Height | Flex Property |
| :--- | :--- | :--- | :--- |
| Header (`.visualizer-card-header`) | 42px | 42px | `flex-shrink: 0;` |
| Gap between header & body | 8px | 8px | - |
| Controls Bar (`.visualizer-controls-bar`) | 36px | 36px | `flex-shrink: 0;` |
| **Canvas Container (`.visualizer-canvas-container`)** | **130px (Static)** | **~200px - 220px (Dynamic)** | **`flex: 1 1 auto; min-height: 180px;`** |
| VU Meters (`.vu-meters-container`) | 46px | 46px | `flex-shrink: 0; margin-top: auto;` |
| Inter-element gaps | 2 x 8px = 16px | 2 x 8px = 16px | - |
| **Total Height Utilized** | **~278px (Leaving 62px+ dead space)** | **~340px (100% efficient utilization)** | **Zero Dead Space** |

### 2.2 CSS Rules Specification (`media.css` and `dashboard.css`)
```css
/* Visualizer Card Body Elastic Stretch */
.visualizer-card-body,
#heroAudioLabStatus .visualizer-card-body {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
  height: 100% !important;
  min-height: 0 !important;
  padding-top: 0.5rem;
  gap: 8px;
}

/* Visualizer Panel Flex Elastic Pipeline */
.visualizer-panel,
.visualizer-hero-card .visualizer-panel,
#heroAudioLabStatus .visualizer-panel {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
  height: 100% !important;
  min-height: 0 !important;
  margin-top: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  gap: 8px;
}

/* Expanded Visualizer Canvas Chassis */
.visualizer-canvas-container,
#heroAudioLabStatus .visualizer-canvas-container {
  width: 100% !important;
  flex: 1 1 auto !important;
  height: 100% !important;
  min-height: 180px !important;
  background: var(--viz-canvas-bg, rgba(10, 15, 28, 0.85));
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--viz-canvas-border, rgba(99, 102, 241, 0.2));
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 16px rgba(99, 102, 241, 0.08);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Canvas Element Stretch */
#canvasAudioVisualizer {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
}

/* Snug VU Level Meters Docking */
.vu-meters-container,
#heroAudioLabStatus .vu-meters-container {
  flex-shrink: 0 !important;
  margin-top: auto !important;
  padding: 6px 12px !important;
  gap: 4px !important;
}
```

---

## 🎨 3. Dynamic Canvas Resolution & Render Math

### 3.1 Adaptive Baseline Sizing in `dashboard.js` & `media_deck_visualizer_feature.js`
In `updateVisualizerCanvasResolution()`:
```javascript
function updateVisualizerCanvasResolution() {
  if (typeof document === 'undefined') return;
  const canvas = document.getElementById('canvasAudioVisualizer');
  if (!canvas) return;

  const isFullscreen = isVisualizerFullscreenActive() || isVisualizerFullWindowActive();
  const container = canvas.parentElement;
  const rect = (container && typeof container.getBoundingClientRect === 'function') 
    ? container.getBoundingClientRect() 
    : null;

  if (isFullscreen) {
    if (rect && rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
    } else {
      canvas.width = 1400;
      canvas.height = 600;
    }
  } else {
    // Compact (Normal) Mode: Dynamically sample container height
    if (rect && rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width);
      canvas.height = Math.max(180, Math.round(rect.height));
    } else {
      canvas.width = 600;
      canvas.height = 220; // Expanded baseline from legacy 120
    }
  }
}
```

### 3.2 Visualizer Modes Scale Equations
- **32-Band Spectrum Bars:**
  `const barHeight = (dataArray[i] / 255) * (canvas.height * 0.88);`
  `const y = canvas.height - barHeight;`
- **Oscilloscope Waveform:**
  `const v = dataArray[i] / 128.0;`
  `const y = (v * canvas.height) / 2;`
- **Radial Burst:**
  `const maxRadius = Math.min(canvas.width, canvas.height) * 0.44;`
- **Flame Peaks:**
  `const flameH = (dataArray[i] / 255) * (canvas.height * 0.92);`
"""

# ---------------------------------------------------------------------------
# 5. DESIGN.md
# ---------------------------------------------------------------------------
design_content = """# Design System & UI Tokens
# Feature: Visualizer Inner UI Content Expansion
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Governance & Specification Reference:**
> - **Lead Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Department:** Dept 05 Frontend Engineering & UI/UX Design
> - **Design Paradigm:** iOS 26 Liquid Glass & Audiophile Studio Deck

---

## 💎 1. Visual Hierarchy & Proportional Spacing

The Real-Time Spectrum Visualizer bento card follows the **60-30-10 Information Hierarchy Rule**:
- **60% Primary Focus:** The active 60 FPS audio visualizer canvas displaying real-time frequency FFT bars or waveforms.
- **30% Secondary Controls & Telemetry:** Top controls bar (mode selector, action buttons) and bottom stereo VU meters.
- **10% Tertiary Metadata:** Header iconography, card title badge, and clipping indicator.

---

## 🎨 2. Specular Design Tokens & Materials

### 2.1 Chassis Materials
```css
:root {
  /* Obsidian Matte Canvas Background */
  --viz-canvas-bg: rgba(10, 15, 28, 0.85);
  --viz-canvas-border: rgba(99, 102, 241, 0.2);
  --viz-canvas-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 16px rgba(99, 102, 241, 0.08);

  /* Light Theme Canvas Tokens */
  --viz-canvas-bg-light: #0f172a;
  --viz-canvas-border-light: rgba(99, 102, 241, 0.25);
  --viz-canvas-shadow-light: inset 0 2px 8px rgba(0, 0, 0, 0.5);

  /* Visualizer Controls Bar Capsule */
  --viz-controls-bg: rgba(15, 23, 42, 0.65);
  --viz-controls-border: rgba(255, 255, 255, 0.1);
  --viz-controls-blur: blur(12px) saturate(160%);

  /* VU Meters Track & Gradients */
  --vu-track-bg: rgba(15, 23, 42, 0.8);
  --vu-track-border: rgba(255, 255, 255, 0.06);
  --vu-gradient-safe: linear-gradient(90deg, #10b981 0%, #06b6d4 60%, #eab308 85%, #ef4444 100%);
}
```

---

## 📐 3. Proportional Layout Blueprint

```
┌─────────────────────────────────────────────────────────────┐
│ 🎛️ Real-Time Spectrum Visualizer                         │ <- Header: ~42px
├─────────────────────────────────────────────────────────────┤
│ [ Effect: 32-Band Spectrum ▾ ]            [ 📺 ] [ 🗖 ] [ ⛶ ]│ <- Controls Bar: ~36px
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  ||| | | |||| | |||||| ||||||||||||||||||||| | ||| ||   │ │ <- Canvas Chassis
│ │  ||| | | |||| | |||||| ||||||||||||||||||||| | ||| ||   │ │    Expanded: ~200px-220px
│ │  |||||||||||||||||||||||||||||||||||||||||||||||||||    │ │    (flex: 1 1 auto)
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  L [=======================               ] -6dB            │ <- VU Meters: ~46px
│  R [====================                  ] -8dB    [0dB OK]│    (flex-shrink: 0)
└─────────────────────────────────────────────────────────────┘
  Total Outer Bounds: Exactly 380px min-height (100% Preserved)
```
"""

# ---------------------------------------------------------------------------
# 6. phase_01_css_flex_expansion_and_dom_hierarchy.md
# ---------------------------------------------------------------------------
phase1_content = """# Phase 1 Execution Prompt: CSS Flexbox Expansion Engine & DOM Alignment
# Task: Visualizer Inner UI Content Expansion
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Execution Directive for Level 4 Frontend Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 05 Frontend Engineering & UI/UX Design.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
> - **Security Standard:** 100% W3C Trusted Types Compliant (Zero innerHTML).

---

## 🎯 1. Phase Objective

Refactor the internal CSS flexbox layout and DOM classes of the **Real-Time Spectrum Visualizer** in `dashboard/dashboard.html`, `dashboard/styles/media.css`, and `dashboard/dashboard.css`:
1. Expand the inner UI content to fill the outer container vertically without leaving dead space.
2. **STRICT INVARIANT:** DO NOT modify outer container bounds, bento grid spans (`bento-span-4 bento-row-span-2`), outer card padding, borders, or `min-height: 380px`.
3. Eliminate the hardcoded `height: 130px; min-height: 120px;` from `.visualizer-canvas-container`, replacing it with elastic flex-grow (`flex: 1 1 auto; height: 100%; min-height: 180px;`).
4. Ensure `.visualizer-card-body` and `.visualizer-panel` have `flex: 1 1 auto; height: 100%; min-height: 0;` and unbroken vertical flex distribution.
5. Provide matching dark and light mode (`body.theme-light`) CSS token coverage.

---

## 📂 2. Target Files & Anchors

- **HTML Document:** [`dashboard/dashboard.html`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.html#L737-L815)
- **Primary Media Stylesheet:** [`dashboard/styles/media.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/styles/media.css#L1010-L1150)
- **Consolidated Stylesheet:** [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css#L3605-L3660) & [`dashboard/dashboard.css`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.css#L5920-L6400)

---

## 🛠️ 3. Step-by-Step Implementation Instructions

### Step 1.1: Verify DOM Class Anchor in `dashboard/dashboard.html`
In line 738 of `dashboard/dashboard.html`:
Ensure the card element contains the `visualizer-hero-card` class alongside existing bento classes:
```html
<div id="heroAudioLabStatus" class="audio-lab-widget glass-card bento-card liquid-glass-card bento-span-4 bento-row-span-2 visualizer-hero-card">
```
Verify that `visualizer-card-header`, `visualizer-card-body`, `visualizer-panel`, `visualizer-controls-bar`, `visualizer-canvas-container`, and `vu-meters-container` maintain clean semantic nesting.

### Step 1.2: Refactor CSS in `dashboard/styles/media.css`
Update the visualizer container rules:
1. **`.visualizer-card-body`**:
   ```css
   .visualizer-card-body,
   #heroAudioLabStatus .visualizer-card-body {
     display: flex !important;
     flex-direction: column !important;
     flex: 1 1 auto !important;
     height: 100% !important;
     min-height: 0 !important;
     justify-content: space-between !important;
     gap: 8px !important;
     padding-top: 0.5rem;
   }
   ```
2. **`.visualizer-panel`**:
   ```css
   .visualizer-hero-card .visualizer-panel,
   #heroAudioLabStatus .visualizer-panel {
     background: transparent !important;
     border: none !important;
     padding: 0 !important;
     margin-top: 0 !important;
     flex: 1 1 auto !important;
     display: flex !important;
     flex-direction: column !important;
     justify-content: space-between !important;
     height: 100% !important;
     min-height: 0 !important;
     gap: 8px !important;
   }
   ```
3. **`.visualizer-canvas-container`**:
   ```css
   .visualizer-canvas-container,
   #heroAudioLabStatus .visualizer-canvas-container {
     width: 100% !important;
     flex: 1 1 auto !important;
     height: 100% !important;
     min-height: 180px !important;
     background: var(--viz-canvas-bg, rgba(10, 15, 28, 0.85));
     border-radius: 10px;
     overflow: hidden;
     border: 1px solid var(--viz-canvas-border, rgba(99, 102, 241, 0.2));
     box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 16px rgba(99, 102, 241, 0.08);
     position: relative;
     display: flex;
     align-items: center;
     justify-content: center;
   }
   ```
4. **`.vu-meters-container`**:
   ```css
   .vu-meters-container,
   #heroAudioLabStatus .vu-meters-container {
     flex-shrink: 0 !important;
     margin-top: auto !important;
     padding: 6px 12px !important;
     gap: 4px !important;
   }
   ```

### Step 1.3: Synchronize `dashboard/dashboard.css`
Mirror the exact changes in `dashboard/dashboard.css` (or run `node scripts/build_css_modules.js` if configured).

---

## 🚦 4. Verification Gate

Execute verification check:
```powershell
node tests/test_visualizer_toolbar_buttons_fix.js
node tests/test_visualizer_compact_fullscreen_embed.js
```
Must pass with exit code 0.
"""

# ---------------------------------------------------------------------------
# 7. phase_02_canvas_dynamic_resolution_and_render_scaling.md
# ---------------------------------------------------------------------------
phase2_content = """# Phase 2 Execution Prompt: Dynamic Canvas Resolution & 60 FPS Render Scaling Engine
# Task: Visualizer Inner UI Content Expansion
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Execution Directive for Level 4 Fullstack Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 05 Frontend Engineering & Dept 04 System Architecture.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
> - **Security Standard:** 100% W3C Trusted Types Compliant (Zero innerHTML).

---

## 🎯 1. Phase Objective

Upgrade the canvas initialization, dynamic resolution calculations, and rendering loop in `dashboard/dashboard.js` and `src/dashboard/features/media_deck_visualizer_feature.js`:
1. Ensure `initAudioVisualizer` sets the expanded baseline height (`canvas.height = 220` instead of legacy 120).
2. Update `updateVisualizerCanvasResolution` so compact mode dynamically queries `canvas.parentElement.getBoundingClientRect()` and sets canvas resolution proportionally.
3. Adapt the render loop for all 6 visualization effects (`bars`, `wave`, `radial`, `matrix_dots`, `flame`, `stereo_mirror`) so they dynamically scale vertically with `canvas.height`.
4. Ensure zero clipping, zero blurriness, and 60 FPS rendering performance.

---

## 📂 2. Target Files & Anchors

- **Dashboard Script:** [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L2320-L2450) & [`dashboard/dashboard.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/dashboard/dashboard.js#L2530-L2570)
- **Feature Module:** [`src/dashboard/features/media_deck_visualizer_feature.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/src/dashboard/features/media_deck_visualizer_feature.js#L200-L350)

---

## 🛠️ 3. Step-by-Step Implementation Instructions

### Step 2.1: Update Canvas Baseline Resolution in `initAudioVisualizer`
In `dashboard/dashboard.js` and `media_deck_visualizer_feature.js`:
```javascript
function initAudioVisualizer(canvasEl, options = {}) {
  const canvas = canvasEl || (typeof document !== 'undefined' ? document.getElementById('canvasAudioVisualizer') : null);
  if (canvas) {
    if (!canvas.width) canvas.width = 600;
    if (!canvas.height || canvas.height <= 120) canvas.height = 220; // Expanded baseline
  }
  ...
}
```

### Step 2.2: Upgrade `updateVisualizerCanvasResolution`
Make compact mode sample container geometry:
```javascript
function updateVisualizerCanvasResolution() {
  if (typeof document === 'undefined') return;
  const canvas = document.getElementById('canvasAudioVisualizer');
  if (!canvas) return;

  const isFullscreen = isVisualizerFullscreenActive() || isVisualizerFullWindowActive();
  const container = canvas.parentElement;
  const rect = (container && typeof container.getBoundingClientRect === 'function') ? container.getBoundingClientRect() : null;

  if (isFullscreen) {
    if (rect && rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
    } else {
      canvas.width = 1400;
      canvas.height = 600;
    }
  } else {
    // Compact Mode: Auto-adapt to expanded container height
    if (rect && rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width);
      canvas.height = Math.max(180, Math.round(rect.height));
    } else {
      canvas.width = 600;
      canvas.height = 220;
    }
  }
}
```

### Step 2.3: Calibrate Vertical Draw Loop Scaling
Verify that bar and waveform heights scale dynamically using `canvas.height` so that graphics occupy the full height smoothly:
```javascript
// Spectrum Bars
const barHeight = (dataArray[i] / 255) * (canvas.height * 0.88);
const y = canvas.height - barHeight;

// Oscilloscope Wave
const y = (slice * canvas.height) / 2;
```

---

## 🚦 4. Verification Gate

Execute verification check:
```powershell
node tests/test_visualizer_compact_fullscreen_embed.js
node tests/test_visualizer_radial_scaling.js
```
Must pass with exit code 0.
"""

# ---------------------------------------------------------------------------
# 8. phase_03_automated_regression_test_and_qa_verification.md
# ---------------------------------------------------------------------------
phase3_content = """# Phase 3 Execution Prompt: Automated Regression Test Battery & Full Suite Verification
# Task: Visualizer Inner UI Content Expansion
# Task ID: TASK-VIZ-INNER-EXPAND-001

> **Execution Directive for Level 4 QA Verification Engineer:**
> - **Mandatory Anchor:** Load and adhere to `dynamic_departments_matrix.md` and `memory.md` before executing instructions.
> - **Authorization Token Required:** `AUTH-MGR-*` issued by Level 2 Manager.
> - **Lead Department:** Dept 08 QA & Testing Governance.
> - **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
> - **Zero-Skip Gate:** Pass 100% test suites with raw exit code 0.

---

## 🎯 1. Phase Objective

Author and execute a dedicated automated test suite `tests/test_visualizer_inner_content_expansion.js` and verify zero regressions across all 57+ repository suites:
1. **Test 1: UTF-8 with BOM Standard Audit** on all touched files.
2. **Test 2: Outer Bounds Hard Lock Invariant** (verifying `#heroAudioLabStatus` retains `bento-span-4 bento-row-span-2` and outer `min-height: 380px` is not inflated).
3. **Test 3: Inner Flexbox Expansion Engine** (verifying `.visualizer-card-body`, `.visualizer-panel`, and `.visualizer-canvas-container` possess `flex: 1 1 auto; height: 100%;` and hardcoded `height: 130px` is eliminated).
4. **Test 4: Dynamic Canvas Resolution & Baseline Scaling** (verifying `initAudioVisualizer` baseline height >= 180 and `updateVisualizerCanvasResolution` handles dynamic rect).
5. **Test 5: Theme & WCAG Contrast Parity** (`body.theme-light` rules present and valid).
6. **Test 6: AST Syntax & VM Parsing** (zero syntax errors in scripts).
7. **Test 7: Full Repository Suite Verification** via `node run_all_tests.js`.

---

## 📂 2. Target Files & Anchors

- **New Test Suite:** [`tests/test_visualizer_inner_content_expansion.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/tests/test_visualizer_inner_content_expansion.js)
- **Master Test Runner:** [`run_all_tests.js`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/run_all_tests.js)

---

## 🛠️ 3. Execution Commands

```powershell
# 1. Run the dedicated expansion verification suite
node tests/test_visualizer_inner_content_expansion.js

# 2. Run existing visualizer test suites to confirm zero regression
node tests/test_visualizer_toolbar_buttons_fix.js
node tests/test_visualizer_compact_fullscreen_embed.js
node tests/test_equalizer_layout_separation_phase1_2.js

# 3. Run all repository test suites
node run_all_tests.js
```

---

## 🏆 4. Grade A+ Signoff Criteria

- Zero failures across all suites.
- Exit code 0 returned on all commands.
- Pre-push gitleaks security audit clean (0 leaks detected).
"""

# ---------------------------------------------------------------------------
# WRITE ALL 8 FILES
# ---------------------------------------------------------------------------
print(f"Generating ephemeral prompt files in {task_dir}...")

write_bom_file("INDEX.md", index_content)
write_bom_file("SUMMARY.md", summary_content)
write_bom_file("PRD.md", prd_content)
write_bom_file("TRD.md", trd_content)
write_bom_file("DESIGN.md", design_content)
write_bom_file("phase_01_css_flex_expansion_and_dom_hierarchy.md", phase1_content)
write_bom_file("phase_02_canvas_dynamic_resolution_and_render_scaling.md", phase2_content)
write_bom_file("phase_03_automated_regression_test_and_qa_verification.md", phase3_content)

print("All 8 ephemeral prompt specification files successfully generated with UTF-8 BOM!")
