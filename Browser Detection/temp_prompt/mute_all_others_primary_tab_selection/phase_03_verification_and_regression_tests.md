# Phase 3: Comprehensive QA Verification & Regression Testing

> **Phase:** 03  
> **Workspace Container:** `temp_prompt/mute_all_others_primary_tab_selection/`  
> **Target File:** `tests/test_mute_all_others_primary_tab_selection.js`  
> **Assigned Role:** Level 4 QA Verification Tester  
> **Verification Gate:** `node tests/test_mute_all_others_primary_tab_selection.js` (Grade A+ 100% Pass)  

---

## 🎯 1. Phase Objective
Author a comprehensive, rigorous automated test suite `tests/test_mute_all_others_primary_tab_selection.js` certifying the 3-tier candidate primary tab selection hierarchy, bidirectional toggle state preservation, DOM message dispatch, function length limits, and zero regression across existing test suites.

---

## 📋 2. Prerequisites & Inputs
- Target files: `background.js`, `src/dashboard/features/media_deck_visualizer_feature.js`, `dashboard/dashboard.js`
- Test framework: Node.js standard `assert`, `vm`, `fs`, `path`

---

## 🛠️ 3. Verification Batteries Manifest

### Battery 1: Static Code, Exports & UTF-8 with BOM Integrity
- Assert UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) on `background.js` and `media_deck_visualizer_feature.js`.
- Assert function length: `resolveCandidatePrimaryTab` <= 50 lines, `handleMuteAllOthersExecution` <= 50 lines.
- Assert exports of `resolveCandidatePrimaryTab` and `handleMuteAllOthersExecution` on `globalThis`, `SentinelBackgroundModules`, and `module.exports`.

### Battery 2: Tier 1 Candidate Resolution (Active Playing Media Prioritized)
- Setup VM context with mock `tabMediaMap`, `browserAPI`, and tabs.
- Given: Tab 101 (paused), Tab 102 (playing, `isPlaying: true`), Tab 103 (focused active browser tab).
- When: `resolveCandidatePrimaryTab(null)` or `handleMuteAllOthersExecution(null)` is executed.
- Assert: Tab 102 is selected as the primary tab. Tab 102 remains unmuted (`muted: false`). Tab 101 and Tab 103 are muted (`muted: true`).

### Battery 3: Tier 2 Candidate Resolution (Playback Recency Prioritized)
- Setup VM context where NO tab is actively playing.
- Given: Tab 201 had playback activity at timestamp T - 5000ms; Tab 202 had playback activity at timestamp T - 1000ms. Tab 203 is focused active tab with no media.
- When: `resolveCandidatePrimaryTab(null)` is executed.
- Assert: Tab 202 is selected as the primary tab due to higher recency timestamp.

### Battery 4: Tier 3 Candidate Resolution (Active Focused Browser Tab)
- Setup VM context where no tabs are playing and no media history exists.
- Given: Tab 301 is active in `browserAPI.tabs.query({ active: true, lastFocusedWindow: true })`.
- When: `resolveCandidatePrimaryTab(null)` is executed.
- Assert: Tab 301 is resolved as the primary tab.

### Battery 5: Bidirectional Toggle & Snapshot Restoration
- Setup: Tab A unmuted, Tab B pre-muted.
- Trigger `handleMuteAllOthersExecution(Tab A)`: Tab A remains unmuted, Tab B muted, snapshot recorded.
- Trigger `handleMuteAllOthersClearExecution()`: Tab A remains unmuted, Tab B restored to previous muted state.

### Battery 6: In-page DOM Message Dispatch
- Verify `safeSendTabMessage` is called with `{ type: 'MEDIA_CONTROL', action: 'unmute' }` for the primary tab, and `{ type: 'MEDIA_CONTROL', action: 'mute' }` for all other candidate tabs.

### Battery 7: Full Regression Battery
- Run `node tests/test_bidirectional_mute_toggle_phase1.js`
- Run `node tests/test_bidirectional_mute_toggle_phase2.js`
- Run `node tests/test_bidirectional_mute_toggle_phase3.js`
- All batteries must exit with code 0 and zero assertion failures.

---

## 🚦 4. Verification Gate & Deliverables
- Execute: `node tests/test_mute_all_others_primary_tab_selection.js`
- Confirm all 7 batteries pass with Grade A+ certification.
