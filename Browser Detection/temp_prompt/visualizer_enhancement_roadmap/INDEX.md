# Visualizer Enhancement Roadmap - Index & Tracking Board

> **Initiative:** Real-Time Spectrum Visualizer UI/UX Ergonomics & Studio DSP Roadmap  
> **Container:** `temp_prompt/visualizer_enhancement_roadmap/`  
> **Lead Architecture:** Level 3C Phase-wise Prompt Generation Specialist  
> **Governance:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Target Widget:** `#heroAudioLabStatus` (`.audio-lab-widget.bento-span-4.bento-row-span-2`)  
> **Encoding Standard:** UTF-8 with BOM (`0xEF, 0xBB, 0xBF`)  
> **Strategy Selected:** Strategy A (Fully Autonomous Phase-wise Execution)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 The Challenge
The **Real-Time Spectrum Visualizer** in the Bento Media Dashboard was experiencing horizontal crowding in its top header controls bar (`.visualizer-controls-bar`). The native dropdown (`#selectVizEffect`), mode labels, and four essential action buttons (Settings Drawer ⚙️, Video Embed/PiP 🎦, Full Window Theater 🪟, Fullscreen ⛶) competed for limited width inside the 4-column Bento grid card, creating cramped touch targets and visual clutter.

### 1.2 The Solution: Developer's Hybrid Layout Directive
A balanced 3-tier vertical ergonomic architecture that achieves zero outer bounding box expansion of `#heroAudioLabStatus`:
1. **Tier 1 (Top Clean Action Bar):** Uncluttered action buttons row housing `#btnVizSettingsToggle`, `#btnVizVideoEmbedToggle`, `#btnVizFullWindow`, `#btnVizFullscreen`, and visually hidden legacy mode buttons (`#btnVizModeBars`, `#btnVizModeWave`). No dropdown or mode switches crowding the top.
2. **Tier 2 (Middle Canvas Chassis):** `#vizCanvasContainer` hosting `#canvasAudioVisualizer` (600x120), hardware-accelerated HUD overlay (`#vizCanvasHud` with live FPS and kHz badges), and sliding micro-settings glass drawer (`#vizSettingsDrawer` with graticule toggle and peak decay buttons).
3. **Tier 3 (Sub-Canvas Lower Deck):** Dedicated horizontal lower deck (`.viz-subcanvas-deck`) cleanly housing the relocated compact glass pill selector (`#vizSelectWrapper` with `#vizPillSelectorWrapper` + hidden native `#selectVizEffect`) alongside high-visibility studio peak-hold stereo VU meters (`#vuMetersContainer`).

---

## 🗂️ 2. Comprehensive Phase Status Checklist

| Phase # | Phase Title | Status | Lead Agent | Deliverables Manifest | QA Test Gate |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **01** | **UI/UX Ergonomics & Hybrid Layout Directive** | `PROMPT_READY` | Level 4 Frontend Engineer | `dashboard/dashboard.html`<br>`dashboard/styles/media.css`<br>`src/dashboard/features/media_deck_visualizer_feature.js`<br>`dashboard/dashboard.js`<br>`tests/test_visualizer_phase_01_ergonomics.js` | `node tests/test_visualizer_phase_01_ergonomics.js`<br>`node tests/test_visualizer_toolbar_buttons_fix.js`<br>`node tests/test_visualizer_compact_fullscreen_embed.js` |
| **02** | **Advanced Audio Features & Interactive Signal Engine** | `DRAFTED` | Level 4 Audio DSP Engineer | `dashboard/dashboard.html`<br>`dashboard/styles/media.css`<br>`src/dashboard/features/media_deck_visualizer_feature.js`<br>`dashboard/dashboard.js`<br>`tests/test_visualizer_phase_02_features.js` | `node tests/test_visualizer_phase_02_features.js` |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `dashboard/dashboard.html` | Top controls bar crowded with dropdown `<select>` and buttons | Implement Developer's Hybrid Layout: Clean top action bar, middle canvas chassis, lower sub-canvas deck with pill selector & VU meters | Zero expansion of widget bounding box; optimal spacing; 100% ID preservation | Phase 1 | `test_visualizer_phase_01_ergonomics.js` |
| **2** | `dashboard/styles/media.css` | Missing layout rules for `.viz-subcanvas-deck` flex alignment | Add `.viz-subcanvas-deck` flex row rules, `.viz-select-wrapper` shrink guard, and light theme tokens | Seamless responsive placement of pill selector alongside stereo VU meters | Phase 1 | `test_visualizer_phase_01_ergonomics.js` |
| **3** | `src/dashboard/features/media_deck_visualizer_feature.js` | VU meters lacked broadcast peak-hold needles and canvas lacked frequency octaves | Integrate `renderCanvasGraticule` with subpixel offsets and 400ms peak-hold exponential decay state machine | Studio-grade visual feedback at 60 FPS; 0 garbage collection allocations | Phase 1 | `test_visualizer_phase_01_ergonomics.js` |
| **4** | `dashboard/dashboard.js` | `viz_settings_toggle_title` tooltip string mismatch in translation dictionary | Update `dashboard.js` tooltip strings to match `Toggle Acoustic Graticule & Telemetry Settings` / Hindi parity | 100% test pass; accessible tooltip for screen readers | Phase 1 | `test_visualizer_phase_01_ergonomics.js` |
| **5** | `dashboard/dashboard.js` | Popover menu and settings drawer needed click-outside and Escape dismiss | Wire idempotent event handlers with `!__vizBound` guards and Escape key routing | Flawless keyboard accessibility (WCAG 2.1 AA) without listener duplication | Phase 1 | `test_visualizer_phase_01_ergonomics.js` |

---

## 🚦 4. Strategy Evaluation & Readiness Certification

- **Recommended Strategy:** **Strategy A (Fully Autonomous Phase-wise Execution)**
- **Autonomy Score:** 1.0 (All architectural and ergonomic decisions clarified via Developer's explicit Hybrid Layout Directive).
- **Prompt Files Assessment:** `PROMPT_FILES_REQUIRED = YES` (Compound multi-phase UI/UX and audio DSP modernization).
- **Artifacts on Disk:**
  - [`phase_01_ui_ux_ergonomics.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/visualizer_enhancement_roadmap/phase_01_ui_ux_ergonomics.md) (Verified & Certified Aligned with Hybrid Layout Directive)
  - [`phase_02_features_functions.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/visualizer_enhancement_roadmap/phase_02_features_functions.md) (Drafted for Phase 2 implementation)
  - [`INDEX.md`](file:///c:/Users/Atul%20Verma/Desktop/Win%20App%20Tracker/Browser%20Detection/temp_prompt/visualizer_enhancement_roadmap/INDEX.md) (Live Tracking Board)
- **Gate Clearance Status:** Phase 1 execution prompt certified and ready for Level 4 Execution Subagent assignment.
