# Architectural Summary: 5-Band Equalizer & Audio Lab Layout Separation

> **Workspace:** 	emp_prompt/equalizer_layout_separation/  
> **Task ID:** TASK-EQ-LAYOUT-SEPARATION-001  
> **Author:** Level 3C Phase-wise Prompt Generation Specialist  
> **Date:** 2026-11-17  

---

## 1. Initiative Scope & Objectives
The goal of this initiative is to decongest and refine the layout of the audio controls in Tab B (Media Analytics) of dashboard/dashboard.html. Currently, the 5-Band Graphic Equalizer and the Audio Lab controls (Master Volume Boost and three enhancement toggles: Vocal Clarity, Night Shield, Audio-Only Mode) are vertically stacked within a single container.

This refactoring separates the 5-Band Graphic Equalizer into a dedicated **LEFT** section, and groups all remaining controls (Master Volume Boost slider, Vocal Clarity, Night Shield, Audio-Only Mode, Audio Lab badges/status) into a dedicated **RIGHT** section.

## 2. Key Architecture Decisions
1. **Container Hierarchy:**
   - Keep the outer #heroAudioEqCard with its standard classes (udio-eq-widget glass-card bento-card liquid-glass-card bento-span-12) to preserve Bento grid layout and automated test assertions.
   - Introduce an internal split grid/flex layout:
     - Left Section (.eq-deck-left-col / .eq-pane-left): Hosts Equalizer Title, Specs, Preset Dropdown, Reset Button, and the 5 vertical frequency sliders (60Hz, 250Hz, 1kHz, 4kHz, 16kHz).
     - Right Section (.eq-deck-right-col / .audio-lab-pane-right): Hosts Audio Lab Title, Telemetry Status, Badges, Master Volume Boost Slider with readout/scale marks, and the three audio enhancement switch cards.
2. **Responsive Design:**
   - On Desktop screens (> 1024px): 2-column side-by-side grid (grid-template-columns: 1.1fr 1fr; or 1fr 1fr; with 20px gap).
   - On Tablet/Mobile screens (<= 1024px): Responsive single-column flow (grid-template-columns: 1fr; with 16px gap).
3. **Zero Backend Changes & Pure Frontend Scope:**
   - Strictly no edits to ackground.js, 
ative_host/, or WebSocket servers.
   - Strictly 0 .innerHTML or inline event handlers to preserve W3C Trusted Types and Chrome MV3 CSP compliance.

## 3. Phase Roadmap
- **Phase 1:** DOM Structure Refactoring (HTML left/right separation, preserve all 18 IDs and bilingual i18n tags).
- **Phase 2:** CSS Liquid Glass 2.0 & Layout Styling Polish (Split grid, dark/light theme tokens, WCAG AA contrast).
- **Phase 3:** Independent QA Verification & Parity (All 48 test suites pass cleanly, zero gitleaks).