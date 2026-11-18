# Phase 2: Visualizer Feature Module & Dashboard Facade Alignment

> **Phase:** 02  
> **Workspace Container:** `temp_prompt/mute_all_others_primary_tab_selection/`  
> **Target Files:** `src/dashboard/features/media_deck_visualizer_feature.js`, `dashboard/dashboard.js`  
> **Assigned Role:** Level 4 Frontend Engineer  
> **Verification Gate:** Node syntax test & UI mock execution  

---

## 🎯 1. Phase Objective
Update the Media Deck Visualizer feature module and dashboard facade so that client-side candidate primary tab resolution mirrors the 3-tier hierarchy, button states toggle accurately, and stream models remain consistent.

---

## 📋 2. Prerequisites & Inputs
- File: `src/dashboard/features/media_deck_visualizer_feature.js`
- File: `dashboard/dashboard.js`
- Background IPC: `MEDIA_STREAM_MUTE_ALL_OTHERS` and `MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR`

---

## 🛠️ 3. Surgical Implementation Instructions

### Step 3.1: Update `handleMuteAllOthers` in `media_deck_visualizer_feature.js`
In `handleMuteAllOthers(streamsList, primaryTabId = null, options = {})`:
1. If `primaryTabId` or `currentSoloTabId` is not explicitly provided:
   - **Tier 1:** Look for an actively playing stream in `list`:
     `const activeStream = list.find(s => s && (s.isPlaying || s.audible));`
     If found, `targetId = Number(activeStream.tabId);`
   - **Tier 2:** If none is active, look for the most recently active stream in `list`:
     `const sorted = [...list].sort((a, b) => (b.lastUpdated || b.timestamp || 0) - (a.lastUpdated || a.timestamp || 0));`
     If found, `targetId = Number(sorted[0]?.tabId || 0);`
   - **Tier 3:** If still 0, leave as 0/null and allow the backend service worker to query the active focused browser tab.
2. Dispatch IPC payload:
   - If `isMuted`, action is `MEDIA_STREAM_MUTE_ALL_OTHERS_CLEAR` with payload `{ cleared: true, mediaAction: 'media:unmute_all_others' }`.
   - If not `isMuted`, action is `MEDIA_STREAM_MUTE_ALL_OTHERS` with payload `{ primaryTabId: targetId, mediaAction: 'media:mute_all_others' }`.
3. Handle response:
   - Invert `isMuteAllOthersActive = !isMuted;`
   - Capture `actualTargetId = Number(res.primaryTabId || targetId);`
   - Update `list` items: `s.isMuted = isMuteAllOthersActive ? (s.tabId !== actualTargetId) : false;`
   - Sync `cachedStreams`.
   - Call `updateBtnMuteAllOthersUI(btnEl, isMuteAllOthersActive, translate);`
   - Re-render grid if `containerEl` is present.

### Step 3.2: Verify Facade & Event Wiring in `dashboard/dashboard.js`
- Confirm `globalThis.handleMuteAllOthers` points to the updated visualizer method.
- Confirm click listener on `#btnMuteAllOthers` properly forwards `(activeMediaStreams, null, { btnMuteAllOthers, containerEl })`.

---

## 🚦 4. Verification Gate & Deliverables
1. Run syntax check:
   `node -e "require('./src/dashboard/features/media_deck_visualizer_feature.js'); console.log('Visualizer feature valid')"`
2. Verify UTF-8 BOM is preserved.
3. Verify button UI toggles between 'Mute All Others' and 'Unmute All Others'.
