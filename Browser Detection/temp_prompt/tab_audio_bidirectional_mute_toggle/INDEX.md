# Phase-wise Execution Tracking Board & Problem-Solution Dossier
# Task: Bidirectional Toggle Logic for Tab Audio Mute/Unmute Buttons
# Task ID: TASK-BIDIRECTIONAL-MUTE-TOGGLE-001

> **Governance & Specification Reference:**
> - **Lead Specialist:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)
> - **System Architecture:** [`architecture_recommendation.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/architecture_recommendation.md)
> - **Prompt Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)
> - **Active Working Memory:** [`memory.md`](file:///C:/Users/Atul%20Verma/.gemini/memory.md)
> - **Departmental Governance:** `dynamic_departments_matrix.md` (Dept 01 Product Requirements, Dept 05 Frontend Engineering, Dept 06 Backend & API, Dept 08 QA & Testing)

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Problem Statement
1. **One-Way Solo Tab State Revert Defect:** The "Mute all other tab and solo this audio" button (`btnSolo` 🎧) toggles solo off in the frontend, but the backend `handleSoloTabClearExecution` un-mutes ALL tabs indiscriminately without preserving which tabs were originally muted by the user prior to solo mode. Tabs that were purposely muted get erroneously unmuted.
2. **One-Way "Mute All Others" Button:** The "Mute all other tabs" button (`btnMuteAllOthers` in the deck header) mutes non-primary streams on the first click, but lacks bidirectional toggle logic. Clicking it a second time does not restore the muted tabs or revert them to their pre-muted state.
3. **Missing "Mute All" Master Toggle:** The dashboard currently lacks a dedicated master "Mute All" button in `.media-deck-header-actions` that can cleanly mute all active browser media tabs on the 1st click and unmute all tabs on the 2nd click.
4. **Desynchronized Service Worker & GUI State:** Tab audio mute/unmute state changes between the background service worker (`tabMediaMap` / `browserAPI.tabs.update`) and the dashboard UI must be bidirectionally synchronized so that toggle states, active visual indicators, button texts, and ARIA attributes reflect live reality accurately across sessions.

### 1.2 Architectural Solution
1. **Stateful Prior-Mute Snapshots in Background:** Introduce snapshot caching maps (`soloPreviousMuteStates`, `muteOthersPreviousMuteStates`, `muteAllPreviousMuteStates`) in `background.js`. When a solo or mute-all action is triggered, capture each tab's pre-existing mute status. When toggled off, restore each tab to its exact pre-operation state.
2. **Bidirectional "Mute All Others" Toggle:** Upgrade `handleMuteAllOthers` in `src/dashboard/features/media_deck_visualizer_feature.js` and `background.js` with state variable `isMuteAllOthersActive`. Toggle between muting other tabs (1st click) and restoring their prior states (2nd click), accompanied by dynamic button label and active styling.
3. **Bidirectional "Mute All" Action:** Add `btnMuteAll` to `dashboard/dashboard.html` and implement `handleMuteAll` in the feature module and backend. Toggle between muting all tabs (1st click) and unmuting all tabs (2nd click), with dynamic label and active class toggling.
4. **Bidirectional Telemetry & Event Synchronization:** Expose IPC handlers (`MEDIA_STREAM_MUTE_ALL_OTHERS`, `MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR`, `MEDIA_STREAM_MUTE_ALL`, `MEDIA_STREAM_MUTE_ALL_CLEAR`) and emit `LIVE_MEDIA_UPDATE` on every state transition, keeping GUI buttons and service worker state perfectly synchronized.

---

## 🚦 2. Phase Status Checklist

| Phase # | Phase Name | Assigned Agent | Target Files | Status | QA Signoff |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Backend Service Worker State & Bidirectional IPC Architecture | Level 4 Backend Engineer | `background.js` | `PENDING` | Pending Phase 1 Gate |
| **Phase 2** | Frontend Feature Engine Two-Way Toggle Logic & State Management | Level 4 Frontend Engineer | `src/dashboard/features/media_deck_visualizer_feature.js` | `PENDING` | Pending Phase 2 Gate |
| **Phase 3** | Dashboard Shell, HTML Header Actions, i18n, & CSS Styling | Level 4 UI/UX Engineer | `dashboard/dashboard.html`, `dashboard/dashboard.js`, `dashboard/styles/media.css` | `PENDING` | Pending Phase 3 Gate |
| **Phase 4** | Automated Verification Suite & Comprehensive Regression Gates | Level 4 QA Verification Engineer | `tests/test_media_deck_bidirectional_mute_toggles.js`, `run_all_tests.js` | `PENDING` | Grade A+ Certification |

---

## 🔍 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `background.js` | `handleSoloTabClearExecution` un-mutes all tabs indiscriminately, losing pre-existing user mute states | Add `soloPreviousMuteStates` map; snapshot states before solo, and restore exact states on clear | Pre-existing muted tabs remain muted when exiting solo mode | Phase 1 | VM unit test for snapshot & restoration |
| **2** | `background.js` | Lacks dedicated backend handlers and IPC routing for "Mute All Others" and "Mute All" toggle states | Implement `handleMuteAllOthersExecution`, `handleMuteAllOthersClearExecution`, `handleMuteAllExecution`, `handleMuteAllClearExecution` | Robust service worker control of all tab audio states | Phase 1 | IPC listener & action dispatch test |
| **3** | `src/dashboard/features/media_deck_visualizer_feature.js` | `handleMuteAllOthers` is strictly one-way and lacks toggle-off branch; "Mute All" function does not exist | Add `isMuteAllOthersActive` and `isMuteAllActive` state; implement bidirectional toggle for both with optimistic updates | User can toggle mute on/off seamlessly from UI | Phase 2 | Feature toggle unit test |
| **4** | `dashboard/dashboard.html` | Missing "Mute All" button in `.media-deck-header-actions` | Add `#btnMuteAll` next to `#btnMuteAllOthers` with proper i18n attribute and ARIA attributes | 1-click access to global mute and unmute | Phase 3 | DOM node verification |
| **5** | `dashboard/dashboard.js` | Lacks event listener and dynamic state toggle rendering for `#btnMuteAll` and toggle feedback for `#btnMuteAllOthers` | Wire click handlers, bind toggle state indicators, and add bilingual i18n keys for EN and HI | Intuitive visual feedback (icon & text change on toggle) | Phase 3 | Event wiring & i18n resolution test |
| **6** | `dashboard/styles/media.css` | Lacks active state styling for header action mute buttons (`.active`) | Add CSS rules for `.media-deck-header-actions .btn.active` with theme parity (dark/light) | Visual distinction when mute toggles are actively engaged | Phase 3 | CSS visual rules verification |
| **7** | `tests/test_media_deck_bidirectional_mute_toggles.js` | No test suite currently verifies bidirectional toggle logic for all 3 mute buttons and SW sync | Author dedicated 5-battery test suite covering DOM, logic, background VM, IPC, and security | 100% automated regression protection | Phase 4 | `node tests/test_media_deck_bidirectional_mute_toggles.js` |
