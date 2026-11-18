# Phase 1: Backend Candidate Resolution & State Preservation

> **Phase:** 01  
> **Workspace Container:** `temp_prompt/mute_all_others_primary_tab_selection/`  
> **Target File:** `background.js`  
> **Assigned Role:** Level 4 Backend Engineer  
> **Verification Gate:** `node -e "require('./background.js'); console.log('OK')"` & line-count verification  

---

## 🎯 1. Phase Objective
Update `background.js` to implement an intelligent 3-tier candidate primary media tab resolution algorithm for `handleMuteAllOthersExecution`, ensuring:
1. Actively playing media tabs (`isPlaying === true` or `audible === true`) are selected first.
2. If none playing, the tab with the most recent playback timestamp is selected.
3. If no media session exists, the currently active focused browser tab is selected.
4. The selected primary tab is unmuted, all other candidate tabs are muted at tab and DOM levels, and pre-mute states are snapshotted in `muteOthersPreviousMuteStates`.
5. Maintain strict compliance with the <= 50 line function length constraint and UTF-8 with BOM standard.

---

## 📋 2. Prerequisites & Inputs
- File: `background.js`
- Maps: `tabMediaMap`, `activeMediaSessions`, `mediaHistory`, `muteOthersPreviousMuteStates`
- Helper functions: `capturePreMuteSnapshot`, `collectCandidateTabs`, `restoreMuteSnapshot`, `safeSendTabMessage`, `safeSendRuntimeMessage`

---

## 🛠️ 3. Surgical Implementation Instructions

### Step 3.1: Implement `resolveCandidatePrimaryTab(preferredTabId)`
Create an async helper function `resolveCandidatePrimaryTab` (<= 45 lines) right above `handleMuteAllOthersExecution`:
- If `preferredTabId` is valid and non-zero, return `Number(preferredTabId)`.
- **Tier 1:** Iterate `tabMediaMap` for `isPlaying === true`, `activeMediaSessions` for `isPlaying === true`, or query `browserAPI.tabs.query({ audible: true })`. If found and not restricted, return its `id`.
- **Tier 2:** If none found, inspect `activeMediaSessions` or `mediaHistory` for the entry with the highest `lastUpdated`, `lastHeartbeat`, or `timestamp`. Return its `tabId` if still open in `tabMediaMap` or query.
- **Tier 3:** If still not resolved, query `browserAPI.tabs.query({ active: true, lastFocusedWindow: true })`. If found and not restricted, return its `id`.
- Fallback: Return first entry of `tabMediaMap.keys().next().value` or 0.

### Step 3.2: Refactor `handleMuteAllOthersExecution(primaryTabId)`
Keep `handleMuteAllOthersExecution` compact (<= 45 lines):
- Call `const targetId = await resolveCandidatePrimaryTab(primaryTabId);`
- If `!targetId`, return `{ success: false, error: 'Invalid primaryTabId' }`.
- Capture snapshot: `await capturePreMuteSnapshot(muteOthersPreviousMuteStates);`
- Unmute primary tab:
  - `await browserAPI.tabs.update(targetId, { muted: false }).catch(() => {});`
  - `safeSendTabMessage(targetId, { type: 'MEDIA_CONTROL', action: 'unmute' });`
  - Update `targetMedia.primaryMedia.isMuted = false;` in `tabMediaMap`.
- Mute all other candidate tabs:
  - `const tabsToMute = await collectCandidateTabs(targetId);`
  - For each `muteId` in `tabsToMute`:
    - `await browserAPI.tabs.update(muteId, { muted: true }).catch(() => {});`
    - `safeSendTabMessage(muteId, { type: 'MEDIA_CONTROL', action: 'mute' });`
    - Update `m.primaryMedia.isMuted = true;` in `tabMediaMap`.
- Broadcast state: `safeSendRuntimeMessage({ type: 'LIVE_MEDIA_UPDATE', payload: synthesizeGlobalMediaState() });`
- Return `{ success: true, primaryTabId: targetId, mutedCount };`

### Step 3.3: Export Verification
Ensure `resolveCandidatePrimaryTab` and `handleMuteAllOthersExecution` are exported on:
- `globalThis`
- `globalThis.SentinelBackgroundModules`
- `module.exports`

---

## 🚦 4. Verification Gate & Deliverables
1. Run syntax & import check:
   `node -e "require('./background.js'); console.log('background.js loaded successfully')"`
2. Verify UTF-8 BOM:
   Ensure `0xEF, 0xBB, 0xBF` is preserved at byte 0.
3. Verify line counts:
   `resolveCandidatePrimaryTab` <= 50 lines; `handleMuteAllOthersExecution` <= 50 lines.
