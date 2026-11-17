# Phase-wise Execution Tracking Board & Problem-Solution Dossier
# Task: Multi-Tab Live Media Deck UI Refactor & Two-Way Solo Tab Toggle
# Task ID: TASK-MEDIA-DECK-UI-SOLO-TOGGLE-001

> **Governance & Specification Reference:**
> - **Lead Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **Architecture Recommendation:** [`architecture_recommendation.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/architecture_recommendation.md)
> - **Prompt Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)
> - **Department Rules:** `dynamic_departments_matrix.md` (Dept 01 Product Requirements, Dept 05 Frontend Engineering, Dept 08 QA & Testing)

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Problem Statement
1. **Cramped Volume Slider:** The current `.deck-volume-slider` is constrained inside the bottom `.deck-card-controls` row with a fixed width of `55px`. This creates visual clutter alongside 4 buttons and provides poor volume resolution for users on high-DPI displays.
2. **Uneven Controls Layout:** Because the volume slider was jammed between `.btn-deck-mute` and `.btn-deck-solo`, the action buttons (`▶/⏸️`, `🔊/🔇`, `🎧 Solo Tab`, `🎯 Switch Tab`) had uneven spacing and did not utilize card width effectively.
3. **One-Way Solo Tab Trap:** Clicking `btnSolo` (`🎧 Solo Tab`) mutes all other open media streams and sets `currentSoloTabId`, but clicking the button again on the active solo tab fails to toggle off solo mode. Users had to manually unmute each tab individually.

### 1.2 Architectural Solution
1. **Dedicated Full-Width Volume Row:** Extract `.deck-volume-slider` into its own dedicated row (`.deck-volume-row`) positioned directly beneath the timeline scrubber row (`.deck-scrubber-row`) and above `.deck-card-controls`. The volume slider spans 100% width with a responsive track and emerald accent.
2. **Controls Row Auto-Fit:** The bottom controls row (`.deck-card-controls`) now contains exactly 4 buttons: Play/Pause, Mute/Unmute, Solo Tab, and Switch Tab. All buttons auto-fit and evenly distribute across the card width using flexbox (`flex: 1 1 0;`).
3. **Two-Way Solo Tab Toggle:** Enhance `handleSoloTab` in `src/dashboard/features/media_deck_visualizer_feature.js` and `background.js` so clicking `btnSolo` when already active toggles off solo mode: resets `currentSoloTabId = null`, unmutes all media tabs, clears `.solo-active` badge, and sends `MEDIA_STREAM_SOLO_CLEAR` / `soloTabId: null` to the background service worker.

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Name | Assigned Agent | Target Files | Status | QA Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Dedicated Full-Width Volume Row & Controls Auto-fit CSS/DOM | Level 4 Frontend Engineer | `src/dashboard/features/media_deck_visualizer_feature.js`, `dashboard/styles/media.css` | `PENDING` | Pending Phase 1 Gate |
| **Phase 2** | Solo Tab Two-Way Toggle Logic in Feature & Background | Level 4 Fullstack Engineer | `src/dashboard/features/media_deck_visualizer_feature.js`, `background.js` | `PENDING` | Pending Phase 2 Gate |
| **Phase 3** | Automated Unit/Integration Tests & Regression Suite Gate | Level 4 QA Verification Engineer | `tests/test_media_deck_ui_refactor_and_solo_toggle.js`, `run_all_tests.js` | `PENDING` | Grade A+ Certification |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `src/dashboard/features/media_deck_visualizer_feature.js` | Volume slider embedded inside `controlsRow`, restricting width and cluttering controls | Extract volume slider to dedicated `.deck-volume-row` between `.deck-scrubber-row` and `.deck-card-controls` | Clean visual hierarchy; dedicated full-length volume scrubber row | Phase 1 | DOM node & layout assertions |
| **2** | `dashboard/styles/media.css` | `.deck-volume-slider` hardcoded to `width: 55px`; `.deck-card-controls` lacking auto-fit flex distribution | Add `.deck-volume-row` with 100% width; style `.deck-volume-slider` to `width: 100%`; set button children of `.deck-card-controls` to `flex: 1 1 0` | Seamless 100% volume bar matching scrubber timeline; perfectly aligned 4-button action row | Phase 1 | CSS computed style & visual bounds checks |
| **3** | `src/dashboard/features/media_deck_visualizer_feature.js` | `handleSoloTab` only enforces solo mute; lacks toggle-off condition when `currentSoloTabId === targetId` | Add toggle branch: if `currentSoloTabId === targetId`, reset to `null`, unmute all streams in `cachedStreams`, send `MEDIA_STREAM_SOLO_CLEAR` | Intuitive two-way toggle; users can exit solo mode in 1 click | Phase 2 | Feature toggle unit test |
| **4** | `background.js` | Background IPC only handles `MEDIA_STREAM_SOLO` with valid target ID; does not support clearing solo mode | Add `MEDIA_STREAM_SOLO_CLEAR` handler and handle `!targetId` in solo execution to unmute all open media tabs | Complete state parity between dashboard and browser tabs | Phase 2 | Background IPC mock test |
| **5** | `tests/test_media_deck_ui_refactor_and_solo_toggle.js` | Absence of regression suite for full-width volume bar and two-way solo toggle | Author comprehensive 5-battery test suite and register with `run_all_tests.js` | Guaranteed zero regression across 61 test suites (Exit code 0) | Phase 3 | `node run_all_tests.js` |
