# Primary Media Tab Selection for "Mute All Others": Master Index & Tracking Board

> **Document Type:** Live Ephemeral Workspace Tracking Board & Problem-Solution Dossier  
> **Workspace Container:** `temp_prompt/mute_all_others_primary_tab_selection/`  
> **Governing Architecture:** [`PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md`](file:///C:/Users/Atul%20Verma/.gemini/config/rules/PHASE_WISE_PROMPT_GENERATION_ARCHITECTURE.md)  
> **Command Hierarchy Role:** Level 3C Phase-wise Prompt Generation Specialist (`prompt_generation_specialist`)  
> **Target Subsystems:** `background.js`, `src/dashboard/features/media_deck_visualizer_feature.js`, `dashboard/dashboard.js`, `tests/`  
> **Lead Departments:** Dept 04 (Core Logic / Backend), Dept 05 (Frontend Engineering), Dept 08 (QA & Testing)  
> **Target Autonomy Strategy:** Strategy A (Fully Autonomous Phase-wise Execution, Score: 1.0)  

---

## 📋 1. Executive Problem-Solution Dossier

### 1.1 Current Limitation
Currently, when the user triggers "Mute All Others" (`#btnMuteAllOthers` / `handleMuteAllOthersExecution`) without explicitly targeting a tab:
1. `background.js` attempts a naive fallback checking the active browser tab first, then arbitrary `tabMediaMap.keys().next().value`, without prioritizing actively playing media streams or playback recency.
2. `src/dashboard/features/media_deck_visualizer_feature.js` defaults to `list.find(s => s && s.tabId)` which arbitrarily grabs the first available media item in the list regardless of whether it is paused, finished, or muted.
3. If background media is playing in a tab other than the active focused tab, triggering "Mute All Others" could inadvertently mute the actively playing media tab and preserve a silent tab, contradicting user intent.

### 1.2 The Architectural Solution
Implement an intelligent 3-tier primary tab candidate selection hierarchy across both the backend service worker and the dashboard visualizer feature:
1. **Tier 1 (Active Playing Media):** Currently actively playing media (`isPlaying === true` / `audible === true`).
2. **Tier 2 (Playback Recency):** If no stream is actively playing, select the tab with the most recent playback timestamp or activity (highest `lastUpdated` / `lastHeartbeat` / `mediaHistory` timestamp).
3. **Tier 3 (Focused Browser Tab):** If no active or recent media session exists, select the currently focused browser tab (`active: true, lastFocusedWindow: true`).

**Behavioral Guarantees:**
- The resolved primary tab remains unmuted.
- All other candidate tabs are muted at both the tab level (`browserAPI.tabs.update(id, { muted: true })`) and in-page DOM level (`safeSendTabMessage(id, { type: 'MEDIA_CONTROL', action: 'mute' })`).
- Pre-mute states are snapshotted into `muteOthersPreviousMuteStates` to guarantee deterministic bidirectional toggle restoration.

---

## 🚦 2. Phase Execution Status Checklist

| Phase # | Phase Name | Target File(s) | Primary Subagent Role | Gate Verification Command | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Backend Candidate Resolution & State Preservation | `background.js` | Level 4 Backend Engineer | `node -e "require('./background.js'); console.log('OK')"` | ⏳ READY |
| **02** | Visualizer Feature Module & Dashboard Facade Alignment | `src/dashboard/features/media_deck_visualizer_feature.js`<br>`dashboard/dashboard.js` | Level 4 Frontend Engineer | `node -e "require('./src/dashboard/features/media_deck_visualizer_feature.js'); console.log('OK')"` | ⏳ READY |
| **03** | Comprehensive QA Verification & Regression Testing | `tests/test_mute_all_others_primary_tab_selection.js`<br>`tests/test_bidirectional_mute_toggle_phase*.js` | Level 4 QA Verification Tester | `node tests/test_mute_all_others_primary_tab_selection.js`<br>`npm test` | ⏳ READY |

---

## 📊 3. Universal 7-Column Diagnostic Impact Matrix

| S.No | File | Root Cause | Proposed Fix | Post-Fix Impact | Phase # | Test Gate |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `background.js` | Fallback primary tab selection checked active tab or arbitrary first map key instead of prioritizing playing media. | Implement 3-tier candidate resolution (`isPlaying`/`audible` -> recency timestamp -> active focused tab) in candidate helper / `handleMuteAllOthersExecution`. | Actively playing media is never muted unexpectedly; accurate primary stream preserved. | Phase 1 | `node tests/test_mute_all_others_primary_tab_selection.js` |
| **2** | `background.js` | Need strict adherence to function length constraint (<= 50 lines) per Universal Rule 5/8. | Extract candidate resolution into focused helper or concise inline logic <= 50 lines. | Clean modular architecture, lint compliant. | Phase 1 | Static line-count test |
| **3** | `src/dashboard/features/media_deck_visualizer_feature.js` | `handleMuteAllOthers` defaulted to `list.find(...)` first element. | Implement matching 3-tier resolution prioritizing playing media, then recency, then active tab. | UI visually reflects actual preserved stream; button state and streams list sync smoothly. | Phase 2 | `node tests/test_mute_all_others_primary_tab_selection.js` |
| **4** | `dashboard/dashboard.js` | Facade wiring needed to ensure options and active streams list are correctly forwarded. | Verify `handleMuteAllOthers` binding and parameters passed from `#btnMuteAllOthers` click handler. | Zero breakage; full backwards compatibility. | Phase 2 | UI click integration test |
| **5** | `tests/test_mute_all_others_primary_tab_selection.js` | Absence of automated test asserting 3-tier selection hierarchy for Mute All Others. | Author comprehensive battery covering Tier 1, Tier 2, Tier 3, DOM messaging, and snapshot restoration. | 100% test coverage; regression prevention. | Phase 3 | `node tests/test_mute_all_others_primary_tab_selection.js` (PASSED) |

---

## 🔒 4. Constitutional Guardrails & Invariants
1. **UTF-8 with BOM Standard:** All modified files must retain UTF-8 with BOM (`0xEF, 0xBB, 0xBF`).
2. **Function Length Limit:** All modified and newly introduced functions in `background.js` must strictly adhere to <= 50 lines.
3. **Bidirectional Toggle Integrity:** Clicking `#btnMuteAllOthers` a second time must restore all tabs to their exact pre-mute state using `muteOthersPreviousMuteStates`.
4. **Dual Tab & DOM Audio Suppression:** Muting must execute at both Chrome tab level (`tabs.update`) and page DOM level (`safeSendTabMessage`).
5. **Zero-Code Hard Lock Enforcement:** Level 1 CEO and Level 2 Manager do not modify code; Level 4 subagents execute with explicit `AUTH-MGR-*` token.
